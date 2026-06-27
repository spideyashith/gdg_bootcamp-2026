/**
 * Controls.js - Input key mapping and remapping for Project Eclipse
 * Supports both Arrow keys and WASD, with remapping capability
 */

// Default key bindings
const DEFAULT_BINDINGS = {
  moveLeft:    ['LEFT', 'A'],
  moveRight:   ['RIGHT', 'D'],
  jump:        ['UP', 'W'],
  crouch:      ['DOWN', 'S'],
  dash:        ['SHIFT'],
  attack:      ['SPACE'],
  interact:    ['E'],
  inventory:   ['I'],
  questLog:    ['Q'],
  pause:       ['ESC'],
  ultimate:    ['R']
};

/** Current active bindings (modified by remapping) */
let currentBindings = JSON.parse(JSON.stringify(DEFAULT_BINDINGS));

/**
 * Load saved key bindings from localStorage
 */
export function loadBindings() {
  try {
    const saved = localStorage.getItem('project_eclipse_keybindings');
    if (saved) {
      currentBindings = JSON.parse(saved);
    }
  } catch (e) {
    console.warn('Failed to load key bindings, using defaults:', e);
    currentBindings = JSON.parse(JSON.stringify(DEFAULT_BINDINGS));
  }
}

/**
 * Save current key bindings to localStorage
 */
export function saveBindings() {
  try {
    localStorage.setItem('project_eclipse_keybindings', JSON.stringify(currentBindings));
  } catch (e) {
    console.warn('Failed to save key bindings:', e);
  }
}

/**
 * Reset key bindings to defaults
 */
export function resetBindings() {
  currentBindings = JSON.parse(JSON.stringify(DEFAULT_BINDINGS));
  saveBindings();
}

/**
 * Get all key codes for an action
 * @param {string} action - Action name (e.g. 'moveLeft')
 * @returns {string[]} Array of Phaser key code strings
 */
export function getKeys(action) {
  return currentBindings[action] || [];
}

/**
 * Remap a key binding
 * @param {string} action - Action name
 * @param {number} index - Index in the binding array (0 = primary, 1 = alternate)
 * @param {string} newKey - New Phaser key string
 */
export function remapKey(action, index, newKey) {
  if (currentBindings[action]) {
    currentBindings[action][index] = newKey;
    saveBindings();
  }
}

/**
 * Get all current bindings (for settings UI)
 * @returns {Object}
 */
export function getAllBindings() {
  return { ...currentBindings };
}

/**
 * Get the default bindings
 * @returns {Object}
 */
export function getDefaultBindings() {
  return JSON.parse(JSON.stringify(DEFAULT_BINDINGS));
}

/**
 * Set up cursor keys and action keys for a Phaser scene
 * @param {Phaser.Scene} scene - The active scene
 * @returns {Object} Keys object with all bound inputs
 */
export function setupInputs(scene) {
  const keys = {};
  for (const [action, keyCodes] of Object.entries(currentBindings)) {
    keys[action] = keyCodes.map(code => {
      return scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes[code]);
    });
  }
  return keys;
}

/**
 * Check if any key for an action is currently down
 * @param {Object} keys - Keys object from setupInputs
 * @param {string} action - Action name
 * @returns {boolean}
 */
export function isActionDown(keys, action) {
  if (!keys[action]) return false;
  return keys[action].some(key => key.isDown);
}

/**
 * Check if any key for an action was just pressed this frame
 * @param {Object} keys - Keys object from setupInputs
 * @param {string} action - Action name
 * @returns {boolean}
 */
export function isActionJustDown(keys, action) {
  if (!keys[action]) return false;
  return keys[action].some(key => Phaser.Input.Keyboard.JustDown(key));
}

// Load bindings on module init
loadBindings();
