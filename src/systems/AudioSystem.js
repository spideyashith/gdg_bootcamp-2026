/**
 * AudioSystem.js - Procedural audio synthesis using Web Audio API
 * Generates all game sounds and music without external audio files
 */
import { SFX_CONFIG, MUSIC_CONFIG, NOTE_FREQ, VOLUME_DEFAULTS } from '../config/AudioConfig.js';
import { loadSettings } from './SaveSystem.js';

export class AudioSystem {
  /**
   * @param {Phaser.Scene} scene
   */
  constructor(scene) {
    this.scene = scene;
    this.audioContext = null;
    this.masterGain = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.currentMusic = null;
    this.musicInterval = null;
    this.initialized = false;

    // Load saved volume settings
    const settings = loadSettings();
    this.musicVolume = settings.musicVolume ?? VOLUME_DEFAULTS.music;
    this.sfxVolume = settings.sfxVolume ?? VOLUME_DEFAULTS.sfx;
  }

  /**
   * Initialize the Web Audio context (must be called after user interaction)
   */
  init() {
    if (this.initialized) return;
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = VOLUME_DEFAULTS.master;
      this.masterGain.connect(this.audioContext.destination);

      this.musicGain = this.audioContext.createGain();
      this.musicGain.gain.value = this.musicVolume;
      this.musicGain.connect(this.masterGain);

      this.sfxGain = this.audioContext.createGain();
      this.sfxGain.gain.value = this.sfxVolume;
      this.sfxGain.connect(this.masterGain);

      this.initialized = true;
      console.log('[AudioSystem] Initialized');
    } catch (e) {
      console.warn('[AudioSystem] Web Audio not available:', e);
    }
  }

  /**
   * Play a sound effect
   * @param {string} sfxName - Key from SFX_CONFIG
   */
  playSFX(sfxName) {
    if (!this.initialized || !this.audioContext) return;
    const config = SFX_CONFIG[sfxName];
    if (!config) return;

    try {
      if (config.notes) {
        this._playArpeggio(config);
      } else if (config.type === 'noise') {
        this._playNoise(config);
      } else {
        this._playSweep(config);
      }
    } catch (e) {
      // Silently handle audio errors
    }
  }

  /**
   * Play a frequency sweep sound
   */
  _playSweep(config) {
    const ctx = this.audioContext;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = config.type || 'sine';
    osc.frequency.setValueAtTime(config.freqStart, now);
    osc.frequency.linearRampToValueAtTime(config.freqEnd, now + config.duration);

    gain.gain.setValueAtTime(config.volume * this.sfxVolume, now);
    gain.gain.linearRampToValueAtTime(0, now + config.duration);

    if (config.filterStart) {
      const filter = ctx.createBiquadFilter();
      filter.type = config.filterType || 'lowpass';
      filter.frequency.setValueAtTime(config.filterStart, now);
      filter.frequency.linearRampToValueAtTime(config.filterEnd || config.filterStart, now + config.duration);
      osc.connect(filter);
      filter.connect(gain);
    } else {
      osc.connect(gain);
    }

    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + config.duration);
  }

  /**
   * Play a noise-based sound effect
   */
  _playNoise(config) {
    const ctx = this.audioContext;
    const now = ctx.currentTime;
    const duration = config.loop ? 2 : config.duration;

    // Create noise buffer
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(config.volume * this.sfxVolume, now);
    if (!config.loop) {
      gain.gain.linearRampToValueAtTime(0, now + config.duration);
    }

    const filter = ctx.createBiquadFilter();
    filter.type = config.filterType || 'lowpass';
    filter.frequency.setValueAtTime(config.filterStart || 2000, now);
    if (config.filterEnd && config.filterEnd !== config.filterStart) {
      filter.frequency.linearRampToValueAtTime(config.filterEnd, now + config.duration);
    }

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    source.start(now);
    if (!config.loop) {
      source.stop(now + config.duration + 0.05);
    }

    return { source, gain };
  }

  /**
   * Play a rapid arpeggio
   */
  _playArpeggio(config) {
    const ctx = this.audioContext;
    const now = ctx.currentTime;

    config.notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = config.type || 'sine';
      osc.frequency.value = freq;
      const startTime = now + i * config.noteDuration;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(config.volume * this.sfxVolume, startTime + 0.01);
      gain.gain.linearRampToValueAtTime(0, startTime + config.noteDuration);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(startTime);
      osc.stop(startTime + config.noteDuration + 0.05);
    });
  }

  /**
   * Start playing background music
   * @param {string} musicKey - Key from MUSIC_CONFIG
   */
  playMusic(musicKey) {
    if (!this.initialized) return;
    this.stopMusic();

    const config = MUSIC_CONFIG[musicKey];
    if (!config) return;

    const beatDuration = 60 / config.bpm;
    let noteIndex = 0;

    const playBeat = () => {
      if (!this.audioContext) return;
      const ctx = this.audioContext;
      const now = ctx.currentTime;

      for (const track of config.tracks) {
        const noteKey = track.notes[noteIndex % track.notes.length];
        const freq = NOTE_FREQ[noteKey] || 220;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = track.type;
        osc.frequency.value = freq;
        filter.type = 'lowpass';
        filter.frequency.value = track.filter || 2000;

        gain.gain.setValueAtTime(track.volume * this.musicVolume, now);
        gain.gain.linearRampToValueAtTime(track.volume * this.musicVolume * 0.3, now + track.duration * 0.8);
        gain.gain.linearRampToValueAtTime(0, now + track.duration);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.musicGain);

        osc.start(now);
        osc.stop(now + track.duration + 0.05);
      }

      noteIndex++;
    };

    // Play first beat immediately
    playBeat();
    // Schedule subsequent beats
    this.musicInterval = setInterval(playBeat, beatDuration * 1000);
    this.currentMusic = musicKey;
  }

  /**
   * Stop current music
   */
  stopMusic() {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
    this.currentMusic = null;
  }

  /**
   * Set music volume
   * @param {number} vol - 0 to 1
   */
  setMusicVolume(vol) {
    this.musicVolume = vol;
    if (this.musicGain) {
      this.musicGain.gain.value = vol;
    }
  }

  /**
   * Set SFX volume
   * @param {number} vol - 0 to 1
   */
  setSFXVolume(vol) {
    this.sfxVolume = vol;
    if (this.sfxGain) {
      this.sfxGain.gain.value = vol;
    }
  }

  /**
   * Clean up audio resources
   */
  destroy() {
    this.stopMusic();
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close().catch(() => {});
    }
    this.initialized = false;
  }
}
