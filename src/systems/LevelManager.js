/**
 * LevelManager.js - Level loading, transitions, and world construction
 */
import { LEVELS } from '../config/LevelConfig.js';
import { TILE_SIZE, DEPTH, GAME_HEIGHT, COLORS } from '../utils/Constants.js';

export class LevelManager {
  /**
   * @param {Phaser.Scene} scene
   */
  constructor(scene) {
    this.scene = scene;
    this.currentLevel = null;
    this.currentLevelIndex = 0;
    /** @type {Phaser.Physics.Arcade.StaticGroup} */
    this.platforms = null;
    this.backgrounds = [];
    this.rainEmitters = [];
    this.fogSprites = [];
    this.portal = null;
  }

  /**
   * Load a level by index
   * @param {number} levelIndex
   */
  loadLevel(levelIndex) {
    this.cleanup();

    this.currentLevelIndex = levelIndex;
    this.currentLevel = LEVELS[levelIndex];
    if (!this.currentLevel) {
      console.error(`[LevelManager] Level ${levelIndex} not found`);
      return;
    }

    const level = this.currentLevel;
    const worldWidth = level.width * TILE_SIZE;
    const worldHeight = level.height * TILE_SIZE;

    // Set world bounds
    this.scene.physics.world.setBounds(0, 0, worldWidth, worldHeight);

    // Create backgrounds
    this.createBackgrounds(level.bgStyle, worldWidth);

    // Create platforms
    this.createPlatforms(level.platforms, worldWidth);

    // Create exit portal
    this.createPortal(level.exitX);

    // Weather effects
    if (level.hasRain) this.createRain(worldWidth);
    if (level.hasFog) this.createFog(worldWidth);

    console.log(`[LevelManager] Loaded level ${levelIndex}: ${level.name}`);
    return { worldWidth, worldHeight, playerStart: level.playerStart };
  }

  /**
   * Create parallax background layers
   */
  createBackgrounds(bgStyle, worldWidth) {
    const bgMap = {
      cyber: ['bg_cyber_far', 'bg_cyber_mid', 'bg_cyber_near'],
      city: ['bg_city_far', 'bg_city_mid', 'bg_city_near'],
      forest: ['bg_forest_far', 'bg_forest_mid', 'bg_forest_near'],
      fortress: ['bg_fortress_far', 'bg_fortress_mid', 'bg_fortress_near'],
      core: ['bg_core_far', 'bg_core_mid', 'bg_core_near'],
      boss: ['bg_boss_far', 'bg_boss_mid', 'bg_boss_near']
    };

    const layers = bgMap[bgStyle] || bgMap.cyber;
    const scrollFactors = [0.1, 0.3, 0.5];
    const depths = [DEPTH.BG_FAR, DEPTH.BG_MID, DEPTH.BG_NEAR];

    layers.forEach((key, i) => {
      if (!this.scene.textures.exists(key)) return;
      // Tile the background across the level width
      const bg = this.scene.add.tileSprite(
        0, 0, worldWidth, GAME_HEIGHT, key
      );
      bg.setOrigin(0, 0);
      bg.setDepth(depths[i]);
      bg.setScrollFactor(scrollFactors[i], 0);
      this.backgrounds.push(bg);
    });
  }

  /**
   * Create physics platforms from level config
   */
  createPlatforms(platformDefs, worldWidth) {
    this.platforms = this.scene.physics.add.staticGroup();

    for (const p of platformDefs) {
      if (p.width <= 0 || p.height <= 0) continue;

      // Create platform using tiled graphics
      for (let x = p.x; x < p.x + p.width; x += TILE_SIZE) {
        for (let y = p.y; y < p.y + p.height; y += TILE_SIZE) {
          const isTop = (y === p.y);
          const tile = this.platforms.create(
            x + TILE_SIZE / 2,
            y + TILE_SIZE / 2,
            isTop ? 'tile_platform' : 'tile_ground'
          );
          tile.setDepth(DEPTH.TILES);
          tile.refreshBody();
        }
      }
    }

    return this.platforms;
  }

