/**
 * GameConfig.js - Phaser game configuration for Project Eclipse
 */
import { GAME_WIDTH, GAME_HEIGHT, GRAVITY, SCENES } from '../utils/Constants.js';
import { BootScene } from '../scenes/BootScene.js';
import { MainMenuScene } from '../scenes/MainMenuScene.js';
import { IntroScene } from '../scenes/IntroScene.js';
import { GameScene } from '../scenes/GameScene.js';
import { PauseScene } from '../scenes/PauseScene.js';
import { SettingsScene } from '../scenes/SettingsScene.js';
import { GameOverScene } from '../scenes/GameOverScene.js';
import { VictoryScene } from '../scenes/VictoryScene.js';
import { CreditsScene } from '../scenes/CreditsScene.js';

/**
 * Creates the Phaser game configuration object
 * @returns {Phaser.Types.Core.GameConfig}
 */
export function createGameConfig() {
  return {
    type: Phaser.AUTO,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    parent: 'game-container',
    backgroundColor: '#0a0a1a',
    pixelArt: true,
    roundPixels: true,
    antialias: false,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      min: { width: 640, height: 360 },
      max: { width: 1920, height: 1080 }
    },
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: GRAVITY },
        debug: false,
        tileBias: 16
      }
    },
    scene: [
      BootScene,
      MainMenuScene,
      IntroScene,
      GameScene,
      PauseScene,
      SettingsScene,
      GameOverScene,
      VictoryScene,
      CreditsScene
    ],
    input: {
      keyboard: true,
      mouse: true,
      touch: true
    },
    render: {
      pixelArt: true,
      transparent: false
    }
  };
}
