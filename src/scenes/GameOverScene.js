/**
 * GameOverScene.js - Game over screen with retry/menu options
 */
import { SCENES, COLORS, GAME_WIDTH, GAME_HEIGHT } from '../utils/Constants.js';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.GAME_OVER });
  }

  init(data) {
    this.levelIndex = data.levelIndex || 0;
  }

  create() {
    // Dark background with glitch-style lines
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x0a0008);

    // Glitch lines
    for (let i = 0; i < 8; i++) {
      const line = this.add.rectangle(
        GAME_WIDTH / 2, Math.random() * GAME_HEIGHT,
        GAME_WIDTH, 2, COLORS.NEON_RED, 0.3
      );
      this.tweens.add({
        targets: line,
        x: GAME_WIDTH / 2 + (Math.random() - 0.5) * 20,
        alpha: { from: 0.3, to: 0 },
        duration: 500 + Math.random() * 500,
        yoyo: true,
        repeat: -1
      });
    }

    // GAME OVER text
    const title = this.add.text(GAME_WIDTH / 2, 220, 'GAME OVER', {
      fontSize: '48px', fontFamily: 'monospace', color: COLORS.TEXT_WARNING,
      fontStyle: 'bold', stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5);

    // Glitch animation on title
    this.tweens.add({
      targets: title,
      x: { from: GAME_WIDTH / 2 - 3, to: GAME_WIDTH / 2 + 3 },
      duration: 100,
      yoyo: true,
      repeat: -1,
      repeatDelay: 2000
    });

    this.add.text(GAME_WIDTH / 2, 280, 'Connection Lost', {
      fontSize: '16px', fontFamily: 'monospace', color: '#666688'
    }).setOrigin(0.5);

    // Buttons
    const btnData = [
      { text: 'RETRY', action: () => {
        this.cameras.main.fadeOut(500);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start(SCENES.GAME, { levelIndex: this.levelIndex });
        });
      }},
      { text: 'MAIN MENU', action: () => {
        this.cameras.main.fadeOut(500);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start(SCENES.MENU);
        });
      }}
    ];

    btnData.forEach((btn, i) => {
      const y = 370 + i * 55;
      const bg = this.add.rectangle(GAME_WIDTH / 2, y, 220, 40, 0x1a0a1a, 0.9)
        .setStrokeStyle(1, COLORS.NEON_RED, 0.4).setInteractive({ useHandCursor: true });
      const text = this.add.text(GAME_WIDTH / 2, y, btn.text, {
        fontSize: '15px', fontFamily: 'monospace', color: COLORS.TEXT_PRIMARY, fontStyle: 'bold'
      }).setOrigin(0.5);

      bg.on('pointerover', () => { bg.setFillStyle(0x2a1a2a); text.setColor(COLORS.TEXT_WARNING); });
      bg.on('pointerout', () => { bg.setFillStyle(0x1a0a1a, 0.9); text.setColor(COLORS.TEXT_PRIMARY); });
      bg.on('pointerdown', () => btn.action());

      // Fade in
      bg.setAlpha(0); text.setAlpha(0);
      this.tweens.add({ targets: [bg, text], alpha: 1, duration: 500, delay: 500 + i * 200 });
    });

    this.cameras.main.fadeIn(500, 10, 0, 0);

    if (window.__GAME_STATE__) {
      window.__GAME_STATE__.scene = SCENES.GAME_OVER;
    }
  }
}
