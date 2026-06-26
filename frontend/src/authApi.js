/**
 * authApi.js — TechVani Auth API Client
 *
 * Thin fetch wrapper around the backend auth endpoints.
 * All functions return { data, error } — never throw — so
 * callers can handle errors inline without try/catch.
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * POST /api/auth/send-otp
 * Step 1 of signup: validates input, generates OTP, sends email.
 */
export async function sendOtp(username, email, password) {
  try {
    const res = await fetch(`${BASE_URL}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });
    const json = await res.json();
    if (!res.ok) {
      const msg = json.errors ? json.errors.join(', ') : json.message || 'Failed to send OTP.';
      return { data: null, error: msg };
    }
    return { data: json, error: null };
  } catch {
    return { data: null, error: 'Network error. Please check your connection.' };
  }
}

/**
 * POST /api/auth/verify-otp
 * Step 2 of signup: verifies OTP, promotes user, returns JWT.
 */
export async function verifyOtp(email, otp) {
  try {
    const res = await fetch(`${BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp }),
    });
    const json = await res.json();
    if (!res.ok) {
      return {
        data: null,
        error: json.message || 'OTP verification failed.',
        attemptsRemaining: json.attemptsRemaining,
        expired: json.expired || false,
      };
    }
    return { data: json, error: null };
  } catch {
    return { data: null, error: 'Network error. Please check your connection.' };
  }
}

/**
 * POST /api/auth/login
 * Email + Password signin for verified accounts.
 */
export async function login(email, password) {
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const json = await res.json();
    if (!res.ok) {
      return {
        data: null,
        error: json.message || 'Login failed.',
        unverified: json.unverified || false,
        email: json.email,
      };
    }
    return { data: json, error: null };
  } catch {
    return { data: null, error: 'Network error. Please check your connection.' };
  }
}

/**
 * POST /api/auth/forgot-password
 * Step 1 of password reset: request OTP to email.
 */
export async function forgotPassword(email) {
  try {
    const res = await fetch(`${BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const json = await res.json();
    if (!res.ok) {
      return { data: null, error: json.message || 'Failed to send OTP.' };
    }
    return { data: json, error: null };
  } catch {
    return { data: null, error: 'Network error. Please check your connection.' };
  }
}

/**
 * POST /api/auth/verify-reset-otp
 * Step 2 of password reset: verify the OTP.
 */
export async function verifyResetOtp(email, otp) {
  try {
    const res = await fetch(`${BASE_URL}/auth/verify-reset-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp }),
    });
    const json = await res.json();
    if (!res.ok) {
      return {
        data: null,
        error: json.message || 'OTP verification failed.',
        expired: json.expired || false,
      };
    }
    return { data: json, error: null };
  } catch {
    return { data: null, error: 'Network error. Please check your connection.' };
  }
}

/**
 * POST /api/auth/reset-password
 * Step 3 of password reset: submit OTP and new password.
 */
export async function resetPassword(email, otp, newPassword) {
  try {
    const res = await fetch(`${BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp, newPassword }),
    });
    const json = await res.json();
    if (!res.ok) {
      return { data: null, error: json.message || 'Password reset failed.' };
    }
    return { data: json, error: null };
  } catch {
    return { data: null, error: 'Network error. Please check your connection.' };
  }
}

/**
 * Persists the JWT token and user object to localStorage.
 */
export function persistSession(token, user) {
  localStorage.setItem('tv_token', token);
  localStorage.setItem('tv_user', JSON.stringify(user));
}

/**
 * Reads the persisted session from localStorage.
 * @returns {{ token: string, user: object } | null}
 */
export function getSession() {
  const token = localStorage.getItem('tv_token');
  const raw = localStorage.getItem('tv_user');
  if (!token || !raw) return null;
  try {
    return { token, user: JSON.parse(raw) };
  } catch {
    return null;
  }
}

/**
 * Clears the persisted session (logout).
 */
export function clearSession() {
  localStorage.removeItem('tv_token');
  localStorage.removeItem('tv_user');
}
