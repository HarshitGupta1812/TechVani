import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, LogOut, ChevronRight, Clock, Trash2, Play, FileAudio, Sparkles } from 'lucide-react';
import { FaYoutube } from 'react-icons/fa';
import TechVaniLogo from '../components/TechVaniLogo';

/* ─── ANIMATION VARIANTS ─────────────────────────────────────────────────── */
const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.15 } },
};
const cardVariant = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};
const historyItemVariant = {
  initial: { opacity: 0, x: -20, height: 0 },
  animate: { opacity: 1, x: 0, height: 'auto', transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, x: 40, height: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
};

/* ─── CHANNEL DATA ───────────────────────────────────────────────────────── */
const channels = [
  {
    id: 'youtube',
    icon: FaYoutube,
    title: 'YouTube',
    subtitle: 'Video Intelligence',
    desc: 'Paste any YouTube link — AI transcribes, summarizes, and translates the content into your chosen language.',
    gradient: 'linear-gradient(135deg, #dc2626 0%, #f43f5e 100%)',
    glow: 'rgba(239,68,68,0.3)',
    bgHover: 'rgba(239,68,68,0.06)',
    borderHover: 'rgba(239,68,68,0.35)',
    accentText: '#fca5a5',
  },
  {
    id: 'document',
    icon: FileText,
    title: 'Document',
    subtitle: 'PDF · DOC · TXT',
    desc: 'Upload research papers, textbooks, or notes — get instant AI-powered summaries translated to 22 Indian languages.',
    gradient: 'linear-gradient(135deg, var(--tv-accent) 0%, var(--tv-accent-2) 100%)',
    glow: 'rgba(99,102,241,0.3)',
    bgHover: 'rgba(99,102,241,0.06)',
    borderHover: 'rgba(99,102,241,0.35)',
    accentText: '#a5b4fc',
  },
];

/* ─── COMPONENT ──────────────────────────────────────────────────────────── */
export default function Dashboard({ user, onLogout, onOpenPreProcess }) {
  const initials = (user?.username || 'S').slice(0, 2).toUpperCase();
  const [history, setHistory] = useState([]);

  // Load history from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('tv_history');
      if (stored) setHistory(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  // Delete a history item
  const handleDeleteHistory = (id) => {
    setHistory(prev => {
      const next = prev.filter(item => item.id !== id);
      localStorage.setItem('tv_history', JSON.stringify(next));
      return next;
    });
  };

  // Format relative time
  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

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

        {/* ── Welcome Banner (no greeting, just name + CTA) ───────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mb-14"
        >
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">
            {user?.username || 'Student'}
          </h1>
          <div className="flex items-center gap-3 mt-3">
            <div className="flex items-center gap-2">
              <Sparkles size={16} style={{ color: 'var(--tv-accent)' }} />
              <span className="text-base font-medium" style={{ color: 'var(--tv-text-2)' }}>
                Start Learning
              </span>
            </div>
            <span className="text-sm" style={{ color: 'var(--tv-text-3)' }}>
              — Choose a source below to generate AI-powered summaries in 22 Indian languages.
            </span>
          </div>
        </motion.div>

        {/* ── Channel Cards (2 only) ──────────────────────────────── */}
        <section className="mb-16">
          <p className="text-xs font-semibold tracking-widest uppercase mb-6" style={{ color: 'var(--tv-text-3)' }}>
            Choose Your Source
          </p>

          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {channels.map((ch) => (
              <motion.button
                key={ch.id}
                variants={cardVariant}
                whileHover={{ y: -8, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onOpenPreProcess(ch.id)}
                className="group relative p-8 text-left overflow-hidden rounded-2xl transition-all duration-300"
                style={{
                  background: 'var(--tv-surface)',
                  border: '1px solid var(--tv-border)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = ch.borderHover;
                  e.currentTarget.style.boxShadow = `0 24px 64px ${ch.glow}`;
                  e.currentTarget.style.background = ch.bgHover;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--tv-border)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.background = 'var(--tv-surface)';
                }}
              >
                {/* Ambient glow orb */}
                <div
                  className="absolute -top-20 -right-20 w-48 h-48 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                  style={{ background: `radial-gradient(circle, ${ch.glow} 0%, transparent 70%)` }}
                />

                <div className="relative z-10">
                  {/* Icon */}
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                    style={{ background: ch.gradient, boxShadow: `0 8px 24px ${ch.glow}` }}
                  >
                    <ch.icon size={26} className="text-white" />
                  </div>

                  {/* Title cluster */}
                  <div className="flex items-baseline gap-3 mb-2">
                    <h3 className="text-xl font-bold" style={{ color: 'var(--tv-text-1)' }}>
                      {ch.title}
                    </h3>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                      style={{ color: ch.accentText, background: `${ch.glow.replace('0.3', '0.12')}`, border: `1px solid ${ch.glow.replace('0.3', '0.2')}` }}>
                      {ch.subtitle}
                    </span>
                  </div>

                  <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--tv-text-3)' }}>
                    {ch.desc}
                  </p>

                  {/* Hover CTA */}
                  <div className="flex items-center gap-1.5 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ color: ch.accentText }}>
                    Select & Continue
                    <ChevronRight size={14} />
                  </div>
                </div>
              </motion.button>
            ))}
          </motion.div>
        </section>

        {/* ── History ─────────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--tv-text-3)' }}>
              History
            </p>
            {history.length > 0 && (
              <span className="text-xs font-medium px-2.5 py-1 rounded-full"
                style={{ color: 'var(--tv-text-3)', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--tv-border)' }}>
                {history.length} item{history.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {history.length === 0 ? (
            /* Empty state */
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.7 }}
              className="rounded-2xl p-12 flex flex-col items-center text-center"
              style={{ background: 'var(--tv-surface)', border: '1px solid var(--tv-border)' }}
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
                style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
                <Clock size={24} style={{ color: 'var(--tv-accent)' }} />
              </div>
              <h3 className="text-base font-semibold mb-2" style={{ color: 'var(--tv-text-1)' }}>
                No history yet
              </h3>
              <p className="text-sm" style={{ color: 'var(--tv-text-3)' }}>
                Your processed summaries and translations will appear here.
              </p>
            </motion.div>
          ) : (
            /* History list */
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {history.map((item) => (
                  <motion.div
                    key={item.id}
                    variants={historyItemVariant}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    layout
                    className="group flex items-center justify-between p-5 rounded-2xl transition-all duration-200"
                    style={{
                      background: 'var(--tv-surface)',
                      border: '1px solid var(--tv-border)',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = 'var(--tv-border-hover)';
                      e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'var(--tv-border)';
                      e.currentTarget.style.background = 'var(--tv-surface)';
                    }}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      {/* Type icon */}
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{
                          background: item.type === 'youtube'
                            ? 'rgba(239,68,68,0.12)' : 'rgba(99,102,241,0.12)',
                          border: `1px solid ${item.type === 'youtube'
                            ? 'rgba(239,68,68,0.25)' : 'rgba(99,102,241,0.25)'}`,
                        }}>
                        {item.type === 'youtube'
                          ? <FaYoutube size={18} style={{ color: '#fca5a5' }} />
                          : <FileText size={18} style={{ color: '#a5b4fc' }} />
                        }
                      </div>

                      {/* Info */}
                      <div className="min-w-0">
                        <h4 className="text-sm font-semibold truncate" style={{ color: 'var(--tv-text-1)' }}>
                          {item.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs" style={{ color: 'var(--tv-text-3)' }}>
                            {item.outputLang}
                          </span>
                          <span className="w-1 h-1 rounded-full" style={{ background: 'var(--tv-text-3)' }} />
                          <span className="text-xs flex items-center gap-1" style={{ color: 'var(--tv-text-3)' }}>
                            {item.outputFormat === 'audio'
                              ? <><FileAudio size={11} /> Audio</>
                              : <><FileText size={11} /> Text</>
                            }
                          </span>
                          <span className="w-1 h-1 rounded-full" style={{ background: 'var(--tv-text-3)' }} />
                          <span className="text-xs" style={{ color: 'var(--tv-text-3)' }}>
                            {timeAgo(item.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Delete button */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => { e.stopPropagation(); handleDeleteHistory(item.id); }}
                      className="flex items-center justify-center w-9 h-9 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-200"
                      style={{ color: 'var(--tv-text-3)', background: 'rgba(255,255,255,0.05)' }}
                      onMouseEnter={e => {
                        e.currentTarget.style.color = '#f87171';
                        e.currentTarget.style.background = 'rgba(248,113,113,0.1)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.color = 'var(--tv-text-3)';
                        e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                      }}
                    >
                      <Trash2 size={15} />
                    </motion.button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}