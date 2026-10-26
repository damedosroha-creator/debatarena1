import React from 'react';
import { Question, QuestionRecord } from '../types';
import { Check, X, Eye } from 'lucide-react';

interface QuestionNavGridProps {
  questions: Question[];
  activeQuestionId: number;
  records: Record<number, QuestionRecord>;
  onSelectQuestion: (questionId: number) => void;
  filterCategory: string | null;
}

export const QuestionNavGrid: React.FC<QuestionNavGridProps> = ({
  questions,
  activeQuestionId,
  records,
  onSelectQuestion,
}) => {
  return (
    <div className="w-full max-w-5xl mx-auto bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-lg backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          NAVIGASI NOMOR SOAL (1 - 30)
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-slate-800 border border-slate-700" />
            <span>Belum</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-amber-400 border border-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
            <span className="text-amber-300 font-semibold">Aktif</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-cyan-900 border border-cyan-500" />
            <span>Dibuka</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-600 border border-emerald-400" />
            <span className="text-emerald-400 font-semibold">Benar</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-rose-600 border border-rose-400" />
            <span className="text-rose-400 font-semibold">Salah</span>
          </div>
        </div>
      </div>

      {/* Grid of 30 questions */}
      <div className="grid grid-cols-6 sm:grid-cols-10 md:grid-cols-15 gap-2">
        {questions.map((q) => {
          const record = records[q.id];
          const isActive = q.id === activeQuestionId;
          const isCorrect = record?.userAnswerStatus === 'correct';
          const isWrong = record?.userAnswerStatus === 'wrong';
          const isRevealed = !isCorrect && !isWrong && record?.status === 'revealed';

          let btnClasses = 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-600 hover:text-slate-200';

          if (isCorrect) {
            btnClasses = 'bg-emerald-950/90 text-emerald-300 border-emerald-500/80 shadow-[0_0_10px_rgba(16,185,129,0.3)] font-bold';
          } else if (isWrong) {
            btnClasses = 'bg-rose-950/90 text-rose-300 border-rose-500/80 shadow-[0_0_10px_rgba(239,68,68,0.3)] font-bold';
          } else if (isRevealed) {
            btnClasses = 'bg-cyan-950/90 text-cyan-300 border-cyan-500/60 font-semibold';
          }

          if (isActive) {
            btnClasses += ' ring-2 ring-amber-400 border-amber-300 text-amber-200 scale-105 z-10 shadow-[0_0_15px_rgba(245,158,11,0.5)]';
          }

          return (
            <button
              key={q.id}
              onClick={() => onSelectQuestion(q.id)}
              className={`relative h-11 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer select-none ${btnClasses}`}
              title={`Nomor ${q.id}: ${q.category} - ${q.topic}`}
            >
              <span className="text-xs font-['Chakra_Petch'] font-bold leading-none">
                {q.id}
              </span>
              <div className="mt-0.5">
                {isCorrect && <Check className="w-3 h-3 text-emerald-400 stroke-[3]" />}
                {isWrong && <X className="w-3 h-3 text-rose-400 stroke-[3]" />}
                {isRevealed && <Eye className="w-2.5 h-2.5 text-cyan-400" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
