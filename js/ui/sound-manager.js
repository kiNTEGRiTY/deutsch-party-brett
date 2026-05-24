const STORAGE_KEY = 'dpb_sound_enabled';

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

export class SoundManager {
  static context = null;
  static masterGain = null;
  static dryGain = null;
  static reverbGain = null;
  static compressor = null;
  static convolver = null;
  static enabled = true;
  static installed = false;
  static userGesture = false;
  static resumePending = false;
  static noiseBuffer = null;
  static impulseBuffer = null;
  static lastUiClickAt = 0;

  static installGestureUnlock() {
    if (SoundManager.installed) {
      return;
    }

    SoundManager.installed = true;
    SoundManager.enabled = SoundManager._readEnabledState();

    const unlock = () => {
      SoundManager.userGesture = true;
      SoundManager.unlock();
    };

    window.addEventListener('pointerdown', unlock, { passive: true });
    window.addEventListener('keydown', unlock, { passive: true });

    document.addEventListener('click', (event) => {
      const button = event.target.closest('button, .btn, [role="button"]');
      if (!button) {
        return;
      }

      const now = performance.now();
      if (now - SoundManager.lastUiClickAt < 90) {
        return;
      }

      SoundManager.lastUiClickAt = now;
      SoundManager.play('uiClick', { intensity: 0.55 });
    }, true);
  }

  static setEnabled(enabled) {
    SoundManager.enabled = Boolean(enabled);
    localStorage.setItem(STORAGE_KEY, String(SoundManager.enabled));
    if (SoundManager.masterGain) {
      SoundManager.masterGain.gain.value = SoundManager.enabled ? 0.28 : 0;
    }
  }

  static toggle() {
    SoundManager.setEnabled(!SoundManager.enabled);
    SoundManager.play(SoundManager.enabled ? 'success' : 'paperMute');
    return SoundManager.enabled;
  }

  static unlock() {
    const context = SoundManager._ensureContext();
    if (!context) {
      return null;
    }

    if (context.state === 'suspended') {
      const hasTransientActivation = navigator.userActivation?.isActive
        || (!navigator.userActivation && SoundManager.userGesture);
      if (!hasTransientActivation || SoundManager.resumePending) {
        return null;
      }
      SoundManager.resumePending = true;
      context.resume()
        .catch(() => {})
        .finally(() => {
          SoundManager.resumePending = false;
        });
      return context.state === 'running' ? context : null;
    }

    return context;
  }

