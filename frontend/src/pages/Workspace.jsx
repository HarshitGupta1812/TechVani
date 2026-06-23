import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import { Send, BookOpen, Layers, MessageSquare, Play, Pause, RotateCcw, RotateCw } from 'lucide-react';
import TechVaniLogo from '../components/TechVaniLogo';

const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');

/* ─── MOCK DATA ──────────────────────────────────────────────────────────── */
const mockChapters = [
  { id: 1, title: 'Introduction to Quantum Mechanics', duration: '4 mins' },
  { id: 2, title: 'The Wave-Particle Duality', duration: '6 mins' },
  { id: 3, title: "Schrödinger's Equation", duration: '8 mins' },
];

const mockFlashcards = [
  { id: 1, front: "Planck's Constant (h)", back: '6.626 × 10⁻³⁴ J·s' },
  { id: 2, front: 'Wave Function (Ψ)', back: 'Mathematical description of quantum state' },
  { id: 3, front: 'Heisenberg Uncertainty', back: 'Δx · Δp ≥ ℏ/2' },
  { id: 4, front: 'Quantum Superposition', back: 'A system exists in all states simultaneously until measured' },
];

const TABS = [
  { id: 'chat',       icon: MessageSquare, label: 'AI Chat'    },
  { id: 'flashcards', icon: Layers,        label: 'Flashcards' },
  { id: 'chapters',   icon: BookOpen,      label: 'Chapters'   },
];

