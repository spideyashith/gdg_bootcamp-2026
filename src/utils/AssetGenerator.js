/**
 * AssetGenerator.js - Procedural pixel art sprite generator for Project Eclipse
 * Generates all game sprites, tilesets, and UI elements using Canvas API
 * No external assets required — everything is drawn programmatically
 */
import { COLORS, TILE_SIZE } from './Constants.js';

/**
 * Main asset generation class - creates all textures for the game
 */
export class AssetGenerator {
  /**
   * @param {Phaser.Scene} scene - The boot scene to generate textures in
   */
  constructor(scene) {
    this.scene = scene;
  }

  /**
   * Generate all game assets
   */
  generateAll() {
    this.generatePlayerSprites();
    this.generateEnemySprites();
    this.generateNPCSprites();
    this.generateTilesets();
    this.generateCollectibles();
    this.generateProjectiles();
    this.generateEffects();
    this.generateUIElements();
    this.generatePortraits();
  }

  // ─── Helper: draw pixel on graphics context ──────────────────────────
  /**
   * Draw a filled rectangle (pixel block) on a Graphics object
   */
  _px(g, x, y, w, h, color, alpha = 1) {
    g.fillStyle(color, alpha);
    g.fillRect(x, y, w || 1, h || 1);
  }

  /**
   * Create a texture from a pixel data array
   * @param {string} key - Texture key
   * @param {number} frameW - Frame width
   * @param {number} frameH - Frame height
   * @param {Function} drawFn - Function(graphics, frameIndex) to draw each frame
   * @param {number} frameCount - Number of animation frames
   */
  _createSpriteSheet(key, frameW, frameH, drawFn, frameCount) {
    const totalW = frameW * frameCount;
    const g = this.scene.make.graphics({ x: 0, y: 0, add: false });
    for (let i = 0; i < frameCount; i++) {
      const offsetX = i * frameW;
      drawFn(g, i, offsetX, frameW, frameH);
    }
    g.generateTexture(key, totalW, frameH);
    g.destroy();

    // Add frames to the texture
    const texture = this.scene.textures.get(key);
    for (let i = 0; i < frameCount; i++) {
      texture.add(i, 0, i * frameW, 0, frameW, frameH);
    }
  }

  /**
   * Create a single-frame texture
   */
  _createTexture(key, w, h, drawFn) {
    const g = this.scene.make.graphics({ x: 0, y: 0, add: false });
    drawFn(g, w, h);
    g.generateTexture(key, w, h);
    g.destroy();
  }

