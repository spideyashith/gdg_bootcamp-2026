/**
 * SaveSystem.js - localStorage-based save/load system for Project Eclipse
 * Automatically saves progress and supports continue functionality
 */
import { SAVE_KEY, PLAYER_MAX_HEALTH, PLAYER_MAX_ENERGY } from '../utils/Constants.js';

/**
 * Default save data structure
 */
function getDefaultSaveData() {
  return {
    version: 1,
    timestamp: Date.now(),
    player: {
      health: PLAYER_MAX_HEALTH,
      energy: PLAYER_MAX_ENERGY,
      level: 1,
      xp: 0,
      coins: 0,
      codeFragments: 0,
      upgradeChips: 0
    },
    abilities: {
      dash: true,
      doubleJump: false,
      energyShield: false,
      lightningSlash: false,
      ultimate: false
    },
    inventory: [],
    currentLevel: 0,
    questsCompleted: [],
    questsActive: [],
    settings: {
      musicVolume: 0.5,
      sfxVolume: 0.8,
      fullscreen: false
    }
  };
}

/**
 * Save game state to localStorage
 * @param {Object} gameState - Current game state to save
 * @returns {boolean} Success status
 */
export function saveGame(gameState) {
  try {
    const saveData = {
      ...getDefaultSaveData(),
      ...gameState,
      timestamp: Date.now()
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
    console.log('[SaveSystem] Game saved successfully');
    return true;
  } catch (e) {
    console.error('[SaveSystem] Failed to save game:', e);
    return false;
  }
}

/**
 * Load game state from localStorage
 * @returns {Object|null} Saved game state or null if no save exists
 */
export function loadGame() {
  try {
    const data = localStorage.getItem(SAVE_KEY);
    if (!data) {
      console.log('[SaveSystem] No save data found');
      return null;
    }
    const saveData = JSON.parse(data);
    console.log('[SaveSystem] Game loaded successfully, saved at:', new Date(saveData.timestamp).toLocaleString());
    return saveData;
  } catch (e) {
    console.error('[SaveSystem] Failed to load game:', e);
    return null;
  }
}

/**
 * Check if a save file exists
 * @returns {boolean}
 */
export function hasSaveData() {
  try {
    return localStorage.getItem(SAVE_KEY) !== null;
  } catch (e) {
    return false;
  }
}

/**
 * Delete save data
 * @returns {boolean} Success status
 */
export function deleteSave() {
  try {
    localStorage.removeItem(SAVE_KEY);
    console.log('[SaveSystem] Save data deleted');
    return true;
  } catch (e) {
    console.error('[SaveSystem] Failed to delete save:', e);
    return false;
  }
}

/**
 * Auto-save the current game state (called on checkpoints, level transitions)
 * @param {Phaser.Scene} scene - Active game scene
 */
export function autoSave(scene) {
  if (!scene || !scene.player) return;

  const state = {
    player: {
      health: scene.player.health,
      energy: scene.player.energy,
      level: scene.player.playerLevel,
      xp: scene.player.xp,
      coins: scene.player.coins,
      codeFragments: scene.player.codeFragments,
      upgradeChips: scene.player.upgradeChips
    },
    abilities: { ...scene.player.abilities },
    inventory: scene.inventorySystem ? scene.inventorySystem.getItems() : [],
    currentLevel: scene.currentLevelIndex || 0,
    questsCompleted: scene.questSystem ? scene.questSystem.getCompletedIds() : [],
    questsActive: scene.questSystem ? scene.questSystem.getActiveIds() : [],
    settings: {
      musicVolume: scene.audioSystem ? scene.audioSystem.musicVolume : 0.5,
      sfxVolume: scene.audioSystem ? scene.audioSystem.sfxVolume : 0.8,
      fullscreen: scene.scale ? scene.scale.isFullscreen : false
    }
  };

  saveGame(state);
}

/**
 * Save just the settings portion
 * @param {Object} settings
 */
export function saveSettings(settings) {
  try {
    const existing = loadGame() || getDefaultSaveData();
    existing.settings = { ...existing.settings, ...settings };
    localStorage.setItem(SAVE_KEY, JSON.stringify(existing));
  } catch (e) {
    console.error('[SaveSystem] Failed to save settings:', e);
  }
}

/**
 * Load settings from save
 * @returns {Object} Settings object
 */
export function loadSettings() {
  const data = loadGame();
  return data ? data.settings : getDefaultSaveData().settings;
}

export { getDefaultSaveData };
