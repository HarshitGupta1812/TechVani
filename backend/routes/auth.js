import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z as zod } from 'zod';
import crypto from 'crypto';
import rateLimit from 'express-rate-limit';
import { OAuth2Client } from 'google-auth-library';

import User from '../models/User.js';
import PendingUser from '../models/PendingUser.js';
import { sendOtpEmail } from '../services/emailService.js';

const router = express.Router();

// ── Google OAuth2 Client ────────────────────────────────────────────────────
const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_CALLBACK_URL
);

// ── Rate Limiters ───────────────────────────────────────────────────────────

/** Max 3 OTP sends per IP per 15 minutes */
const sendOtpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many OTP requests. Please wait 15 minutes before trying again.' },
});

/** Max 10 OTP verification attempts per IP per 15 minutes */
const verifyOtpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many verification attempts. Please wait before trying again.' },
});

/** Max 10 Google auth attempts per IP per minute */
const googleAuthLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many Google auth requests. Please slow down.' },
});

// ── Zod Schemas ─────────────────────────────────────────────────────────────

const sendOtpSchema = zod.object({
  username: zod.string().min(3, 'Username must be at least 3 characters').max(30),
  email: zod.string().email('Invalid email format'),
  password: zod.string().min(6, 'Password must be at least 6 characters'),
});

const verifyOtpSchema = zod.object({
  email: zod.string().email('Invalid email format'),
  otp: zod
    .string()
    .length(6, 'OTP must be exactly 6 digits')
    .regex(/^\d{6}$/, 'OTP must contain only digits'),
});

const loginSchema = zod.object({
  email: zod.string().email('Invalid email format'),
  password: zod.string().min(1, 'Password is required'),
});

// ── Validation Middleware ────────────────────────────────────────────────────

const validateBody = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    return res.status(400).json({ errors: error.errors.map((e) => e.message) });
  }
};

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Generates a cryptographically secure 6-digit OTP using crypto.randomInt.
 * @returns {string} Zero-padded 6-digit OTP string (e.g., "042817")
 */
const generateOtp = () => {
  const otp = crypto.randomInt(0, 1_000_000);
  return otp.toString().padStart(6, '0');
};

/**
 * Signs a JWT token for an authenticated user.
 * @param {object} user - Mongoose User document
 * @returns {string} Signed JWT string
 */
