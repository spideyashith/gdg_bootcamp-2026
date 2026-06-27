/**
 * HUD.js - Heads-up display showing health, energy, XP, coins, minimap
 */
import { COLORS, DEPTH, GAME_WIDTH, GAME_HEIGHT, PLAYER_MAX_HEALTH, PLAYER_MAX_ENERGY } from '../utils/Constants.js';
import { clamp } from '../utils/MathUtils.js';

export class HUD {
  /**
   * @param {Phaser.Scene} scene
   */
  constructor(scene) {
    this.scene = scene;
    this.elements = [];
    this.create();
  }

  create() {
    const margin = 16;
    const barWidth = 180;
    const barHeight = 12;

    // ─── Health Bar ──────────────────────────────────────────────────
    this.healthBg = this.scene.add.rectangle(margin, margin, barWidth + 4, barHeight + 4, 0x111122, 0.8)
      .setOrigin(0, 0).setScrollFactor(0).setDepth(DEPTH.UI);
    this.healthFill = this.scene.add.rectangle(margin + 2, margin + 2, barWidth, barHeight, COLORS.HEALTH_BAR, 0.9)
      .setOrigin(0, 0).setScrollFactor(0).setDepth(DEPTH.UI + 1);
    this.healthText = this.scene.add.text(margin + barWidth + 10, margin, 'HP', {
      fontSize: '11px', fontFamily: 'monospace', color: COLORS.TEXT_WARNING
    }).setScrollFactor(0).setDepth(DEPTH.UI + 1);

    // ─── Energy Bar ──────────────────────────────────────────────────
    this.energyBg = this.scene.add.rectangle(margin, margin + 22, barWidth + 4, barHeight + 4, 0x111122, 0.8)
      .setOrigin(0, 0).setScrollFactor(0).setDepth(DEPTH.UI);
    this.energyFill = this.scene.add.rectangle(margin + 2, margin + 24, barWidth, barHeight, COLORS.ENERGY_BAR, 0.9)
      .setOrigin(0, 0).setScrollFactor(0).setDepth(DEPTH.UI + 1);
    this.energyText = this.scene.add.text(margin + barWidth + 10, margin + 22, 'EN', {
      fontSize: '11px', fontFamily: 'monospace', color: COLORS.TEXT_ACCENT
    }).setScrollFactor(0).setDepth(DEPTH.UI + 1);

    // ─── XP Bar ──────────────────────────────────────────────────────
    this.xpBg = this.scene.add.rectangle(margin, margin + 44, barWidth + 4, 8, 0x111122, 0.8)
      .setOrigin(0, 0).setScrollFactor(0).setDepth(DEPTH.UI);
    this.xpFill = this.scene.add.rectangle(margin + 2, margin + 45, 0, 6, COLORS.XP_BAR, 0.8)
      .setOrigin(0, 0).setScrollFactor(0).setDepth(DEPTH.UI + 1);
    this.levelText = this.scene.add.text(margin + barWidth + 10, margin + 40, 'LV 1', {
      fontSize: '10px', fontFamily: 'monospace', color: '#00ff88'
    }).setScrollFactor(0).setDepth(DEPTH.UI + 1);

    // ─── Coins ───────────────────────────────────────────────────────
    this.coinIcon = this.scene.add.rectangle(margin, margin + 60, 8, 8, COLORS.NEON_YELLOW, 0.9)
      .setOrigin(0, 0).setScrollFactor(0).setDepth(DEPTH.UI + 1);
    this.coinText = this.scene.add.text(margin + 12, margin + 58, '0', {
      fontSize: '11px', fontFamily: 'monospace', color: COLORS.TEXT_GOLD
    }).setScrollFactor(0).setDepth(DEPTH.UI + 1);

    // ─── Code Fragments ──────────────────────────────────────────────
    this.codeIcon = this.scene.add.rectangle(margin + 80, margin + 60, 8, 8, COLORS.NEON_PURPLE, 0.9)
      .setOrigin(0, 0).setScrollFactor(0).setDepth(DEPTH.UI + 1);
    this.codeText = this.scene.add.text(margin + 92, margin + 58, '0', {
      fontSize: '11px', fontFamily: 'monospace', color: '#b400ff'
    }).setScrollFactor(0).setDepth(DEPTH.UI + 1);

    // ─── Level Name ──────────────────────────────────────────────────
    this.levelNameText = this.scene.add.text(GAME_WIDTH / 2, margin, '', {
      fontSize: '14px', fontFamily: 'monospace', color: COLORS.TEXT_ACCENT,
      stroke: '#000000', strokeThickness: 2
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(DEPTH.UI);

    // ─── Minimap ─────────────────────────────────────────────────────
    this.minimapBg = this.scene.add.rectangle(
      GAME_WIDTH - margin - 140, margin,
      140, 60, 0x0a0a1a, 0.7
    ).setOrigin(0, 0).setScrollFactor(0).setDepth(DEPTH.UI);
    this.minimapBorder = this.scene.add.rectangle(
      GAME_WIDTH - margin - 140, margin,
      140, 60
    ).setOrigin(0, 0).setScrollFactor(0).setDepth(DEPTH.UI + 1)
      .setStrokeStyle(1, COLORS.NEON_BLUE, 0.4).setFillStyle(0, 0);
    this.minimapPlayerDot = this.scene.add.circle(0, 0, 2, COLORS.NEON_BLUE)
      .setScrollFactor(0).setDepth(DEPTH.UI + 2);

    // Store for cleanup
    this.elements = [
      this.healthBg, this.healthFill, this.healthText,
      this.energyBg, this.energyFill, this.energyText,
      this.xpBg, this.xpFill, this.levelText,
      this.coinIcon, this.coinText, this.codeIcon, this.codeText,
      this.levelNameText,
      this.minimapBg, this.minimapBorder, this.minimapPlayerDot
    ];

    // Listen for stat changes
    this.scene.events.on('statsChanged', () => this.updateStats());
  }

  /**
   * Update HUD with current player stats
   */
  updateStats() {
    const player = this.scene.player;
    if (!player) return;

    const barWidth = 180;

    // Health
    const healthRatio = clamp(player.health / player.maxHealth, 0, 1);
    this.healthFill.width = barWidth * healthRatio;
    this.healthText.setText(`${Math.ceil(player.health)}/${player.maxHealth}`);

    // Energy
    const energyRatio = clamp(player.energy / player.maxEnergy, 0, 1);
    this.energyFill.width = barWidth * energyRatio;
    this.energyText.setText(`${Math.ceil(player.energy)}/${player.maxEnergy}`);

    // XP
    if (player.xpSystem) {
      const xpProgress = player.xpSystem.getProgress();
      this.xpFill.width = barWidth * clamp(xpProgress, 0, 1);
    }
    this.levelText.setText(`LV ${player.playerLevel}`);

    // Coins
    this.coinText.setText(`${player.coins}`);
    this.codeText.setText(`${player.codeFragments}`);
  }

  /**
   * Update minimap
   */
  updateMinimap() {
    const player = this.scene.player;
    if (!player) return;

    const worldWidth = this.scene.physics.world.bounds.width;
    const worldHeight = this.scene.physics.world.bounds.height;
    const minimapX = GAME_WIDTH - 16 - 140;
    const minimapY = 16;
    const minimapW = 140;
    const minimapH = 60;

    const px = minimapX + (player.x / worldWidth) * minimapW;
    const py = minimapY + (player.y / worldHeight) * minimapH;
    this.minimapPlayerDot.setPosition(px, py);
  }

  /**
   * Set the level name display
   * @param {string} name
   */
  setLevelName(name) {
    this.levelNameText.setText(name);
    this.levelNameText.setAlpha(1);
    this.scene.tweens.add({
      targets: this.levelNameText,
      alpha: 0.5,
      duration: 2000,
      delay: 3000
    });
  }

  /**
   * Destroy all HUD elements
   */
  destroy() {
    this.elements.forEach(el => { if (el) el.destroy(); });
  }
}
