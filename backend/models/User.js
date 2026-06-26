import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    // Optional — Google users have no password
    password: {
      type: String,
      minlength: 6,
      default: null,
    },
    // ── Verification ──────────────────────────────────────────────────────────
    isVerified: {
      type: Boolean,
      default: false,
    },
    // ── Profile ───────────────────────────────────────────────────────────────
    avatar: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);
export default mongoose.model('User', userSchema);