  // ═══════════════════════════════════════════════════════════════════════
  // PLAYER SPRITES
  // ═══════════════════════════════════════════════════════════════════════
  generatePlayerSprites() {
    const W = 32, H = 32;
    const bodyColor = 0x2244aa;
    const skinColor = 0xffccaa;
    const hairColor = 0x2200aa;
    const eyeColor = COLORS.NEON_BLUE;
    const bladeColor = COLORS.NEON_BLUE;

    // Helper to draw base character
    const drawPlayerBase = (g, ox, oy, legOffset = 0) => {
      // Hair
      this._px(g, ox + 11, oy + 4, 10, 4, hairColor);
      this._px(g, ox + 10, oy + 6, 2, 6, hairColor);
      // Head
      this._px(g, ox + 12, oy + 6, 8, 8, skinColor);
      // Eyes
      this._px(g, ox + 13, oy + 9, 2, 2, eyeColor);
      this._px(g, ox + 18, oy + 9, 2, 2, eyeColor);
      // Body (jacket)
      this._px(g, ox + 11, oy + 14, 10, 8, bodyColor);
      // Belt
      this._px(g, ox + 11, oy + 20, 10, 2, 0x444466);
      // Legs
      this._px(g, ox + 12, oy + 22, 4, 6 + legOffset, 0x333355);
      this._px(g, ox + 17, oy + 22, 4, 6 - legOffset, 0x333355);
      // Boots
      this._px(g, ox + 11, oy + 28 + legOffset, 5, 2, 0x222244);
      this._px(g, ox + 17, oy + 28 - legOffset, 5, 2, 0x222244);
      // Arm
      this._px(g, ox + 8, oy + 14, 3, 7, bodyColor);
      this._px(g, ox + 21, oy + 14, 3, 7, bodyColor);
      // Neon trim
      this._px(g, ox + 11, oy + 14, 1, 8, COLORS.NEON_BLUE, 0.6);
      this._px(g, ox + 20, oy + 14, 1, 8, COLORS.NEON_BLUE, 0.6);
    };

    // Idle animation (4 frames - subtle breathing)
    this._createSpriteSheet('player_idle', W, H, (g, frame, ox) => {
      const breathOffset = frame < 2 ? 0 : -1;
      drawPlayerBase(g, ox, breathOffset, 0);
    }, 4);

    // Walk animation (6 frames)
    this._createSpriteSheet('player_walk', W, H, (g, frame, ox) => {
      const legOffsets = [0, 1, 2, 1, 0, -1];
      drawPlayerBase(g, ox, 0, legOffsets[frame]);
    }, 6);

    // Run animation (6 frames)
    this._createSpriteSheet('player_run', W, H, (g, frame, ox) => {
      const legOffsets = [0, 2, 3, 2, 0, -2];
      drawPlayerBase(g, ox, frame % 2 === 0 ? 0 : -1, legOffsets[frame]);
    }, 6);

    // Jump frame
    this._createSpriteSheet('player_jump', W, H, (g, frame, ox) => {
      drawPlayerBase(g, ox, -2, 2);
    }, 1);

    // Dash frame
    this._createSpriteSheet('player_dash', W, H, (g, frame, ox, oy = 0) => {
      drawPlayerBase(g, ox, 0, 1);
      // Motion blur trail
      this._px(g, ox + 2, oy + 14, 6, 8, COLORS.NEON_BLUE, 0.3 - frame * 0.1);
    }, 3);

    // Attack combo (3 attacks, 4 frames each = 12 frames)
    this._createSpriteSheet('player_attack', W, H, (g, frame, ox, oy = 0) => {
      drawPlayerBase(g, ox, 0, 0);
      const attackPhase = Math.floor(frame / 4);
      const attackFrame = frame % 4;
      // Sword slash arcs
      if (attackFrame > 0 && attackFrame < 3) {
        const slashY = 10 + attackPhase * 3;
        const slashW = 12 + attackFrame * 4;
        this._px(g, ox + 24, oy + slashY, slashW, 2, bladeColor, 0.8);
        this._px(g, ox + 24, oy + slashY + 2, slashW - 2, 1, COLORS.NEON_PURPLE, 0.5);
      }
    }, 12);

    // Hurt frame
    this._createSpriteSheet('player_hurt', W, H, (g, frame, ox, oy = 0) => {
      // Tinted red version
      this._px(g, ox + 11, oy + 4, 10, 4, 0xaa2222);
      this._px(g, ox + 12, oy + 6, 8, 8, 0xffaaaa);
      this._px(g, ox + 11, oy + 14, 10, 14, 0xaa2244);
      this._px(g, ox + 12, oy + 22, 4, 8, 0x993355);
      this._px(g, ox + 17, oy + 22, 4, 8, 0x993355);
    }, 2);

    // Death frame
    this._createSpriteSheet('player_dead', W, H, (g, frame, ox, oy = 0) => {
      // Collapsed pose
      this._px(g, ox + 6, oy + 24, 20, 4, bodyColor, 0.7);
      this._px(g, ox + 8, oy + 22, 8, 4, skinColor, 0.6);
    }, 1);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // ENEMY SPRITES
  // ═══════════════════════════════════════════════════════════════════════
  generateEnemySprites() {
    const W = 32, H = 32;

    // Virus - pulsing green blob
    this._createSpriteSheet('enemy_virus', W, H, (g, frame, ox) => {
      const pulse = Math.sin(frame * Math.PI / 2) * 2;
      const coreSize = 12 + pulse;
      const cx = ox + 16 - coreSize / 2;
      const cy = 16 - coreSize / 2;
      // Glow
      this._px(g, cx - 2, cy - 2, coreSize + 4, coreSize + 4, COLORS.VIRUS_COLOR, 0.2);
      // Body
      this._px(g, cx, cy, coreSize, coreSize, COLORS.VIRUS_COLOR, 0.8);
      // Core
      this._px(g, cx + 3, cy + 3, coreSize - 6, coreSize - 6, 0x88ff88);
      // Eyes
      this._px(g, ox + 12, 12, 2, 2, 0xffffff);
      this._px(g, ox + 18, 12, 2, 2, 0xffffff);
      // Tendrils
      this._px(g, ox + 10, 8 - frame, 2, 4, COLORS.VIRUS_COLOR, 0.6);
      this._px(g, ox + 20, 8 + frame, 2, 4, COLORS.VIRUS_COLOR, 0.6);
    }, 4);

    // Malware - tentacled red entity
    this._createSpriteSheet('enemy_malware', W, H, (g, frame, ox) => {
      // Body
      this._px(g, ox + 8, 6, 16, 16, COLORS.MALWARE_COLOR, 0.85);
      this._px(g, ox + 10, 8, 12, 12, 0xff6666);
      // Eyes (sinister)
      this._px(g, ox + 11, 11, 3, 2, 0xffff00);
      this._px(g, ox + 18, 11, 3, 2, 0xffff00);
      // Tentacles
      const t = frame * 2;
      this._px(g, ox + 6, 22 + t, 3, 6 - t, COLORS.MALWARE_COLOR, 0.7);
      this._px(g, ox + 13, 22 - t, 3, 6 + t, COLORS.MALWARE_COLOR, 0.7);
      this._px(g, ox + 20, 22 + t, 3, 6 - t, COLORS.MALWARE_COLOR, 0.7);
      this._px(g, ox + 24, 22 - t, 3, 6 + t, COLORS.MALWARE_COLOR, 0.7);
    }, 4);

    // Firewall Guardian - armored sentinel
    this._createSpriteSheet('enemy_guardian', W, H, (g, frame, ox) => {
      // Armor body
      this._px(g, ox + 8, 4, 16, 20, COLORS.GUARDIAN_COLOR, 0.9);
      this._px(g, ox + 10, 6, 12, 16, 0x6699ff);
      // Visor
      this._px(g, ox + 10, 8, 12, 4, 0xffffff, 0.8);
      this._px(g, ox + 11, 9, 10, 2, COLORS.NEON_BLUE);
      // Shield
      this._px(g, ox + 4, 8, 4, 14, 0x3366cc);
      this._px(g, ox + 5, 10, 2, 10, COLORS.NEON_BLUE, 0.5);
      // Legs
      this._px(g, ox + 10, 24, 5, 6, 0x3355aa);
      this._px(g, ox + 17, 24, 5, 6, 0x3355aa);
      // Energy lines
      const glow = (frame % 2 === 0) ? 0.7 : 0.4;
      this._px(g, ox + 8, 14, 16, 1, COLORS.NEON_BLUE, glow);
    }, 4);

    // Drone - hovering bot
    this._createSpriteSheet('enemy_drone', W, H, (g, frame, ox) => {
      const hover = Math.sin(frame * Math.PI / 2) * 2;
      // Body
      this._px(g, ox + 8, 10 + hover, 16, 10, COLORS.DRONE_COLOR, 0.9);
      this._px(g, ox + 10, 12 + hover, 12, 6, 0xffcc44);
      // Eye
      this._px(g, ox + 14, 13 + hover, 4, 4, 0xff0000);
      // Propellers
      const propW = frame % 2 === 0 ? 10 : 6;
      this._px(g, ox + 16 - propW / 2, 8 + hover, propW, 2, 0x888888);
      // Antenna
      this._px(g, ox + 15, 6 + hover, 2, 4, 0x888888);
      // Thruster glow
      this._px(g, ox + 12, 20 + hover, 8, 3, COLORS.NEON_ORANGE, 0.4 + frame * 0.1);
    }, 4);

    // Elite Virus - enhanced purple virus
    this._createSpriteSheet('enemy_elite', W, H, (g, frame, ox) => {
      const pulse = Math.sin(frame * Math.PI / 2) * 2;
      const size = 14 + pulse;
      const cx = ox + 16 - size / 2;
      const cy = 14 - size / 2;
      // Outer glow
      this._px(g, cx - 3, cy - 3, size + 6, size + 6, COLORS.ELITE_COLOR, 0.15);
      // Body
      this._px(g, cx, cy, size, size, COLORS.ELITE_COLOR, 0.85);
      this._px(g, cx + 2, cy + 2, size - 4, size - 4, 0xff66ff);
      // Crown spikes
      this._px(g, ox + 12, 2, 2, 5, COLORS.NEON_YELLOW);
      this._px(g, ox + 16, 1, 2, 6, COLORS.NEON_YELLOW);
      this._px(g, ox + 20, 2, 2, 5, COLORS.NEON_YELLOW);
      // Eyes
      this._px(g, ox + 12, 12, 3, 3, 0xffffff);
      this._px(g, ox + 18, 12, 3, 3, 0xffffff);
      this._px(g, ox + 13, 13, 1, 1, 0xff0000);
      this._px(g, ox + 19, 13, 1, 1, 0xff0000);
    }, 4);

    // Mini Boss - large corrupted entity
    this._createSpriteSheet('enemy_miniboss', 48, 48, (g, frame, ox) => {
      const pulse = frame % 2;
      // Large body
      this._px(g, ox + 8, 4, 32, 32, 0x880044, 0.9);
      this._px(g, ox + 10, 6, 28, 28, 0xaa0066);
      // Face
      this._px(g, ox + 14, 12, 6, 4, 0xff0044);
      this._px(g, ox + 28, 12, 6, 4, 0xff0044);
      // Mouth
      this._px(g, ox + 16, 22, 16, 4, 0x440022);
      this._px(g, ox + 18, 23, 12, 2, 0xff0044);
      // Arms
      this._px(g, ox + 2, 14 + pulse, 6, 16, 0x880044);
      this._px(g, ox + 40, 14 - pulse, 6, 16, 0x880044);
      // Legs
      this._px(g, ox + 12, 36, 8, 10, 0x660033);
      this._px(g, ox + 28, 36, 8, 10, 0x660033);
      // Energy core
      this._px(g, ox + 20, 18, 8, 8, COLORS.NEON_PURPLE, 0.5 + pulse * 0.3);
    }, 4);

    // Final Boss (Eclipse) - large menacing AI
    this._createSpriteSheet('enemy_boss', 64, 64, (g, frame, ox) => {
      const phase = frame % 4;
      // Outer aura
      this._px(g, ox + 4, 4, 56, 56, COLORS.BOSS_COLOR, 0.1 + phase * 0.03);
      // Main body - geometric AI form
      this._px(g, ox + 12, 8, 40, 48, 0x220011, 0.95);
      this._px(g, ox + 14, 10, 36, 44, 0x440022);
      // Eye (central, large)
      this._px(g, ox + 22, 16, 20, 12, 0x000000);
      this._px(g, ox + 24, 18, 16, 8, COLORS.BOSS_COLOR, 0.9);
      this._px(g, ox + 28, 20, 8, 4, 0xffffff);
      // Circuitry lines
      this._px(g, ox + 14, 32, 36, 1, COLORS.NEON_RED, 0.6);
      this._px(g, ox + 14, 38, 36, 1, COLORS.NEON_RED, 0.6);
      this._px(g, ox + 14, 44, 36, 1, COLORS.NEON_RED, 0.6);
      // Shoulder spikes
      this._px(g, ox + 6, 12 + phase, 6, 20, 0x660033);
      this._px(g, ox + 52, 12 - phase, 6, 20, 0x660033);
      // Base
      this._px(g, ox + 16, 52, 32, 8, 0x440022);
      // Core glow
      const glowAlpha = 0.4 + Math.sin(phase * Math.PI / 2) * 0.3;
      this._px(g, ox + 26, 34, 12, 12, COLORS.BOSS_COLOR, glowAlpha);
      this._px(g, ox + 28, 36, 8, 8, 0xff4466, glowAlpha + 0.2);
    }, 4);

    // Enemy death particles (single frame each)
    ['virus', 'malware', 'guardian', 'drone', 'elite'].forEach((type, idx) => {
      const colors = [COLORS.VIRUS_COLOR, COLORS.MALWARE_COLOR, COLORS.GUARDIAN_COLOR, COLORS.DRONE_COLOR, COLORS.ELITE_COLOR];
      this._createTexture(`particle_${type}`, 4, 4, (g) => {
        this._px(g, 0, 0, 4, 4, colors[idx]);
      });
    });
  }

  // ═══════════════════════════════════════════════════════════════════════
  // NPC SPRITES
  // ═══════════════════════════════════════════════════════════════════════
  generateNPCSprites() {
    const W = 32, H = 32;

    const drawNPC = (key, bodyColor, hairColor, accessoryFn) => {
      this._createSpriteSheet(key, W, H, (g, frame, ox) => {
        const bob = frame % 2 === 0 ? 0 : -1;
        // Hair
        this._px(g, ox + 11, 4 + bob, 10, 4, hairColor);
        // Head
        this._px(g, ox + 12, 6 + bob, 8, 8, 0xffccaa);
        // Eyes
        this._px(g, ox + 13, 9 + bob, 2, 2, 0x4444aa);
        this._px(g, ox + 18, 9 + bob, 2, 2, 0x4444aa);
        // Body
        this._px(g, ox + 11, 14 + bob, 10, 8, bodyColor);
        // Legs
        this._px(g, ox + 12, 22 + bob, 4, 8, 0x444466);
        this._px(g, ox + 17, 22 + bob, 4, 8, 0x444466);
        // Arms
        this._px(g, ox + 8, 14 + bob, 3, 7, bodyColor);
        this._px(g, ox + 21, 14 + bob, 3, 7, bodyColor);
        // Custom accessory
        if (accessoryFn) accessoryFn(g, ox, bob);
      }, 4);
    };

    // AI Assistant (Aria) - blue with antenna
    drawNPC('npc_assistant', 0x2266cc, 0x00aaff, (g, ox, bob) => {
      this._px(g, ox + 15, 1 + bob, 2, 4, COLORS.NEON_BLUE);
      this._px(g, ox + 14, 0 + bob, 4, 2, COLORS.NEON_BLUE);
    });

    // Merchant (Byte) - gold with hat
    drawNPC('npc_merchant', 0x886622, 0x553311, (g, ox, bob) => {
      this._px(g, ox + 9, 3 + bob, 14, 3, 0x886622);
      this._px(g, ox + 11, 1 + bob, 10, 3, 0x886622);
      // Coin icon
      this._px(g, ox + 22, 16, 3, 3, COLORS.NEON_YELLOW);
    });

    // Scientist (Dr. Cipher) - white coat
    drawNPC('npc_scientist', 0xccccdd, 0x888899, (g, ox, bob) => {
      // Glasses
      this._px(g, ox + 12, 8 + bob, 9, 3, 0x888888);
      this._px(g, ox + 13, 9 + bob, 3, 1, 0xaaddff);
      this._px(g, ox + 18, 9 + bob, 3, 1, 0xaaddff);
    });

    // Lost Programmer (Zero) - tattered clothes
    drawNPC('npc_programmer', 0x556644, 0x444433, (g, ox, bob) => {
      // Tattered edges
      this._px(g, ox + 11, 20 + bob, 2, 2, 0x333322);
      this._px(g, ox + 19, 18 + bob, 2, 2, 0x333322);
    });
  }

  // ═══════════════════════════════════════════════════════════════════════
  // TILESETS
  // ═══════════════════════════════════════════════════════════════════════
  generateTilesets() {
    const T = TILE_SIZE;

    // Platform tile
    this._createTexture('tile_platform', T, T, (g) => {
      // Base
      this._px(g, 0, 0, T, T, 0x1a1a3a);
      // Top edge (lighter)
      this._px(g, 0, 0, T, 4, 0x2a2a5a);
      this._px(g, 0, 0, T, 2, 0x3a3a7a);
      // Neon line
      this._px(g, 0, 0, T, 1, COLORS.NEON_BLUE, 0.5);
      // Grid pattern
      this._px(g, 0, T - 1, T, 1, 0x111128);
      this._px(g, T - 1, 0, 1, T, 0x111128);
      // Subtle circuit detail
      this._px(g, 8, 12, 16, 1, COLORS.NEON_BLUE, 0.15);
      this._px(g, 16, 8, 1, 12, COLORS.NEON_BLUE, 0.15);
    });

    // Ground tile
    this._createTexture('tile_ground', T, T, (g) => {
      this._px(g, 0, 0, T, T, 0x141428);
      this._px(g, 0, 0, T, 2, 0x2a2a4a);
      // Digital texture
      for (let i = 0; i < 6; i++) {
        const px = (i * 7) % T;
        const py = (i * 11 + 5) % T;
        this._px(g, px, py, 2, 1, 0x1a1a38);
      }
      this._px(g, T - 1, 0, 1, T, 0x0e0e22);
    });

    // Wall tile
    this._createTexture('tile_wall', T, T, (g) => {
      this._px(g, 0, 0, T, T, 0x1e1e3c);
      // Panel lines
      this._px(g, 0, 0, T, 1, 0x2a2a5a);
      this._px(g, 0, T - 1, T, 1, 0x121228);
      this._px(g, 0, 0, 1, T, 0x2a2a5a);
      this._px(g, T - 1, 0, 1, T, 0x121228);
      // Inner detail
      this._px(g, 4, 4, T - 8, T - 8, 0x1a1a36);
      // Neon accent
      this._px(g, 4, 4, T - 8, 1, COLORS.NEON_PURPLE, 0.2);
    });

    // Exit portal
    this._createSpriteSheet('portal', T * 2, T * 2, (g, frame, ox) => {
      const pulse = (frame % 4) * 0.15;
      // Outer ring
      this._px(g, ox + 8, 8, 48, 48, COLORS.NEON_PURPLE, 0.2 + pulse);
      this._px(g, ox + 12, 12, 40, 40, COLORS.NEON_BLUE, 0.3 + pulse);
      // Inner
      this._px(g, ox + 16, 16, 32, 32, 0x0a0a2a, 0.8);
      this._px(g, ox + 20, 20, 24, 24, COLORS.NEON_BLUE, 0.15 + pulse);
      // Center glow
      this._px(g, ox + 24, 24, 16, 16, 0xffffff, 0.1 + pulse);
    }, 4);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // COLLECTIBLES
  // ═══════════════════════════════════════════════════════════════════════
  generateCollectibles() {
    // Coin
    this._createSpriteSheet('collect_coin', 16, 16, (g, frame, ox) => {
      const w = [12, 8, 4, 8][frame];
      const x = ox + 8 - w / 2;
      this._px(g, x, 2, w, 12, COLORS.NEON_YELLOW, 0.9);
      this._px(g, x + 1, 3, w - 2, 10, 0xffcc00);
      if (w > 4) this._px(g, x + w / 2 - 1, 5, 2, 6, COLORS.NEON_YELLOW, 0.5);
    }, 4);

    // Health Pack
    this._createSpriteSheet('collect_health', 16, 16, (g, frame, ox) => {
      const glow = frame % 2 === 0 ? 0.8 : 0.6;
      this._px(g, ox + 2, 2, 12, 12, COLORS.HEALTH_BAR, glow);
      this._px(g, ox + 6, 4, 4, 8, 0xffffff, 0.9);
      this._px(g, ox + 4, 6, 8, 4, 0xffffff, 0.9);
    }, 4);

    // Energy Cell
    this._createSpriteSheet('collect_energy', 16, 16, (g, frame, ox) => {
      const glow = 0.6 + frame * 0.1;
      this._px(g, ox + 4, 1, 8, 14, 0x003366, 0.9);
      this._px(g, ox + 5, 2, 6, 12, COLORS.NEON_BLUE, glow);
      this._px(g, ox + 6, 3, 4, 10, 0x88ddff, glow * 0.8);
    }, 4);

    // Code Fragment
    this._createSpriteSheet('collect_code', 16, 16, (g, frame, ox) => {
      const glow = 0.6 + Math.sin(frame * Math.PI / 2) * 0.3;
      // Crystal shape
      this._px(g, ox + 6, 1, 4, 2, COLORS.NEON_PURPLE, glow);
      this._px(g, ox + 4, 3, 8, 6, COLORS.NEON_PURPLE, glow);
      this._px(g, ox + 5, 4, 6, 4, 0xdd88ff, glow);
      this._px(g, ox + 6, 9, 4, 4, COLORS.NEON_PURPLE, glow * 0.8);
      this._px(g, ox + 7, 13, 2, 2, COLORS.NEON_PURPLE, glow * 0.5);
    }, 4);

    // Upgrade Chip
    this._createSpriteSheet('collect_upgrade', 16, 16, (g, frame, ox) => {
      const glow = frame % 2 === 0 ? 0.9 : 0.7;
      // Chip body
      this._px(g, ox + 3, 3, 10, 10, 0x225522, 0.9);
      this._px(g, ox + 4, 4, 8, 8, 0x338833);
      // Pins
      this._px(g, ox + 1, 5, 2, 2, 0x888888);
      this._px(g, ox + 1, 9, 2, 2, 0x888888);
      this._px(g, ox + 13, 5, 2, 2, 0x888888);
      this._px(g, ox + 13, 9, 2, 2, 0x888888);
      // LED
      this._px(g, ox + 6, 6, 4, 4, COLORS.NEON_GREEN, glow);
    }, 4);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // PROJECTILES & EFFECTS
  // ═══════════════════════════════════════════════════════════════════════
  generateProjectiles() {
    // Player energy projectile
    this._createSpriteSheet('projectile_energy', 16, 8, (g, frame, ox) => {
      const glow = 0.7 + frame * 0.1;
      this._px(g, ox, 1, 16, 6, COLORS.NEON_BLUE, glow * 0.3);
      this._px(g, ox + 2, 2, 12, 4, COLORS.NEON_BLUE, glow);
      this._px(g, ox + 4, 3, 8, 2, 0xffffff, glow * 0.8);
    }, 4);

    // Enemy projectile
    this._createSpriteSheet('projectile_enemy', 8, 8, (g, frame, ox) => {
      const glow = 0.7 + frame * 0.1;
      this._px(g, ox + 1, 1, 6, 6, COLORS.NEON_RED, glow);
      this._px(g, ox + 2, 2, 4, 4, 0xff6644, glow);
    }, 4);

    // Sword slash effect
    this._createSpriteSheet('fx_slash', 48, 32, (g, frame, ox) => {
      const alpha = 1 - frame * 0.25;
      if (alpha <= 0) return;
      // Arc shape
      const arcW = 20 + frame * 10;
      this._px(g, ox + 24, 4 + frame * 3, arcW, 2, COLORS.NEON_BLUE, alpha);
      this._px(g, ox + 20, 8 + frame * 4, arcW + 4, 2, COLORS.NEON_BLUE, alpha * 0.5);
    }, 4);

    // Lightning slash
    this._createSpriteSheet('fx_lightning', 64, 64, (g, frame, ox) => {
      const alpha = 1 - frame * 0.2;
      // Lightning bolts
      for (let i = 0; i < 3; i++) {
        const x = ox + 10 + i * 15 + (frame * 3);
        const y = 5 + i * 8;
        this._px(g, x, y, 3, 20, COLORS.NEON_YELLOW, alpha);
        this._px(g, x + 2, y + 8, 8, 2, COLORS.NEON_YELLOW, alpha * 0.7);
      }
    }, 4);

    // Shield bubble
    this._createSpriteSheet('fx_shield', 40, 40, (g, frame, ox) => {
      const alpha = 0.3 + frame * 0.05;
      this._px(g, ox + 2, 2, 36, 36, COLORS.SHIELD_COLOR, alpha * 0.2);
      this._px(g, ox + 4, 4, 32, 32, COLORS.SHIELD_COLOR, alpha * 0.15);
      // Border
      this._px(g, ox + 2, 2, 36, 2, COLORS.SHIELD_COLOR, alpha);
      this._px(g, ox + 2, 36, 36, 2, COLORS.SHIELD_COLOR, alpha);
      this._px(g, ox + 2, 2, 2, 36, COLORS.SHIELD_COLOR, alpha);
      this._px(g, ox + 36, 2, 2, 36, COLORS.SHIELD_COLOR, alpha);
    }, 4);
  }

  generateEffects() {
    // Explosion
    this._createSpriteSheet('fx_explosion', 32, 32, (g, frame, ox) => {
      const sizes = [8, 16, 24, 28, 24, 16];
      const alphas = [1, 0.9, 0.7, 0.5, 0.3, 0.1];
      const s = sizes[frame] || 8;
      const a = alphas[frame] || 0.1;
      const cx = ox + 16 - s / 2;
      const cy = 16 - s / 2;
      this._px(g, cx, cy, s, s, COLORS.NEON_ORANGE, a);
      this._px(g, cx + 2, cy + 2, s - 4, s - 4, COLORS.NEON_YELLOW, a * 0.8);
      if (s > 12) this._px(g, cx + 4, cy + 4, s - 8, s - 8, 0xffffff, a * 0.5);
    }, 6);

    // Dash afterimage
    this._createTexture('fx_afterimage', 32, 32, (g) => {
      this._px(g, 11, 4, 10, 4, COLORS.NEON_BLUE, 0.3);
      this._px(g, 12, 6, 8, 8, COLORS.NEON_BLUE, 0.25);
      this._px(g, 11, 14, 10, 14, COLORS.NEON_BLUE, 0.2);
    });

    // Generic particle
    this._createTexture('particle', 4, 4, (g) => {
      this._px(g, 0, 0, 4, 4, 0xffffff);
    });

    // Rain drop
    this._createTexture('rain_drop', 2, 8, (g) => {
      this._px(g, 0, 0, 2, 8, 0x6688cc, 0.4);
    });

    // Fog texture
    this._createTexture('fog', 128, 64, (g) => {
      for (let x = 0; x < 128; x += 2) {
        for (let y = 0; y < 64; y += 2) {
          const a = Math.random() * 0.08;
          this._px(g, x, y, 2, 2, 0x8888cc, a);
        }
      }
    });
  }

  // ═══════════════════════════════════════════════════════════════════════
  // UI ELEMENTS
  // ═══════════════════════════════════════════════════════════════════════
  generateUIElements() {
    // Bar background
    this._createTexture('ui_bar_bg', 200, 16, (g) => {
      this._px(g, 0, 0, 200, 16, 0x111122, 0.8);
      this._px(g, 0, 0, 200, 1, 0x333366, 0.5);
      this._px(g, 0, 15, 200, 1, 0x333366, 0.5);
    });

    // Health bar fill
    this._createTexture('ui_health_fill', 196, 12, (g) => {
      this._px(g, 0, 0, 196, 12, COLORS.HEALTH_BAR);
      this._px(g, 0, 0, 196, 3, 0xff5566, 0.5);
    });

    // Energy bar fill
    this._createTexture('ui_energy_fill', 196, 12, (g) => {
      this._px(g, 0, 0, 196, 12, COLORS.ENERGY_BAR);
      this._px(g, 0, 0, 196, 3, 0x44eeff, 0.5);
    });

    // XP bar fill
    this._createTexture('ui_xp_fill', 196, 12, (g) => {
      this._px(g, 0, 0, 196, 12, COLORS.XP_BAR);
      this._px(g, 0, 0, 196, 3, 0x44ffaa, 0.5);
    });

    // Button normal
    this._createTexture('ui_button', 200, 40, (g) => {
      this._px(g, 0, 0, 200, 40, 0x1a1a3a, 0.9);
      this._px(g, 0, 0, 200, 2, COLORS.NEON_BLUE, 0.5);
      this._px(g, 0, 38, 200, 2, COLORS.NEON_BLUE, 0.3);
      this._px(g, 0, 0, 2, 40, COLORS.NEON_BLUE, 0.4);
      this._px(g, 198, 0, 2, 40, COLORS.NEON_BLUE, 0.4);
    });

    // Button hover
    this._createTexture('ui_button_hover', 200, 40, (g) => {
      this._px(g, 0, 0, 200, 40, 0x2a2a5a, 0.9);
      this._px(g, 0, 0, 200, 2, COLORS.NEON_BLUE, 0.8);
      this._px(g, 0, 38, 200, 2, COLORS.NEON_BLUE, 0.6);
      this._px(g, 0, 0, 2, 40, COLORS.NEON_BLUE, 0.7);
      this._px(g, 198, 0, 2, 40, COLORS.NEON_BLUE, 0.7);
    });

    // Dialogue box background
    this._createTexture('ui_dialogue_bg', 800, 160, (g) => {
      this._px(g, 0, 0, 800, 160, 0x0a0a1a, 0.92);
      this._px(g, 0, 0, 800, 2, COLORS.NEON_BLUE, 0.6);
      this._px(g, 0, 158, 800, 2, COLORS.NEON_BLUE, 0.3);
      this._px(g, 0, 0, 2, 160, COLORS.NEON_BLUE, 0.4);
      this._px(g, 798, 0, 2, 160, COLORS.NEON_BLUE, 0.4);
    });

    // Inventory slot
    this._createTexture('ui_inv_slot', 48, 48, (g) => {
      this._px(g, 0, 0, 48, 48, 0x141428, 0.9);
      this._px(g, 0, 0, 48, 1, 0x333366, 0.5);
      this._px(g, 0, 47, 48, 1, 0x333366, 0.5);
      this._px(g, 0, 0, 1, 48, 0x333366, 0.5);
      this._px(g, 47, 0, 1, 48, 0x333366, 0.5);
    });

    // Panel background
    this._createTexture('ui_panel', 400, 500, (g) => {
      this._px(g, 0, 0, 400, 500, 0x0a0a1a, 0.95);
      this._px(g, 0, 0, 400, 2, COLORS.NEON_PURPLE, 0.5);
      this._px(g, 0, 498, 400, 2, COLORS.NEON_PURPLE, 0.3);
      this._px(g, 0, 0, 2, 500, COLORS.NEON_PURPLE, 0.4);
      this._px(g, 398, 0, 2, 500, COLORS.NEON_PURPLE, 0.4);
    });

    // Minimap background
    this._createTexture('ui_minimap_bg', 150, 100, (g) => {
      this._px(g, 0, 0, 150, 100, 0x0a0a1a, 0.85);
      this._px(g, 0, 0, 150, 1, COLORS.NEON_BLUE, 0.4);
      this._px(g, 0, 99, 150, 1, COLORS.NEON_BLUE, 0.3);
      this._px(g, 0, 0, 1, 100, COLORS.NEON_BLUE, 0.3);
      this._px(g, 149, 0, 1, 100, COLORS.NEON_BLUE, 0.3);
    });
  }

  // ═══════════════════════════════════════════════════════════════════════
  // CHARACTER PORTRAITS (for dialogue)
  // ═══════════════════════════════════════════════════════════════════════
  generatePortraits() {
    const S = 64;

    const drawPortraitBase = (g, skinColor, hairColor, eyeColor, bodyColor) => {
      // Hair
      this._px(g, 16, 4, 32, 12, hairColor);
      this._px(g, 14, 10, 4, 16, hairColor);
      // Face
      this._px(g, 18, 12, 28, 20, skinColor);
      // Eyes
      this._px(g, 22, 20, 6, 4, 0xffffff);
      this._px(g, 38, 20, 6, 4, 0xffffff);
      this._px(g, 24, 21, 3, 2, eyeColor);
      this._px(g, 40, 21, 3, 2, eyeColor);
      // Nose
      this._px(g, 30, 26, 4, 2, skinColor * 0.9);
      // Mouth
      this._px(g, 26, 30, 12, 2, 0xcc9988);
      // Shoulders
      this._px(g, 10, 36, 44, 24, bodyColor);
    };

    // Aiden (player)
    this._createTexture('portrait_aiden', S, S, (g) => {
      drawPortraitBase(g, 0xffccaa, 0x2200aa, COLORS.NEON_BLUE, 0x2244aa);
      // Neon trim
      this._px(g, 10, 36, 44, 2, COLORS.NEON_BLUE, 0.5);
    });

    // Aria (AI Assistant)
    this._createTexture('portrait_aria', S, S, (g) => {
      drawPortraitBase(g, 0xeeddcc, 0x00aaff, COLORS.NEON_BLUE, 0x2266cc);
      this._px(g, 30, 2, 4, 6, COLORS.NEON_BLUE);
    });

    // Byte (Merchant)
    this._createTexture('portrait_merchant', S, S, (g) => {
      drawPortraitBase(g, 0xddbb99, 0x553311, 0x448844, 0x886622);
      this._px(g, 14, 6, 36, 8, 0x886622); // Hat
    });

    // Dr. Cipher (Scientist)
    this._createTexture('portrait_scientist', S, S, (g) => {
      drawPortraitBase(g, 0xffccaa, 0x888899, 0x4444aa, 0xccccdd);
      // Glasses
      this._px(g, 20, 18, 10, 6, 0x888888);
      this._px(g, 36, 18, 10, 6, 0x888888);
      this._px(g, 22, 20, 6, 2, 0xaaddff);
      this._px(g, 38, 20, 6, 2, 0xaaddff);
    });

    // Zero (Programmer)
    this._createTexture('portrait_programmer', S, S, (g) => {
      drawPortraitBase(g, 0xeeccaa, 0x444433, 0x888866, 0x556644);
    });

    // Eclipse (Boss)
    this._createTexture('portrait_eclipse', S, S, (g) => {
      this._px(g, 8, 4, 48, 56, 0x220011);
      this._px(g, 16, 14, 32, 16, 0x440022);
      this._px(g, 20, 18, 24, 8, COLORS.BOSS_COLOR, 0.9);
      this._px(g, 26, 20, 12, 4, 0xffffff);
      this._px(g, 16, 36, 32, 2, COLORS.NEON_RED, 0.6);
      this._px(g, 16, 42, 32, 2, COLORS.NEON_RED, 0.6);
    });
  }
}
