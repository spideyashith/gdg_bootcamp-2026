/**
 * MainMenuScene.js - Animated main menu with cyberpunk aesthetics
 */
import { SCENES, COLORS, GAME_WIDTH, GAME_HEIGHT } from '../utils/Constants.js';
import { hasSaveData } from '../systems/SaveSystem.js';
import { AudioSystem } from '../systems/AudioSystem.js';

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.MENU });
  }

  create() {
    // Audio system init (needs user interaction first)
    this.audioSystem = new AudioSystem(this);

    // ─── Animated background ──────────────────────────────────────────
    if (this.textures.exists('bg_menu')) {
      this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'bg_menu').setDepth(0);
    } else {
      // Fallback gradient
      for (let y = 0; y < GAME_HEIGHT; y += 2) {
        const t = y / GAME_HEIGHT;
        this.add.rectangle(GAME_WIDTH / 2, y, GAME_WIDTH, 2,
          Phaser.Display.Color.GetColor(10 + t * 10, 10 + t * 15, 26 + t * 20)
        ).setDepth(0);
      }
    }

    // Rain particles on menu
    for (let i = 0; i < 60; i++) {
      const drop = this.add.rectangle(
        Math.random() * GAME_WIDTH, Math.random() * GAME_HEIGHT,
        1, 5 + Math.random() * 4, 0x6688cc, 0.2 + Math.random() * 0.15
      ).setDepth(1);
      this.tweens.add({
        targets: drop,
        y: GAME_HEIGHT + 20,
        x: drop.x - 20,
        duration: 700 + Math.random() * 500,
        repeat: -1,
        onRepeat: () => { drop.x = Math.random() * GAME_WIDTH; drop.y = -10; }
      });
    }

    // ─── Title ────────────────────────────────────────────────────────
    const title = this.add.text(GAME_WIDTH / 2, 140, 'PROJECT ECLIPSE', {
      fontSize: '48px',
      fontFamily: 'monospace',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000022',
      strokeThickness: 4
    }).setOrigin(0.5).setDepth(10);

    // Title glow animation
    this.tweens.add({
      targets: title,
      alpha: { from: 0.8, to: 1 },
      duration: 2000,
      yoyo: true,
      repeat: -1
    });

    // Subtitle
    this.add.text(GAME_WIDTH / 2, 195, 'Year 2099 • Restore the Digital World', {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: COLORS.TEXT_ACCENT
    }).setOrigin(0.5).setDepth(10);

    // ─── Menu Buttons ─────────────────────────────────────────────────
    const buttons = [];
    const buttonData = [
      { text: 'START GAME', action: () => this.startGame() },
      { text: 'CONTINUE', action: () => this.continueGame(), enabled: hasSaveData() },
      { text: 'SETTINGS', action: () => this.openSettings() },
      { text: 'CREDITS', action: () => this.openCredits() }
    ];

    buttonData.forEach((data, i) => {
      const y = 310 + i * 60;
      const enabled = data.enabled !== false;

      // Button background
      const bg = this.add.rectangle(GAME_WIDTH / 2, y, 260, 44, 0x1a1a3a, 0.85)
        .setDepth(10).setStrokeStyle(1, COLORS.NEON_BLUE, enabled ? 0.4 : 0.15);

      // Button text
      const text = this.add.text(GAME_WIDTH / 2, y, data.text, {
        fontSize: '16px',
        fontFamily: 'monospace',
        color: enabled ? COLORS.TEXT_PRIMARY : '#444466',
        fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(11);

      if (enabled) {
        bg.setInteractive({ useHandCursor: true });
        bg.on('pointerover', () => {
          bg.setFillStyle(0x2a2a5a, 0.9);
          bg.setStrokeStyle(2, COLORS.NEON_BLUE, 0.8);
          text.setColor(COLORS.TEXT_ACCENT);
          this.tweens.add({ targets: bg, scaleX: 1.03, scaleY: 1.03, duration: 100 });
        });
        bg.on('pointerout', () => {
          bg.setFillStyle(0x1a1a3a, 0.85);
          bg.setStrokeStyle(1, COLORS.NEON_BLUE, 0.4);
          text.setColor(COLORS.TEXT_PRIMARY);
          this.tweens.add({ targets: bg, scaleX: 1, scaleY: 1, duration: 100 });
        });
        bg.on('pointerdown', () => {
          // Init audio on first interaction
          this.audioSystem.init();
          this.audioSystem.playSFX('buttonClick');
          data.action();
        });
      }

      // Slide-in animation
      bg.setAlpha(0).setX(GAME_WIDTH / 2 - 50);
      text.setAlpha(0).setX(GAME_WIDTH / 2 - 50);
      this.tweens.add({
        targets: [bg, text],
        alpha: 1,
        x: GAME_WIDTH / 2,
        duration: 400,
        delay: 300 + i * 100,
        ease: 'Cubic.easeOut'
      });
    });

    // ─── Version / Controls hint ──────────────────────────────────────
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 30, 'WASD/Arrows: Move • Space: Attack • Mouse: Projectile • ESC: Pause', {
      fontSize: '10px', fontFamily: 'monospace', color: '#555577'
    }).setOrigin(0.5).setDepth(10);

    this.add.text(10, GAME_HEIGHT - 15, 'v1.0.0', {
      fontSize: '9px', fontFamily: 'monospace', color: '#333355'
    }).setDepth(10);

    // Camera fade in
    this.cameras.main.fadeIn(500, 0, 0, 0);

    // Update game state for testing
    if (window.__GAME_STATE__) {
      window.__GAME_STATE__.scene = SCENES.MENU;
      window.__GAME_STATE__.ready = true;
    }
  }

  startGame() {
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start(SCENES.INTRO);
    });
  }

  continueGame() {
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start(SCENES.GAME, { loadSave: true });
    });
  }

  openSettings() {
    this.scene.start(SCENES.SETTINGS, { returnScene: SCENES.MENU });
  }

  openCredits() {
    this.scene.start(SCENES.CREDITS);
  }
}
