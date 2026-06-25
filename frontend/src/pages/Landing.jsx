import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, ArrowRight, Shield, Globe, Zap, BookOpen, ChevronDown } from 'lucide-react';
import { FaGithub, FaLinkedin, FaTwitter } from 'react-icons/fa';
import TechVaniLogo from '../components/TechVaniLogo';

/* ─── HERO CYCLING PHRASES ──────────────────────────────────────────────── */
const HERO_PHRASES = [
  { line1: 'Learn in Your',    line2: 'Mother Tongue.'      },
  { line1: 'Break Every',      line2: 'Language Barrier.'   },
  { line1: 'Master Any',       line2: 'Subject — Natively.' },
];

/* ─── ANIMATION VARIANTS ────────────────────────────────────────────────── */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 32 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] },
});

const stagger = {
  animate: { transition: { staggerChildren: 0.12 } },
};

const featureCard = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
};

/* ─── DATA ──────────────────────────────────────────────────────────────── */
const features = [
  {
    icon: Shield,
    color: 'from-indigo-500 to-violet-600',
    glow: 'rgba(99,102,241,0.25)',
    title: 'Equation Guard™',
    desc: 'Our proprietary LaTeX-fence technology identifies and preserves every mathematical equation, formula, and diagram—untouched—while translating the surrounding prose perfectly.',
    tag: 'Core Tech',
  },
  {
    icon: Globe,
    color: 'from-violet-500 to-purple-600',
    glow: 'rgba(168,85,247,0.25)',
    title: 'Multi-Script Support',
    desc: 'Translate academic content into 8 Indian languages including Hindi, Telugu, Tamil, Bengali, and more. Supports Devanagari, native scripts, and phonetic Romanization.',
    tag: '8 Languages',
  },
  {
    icon: Zap,
    color: 'from-pink-500 to-rose-600',
    glow: 'rgba(236,72,153,0.25)',
    title: 'Real-Time AI Chat',
    desc: 'Ask questions about your document in your native language. TechVani AI responds with context-aware answers, citing specific chapters and page references in real time.',
    tag: 'AI-Powered',
  },
  {
    icon: BookOpen,
    color: 'from-amber-500 to-orange-600',
    glow: 'rgba(245,158,11,0.25)',
    title: 'Smart Flashcards',
    desc: 'Automatically extract key concepts, definitions, and formulas from your content and generate interactive flashcard decks for spaced-repetition learning.',
    tag: 'Auto-Generated',
  },
];

const steps = [
  { num: '01', title: 'Upload Content', desc: 'Paste a YouTube link, upload a PDF, or drop a video file.' },
  { num: '02', title: 'Configure AI', desc: 'Select your subject domain, target language, and script style.' },
  { num: '03', title: 'Learn Natively', desc: 'Get your fully localized content with AI chat and flashcards ready.' },
];

const LANGUAGES = ['Hindi', 'Telugu', 'Tamil', 'Bengali', '+4 more'];

