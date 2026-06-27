/**
 * BackgroundGenerator.js - Procedural parallax background generator
 * Creates multi-layer cyberpunk backgrounds for each level theme
 */
import { COLORS, GAME_WIDTH, GAME_HEIGHT } from './Constants.js';

export class BackgroundGenerator {
  constructor(scene) {
    this.scene = scene;
  }

  /**
   * Generate all background textures for different level themes
   */
  generateAll() {
    this.generateCyberBackground();
    this.generateCityBackground();
    this.generateForestBackground();
    this.generateFortressBackground();
    this.generateCoreBackground();
    this.generateBossBackground();
    this.generateMenuBackground();
  }

  /**
   * Helper to create a background texture layer
   */
  _createBg(key, w, h, drawFn) {
    const g = this.scene.make.graphics({ x: 0, y: 0, add: false });
    drawFn(g, w, h);
    g.generateTexture(key, w, h);
    g.destroy();
  }

  // ─── Cyber / Tutorial background ─────────────────────────────────────
  generateCyberBackground() {
    // Far layer - dark sky with stars
    this._createBg('bg_cyber_far', 640, GAME_HEIGHT, (g, w, h) => {
      g.fillStyle(0x050510);
      g.fillRect(0, 0, w, h);
      // Stars
      for (let i = 0; i < 40; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h * 0.6;
        const brightness = Math.random();
        g.fillStyle(0xffffff, brightness * 0.5);
        g.fillRect(x, y, 1, 1);
      }
      // Gradient horizon
      for (let y = h * 0.5; y < h; y++) {
        const t = (y - h * 0.5) / (h * 0.5);
        g.fillStyle(COLORS.NEON_PURPLE, t * 0.08);
        g.fillRect(0, y, w, 1);
      }
    });

    // Mid layer - building silhouettes
    this._createBg('bg_cyber_mid', 800, GAME_HEIGHT, (g, w, h) => {
      // Buildings
      const buildingData = [
        [20, 200, 60, 520], [100, 280, 50, 440], [170, 160, 70, 560],
        [260, 240, 45, 480], [330, 300, 55, 420], [400, 180, 65, 540],
        [490, 260, 50, 460], [560, 200, 60, 520], [640, 320, 55, 400],
        [720, 220, 50, 500]
      ];
      for (const [x, y, w2, h2] of buildingData) {
        g.fillStyle(0x0a0a20, 0.8);
        g.fillRect(x, y, w2, h2);
        // Windows
        for (let wy = y + 10; wy < y + h2 - 10; wy += 20) {
          for (let wx = x + 5; wx < x + w2 - 5; wx += 12) {
            const lit = Math.random() > 0.4;
            g.fillStyle(lit ? COLORS.NEON_BLUE : 0x111122, lit ? 0.3 : 0.2);
            g.fillRect(wx, wy, 6, 8);
          }
        }
      }
    });

    // Near layer - close neon signs
    this._createBg('bg_cyber_near', 960, GAME_HEIGHT, (g, w, h) => {
      // Neon sign strips
      for (let i = 0; i < 6; i++) {
        const x = i * 160 + 40;
        const y = 100 + Math.random() * 200;
        const signW = 40 + Math.random() * 60;
        const colors = [COLORS.NEON_BLUE, COLORS.NEON_PURPLE, COLORS.NEON_PINK];
        const c = colors[i % 3];
        g.fillStyle(c, 0.2);
        g.fillRect(x, y, signW, 12);
        g.fillStyle(c, 0.4);
        g.fillRect(x + 2, y + 2, signW - 4, 8);
      }
      // Pipes and cables
      for (let i = 0; i < 4; i++) {
        const y = 400 + i * 60;
        g.fillStyle(0x222244, 0.4);
        g.fillRect(0, y, w, 3);
      }
    });
  }

