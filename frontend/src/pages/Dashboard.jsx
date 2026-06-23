import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { FileText, Video, LogOut, ChevronRight, Clock, BookOpen } from 'lucide-react';
import { FaYoutube } from 'react-icons/fa';
import TechVaniLogo from '../components/TechVaniLogo';

/* ─── HELPERS ────────────────────────────────────────────────────────────── */
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return { text: 'Good morning', emoji: '☀️' };
  if (h < 17) return { text: 'Good afternoon', emoji: '👋' };
  return { text: 'Good evening', emoji: '🌙' };
}

/* ─── DATA ───────────────────────────────────────────────────────────────── */
const uploadOptions = [
  {
    id: 'youtube',
    icon: FaYoutube,
    title: 'YouTube Lecture',
    desc: 'Paste a YouTube link to import, translate, and study any lecture.',
    color: 'from-red-500 to-rose-600',
    glow: 'rgba(239,68,68,0.25)',
    bg: 'rgba(239,68,68,0.07)',
  },
  {
    id: 'pdf',
    icon: FileText,
    title: 'Academic PDF',
    desc: 'Upload research papers, textbooks, or study notes for full AI localization.',
    color: 'from-indigo-500 to-violet-600',
    glow: 'rgba(99,102,241,0.25)',
    bg: 'rgba(99,102,241,0.07)',
  },
  {
    id: 'video',
    icon: Video,
    title: 'Local Video',
    desc: 'Drop an MP4, MKV, or AVI file from your device to start processing.',
    color: 'from-violet-500 to-purple-600',
    glow: 'rgba(139,92,246,0.25)',
    bg: 'rgba(139,92,246,0.07)',
  },
];

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.12 } },
};
const cardVariant = {
  hidden: { opacity: 0, y: 28 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

/* ─── COMPONENT ──────────────────────────────────────────────────────────── */
export default function Dashboard({ user, onLogout, onOpenPreProcess }) {
  const greeting = useMemo(getGreeting, []);
  const initials = (user?.username || 'S').slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen" style={{ background: 'var(--tv-bg)', color: 'var(--tv-text-1)' }}>

      {/* ── NAVBAR ─────────────────────────────────────────────────────── */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="sticky top-0 z-40 flex items-center justify-between px-8 py-4"
        style={{
          background: 'rgba(5,5,10,0.85)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--tv-border)',
        }}
      >
        <TechVaniLogo size="md" />

        <div className="flex items-center gap-3">
          {/* User avatar */}
          <div className="flex items-center gap-3 px-4 py-2 rounded-xl"
            style={{ background: 'var(--tv-surface)', border: '1px solid var(--tv-border)' }}>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white"
              style={{ background: 'linear-gradient(135deg, var(--tv-accent), var(--tv-accent-2))' }}>
              {initials}
            </div>
            <span className="text-sm font-medium" style={{ color: 'var(--tv-text-2)' }}>
              {user?.username || 'Student'}
            </span>
          </div>

          {/* Logout */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onLogout}
            className="flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl transition-all duration-200"
            style={{
              color: 'var(--tv-text-3)',
              border: '1px solid var(--tv-border)',
              background: 'transparent',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = '#f87171';
              e.currentTarget.style.borderColor = 'rgba(248,113,113,0.3)';
              e.currentTarget.style.background = 'rgba(248,113,113,0.06)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = 'var(--tv-text-3)';
              e.currentTarget.style.borderColor = 'var(--tv-border)';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <LogOut size={15} />
            Logout
          </motion.button>
        </div>
      </motion.header>

      {/* ── MAIN ───────────────────────────────────────────────────────── */}
      <main className="max-w-5xl mx-auto px-6 py-16">

        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mb-14"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-3xl">{greeting.emoji}</span>
            <span className="text-sm font-medium" style={{ color: 'var(--tv-text-3)' }}>
              {greeting.text},
            </span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight">
            {user?.username || 'Student'}.
          </h1>
          <p className="mt-2 text-base" style={{ color: 'var(--tv-text-2)' }}>
            Ready to learn in your language? Start a new session below.
          </p>
        </motion.div>

        {/* Upload cards */}
        <section className="mb-16">
          <p className="text-xs font-semibold tracking-widest uppercase mb-6" style={{ color: 'var(--tv-text-3)' }}>
            Start a New Session
          </p>

          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-3 gap-5"
          >
            {uploadOptions.map((opt) => (
              <motion.button
                key={opt.id}
                variants={cardVariant}
                whileHover={{ y: -8, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onOpenPreProcess(opt.id)}
                className="group relative p-7 text-left overflow-hidden rounded-2xl transition-all duration-300"
                style={{
                  background: 'var(--tv-surface)',
                  border: '1px solid var(--tv-border)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--tv-border-hover)';
                  e.currentTarget.style.boxShadow = `0 20px 60px ${opt.glow}`;
                  e.currentTarget.style.background = opt.bg;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--tv-border)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.background = 'var(--tv-surface)';
                }}
              >
                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${opt.color} flex items-center justify-center mb-5`}
                  style={{ boxShadow: `0 8px 20px ${opt.glow}` }}>
                  <opt.icon size={22} className="text-white" />
                </div>

                <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--tv-text-1)' }}>
                  {opt.title}
                </h3>
                <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--tv-text-3)' }}>
                  {opt.desc}
                </p>

                <div className="flex items-center gap-1 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ color: 'var(--tv-accent)' }}>
                  Select & Continue
                  <ChevronRight size={14} />
                </div>
              </motion.button>
            ))}
          </motion.div>
        </section>

        {/* Recent sessions (empty state) */}
        <section>
          <p className="text-xs font-semibold tracking-widest uppercase mb-6" style={{ color: 'var(--tv-text-3)' }}>
            Recent Sessions
          </p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="rounded-2xl p-12 flex flex-col items-center text-center"
            style={{ background: 'var(--tv-surface)', border: '1px solid var(--tv-border)' }}
          >
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
              style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
              <BookOpen size={24} style={{ color: 'var(--tv-accent)' }} />
            </div>
            <h3 className="text-base font-semibold mb-2" style={{ color: 'var(--tv-text-1)' }}>
              No sessions yet
            </h3>
            <p className="text-sm" style={{ color: 'var(--tv-text-3)' }}>
              Your processed documents and learning history will appear here.
            </p>
          </motion.div>
        </section>
      </main>
    </div>
  );
}