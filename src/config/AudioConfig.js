/**
 * AudioConfig.js - Audio synthesis configurations for Project Eclipse
 * Defines parameters for procedurally generated sounds using Web Audio API
 */

/**
 * Music configurations - each defines an oscillator pattern
 * for procedural music generation
 */
export const MUSIC_CONFIG = {
  menu: {
    name: 'Menu Ambience',
    bpm: 70,
    key: 'C',
    // Slow ambient pad with reverb
    tracks: [
      { type: 'sawtooth', notes: ['C3', 'E3', 'G3', 'B3'], duration: 2.0, volume: 0.08, filter: 800 },
      { type: 'sine', notes: ['C4', 'G4', 'E4', 'C5'], duration: 1.5, volume: 0.05, filter: 2000 },
      { type: 'triangle', notes: ['C2'], duration: 4.0, volume: 0.06, filter: 400 }
    ]
  },
  battle: {
    name: 'Battle Theme',
    bpm: 140,
    key: 'Am',
    tracks: [
      { type: 'square', notes: ['A3', 'C4', 'E4', 'A4', 'E4', 'C4'], duration: 0.25, volume: 0.06, filter: 3000 },
      { type: 'sawtooth', notes: ['A2', 'A2', 'E3', 'E3'], duration: 0.5, volume: 0.08, filter: 1500 },
      { type: 'triangle', notes: ['A1'], duration: 1.0, volume: 0.1, filter: 600 }
    ]
  },
  boss: {
    name: 'Boss Battle',
    bpm: 160,
    key: 'Dm',
    tracks: [
      { type: 'sawtooth', notes: ['D3', 'F3', 'A3', 'D4', 'C4', 'A3'], duration: 0.2, volume: 0.08, filter: 4000 },
      { type: 'square', notes: ['D2', 'D2', 'A2', 'D2', 'F2', 'D2'], duration: 0.25, volume: 0.1, filter: 2000 },
      { type: 'sawtooth', notes: ['D1', 'D1'], duration: 1.0, volume: 0.12, filter: 500 }
    ]
  }
};

/**
 * Sound effect configurations for synthesis
 */
export const SFX_CONFIG = {
  swordSlash: {
    type: 'noise',
    duration: 0.15,
    volume: 0.3,
    filterStart: 4000,
    filterEnd: 800,
    filterType: 'bandpass'
  },
  dash: {
    type: 'noise',
    duration: 0.2,
    volume: 0.2,
    filterStart: 2000,
    filterEnd: 500,
    filterType: 'bandpass'
  },
  jump: {
    type: 'sine',
    freqStart: 300,
    freqEnd: 600,
    duration: 0.12,
    volume: 0.15
  },
  hurt: {
    type: 'square',
    freqStart: 400,
    freqEnd: 100,
    duration: 0.2,
    volume: 0.2
  },
  explosion: {
    type: 'noise',
    duration: 0.5,
    volume: 0.4,
    filterStart: 1000,
    filterEnd: 100,
    filterType: 'lowpass'
  },
  pickup: {
    type: 'sine',
    notes: [523, 659, 784], // C5, E5, G5 rapid arpeggio
    noteDuration: 0.06,
    volume: 0.2
  },
  buttonClick: {
    type: 'sine',
    freqStart: 800,
    freqEnd: 600,
    duration: 0.05,
    volume: 0.15
  },
  projectile: {
    type: 'sawtooth',
    freqStart: 600,
    freqEnd: 200,
    duration: 0.3,
    volume: 0.15,
    filterStart: 3000,
    filterEnd: 500
  },
  enemyDeath: {
    type: 'noise',
    duration: 0.3,
    volume: 0.25,
    filterStart: 3000,
    filterEnd: 200,
    filterType: 'lowpass'
  },
  levelUp: {
    type: 'sine',
    notes: [523, 659, 784, 1047], // C5, E5, G5, C6
    noteDuration: 0.12,
    volume: 0.25
  },
  shieldActivate: {
    type: 'sine',
    freqStart: 200,
    freqEnd: 1200,
    duration: 0.3,
    volume: 0.2
  },
  rain: {
    type: 'noise',
    duration: 5.0,
    volume: 0.04,
    filterStart: 8000,
    filterEnd: 8000,
    filterType: 'highpass',
    loop: true
  },
  footstep: {
    type: 'noise',
    duration: 0.05,
    volume: 0.08,
    filterStart: 2000,
    filterEnd: 800,
    filterType: 'bandpass'
  },
  ultimate: {
    type: 'sawtooth',
    freqStart: 100,
    freqEnd: 2000,
    duration: 0.8,
    volume: 0.3,
    filterStart: 500,
    filterEnd: 8000
  }
};

/**
 * Note frequency lookup table (in Hz)
 */
export const NOTE_FREQ = {
  'C1': 32.70, 'D1': 36.71, 'E1': 41.20, 'F1': 43.65, 'G1': 49.00, 'A1': 55.00, 'B1': 61.74,
  'C2': 65.41, 'D2': 73.42, 'E2': 82.41, 'F2': 87.31, 'G2': 98.00, 'A2': 110.0, 'B2': 123.5,
  'C3': 130.8, 'D3': 146.8, 'E3': 164.8, 'F3': 174.6, 'G3': 196.0, 'A3': 220.0, 'B3': 246.9,
  'C4': 261.6, 'D4': 293.7, 'E4': 329.6, 'F4': 349.2, 'G4': 392.0, 'A4': 440.0, 'B4': 493.9,
  'C5': 523.3, 'D5': 587.3, 'E5': 659.3, 'F5': 698.5, 'G5': 784.0, 'A5': 880.0, 'B5': 987.8
};

/**
 * Volume settings defaults
 */
export const VOLUME_DEFAULTS = {
  master: 0.7,
  music: 0.5,
  sfx: 0.8,
  ambient: 0.3
};