  static play(type, options = {}) {
    if (!SoundManager.enabled) {
      return;
    }

    const context = SoundManager.unlock();
    if (!context || context.state === 'suspended') {
      return;
    }

    const now = context.currentTime + 0.01;
    const intensity = clamp(options.intensity ?? 1, 0.2, 1.8);

    switch (type) {
      case 'uiClick':
        SoundManager._paperTap(now, { gain: 0.045 * intensity, pitch: randomBetween(780, 930) });
        SoundManager._pluck(now + 0.006, 1220, { gain: 0.018 * intensity, pan: 0.12 });
        break;
      case 'menuOpen':
      case 'launch':
        SoundManager._brush(now, { duration: 0.36, gain: 0.026, pan: -0.2 });
        SoundManager._jingle(now + 0.02, [392, 523, 659, 784], {
          gain: 0.038,
          step: 0.075,
          instrument: 'kalimba'
        });
        break;
      case 'gameStart':
        SoundManager._jingle(now, [330, 392, 494, 659], {
          gain: 0.042,
          step: 0.085,
          instrument: 'marimba'
        });
        SoundManager._brush(now + 0.07, { duration: 0.26, gain: 0.018, pan: 0.28 });
        break;
      case 'diceRoll':
        SoundManager._diceRattle(now, intensity);
        break;
      case 'diceLand':
        SoundManager._woodThunk(now, { gain: 0.085 * intensity, pitch: 128 });
        SoundManager._pluck(now + 0.055, 523 + randomBetween(-8, 8), { gain: 0.032, pan: 0.18 });
        break;
      case 'moveStep':
        SoundManager._pluck(now, 520 + randomBetween(-35, 42), {
          gain: 0.027 * intensity,
          pan: randomBetween(-0.3, 0.3)
        });
        break;
      case 'fieldLand':
        SoundManager._paperTap(now, { gain: 0.052 * intensity, pitch: 620 });
        SoundManager._bell(now + 0.04, 880, { gain: 0.024, pan: 0.16 });
        break;
      case 'woodBlock':
        SoundManager._woodThunk(now, { gain: 0.075 * intensity, pitch: 150 + randomBetween(-12, 18) });
        SoundManager._paperTap(now + 0.015, { gain: 0.018, pitch: 760 });
        break;
      case 'stamp':
        SoundManager._woodThunk(now, { gain: 0.08 * intensity, pitch: 118 });
        SoundManager._brush(now + 0.025, { duration: 0.16, gain: 0.014, lowpassEnd: 620 });
        break;
      case 'pageFlip':
        SoundManager._brush(now, {
          duration: 0.24,
          gain: 0.022 * intensity,
          highpass: 700,
          lowpassStart: 3600,
          lowpassEnd: 1300,
          pan: randomBetween(-0.18, 0.18)
        });
        break;
      case 'paintBloom':
        SoundManager._paperTap(now, { gain: 0.032 * intensity, pitch: 720 });
        SoundManager._gliss(now + 0.018, 520, 880, { duration: 0.2, gain: 0.018 });
        SoundManager._sparkle(now + 0.08, 3);
        break;
      case 'portal':
        SoundManager._brush(now, { duration: 0.48, gain: 0.025, highpass: 900, pan: -0.18 });
        SoundManager._gliss(now + 0.03, 420, 1040, { duration: 0.36, gain: 0.026 });
        break;
      case 'reward':
        SoundManager._jingle(now, [523, 659, 784, 1047], {
          gain: 0.04,
          step: 0.078,
          instrument: 'kalimba'
        });
        SoundManager._sparkle(now + 0.08, 4);
        break;
      case 'success':
        SoundManager._jingle(now, [392, 523, 659, 784, 988], {
          gain: 0.046,
          step: 0.07,
          instrument: 'marimba'
        });
        SoundManager._sparkle(now + 0.12, 5);
        break;
      case 'error':
        SoundManager._woodThunk(now, { gain: 0.07 * intensity, pitch: 96 });
        SoundManager._gliss(now + 0.02, 310, 210, { duration: 0.22, gain: 0.025, type: 'triangle' });
        SoundManager._brush(now + 0.04, { duration: 0.2, gain: 0.014, lowpassEnd: 740 });
        break;
      case 'failSoft':
        SoundManager._paperTap(now, { gain: 0.042, pitch: 420 });
        SoundManager._bell(now + 0.035, 330, { gain: 0.016 });
        break;
      case 'whoosh':
        SoundManager._brush(now, {
          duration: 0.34,
          gain: 0.026 * intensity,
          highpass: 680,
          lowpassStart: 5200,
          lowpassEnd: 980,
          pan: options.pan ?? 0
        });
        break;
      case 'pop':
        SoundManager._pluck(now, 780 + randomBetween(-22, 18), { gain: 0.035 * intensity });
        SoundManager._paperTap(now + 0.014, { gain: 0.025, pitch: 1080 });
        break;
      case 'tick':
      case 'countdown':
        SoundManager._paperTap(now, { gain: 0.03 * intensity, pitch: 1040, duration: 0.035 });
        break;
      case 'finish':
        SoundManager._brush(now, { duration: 0.52, gain: 0.028, pan: -0.26 });
        SoundManager._jingle(now + 0.04, [392, 494, 587, 784, 988, 1175], {
          gain: 0.052,
          step: 0.09,
          instrument: 'marimba'
        });
        SoundManager._sparkle(now + 0.34, 8);
        break;
      case 'paperMute':
        SoundManager._brush(now, { duration: 0.18, gain: 0.018, lowpassEnd: 520 });
        break;
      default:
        SoundManager._pluck(now, 620, { gain: 0.025 });
    }
  }