  // ─── City background ─────────────────────────────────────────────────
  generateCityBackground() {
    this._createBg('bg_city_far', 640, GAME_HEIGHT, (g, w, h) => {
      g.fillStyle(0x060612);
      g.fillRect(0, 0, w, h);
      for (let i = 0; i < 50; i++) {
        g.fillStyle(0xffffff, Math.random() * 0.4);
        g.fillRect(Math.random() * w, Math.random() * h * 0.5, 1, 1);
      }
      // Distant skyline glow
      g.fillStyle(COLORS.NEON_BLUE, 0.04);
      g.fillRect(0, h * 0.4, w, h * 0.2);
    });

    this._createBg('bg_city_mid', 800, GAME_HEIGHT, (g, w, h) => {
      const heights = [380, 280, 340, 420, 300, 360, 260, 400, 320, 380, 290, 350];
      for (let i = 0; i < heights.length; i++) {
        const x = i * 70;
        const bh = heights[i];
        g.fillStyle(0x0c0c22, 0.9);
        g.fillRect(x, h - bh, 60, bh);
        g.fillStyle(COLORS.NEON_PURPLE, 0.1);
        g.fillRect(x, h - bh, 60, 2);
        // Windows
        for (let wy = h - bh + 10; wy < h - 10; wy += 16) {
          for (let wx = x + 6; wx < x + 54; wx += 10) {
            g.fillStyle(Math.random() > 0.3 ? COLORS.NEON_BLUE : 0x111122, Math.random() > 0.3 ? 0.25 : 0.1);
            g.fillRect(wx, wy, 5, 7);
          }
        }
      }
    });

    this._createBg('bg_city_near', 960, GAME_HEIGHT, (g, w, h) => {
      // Close building edges
      g.fillStyle(0x0e0e28, 0.6);
      g.fillRect(0, h - 300, 100, 300);
      g.fillRect(w - 120, h - 350, 120, 350);
      // Neon accents
      g.fillStyle(COLORS.NEON_PINK, 0.3);
      g.fillRect(20, h - 300, 60, 4);
      g.fillStyle(COLORS.NEON_BLUE, 0.3);
      g.fillRect(w - 100, h - 350, 80, 4);
    });
  }

  // ─── Forest background ───────────────────────────────────────────────
  generateForestBackground() {
    this._createBg('bg_forest_far', 640, GAME_HEIGHT, (g, w, h) => {
      g.fillStyle(0x040810);
      g.fillRect(0, 0, w, h);
      // Digital aurora
      for (let x = 0; x < w; x += 4) {
        const height = 80 + Math.sin(x * 0.02) * 40;
        g.fillStyle(COLORS.NEON_GREEN, 0.03);
        g.fillRect(x, 100, 4, height);
      }
    });

    this._createBg('bg_forest_mid', 800, GAME_HEIGHT, (g, w, h) => {
      // Digital trees
      for (let i = 0; i < 15; i++) {
        const x = i * 55 + 10;
        const treeH = 200 + Math.random() * 150;
        const trunkW = 8 + Math.random() * 6;
        // Trunk
        g.fillStyle(0x1a2a1a, 0.7);
        g.fillRect(x, h - treeH, trunkW, treeH);
        // Canopy layers
        const canopyW = 30 + Math.random() * 20;
        for (let j = 0; j < 3; j++) {
          g.fillStyle(COLORS.NEON_GREEN, 0.12 - j * 0.03);
          g.fillRect(x - canopyW / 2 + trunkW / 2, h - treeH - 10 + j * 20, canopyW - j * 8, 25);
        }
      }
    });

    this._createBg('bg_forest_near', 960, GAME_HEIGHT, (g, w, h) => {
      // Close foliage
      for (let i = 0; i < 8; i++) {
        const x = i * 130;
        g.fillStyle(COLORS.NEON_GREEN, 0.06);
        g.fillRect(x, h - 150 - Math.random() * 100, 80, 100);
      }
    });
  }

  // ─── Fortress background ─────────────────────────────────────────────
  generateFortressBackground() {
    this._createBg('bg_fortress_far', 640, GAME_HEIGHT, (g, w, h) => {
      g.fillStyle(0x080816);
      g.fillRect(0, 0, w, h);
      // Grid pattern
      for (let x = 0; x < w; x += 40) {
        g.fillStyle(COLORS.NEON_BLUE, 0.03);
        g.fillRect(x, 0, 1, h);
      }
      for (let y = 0; y < h; y += 40) {
        g.fillStyle(COLORS.NEON_BLUE, 0.03);
        g.fillRect(0, y, w, 1);
      }
    });

    this._createBg('bg_fortress_mid', 800, GAME_HEIGHT, (g, w, h) => {
      // Fortress walls
      for (let i = 0; i < 6; i++) {
        const x = i * 140 + 20;
        g.fillStyle(0x1a1a3a, 0.6);
        g.fillRect(x, 100, 80, h - 100);
        // Battlements
        for (let j = 0; j < 4; j++) {
          g.fillStyle(0x1a1a3a, 0.7);
          g.fillRect(x + j * 22, 80, 16, 20);
        }
        // Glowing embrasures
        g.fillStyle(COLORS.GUARDIAN_COLOR, 0.15);
        g.fillRect(x + 20, 200, 40, 8);
        g.fillRect(x + 20, 350, 40, 8);
      }
    });

    this._createBg('bg_fortress_near', 960, GAME_HEIGHT, (g, w, h) => {
      g.fillStyle(0x12122a, 0.4);
      g.fillRect(0, 0, 60, h);
      g.fillRect(w - 60, 0, 60, h);
    });
  }

