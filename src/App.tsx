import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { QUESTIONS_DATABASE } from './data/questions';
import { Question, QuestionRecord, AppSettings, SubjectCategory } from './types';
import { Header } from './components/Header';
import { ArenaQuestionCard } from './components/ArenaQuestionCard';
import { QuestionNavGrid } from './components/QuestionNavGrid';
import { CategorySelectView } from './components/CategorySelectView';
import { DashboardModal } from './components/DashboardModal';
import { SettingsModal } from './components/SettingsModal';
import { GuideModal } from './components/GuideModal';
import { soundFx } from './utils/audio';
import { speechService } from './utils/speech';
import { Download, Sparkles } from 'lucide-react';

const STORAGE_KEY_PROGRESS = 'champions_arena_progress_smas_v1';
const STORAGE_KEY_SETTINGS = 'champions_arena_settings_smas_v1';

const DEFAULT_SETTINGS: AppSettings = {
  ttsVoiceURI: null,
  ttsRate: 1.0,
  englishVoiceURI: null,
  englishTtsMode: 'english',
  initialThinkingSeconds: 5,
  soundFxVolume: 0.8,
  soundFxEnabled: true,
  shuffleQuestions: false,
};

export default function App() {
  // Navigation / View state
  const [view, setView] = useState<'home' | 'arena'>('home');
  const [activeCategory, setActiveCategory] = useState<SubjectCategory | 'ALL' | 'REMEDIAL' | null>(null);
  const [activeQuestionId, setActiveQuestionId] = useState<number>(1);

  // Modals state
  const [isDashboardOpen, setIsDashboardOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);

  // Persistence: Settings
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    } catch {
      // Ignore fallback
    }
    return DEFAULT_SETTINGS;
  });

  // Persistence: Records
  const [records, setRecords] = useState<Record<number, QuestionRecord>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PROGRESS);
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore fallback
    }
    return {};
  });

  // Save settings on update
  const handleUpdateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(updated));
      } catch {
        // storage quota fallback
      }
      return updated;
    });
  };

  // Save progress records on update
  const handleScoreQuestion = (questionId: number, status: 'correct' | 'wrong', timeSpent: number) => {
    setRecords((prev) => {
      const updated = {
        ...prev,
        [questionId]: {
          questionId,
          status: (status === 'correct' ? 'correct' : 'wrong') as QuestionRecord['status'],
          userAnswerStatus: status,
          timeSpentSeconds: timeSpent,
          timestamp: Date.now(),
        },
      };
      try {
        localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(updated));
      } catch {
        // storage quota fallback
      }
      return updated;
    });
  };

  // Reset Storage
  const handleResetStorage = () => {
    speechService.cancel();
    setRecords({});
    try {
      localStorage.removeItem(STORAGE_KEY_PROGRESS);
    } catch {
      // storage quota fallback
    }
  };

  // Calculate score tallies
  const { correctCount, wrongCount, totalAnswered } = useMemo(() => {
    let c = 0;
    let w = 0;
    Object.values(records).forEach((r) => {
      if (r.userAnswerStatus === 'correct') c++;
      if (r.userAnswerStatus === 'wrong') w++;
    });
    return { correctCount: c, wrongCount: w, totalAnswered: c + w };
  }, [records]);

  // Questions in current active session
  const sessionQuestions = useMemo(() => {
    if (!activeCategory || activeCategory === 'ALL') {
      let list = [...QUESTIONS_DATABASE];
      if (settings.shuffleQuestions && activeCategory === 'ALL') {
        // Stable shuffle simulation based on ids
        list = [...list].sort((a, b) => ((a.id * 17) % 31) - ((b.id * 17) % 31));
      }
      return list;
    }
    if (activeCategory === 'REMEDIAL') {
      const wrongList = QUESTIONS_DATABASE.filter((q) => records[q.id]?.userAnswerStatus === 'wrong');
      return wrongList.length > 0 ? wrongList : QUESTIONS_DATABASE;
    }
    return QUESTIONS_DATABASE.filter((q) => q.category === activeCategory);
  }, [activeCategory, settings.shuffleQuestions, records]);

  // Active question object
  const activeQuestion = useMemo(() => {
    return QUESTIONS_DATABASE.find((q) => q.id === activeQuestionId) || QUESTIONS_DATABASE[0];
  }, [activeQuestionId]);

  // Current index within session
  const currentSessionIndex = useMemo(() => {
    const idx = sessionQuestions.findIndex((q) => q.id === activeQuestionId);
    return idx >= 0 ? idx : 0;
  }, [sessionQuestions, activeQuestionId]);

  // Start Category
  const handleSelectCategory = (cat: SubjectCategory | 'ALL') => {
    speechService.cancel();
    setActiveCategory(cat);
    let firstId = 1;
    if (cat === 'MATEMATIKA') firstId = 1;
    else if (cat === 'FISIKA') firstId = 9;
    else if (cat === 'BAHASA INGGRIS') firstId = 17;
    else if (cat === 'KIMIA') firstId = 24;
    else firstId = 1;

    setActiveQuestionId(firstId);
    setView('arena');
    if (settings.soundFxEnabled) soundFx.playClick(settings.soundFxVolume);
  };

  // Start Remedial Session
  const handleStartRemedial = () => {
    speechService.cancel();
    const wrongList = QUESTIONS_DATABASE.filter((q) => records[q.id]?.userAnswerStatus === 'wrong');
    if (wrongList.length === 0) return;
    setActiveCategory('REMEDIAL');
    setActiveQuestionId(wrongList[0].id);
    setView('arena');
    if (settings.soundFxEnabled) soundFx.playClick(settings.soundFxVolume);
  };

  // Select specific question (from 1-30 nav grid)
  const handleSelectQuestion = (qId: number) => {
    speechService.cancel();
    setActiveQuestionId(qId);
    setView('arena');
    if (settings.soundFxEnabled) soundFx.playClick(settings.soundFxVolume);
  };

  // Navigation Next / Prev within current session
  const handleNextQuestion = () => {
    if (currentSessionIndex < sessionQuestions.length - 1) {
      speechService.cancel();
      setActiveQuestionId(sessionQuestions[currentSessionIndex + 1].id);
      if (settings.soundFxEnabled) soundFx.playClick(settings.soundFxVolume);
    }
  };

  const handlePrevQuestion = () => {
    if (currentSessionIndex > 0) {
      speechService.cancel();
      setActiveQuestionId(sessionQuestions[currentSessionIndex - 1].id);
      if (settings.soundFxEnabled) soundFx.playClick(settings.soundFxVolume);
    }
  };

  const handleGoHome = () => {
    speechService.cancel();
    setView('home');
    if (settings.soundFxEnabled) soundFx.playClick(settings.soundFxVolume);
  };

  // Toggle Sound FX
  const handleToggleSound = () => {
    handleUpdateSettings({ soundFxEnabled: !settings.soundFxEnabled });
  };

  return (
    <div className="min-h-screen arena-grid-bg text-slate-100 flex flex-col selection:bg-amber-400 selection:text-slate-950">
      {/* Top Header */}
      <Header
        currentCategory={view === 'arena' ? (activeCategory === 'REMEDIAL' ? 'ALL' : activeCategory) : null}
        onGoHome={handleGoHome}
        onOpenDashboard={() => setIsDashboardOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        soundFxEnabled={settings.soundFxEnabled}
        onToggleSound={handleToggleSound}
        correctCount={correctCount}
        wrongCount={wrongCount}
        totalAnswered={totalAnswered}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 sm:px-6">
        {view === 'home' ? (
          <CategorySelectView
            onSelectCategory={handleSelectCategory}
            onStartRemedial={wrongCount > 0 ? handleStartRemedial : undefined}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenGuide={() => setIsGuideOpen(true)}
            records={records}
            wrongCount={wrongCount}
          />
        ) : (
          <div className="space-y-6">
            {/* Remedial Banner if in remedial mode */}
            {activeCategory === 'REMEDIAL' && (
              <div className="max-w-5xl mx-auto p-3.5 rounded-2xl bg-rose-950/80 border border-rose-500/80 text-center flex items-center justify-between gap-3 text-xs sm:text-sm text-rose-200 font-bold">
                <span>⚡ MODE REMEDIAL: Berlatih khusus untuk soal-soal yang sebelumnya dinilai salah.</span>
                <button
                  onClick={() => setActiveCategory('ALL')}
                  className="px-3 py-1 rounded-lg bg-rose-900 hover:bg-rose-800 text-rose-100 text-xs"
                >
                  Keluar Mode Remedial
                </button>
              </div>
            )}

            {/* Arena Active Question Card */}
            <ArenaQuestionCard
              question={activeQuestion}
              record={records[activeQuestion.id]}
              settings={settings}
              currentIndex={currentSessionIndex}
              totalInView={sessionQuestions.length}
              onScore={handleScoreQuestion}
              onNext={handleNextQuestion}
              onPrev={handlePrevQuestion}
              onBackToCategory={() => setView('home')}
              hasPrev={currentSessionIndex > 0}
              hasNext={currentSessionIndex < sessionQuestions.length - 1}
            />

            {/* Quick 1-30 Navigation Matrix */}
            <QuestionNavGrid
              questions={QUESTIONS_DATABASE}
              activeQuestionId={activeQuestion.id}
              records={records}
              onSelectQuestion={handleSelectQuestion}
              filterCategory={activeCategory === 'ALL' || activeCategory === 'REMEDIAL' ? null : activeCategory}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950/90 py-5 px-4 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-slate-300 font-semibold">SMAS TUNAS BARU JIN SEUNG BATAM</span>
            <span className="text-slate-600">|</span>
            <span className="text-amber-400 font-medium">Latihan Cerdas Cermat Juara 1</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>Penyelenggara: HME Politeknik Negeri Batam</span>
            <span className="text-slate-600">•</span>
            <a
              href="/the_champions_arena.html"
              download="the_champions_arena.html"
              className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 underline font-medium"
              title="Unduh file HTML mandiri untuk dijalankan tanpa server"
            >
              <Download className="w-3.5 h-3.5" />
              Unduh Versi HTML Mandiri
            </a>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <DashboardModal
        isOpen={isDashboardOpen}
        onClose={() => setIsDashboardOpen(false)}
        questions={QUESTIONS_DATABASE}
        records={records}
        onStartRemedial={handleStartRemedial}
        onResetAll={handleResetStorage}
        onSelectQuestion={handleSelectQuestion}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onResetStorage={handleResetStorage}
      />

      <GuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </div>
  );
}