/* ─── FLASHCARD ──────────────────────────────────────────────────────────── */
function Flashcard({ card, flipped, onFlip }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      onClick={onFlip}
      className="relative cursor-pointer"
      style={{ perspective: '1200px', minHeight: '160px' }}
    >
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformStyle: 'preserve-3d', position: 'relative', minHeight: '160px' }}
      >
        {/* Front */}
        <div className="absolute inset-0 rounded-2xl p-5 flex flex-col justify-between"
          style={{
            background: 'var(--tv-surface-2)',
            border: '1px solid var(--tv-border)',
            backfaceVisibility: 'hidden',
          }}>
          <span className="text-[10px] uppercase tracking-widest font-bold" style={{ color: 'var(--tv-text-3)' }}>
            Tap to reveal
          </span>
          <h4 className="text-base font-semibold leading-snug" style={{ color: '#a5b4fc' }}>{card.front}</h4>
          <div className="w-full h-0.5 rounded-full" style={{ background: 'linear-gradient(90deg, var(--tv-accent), var(--tv-accent-2))' }} />
        </div>

        {/* Back */}
        <div className="absolute inset-0 rounded-2xl p-5 flex flex-col justify-between"
          style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(168,85,247,0.08))',
            border: '1px solid rgba(99,102,241,0.3)',
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}>
          <span className="text-[10px] uppercase tracking-widest font-bold" style={{ color: 'var(--tv-accent)' }}>Answer</span>
          <p className="text-sm font-medium leading-relaxed" style={{ color: 'var(--tv-text-1)' }}>{card.back}</p>
          <div className="w-full h-0.5 rounded-full" style={{ background: 'linear-gradient(90deg, var(--tv-accent-2), #f472b6)' }} />
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── MAIN COMPONENT ─────────────────────────────────────────────────────── */
export default function Workspace({ config, fileType }) {
  const [activeTab, setActiveTab] = useState('chat');
  const [chatMessages, setChatMessages] = useState([
    { from: 'bot', text: `Context loaded for ${config.domain} in ${config.language}. Ask me anything about this document.`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [flippedCard, setFlippedCard] = useState(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    const roomId = fileType === 'youtube' ? 'doc_yt_001' : 'doc_pdf_001';
    socket.emit('join-document-room', roomId);
    socket.on('receive-chat-message', (msg) => {
      setChatMessages(prev => [...prev, { ...msg, from: 'bot', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    });
    return () => socket.off('receive-chat-message');
  }, [fileType]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleChatSend = () => {
    if (!chatInput.trim()) return;
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    socket.emit('chat-message', { documentId: 'doc_001', message: chatInput, userId: 'user_1' });
    setChatMessages(prev => [...prev, { from: 'user', text: chatInput, time }]);
    setChatInput('');
  };

  const renderLeftPane = () => {
    if (fileType === 'youtube') {
      return (
        <div className="w-full aspect-video rounded-2xl overflow-hidden" style={{ border: '1px solid var(--tv-border)' }}>
          <iframe
            width="100%" height="100%"
            src="https://www.youtube.com/embed/dQw4w9WgXcQ"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }
    return (
      <div className="w-full h-full rounded-2xl overflow-y-auto p-8"
        style={{ background: 'rgba(5,5,10,0.7)', border: '1px solid var(--tv-border)' }}>
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-5" style={{ color: 'var(--tv-text-1)' }}>
            Chapter 1: Quantum Mechanics Basics
          </h2>
          <p className="text-sm leading-loose mb-6" style={{ color: 'var(--tv-text-2)' }}>
            Quantum mechanics is a fundamental theory in physics that provides a description of the
            physical properties of nature at the scale of atoms and subatomic particles.
            It is the foundation of all quantum physics including quantum chemistry,
            quantum field theory, quantum technology, and quantum information science.
          </p>

          {/* Equation block */}
          <div className="my-6 p-5 rounded-2xl font-mono text-sm overflow-x-auto"
            style={{
              background: 'rgba(99,102,241,0.08)',
              border: '1px solid rgba(99,102,241,0.25)',
              color: '#a5b4fc',
            }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full" style={{ background: '#f472b6' }} />
              <div className="w-2 h-2 rounded-full" style={{ background: '#fbbf24' }} />
              <div className="w-2 h-2 rounded-full" style={{ background: '#34d399' }} />
              <span className="ml-2 text-xs" style={{ color: 'var(--tv-text-3)' }}>Equation Guard™ — Protected</span>
            </div>
            {String.raw`$$ i\hbar\frac{\partial}{\partial t}\Psi(\mathbf{r},t) = \hat{H}\Psi(\mathbf{r},t) $$`}
          </div>

          <p className="text-sm leading-loose" style={{ color: 'var(--tv-text-2)' }}>
            The equation above is the Schrödinger equation — preserved perfectly by TechVani's
            Equation Guard™ technology while all surrounding prose is translated into your chosen language.
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col" style={{ background: 'var(--tv-bg)', color: 'var(--tv-text-1)' }}>

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <header className="h-14 flex items-center justify-between px-6 shrink-0"
        style={{
          background: 'rgba(5,5,10,0.9)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--tv-border)',
        }}>
        <div className="flex items-center gap-4">
          <TechVaniLogo size="sm" />
          <div className="w-px h-5" style={{ background: 'var(--tv-border)' }} />
          <span className="text-xs font-medium px-2.5 py-1 rounded-lg"
            style={{ color: '#a5b4fc', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)' }}>
            {config.language}
          </span>
          <span className="text-xs" style={{ color: 'var(--tv-text-3)' }}>
            {config.domain}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs" style={{ color: 'var(--tv-text-3)' }}>Context Active</span>
        </div>
      </header>

      {/* ── SPLIT CONTENT ──────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">

        {/* LEFT: media / doc reader */}
        <div className="w-1/2 p-5 flex flex-col gap-4">
          {/* Controls */}
          <div className="flex items-center gap-1 w-fit rounded-xl p-1.5"
            style={{ background: 'var(--tv-surface)', border: '1px solid var(--tv-border)' }}>
            {[Play, Pause, RotateCcw].map((Icon, i) => (
              <button key={i}
                className="p-2 rounded-lg transition-all duration-150"
                style={{ color: 'var(--tv-text-3)' }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--tv-text-1)'; e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--tv-text-3)'; e.currentTarget.style.background = 'transparent'; }}
              >
                <Icon size={15} />
              </button>
            ))}
            <div className="w-px h-5 mx-1" style={{ background: 'var(--tv-border)' }} />
            <span className="text-xs font-mono px-2" style={{ color: 'var(--tv-text-3)' }}>00:00 / 12:34</span>
          </div>

          <div className="flex-1 overflow-hidden">
            {renderLeftPane()}
          </div>
        </div>

        {/* RIGHT: learning panel */}
        <div className="w-1/2 flex flex-col" style={{ borderLeft: '1px solid var(--tv-border)', background: 'rgba(5,5,10,0.5)' }}>

          {/* Tabs */}
          <div className="flex items-center gap-1 px-4 py-3 shrink-0" style={{ borderBottom: '1px solid var(--tv-border)' }}>
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
                style={{
                  background: activeTab === tab.id ? 'rgba(99,102,241,0.15)' : 'transparent',
                  color: activeTab === tab.id ? '#a5b4fc' : 'var(--tv-text-3)',
                  border: activeTab === tab.id ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
                }}
              >
                <tab.icon size={15} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="flex-1 overflow-y-auto flex flex-col"
            >
              {/* ── CHAT TAB ────────────────────────────── */}
              {activeTab === 'chat' && (
                <div className="flex flex-col h-full">
                  <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    {chatMessages.map((msg, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex gap-2.5 ${msg.from === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                      >
                        {/* Avatar */}
                        <div className="w-7 h-7 rounded-xl flex-shrink-0 flex items-center justify-center text-xs font-bold mt-0.5"
                          style={msg.from === 'bot'
                            ? { background: 'linear-gradient(135deg, var(--tv-accent), var(--tv-accent-2))', color: 'white' }
                            : { background: 'rgba(255,255,255,0.1)', color: 'var(--tv-text-2)' }
                          }>
                          {msg.from === 'bot' ? '✦' : 'U'}
                        </div>

                        <div className={`flex flex-col gap-1 max-w-[78%] ${msg.from === 'user' ? 'items-end' : 'items-start'}`}>
                          <div className="px-4 py-3 rounded-2xl text-sm leading-relaxed"
                            style={msg.from === 'user'
                              ? { background: 'linear-gradient(135deg, var(--tv-accent), var(--tv-accent-2))', color: 'white', borderRadius: '18px 4px 18px 18px' }
                              : { background: 'var(--tv-surface)', color: 'var(--tv-text-2)', border: '1px solid var(--tv-border)', borderRadius: '4px 18px 18px 18px' }
                            }>
                            {msg.text}
                          </div>
                          <span className="text-[10px] px-1" style={{ color: 'var(--tv-text-3)' }}>{msg.time}</span>
                        </div>
                      </motion.div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Chat input */}
                  <div className="p-4 shrink-0" style={{ borderTop: '1px solid var(--tv-border)' }}>
                    <div className="flex items-center gap-2 rounded-xl p-1.5"
                      style={{ background: 'var(--tv-surface)', border: '1px solid var(--tv-border)' }}>
                      <input
                        value={chatInput}
                        onChange={e => setChatInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleChatSend()}
                        placeholder="Ask about this document..."
                        className="flex-1 bg-transparent px-3 py-2 text-sm outline-none"
                        style={{ color: 'var(--tv-text-1)' }}
                      />
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleChatSend}
                        className="w-9 h-9 rounded-lg flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg, var(--tv-accent), var(--tv-accent-2))' }}
                      >
                        <Send size={14} className="text-white" />
                      </motion.button>
                    </div>
                  </div>
                </div>
              )}

              {/* ── FLASHCARDS TAB ──────────────────────── */}
              {activeTab === 'flashcards' && (
                <div className="p-5 grid grid-cols-2 gap-4">
                  {mockFlashcards.map(card => (
                    <Flashcard
                      key={card.id}
                      card={card}
                      flipped={flippedCard === card.id}
                      onFlip={() => setFlippedCard(flippedCard === card.id ? null : card.id)}
                    />
                  ))}
                </div>
              )}

              {/* ── CHAPTERS TAB ────────────────────────── */}
              {activeTab === 'chapters' && (
                <div className="p-5 space-y-3">
                  {mockChapters.map((chap, i) => (
                    <motion.div
                      key={chap.id}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08, duration: 0.4 }}
                      whileHover={{ x: 4 }}
                      className="group flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all duration-200"
                      style={{
                        background: 'var(--tv-surface)',
                        border: '1px solid var(--tv-border)',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.35)'; e.currentTarget.style.background = 'rgba(99,102,241,0.06)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--tv-border)'; e.currentTarget.style.background = 'var(--tv-surface)'; }}
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-xs font-black w-8 text-right" style={{ color: 'var(--tv-text-3)' }}>
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span className="text-sm font-medium" style={{ color: 'var(--tv-text-1)' }}>{chap.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs" style={{ color: 'var(--tv-text-3)' }}>{chap.duration}</span>
                        <div className="w-1.5 h-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ background: 'var(--tv-accent)' }} />
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}