import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Check, BookOpen, Globe, Link2, Upload, FileText, Volume2, Type, Sparkles } from 'lucide-react';
import { FaYoutube } from 'react-icons/fa';
import { useDropzone } from 'react-dropzone';

/* ─── DATA ───────────────────────────────────────────────────────────────── */
const subjects = [
  'Physics', 'Mathematics', 'Computer Science', 'Chemistry',
  'Biology', 'Economics', 'Literature', 'Engineering',
  'History', 'Philosophy', 'Medicine', 'Law',
];

const indianLanguages = [
  'Hindi', 'Bengali', 'Telugu', 'Tamil', 'Marathi', 'Gujarati',
  'Kannada', 'Malayalam', 'Odia', 'Punjabi', 'Assamese', 'Maithili',
  'Sanskrit', 'Urdu', 'Sindhi', 'Dogri', 'Konkani', 'Manipuri',
  'Bodo', 'Santali', 'Kashmiri', 'Nepali',
];

const sourceLanguages = [
  'English', 'Hindi', 'Bengali', 'Telugu', 'Tamil', 'Marathi',
  'Gujarati', 'Kannada', 'Malayalam', 'Urdu', 'Punjabi',
  'Auto-Detect',
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

/* ─── OUTPUT FORMAT TOGGLE ───────────────────────────────────────────────── */
function FormatToggle({ value, onChange }) {
  return (
    <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid var(--tv-border)', background: 'rgba(255,255,255,0.03)' }}>
      {[
        { id: 'audio', icon: Volume2, label: 'Audio Summary' },
        { id: 'text', icon: Type, label: 'Text Summary' },
      ].map(opt => (
        <motion.button
          key={opt.id}
          whileTap={{ scale: 0.97 }}
          onClick={() => onChange(opt.id)}
          className="flex-1 flex items-center justify-center gap-2.5 px-5 py-3.5 text-sm font-medium transition-all duration-300"
          style={{
            background: value === opt.id
              ? 'linear-gradient(135deg, rgba(99,102,241,0.18), rgba(168,85,247,0.12))'
              : 'transparent',
            color: value === opt.id ? '#a5b4fc' : 'var(--tv-text-3)',
            borderRight: opt.id === 'audio' ? '1px solid var(--tv-border)' : 'none',
          }}
        >
          <opt.icon size={16} />
          {opt.label}
        </motion.button>
      ))}
    </div>
  );
}

/* ─── DROPZONE FOR DOCUMENTS ─────────────────────────────────────────────── */
function FileDropZone({ file, onDrop, onRemove }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => { if (acceptedFiles.length > 0) onDrop(acceptedFiles[0]); },
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
    multiple: false,
    maxSize: 50 * 1024 * 1024, // 50MB
  });

  if (file) {
    const ext = file.name.split('.').pop().toUpperCase();
    const sizeKB = (file.size / 1024).toFixed(0);
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-4 p-5 rounded-2xl"
        style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.25)' }}
      >
        <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)' }}>
          <FileText size={22} style={{ color: '#a5b4fc' }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: 'var(--tv-text-1)' }}>{file.name}</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--tv-text-3)' }}>{ext} · {sizeKB} KB</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onRemove}
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ color: 'var(--tv-text-3)', background: 'rgba(255,255,255,0.06)' }}
        >
          <X size={14} />
        </motion.button>
      </motion.div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className="relative rounded-2xl p-8 flex flex-col items-center text-center cursor-pointer transition-all duration-300"
      style={{
        background: isDragActive ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.02)',
        border: `2px dashed ${isDragActive ? 'rgba(99,102,241,0.6)' : 'var(--tv-border)'}`,
      }}
    >
      <input {...getInputProps()} />
      <motion.div
        animate={isDragActive ? { scale: 1.1, y: -4 } : { scale: 1, y: 0 }}
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}
      >
        <Upload size={24} style={{ color: 'var(--tv-accent)' }} />
      </motion.div>
      <p className="text-sm font-medium mb-1" style={{ color: isDragActive ? '#a5b4fc' : 'var(--tv-text-1)' }}>
        {isDragActive ? 'Drop your file here' : 'Drag & drop your file here'}
      </p>
      <p className="text-xs" style={{ color: 'var(--tv-text-3)' }}>
        or click to browse · PDF, DOC, TXT (max 50MB)
      </p>
    </div>
  );
}

