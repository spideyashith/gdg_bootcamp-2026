/**
 * EnemyBase.js - Base class for all enemies in Project Eclipse
 * Provides common AI, damage, death, and loot functionality
 */
import { DEPTH, COLORS, ENEMY_STATS } from '../utils/Constants.js';
import { distance } from '../utils/MathUtils.js';

/**
 * Enemy AI states
 */
export const ENEMY_STATE = {
  IDLE: 'idle',
  PATROL: 'patrol',
  DETECT: 'detect',
  CHASE: 'chase',
  ATTACK: 'attack',
  HURT: 'hurt',
  DEAD: 'dead'
};

export class EnemyBase extends Phaser.Physics.Arcade.Sprite {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {string} textureKey - Sprite texture
   * @param {string} enemyType - Key in ENEMY_STATS
   */
  constructor(scene, x, y, textureKey, enemyType) {
    super(scene, x, y, textureKey, 0);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDepth(DEPTH.ENEMIES);
    this.setCollideWorldBounds(true);

    // Stats from config
    const stats = ENEMY_STATS[enemyType] || ENEMY_STATS.VIRUS;
    this.enemyType = enemyType;
    this.maxHealth = stats.health;
    this.health = stats.health;
    this.damage = stats.damage;
    this.moveSpeed = stats.speed;
    this.xpReward = stats.xp;
    this.detectionRange = stats.detectionRange;
    this.attackRange = stats.attackRange;

    // AI State
    this.aiState = ENEMY_STATE.IDLE;
    this.patrolDirection = 1;
    this.patrolTimer = 0;
    this.patrolDuration = 2000 + Math.random() * 2000;
    this.attackCooldown = 0;
    this.attackCooldownMax = 1000;
    this.isFlying = false;

    // Animation
    this.animTimer = 0;
    this.animFrame = 0;
    this.frameCount = 4;

    // Health bar
    this.healthBarBg = null;
    this.healthBarFill = null;
    this.createHealthBar();

    // Start patrolling
    this.startPatrol();
  }

  /**
   * Create floating health bar above enemy
   */
  createHealthBar() {
    this.healthBarBg = this.scene.add.rectangle(this.x, this.y - 20, 30, 4, 0x333333, 0.7);
    this.healthBarBg.setDepth(DEPTH.UI - 5);
    this.healthBarFill = this.scene.add.rectangle(this.x, this.y - 20, 30, 4, COLORS.HEALTH_BAR, 0.8);
    this.healthBarFill.setDepth(DEPTH.UI - 4);
    this.healthBarFill.setOrigin(0, 0.5);
  }

  /**
   * Update health bar position and width
   */
  updateHealthBar() {
    if (!this.healthBarBg || !this.healthBarFill) return;
    const barWidth = 30;
    this.healthBarBg.setPosition(this.x, this.y - 24);
    this.healthBarFill.setPosition(this.x - barWidth / 2, this.y - 24);
    this.healthBarFill.width = barWidth * (this.health / this.maxHealth);
  }

  /**
   * Main update loop
   * @param {number} time
   * @param {number} delta
   */
  update(time, delta) {
    if (this.aiState === ENEMY_STATE.DEAD) return;

    const player = this.scene.player;
    if (!player || !player.isAlive()) {
      this.aiState = ENEMY_STATE.IDLE;
      this.setVelocityX(0);
      this.updateAnimation(delta);
      this.updateHealthBar();
      return;
    }

    const dist = distance(this.x, this.y, player.x, player.y);

    // AI state transitions
    switch (this.aiState) {
      case ENEMY_STATE.IDLE:
      case ENEMY_STATE.PATROL:
        if (dist < this.detectionRange) {
          this.aiState = ENEMY_STATE.CHASE;
        } else {
          this.patrol(delta);
        }
        break;

      case ENEMY_STATE.CHASE:
        if (dist > this.detectionRange * 1.5) {
          this.aiState = ENEMY_STATE.PATROL;
          this.startPatrol();
        } else if (dist < this.attackRange) {
          this.aiState = ENEMY_STATE.ATTACK;
        } else {
          this.chase(player, delta);
        }
        break;

      case ENEMY_STATE.ATTACK:
        if (dist > this.attackRange * 1.5) {
          this.aiState = ENEMY_STATE.CHASE;
        } else {
          this.performAttack(player, time, delta);
        }
        break;

      case ENEMY_STATE.HURT:
        // Brief stun then back to chase
        break;
    }

    this.attackCooldown = Math.max(0, this.attackCooldown - delta);
    this.updateAnimation(delta);
    this.updateHealthBar();
  }

  /**
   * Patrol behavior - walk back and forth
   */
  patrol(delta) {
    this.patrolTimer += delta;
    if (this.patrolTimer >= this.patrolDuration) {
      this.patrolDirection *= -1;
      this.patrolTimer = 0;
      this.patrolDuration = 2000 + Math.random() * 2000;
    }

    this.setVelocityX(this.moveSpeed * 0.4 * this.patrolDirection);
    this.setFlipX(this.patrolDirection < 0);
  }

