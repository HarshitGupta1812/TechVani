import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Check, BookOpen, Globe, Type } from 'lucide-react';

/* ─── DATA ───────────────────────────────────────────────────────────────── */
const domains = ['Physics', 'Mathematics', 'Computer Science', 'Chemistry', 'Biology', 'Economics', 'Literature', 'Engineering'];
const languages = ['Hindi', 'Telugu', 'Tamil', 'Bengali', 'Marathi', 'Gujarati', 'Kannada', 'Malayalam'];
const scripts = [
  { id: 'native',   label: 'Native Script', desc: 'Devanagari, Telugu, Tamil, etc.' },
  { id: 'phonetic', label: 'Phonetic',       desc: 'Hinglish / Telugu-English blend' },
  { id: 'formal',   label: 'Academic Formal', desc: 'Full translation, structured prose' },
];

const steps = [
  { num: 1, icon: BookOpen, title: 'Subject Domain',   sub: 'What is this content about?' },
  { num: 2, icon: Globe,    title: 'Target Language',   sub: 'Which language to translate into?' },
  { num: 3, icon: Type,     title: 'Script Style',       sub: 'How should terms be rendered?' },
];

/* ─── PILL TAG BUTTON ────────────────────────────────────────────────────── */
function PillTag({ label, selected, onClick }) {
  return (
    <motion.button
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="relative px-4 py-2.5 rounded-xl text-sm font-medium text-left transition-all duration-200 overflow-hidden"
      style={{
        background: selected ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.04)',
        border: `1px solid ${selected ? 'rgba(99,102,241,0.5)' : 'var(--tv-border)'}`,
        color: selected ? '#a5b4fc' : 'var(--tv-text-2)',
      }}
    >
      {selected && (
        <motion.div
          layoutId="pill-glow"
          className="absolute inset-0 pointer-events-none rounded-[inherit]"
          style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(168,85,247,0.08))' }}
        />
      )}
      <span className="relative z-10 flex items-center gap-2">
        {selected && <Check size={13} className="text-indigo-400" />}
        {label}
      </span>
    </motion.button>
  );
}

/* ─── SCRIPT CARD ────────────────────────────────────────────────────────── */
function ScriptCard({ label, desc, selected, onClick }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all duration-200"
      style={{
        background: selected ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.03)',
        border: `1px solid ${selected ? 'rgba(99,102,241,0.45)' : 'var(--tv-border)'}`,
      }}
    >
      <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200"
        style={{ borderColor: selected ? 'var(--tv-accent)' : 'var(--tv-text-3)' }}>
        {selected && <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--tv-accent)' }} />}
      </div>
      <div>
        <div className="text-sm font-semibold" style={{ color: selected ? '#a5b4fc' : 'var(--tv-text-1)' }}>{label}</div>
        <div className="text-xs mt-0.5" style={{ color: 'var(--tv-text-3)' }}>{desc}</div>
      </div>
    </motion.button>
  );
}

