import React, { useState, useEffect } from 'react';
import { X, Settings, Volume2, Mic, Clock, Shuffle, Trash2, Check, RefreshCw } from 'lucide-react';
import { AppSettings } from '../types';
import { speechService, VoiceOption } from '../utils/speech';
import { soundFx } from '../utils/audio';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onResetStorage: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onResetStorage,
}) => {
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [testingVoice, setTestingVoice] = useState<boolean>(false);

  useEffect(() => {
    setVoices(speechService.getVoices());
    const unsub = speechService.onVoicesReady((v) => setVoices(v));
    return unsub;
  }, []);

  if (!isOpen) return null;

  // Filter Indonesian voices
  const indoVoices = voices.filter((v) => v.isIndonesian);
  const englishVoices = voices.filter((v) => v.isEnglish);
  const hasMaleIndo = indoVoices.some((v) => v.isMale);

  const testTTS = (voiceURI: string | null) => {
    setTestingVoice(true);
    const targetVoice = voices.find((v) => v.voice.voiceURI === voiceURI)?.voice || speechService.getBestIndonesianVoice(voiceURI);
    speechService.speak('Halo SMAS Tunas Baru Jin Seung Batam! Siap menjadi juara satu The Champions Arena!', {
      voice: targetVoice,
      rate: settings.ttsRate,
      onEnd: () => setTestingVoice(false),
      onError: () => setTestingVoice(false),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border-2 border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(6,182,212,0.3)] my-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-cyan-500 text-slate-950 shadow-md">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white font-['Chakra_Petch'] uppercase tracking-wider">
              PENGATURAN SUARA & TIMER
            </h2>
            <div className="text-xs text-cyan-300 font-semibold tracking-wide">
              Konfigurasi Sistem Web Speech API & Arena Pertandingan
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Voice Selector Indonesian */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Mic className="w-4 h-4 text-cyan-400" />
                Pilihan Suara Narator Utama (Bahasa Indonesia)
              </label>
              <button
                onClick={() => testTTS(settings.ttsVoiceURI)}
                disabled={testingVoice}
                className="text-[11px] font-bold text-amber-300 hover:text-amber-200 underline flex items-center gap-1"
              >
                {testingVoice ? 'Memutar...' : 'Uji Suara'}
              </button>
            </div>

            <select
              value={settings.ttsVoiceURI || ''}
              onChange={(e) => onUpdateSettings({ ttsVoiceURI: e.target.value || null })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-200 font-medium focus:outline-none focus:border-cyan-400"
            >
              <option value="">-- Otomatis (Prioritaskan Pria Indonesia) --</option>
              {voices.map((v) => (
                <option key={v.voice.voiceURI} value={v.voice.voiceURI}>
                  {v.label}
                </option>
              ))}
            </select>

            {!hasMaleIndo && (
              <div className="mt-2 text-[11px] text-amber-400/90 bg-amber-950/30 border border-amber-800/40 rounded-lg p-2 leading-relaxed">
                ℹ️ Browser Anda tidak menyediakan suara berlabel &quot;Pria Indonesia&quot; khusus. Sistem menggunakan suara Bahasa Indonesia standar berkualitas tinggi yang tersedia pada perangkat Anda.
              </div>
            )}
          </div>

          {/* English Voice Mode */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
            <label className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2 block">
              Pengaturan Bahasa Pembacaan Soal Bahasa Inggris
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => onUpdateSettings({ englishTtsMode: 'english' })}
                className={`p-3 rounded-xl border text-xs font-bold text-center transition-all ${
                  settings.englishTtsMode === 'english'
                    ? 'bg-cyan-950 border-cyan-400 text-cyan-300 shadow'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Gunakan Suara Bahasa Inggris (en-US / en-GB)
              </button>

              <button
                type="button"
                onClick={() => onUpdateSettings({ englishTtsMode: 'indonesia' })}
                className={`p-3 rounded-xl border text-xs font-bold text-center transition-all ${
                  settings.englishTtsMode === 'indonesia'
                    ? 'bg-cyan-950 border-cyan-400 text-cyan-300 shadow'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Gunakan Suara Bahasa Indonesia
              </button>
            </div>
          </div>

          {/* Speed Preset & Default Timer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
              <label className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2 block">
                Kecepatan Standar Narator
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[0.75, 0.9, 1.0, 1.1, 1.25, 1.5].map((speed) => (
                  <button
                    key={speed}
                    onClick={() => onUpdateSettings({ ttsRate: speed })}
                    className={`py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      settings.ttsRate === speed
                        ? 'bg-amber-400 text-slate-950 border-amber-300'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {speed}×
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
              <label className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2 block flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                Durasi Jeda Berpikir Awal
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[5, 10, 15].map((sec) => (
                  <button
                    key={sec}
                    onClick={() => onUpdateSettings({ initialThinkingSeconds: sec })}
                    className={`py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      settings.initialThinkingSeconds === sec
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {sec} Detik
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sound FX & Question Order */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                  Efek Audio Arena
                </label>
                <input
                  type="checkbox"
                  checked={settings.soundFxEnabled}
                  onChange={(e) => onUpdateSettings({ soundFxEnabled: e.target.checked })}
                  className="w-4 h-4 accent-emerald-500 cursor-pointer"
                />
              </div>
              <div className="flex items-center gap-2 mt-3">
                <span className="text-[11px] text-slate-400">Volume</span>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={settings.soundFxVolume}
                  onChange={(e) => onUpdateSettings({ soundFxVolume: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-400"
                />
                <span className="text-xs font-mono text-cyan-300 w-8 text-right">
                  {Math.round(settings.soundFxVolume * 100)}%
                </span>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Shuffle className="w-4 h-4 text-purple-400" />
                  Urutan Soal Campuran
                </label>
                <input
                  type="checkbox"
                  checked={settings.shuffleQuestions}
                  onChange={(e) => onUpdateSettings({ shuffleQuestions: e.target.checked })}
                  className="w-4 h-4 accent-purple-500 cursor-pointer"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {settings.shuffleQuestions
                  ? 'Urutan soal diacak secara dinamis saat mode campuran.'
                  : 'Urutan terstruktur 1-30 (Matematika -> Fisika -> B. Inggris -> Kimia).'}
              </p>
            </div>
          </div>

          {/* Reset Cache & Storage */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={() => {
                if (window.confirm('Reset semua data progres latihan yang tersimpan di localStorage?')) {
                  onResetStorage();
                  onClose();
                }
              }}
              className="flex items-center gap-1.5 text-xs font-bold text-rose-400 hover:text-rose-300 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Hapus Data Riwayat (LocalStorage)
            </button>

            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs tracking-wider shadow-md transition-all cursor-pointer"
            >
              Simpan & Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
