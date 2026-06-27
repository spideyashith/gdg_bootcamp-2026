/**
 * CollectibleSystem.js - Handles loot drops and collectible pickups
 */
import { COLORS, DEPTH, COLLECTIBLE_VALUES, LOOT_TABLES } from '../utils/Constants.js';
import { rollChance } from '../utils/MathUtils.js';

export class CollectibleSystem {
  /**
   * @param {Phaser.Scene} scene
   */
  constructor(scene) {
    this.scene = scene;
    /** @type {Phaser.Physics.Arcade.Group} */
    this.collectibles = scene.physics.add.group({ allowGravity: true });
  }

  /**
   * Spawn collectibles at a position based on a loot table
   * @param {number} x
   * @param {number} y
   * @param {string} enemyType - Key into LOOT_TABLES
   */
  spawnLoot(x, y, enemyType) {
    const table = LOOT_TABLES[enemyType];
    if (!table) return;

    const drops = [];
    if (rollChance(table.coin)) drops.push('COIN');
    if (rollChance(table.healthPack)) drops.push('HEALTH_PACK');
    if (rollChance(table.energyCell)) drops.push('ENERGY_CELL');
    if (rollChance(table.codeFragment)) drops.push('CODE_FRAGMENT');
    if (rollChance(table.upgradeChip)) drops.push('UPGRADE_CHIP');

    drops.forEach((type, i) => {
      this.spawnCollectible(x + (i - drops.length / 2) * 16, y - 10, type);
    });
  }

  /**
   * Spawn a single collectible at a position
   * @param {number} x
   * @param {number} y
   * @param {string} type
   */
  spawnCollectible(x, y, type) {
    const textureMap = {
      COIN: 'collect_coin',
      HEALTH_PACK: 'collect_health',
      ENERGY_CELL: 'collect_energy',
      CODE_FRAGMENT: 'collect_code',
      UPGRADE_CHIP: 'collect_upgrade'
    };

    const texture = textureMap[type] || 'collect_coin';
    const collectible = this.scene.physics.add.sprite(x, y, texture, 0);
    collectible.setDepth(DEPTH.COLLECTIBLES);
    collectible.setData('type', type);
    collectible.setBounce(0.4);
    collectible.setDragX(100);
    collectible.body.setSize(12, 12);

    // Bobbing animation
    this.scene.tweens.add({
      targets: collectible,
      y: collectible.y - 6,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Frame animation
    if (collectible.texture.frameTotal > 1) {
      this.scene.tweens.addCounter({
        from: 0,
        to: 3,
        duration: 600,
        repeat: -1,
        onUpdate: (tween) => {
          collectible.setFrame(Math.floor(tween.getValue()));
        }
      });
    }

    this.collectibles.add(collectible);

    // Add a small upward velocity for loot drops
    collectible.setVelocity(
      (Math.random() - 0.5) * 100,
      -150 - Math.random() * 50
    );

    return collectible;
  }

  /**
   * Spawn collectibles from level config
   * @param {Array} collectibleDefs
   */
  spawnFromConfig(collectibleDefs) {
    for (const def of collectibleDefs) {
      const c = this.spawnCollectible(def.x * 32, def.y * 32, def.type);
      // Level collectibles don't need initial velocity
      c.setVelocity(0, 0);
    }
  }

  /**
   * Handle collectible pickup
   * @param {Phaser.GameObjects.Sprite} player
   * @param {Phaser.GameObjects.Sprite} collectible
   */
  collect(player, collectible) {
    const type = collectible.getData('type');
    const playerObj = this.scene.player;

    switch (type) {
      case 'COIN':
        playerObj.coins += COLLECTIBLE_VALUES.COIN;
        break;
      case 'HEALTH_PACK':
        if (playerObj.inventorySystem) {
          playerObj.inventorySystem.addItem('HEALTH_PACK');
        } else {
          playerObj.heal(COLLECTIBLE_VALUES.HEALTH_PACK);
        }
        break;
      case 'ENERGY_CELL':
        if (playerObj.inventorySystem) {
          playerObj.inventorySystem.addItem('ENERGY_CELL');
        } else {
          playerObj.restoreEnergy(COLLECTIBLE_VALUES.ENERGY_CELL);
        }
        break;
      case 'CODE_FRAGMENT':
        playerObj.codeFragments += COLLECTIBLE_VALUES.CODE_FRAGMENT;
        this.scene.questSystem.updateProgress('collect', 'CODE_FRAGMENT');
        break;
      case 'UPGRADE_CHIP':
        playerObj.upgradeChips += COLLECTIBLE_VALUES.UPGRADE_CHIP;
        break;
    }

    // Effects
    if (this.scene.particleSystem) {
      const colorMap = {
        COIN: COLORS.NEON_YELLOW,
        HEALTH_PACK: COLORS.HEALTH_BAR,
        ENERGY_CELL: COLORS.NEON_BLUE,
        CODE_FRAGMENT: COLORS.NEON_PURPLE,
        UPGRADE_CHIP: COLORS.NEON_GREEN
      };
      this.scene.particleSystem.createPickupEffect(collectible.x, collectible.y, colorMap[type]);
    }

    if (this.scene.audioSystem) {
      this.scene.audioSystem.playSFX('pickup');
    }

    // Update UI
    this.scene.events.emit('statsChanged');

    // Remove collectible
    collectible.destroy();
  }

  /**
   * Get the physics group (for collision setup)
   * @returns {Phaser.Physics.Arcade.Group}
   */
  getGroup() {
    return this.collectibles;
  }

  /**
   * Clean up all collectibles
   */
  destroy() {
    this.collectibles.clear(true, true);
  }
}
