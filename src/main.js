/**
 * main.js - Entry point for Project Eclipse
 * Initializes the Phaser game with all scenes and configuration
 */
import Phaser from 'phaser';
import { createGameConfig } from './config/GameConfig.js';

// Initialize the game
const config = createGameConfig();
const game = new Phaser.Game(config);

// Expose game instance globally for testing and debugging
window.__GAME__ = game;
window.__GAME_STATE__ = {
  scene: 'BootScene',
  ready: false,
  player: null,
  playerHealth: 100,
  playerAlive: true,
  enemyCount: 0,
  paused: false,
  level: 0
};

// Handle window resize
window.addEventListener('resize', () => {
  game.scale.refresh();
});

// Prevent context menu on right-click (for game controls)
document.addEventListener('contextmenu', (e) => {
  e.preventDefault();
});

console.log('[Project Eclipse] Game initialized');
