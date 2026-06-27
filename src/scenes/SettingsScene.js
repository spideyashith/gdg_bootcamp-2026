/**
 * SettingsScene.js - Settings menu (volume, fullscreen, key remapping)
 */
import { SCENES, COLORS, GAME_WIDTH, GAME_HEIGHT } from '../utils/Constants.js';
import { saveSettings, loadSettings } from '../systems/SaveSystem.js';
import { getAllBindings, resetBindings, remapKey, saveBindings } from '../config/Controls.js';

export class SettingsScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.SETTINGS });
  }

  init(data) {
    this.returnScene = data.returnScene || SCENES.MENU;
    this.gameScene = data.gameScene || null;
  }

  create() {
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x0a0a1a).setDepth(0);

    // Title
    this.add.text(GAME_WIDTH / 2, 50, 'SETTINGS', {
      fontSize: '28px', fontFamily: 'monospace', color: COLORS.TEXT_ACCENT, fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(1);

    const settings = loadSettings();
    let yPos = 130;

    // ─── Music Volume Slider ──────────────────────────────────────────
    this.add.text(200, yPos, 'Music Volume', {
      fontSize: '14px', fontFamily: 'monospace', color: COLORS.TEXT_PRIMARY
    }).setDepth(1);
    this.createSlider(600, yPos + 8, settings.musicVolume, (val) => {
      settings.musicVolume = val;
      saveSettings(settings);
    });

    yPos += 60;

    // ─── SFX Volume Slider ────────────────────────────────────────────
    this.add.text(200, yPos, 'SFX Volume', {
      fontSize: '14px', fontFamily: 'monospace', color: COLORS.TEXT_PRIMARY
    }).setDepth(1);
    this.createSlider(600, yPos + 8, settings.sfxVolume, (val) => {
      settings.sfxVolume = val;
      saveSettings(settings);
    });

    yPos += 60;

    // ─── Fullscreen Toggle ────────────────────────────────────────────
    this.add.text(200, yPos, 'Fullscreen', {
      fontSize: '14px', fontFamily: 'monospace', color: COLORS.TEXT_PRIMARY
    }).setDepth(1);
    const fsToggle = this.add.text(600, yPos, this.scale.isFullscreen ? '[ON]' : '[OFF]', {
      fontSize: '14px', fontFamily: 'monospace', color: COLORS.TEXT_ACCENT
    }).setDepth(1).setInteractive({ useHandCursor: true });
    fsToggle.on('pointerdown', () => {
      if (this.scale.isFullscreen) {
        this.scale.stopFullscreen();
        fsToggle.setText('[OFF]');
      } else {
        this.scale.startFullscreen();
        fsToggle.setText('[ON]');
      }
    });

    yPos += 60;

    // ─── Key Bindings ─────────────────────────────────────────────────
    this.add.text(GAME_WIDTH / 2, yPos, 'KEY BINDINGS', {
      fontSize: '16px', fontFamily: 'monospace', color: COLORS.TEXT_ACCENT, fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(1);

    yPos += 35;
    const bindings = getAllBindings();
    const displayNames = {
      moveLeft: 'Move Left', moveRight: 'Move Right', jump: 'Jump',
      crouch: 'Crouch', dash: 'Dash/Run', attack: 'Attack',
      interact: 'Interact', pause: 'Pause'
    };

    Object.entries(displayNames).forEach(([action, name]) => {
      this.add.text(200, yPos, name, {
        fontSize: '12px', fontFamily: 'monospace', color: COLORS.TEXT_PRIMARY
      }).setDepth(1);

      const keys = bindings[action] || [];
      this.add.text(600, yPos, keys.join(' / '), {
        fontSize: '12px', fontFamily: 'monospace', color: '#888899'
      }).setDepth(1);

      yPos += 25;
    });

    yPos += 15;

    // Reset Bindings button
    const resetBtn = this.add.text(GAME_WIDTH / 2, yPos, '[RESET TO DEFAULTS]', {
      fontSize: '12px', fontFamily: 'monospace', color: '#666688'
    }).setOrigin(0.5).setDepth(1).setInteractive({ useHandCursor: true });
    resetBtn.on('pointerdown', () => { resetBindings(); this.scene.restart(); });
    resetBtn.on('pointerover', () => resetBtn.setColor(COLORS.TEXT_WARNING));
    resetBtn.on('pointerout', () => resetBtn.setColor('#666688'));

    // ─── Back Button ──────────────────────────────────────────────────
    const backBtn = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 60, 200, 40, 0x1a1a3a, 0.9)
      .setDepth(1).setStrokeStyle(1, COLORS.NEON_BLUE, 0.4)
      .setInteractive({ useHandCursor: true });
    const backText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 60, 'BACK', {
      fontSize: '14px', fontFamily: 'monospace', color: COLORS.TEXT_PRIMARY, fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(2);

    backBtn.on('pointerover', () => {
      backBtn.setFillStyle(0x2a2a5a);
      backText.setColor(COLORS.TEXT_ACCENT);
    });
    backBtn.on('pointerout', () => {
      backBtn.setFillStyle(0x1a1a3a, 0.9);
      backText.setColor(COLORS.TEXT_PRIMARY);
    });
    backBtn.on('pointerdown', () => this.goBack());

    this.input.keyboard.on('keydown-ESC', () => this.goBack());

    // Update game state for testing
    if (window.__GAME_STATE__) {
      window.__GAME_STATE__.scene = SCENES.SETTINGS;
    }
  }

  /**
   * Create a simple slider control
   */
  createSlider(x, y, initialValue, onChange) {
    const sliderWidth = 200;
    const bg = this.add.rectangle(x, y, sliderWidth, 8, 0x222244).setDepth(1);
    const fill = this.add.rectangle(x - sliderWidth / 2, y, sliderWidth * initialValue, 8, COLORS.NEON_BLUE, 0.7)
      .setOrigin(0, 0.5).setDepth(2);
    const handle = this.add.circle(x - sliderWidth / 2 + sliderWidth * initialValue, y, 8, COLORS.NEON_BLUE)
      .setDepth(3).setInteractive({ useHandCursor: true, draggable: true });

    const valueText = this.add.text(x + sliderWidth / 2 + 20, y - 6, `${Math.round(initialValue * 100)}%`, {
      fontSize: '12px', fontFamily: 'monospace', color: COLORS.TEXT_PRIMARY
    }).setDepth(2);

    handle.on('drag', (pointer, dragX) => {
      const minX = x - sliderWidth / 2;
      const maxX = x + sliderWidth / 2;
      const clampedX = Phaser.Math.Clamp(dragX, minX, maxX);
      handle.x = clampedX;
      const value = (clampedX - minX) / sliderWidth;
      fill.width = sliderWidth * value;
      valueText.setText(`${Math.round(value * 100)}%`);
      onChange(value);
    });

    this.input.setDraggable(handle);
  }

  goBack() {
    if (this.returnScene === SCENES.PAUSE && this.gameScene) {
      this.scene.start(SCENES.PAUSE, { gameScene: this.gameScene });
    } else {
      this.scene.start(this.returnScene);
    }
  }
}
