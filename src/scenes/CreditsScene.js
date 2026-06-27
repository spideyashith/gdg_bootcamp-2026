/**
 * CreditsScene.js - Scrolling credits
 */
import { SCENES, COLORS, GAME_WIDTH, GAME_HEIGHT } from '../utils/Constants.js';

export class CreditsScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.CREDITS });
  }

  create() {
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x050510);

    const credits = [
      { title: 'PROJECT ECLIPSE', size: '28px', color: COLORS.TEXT_ACCENT },
      { title: '', size: '14px', color: COLORS.TEXT_PRIMARY },
      { title: '— DESIGN & DEVELOPMENT —', size: '16px', color: COLORS.TEXT_ACCENT },
      { title: 'Built with Phaser 3 + Vite', size: '14px', color: COLORS.TEXT_PRIMARY },
      { title: '', size: '14px', color: COLORS.TEXT_PRIMARY },
      { title: '— GAME DESIGN —', size: '16px', color: COLORS.TEXT_ACCENT },
      { title: 'Action Platformer Gameplay', size: '14px', color: COLORS.TEXT_PRIMARY },
      { title: 'Cyberpunk Narrative', size: '14px', color: COLORS.TEXT_PRIMARY },
      { title: '', size: '14px', color: COLORS.TEXT_PRIMARY },
      { title: '— ART —', size: '16px', color: COLORS.TEXT_ACCENT },
      { title: 'Procedural Pixel Art Generation', size: '14px', color: COLORS.TEXT_PRIMARY },
      { title: 'All assets generated programmatically', size: '14px', color: COLORS.TEXT_PRIMARY },
      { title: '', size: '14px', color: COLORS.TEXT_PRIMARY },
      { title: '— AUDIO —', size: '16px', color: COLORS.TEXT_ACCENT },
      { title: 'Procedural Synthesis via Web Audio API', size: '14px', color: COLORS.TEXT_PRIMARY },
      { title: '', size: '14px', color: COLORS.TEXT_PRIMARY },
      { title: '— TECHNOLOGY —', size: '16px', color: COLORS.TEXT_ACCENT },
      { title: 'Phaser 3.90 • Vite • JavaScript ES Modules', size: '14px', color: COLORS.TEXT_PRIMARY },
      { title: 'Playwright E2E Testing', size: '14px', color: COLORS.TEXT_PRIMARY },
      { title: '', size: '14px', color: COLORS.TEXT_PRIMARY },
      { title: '— SPECIAL THANKS —', size: '16px', color: COLORS.TEXT_ACCENT },
      { title: 'The Phaser Community', size: '14px', color: COLORS.TEXT_PRIMARY },
      { title: 'Open Source Contributors', size: '14px', color: COLORS.TEXT_PRIMARY },
      { title: '', size: '14px', color: COLORS.TEXT_PRIMARY },
      { title: '', size: '14px', color: COLORS.TEXT_PRIMARY },
      { title: 'Thank you for playing!', size: '18px', color: COLORS.TEXT_ACCENT },
      { title: '© 2099 Digital World Restoration Project', size: '12px', color: '#555577' },
    ];

    const container = this.add.container(0, 0);
    let yOffset = GAME_HEIGHT;

    credits.forEach(entry => {
      const text = this.add.text(GAME_WIDTH / 2, yOffset, entry.title, {
        fontSize: entry.size, fontFamily: 'monospace', color: entry.color, fontStyle: 'bold'
      }).setOrigin(0.5);
      container.add(text);
      yOffset += parseInt(entry.size) + 12;
    });

    // Scroll credits upward
    this.tweens.add({
      targets: container,
      y: -(yOffset),
      duration: yOffset * 30,
      ease: 'Linear',
      onComplete: () => {
        this.scene.start(SCENES.MENU);
      }
    });

    // Skip with click or ESC
    this.input.on('pointerdown', () => this.scene.start(SCENES.MENU));
    this.input.keyboard.on('keydown-ESC', () => this.scene.start(SCENES.MENU));

    // Back hint
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 20, 'Click or press ESC to return', {
      fontSize: '10px', fontFamily: 'monospace', color: '#333355'
    }).setOrigin(0.5);

    this.cameras.main.fadeIn(500, 0, 0, 0);
  }
}
