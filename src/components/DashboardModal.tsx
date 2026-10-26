import React from 'react';
import { X, Trophy, CheckCircle2, XCircle, RotateCcw, RotateCw, AlertTriangle, HelpCircle, ArrowRight } from 'lucide-react';
import { Question, QuestionRecord } from '../types';

interface DashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: Question[];
  records: Record<number, QuestionRecord>;
  onStartRemedial: () => void;
  onResetAll: () => void;
  onSelectQuestion: (questionId: number) => void;
}

export const DashboardModal: React.FC<DashboardModalProps> = ({
  isOpen,
  onClose,
  questions,
  records,
  onStartRemedial,
  onResetAll,
  onSelectQuestion,
}) => {
  if (!isOpen) return null;

  // Calculate statistics
  let correctCount = 0;
  let wrongCount = 0;
  const wrongQuestions: Question[] = [];

  questions.forEach((q) => {
    const r = records[q.id];
    if (r?.userAnswerStatus === 'correct') {
      correctCount++;
    } else if (r?.userAnswerStatus === 'wrong') {
      wrongCount++;
      wrongQuestions.push(q);
    }
  });

  const totalAnswered = correctCount + wrongCount;
  const unassessedCount = questions.length - totalAnswered;
  const accuracyPercent = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;

  // Subject breakdown
  const subjectBreakdown = ['MATEMATIKA', 'FISIKA', 'BAHASA INGGRIS', 'KIMIA'].map((cat) => {
    const subjectQuestions = questions.filter((q) => q.category === cat);
    let sCorrect = 0;
    let sWrong = 0;
    subjectQuestions.forEach((q) => {
      const r = records[q.id];
      if (r?.userAnswerStatus === 'correct') sCorrect++;
      if (r?.userAnswerStatus === 'wrong') sWrong++;
    });
    const sAnswered = sCorrect + sWrong;
    const sAcc = sAnswered > 0 ? Math.round((sCorrect / sAnswered) * 100) : 0;
    return {
      category: cat,
      total: subjectQuestions.length,
      answered: sAnswered,
      correct: sCorrect,
      wrong: sWrong,
      accuracy: sAcc,
    };
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border-2 border-amber-400/60 rounded-3xl p-6 sm:p-8 shadow-[0_0_60px_rgba(245,158,11,0.3)] my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-amber-400 text-slate-950 shadow-md">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white font-['Chakra_Petch'] uppercase tracking-wider">
              DASHBOARD HASIL LATIHAN TIM
            </h2>
            <div className="text-xs text-amber-300 font-semibold tracking-wide">
              SMAS TUNAS BARU JIN SEUNG BATAM • THE CHAMPIONS ARENA
            </div>
          </div>
        </div>

        {/* High-Level Score Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 text-center">
            <div className="text-xs font-bold text-slate-400 uppercase">Total Soal</div>
            <div className="text-3xl font-extrabold text-white mt-1 font-['Chakra_Petch']">30</div>
            <div className="text-[11px] text-slate-500 mt-0.5">{totalAnswered} dinilai</div>
          </div>

          <div className="bg-slate-950/80 border border-emerald-500/40 rounded-2xl p-4 text-center">
            <div className="text-xs font-bold text-emerald-400 uppercase">Jawaban Benar</div>
            <div className="text-3xl font-extrabold text-emerald-300 mt-1 font-['Chakra_Petch']">
              {correctCount}
            </div>
            <div className="text-[11px] text-emerald-500/80 mt-0.5">Poin Berhasil</div>
          </div>

          <div className="bg-slate-950/80 border border-rose-500/40 rounded-2xl p-4 text-center">
            <div className="text-xs font-bold text-rose-400 uppercase">Jawaban Salah</div>
            <div className="text-3xl font-extrabold text-rose-300 mt-1 font-['Chakra_Petch']">
              {wrongCount}
            </div>
            <div className="text-[11px] text-rose-500/80 mt-0.5">Perlu Evaluasi</div>
          </div>

          <div className="bg-slate-950/80 border border-cyan-500/40 rounded-2xl p-4 text-center">
            <div className="text-xs font-bold text-cyan-400 uppercase">Akurasi</div>
            <div className="text-3xl font-extrabold text-cyan-300 mt-1 font-['Chakra_Petch']">
              {totalAnswered > 0 ? `${accuracyPercent}%` : '0%'}
            </div>
            <div className="text-[11px] text-cyan-500/80 mt-0.5">
              {totalAnswered > 0 ? `${totalAnswered} soal dinilai` : 'Belum ada dinilai'}
            </div>
          </div>
        </div>

        {/* Breakdown per Subject Table */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 mb-6">
          <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-3">
            REKAPITULASI PER MATA PELAJARAN
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider">
                  <th className="pb-2">Mata Pelajaran</th>
                  <th className="pb-2 text-center">Total</th>
                  <th className="pb-2 text-center">Benar</th>
                  <th className="pb-2 text-center">Salah</th>
                  <th className="pb-2 text-right">Akurasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {subjectBreakdown.map((sb) => (
                  <tr key={sb.category} className="hover:bg-slate-900/50">
                    <td className="py-2.5 font-bold text-slate-200">{sb.category}</td>
                    <td className="py-2.5 text-center text-slate-400">{sb.total}</td>
                    <td className="py-2.5 text-center text-emerald-400 font-bold">{sb.correct}</td>
                    <td className="py-2.5 text-center text-rose-400 font-bold">{sb.wrong}</td>
                    <td className="py-2.5 text-right font-extrabold text-amber-300 font-['Chakra_Petch']">
                      {sb.answered > 0 ? `${sb.accuracy}%` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Remedial List: Incorrect questions */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 mb-6 max-h-72 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              DAFTAR SOAL PERLU REMEDIAL ({wrongQuestions.length})
            </h3>
            {wrongQuestions.length > 0 && (
              <button
                onClick={() => {
                  onClose();
                  onStartRemedial();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-900/80 hover:bg-rose-800 text-rose-200 border border-rose-600 text-xs font-bold transition-all"
              >
                <RotateCw className="w-3.5 h-3.5" />
                Mulai Remedial Khusus
              </button>
            )}
          </div>

          {wrongQuestions.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-xs">
              {totalAnswered === 0
                ? 'Belum ada soal yang dinilai. Mulai latihan untuk melihat rekap.'
                : '🎉 Hebat! Tidak ada soal yang dinilai salah.'}
            </div>
          ) : (
            <div className="space-y-3">
              {wrongQuestions.map((wq) => (
                <div
                  key={wq.id}
                  className="p-3.5 rounded-xl bg-slate-900/90 border border-rose-900/50 hover:border-rose-600 transition-colors cursor-pointer"
                  onClick={() => {
                    onClose();
                    onSelectQuestion(wq.id);
                  }}
                >
                  <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-1">
                    <span className="text-rose-400">
                      Soal #{wq.id} • {wq.category}
                    </span>
                    <span className="text-slate-500 font-normal">{wq.topic}</span>
                  </div>
                  <p className="text-xs text-slate-200 line-clamp-2">{wq.questionText}</p>
                  <div className="mt-2 text-xs text-slate-300">
                    <span className="text-slate-400">Kunci Benar: </span>
                    <span className="font-bold text-emerald-400">
                      {wq.correctAnswer} {wq.unit}
                    </span>
                  </div>
                  <div className="mt-1 text-[11px] text-slate-400 italic">
                    Pembahasan: {wq.explanation}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (window.confirm('Apakah Anda yakin ingin mengulang seluruh latihan dari awal? Nilai dan progres akan di-reset.')) {
                  onResetAll();
                  onClose();
                }
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 border border-slate-700 text-xs font-bold transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Ulangi Seluruh Latihan
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-extrabold text-xs sm:text-sm tracking-wider shadow-md transition-all cursor-pointer"
          >
            Kembali ke Latihan
          </button>
        </div>
      </div>
    </div>
  );
};
