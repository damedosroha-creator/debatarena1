import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  Play,
  Pause,
  Square,
  RotateCcw,
  Clock,
  Plus,
  CheckCircle2,
  XCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Volume2,
  AlertTriangle,
  Lightbulb,
  Gauge
} from 'lucide-react';
import { Question, QuestionRecord, AppSettings } from '../types';
import { speechService } from '../utils/speech';
import { soundFx } from '../utils/audio';

interface ArenaQuestionCardProps {
  question: Question;
  record?: QuestionRecord;
  settings: AppSettings;
  currentIndex: number;
  totalInView: number;
  onScore: (questionId: number, status: 'correct' | 'wrong', timeSpent: number) => void;
  onNext: () => void;
  onPrev: () => void;
  onBackToCategory: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}

export const ArenaQuestionCard: React.FC<ArenaQuestionCardProps> = ({
  question,
  record,
  settings,
  currentIndex,
  totalInView,
  onScore,
  onNext,
  onPrev,
  onBackToCategory,
  hasPrev,
  hasNext,
}) => {
  // TTS State
  const [speechStatus, setSpeechStatus] = useState<'idle' | 'speaking' | 'paused' | 'error'>('idle');
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [selectedSpeed, setSelectedSpeed] = useState<number>(settings.ttsRate || 1.0);

  // Timer State
  const [timerSeconds, setTimerSeconds] = useState<number>(settings.initialThinkingSeconds || 5);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [isTimeUp, setIsTimeUp] = useState<boolean>(false);
  const [isReadyToAnswer, setIsReadyToAnswer] = useState<boolean>(false);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState<boolean>(false);
  const [scoredStatus, setScoredStatus] = useState<'correct' | 'wrong' | null>(record?.userAnswerStatus || null);

  const timerIntervalRef = useRef<number | null>(null);
  const totalElapsedRef = useRef<number>(record?.timeSpentSeconds || 0);

  // Stop any active speech and timer when unmounting or switching question
  const cleanupAll = useCallback(() => {
    speechService.cancel();
    if (timerIntervalRef.current) {
      window.clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setSpeechStatus('idle');
    setIsTimerRunning(false);
  }, []);

  // Sync state whenever question changes
  useEffect(() => {
    cleanupAll();
    setTimerSeconds(settings.initialThinkingSeconds || 5);
    setIsTimerRunning(false);
    setIsTimeUp(false);
    setSpeechError(null);

    // If already scored previously, show revealed state
    if (record?.userAnswerStatus) {
      setScoredStatus(record.userAnswerStatus);
      setIsAnswerRevealed(true);
      setIsReadyToAnswer(true);
    } else {
      setScoredStatus(null);
      setIsAnswerRevealed(false);
      setIsReadyToAnswer(false);
    }

    return () => {
      cleanupAll();
    };
  }, [question.id, cleanupAll, settings.initialThinkingSeconds, record]);

  // Keep local speech rate in sync if changed from settings
  useEffect(() => {
    setSelectedSpeed(settings.ttsRate);
  }, [settings.ttsRate]);

  // Timer Tick implementation
  useEffect(() => {
    if (isTimerRunning && timerSeconds > 0) {
      timerIntervalRef.current = window.setInterval(() => {
        setTimerSeconds((prev) => {
          totalElapsedRef.current += 1;
          if (prev <= 1) {
            // Reached 0: Time's Up!
            setIsTimerRunning(false);
            setIsTimeUp(true);
            if (settings.soundFxEnabled) {
              soundFx.playTimesUp(settings.soundFxVolume);
            }
            if (timerIntervalRef.current) {
              window.clearInterval(timerIntervalRef.current);
              timerIntervalRef.current = null;
            }
            return 0;
          }
          if (settings.soundFxEnabled && prev <= 4) {
            soundFx.playTick(settings.soundFxVolume, prev <= 2);
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerIntervalRef.current) {
        window.clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [isTimerRunning, timerSeconds, settings.soundFxEnabled, settings.soundFxVolume]);

  // Handle Speech Narration
  const handlePlayQuestionSpeech = (speedOverride?: number) => {
    cleanupAll();
    setSpeechStatus('speaking');
    setSpeechError(null);

    const speed = speedOverride !== undefined ? speedOverride : selectedSpeed;

    // Pick proper voice
    let voice = null;
    if (question.category === 'BAHASA INGGRIS' && settings.englishTtsMode === 'english') {
      voice = speechService.getBestEnglishVoice(settings.englishVoiceURI);
    } else {
      voice = speechService.getBestIndonesianVoice(settings.ttsVoiceURI);
    }

    speechService.speak(question.ttsNarration, {
      voice,
      rate: speed,
      onStart: () => {
        setSpeechStatus('speaking');
      },
      onEnd: () => {
        setSpeechStatus('idle');
        // Automatically start the thinking timer after question has been read
        if (!isAnswerRevealed && !scoredStatus) {
          setIsTimerRunning(true);
          setIsTimeUp(false);
        }
      },
      onError: (err) => {
        setSpeechStatus('error');
        setSpeechError(err);
      },
    });
  };

  const handlePauseSpeech = () => {
    speechService.pause();
    setSpeechStatus('paused');
  };

  const handleResumeSpeech = () => {
    speechService.resume();
    setSpeechStatus('speaking');
  };

  const handleStopSpeech = () => {
    speechService.cancel();
    setSpeechStatus('idle');
  };

  const handleChangeSpeed = (speed: number) => {
    setSelectedSpeed(speed);
    if (speechStatus === 'speaking' || speechStatus === 'paused') {
      handlePlayQuestionSpeech(speed);
    }
  };

  // Timer controls
  const handleExtendTimer = (secondsToAdd: number) => {
    if (settings.soundFxEnabled) soundFx.playClick(settings.soundFxVolume);
    setTimerSeconds((prev) => prev + secondsToAdd);
    setIsTimeUp(false);
    setIsTimerRunning(true);
  };

  const handleToggleTimerPause = () => {
    if (settings.soundFxEnabled) soundFx.playClick(settings.soundFxVolume);
    setIsTimerRunning((prev) => !prev);
  };

  const handleReadyToAnswer = () => {
    cleanupAll();
    if (settings.soundFxEnabled) soundFx.playClick(settings.soundFxVolume);
    setIsReadyToAnswer(true);
    setIsTimerRunning(false);
  };

  // Answer Revelation
  const handleRevealAnswer = () => {
    cleanupAll();
    setIsAnswerRevealed(true);
    setIsReadyToAnswer(true);

    if (settings.soundFxEnabled) {
      soundFx.playClick(settings.soundFxVolume);
    }

    // TTS reads the correct answer and explanation concisely
    const voice = speechService.getBestIndonesianVoice(settings.ttsVoiceURI);
    const answerNarration = `Kunci jawaban benar adalah: ${question.correctAnswer}${
      question.unit ? ' ' + question.unit : ''
    }. Pembahasan: ${question.explanation}`;

    speechService.speak(answerNarration, {
      voice,
      rate: selectedSpeed,
      onStart: () => setSpeechStatus('speaking'),
      onEnd: () => setSpeechStatus('idle'),
      onError: () => setSpeechStatus('idle'),
    });
  };

  // Scoring
  const handleScore = (status: 'correct' | 'wrong') => {
    speechService.cancel();
    setScoredStatus(status);
    onScore(question.id, status, totalElapsedRef.current);

    if (status === 'correct') {
      if (settings.soundFxEnabled) {
        soundFx.playVictory(settings.soundFxVolume);
      }
      try {
        confetti({
          particleCount: 85,
          spread: 80,
          origin: { y: 0.65 },
          colors: ['#f59e0b', '#06b6d4', '#10b981', '#ffffff']
        });
      } catch {
        // Safe fallback if canvas not available
      }
    } else {
      if (settings.soundFxEnabled) {
        soundFx.playWrong(settings.soundFxVolume);
      }
    }
  };

  // Badge helpers
  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'MATEMATIKA':
        return 'from-blue-600 to-cyan-500 border-cyan-400 text-cyan-300';
      case 'FISIKA':
        return 'from-purple-600 to-indigo-500 border-indigo-400 text-indigo-300';
      case 'BAHASA INGGRIS':
        return 'from-emerald-600 to-teal-500 border-emerald-400 text-emerald-300';
      case 'KIMIA':
        return 'from-amber-600 to-orange-500 border-amber-400 text-amber-300';
      default:
        return 'from-slate-700 to-slate-600 border-slate-500 text-slate-300';
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Top Question Info Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg backdrop-blur">
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider border shadow-sm bg-gradient-to-r ${getCategoryColor(question.category)}`}>
            {question.category}
          </span>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
            {question.topic}
          </span>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-amber-950/60 text-amber-300 border border-amber-600/30">
            {question.difficulty}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-400">Soal</span>
          <span className="text-base font-extrabold text-amber-400 font-['Chakra_Petch']">
            #{question.id}
          </span>
          <span className="text-xs text-slate-500">
            ({currentIndex + 1} dari {totalInView})
          </span>
        </div>
      </div>

      {/* Main Arena Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900/95 via-slate-950/95 to-slate-950 border-2 border-cyan-500/40 shadow-[0_0_50px_rgba(6,182,212,0.15)] p-6 sm:p-10 transition-all">
        {/* Glow corner decorations */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Question Text */}
        <div className="relative mb-8">
          <div className="text-xs font-bold tracking-widest text-cyan-400 uppercase mb-2">
            PERTANYAAN
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold leading-relaxed text-slate-100 font-['Plus_Jakarta_Sans']">
            {question.questionText}
          </h2>
        </div>

        {/* TTS Narration Controls */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 sm:p-5 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <Volume2 className={`w-5 h-5 ${speechStatus === 'speaking' ? 'text-cyan-400 animate-pulse' : 'text-slate-400'}`} />
              <span className="text-xs font-bold tracking-wider text-slate-300 uppercase">
                KONTROL SUARA NARATOR (TTS)
              </span>
              {speechStatus === 'speaking' && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-400 border border-cyan-500/50 animate-pulse">
                  Sedang Membacakan
                </span>
              )}
              {speechStatus === 'paused' && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-400 border border-amber-500/50">
                  Suara Dijeda
                </span>
              )}
            </div>

            {/* Speed selection */}
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl">
              <Gauge className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-1" />
              {[0.75, 0.9, 1.0, 1.1, 1.25, 1.5].map((speed) => (
                <button
                  key={speed}
                  onClick={() => handleChangeSpeed(speed)}
                  className={`px-2 py-1 text-[11px] font-bold rounded-lg transition-all ${
                    selectedSpeed === speed
                      ? 'bg-amber-400 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {speed}×
                </button>
              ))}
            </div>
          </div>

          {/* Action Speech Buttons */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              onClick={() => handlePlayQuestionSpeech()}
              className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:scale-95 text-slate-950 font-bold text-sm tracking-wide shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              PUTAR SOAL
            </button>

            {speechStatus === 'speaking' ? (
              <button
                onClick={handlePauseSpeech}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-amber-300 font-bold text-sm border border-slate-700 transition-all cursor-pointer"
              >
                <Pause className="w-4 h-4" />
                JEDA SUARA
              </button>
            ) : speechStatus === 'paused' ? (
              <button
                onClick={handleResumeSpeech}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-950 hover:bg-emerald-900 active:scale-95 text-emerald-300 font-bold text-sm border border-emerald-600 transition-all cursor-pointer"
              >
                <Play className="w-4 h-4" />
                LANJUTKAN SUARA
              </button>
            ) : null}

            <button
              onClick={handleStopSpeech}
              disabled={speechStatus === 'idle'}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed text-rose-300 font-bold text-sm border border-slate-800 transition-all cursor-pointer"
            >
              <Square className="w-4 h-4" />
              HENTIKAN SUARA
            </button>

            <button
              onClick={() => handlePlayQuestionSpeech()}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-slate-200 font-bold text-sm border border-slate-800 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              ULANGI SOAL
            </button>
          </div>

          {speechError && (
            <div className="mt-3 flex items-center justify-between text-xs text-rose-400 bg-rose-950/40 border border-rose-800/60 rounded-xl p-2.5">
              <span>{speechError}</span>
              <button
                onClick={() => handlePlayQuestionSpeech()}
                className="underline hover:text-rose-200 font-bold"
              >
                Coba Lagi
              </button>
            </div>
          )}
        </div>

        {/* SECTION: Thinking Timer & Jeda Menjawab */}
        <div className="bg-slate-950/90 border border-cyan-500/30 rounded-2xl p-5 mb-8 shadow-inner">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Visual Timer Display */}
            <div className="flex items-center gap-4">
              <div
                className={`relative flex items-center justify-center w-20 h-20 rounded-2xl border-2 transition-all shadow-lg ${
                  isTimeUp
                    ? 'bg-rose-950/80 border-rose-500 text-rose-400 shadow-[0_0_20px_rgba(239,68,68,0.5)] animate-bounce'
                    : isTimerRunning
                    ? 'bg-slate-900 border-amber-400 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.4)]'
                    : 'bg-slate-900 border-slate-700 text-slate-300'
                }`}
              >
                <div className="text-center font-['Chakra_Petch']">
                  <div className="text-3xl font-black">{timerSeconds}</div>
                  <div className="text-[10px] tracking-wider uppercase">DETIK</div>
                </div>
              </div>

              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  WAKTU BERPIKIR
                </div>
                {isTimeUp ? (
                  <div className="flex items-center gap-1.5 text-rose-400 font-bold text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    WAKTU HABIS! Tim dipersilakan menjawab atau minta tambahan waktu.
                  </div>
                ) : isTimerRunning ? (
                  <div className="flex items-center gap-2 text-amber-300 text-sm font-semibold">
                    <Clock className="w-4 h-4 animate-spin" />
                    Timer berjalan... Tim sedang berdiskusi.
                  </div>
                ) : (
                  <div className="text-slate-400 text-sm">
                    Timer terjeda atau menunggu narator selesai.
                  </div>
                )}
              </div>
            </div>

            {/* Timer Extenders and Controls */}
            <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 w-full sm:w-auto">
              <button
                onClick={() => handleExtendTimer(5)}
                className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all"
                title="Tambah 5 detik ke sisa waktu"
              >
                <Plus className="w-3.5 h-3.5" /> +5 DETIK
              </button>
              <button
                onClick={() => handleExtendTimer(10)}
                className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all"
                title="Tambah 10 detik ke sisa waktu"
              >
                <Plus className="w-3.5 h-3.5" /> +10 DETIK
              </button>
              <button
                onClick={() => handleExtendTimer(15)}
                className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all"
                title="Tambah 15 detik ke sisa waktu"
              >
                <Plus className="w-3.5 h-3.5" /> +15 DETIK
              </button>

              <button
                onClick={handleToggleTimerPause}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 text-xs font-bold transition-all"
              >
                {isTimerRunning ? 'JEDA TIMER' : 'LANJUTKAN TIMER'}
              </button>

              <button
                onClick={handleReadyToAnswer}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 active:scale-95 text-slate-950 text-xs sm:text-sm font-extrabold tracking-wider shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all cursor-pointer"
              >
                SIAP MENJAWAB!
              </button>
            </div>
          </div>
        </div>

        {/* SECTION: Answering & Reveal Stage */}
        <div className="border-t border-slate-800 pt-6">
          {!isAnswerRevealed ? (
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 text-center space-y-4">
              <h3 className="text-base sm:text-lg font-bold text-slate-200 uppercase tracking-wider">
                TIM SUDAH SIAP MENJAWAB?
              </h3>
              <p className="text-sm text-slate-400 max-w-xl mx-auto">
                Dengarkan jawaban lisan dari tim SMAS Tunas Baru Jin Seung Batam terlebih dahulu, kemudian tekan tombol di bawah untuk membuka kunci jawaban resmi.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleRevealAnswer}
                  className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 active:scale-95 text-slate-950 font-extrabold text-sm sm:text-base tracking-wider shadow-[0_0_30px_rgba(245,158,11,0.5)] transition-all cursor-pointer"
                >
                  <Eye className="w-5 h-5" />
                  PUTAR KUNCI JAWABAN
                </button>

                <button
                  onClick={() => handlePlayQuestionSpeech()}
                  className="px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-bold"
                >
                  ULANGI SOAL
                </button>

                <button
                  onClick={() => handleExtendTimer(10)}
                  className="px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-700 text-xs font-bold"
                >
                  PERPANJANG WAKTU (+10s)
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-fadeIn">
              {/* Revealed Answer Box */}
              <div className="relative rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border-2 border-amber-400/80 p-6 sm:p-8 shadow-[0_0_40px_rgba(245,158,11,0.2)]">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-sm tracking-widest uppercase">
                    <Sparkles className="w-4 h-4" />
                    KUNCI JAWABAN RESMI
                  </div>
                  <button
                    onClick={handleRevealAnswer}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-amber-300 border border-slate-700"
                    title="Bacakan ulang kunci jawaban dan pembahasan"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    ULANGI SUARA KUNCI
                  </button>
                </div>

                <div className="mb-4">
                  <div className="text-3xl sm:text-4xl font-extrabold text-white font-['Plus_Jakarta_Sans'] tracking-tight">
                    {question.correctAnswer}
                    {question.unit && (
                      <span className="text-xl sm:text-2xl text-amber-300 font-semibold ml-2">
                        {question.unit}
                      </span>
                    )}
                  </div>
                  {question.alternativeAnswers && question.alternativeAnswers.length > 0 && (
                    <div className="text-xs text-slate-400 mt-1">
                      Alternatif jawaban diterima: {question.alternativeAnswers.join(', ')}
                    </div>
                  )}
                </div>

                {/* Explanation */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 text-slate-300 text-sm leading-relaxed">
                  <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase mb-1">
                    <Lightbulb className="w-3.5 h-3.5" />
                    Pembahasan Singkat:
                  </div>
                  <p>{question.explanation}</p>
                </div>
              </div>

              {/* Scoring Panel */}
              <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-6">
                <div className="text-center mb-4">
                  <div className="text-xs font-bold tracking-widest text-slate-400 uppercase">
                    PENILAIAN JAWABAN TIM
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Cocokkan jawaban lisan siswa dengan kunci resmi di atas.
                  </p>
                </div>

                {scoredStatus === 'correct' && (
                  <div className="mb-4 p-4 rounded-xl bg-emerald-950/70 border-2 border-emerald-500 text-center animate-bounce">
                    <div className="text-emerald-300 font-black text-lg sm:text-xl tracking-wider">
                      🎉 LUAR BIASA! JAWABAN BENAR!
                    </div>
                    <div className="text-xs text-emerald-400/90 mt-0.5 font-medium">
                      Poin berhasil diraih untuk SMAS Tunas Baru Jin Seung Batam!
                    </div>
                  </div>
                )}

                {scoredStatus === 'wrong' && (
                  <div className="mb-4 p-4 rounded-xl bg-rose-950/70 border-2 border-rose-500 text-center">
                    <div className="text-rose-300 font-black text-lg sm:text-xl tracking-wider">
                      BELUM TEPAT!
                    </div>
                    <div className="text-xs text-rose-200 mt-1 font-medium">
                      Jawaban yang benar adalah: <span className="font-bold underline text-amber-300">{question.correctAnswer}</span>
                    </div>
                  </div>
                )}

                {/* Big Two Scoring Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => handleScore('correct')}
                    className={`flex items-center justify-center gap-3 py-4 px-6 rounded-2xl font-black text-base sm:text-lg tracking-wider border-2 transition-all cursor-pointer shadow-lg active:scale-95 ${
                      scoredStatus === 'correct'
                        ? 'bg-emerald-500 text-slate-950 border-emerald-300 ring-4 ring-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.6)]'
                        : 'bg-emerald-600/90 hover:bg-emerald-500 text-white border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                    }`}
                  >
                    <CheckCircle2 className="w-6 h-6" />
                    JAWABAN BENAR
                  </button>

                  <button
                    onClick={() => handleScore('wrong')}
                    className={`flex items-center justify-center gap-3 py-4 px-6 rounded-2xl font-black text-base sm:text-lg tracking-wider border-2 transition-all cursor-pointer shadow-lg active:scale-95 ${
                      scoredStatus === 'wrong'
                        ? 'bg-rose-600 text-white border-rose-300 ring-4 ring-rose-500/40 shadow-[0_0_30px_rgba(239,68,68,0.6)]'
                        : 'bg-rose-700/90 hover:bg-rose-600 text-white border-rose-400 shadow-[0_0_20px_rgba(239,68,68,0.3)]'
                    }`}
                  >
                    <XCircle className="w-6 h-6" />
                    JAWABAN SALAH
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Navigation Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/80 pt-6 mt-8">
          <div className="flex items-center gap-2">
            <button
              onClick={onPrev}
              disabled={!hasPrev}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 font-bold text-xs sm:text-sm border border-slate-800 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              SOAL SEBELUMNYA
            </button>
            <button
              onClick={onNext}
              disabled={!hasNext}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed text-cyan-300 font-bold text-xs sm:text-sm border border-slate-800 transition-all"
            >
              SOAL BERIKUTNYA
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={onBackToCategory}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 text-xs font-semibold transition-all"
          >
            Kembali ke Pilihan Kategori
          </button>
        </div>
      </div>
    </div>
  );
};
