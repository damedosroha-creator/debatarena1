import React from 'react';
import { Trophy, Calculator, Zap, Languages, FlaskConical, Play, Layers, Settings, HelpCircle, RotateCw } from 'lucide-react';
import { SubjectCategory, QuestionRecord } from '../types';

interface CategorySelectViewProps {
  onSelectCategory: (category: SubjectCategory | 'ALL') => void;
  onStartRemedial?: () => void;
  onOpenSettings: () => void;
  onOpenGuide: () => void;
  records: Record<number, QuestionRecord>;
  wrongCount: number;
}

export const CategorySelectView: React.FC<CategorySelectViewProps> = ({
  onSelectCategory,
  onStartRemedial,
  onOpenSettings,
  onOpenGuide,
  records,
  wrongCount,
}) => {
  // Compute progress per category
  const getCategoryStats = (startId: number, endId: number) => {
    let completed = 0;
    let correct = 0;
    for (let id = startId; id <= endId; id++) {
      if (records[id]?.userAnswerStatus) {
        completed++;
        if (records[id].userAnswerStatus === 'correct') {
          correct++;
        }
      }
    }
    const total = endId - startId + 1;
    return { completed, correct, total };
  };

  const mathStats = getCategoryStats(1, 8);
  const physicsStats = getCategoryStats(9, 16);
  const englishStats = getCategoryStats(17, 23);
  const chemStats = getCategoryStats(24, 30);
  const totalStats = getCategoryStats(1, 30);

  const categories: Array<{
    id: SubjectCategory;
    title: string;
    subtitle: string;
    topics: string;
    count: number;
    color: string;
    badgeColor: string;
    icon: React.ReactNode;
    stats: { completed: number; correct: number; total: number };
  }> = [
    {
      id: 'MATEMATIKA',
      title: 'MATEMATIKA',
      subtitle: 'MATHEMATICS',
      topics: 'Aljabar, Deret, Sudut Rangkap, Logaritma, Peluang, Dimensi 3, Turunan, Matriks',
      count: 8,
      color: 'from-blue-600/30 via-slate-900 to-slate-950 border-cyan-500/50 hover:border-cyan-400',
      badgeColor: 'bg-cyan-950 text-cyan-300 border-cyan-500/40',
      icon: <Calculator className="w-8 h-8 text-cyan-400" />,
      stats: mathStats,
    },
    {
      id: 'FISIKA',
      title: 'FISIKA',
      subtitle: 'PHYSICS',
      topics: 'Kinematika GLBB, Hukum Newton, Energi Mekanik, Impuls, Fluida, Carnot, Doppler',
      count: 8,
      color: 'from-purple-600/30 via-slate-900 to-slate-950 border-indigo-500/50 hover:border-indigo-400',
      badgeColor: 'bg-indigo-950 text-indigo-300 border-indigo-500/40',
      icon: <Zap className="w-8 h-8 text-indigo-400" />,
      stats: physicsStats,
    },
    {
      id: 'BAHASA INGGRIS',
      title: 'BAHASA INGGRIS',
      subtitle: 'ENGLISH',
      topics: 'Advanced Synonyms, Conditional Type 2, Subject-Verb, Idioms, Antonyms, Passive Voice',
      count: 7,
      color: 'from-emerald-600/30 via-slate-900 to-slate-950 border-emerald-500/50 hover:border-emerald-400',
      badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-500/40',
      icon: <Languages className="w-8 h-8 text-emerald-400" />,
      stats: englishStats,
    },
    {
      id: 'KIMIA',
      title: 'KIMIA',
      subtitle: 'CHEMISTRY',
      topics: 'Elektron Valensi, Stoikiometri Mol, pH Asam, Biloks Mn, Jari Atom, Eksoterm, Sel Volta',
      count: 7,
      color: 'from-amber-600/30 via-slate-900 to-slate-950 border-amber-500/50 hover:border-amber-400',
      badgeColor: 'bg-amber-950 text-amber-300 border-amber-500/40',
      icon: <FlaskConical className="w-8 h-8 text-amber-400" />,
      stats: chemStats,
    },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-10 py-4">
      {/* Hero Header Presentation */}
      <div className="relative text-center rounded-3xl bg-gradient-to-b from-slate-900/90 via-slate-950/90 to-slate-950 border-2 border-cyan-500/30 p-8 sm:p-12 shadow-[0_0_60px_rgba(6,182,212,0.15)] overflow-hidden">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-amber-400/50 text-amber-300 text-xs font-bold tracking-widest uppercase mb-4 shadow-sm">
          <Trophy className="w-4 h-4 text-amber-400" />
          PERSIAPAN JUARA 1 • HME POLITEKNIK NEGERI BATAM
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-100 tracking-tight font-['Chakra_Petch'] uppercase">
          THE CHAMPIONS ARENA
        </h1>
        <div className="text-sm sm:text-lg font-bold tracking-widest text-cyan-300 uppercase mt-1">
          ACADEMIC CHALLENGE
        </div>
        <div className="text-base sm:text-xl font-extrabold text-slate-100 mt-2 tracking-wide font-['Plus_Jakarta_Sans']">
          SMAS TUNAS BARU JIN SEUNG BATAM
        </div>

        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto mt-4 leading-relaxed font-medium">
          Simulasi dan latihan intensif cerdas cermat 30 soal olimpiade terverifikasi dengan sistem Web Speech API narator otomatis, timer berpikir 5 detik + perpanjangan jeda, dan evaluasi hasil komprehensif.
        </p>

        {/* 4 Subjects pill */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 mt-6 text-xs font-bold tracking-wider text-slate-300 uppercase">
          <span className="px-3 py-1 rounded-lg bg-blue-950/80 border border-blue-500/40 text-blue-300">
            MATHEMATICS (8)
          </span>
          <span className="px-3 py-1 rounded-lg bg-purple-950/80 border border-purple-500/40 text-purple-300">
            PHYSICS (8)
          </span>
          <span className="px-3 py-1 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-300">
            ENGLISH (7)
          </span>
          <span className="px-3 py-1 rounded-lg bg-amber-950/80 border border-amber-500/40 text-amber-300">
            CHEMISTRY (7)
          </span>
        </div>

        {/* Primary CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-8 pt-4 border-t border-slate-800">
          <button
            onClick={() => onSelectCategory('ALL')}
            className="flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 active:scale-95 text-slate-950 font-black text-sm sm:text-base tracking-wider shadow-[0_0_35px_rgba(245,158,11,0.5)] transition-all cursor-pointer"
          >
            <Play className="w-5 h-5 fill-current" />
            MULAI LATIHAN (SEMUA 30 SOAL)
          </button>

          <button
            onClick={() => {
              const el = document.getElementById('category-selection-grid');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/50 font-bold text-sm tracking-wider transition-all"
          >
            <Layers className="w-4 h-4" />
            PILIH MATA PELAJARAN
          </button>

          {wrongCount > 0 && onStartRemedial && (
            <button
              onClick={onStartRemedial}
              className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-rose-950/90 hover:bg-rose-900 text-rose-200 border border-rose-500 font-bold text-sm tracking-wider shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-all"
            >
              <RotateCw className="w-4 h-4" />
              ULANGI SOAL SALAH ({wrongCount})
            </button>
          )}
        </div>

        <div className="flex items-center justify-center gap-3 mt-4 text-xs">
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 text-slate-400 hover:text-amber-300 transition-colors"
          >
            <Settings className="w-3.5 h-3.5" />
            PENGATURAN SUARA DAN TIMER
          </button>
          <span className="text-slate-600">•</span>
          <button
            onClick={onOpenGuide}
            className="flex items-center gap-1.5 text-slate-400 hover:text-cyan-300 transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            PANDUAN PENGGUNAAN
          </button>
        </div>
      </div>

      {/* 4 Category Portals Grid */}
      <div id="category-selection-grid" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-100 tracking-wider font-['Chakra_Petch'] uppercase">
            PILIH KATEGORI MATA PELAJARAN
          </h2>
          <span className="text-xs text-slate-400">
            Total Progres Selesai: {totalStats.completed}/30
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`group relative rounded-2xl bg-gradient-to-br ${cat.color} border-2 p-6 transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_0_30px_rgba(6,182,212,0.25)] cursor-pointer`}
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md group-hover:scale-110 transition-transform">
                  {cat.icon}
                </div>
                <div className="text-right">
                  <span className={`inline-block px-3 py-1 rounded-lg text-xs font-bold border ${cat.badgeColor}`}>
                    {cat.count} SOAL
                  </span>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Skor: {cat.stats.correct}/{cat.stats.completed} benar
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-100 tracking-wide font-['Chakra_Petch']">
                  {cat.title}
                </h3>
                <div className="text-xs font-semibold text-slate-400 tracking-widest uppercase">
                  {cat.subtitle}
                </div>
                <p className="text-xs text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                  {cat.topics}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="mt-5 pt-4 border-t border-slate-800/80">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                  <span>Progres Kategori</span>
                  <span className="font-bold text-slate-200">
                    {Math.round((cat.stats.completed / cat.count) * 100)}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-cyan-400 transition-all duration-500"
                    style={{ width: `${(cat.stats.completed / cat.count) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