const signToken = (user) => {
  return jwt.sign(
    { userId: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

/**
 * Sanitizes a user document for safe client-side consumption.
 * @param {object} user - Mongoose User document
 * @returns {object} Public user fields only
 */
const publicUser = (user) => ({
  id: user._id,
  username: user.username,
  email: user.email,
  avatar: user.avatar,
  isVerified: user.isVerified,
  authProvider: user.authProvider,
});

// ══════════════════════════════════════════════════════════════════════════════
//  EMAIL / PASSWORD + OTP FLOW
// ══════════════════════════════════════════════════════════════════════════════

/**
 * POST /api/auth/send-otp
 *
 * Step 1 of email signup. Validates input, hashes the password,
 * generates + hashes a 6-digit OTP, stores a PendingUser record,
 * and dispatches the OTP via email.
 *
 * Rate limited: 3 requests per IP per 15 minutes.
 */
router.post('/send-otp', sendOtpLimiter, validateBody(sendOtpSchema), async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // 1. Check for existing verified users with same email or username
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        return res.status(409).json({ message: 'An account with this email already exists.' });
      }
      return res.status(409).json({ message: 'This username is already taken.' });
    }

    // 2. Hash the password with bcrypt (salt rounds = 12)
    const hashedPassword = await bcrypt.hash(password, 12);

    // 3. Generate a cryptographically secure 6-digit OTP
    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // 4. Hash the OTP before storing (prevents exposure if DB is compromised)
    const hashedOtp = await bcrypt.hash(otp, 10);

    // 5. Upsert PendingUser — overwriting any previous pending attempt for this email
    await PendingUser.findOneAndUpdate(
      { email: email.toLowerCase() },
      {
        email: email.toLowerCase(),
        username,
        hashedPassword,
        otp: hashedOtp,
        otpExpiry,
        attempts: 0,        // reset attempt counter on resend
        createdAt: new Date(), // reset TTL countdown on resend
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // 6. Send the OTP email (plaintext OTP — never stored)
    await sendOtpEmail(email, otp);

    return res.status(200).json({
      message: 'OTP sent successfully. Please check your email.',
      email, // echo back so frontend can pre-fill the verify screen
    });
  } catch (error) {
    console.error('[/send-otp] Error:', error);
    return res.status(500).json({ message: 'Failed to send OTP. Please try again.' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/auth/verify-otp
 *
 * Step 2 of email signup. Validates the OTP against the PendingUser record.
 * On success: promotes the pending record to a verified User, deletes the
 * PendingUser document, and returns a JWT.
 *
 * Rate limited: 10 attempts per IP per 15 minutes.
 * Per-record: locked after 5 failed attempts.
 */
router.post('/verify-otp', verifyOtpLimiter, validateBody(verifyOtpSchema), async (req, res) => {
  const { email, otp } = req.body;

  try {
    // 1. Look up the pending registration
    const pendingUser = await PendingUser.findOne({ email: email.toLowerCase() });
    if (!pendingUser) {
      return res.status(404).json({
        message: 'No pending registration found for this email. Please sign up again.',
      });
    }

    // 2. Check per-record attempt limit (max 5 failures)
    if (pendingUser.attempts >= 5) {
      await PendingUser.deleteOne({ email: email.toLowerCase() });
      return res.status(429).json({
        message:
          'Too many failed attempts. Your registration session has been invalidated. Please sign up again.',
      });
    }

    // 3. Check OTP expiry
    if (new Date() > pendingUser.otpExpiry) {
      await PendingUser.deleteOne({ email: email.toLowerCase() });
      return res.status(400).json({
        message: 'OTP has expired. Please request a new one.',
        expired: true,
      });
    }

    // 4. Verify OTP using bcrypt (constant-time comparison)
    const isOtpValid = await bcrypt.compare(otp, pendingUser.otp);
    if (!isOtpValid) {
      // Increment failure counter
      await PendingUser.findOneAndUpdate(
        { email: email.toLowerCase() },
        { $inc: { attempts: 1 } }
      );
      const remaining = 4 - pendingUser.attempts;
      return res.status(400).json({
        message: `Incorrect OTP. ${remaining > 0 ? `${remaining} attempt(s) remaining.` : 'Last attempt — next failure will invalidate your session.'}`,
        attemptsRemaining: Math.max(0, remaining),
      });
    }

    // 5. Check for race condition — another request may have already verified
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      await PendingUser.deleteOne({ email: email.toLowerCase() });
      const token = signToken(existingUser);
      return res.status(200).json({ token, user: publicUser(existingUser) });
    }

    // 6. Promote PendingUser → verified User
    const newUser = new User({
      username: pendingUser.username,
      email: pendingUser.email,
      password: pendingUser.hashedPassword,
      isVerified: true,
      authProvider: 'email',
    });
    await newUser.save();

    // 7. Clean up the pending record (OTP is now consumed — prevent replay)
    await PendingUser.deleteOne({ email: email.toLowerCase() });

    // 8. Issue JWT and respond
    const token = signToken(newUser);
    return res.status(201).json({
      message: 'Email verified successfully. Welcome to TechVani!',
      token,
      user: publicUser(newUser),
    });
  } catch (error) {
    console.error('[/verify-otp] Error:', error);
    return res.status(500).json({ message: 'Verification failed. Please try again.' });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
//  GOOGLE OAUTH2 FLOW
// ══════════════════════════════════════════════════════════════════════════════

/**
 * GET /api/auth/google
 *
 * Generates and redirects to the Google OAuth2 consent screen.
 * Includes a `state` parameter (CSRF token) for callback validation.
 */
router.get('/google', googleAuthLimiter, (req, res) => {
  // Generate a cryptographically random CSRF state token
  const state = crypto.randomBytes(16).toString('hex');

  // Store state in a short-lived signed cookie for validation in /callback
  res.cookie('oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 5 * 60 * 1000, // 5 minutes
    sameSite: 'lax',
  });

  const authUrl = googleClient.generateAuthUrl({
    access_type: 'offline',
    scope: ['openid', 'email', 'profile'],
    state,
    prompt: 'select_account', // always show account picker
  });

  return res.redirect(authUrl);
});

// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/auth/google/callback
 *
 * Handles the Google OAuth2 redirect callback.
 *
 * Flow:
 *   1. Validate CSRF state parameter
 *   2. Exchange authorization code for tokens
 *   3. Verify the ID token server-side (google-auth-library)
 *   4. Extract verified { email, name, picture, googleId }
 *   5. findOrCreate User with isVerified: true (OTP bypassed)
 *   6. Issue JWT → redirect to frontend with ?token=JWT
 *
 * Rate limited: 10 requests per IP per minute.
 */
router.get('/google/callback', googleAuthLimiter, async (req, res) => {
  const { code, state, error: oauthError } = req.query;
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

  // Handle user cancellation or OAuth errors
  if (oauthError) {
    console.warn('[/google/callback] OAuth error:', oauthError);
    return res.redirect(`${clientUrl}/auth?error=google_cancelled`);
  }

  // 1. Validate CSRF state
  const storedState = req.cookies?.oauth_state;
  if (!state || !storedState || state !== storedState) {
    console.warn('[/google/callback] State mismatch — possible CSRF attempt');
    return res.redirect(`${clientUrl}/auth?error=state_mismatch`);
  }

  // Clear the state cookie immediately
  res.clearCookie('oauth_state');

  if (!code) {
    return res.redirect(`${clientUrl}/auth?error=no_code`);
  }

  try {
    // 2. Exchange authorization code for tokens
    const { tokens } = await googleClient.getToken(code);
    googleClient.setCredentials(tokens);

    // 3. Verify the ID token server-side — this is the critical security step.
    //    We do NOT trust any claims from the frontend; Google's server verifies them.
    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email_verified) {
      return res.redirect(`${clientUrl}/auth?error=unverified_google_email`);
    }

    const { sub: googleId, email, name, picture } = payload;

    // 4. Auto-generate a username from the Google display name
    let baseUsername = name
      ? name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '').slice(0, 25)
      : email.split('@')[0].replace(/[^a-z0-9_]/g, '').slice(0, 25);

    // Ensure username uniqueness by appending a short random suffix if needed
    let username = baseUsername;
    let userExists = await User.findOne({ username });
    if (userExists) {
      username = `${baseUsername}_${crypto.randomBytes(3).toString('hex')}`;
    }

    // 5. findOrCreate the User — OTP step is intentionally bypassed for Google users
    let user = await User.findOne({ $or: [{ googleId }, { email: email.toLowerCase() }] });

    if (!user) {
      // New Google user — create with isVerified: true
      user = new User({
        username,
        email: email.toLowerCase(),
        password: null,          // Google users have no password
        isVerified: true,        // Google already verified the email
        authProvider: 'google',
        googleId,
        avatar: picture || null,
      });
      await user.save();
    } else {
      // Existing user — link Google account if not already linked, update avatar
      const updates = {};
      if (!user.googleId) {
        updates.googleId = googleId;
        updates.authProvider = 'google';
      }
      if (picture && user.avatar !== picture) {
        updates.avatar = picture;
      }
      // Ensure isVerified is true (handles edge case where same email was started via OTP)
      if (!user.isVerified) {
        updates.isVerified = true;
      }
      if (Object.keys(updates).length > 0) {
        await User.updateOne({ _id: user._id }, { $set: updates });
        user = { ...user.toObject(), ...updates };
      }
    }

    // 6. Issue JWT and redirect to frontend
    const token = signToken(user);
    return res.redirect(`${clientUrl}/auth/callback?token=${token}`);
  } catch (error) {
    console.error('[/google/callback] Error:', error);
    return res.redirect(`${clientUrl}/auth?error=google_auth_failed`);
  }
});

// ══════════════════════════════════════════════════════════════════════════════
//  EXISTING ROUTES — UPDATED
// ══════════════════════════════════════════════════════════════════════════════

/**
 * POST /api/auth/login
 *
 * Updated: blocks login for unverified email/password accounts.
 * Google users (who have no password) cannot login via this route.
 */
router.post('/login', validateBody(loginSchema), async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Block Google-only users from password login
    if (user.authProvider === 'google' && !user.password) {
      return res.status(400).json({
        message: 'This account uses Google Sign-In. Please use "Continue with Google" to log in.',
      });
    }

    // Block unverified email/password users from logging in
    if (!user.isVerified) {
      return res.status(403).json({
        message: 'Your email is not verified. Please complete OTP verification to log in.',
        unverified: true,
        email: user.email,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = signToken(user);
    return res.status(200).json({ token, user: publicUser(user) });
  } catch (error) {
    console.error('[/login] Error:', error);
    return res.status(500).json({ message: 'Server error during login.' });
  }
});

export default router;