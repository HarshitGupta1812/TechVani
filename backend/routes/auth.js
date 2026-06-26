import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z as zod } from 'zod';
import crypto from 'crypto';
import rateLimit from 'express-rate-limit';

import User from '../models/User.js';
import PendingUser from '../models/PendingUser.js';
import { sendOtpEmail } from '../services/emailService.js';

const router = express.Router();

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
//  EXISTING ROUTES — UPDATED
// ══════════════════════════════════════════════════════════════════════════════

/**
 * POST /api/auth/login
 *
 * Updated: blocks login for unverified email/password accounts.
 */
router.post('/login', validateBody(loginSchema), async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
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

// ══════════════════════════════════════════════════════════════════════════════
//  PASSWORD RESET FLOW
// ══════════════════════════════════════════════════════════════════════════════

const forgotPasswordSchema = zod.object({
  email: zod.string().email('Invalid email format'),
});

const verifyResetOtpSchema = zod.object({
  email: zod.string().email('Invalid email format'),
  otp: zod.string().length(6, 'OTP must be exactly 6 digits').regex(/^\d{6}$/, 'OTP must contain only digits'),
});

const resetPasswordSchema = zod.object({
  email: zod.string().email('Invalid email format'),
  otp: zod.string().length(6, 'OTP must be exactly 6 digits').regex(/^\d{6}$/, 'OTP must contain only digits'),
  newPassword: zod.string().min(6, 'Password must be at least 6 characters'),
});

/**
 * POST /api/auth/forgot-password
 * Step 1: Request OTP for password reset
 */
router.post('/forgot-password', sendOtpLimiter, validateBody(forgotPasswordSchema), async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Don't leak whether user exists, but for UX we can return 404 or just succeed silently
      // The instructions usually prefer a clear message for simple apps
      return res.status(404).json({ message: 'No account found with this email address.' });
    }

    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    const hashedOtp = await bcrypt.hash(otp, 10);

    user.resetOtp = hashedOtp;
    user.resetOtpExpiry = otpExpiry;
    user.resetAttempts = 0;
    await user.save();

    await sendOtpEmail(email, otp);

    return res.status(200).json({ message: 'OTP sent successfully. Please check your email.', email });
  } catch (error) {
    console.error('[/forgot-password] Error:', error);
    return res.status(500).json({ message: 'Failed to send reset OTP. Please try again.' });
  }
});

/**
 * POST /api/auth/verify-reset-otp
 * Step 2: Validate OTP before allowing password change
 */
router.post('/verify-reset-otp', verifyOtpLimiter, validateBody(verifyResetOtpSchema), async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.resetOtp) {
      return res.status(400).json({ message: 'No password reset request found. Please try again.' });
    }

    if (user.resetAttempts >= 5) {
      user.resetOtp = null;
      user.resetOtpExpiry = null;
      await user.save();
      return res.status(429).json({ message: 'Too many failed attempts. Please request a new OTP.' });
    }

    if (new Date() > user.resetOtpExpiry) {
      user.resetOtp = null;
      user.resetOtpExpiry = null;
      await user.save();
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.', expired: true });
    }

    const isOtpValid = await bcrypt.compare(otp, user.resetOtp);
    if (!isOtpValid) {
      user.resetAttempts += 1;
      await user.save();
      const remaining = 5 - user.resetAttempts;
      return res.status(400).json({ 
        message: `Incorrect OTP. ${remaining > 0 ? `${remaining} attempt(s) remaining.` : 'Your session is locked.'}`
      });
    }

    return res.status(200).json({ message: 'OTP verified successfully.' });
  } catch (error) {
    console.error('[/verify-reset-otp] Error:', error);
    return res.status(500).json({ message: 'Verification failed. Please try again.' });
  }
});

/**
 * POST /api/auth/reset-password
 * Step 3: Set new password
 */
router.post('/reset-password', validateBody(resetPasswordSchema), async (req, res) => {
  const { email, otp, newPassword } = req.body;
  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.resetOtp) {
      return res.status(400).json({ message: 'No password reset request found. Please try again.' });
    }

    if (new Date() > user.resetOtpExpiry) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.', expired: true });
    }

    const isOtpValid = await bcrypt.compare(otp, user.resetOtp);
    if (!isOtpValid) {
      return res.status(400).json({ message: 'Invalid OTP. Please try again.' });
    }

    // Update password and clear reset fields
    user.password = await bcrypt.hash(newPassword, 12);
    user.resetOtp = null;
    user.resetOtpExpiry = null;
    user.resetAttempts = 0;
    await user.save();

    return res.status(200).json({ message: 'Password has been reset successfully. You can now log in.' });
  } catch (error) {
    console.error('[/reset-password] Error:', error);
    return res.status(500).json({ message: 'Failed to reset password. Please try again.' });
  }
});

export default router;