/* ─── COMPONENT ─────────────────────────────────────────────────────────── */
export default function Landing({ onOpenAuth }) {
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { from: 'bot', text: "Hello! I'm TechVani AI. Ask me anything about how localized learning works." }
  ]);
  const [input, setInput] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setPhraseIndex(i => (i + 1) % HERO_PHRASES.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userText = input;
    setChatMessages(prev => [...prev, { from: 'user', text: userText }]);
    setInput('');
    setTimeout(() => {
      setChatMessages(prev => [...prev, {
        from: 'bot',
        text: `Great question! TechVani uses AI to process "${userText.substring(0, 20)}..." while preserving all mathematical equations and technical terminology.`
      }]);
    }, 900);
  };

  return (
    <div className="tv-mesh flex-1 flex flex-col" style={{ background: 'var(--tv-bg)' }}>

      {/* ── NAVBAR ─────────────────────────────────────────────────────── */}
      <motion.nav
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'py-3 bg-[#05050a]/90 backdrop-blur-2xl border-b border-white/5 shadow-2xl shadow-black/40'
            : 'py-5 bg-transparent'
        }`}
      >
        {/*
          3-column grid — the only reliable way to have:
            col 1 (left)  : logo with padding from the screen edge
            col 2 (center): nav links truly centred, no absolute-position tricks
            col 3 (right) : login button flush to the right edge
        */}
        <div className="max-w-7xl mx-auto w-full px-6 sm:px-10 lg:px-16 grid grid-cols-3 items-center">

          {/* ── col 1 : Logo ── */}
          <div className="flex items-center pl-2">
            <TechVaniLogo size="md" />
          </div>

          {/* ── col 2 : Nav links — centred in its own column ── */}
          <div className="hidden md:flex items-center justify-center gap-8">
            {['Features', 'How It Works'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(' ', '-')}`}
                className="text-sm font-medium transition-colors duration-200 whitespace-nowrap"
                style={{ color: 'var(--tv-text-3)' }}
                onMouseEnter={e => e.target.style.color = 'var(--tv-text-1)'}
                onMouseLeave={e => e.target.style.color = 'var(--tv-text-3)'}
              >
                {item}
              </a>
            ))}
          </div>

          {/* ── col 3 : Login — pushed to the right edge ── */}
          <div className="flex items-center justify-end pr-2">
            <button
              onClick={() => onOpenAuth('login')}
              className="tv-btn-ghost text-sm px-6 py-2.5"
            >
              Login
            </button>
          </div>
        </div>
      </motion.nav>

      {/* ── HERO ───────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-20 pb-10">

        {/* Ambient orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-15%] left-[10%] w-[700px] h-[700px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)' }} />
          <div className="absolute bottom-[-10%] right-[5%] w-[600px] h-[600px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.14) 0%, transparent 70%)' }} />
          <div className="absolute top-[40%] left-[60%] w-[400px] h-[400px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.08) 0%, transparent 70%)' }} />
        </div>

        {/* Grid lines */}
        <div className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        {/* Centered content column — each child has its own explicit bottom margin */}
        <div className="relative z-10 w-full max-w-4xl mx-auto px-6 sm:px-8 flex flex-col items-center text-center">

          {/* Badge */}
          <motion.div {...fadeUp(0.1)} className="mb-5">
            <span
              className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase px-3 py-1.5 rounded-full"
              style={{
                color: 'var(--tv-accent)',
                background: 'rgba(99,102,241,0.1)',
                border: '1px solid rgba(99,102,241,0.25)',
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              AI-Powered Localization Engine
            </span>
          </motion.div>

          {/* Headline — single line, compact size */}
          <AnimatePresence mode="wait">
            <motion.h1
              key={phraseIndex}
              initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -20, filter: 'blur(6px)' }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="text-4xl sm:text-5xl md:text-[3.5rem] font-extrabold tracking-tight text-center w-full mb-5"
              style={{ lineHeight: 1.15 }}
            >
              <span className="tv-shimmer-text">{HERO_PHRASES[phraseIndex].line1} </span>
              <span className="tv-gradient-text">{HERO_PHRASES[phraseIndex].line2}</span>
            </motion.h1>
          </AnimatePresence>

          {/* Phrase progress dots */}
          <motion.div {...fadeUp(0.15)} className="flex items-center justify-center gap-2 mb-6">
            {HERO_PHRASES.map((_, i) => (
              <button
                key={i}
                onClick={() => setPhraseIndex(i)}
                className="transition-all duration-500 rounded-full"
                style={{
                  width: i === phraseIndex ? '22px' : '6px',
                  height: '6px',
                  background: i === phraseIndex
                    ? 'linear-gradient(90deg, #6366f1, #a855f7)'
                    : 'rgba(255,255,255,0.18)',
                }}
              />
            ))}
          </motion.div>

          {/* Subtitle */}
          <motion.p
            {...fadeUp(0.35)}
            className="text-base md:text-lg max-w-lg mx-auto mb-7 leading-relaxed text-center"
            style={{ color: 'var(--tv-text-2)' }}
          >
            Upload YouTube links, videos, or PDFs — translated into any Indian language while{' '}
            <strong style={{ color: 'var(--tv-text-1)', fontWeight: 600 }}>flawlessly preserving</strong>{' '}
            equations and diagrams.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            {...fadeUp(0.5)}
            className="flex flex-row items-center justify-center gap-4 w-full mb-7"
          >
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onOpenAuth('signup')}
              className="tv-btn-primary text-sm px-7 py-3"
            >
              Start Learning Free
              <ArrowRight size={15} />
            </motion.button>
            <motion.a
              whileHover={{ scale: 1.03 }}
              href="#features"
              className="tv-btn-ghost text-sm px-7 py-3"
            >
              See How It Works
            </motion.a>
          </motion.div>

          {/* Language trust pills */}
          <motion.div
            {...fadeUp(0.65)}
            className="flex flex-wrap items-center justify-center gap-x-2 gap-y-2"
          >
            {LANGUAGES.map((lang, i) => (
              <span
                key={i}
                className="text-xs font-medium px-3 py-1 rounded-full whitespace-nowrap"
                style={{
                  color: 'var(--tv-text-3)',
                  border: '1px solid var(--tv-border)',
                  background: 'rgba(255,255,255,0.03)',
                }}
              >
                {lang}
              </span>
            ))}
          </motion.div>
        </div>

        {/* Scroll cue */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          style={{ color: 'var(--tv-text-3)' }}
        >
          <span className="text-xs tracking-widest uppercase">Scroll</span>
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.6 }}>
            <ChevronDown size={18} />
          </motion.div>
        </motion.div>
      </section>

      {/* ── FEATURES ───────────────────────────────────────────────────── */}
      <section id="features" className="relative py-28 px-6 lg:px-8 overflow-hidden isolate">
        <div className="max-w-5xl mx-auto w-full">

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center text-center mb-16 w-full"
          >
            <span
              className="inline-block text-xs font-semibold tracking-widest uppercase mb-4 px-3 py-1 rounded-full"
              style={{ color: 'var(--tv-accent-2)', border: '1px solid rgba(168,85,247,0.3)', background: 'rgba(168,85,247,0.08)' }}
            >
              Platform Capabilities
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mt-2 mb-5 text-center">
              <span style={{ color: 'var(--tv-text-1)' }}>Everything you need to</span>
              <br />
              <span className="tv-gradient-text">learn without barriers.</span>
            </h2>
            <p
              className="text-lg max-w-xl mx-auto text-center"
              style={{ color: 'var(--tv-text-2)' }}
            >
              Built for Indian students, researchers, and educators who deserve world-class
              learning content in their own language.
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {features.map((f) => (
              <motion.div
                key={f.title}
                variants={featureCard}
                whileHover={{ y: -6 }}
                className="tv-card group relative p-8 overflow-hidden cursor-default"
              >
                <div
                  className="absolute inset-0 rounded-[inherit] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ background: `radial-gradient(circle at 30% 30%, ${f.glow} 0%, transparent 60%)` }}
                />
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-6">
                    <div
                      className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center shadow-lg`}
                      style={{ boxShadow: `0 8px 24px ${f.glow}` }}
                    >
                      <f.icon size={22} className="text-white" />
                    </div>
                    <span
                      className="text-xs font-semibold px-2.5 py-1 rounded-full"
                      style={{ color: 'var(--tv-text-3)', border: '1px solid var(--tv-border)', background: 'rgba(255,255,255,0.03)' }}
                    >
                      {f.tag}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--tv-text-1)' }}>{f.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--tv-text-2)' }}>{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────────────────── */}
      <section id="how-it-works" className="relative py-28 pb-36 px-6 lg:px-8 overflow-hidden isolate">
        <div className="max-w-4xl mx-auto w-full">

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center text-center mb-16 w-full"
          >
            <span
              className="inline-block text-xs font-semibold tracking-widest uppercase mb-4 px-3 py-1 rounded-full"
              style={{ color: '#fb923c', border: '1px solid rgba(251,146,60,0.3)', background: 'rgba(251,146,60,0.08)' }}
            >
              How It Works
            </span>
            <h2
              className="text-4xl md:text-5xl font-extrabold tracking-tight mt-2 text-center"
              style={{ color: 'var(--tv-text-1)' }}
            >
              Three steps to{' '}
              <span className="tv-gradient-text">native learning.</span>
            </h2>
          </motion.div>

          <div className="relative">
            <div
              className="absolute top-10 left-[calc(16.67%+10px)] right-[calc(16.67%+10px)] h-px hidden md:block"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.4), rgba(168,85,247,0.4), transparent)' }}
            />

            <motion.div
              variants={stagger}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, amount: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-10"
            >
              {steps.map((step) => (
                <motion.div
                  key={step.num}
                  variants={featureCard}
                  className="flex flex-col items-center text-center"
                >
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6 flex-shrink-0 tv-animate-pulse-glow"
                    style={{
                      background: 'var(--tv-surface)',
                      border: '1px solid rgba(99,102,241,0.3)',
                    }}
                  >
                    <span className="text-2xl font-black tv-gradient-text">{step.num}</span>
                  </div>
                  <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--tv-text-1)' }}>{step.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--tv-text-2)', maxWidth: '180px' }}>{step.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex justify-center mt-16"
          >
            <motion.button
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onOpenAuth('signup')}
              className="tv-btn-primary text-base px-10 py-4"
            >
              Start for Free — No Credit Card
              <ArrowRight size={16} />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────── */}
      <footer className="relative py-12 px-6 lg:px-8 border-t" style={{ borderColor: 'var(--tv-border)' }}>
        <div className="max-w-6xl mx-auto w-full flex flex-col md:flex-row items-center justify-between gap-6">
          <TechVaniLogo size="sm" />
          <p className="text-xs text-center" style={{ color: 'var(--tv-text-3)' }}>
            {`© ${new Date().getFullYear()} TechVani. Making knowledge accessible in every mother tongue.`}
          </p>
          <div className="flex items-center gap-5">
            {[
              { Icon: FaGithub,   href: '#' },
              { Icon: FaTwitter,  href: '#' },
              { Icon: FaLinkedin, href: '#' },
            ].map(({ Icon, href }, i) => (
              <motion.a
                key={i}
                href={href}
                whileHover={{ y: -3, scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                style={{ color: 'var(--tv-text-3)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--tv-text-1)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--tv-text-3)'}
              >
                <Icon size={18} />
              </motion.a>
            ))}
          </div>
        </div>
      </footer>

      {/* ── TECHVANI AI CHATBOT ─────────────────────────────────────────── */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-4">

        {/* Chat popup panel */}
        <AnimatePresence>
          {chatOpen && (
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.94 }}
              transition={{ type: 'spring', damping: 26, stiffness: 280 }}
              className="w-[360px] sm:w-96 flex flex-col overflow-hidden rounded-3xl"
              style={{
                height: '500px',
                background: 'var(--tv-surface)',
                border: '1px solid var(--tv-border)',
                boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(99,102,241,0.12)',
              }}
            >
              {/* Chat header with TechVani logo + X close button */}
              <div
                className="flex items-center gap-3 px-5 py-4 flex-shrink-0"
                style={{
                  borderBottom: '1px solid var(--tv-border)',
                  background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(168,85,247,0.06) 100%)',
                }}
              >
                <div className="flex-shrink-0">
                  <TechVaniLogo size="sm" wordmark={false} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm" style={{ color: 'var(--tv-text-1)' }}>TechVani AI</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs" style={{ color: 'var(--tv-text-3)' }}>Online</span>
                  </div>
                </div>
                {/* X close button */}
                <motion.button
                  whileHover={{ scale: 1.15, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setChatOpen(false)}
                  className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ color: 'var(--tv-text-3)', background: 'rgba(255,255,255,0.05)', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--tv-text-1)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--tv-text-3)'}
                  aria-label="Close chat"
                >
                  <X size={16} />
                </motion.button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
                {chatMessages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[82%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                        msg.from === 'user' ? 'text-white' : ''
                      }`}
                      style={
                        msg.from === 'user'
                          ? { background: 'linear-gradient(135deg, #6366f1, #a855f7)' }
                          : { background: 'rgba(255,255,255,0.05)', color: 'var(--tv-text-2)', border: '1px solid var(--tv-border)' }
                      }
                    >
                      {msg.text}
                    </div>
                  </motion.div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input row */}
              <div
                className="p-4 flex items-center gap-3 flex-shrink-0"
                style={{ borderTop: '1px solid var(--tv-border)' }}
              >
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="Ask about TechVani..."
                  className="flex-1 bg-white/5 rounded-xl px-4 py-2.5 text-sm outline-none"
                  style={{
                    border: '1px solid var(--tv-border)',
                    color: 'var(--tv-text-1)',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--tv-accent)'}
                  onBlur={e => e.target.style.borderColor = 'var(--tv-border)'}
                />
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleSend}
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}
                  aria-label="Send message"
                >
                  <Send size={15} className="text-white" />
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating bubble with TechVani logo */}
        <motion.button
          whileHover={{ scale: 1.08, y: -2 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => setChatOpen(prev => !prev)}
          className="w-14 h-14 rounded-2xl flex items-center justify-center relative overflow-hidden tv-animate-pulse-glow"
          style={{
            background: 'linear-gradient(135deg, #1e1b4b 0%, #2e1065 60%, #1e1b4b 100%)',
            border: '1px solid rgba(99,102,241,0.4)',
            boxShadow: '0 0 28px rgba(99,102,241,0.45)',
          }}
          aria-label="Open TechVani AI chat"
        >
          <div
            className="absolute inset-0 rounded-2xl opacity-60"
            style={{ background: 'radial-gradient(circle at 40% 35%, rgba(99,102,241,0.35) 0%, transparent 70%)' }}
          />
          <div className="relative z-10">
            <TechVaniLogo size="sm" wordmark={false} />
          </div>
        </motion.button>
      </div>
    </div>
  );
}