/* ─── STEP DEFINITIONS ───────────────────────────────────────────────────── */
const youtubeSteps = [
  { num: 1, icon: Link2, title: 'YouTube Link', sub: 'Paste the video URL' },
  { num: 2, icon: BookOpen, title: 'Subject', sub: 'What is this content about?' },
  { num: 3, icon: Globe, title: 'Languages', sub: 'Source & output language' },
  { num: 4, icon: Volume2, title: 'Output Format', sub: 'Audio or text summary?' },
];

const documentSteps = [
  { num: 1, icon: Upload, title: 'Upload File', sub: 'Drop a PDF, DOC, or TXT' },
  { num: 2, icon: BookOpen, title: 'Subject', sub: 'What is this content about?' },
  { num: 3, icon: Globe, title: 'Languages', sub: 'Input & output language' },
  { num: 4, icon: Volume2, title: 'Output Format', sub: 'Audio or text summary?' },
];

/* ─── MAIN COMPONENT ─────────────────────────────────────────────────────── */
export default function PreProcessModal({ isOpen, onClose, fileType, onStartProcessing }) {
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState({
    url: '',
    file: null,
    subject: '',
    sourceLang: '',
    outputLang: '',
    outputFormat: 'text',
  });

  const isYouTube = fileType === 'youtube';
  const steps = isYouTube ? youtubeSteps : documentSteps;
  const totalSteps = 4;
  const accentColor = isYouTube ? '#fca5a5' : '#a5b4fc';
  const accentBg = isYouTube ? 'rgba(239,68,68,0.15)' : 'rgba(99,102,241,0.15)';
  const accentBorder = isYouTube ? 'rgba(239,68,68,0.3)' : 'rgba(99,102,241,0.3)';

  const handleSelect = (key, value) => setConfig(prev => ({ ...prev, [key]: value }));

  const handleNext = () => {
    if (step < totalSteps) setStep(s => s + 1);
    else {
      onStartProcessing(config);
      // Reset state
      setStep(1);
      setConfig({ url: '', file: null, subject: '', sourceLang: '', outputLang: '', outputFormat: 'text' });
    }
  };

  const handleBack = () => { if (step > 1) setStep(s => s - 1); };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setStep(1);
      setConfig({ url: '', file: null, subject: '', sourceLang: '', outputLang: '', outputFormat: 'text' });
    }, 300);
  };

  // Validate YouTube URL
  const isValidYouTubeUrl = (url) => {
    return /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|shorts\/|embed\/)|youtu\.be\/).+/.test(url);
  };

  // Determine if current step can proceed
  const canProceed = (() => {
    if (step === 1) {
      return isYouTube ? isValidYouTubeUrl(config.url) : !!config.file;
    }
    if (step === 2) return !!config.subject;
    if (step === 3) return !!config.sourceLang && !!config.outputLang;
    if (step === 4) return !!config.outputFormat;
    return false;
  })();

  /* ── Render step content ──────────────────────────────────────────────── */
  const renderStep = () => {
    if (step === 1) {
      if (isYouTube) {
        return (
          <div className="space-y-4">
            <div className="relative">
              <FaYoutube
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: config.url ? '#ef4444' : 'var(--tv-text-3)' }}
              />
              <input
                type="url"
                value={config.url}
                onChange={(e) => handleSelect('url', e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full rounded-xl px-4 py-3.5 text-sm outline-none transition-all duration-200"
                style={{
                  paddingLeft: '3rem',
                  background: 'rgba(255,255,255,0.04)',
                  border: `1px solid ${config.url && !isValidYouTubeUrl(config.url) ? 'rgba(248,113,113,0.5)' : 'var(--tv-border)'}`,
                  color: 'var(--tv-text-1)',
                }}
                onFocus={e => e.target.style.borderColor = isYouTube ? 'rgba(239,68,68,0.5)' : 'var(--tv-accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--tv-border)'}
              />
            </div>
            {config.url && !isValidYouTubeUrl(config.url) && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs ml-1" style={{ color: '#f87171' }}>
                Please enter a valid YouTube URL
              </motion.p>
            )}
            {config.url && isValidYouTubeUrl(config.url) && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-xs"
                style={{ color: '#34d399' }}
              >
                <Check size={14} /> Valid YouTube URL detected
              </motion.div>
            )}
          </div>
        );
      }
      // Document upload
      return (
        <FileDropZone
          file={config.file}
          onDrop={(file) => handleSelect('file', file)}
          onRemove={() => handleSelect('file', null)}
        />
      );
    }

    if (step === 2) {
      return (
        <div className="grid grid-cols-2 gap-2.5 max-h-[320px] overflow-y-auto pr-1">
          {subjects.map(d => (
            <PillTag key={d} label={d} selected={config.subject === d} onClick={() => handleSelect('subject', d)} />
          ))}
        </div>
      );
    }

    if (step === 3) {
      return (
        <div className="space-y-6">
          {/* Source / Input Language */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--tv-text-3)' }}>
              {isYouTube ? 'Video Source Language' : 'Document Language'}
            </p>
            <div className="grid grid-cols-3 gap-2 max-h-[120px] overflow-y-auto pr-1">
              {sourceLanguages.map(l => (
                <PillTag key={l} label={l} selected={config.sourceLang === l} onClick={() => handleSelect('sourceLang', l)} />
              ))}
            </div>
          </div>

          {/* Output Language */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--tv-text-3)' }}>
              Output Language <span style={{ color: 'var(--tv-accent)', fontWeight: 700 }}>· 22 Indian Languages</span>
            </p>
            <div className="grid grid-cols-3 gap-2 max-h-[180px] overflow-y-auto pr-1">
              {indianLanguages.map(l => (
                <PillTag key={l} label={l} selected={config.outputLang === l} onClick={() => handleSelect('outputLang', l)} />
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (step === 4) {
      return (
        <div className="space-y-6">
          <FormatToggle value={config.outputFormat} onChange={(val) => handleSelect('outputFormat', val)} />

          {/* Summary preview */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl p-5"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--tv-border)' }}
          >
            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--tv-text-3)' }}>
              Configuration Summary
            </p>
            <div className="space-y-2">
              {isYouTube ? (
                <div className="flex items-center gap-2 text-sm">
                  <FaYoutube size={14} style={{ color: '#ef4444' }} />
                  <span className="truncate" style={{ color: 'var(--tv-text-2)', maxWidth: '300px' }}>{config.url}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm">
                  <FileText size={14} style={{ color: '#a5b4fc' }} />
                  <span style={{ color: 'var(--tv-text-2)' }}>{config.file?.name || 'No file'}</span>
                </div>
              )}
              <div className="flex flex-wrap gap-2 mt-2">
                {[config.subject, `${config.sourceLang} → ${config.outputLang}`, config.outputFormat === 'audio' ? '🔊 Audio' : '📝 Text'].map((tag, i) => (
                  <span key={i} className="text-xs px-2.5 py-1 rounded-full"
                    style={{ color: accentColor, background: accentBg, border: `1px solid ${accentBorder}` }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      );
    }
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
          onClick={handleClose}
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
                            ? (isYouTube ? 'linear-gradient(135deg, #dc2626, #f43f5e)' : 'linear-gradient(135deg, var(--tv-accent), var(--tv-accent-2))')
                            : s.num === step
                              ? accentBg
                              : 'rgba(255,255,255,0.05)',
                          color: s.num <= step ? (s.num < step ? 'white' : accentColor) : 'var(--tv-text-3)',
                          border: `1px solid ${s.num === step ? accentBorder : 'transparent'}`,
                        }}
                      >
                        {s.num < step ? <Check size={12} /> : s.num}
                      </div>
                      {i < steps.length - 1 && (
                        <div className="w-6 h-px transition-all duration-500"
                          style={{ background: s.num < step ? (isYouTube ? '#ef4444' : 'var(--tv-accent)') : 'var(--tv-border)' }} />
                      )}
                    </React.Fragment>
                  ))}
                </div>

                <button
                  onClick={handleClose}
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
                          <Icon size={16} style={{ color: accentColor }} />
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
                  ? {
                      background: isYouTube
                        ? 'linear-gradient(135deg, #dc2626, #f43f5e)'
                        : 'linear-gradient(135deg, var(--tv-accent), var(--tv-accent-2))',
                      color: 'white',
                      boxShadow: `0 0 20px ${isYouTube ? 'rgba(239,68,68,0.35)' : 'var(--tv-glow)'}`,
                      cursor: 'pointer',
                    }
                  : { background: 'rgba(255,255,255,0.06)', color: 'var(--tv-text-3)', cursor: 'not-allowed' }
                }
              >
                {step === totalSteps
                  ? <><Sparkles size={15} /> Start Processing</>
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