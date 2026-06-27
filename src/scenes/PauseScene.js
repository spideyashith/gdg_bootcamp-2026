/**
 * PauseScene.js - Pause menu overlay
 */
import { SCENES, COLORS, GAME_WIDTH, GAME_HEIGHT, DEPTH } from '../utils/Constants.js';
import { autoSave } from '../systems/SaveSystem.js';

export class PauseScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.PAUSE });
  }

  init(data) {
    this.gameScene = data.gameScene;
  }

  create() {
    // Semi-transparent overlay
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7)
      .setDepth(0);

    // Title
    this.add.text(GAME_WIDTH / 2, 180, 'PAUSED', {
      fontSize: '36px', fontFamily: 'monospace', color: COLORS.TEXT_ACCENT, fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(1);

    // Buttons
    const buttons = [
      { text: 'RESUME', action: () => this.resumeGame() },
      { text: 'SAVE GAME', action: () => this.saveGame() },
      { text: 'SETTINGS', action: () => this.openSettings() },
      { text: 'MAIN MENU', action: () => this.mainMenu() }
    ];

    buttons.forEach((btn, i) => {
      const y = 280 + i * 55;
      const bg = this.add.rectangle(GAME_WIDTH / 2, y, 240, 40, 0x1a1a3a, 0.9)
        .setDepth(1).setStrokeStyle(1, COLORS.NEON_BLUE, 0.4)
        .setInteractive({ useHandCursor: true });

      const text = this.add.text(GAME_WIDTH / 2, y, btn.text, {
        fontSize: '15px', fontFamily: 'monospace', color: COLORS.TEXT_PRIMARY, fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(2);

      bg.on('pointerover', () => {
        bg.setFillStyle(0x2a2a5a);
        bg.setStrokeStyle(2, COLORS.NEON_BLUE, 0.8);
        text.setColor(COLORS.TEXT_ACCENT);
      });
      bg.on('pointerout', () => {
        bg.setFillStyle(0x1a1a3a, 0.9);
        bg.setStrokeStyle(1, COLORS.NEON_BLUE, 0.4);
        text.setColor(COLORS.TEXT_PRIMARY);
      });
      bg.on('pointerdown', () => btn.action());
    });

    // ESC to resume
    this.input.keyboard.on('keydown-ESC', () => this.resumeGame());

    // Update game state for testing
    if (window.__GAME_STATE__) {
      window.__GAME_STATE__.paused = true;
    }
  }

  resumeGame() {
    if (window.__GAME_STATE__) window.__GAME_STATE__.paused = false;
    this.scene.resume(SCENES.GAME);
    if (this.gameScene && this.gameScene.audioSystem) {
      const levelConfig = this.gameScene.levelManager.getLevelConfig();
      if (levelConfig) this.gameScene.audioSystem.playMusic(levelConfig.musicKey);
    }
    this.scene.stop();
  }

  saveGame() {
    if (this.gameScene) {
      autoSave(this.gameScene);
      // Show saved feedback
      const savedText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 80, 'Game Saved!', {
        fontSize: '14px', fontFamily: 'monospace', color: COLORS.TEXT_ACCENT
      }).setOrigin(0.5).setDepth(3);
      this.tweens.add({ targets: savedText, alpha: 0, duration: 1500, delay: 1000 });
    }
  }

  openSettings() {
    this.scene.stop();
    this.scene.start(SCENES.SETTINGS, { returnScene: SCENES.PAUSE, gameScene: this.gameScene });
  }

  mainMenu() {
    if (window.__GAME_STATE__) window.__GAME_STATE__.paused = false;
    this.scene.stop(SCENES.GAME);
    this.scene.start(SCENES.MENU);
  }
}