  /**
   * Start patrol from current state
   */
  startPatrol() {
    this.aiState = ENEMY_STATE.PATROL;
    this.patrolTimer = 0;
  }

  /**
   * Chase the player
   * @param {Object} player
   * @param {number} delta
   */
  chase(player, delta) {
    const dir = player.x > this.x ? 1 : -1;
    this.setVelocityX(this.moveSpeed * dir);
    this.setFlipX(dir < 0);
  }

  /**
   * Perform attack on player (override in subclasses for custom attacks)
   * @param {Object} player
   * @param {number} time
   * @param {number} delta
   */
  performAttack(player, time, delta) {
    if (this.attackCooldown > 0) return;

    // Default: melee damage if in range
    const dist = distance(this.x, this.y, player.x, player.y);
    if (dist < this.attackRange) {
      player.takeDamage(this.damage);
      this.attackCooldown = this.attackCooldownMax;
    }
  }

  /**
   * Take damage from the player
   * @param {number} amount
   * @param {number} knockbackDir - Direction of knockback (1 or -1)
   */
  takeDamage(amount, knockbackDir = 0) {
    if (this.aiState === ENEMY_STATE.DEAD) return;

    this.health -= amount;
    this.aiState = ENEMY_STATE.HURT;

    // Knockback
    this.setVelocityX(knockbackDir * 150);
    this.setVelocityY(-100);

    // Flash white
    this.setTint(0xffffff);
    this.scene.time.delayedCall(100, () => {
      if (this.active) this.clearTint();
    });

    // Damage number
    this.scene.events.emit('damageNumber', this.x, this.y - 16, amount, false);

    // Hit effects
    if (this.scene.particleSystem) {
      this.scene.particleSystem.createHitSpark(this.x, this.y);
    }

    // Recovery
    this.scene.time.delayedCall(300, () => {
      if (this.aiState !== ENEMY_STATE.DEAD) {
        this.aiState = ENEMY_STATE.CHASE;
      }
    });

    // Death check
    if (this.health <= 0) {
      this.die();
    }
  }

  /**
   * Handle enemy death
   */
  die() {
    this.aiState = ENEMY_STATE.DEAD;
    this.setVelocity(0, 0);
    this.body.enable = false;

    // Death effect
    const colorMap = {
      VIRUS: COLORS.VIRUS_COLOR,
      MALWARE: COLORS.MALWARE_COLOR,
      FIREWALL_GUARDIAN: COLORS.GUARDIAN_COLOR,
      DRONE: COLORS.DRONE_COLOR,
      ELITE_VIRUS: COLORS.ELITE_COLOR,
      MINI_BOSS: COLORS.BOSS_COLOR,
      FINAL_BOSS: COLORS.BOSS_COLOR
    };

    if (this.scene.particleSystem) {
      this.scene.particleSystem.createDeathEffect(this.x, this.y, colorMap[this.enemyType] || COLORS.NEON_RED);
    }
    if (this.scene.audioSystem) {
      this.scene.audioSystem.playSFX('enemyDeath');
    }

    // Award XP
    if (this.scene.player && this.scene.player.xpSystem) {
      const result = this.scene.player.xpSystem.awardXP(this.xpReward);
      if (result.leveled && this.scene.particleSystem) {
        this.scene.particleSystem.createLevelUpEffect(this.scene.player.x, this.scene.player.y);
        if (this.scene.audioSystem) this.scene.audioSystem.playSFX('levelUp');
      }
    }

    // Drop loot
    if (this.scene.collectibleSystem) {
      this.scene.collectibleSystem.spawnLoot(this.x, this.y, this.enemyType);
    }

    // Quest progress
    if (this.scene.questSystem) {
      this.scene.questSystem.updateProgress('kill', this.enemyType);
    }

    // Remove health bar and sprite
    if (this.healthBarBg) this.healthBarBg.destroy();
    if (this.healthBarFill) this.healthBarFill.destroy();

    // Fade out and destroy
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      duration: 300,
      onComplete: () => {
        this.destroy();
      }
    });
  }

  /**
   * Update sprite animation
   */
  updateAnimation(delta) {
    this.animTimer += delta;
    if (this.animTimer >= 200) {
      this.animTimer = 0;
      this.animFrame = (this.animFrame + 1) % this.frameCount;
      this.setFrame(this.animFrame);
    }
  }

  /**
   * Clean up on destroy
   */
  destroy(fromScene) {
    if (this.healthBarBg) { this.healthBarBg.destroy(); this.healthBarBg = null; }
    if (this.healthBarFill) { this.healthBarFill.destroy(); this.healthBarFill = null; }
    super.destroy(fromScene);
  }
}