  /**
   * Create exit portal
   */
  createPortal(exitTileX) {
    const x = exitTileX * TILE_SIZE;
    const y = (this.currentLevel.height - 4) * TILE_SIZE;
    this.portal = this.scene.physics.add.sprite(x, y, 'portal', 0);
    this.portal.setDepth(DEPTH.COLLECTIBLES);
    this.portal.body.setSize(40, 50);
    this.portal.body.setAllowGravity(false);
    this.portal.body.setImmovable(true);

    // Animation
    this.scene.tweens.addCounter({
      from: 0,
      to: 3,
      duration: 800,
      repeat: -1,
      onUpdate: (tween) => {
        this.portal.setFrame(Math.floor(tween.getValue()));
      }
    });

    // Glow effect
    this.scene.tweens.add({
      targets: this.portal,
      alpha: { from: 0.7, to: 1 },
      duration: 1000,
      yoyo: true,
      repeat: -1
    });
  }

  /**
   * Create rain particle effect
   */
  createRain(worldWidth) {
    // Use simple rectangle particles for rain
    const rainCount = 100;
    for (let i = 0; i < rainCount; i++) {
      const drop = this.scene.add.rectangle(
        Math.random() * worldWidth,
        Math.random() * GAME_HEIGHT,
        1, 6 + Math.random() * 4,
        0x6688cc,
        0.2 + Math.random() * 0.2
      );
      drop.setDepth(DEPTH.EFFECTS + 5);
      drop.setScrollFactor(0.9, 1);

      // Animate rain falling
      this.scene.tweens.add({
        targets: drop,
        y: GAME_HEIGHT + 20,
        x: drop.x - 30,
        duration: 600 + Math.random() * 400,
        repeat: -1,
        onRepeat: () => {
          drop.x = Math.random() * worldWidth;
          drop.y = -10;
        }
      });
      this.rainEmitters.push(drop);
    }
  }

  /**
   * Create fog effect
   */
  createFog(worldWidth) {
    for (let i = 0; i < 3; i++) {
      const fog = this.scene.add.tileSprite(
        0, GAME_HEIGHT - 100 - i * 50,
        worldWidth, 80,
        'fog'
      );
      fog.setOrigin(0, 0);
      fog.setDepth(DEPTH.EFFECTS + 3);
      fog.setAlpha(0.15 + i * 0.05);
      fog.setScrollFactor(0.6 + i * 0.1, 0.8);

      // Slow horizontal drift
      this.scene.tweens.add({
        targets: fog,
        tilePositionX: 200,
        duration: 10000 + i * 3000,
        repeat: -1,
        yoyo: true
      });
      this.fogSprites.push(fog);
    }
  }

  /**
   * Get the platforms group for collision
   * @returns {Phaser.Physics.Arcade.StaticGroup}
   */
  getPlatforms() {
    return this.platforms;
  }

  /**
   * Get the portal sprite
   * @returns {Phaser.GameObjects.Sprite}
   */
  getPortal() {
    return this.portal;
  }

  /**
   * Get current level config
   * @returns {Object}
   */
  getLevelConfig() {
    return this.currentLevel;
  }

  /**
   * Check if there's a next level
   * @returns {boolean}
   */
  hasNextLevel() {
    return this.currentLevelIndex < LEVELS.length - 1;
  }

  /**
   * Clean up current level resources
   */
  cleanup() {
    this.backgrounds.forEach(bg => bg.destroy());
    this.backgrounds = [];
    this.rainEmitters.forEach(r => r.destroy());
    this.rainEmitters = [];
    this.fogSprites.forEach(f => f.destroy());
    this.fogSprites = [];
    if (this.platforms) {
      this.platforms.clear(true, true);
    }
    if (this.portal) {
      this.portal.destroy();
      this.portal = null;
    }
    this.currentLevel = null;
  }
}
