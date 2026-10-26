// Web Speech API Controller for The Champions Arena

export interface VoiceOption {
  voice: SpeechSynthesisVoice;
  isMale: boolean;
  isIndonesian: boolean;
  isEnglish: boolean;
  label: string;
}

export type TtsState = 'idle' | 'speaking' | 'paused' | 'error';

class SpeechService {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private voices: VoiceOption[] = [];
  private onVoicesChangedCallbacks: Array<(voices: VoiceOption[]) => void> = [];

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  }

  private loadVoices(): void {
    if (!this.synth) return;
    const rawVoices = this.synth.getVoices();
    if (!rawVoices || rawVoices.length === 0) return;

    this.voices = rawVoices.map((v) => {
      const lang = v.lang.toLowerCase();
      const name = v.name.toLowerCase();
      const isIndonesian = lang.startsWith('id') || lang === 'in' || lang.includes('indonesia');
      const isEnglish = lang.startsWith('en');

      // Gender heuristics based on standard system naming conventions
      const isMale =
        name.includes('male') ||
        name.includes('pria') ||
        name.includes('ardi') ||
        name.includes('gandi') ||
        name.includes('david') ||
        name.includes('guy') ||
        name.includes('george') ||
        name.includes('james') ||
        name.includes('daniel');

      return {
        voice: v,
        isMale,
        isIndonesian,
        isEnglish,
        label: `${v.name} (${v.lang})${isMale ? ' ♂ Pria' : ''}${isIndonesian ? ' 🇮🇩 ID' : ''}`
      };
    });

    this.onVoicesChangedCallbacks.forEach((cb) => cb(this.voices));
  }

  public onVoicesReady(cb: (voices: VoiceOption[]) => void): () => void {
    this.onVoicesChangedCallbacks.push(cb);
    if (this.voices.length > 0) {
      cb(this.voices);
    }
    return () => {
      this.onVoicesChangedCallbacks = this.onVoicesChangedCallbacks.filter((c) => c !== cb);
    };
  }

  public getVoices(): VoiceOption[] {
    return this.voices;
  }

  // Find best Indonesian voice, preferring male
  public getBestIndonesianVoice(preferredURI?: string | null): SpeechSynthesisVoice | null {
    if (this.voices.length === 0) return null;

    if (preferredURI) {
      const match = this.voices.find((v) => v.voice.voiceURI === preferredURI);
      if (match) return match.voice;
    }

    // Try finding male Indonesian
    const maleIndo = this.voices.find((v) => v.isIndonesian && v.isMale);
    if (maleIndo) return maleIndo.voice;

    // Try any Indonesian
    const anyIndo = this.voices.find((v) => v.isIndonesian);
    if (anyIndo) return anyIndo.voice;

    // Fallback to default
    return this.voices.find((v) => v.voice.default)?.voice || this.voices[0]?.voice || null;
  }

  // Find best English voice
  public getBestEnglishVoice(preferredURI?: string | null): SpeechSynthesisVoice | null {
    if (this.voices.length === 0) return null;

    if (preferredURI) {
      const match = this.voices.find((v) => v.voice.voiceURI === preferredURI);
      if (match) return match.voice;
    }

    const enVoice = this.voices.find((v) => v.isEnglish && (v.voice.lang.includes('US') || v.voice.lang.includes('GB')));
    if (enVoice) return enVoice.voice;

    const anyEn = this.voices.find((v) => v.isEnglish);
    if (anyEn) return anyEn.voice;

    return this.getBestIndonesianVoice();
  }

  public cancel(): void {
    if (this.synth) {
      this.synth.cancel();
      this.currentUtterance = null;
    }
  }

  public pause(): void {
    if (this.synth && this.synth.speaking) {
      this.synth.pause();
    }
  }

  public resume(): void {
    if (this.synth && this.synth.paused) {
      this.synth.resume();
    }
  }

  public speak(
    text: string,
    options: {
      voice?: SpeechSynthesisVoice | null;
      rate?: number;
      pitch?: number;
      onStart?: () => void;
      onEnd?: () => void;
      onError?: (err: string) => void;
    }
  ): void {
    if (!this.synth) {
      options.onError?.('Web Speech API tidak didukung oleh browser ini.');
      return;
    }

    // Always cancel previous speech to prevent overlapping utterances
    this.cancel();

    // Small delay to allow audio cancel to flush in browser
    setTimeout(() => {
      try {
        const utterance = new SpeechSynthesisUtterance(text);
        if (options.voice) {
          utterance.voice = options.voice;
          utterance.lang = options.voice.lang;
        } else {
          utterance.lang = 'id-ID';
        }

        utterance.rate = Math.max(0.5, Math.min(2.0, options.rate || 1.0));
        utterance.pitch = Math.max(0.5, Math.min(1.5, options.pitch || 1.0));

        utterance.onstart = () => {
          options.onStart?.();
        };

        utterance.onend = () => {
          this.currentUtterance = null;
          options.onEnd?.();
        };

        utterance.onerror = (e) => {
          // If canceled intentionally, ignore error
          if (e.error === 'canceled' || e.error === 'interrupted') {
            return;
          }
          console.warn('SpeechSynthesis error:', e);
          options.onError?.(`Pembacaan suara gagal (${e.error || 'unknown'}).`);
        };

        this.currentUtterance = utterance;
        this.synth?.speak(utterance);
      } catch (err) {
        options.onError?.('Gagal memutar audio narator.');
      }
    }, 50);
  }
}

export const speechService = new SpeechService();