  static _ensureContext() {
    if (SoundManager.context) {
      return SoundManager.context;
    }

    const AudioCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtor) {
      return null;
    }

    const context = new AudioCtor();
    SoundManager.context = context;

    SoundManager.masterGain = context.createGain();
    SoundManager.masterGain.gain.value = SoundManager.enabled ? 0.28 : 0;

    SoundManager.dryGain = context.createGain();
    SoundManager.dryGain.gain.value = 0.82;

    SoundManager.reverbGain = context.createGain();
    SoundManager.reverbGain.gain.value = 0.18;

    SoundManager.compressor = context.createDynamicsCompressor();
    SoundManager.compressor.threshold.value = -20;
    SoundManager.compressor.knee.value = 20;
    SoundManager.compressor.ratio.value = 3.2;
    SoundManager.compressor.attack.value = 0.008;
    SoundManager.compressor.release.value = 0.16;

    SoundManager.noiseBuffer = SoundManager._createNoiseBuffer(1.2);
    SoundManager.impulseBuffer = SoundManager._createImpulseBuffer(1.4);

    SoundManager.convolver = context.createConvolver();
    SoundManager.convolver.buffer = SoundManager.impulseBuffer;

    SoundManager.dryGain.connect(SoundManager.compressor);
    SoundManager.convolver.connect(SoundManager.reverbGain);
    SoundManager.reverbGain.connect(SoundManager.compressor);
    SoundManager.compressor.connect(SoundManager.masterGain);
    SoundManager.masterGain.connect(context.destination);

