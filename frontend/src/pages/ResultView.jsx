import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, Pause, Volume2, VolumeX, Download, Copy, Check, FileText, SkipBack, SkipForward, Loader2 } from 'lucide-react';
import { FaYoutube } from 'react-icons/fa';
import TechVaniLogo from '../components/TechVaniLogo';

/* ─── AUDIO PLAYER ───────────────────────────────────────────────────────── */
function AudioPlayer({ audioUrl, title }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const onEnded = () => setIsPlaying(false);
    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', onEnded);
    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', onEnded);
    };
  }, [audioUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) { audioRef.current.pause(); } else { audioRef.current.play(); }
    setIsPlaying(!isPlaying);
  };

  const seek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    if (audioRef.current) audioRef.current.currentTime = pct * duration;
  };

  const skip = (seconds) => {
    if (audioRef.current) audioRef.current.currentTime = Math.max(0, Math.min(duration, audioRef.current.currentTime + seconds));
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const changeRate = () => {
    const rates = [0.5, 0.75, 1, 1.25, 1.5, 2];
    const idx = rates.indexOf(playbackRate);
    const next = rates[(idx + 1) % rates.length];
    if (audioRef.current) audioRef.current.playbackRate = next;
    setPlaybackRate(next);
  };

  const formatTime = (s) => {
    if (!s || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="rounded-3xl overflow-hidden"
      style={{ background: 'var(--tv-surface)', border: '1px solid var(--tv-border)' }}>
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      {/* Waveform visualization (decorative) */}
      <div className="relative h-32 overflow-hidden"
        style={{ background: 'linear-gradient(180deg, rgba(99,102,241,0.08) 0%, transparent 100%)' }}>
        <div className="absolute inset-0 flex items-end justify-center gap-[3px] px-8 pb-4">
          {Array.from({ length: 60 }).map((_, i) => {
            const h = 20 + Math.sin(i * 0.5) * 40 + Math.random() * 25;
            const isActive = (i / 60) * 100 <= progress;
            return (
              <div key={i} className="flex-shrink-0 rounded-full transition-all duration-150"
                style={{
                  width: '3px',
                  height: `${h}%`,
                  background: isActive
                    ? 'linear-gradient(180deg, #818cf8, #a855f7)'
                    : 'rgba(255,255,255,0.08)',
                }} />
            );
          })}
        </div>
      </div>

      {/* Controls */}
      <div className="p-6">
        {/* Progress bar */}
        <div className="mb-4 cursor-pointer group" onClick={seek}>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ width: `${progress}%`, background: 'linear-gradient(90deg, var(--tv-accent), var(--tv-accent-2))' }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs font-mono" style={{ color: 'var(--tv-text-3)' }}>{formatTime(currentTime)}</span>
            <span className="text-xs font-mono" style={{ color: 'var(--tv-text-3)' }}>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Volume */}
            <motion.button whileTap={{ scale: 0.9 }} onClick={toggleMute}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
              style={{ color: 'var(--tv-text-3)', background: 'rgba(255,255,255,0.05)' }}>
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </motion.button>
            {/* Speed */}
            <motion.button whileTap={{ scale: 0.9 }} onClick={changeRate}
              className="h-9 px-3 rounded-xl flex items-center justify-center text-xs font-bold transition-colors"
              style={{ color: 'var(--tv-text-3)', background: 'rgba(255,255,255,0.05)' }}>
              {playbackRate}x
            </motion.button>
          </div>

          <div className="flex items-center gap-3">
            <motion.button whileTap={{ scale: 0.85 }} onClick={() => skip(-10)}
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ color: 'var(--tv-text-2)', background: 'rgba(255,255,255,0.05)' }}>
              <SkipBack size={18} />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={togglePlay}
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, var(--tv-accent), var(--tv-accent-2))', boxShadow: '0 0 24px var(--tv-glow)' }}>
              {isPlaying ? <Pause size={22} className="text-white" /> : <Play size={22} className="text-white ml-0.5" />}
            </motion.button>

            <motion.button whileTap={{ scale: 0.85 }} onClick={() => skip(10)}
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ color: 'var(--tv-text-2)', background: 'rgba(255,255,255,0.05)' }}>
              <SkipForward size={18} />
            </motion.button>
          </div>

          {/* Download */}
          <motion.a
            whileTap={{ scale: 0.9 }}
            href={audioUrl}
            download={`${title || 'summary'}.mp3`}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
            style={{ color: 'var(--tv-text-3)', background: 'rgba(255,255,255,0.05)' }}>
            <Download size={16} />
          </motion.a>
        </div>
      </div>
    </div>
  );
}

