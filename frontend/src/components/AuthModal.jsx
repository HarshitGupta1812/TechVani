import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Eye, EyeOff, ArrowRight, Shield, Globe, Zap } from 'lucide-react';
import TechVaniLogo from './TechVaniLogo';

/* ─── PASSWORD STRENGTH ─────────────────────────────────────────────────── */
function getPasswordStrength(pw) {
  if (!pw) return { score: 0, label: '', color: '' };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { score, label: 'Weak', color: '#f87171' };
  if (score === 2) return { score, label: 'Fair', color: '#fb923c' };
  if (score === 3) return { score, label: 'Good', color: '#a3e635' };
  return { score, label: 'Strong', color: '#34d399' };
}

/* ─── INPUT FIELD ───────────────────────────────────────────────────────── */
function FormInput({ icon: Icon, type, placeholder, value, onChange, error }) {
  const [focused, setFocused] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const isPassword = type === 'password';

  return (
    <div className="relative">
      <Icon
        size={16}
        className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200"
        style={{ color: focused ? 'var(--tv-accent)' : 'var(--tv-text-3)' }}
      />
      <input
        type={isPassword && showPass ? 'text' : type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        required
        className={`tv-input ${error ? 'error' : ''}`}
        style={{ paddingRight: isPassword ? '3rem' : '1rem' }}
      />
      {isPassword && (
        <button
          type="button"
          onClick={() => setShowPass(s => !s)}
          className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors duration-200"
          style={{ color: 'var(--tv-text-3)' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--tv-text-2)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--tv-text-3)'}
          tabIndex={-1}
        >
          {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      )}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs mt-1.5 ml-1"
          style={{ color: '#f87171' }}
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}

/* ─── BRAND PANEL ───────────────────────────────────────────────────────── */
const brandFeatures = [
  { icon: Shield, text: 'Equation Guard™ — Math is always preserved' },
  { icon: Globe,  text: '8 Indian languages with native script support' },
  { icon: Zap,    text: 'Real-time AI chat in your language' },
];

/* ─── MAIN COMPONENT ────────────────────────────────────────────────────── */
export default function AuthModal({ isOpen, onClose, initialMode, onSuccess }) {
  const [mode, setMode] = useState(initialMode || 'login');
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const strength = getPasswordStrength(formData.password);

  const update = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (mode === 'signup' && formData.username.length < 3)
      errs.username = 'Username must be at least 3 characters.';
    if (!/\S+@\S+\.\S+/.test(formData.email))
      errs.email = 'Please enter a valid email address.';
    if (formData.password.length < 6)
      errs.password = 'Password must be at least 6 characters.';
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      console.log(`Submitting ${mode}`, formData);
      onSuccess({ username: formData.username || formData.email.split('@')[0] });
    }, 1000);
  };

  const toggleMode = () => {
    setMode(m => m === 'login' ? 'signup' : 'login');
    setFormData({ username: '', email: '', password: '' });
    setErrors({});
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
          onClick={onClose}
        >
          {/* Glow behind modal */}
          <div className="absolute pointer-events-none"
            style={{
              width: '600px',
              height: '600px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
              filter: 'blur(60px)',
            }}
          />

          <motion.div
            key="modal"
            initial={{ y: 40, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.96 }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            onClick={e => e.stopPropagation()}
            className="relative w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden flex shadow-2xl"
            style={{
              background: 'var(--tv-surface)',
              border: '1px solid var(--tv-border)',
              boxShadow: '0 40px 100px rgba(0,0,0,0.7)',
            }}
          >
            {/* ── LEFT BRAND PANEL ─────────────────────────────── */}
            <div className="hidden md:flex flex-col justify-between p-10 w-[45%] relative overflow-hidden"
              style={{
                background: 'linear-gradient(145deg, #0a0a18 0%, #0f0f22 100%)',
                borderRight: '1px solid var(--tv-border)',
              }}>
              {/* Background orb */}
              <div className="absolute top-0 left-0 w-full h-full pointer-events-none"
                style={{
                  background: 'radial-gradient(ellipse at top left, rgba(99,102,241,0.2) 0%, transparent 60%)',
                }}
              />

              <div className="relative z-10">
                <TechVaniLogo size="md" />
                <p className="text-sm mt-4 leading-relaxed" style={{ color: 'var(--tv-text-3)' }}>
                  AI-powered academic localization for every Indian student.
                </p>
              </div>

              <div className="relative z-10 space-y-5">
                {brandFeatures.map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)' }}>
                      <Icon size={14} style={{ color: 'var(--tv-accent)' }} />
                    </div>
                    <span className="text-sm" style={{ color: 'var(--tv-text-2)' }}>{text}</span>
                  </div>
                ))}
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs" style={{ color: 'var(--tv-text-3)' }}>Free during Beta · No credit card</span>
                </div>
              </div>
            </div>

            {/* ── RIGHT FORM PANEL ──────────────────────────────── */}
            {/* FIXED: min-h-0 is critical — without it, a flex child ignores overflow-y-auto */}
            <div className="flex-1 flex flex-col p-8 md:p-10 overflow-y-auto relative min-h-0">
              {/* Close */}
              <button
                onClick={onClose}
                className="absolute top-6 right-6 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200"
                style={{ color: 'var(--tv-text-3)', background: 'var(--tv-border)' }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--tv-text-1)'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--tv-text-3)'; e.currentTarget.style.background = 'var(--tv-border)'; }}
              >
                <X size={16} />
              </button>

              {/* Header — cross-fades between login/signup */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={mode}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25 }}
                  className="mb-8 mt-2"
                >
                  <h2 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--tv-text-1)' }}>
                    {mode === 'login' ? 'Welcome back 👋' : 'Create your account'}
                  </h2>
                  <p className="text-sm mt-1.5" style={{ color: 'var(--tv-text-3)' }}>
                    {mode === 'login'
                      ? 'Sign in to continue to your learning workspace.'
                      : 'Join TechVani and start learning in your mother tongue.'}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Form — FIXED: removed flex-1 so form doesn't try to fill all available space
                   and overflow-y-auto on the parent panel does its job correctly */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <AnimatePresence>
                  {mode === 'signup' && (
                    <motion.div
                      key="username-field"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <FormInput
                        icon={User}
                        type="text"
                        placeholder="Username"
                        value={formData.username}
                        onChange={update('username')}
                        error={errors.username}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <FormInput
                  icon={Mail}
                  type="email"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={update('email')}
                  error={errors.email}
                />

                <FormInput
                  icon={Lock}
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={update('password')}
                  error={errors.password}
                />

                {/* Password strength bar — only on signup */}
                <AnimatePresence>
                  {mode === 'signup' && formData.password && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex-1 flex gap-1">
                          {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
                              style={{
                                background: i <= strength.score ? strength.color : 'rgba(255,255,255,0.08)',
                              }} />
                          ))}
                        </div>
                        <span className="text-xs font-medium w-14 text-right" style={{ color: strength.color }}>
                          {strength.label}
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Forgot password */}
                {mode === 'login' && (
                  <div className="text-right">
                    <button type="button" className="text-xs transition-colors duration-200"
                      style={{ color: 'var(--tv-text-3)' }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--tv-text-1)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--tv-text-3)'}>
                      Forgot password?
                    </button>
                  </div>
                )}

                {/* Submit */}
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={loading}
                  className="tv-btn-primary w-full py-3.5 mt-2"
                  style={loading ? { opacity: 0.7, cursor: 'not-allowed' } : {}}
                >
                  {loading ? (
                    <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
                      <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                  ) : (
                    <>
                      {mode === 'login' ? 'Sign In' : 'Create Account'}
                      <ArrowRight size={16} />
                    </>
                  )}
                </motion.button>

                {/* Divider */}
                <div className="flex items-center gap-3 my-2">
                  <div className="flex-1 h-px" style={{ background: 'var(--tv-border)' }} />
                  <span className="text-xs" style={{ color: 'var(--tv-text-3)' }}>or continue with</span>
                  <div className="flex-1 h-px" style={{ background: 'var(--tv-border)' }} />
                </div>

                {/* Google (visual-only) */}
                <button
                  type="button"
                  className="tv-btn-ghost w-full py-3 flex items-center justify-center gap-3"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </button>
              </form>

              {/* Toggle */}
              <p className="text-center text-sm mt-6" style={{ color: 'var(--tv-text-3)' }}>
                {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                <button
                  onClick={toggleMode}
                  className="font-semibold transition-colors duration-200"
                  style={{ color: 'var(--tv-accent)' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--tv-accent-2)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--tv-accent)'}
                >
                  {mode === 'login' ? 'Sign Up' : 'Sign In'}
                </button>
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}