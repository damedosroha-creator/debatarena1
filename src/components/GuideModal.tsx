import React from 'react';
import { X, HelpCircle, Trophy, Sparkles, Volume2, Clock, CheckCircle2, Monitor } from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border-2 border-cyan-500/50 rounded-3xl p-6 sm:p-8 shadow-[0_0_60px_rgba(6,182,212,0.3)] my-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 shadow-md">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white font-['Chakra_Petch'] uppercase tracking-wider">
              PANDUAN LATIHAN INTENSIF JUARA 1
            </h2>
            <div className="text-xs text-amber-300 font-semibold tracking-wide">
              THE CHAMPIONS ARENA • HME POLITEKNIK NEGERI BATAM
            </div>
          </div>
        </div>

        <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed max-h-[65vh] overflow-y-auto pr-2">
          {/* Section 1: Tujuan & Tim */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
            <h3 className="font-extrabold text-amber-300 text-sm mb-1.5 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Target Tim SMAS Tunas Baru Jin Seung Batam
            </h3>
            <p>
              Aplikasi ini dirancang khusus untuk mensimulasikan babak cerdas cermat kompetisi akademik bergengsi yang diselenggarakan oleh <strong>Himpunan Mahasiswa Elektro Politeknik Negeri Batam</strong>. Target tim adalah meraih <strong>JUARA 1</strong> melalui latihan kecepatan bernalar, ketepatan rumus, dan kekompakan menjawab secara lisan.
            </p>
          </div>

          {/* Section 2: Alur Pertandingan */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
            <h3 className="font-extrabold text-cyan-300 text-sm mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Alur Standar Per Soal
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-slate-300">
              <li>
                <strong>Pembacaan Soal (TTS):</strong> Klik tombol <span className="text-cyan-300 font-semibold">PUTAR SOAL</span>. Narator otomatis akan membacakan nomor soal, kategori, dan soal lengkap dengan jelas.
              </li>
              <li>
                <strong>Waktu Berpikir (5 Detik):</strong> Begitu narator selesai membacakan, hitungan mundur 5 detik dimulai otomatis.
              </li>
              <li>
                <strong>Perpanjangan Waktu:</strong> Pembina/moderator dapat menekan <span className="text-amber-300 font-semibold">+5s, +10s, atau +15s</span> untuk memperpanjang waktu berpikir tanpa mereset timer.
              </li>
              <li>
                <strong>Pernyataan Siap Menjawab:</strong> Ketika juru bicara tim siap memberikan jawaban lisan, tekan <span className="text-emerald-300 font-semibold">SIAP MENJAWAB</span> untuk menghentikan timer.
              </li>
              <li>
                <strong>Buka Kunci Jawaban:</strong> Tekan <span className="text-amber-300 font-semibold">PUTAR KUNCI JAWABAN</span>. Kunci dan pembahasan akan ditampilkan serta dibacakan oleh narator.
              </li>
              <li>
                <strong>Penilaian Hasil:</strong> Tekan <span className="text-emerald-400 font-bold">JAWABAN BENAR</span> (menghasilkan efek sorak kemenangan) atau <span className="text-rose-400 font-bold">JAWABAN SALAH</span> (menghasilkan efek buzzer evaluasi).
              </li>
            </ol>
          </div>

          {/* Section 3: Penggunaan pada IFP / Layar Sentuh */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
            <h3 className="font-extrabold text-emerald-300 text-sm mb-1.5 flex items-center gap-2">
              <Monitor className="w-4 h-4" />
              Optimalisasi Interactive Flat Panel (IFP) & Tablet
            </h3>
            <p>
              Semua tombol memiliki area sentuh besar (touch-target yang memadai) dengan kontras tinggi sehingga mudah dioperasikan langsung dari layar sentuh smartboard IFP di kelas atau laboratorium sekolah. Gunakan tombol <span className="text-cyan-300 font-bold">Layar Penuh</span> di pojok kanan atas untuk presentasi maksimal.
            </p>
          </div>

          {/* Section 4: Mode Remedial & Evaluasi */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
            <h3 className="font-extrabold text-amber-300 text-sm mb-1.5 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Evaluasi & Mode Remedial
            </h3>
            <p>
              Semua progres dan skor disimpan otomatis di peramban (localStorage). Jika terdapat soal yang dinilai salah, buka menu <span className="text-amber-300 font-bold">Dashboard Nilai</span> dan pilih <span className="text-rose-300 font-bold">Ulangi Soal yang Salah</span> untuk melakukan drill intensif pada materi yang masih lemah.
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs tracking-wider shadow-md transition-all cursor-pointer"
          >
            Mengerti & Siap Bertanding
          </button>
        </div>
      </div>
    </div>
  );
};