/* ─── TEXT VIEWER ─────────────────────────────────────────────────────────── */
function TextViewer({ text, title }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || 'summary'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-3xl overflow-hidden"
      style={{ background: 'var(--tv-surface)', border: '1px solid var(--tv-border)' }}>

      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-4"
        style={{ borderBottom: '1px solid var(--tv-border)' }}>
        <div className="flex items-center gap-2">
          <FileText size={16} style={{ color: 'var(--tv-accent)' }} />
          <span className="text-sm font-semibold" style={{ color: 'var(--tv-text-1)' }}>Summary</span>
        </div>
        <div className="flex items-center gap-2">
          <motion.button whileTap={{ scale: 0.9 }} onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg transition-colors"
            style={{ color: copied ? '#34d399' : 'var(--tv-text-3)', background: 'rgba(255,255,255,0.05)' }}>
            {copied ? <Check size={13} /> : <Copy size={13} />}
            {copied ? 'Copied!' : 'Copy'}
          </motion.button>
          <motion.button whileTap={{ scale: 0.9 }} onClick={handleDownload}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg transition-colors"
            style={{ color: 'var(--tv-text-3)', background: 'rgba(255,255,255,0.05)' }}>
            <Download size={13} />
            Download
          </motion.button>
        </div>
      </div>

      {/* Content */}
      <div className="p-8 max-h-[60vh] overflow-y-auto">
        <div className="prose prose-invert max-w-none text-sm leading-loose" style={{ color: 'var(--tv-text-2)' }}>
          {text.split('\n').map((paragraph, i) => (
            paragraph.trim() ? <p key={i} className="mb-4">{paragraph}</p> : null
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── MAIN COMPONENT ─────────────────────────────────────────────────────── */
export default function ResultView({ config, fileType, onBack, onLogout, reviewData }) {
  const [isProcessing, setIsProcessing] = useState(!reviewData); // Skip processing in review mode
  const [result, setResult] = useState(
    reviewData ? { type: 'text', text: reviewData.summary } : null
  );
  const [error, setError] = useState(null);
  const hasRun = useRef(false); // Guard against React StrictMode double-fire

  const isYouTube = fileType === 'youtube';
  const title = reviewData
    ? (reviewData.title || 'Past Summary')
    : isYouTube ? (config.url || 'YouTube Summary') : (config.file?.name || 'Document Summary');

  // Process the input (skipped entirely in review mode)
  useEffect(() => {
    // Review mode — nothing to process
    if (reviewData) return;

    // Guard against React 18 StrictMode double-fire
    if (hasRun.current) return;
    hasRun.current = true;

    const process = async () => {
      try {
        setIsProcessing(true);
        setError(null);
        const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

        let summaryText = ''; // capture for history storage

        if (isYouTube) {
          const res = await fetch(`${API}/process/youtube`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              url: config.url,
              subject: config.subject,
              sourceLang: config.sourceLang,
              outputLang: config.outputLang,
              outputFormat: config.outputFormat,
            }),
          });
          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || 'Processing failed');
          }
          if (config.outputFormat === 'audio') {
            const blob = await res.blob();
            const audioUrl = URL.createObjectURL(blob);
            setResult({ type: 'audio', audioUrl });
            summaryText = '[Audio summary generated]';
          } else {
            const data = await res.json();
            summaryText = data.summary;
            setResult({ type: 'text', text: data.summary });
          }
        } else {
          const formData = new FormData();
          formData.append('file', config.file);
          formData.append('subject', config.subject);
          formData.append('inputLang', config.sourceLang);
          formData.append('outputLang', config.outputLang);
          formData.append('outputFormat', config.outputFormat);

          const res = await fetch(`${API}/process/document`, {
            method: 'POST',
            body: formData,
          });
          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || 'Processing failed');
          }
          if (config.outputFormat === 'audio') {
            const blob = await res.blob();
            const audioUrl = URL.createObjectURL(blob);
            setResult({ type: 'audio', audioUrl });
            summaryText = '[Audio summary generated]';
          } else {
            const data = await res.json();
            summaryText = data.summary;
            setResult({ type: 'text', text: data.summary });
          }
        }

        // Save to history with dedup check
        try {
          const itemType = isYouTube ? 'youtube' : 'document';
          const itemTitle = isYouTube ? config.url : config.file?.name;
          const stored = JSON.parse(localStorage.getItem('tv_history') || '[]');

          // Dedup: skip if an identical entry exists within the last 10 seconds
          const now = Date.now();
          const isDuplicate = stored.some(existing =>
            existing.type === itemType &&
            existing.title === itemTitle &&
            existing.outputLang === config.outputLang &&
            existing.outputFormat === config.outputFormat &&
            (now - new Date(existing.createdAt).getTime()) < 10000
          );

          if (!isDuplicate) {
            const historyItem = {
              id: `${now}_${Math.random().toString(36).slice(2, 8)}`,
              type: itemType,
              title: itemTitle,
              subject: config.subject,
              outputLang: config.outputLang,
              outputFormat: config.outputFormat,
              summary: summaryText, // Store summary for history review
              createdAt: new Date().toISOString(),
            };
            stored.unshift(historyItem);
            localStorage.setItem('tv_history', JSON.stringify(stored.slice(0, 50)));
          }
        } catch { /* ignore */ }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsProcessing(false);
      }
    };
    process();
  }, []);

  return (
    <div className="min-h-screen" style={{ background: 'var(--tv-bg)', color: 'var(--tv-text-1)' }}>

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-40 flex items-center justify-between px-8 py-4"
        style={{
          background: 'rgba(5,5,10,0.85)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--tv-border)',
        }}
      >
        <div className="flex items-center gap-4">
          <TechVaniLogo size="md" />
          <div className="w-px h-5" style={{ background: 'var(--tv-border)' }} />
          <span className="text-xs font-medium px-2.5 py-1 rounded-lg"
            style={{ color: '#a5b4fc', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)' }}>
            {config.outputLang}
          </span>
          <span className="text-xs" style={{ color: 'var(--tv-text-3)' }}>
            {config.subject}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isProcessing && (
            <div className="flex items-center gap-2 mr-3">
              <Loader2 size={14} className="animate-spin" style={{ color: 'var(--tv-accent)' }} />
              <span className="text-xs" style={{ color: 'var(--tv-text-3)' }}>Processing…</span>
            </div>
          )}
          {!isProcessing && !error && (
            <div className="flex items-center gap-2 mr-3">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-xs" style={{ color: 'var(--tv-text-3)' }}>Complete</span>
            </div>
          )}
        </div>
      </motion.header>

      {/* ── MAIN CONTENT ──────────────────────────────────────────────── */}
      <main className="max-w-3xl mx-auto px-6 py-12">

        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ x: -4 }}
          whileTap={{ scale: 0.97 }}
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-medium mb-8 px-4 py-2 rounded-xl transition-colors"
          style={{ color: 'var(--tv-text-3)', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--tv-border)' }}
        >
          <ArrowLeft size={15} />
          Back to Dashboard
        </motion.button>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-3">
            {isYouTube
              ? <FaYoutube size={20} style={{ color: '#ef4444' }} />
              : <FileText size={20} style={{ color: '#a5b4fc' }} />
            }
            <h1 className="text-2xl font-bold truncate" style={{ maxWidth: '500px' }}>{title}</h1>
          </div>
          <div className="flex items-center gap-2">
            {[config.subject, `${config.sourceLang} → ${config.outputLang}`, config.outputFormat === 'audio' ? '🔊 Audio' : '📝 Text'].map((tag, i) => (
              <span key={i} className="text-xs px-2.5 py-1 rounded-full"
                style={{ color: 'var(--tv-text-3)', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--tv-border)' }}>
                {tag}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {isProcessing && (
            <div className="rounded-3xl p-16 flex flex-col items-center text-center"
              style={{ background: 'var(--tv-surface)', border: '1px solid var(--tv-border)' }}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
                style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)' }}
              >
                <Loader2 size={28} style={{ color: 'var(--tv-accent)' }} />
              </motion.div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--tv-text-1)' }}>
                Processing your {isYouTube ? 'video' : 'document'}…
              </h3>
              <p className="text-sm" style={{ color: 'var(--tv-text-3)' }}>
                AI is transcribing, summarizing, and translating into {config.outputLang}.
              </p>
            </div>
          )}

          {error && (
            <div className="rounded-3xl p-12 flex flex-col items-center text-center"
              style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
                style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)' }}>
                <span className="text-2xl">⚠️</span>
              </div>
              <h3 className="text-base font-semibold mb-2" style={{ color: '#f87171' }}>Processing Failed</h3>
              <p className="text-sm mb-6" style={{ color: 'var(--tv-text-3)' }}>{error}</p>
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={onBack}
                className="text-sm font-medium px-6 py-2.5 rounded-xl"
                style={{ color: 'var(--tv-text-2)', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--tv-border)' }}>
                Try Again
              </motion.button>
            </div>
          )}

          {!isProcessing && !error && result && (
            <>
              {result.type === 'audio' && <AudioPlayer audioUrl={result.audioUrl} title={title} />}
              {result.type === 'text' && <TextViewer text={result.text} title={title} />}
            </>
          )}
        </motion.div>
      </main>
    </div>
  );
}