    return context;
  }

  static _output({ wet = true } = {}) {
    return {
      dry: SoundManager.dryGain,
      wet: wet && SoundManager.convolver ? SoundManager.convolver : null
    };
  }

  static _connectWithSend(source, { wet = true } = {}) {
    const output = SoundManager._output({ wet });
    source.connect(output.dry);
    if (output.wet) {
      source.connect(output.wet);
    }
  }

  static _tone(startTime, frequency, options = {}) {
    const context = SoundManager.context;
    if (!context) {
      return;
    }

    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    const filter = context.createBiquadFilter();
    const panNode = context.createStereoPanner ? context.createStereoPanner() : null;

    const duration = options.duration || 0.18;
    const attack = options.attack || 0.008;
    const release = options.release || Math.min(0.22, duration * 1.2);
    const peakGain = clamp(options.gain || 0.03, 0, 0.16);
    const sustain = clamp(options.sustain ?? 0.28, 0.03, 0.9);

    oscillator.type = options.type || 'triangle';
    oscillator.frequency.setValueAtTime(frequency, startTime);
    if (options.endFrequency) {
      oscillator.frequency.exponentialRampToValueAtTime(
        Math.max(1, options.endFrequency),
        startTime + duration
      );
    }
    oscillator.detune.setValueAtTime(options.detune || 0, startTime);

    filter.type = options.filterType || 'lowpass';
    filter.frequency.setValueAtTime(options.lowpass || 4200, startTime);
    if (options.lowpassEnd) {
      filter.frequency.exponentialRampToValueAtTime(options.lowpassEnd, startTime + duration);
    }
    filter.Q.value = options.q || 0.8;

    gainNode.gain.setValueAtTime(0.0001, startTime);
    gainNode.gain.exponentialRampToValueAtTime(peakGain, startTime + attack);
    gainNode.gain.exponentialRampToValueAtTime(Math.max(0.0008, peakGain * sustain), startTime + duration * 0.45);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration + release);

    oscillator.connect(filter);
    filter.connect(gainNode);
    if (panNode) {
      panNode.pan.setValueAtTime(options.pan || 0, startTime);
      gainNode.connect(panNode);
      SoundManager._connectWithSend(panNode, { wet: options.wet !== false });
    } else {
      SoundManager._connectWithSend(gainNode, { wet: options.wet !== false });
    }

    oscillator.start(startTime);
    oscillator.stop(startTime + duration + release + 0.04);
  }

  static _pluck(startTime, frequency, options = {}) {
    SoundManager._tone(startTime, frequency, {
      type: 'triangle',
      duration: options.duration || 0.12,
      attack: 0.004,
      release: options.release || 0.16,
      sustain: 0.12,
      lowpass: options.lowpass || 3600,
      gain: options.gain || 0.03,
      pan: options.pan || 0
    });
    SoundManager._tone(startTime + 0.002, frequency * 2.01, {
      type: 'sine',
      duration: options.duration || 0.08,
      attack: 0.002,
      release: 0.09,
      sustain: 0.05,
      lowpass: 5200,
      gain: (options.gain || 0.03) * 0.28,
      pan: options.pan || 0
    });
  }

  static _bell(startTime, frequency, options = {}) {
    SoundManager._tone(startTime, frequency, {
      type: 'sine',
      duration: options.duration || 0.34,
      attack: 0.006,
      release: 0.42,
      sustain: 0.18,
      lowpass: 7000,
      gain: options.gain || 0.026,
      pan: options.pan || 0
    });
    SoundManager._tone(startTime + 0.004, frequency * 2.38, {
      type: 'sine',
      duration: 0.22,
      attack: 0.004,
      release: 0.24,
      sustain: 0.08,
      lowpass: 7200,
      gain: (options.gain || 0.026) * 0.34,
      pan: options.pan || 0
    });
  }

  static _paperTap(startTime, options = {}) {
    SoundManager._noise(startTime, {
      duration: options.duration || 0.055,
      gain: options.gain || 0.036,
      highpass: options.pitch || 760,
      lowpassStart: (options.pitch || 760) * 2.8,
      lowpassEnd: (options.pitch || 760) * 1.2,
      pan: options.pan || 0,
      wet: false
    });
  }

  static _woodThunk(startTime, options = {}) {
    SoundManager._tone(startTime, options.pitch || 120, {
      type: 'sine',
      duration: 0.07,
      attack: 0.003,
      release: 0.12,
      sustain: 0.08,
      lowpass: 520,
      gain: options.gain || 0.07,
      wet: false
    });
    SoundManager._noise(startTime + 0.006, {
      duration: 0.09,
      gain: (options.gain || 0.07) * 0.35,
      highpass: 120,
      lowpassStart: 880,
      lowpassEnd: 420,
      wet: false
    });
  }

  static _brush(startTime, options = {}) {
    SoundManager._noise(startTime, {
      duration: options.duration || 0.28,
      gain: options.gain || 0.02,
      highpass: options.highpass || 520,
      lowpassStart: options.lowpassStart || 4800,
      lowpassEnd: options.lowpassEnd || 1400,
      pan: options.pan || 0,
      wet: true
    });
  }

  static _noise(startTime, options = {}) {
    const context = SoundManager.context;
    if (!context || !SoundManager.noiseBuffer) {
      return;
    }

    const source = context.createBufferSource();
    const gainNode = context.createGain();
    const highpass = context.createBiquadFilter();
    const lowpass = context.createBiquadFilter();
    const panNode = context.createStereoPanner ? context.createStereoPanner() : null;

    source.buffer = SoundManager.noiseBuffer;
    source.playbackRate.setValueAtTime(options.playbackRate || randomBetween(0.86, 1.12), startTime);

    highpass.type = 'highpass';
    highpass.frequency.setValueAtTime(options.highpass || 600, startTime);

    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(options.lowpassStart || 3600, startTime);
    lowpass.frequency.exponentialRampToValueAtTime(options.lowpassEnd || 1200, startTime + (options.duration || 0.2));

    const duration = options.duration || 0.2;
    const peakGain = clamp(options.gain || 0.016, 0, 0.09);

    gainNode.gain.setValueAtTime(0.0001, startTime);
    gainNode.gain.exponentialRampToValueAtTime(peakGain, startTime + 0.008);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    source.connect(highpass);
    highpass.connect(lowpass);
    lowpass.connect(gainNode);

    if (panNode) {
      panNode.pan.setValueAtTime(options.pan || 0, startTime);
      gainNode.connect(panNode);
      SoundManager._connectWithSend(panNode, { wet: options.wet !== false });
    } else {
      SoundManager._connectWithSend(gainNode, { wet: options.wet !== false });
    }

    source.start(startTime);
    source.stop(startTime + duration + 0.04);
  }

  static _jingle(startTime, notes, options = {}) {
    const step = options.step || 0.08;
    notes.forEach((note, index) => {
      const time = startTime + index * step;
      if (options.instrument === 'marimba') {
        SoundManager._pluck(time, note, {
          gain: (options.gain || 0.04) * (1 - index * 0.035),
          pan: -0.22 + index * 0.08,
          lowpass: 3000
        });
        return;
      }

      SoundManager._bell(time, note, {
        gain: (options.gain || 0.035) * (1 - index * 0.04),
        pan: -0.18 + index * 0.07,
        duration: 0.22
      });
    });
  }

  static _sparkle(startTime, count = 4) {
    for (let index = 0; index < count; index += 1) {
      SoundManager._bell(startTime + index * 0.045, randomBetween(980, 1760), {
        gain: 0.01 + index * 0.001,
        duration: 0.14,
        pan: randomBetween(-0.55, 0.55)
      });
    }
  }

  static _gliss(startTime, from, to, options = {}) {
    SoundManager._tone(startTime, from, {
      type: options.type || 'sine',
      endFrequency: to,
      duration: options.duration || 0.3,
      attack: 0.01,
      release: 0.18,
      sustain: 0.2,
      lowpass: 3800,
      lowpassEnd: 1800,
      gain: options.gain || 0.024
    });
  }

  static _diceRattle(startTime, intensity = 1) {
    for (let index = 0; index < 7; index += 1) {
      const time = startTime + index * 0.038;
      SoundManager._woodThunk(time, {
        gain: (0.038 + Math.random() * 0.025) * intensity,
        pitch: randomBetween(110, 180)
      });
      SoundManager._paperTap(time + 0.008, {
        gain: 0.02 * intensity,
        pitch: randomBetween(680, 1280),
        pan: randomBetween(-0.45, 0.45)
      });
    }
    SoundManager._brush(startTime, { duration: 0.28, gain: 0.012 * intensity, lowpassEnd: 820 });
  }

  static _createNoiseBuffer(seconds = 0.7) {
    const context = SoundManager.context;
    if (!context) {
      return null;
    }

    const length = Math.floor(context.sampleRate * seconds);
    const buffer = context.createBuffer(1, length, context.sampleRate);
    const channel = buffer.getChannelData(0);

    for (let i = 0; i < length; i += 1) {
      const decay = 1 - i / length;
      channel[i] = (Math.random() * 2 - 1) * Math.pow(decay, 1.7);
    }

    return buffer;
  }

  static _createImpulseBuffer(seconds = 1.2) {
    const context = SoundManager.context;
    if (!context) {
      return null;
    }

    const length = Math.floor(context.sampleRate * seconds);
    const buffer = context.createBuffer(2, length, context.sampleRate);

    for (let channelIndex = 0; channelIndex < 2; channelIndex += 1) {
      const channel = buffer.getChannelData(channelIndex);
      for (let i = 0; i < length; i += 1) {
        const decay = Math.pow(1 - i / length, 2.2);
        channel[i] = (Math.random() * 2 - 1) * decay * 0.42;
      }
    }

    return buffer;
  }

  static _readEnabledState() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored === null ? true : stored !== 'false';
    } catch {
      return true;
    }
  }
}
