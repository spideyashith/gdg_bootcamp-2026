/**
 * VictoryScene.js - Victory screen after defeating Eclipse
 */
import { SCENES, COLORS, GAME_WIDTH, GAME_HEIGHT } from '../utils/Constants.js';

export class VictoryScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.VICTORY });
  }

  create() {
    // Dark background with upward particles
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x050510);

    // Celebration particles
    for (let i = 0; i < 50; i++) {
      const colors = [COLORS.NEON_BLUE, COLORS.NEON_PURPLE, COLORS.NEON_GREEN, COLORS.NEON_YELLOW, COLORS.NEON_PINK];
      const particle = this.add.rectangle(
        Math.random() * GAME_WIDTH,
        GAME_HEIGHT + Math.random() * 100,
        3, 3, colors[i % colors.length], 0.7
      );
      this.tweens.add({
        targets: particle,
        y: -20,
        x: particle.x + (Math.random() - 0.5) * 100,
        alpha: 0,
        duration: 2000 + Math.random() * 3000,
        repeat: -1,
        delay: Math.random() * 2000
      });
    }

    // Victory text
    const title = this.add.text(GAME_WIDTH / 2, 160, 'VICTORY', {
      fontSize: '52px', fontFamily: 'monospace', color: COLORS.TEXT_ACCENT,
      fontStyle: 'bold', stroke: '#000022', strokeThickness: 4
    }).setOrigin(0.5);

    this.tweens.add({
      targets: title,
      scaleX: { from: 0.8, to: 1 },
      scaleY: { from: 0.8, to: 1 },
      duration: 1000,
      ease: 'Back.easeOut'
    });

    // Story conclusion
    const lines = [
      'Eclipse has been defeated.',
      'The corrupted network is being restored.',
      'Aiden has saved the digital world.',
      '',
      'Thank you for playing Project Eclipse.'
    ];

    lines.forEach((line, i) => {
      const text = this.add.text(GAME_WIDTH / 2, 260 + i * 30, line, {
        fontSize: '14px', fontFamily: 'monospace',
        color: i < 3 ? COLORS.TEXT_PRIMARY : '#888899'
      }).setOrigin(0.5).setAlpha(0);

      this.tweens.add({
        targets: text, alpha: 1,
        duration: 500, delay: 1000 + i * 500
      });
    });

    // Buttons
    const btnData = [
      { text: 'MAIN MENU', action: () => { this.scene.start(SCENES.MENU); }},
      { text: 'CREDITS', action: () => { this.scene.start(SCENES.CREDITS); }}
    ];

    btnData.forEach((btn, i) => {
      const y = 480 + i * 50;
      const bg = this.add.rectangle(GAME_WIDTH / 2, y, 200, 36, 0x1a1a3a, 0.9)
        .setStrokeStyle(1, COLORS.NEON_BLUE, 0.4).setInteractive({ useHandCursor: true });
      const text = this.add.text(GAME_WIDTH / 2, y, btn.text, {
        fontSize: '13px', fontFamily: 'monospace', color: COLORS.TEXT_PRIMARY, fontStyle: 'bold'
      }).setOrigin(0.5);

      bg.on('pointerover', () => { bg.setFillStyle(0x2a2a5a); text.setColor(COLORS.TEXT_ACCENT); });
      bg.on('pointerout', () => { bg.setFillStyle(0x1a1a3a, 0.9); text.setColor(COLORS.TEXT_PRIMARY); });
      bg.on('pointerdown', () => btn.action());

      bg.setAlpha(0); text.setAlpha(0);
      this.tweens.add({ targets: [bg, text], alpha: 1, duration: 500, delay: 3500 + i * 200 });
    });

    this.cameras.main.fadeIn(1000, 0, 0, 0);

    if (window.__GAME_STATE__) {
      window.__GAME_STATE__.scene = SCENES.VICTORY;
    }
  }
}
