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
    // ── Auth Provider ─────────────────────────────────────────────────────────
    authProvider: {
      type: String,
      enum: ['email', 'google'],
      default: 'email',
    },
    googleId: {
      type: String,
      default: null,
      // sparse: only indexed when not null (allows multiple null values)
      sparse: true,
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

// Sparse unique index on googleId — supports multiple null values
userSchema.index({ googleId: 1 }, { unique: true, sparse: true });

export default mongoose.model('User', userSchema);