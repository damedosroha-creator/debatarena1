import React from 'react';
import { Trophy, Volume2, VolumeX, Settings, HelpCircle, BarChart3, Maximize2, Minimize2, Home } from 'lucide-react';
import { SubjectCategory } from '../types';

interface HeaderProps {
  currentCategory: SubjectCategory | 'ALL' | null;
  onGoHome: () => void;
  onOpenDashboard: () => void;
  onOpenSettings: () => void;
  onOpenGuide: () => void;
  soundFxEnabled: boolean;
  onToggleSound: () => void;
  correctCount: number;
  wrongCount: number;
  totalAnswered: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentCategory,
  onGoHome,
  onOpenDashboard,
  onOpenSettings,
  onOpenGuide,
  soundFxEnabled,
  onToggleSound,
  correctCount,
  wrongCount,
  totalAnswered,
}) => {
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
      }
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-cyan-500/30 shadow-[0_4px_24px_rgba(0,0,0,0.6)]">
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 flex flex-wrap items-center justify-between gap-3">
        {/* Logo and Titles */}
        <div className="flex items-center gap-3 cursor-pointer select-none" onClick={onGoHome}>
          <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.5)] border border-amber-300">
            <Trophy className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-wider text-base sm:text-lg text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 font-['Chakra_Petch']">
                THE CHAMPIONS ARENA
              </span>
              <span className="hidden md:inline-flex px-2 py-0.5 rounded text-[10px] font-bold tracking-widest bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                HME POLIBATAM
              </span>
            </div>
            <div className="text-xs text-slate-300 font-medium tracking-wide">
              SMAS TUNAS BARU JIN SEUNG BATAM
              {currentCategory && (
                <span className="ml-2 text-cyan-400 font-bold">
                  • {currentCategory === 'ALL' ? 'SEMUA KATEGORI' : currentCategory}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Live Score Chip & Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Score Badge */}
          <button
            onClick={onOpenDashboard}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 hover:border-amber-400/50 hover:bg-slate-800 transition-all text-xs font-semibold text-slate-200 shadow-inner group"
            title="Buka Rekapitulasi Nilai"
          >
            <BarChart3 className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">Skor:</span>
            <span className="text-emerald-400 font-bold">{correctCount}B</span>
            <span className="text-slate-500">/</span>
            <span className="text-rose-400 font-bold">{wrongCount}S</span>
            <span className="text-xs text-slate-400">({totalAnswered}/30)</span>
          </button>

          {/* Action Buttons */}
          <button
            onClick={onGoHome}
            className="p-2 rounded-lg bg-slate-900 text-slate-300 border border-slate-800 hover:border-cyan-400 hover:text-cyan-300 transition-colors"
            title="Menu Utama"
          >
            <Home className="w-4 h-4" />
          </button>

          <button
            onClick={onToggleSound}
            className={`p-2 rounded-lg border transition-colors ${
              soundFxEnabled
                ? 'bg-slate-900 text-cyan-400 border-cyan-500/40 hover:bg-slate-800'
                : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300'
            }`}
            title={soundFxEnabled ? 'Efek Suara Aktif' : 'Efek Suara Hening'}
          >
            {soundFxEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={onOpenSettings}
            className="p-2 rounded-lg bg-slate-900 text-slate-300 border border-slate-800 hover:border-amber-400 hover:text-amber-300 transition-colors"
            title="Pengaturan Suara & Timer"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenGuide}
            className="p-2 rounded-lg bg-slate-900 text-slate-300 border border-slate-800 hover:border-cyan-400 hover:text-cyan-300 transition-colors"
            title="Panduan Latihan"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <button
            onClick={toggleFullscreen}
            className="hidden sm:flex p-2 rounded-lg bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-600 transition-colors"
            title={isFullscreen ? 'Keluar Layar Penuh' : 'Layar Penuh (IFP)'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