/* ─── MAIN COMPONENT ─────────────────────────────────────────────────────── */
export default function PreProcessModal({ isOpen, onClose, fileType, onStartProcessing }) {
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState({ domain: '', language: '', script: '' });

  const handleSelect = (key, value) => setConfig(prev => ({ ...prev, [key]: value }));
  const handleNext = () => { if (step < 3) setStep(s => s + 1); else onStartProcessing(config); };
  const handleBack = () => { if (step > 1) setStep(s => s - 1); };
  const canProceed = step === 1 ? config.domain : step === 2 ? config.language : config.script;

  const renderStep = () => {
    if (step === 1) return (
      <div className="grid grid-cols-2 gap-2.5">
        {domains.map(d => (
          <PillTag key={d} label={d} selected={config.domain === d} onClick={() => handleSelect('domain', d)} />
        ))}
      </div>
    );
    if (step === 2) return (
      <div className="grid grid-cols-2 gap-2.5">
        {languages.map(l => (
          <PillTag key={l} label={l} selected={config.language === l} onClick={() => handleSelect('language', l)} />
        ))}
      </div>
    );
    return (
      <div className="space-y-3">
        {scripts.map(s => (
          <ScriptCard
            key={s.id}
            label={s.label}
            desc={s.desc}
            selected={config.script === s.id}
            onClick={() => handleSelect('script', s.id)}
          />
        ))}
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
          onClick={onClose}
        >
          <motion.div
            key="modal"
            initial={{ scale: 0.93, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.93, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-lg rounded-3xl overflow-hidden"
            style={{
              background: 'var(--tv-surface)',
              border: '1px solid var(--tv-border)',
              boxShadow: '0 40px 100px rgba(0,0,0,0.7)',
            }}
          >
            {/* Header */}
            <div className="px-8 pt-8 pb-6" style={{ borderBottom: '1px solid var(--tv-border)' }}>
              <div className="flex items-center justify-between mb-6">
                {/* Step indicators */}
                <div className="flex items-center gap-2">
                  {steps.map((s, i) => (
                    <React.Fragment key={s.num}>
                      <div
                        className="flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold transition-all duration-300"
                        style={{
                          background: s.num < step
                            ? 'linear-gradient(135deg, var(--tv-accent), var(--tv-accent-2))'
                            : s.num === step
                              ? 'rgba(99,102,241,0.2)'
                              : 'rgba(255,255,255,0.05)',
                          color: s.num <= step ? (s.num < step ? 'white' : '#a5b4fc') : 'var(--tv-text-3)',
                          border: `1px solid ${s.num === step ? 'rgba(99,102,241,0.5)' : 'transparent'}`,
                        }}
                      >
                        {s.num < step ? <Check size={12} /> : s.num}
                      </div>
                      {i < steps.length - 1 && (
                        <div className="w-8 h-px transition-all duration-500"
                          style={{ background: s.num < step ? 'var(--tv-accent)' : 'var(--tv-border)' }} />
                      )}
                    </React.Fragment>
                  ))}
                </div>

                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200"
                  style={{ color: 'var(--tv-text-3)', background: 'rgba(255,255,255,0.05)' }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--tv-text-1)'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--tv-text-3)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                >
                  <X size={15} />
                </button>
              </div>

              {/* Step title */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {(() => {
                    const s = steps[step - 1];
                    const Icon = s.icon;
                    return (
                      <>
                        <div className="flex items-center gap-2.5 mb-1">
                          <Icon size={16} style={{ color: 'var(--tv-accent)' }} />
                          <h2 className="text-xl font-bold" style={{ color: 'var(--tv-text-1)' }}>{s.title}</h2>
                        </div>
                        <p className="text-sm" style={{ color: 'var(--tv-text-3)' }}>{s.sub}</p>
                      </>
                    );
                  })()}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Step content */}
            <div className="px-8 py-6 min-h-[260px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                >
                  {renderStep()}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer nav */}
            <div className="flex items-center justify-between px-8 py-5" style={{ borderTop: '1px solid var(--tv-border)' }}>
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={handleBack}
                disabled={step === 1}
                className="flex items-center gap-1.5 text-sm font-medium px-4 py-2.5 rounded-xl transition-all duration-200"
                style={{
                  color: step === 1 ? 'var(--tv-text-3)' : 'var(--tv-text-2)',
                  opacity: step === 1 ? 0.4 : 1,
                  cursor: step === 1 ? 'not-allowed' : 'pointer',
                  background: step === 1 ? 'transparent' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${step === 1 ? 'transparent' : 'var(--tv-border)'}`,
                }}
              >
                <ChevronLeft size={15} />
                Back
              </motion.button>

              <motion.button
                whileHover={canProceed ? { scale: 1.03, y: -1 } : {}}
                whileTap={canProceed ? { scale: 0.97 } : {}}
                onClick={handleNext}
                disabled={!canProceed}
                className="flex items-center gap-2 text-sm font-semibold px-6 py-2.5 rounded-xl transition-all duration-200"
                style={canProceed
                  ? { background: 'linear-gradient(135deg, var(--tv-accent), var(--tv-accent-2))', color: 'white', boxShadow: '0 0 20px var(--tv-glow)', cursor: 'pointer' }
                  : { background: 'rgba(255,255,255,0.06)', color: 'var(--tv-text-3)', cursor: 'not-allowed' }
                }
              >
                {step === 3
                  ? <><Check size={15} /> Start Processing</>
                  : <>Next <ChevronRight size={15} /></>
                }
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}