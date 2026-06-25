import mongoose from 'mongoose';

/**
 * PendingUser — ephemeral collection for unverified registration attempts.
 *
 * Lifecycle:
 *   1. Created on /send-otp (upserted so resending overwrites old record)
 *   2. Promoted → User collection on successful /verify-otp
 *   3. Auto-deleted by MongoDB TTL index after 30 minutes of inactivity
 *
 * Security notes:
 *   - otp is stored as a bcrypt hash (never plaintext)
 *   - attempts tracks failed OTP entries; record is invalidated after 5 failures
 */
const pendingUserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      trim: true,
    },
    // bcrypt-hashed user password
    hashedPassword: {
      type: String,
      required: true,
    },
    // bcrypt-hashed OTP (6 digits)
    otp: {
      type: String,
      required: true,
    },
    // Hard expiry timestamp — 10 minutes from generation
    otpExpiry: {
      type: Date,
      required: true,
    },
    // Failed OTP attempt counter — locked after 5 failures
    attempts: {
      type: Number,
      default: 0,
    },
    // TTL field — MongoDB auto-deletes this document 30 min after createdAt
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }
);

// TTL index: MongoDB removes the document 1800 seconds (30 min) after createdAt
pendingUserSchema.index({ createdAt: 1 }, { expireAfterSeconds: 1800 });

export default mongoose.model('PendingUser', pendingUserSchema);