  // ─── Core Network background ──────────────────────────────────────────
  generateCoreBackground() {
    this._createBg('bg_core_far', 640, GAME_HEIGHT, (g, w, h) => {
      g.fillStyle(0x0a0008);
      g.fillRect(0, 0, w, h);
      // Data streams
      for (let i = 0; i < 20; i++) {
        const x = Math.random() * w;
        const streamH = 100 + Math.random() * 300;
        g.fillStyle(COLORS.NEON_RED, 0.06);
        g.fillRect(x, Math.random() * h, 2, streamH);
      }
    });

    this._createBg('bg_core_mid', 800, GAME_HEIGHT, (g, w, h) => {
      // Circuit board pattern
      for (let x = 0; x < w; x += 30) {
        for (let y = 0; y < h; y += 30) {
          if (Math.random() > 0.7) {
            g.fillStyle(COLORS.NEON_RED, 0.05);
            g.fillRect(x, y, 20, 1);
            g.fillRect(x + 20, y, 1, 15);
          }
        }
      }
    });

    this._createBg('bg_core_near', 960, GAME_HEIGHT, (g) => {});
  }

  // ─── Boss Arena background ────────────────────────────────────────────
  generateBossBackground() {
    this._createBg('bg_boss_far', 640, GAME_HEIGHT, (g, w, h) => {
      g.fillStyle(0x0a0004);
      g.fillRect(0, 0, w, h);
      // Ominous red glow from center
      for (let r = 300; r > 0; r -= 20) {
        g.fillStyle(COLORS.BOSS_COLOR, 0.01);
        g.fillRect(w / 2 - r, h / 2 - r, r * 2, r * 2);
      }
    });

    this._createBg('bg_boss_mid', 800, GAME_HEIGHT, (g, w, h) => {
      // Corrupted pillars
      for (let i = 0; i < 8; i++) {
        const x = i * 100 + 20;
        g.fillStyle(0x220011, 0.7);
        g.fillRect(x, 0, 30, h);
        g.fillStyle(COLORS.BOSS_COLOR, 0.1);
        g.fillRect(x + 12, 0, 6, h);
      }
    });

    this._createBg('bg_boss_near', 960, GAME_HEIGHT, (g) => {});
  }

  // ─── Menu background ──────────────────────────────────────────────────
  generateMenuBackground() {
    this._createBg('bg_menu', GAME_WIDTH, GAME_HEIGHT, (g, w, h) => {
      // Dark gradient
      for (let y = 0; y < h; y++) {
        const t = y / h;
        const r = Math.floor(10 + t * 10);
        const gb = Math.floor(10 + t * 20);
        const b = Math.floor(20 + t * 30);
        g.fillStyle(Phaser.Display.Color.GetColor(r, gb, b));
        g.fillRect(0, y, w, 1);
      }
      // City silhouette
      const buildings = [
        [50, 400], [120, 350], [200, 420], [280, 320], [360, 380],
        [440, 300], [520, 360], [600, 340], [680, 390], [760, 310],
        [840, 370], [920, 350], [1000, 400], [1080, 330], [1160, 380]
      ];
      for (const [x, height] of buildings) {
        g.fillStyle(0x0c0c20, 0.9);
        g.fillRect(x, h - height, 70, height);
        // Window glow
        for (let wy = h - height + 15; wy < h - 10; wy += 18) {
          for (let wx = x + 8; wx < x + 62; wx += 12) {
            if (Math.random() > 0.35) {
              g.fillStyle(COLORS.NEON_BLUE, 0.2);
              g.fillRect(wx, wy, 5, 7);
            }
          }
        }
      }
      // Neon signs
      g.fillStyle(COLORS.NEON_PURPLE, 0.15);
      g.fillRect(200, h - 380, 80, 10);
      g.fillStyle(COLORS.NEON_BLUE, 0.15);
      g.fillRect(600, h - 300, 100, 10);
      g.fillStyle(COLORS.NEON_PINK, 0.15);
      g.fillRect(900, h - 340, 70, 10);
    });
  }
}
