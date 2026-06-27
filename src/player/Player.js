/**
 * Player.js - Main player class for Project Eclipse
 * Handles movement, physics, state machine, health, energy, and all player systems
 */
import { 
  PLAYER_SPEED, PLAYER_RUN_SPEED, PLAYER_JUMP_FORCE, PLAYER_MAX_HEALTH, PLAYER_MAX_ENERGY,
  ENERGY_REGEN_RATE, INVINCIBILITY_DURATION, PLAYER_DASH_SPEED, PLAYER_DASH_DURATION,
  PLAYER_DOUBLE_JUMP_FORCE, DEPTH, COLORS, SWORD_DAMAGE, SWORD_COMBO_MULTIPLIER,
  PROJECTILE_DAMAGE, PROJECTILE_ENERGY_COST, PROJECTILE_SPEED, SWORD_RANGE,
  ATTACK_COOLDOWN, SHIELD_ENERGY_COST, LIGHTNING_SLASH_COST, LIGHTNING_SLASH_DAMAGE,
  ULTIMATE_ENERGY_COST, ULTIMATE_DAMAGE
} from '../utils/Constants.js';
import { clamp } from '../utils/MathUtils.js';
import { setupInputs, isActionDown, isActionJustDown } from '../config/Controls.js';

/**
 * Player state enumeration
 */
const STATE = {
  IDLE: 'idle',
  WALK: 'walk',
  RUN: 'run',
  JUMP: 'jump',
  FALL: 'fall',
  DASH: 'dash',
  ATTACK: 'attack',
  HURT: 'hurt',
  DEAD: 'dead'
};

export class Player extends Phaser.Physics.Arcade.Sprite {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x - Spawn X position
   * @param {number} y - Spawn Y position
   */
  constructor(scene, x, y) {
    super(scene, x, y, 'player_idle', 0);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDepth(DEPTH.PLAYER);
    this.setCollideWorldBounds(true);
    this.body.setSize(16, 28);
    this.body.setOffset(8, 4);

    // ─── State ─────────────────────────────────────────────────────────
    this.state = STATE.IDLE;
    this.facingRight = true;
    this.isGrounded = false;
    this.canDoubleJump = false;
    this.hasDoubleJumped = false;

    // ─── Stats ─────────────────────────────────────────────────────────
    this.health = PLAYER_MAX_HEALTH;
    this.maxHealth = PLAYER_MAX_HEALTH;
    this.energy = PLAYER_MAX_ENERGY;
    this.maxEnergy = PLAYER_MAX_ENERGY;
    this.playerLevel = 1;
    this.xp = 0;
    this.coins = 0;
    this.codeFragments = 0;
    this.upgradeChips = 0;

    // ─── Abilities ─────────────────────────────────────────────────────
    this.abilities = {
      dash: true,
      doubleJump: false,
      energyShield: false,
      lightningSlash: false,
      ultimate: false
    };

    // ─── Combat ────────────────────────────────────────────────────────
    this.attackCombo = 0;
    this.lastAttackTime = 0;
    this.isAttacking = false;
    this.attackHitbox = null;
    this.isInvincible = false;
    this.invincibilityTimer = null;
    this.shieldActive = false;

    // ─── Dash ──────────────────────────────────────────────────────────
    this.isDashing = false;
    this.dashCooldown = false;

    // ─── Systems ───────────────────────────────────────────────────────
    this.xpSystem = null;
    this.inventorySystem = null;

    // ─── Input ─────────────────────────────────────────────────────────
    this.keys = setupInputs(scene);

    // ─── Animation ─────────────────────────────────────────────────────
    this.animTimer = 0;
    this.animFrame = 0;
  }

  /**
   * Main update loop - called every frame
   * @param {number} time - Current time
   * @param {number} delta - Delta time in ms
   */
  update(time, delta) {
    if (this.state === STATE.DEAD) return;

    this.isGrounded = this.body.blocked.down || this.body.touching.down;

    if (this.isGrounded) {
      this.hasDoubleJumped = false;
    }

    // Energy regeneration
    this.energy = clamp(this.energy + (ENERGY_REGEN_RATE * delta / 1000), 0, this.maxEnergy);

    // Handle states
    if (this.state !== STATE.HURT && this.state !== STATE.DASH) {
      this.handleMovement(time, delta);
      this.handleJump(time);
      this.handleDash(time);
      this.handleAttack(time);
      this.handleAbilities(time);
    }

    // Update animation
    this.updateAnimation(delta);

    // Update facing direction visual
    this.setFlipX(!this.facingRight);

    // Emit stats update
    this.scene.events.emit('statsChanged');

    // Fall death
    if (this.y > this.scene.physics.world.bounds.height + 100) {
      this.takeDamage(this.health);
    }
  }

  /**
   * Handle horizontal movement
   */
  handleMovement(time, delta) {
    if (this.isAttacking) return;

    const left = isActionDown(this.keys, 'moveLeft');
    const right = isActionDown(this.keys, 'moveRight');
    const running = isActionDown(this.keys, 'dash'); // Shift = run when on ground, dash in air

    if (left) {
      this.facingRight = false;
      const speed = running ? -PLAYER_RUN_SPEED : -PLAYER_SPEED;
      this.setVelocityX(speed);
      this.state = this.isGrounded ? (running ? STATE.RUN : STATE.WALK) : STATE.JUMP;
    } else if (right) {
      this.facingRight = true;
      const speed = running ? PLAYER_RUN_SPEED : PLAYER_SPEED;
      this.setVelocityX(speed);
      this.state = this.isGrounded ? (running ? STATE.RUN : STATE.WALK) : STATE.JUMP;
    } else {
      this.setVelocityX(0);
      if (this.isGrounded) {
        this.state = STATE.IDLE;
      }
    }

    if (!this.isGrounded && this.body.velocity.y > 0) {
      this.state = STATE.FALL;
    }

    // Footstep sounds
    if (this.isGrounded && (left || right) && this.scene.audioSystem) {
      this._footstepTimer = (this._footstepTimer || 0) + delta;
      if (this._footstepTimer > 300) {
        this.scene.audioSystem.playSFX('footstep');
        this._footstepTimer = 0;
      }
    }
  }

  /**
   * Handle jumping and double jump
   */
  handleJump(time) {
    if (isActionJustDown(this.keys, 'jump')) {
      if (this.isGrounded) {
        this.setVelocityY(PLAYER_JUMP_FORCE);
        this.state = STATE.JUMP;
        this.canDoubleJump = this.abilities.doubleJump;
        if (this.scene.audioSystem) this.scene.audioSystem.playSFX('jump');
      } else if (this.canDoubleJump && !this.hasDoubleJumped) {
        this.setVelocityY(PLAYER_DOUBLE_JUMP_FORCE);
        this.hasDoubleJumped = true;
        this.canDoubleJump = false;
        if (this.scene.audioSystem) this.scene.audioSystem.playSFX('jump');
        // Double jump visual
        if (this.scene.particleSystem) {
          this.scene.particleSystem.createPickupEffect(this.x, this.y + 16, COLORS.NEON_BLUE);
        }
      }
    }
  }

  /**
   * Handle dash ability
   */
  handleDash(time) {
    if (!this.abilities.dash || this.dashCooldown) return;

    if (isActionJustDown(this.keys, 'dash') && !this.isGrounded) {
      this.performDash();
    }
  }

  /**
   * Execute dash
   */
  performDash() {
    if (this.dashCooldown || this.isDashing) return;

    this.isDashing = true;
    this.dashCooldown = true;
    this.state = STATE.DASH;

    const dir = this.facingRight ? 1 : -1;
    this.setVelocityX(PLAYER_DASH_SPEED * dir);
    this.setVelocityY(0);
    this.body.setAllowGravity(false);

    if (this.scene.audioSystem) this.scene.audioSystem.playSFX('dash');
    if (this.scene.particleSystem) {
      this.scene.particleSystem.createDashTrail(this.x, this.y, !this.facingRight);
    }

    // End dash after duration
    this.scene.time.delayedCall(PLAYER_DASH_DURATION, () => {
      this.isDashing = false;
      this.body.setAllowGravity(true);
      this.state = STATE.IDLE;
    });

    // Cooldown
    this.scene.time.delayedCall(PLAYER_DASH_DURATION + 500, () => {
      this.dashCooldown = false;
    });
  }

  /**
   * Handle attack input (sword combo + mouse projectile)
   */
  handleAttack(time) {
    // Sword attack on Space
    if (isActionJustDown(this.keys, 'attack') && !this.isAttacking) {
      this.performMeleeAttack(time);
    }

    // Projectile on mouse click
    if (this.scene.input.activePointer.isDown && this.scene.input.activePointer.getDuration() < 50) {
      if (time - this.lastAttackTime > ATTACK_COOLDOWN && this.energy >= PROJECTILE_ENERGY_COST) {
        this.fireProjectile();
        this.lastAttackTime = time;
      }
    }
  }

  /**
   * Perform melee sword attack (3-hit combo)
   */
  performMeleeAttack(time) {
    // Reset combo if too much time has passed
    if (time - this.lastAttackTime > 800) {
      this.attackCombo = 0;
    }

    this.isAttacking = true;
    this.lastAttackTime = time;

    const damage = Math.floor(SWORD_DAMAGE * SWORD_COMBO_MULTIPLIER[this.attackCombo]);

    // Create attack hitbox
    const dir = this.facingRight ? 1 : -1;
    const hitX = this.x + dir * SWORD_RANGE;
    const hitY = this.y;

    // Check enemies in range
    if (this.scene.enemies) {
      this.scene.enemies.getChildren().forEach(enemy => {
        if (enemy.active && Phaser.Math.Distance.Between(hitX, hitY, enemy.x, enemy.y) < SWORD_RANGE) {
          enemy.takeDamage(damage, dir);
        }
      });
    }

    // Visual slash effect
    if (this.scene.particleSystem) {
      this.scene.particleSystem.createHitSpark(hitX, hitY);
    }

    if (this.scene.audioSystem) this.scene.audioSystem.playSFX('swordSlash');
    if (this.scene.cameraSystem) this.scene.cameraSystem.shake(0.003, 100);

    // Advance combo
    this.attackCombo = (this.attackCombo + 1) % 3;

    // Attack duration
    this.scene.time.delayedCall(ATTACK_COOLDOWN, () => {
      this.isAttacking = false;
    });
  }

  /**
   * Fire energy projectile
   */
  fireProjectile() {
    if (this.energy < PROJECTILE_ENERGY_COST) return;
    this.energy -= PROJECTILE_ENERGY_COST;

    const dir = this.facingRight ? 1 : -1;
    const projectile = this.scene.physics.add.sprite(
      this.x + dir * 20, this.y, 'projectile_energy', 0
    );
    projectile.setDepth(DEPTH.PROJECTILES);
    projectile.body.setAllowGravity(false);
    projectile.setVelocityX(PROJECTILE_SPEED * dir);
    projectile.setFlipX(!this.facingRight);
    projectile.setData('damage', PROJECTILE_DAMAGE);

    // Animate
    this.scene.tweens.addCounter({
      from: 0, to: 3, duration: 300, repeat: -1,
      onUpdate: (t) => projectile.setFrame(Math.floor(t.getValue()))
    });

    // Add to projectile group for collision
    if (this.scene.playerProjectiles) {
      this.scene.playerProjectiles.add(projectile);
    }

    // Destroy after distance
    this.scene.time.delayedCall(1500, () => {
      if (projectile.active) projectile.destroy();
    });

    if (this.scene.audioSystem) this.scene.audioSystem.playSFX('projectile');
  }

  /**
   * Handle special abilities
   */
  handleAbilities(time) {
    // Energy Shield (hold E when unlocked at level 5)
    if (this.abilities.energyShield && isActionDown(this.keys, 'interact')) {
      if (this.energy > 1 && !this.shieldActive) {
        this.activateShield();
      }
    } else if (this.shieldActive) {
      this.deactivateShield();
    }

    // Ultimate (R key)
    if (this.abilities.ultimate && isActionJustDown(this.keys, 'ultimate')) {
      this.performUltimate();
    }
  }

  /**
   * Activate energy shield
   */
  activateShield() {
    this.shieldActive = true;
    this.isInvincible = true;

    if (!this._shieldVisual) {
      this._shieldVisual = this.scene.add.circle(this.x, this.y, 24, COLORS.SHIELD_COLOR, 0.2);
      this._shieldVisual.setDepth(DEPTH.EFFECTS);
      this._shieldVisual.setStrokeStyle(2, COLORS.SHIELD_COLOR, 0.6);
    }

    // Drain energy
    this.energy -= 0.5;
    if (this.energy <= 0) {
      this.deactivateShield();
    }

    if (this.scene.audioSystem && !this._shieldSoundPlayed) {
      this.scene.audioSystem.playSFX('shieldActivate');
      this._shieldSoundPlayed = true;
    }
  }

  /**
   * Deactivate energy shield
   */
  deactivateShield() {
    this.shieldActive = false;
    this.isInvincible = false;
    this._shieldSoundPlayed = false;
    if (this._shieldVisual) {
      this._shieldVisual.destroy();
      this._shieldVisual = null;
    }
  }

  /**
   * Perform ultimate attack (area damage)
   */
  performUltimate() {
    if (this.energy < ULTIMATE_ENERGY_COST) return;
    this.energy -= ULTIMATE_ENERGY_COST;

    // Damage all enemies in range
    if (this.scene.enemies) {
      this.scene.enemies.getChildren().forEach(enemy => {
        if (enemy.active && Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y) < 200) {
          enemy.takeDamage(ULTIMATE_DAMAGE, this.facingRight ? 1 : -1);
        }
      });
    }

    // Massive visual effect
    if (this.scene.particleSystem) {
      this.scene.particleSystem.createExplosion(this.x, this.y, COLORS.NEON_PURPLE, 24);
      this.scene.particleSystem.createScreenFlash(COLORS.NEON_PURPLE, 300);
    }
    if (this.scene.cameraSystem) this.scene.cameraSystem.shake(0.01, 400);
    if (this.scene.audioSystem) this.scene.audioSystem.playSFX('ultimate');
  }

  /**
   * Take damage from an enemy or hazard
   * @param {number} amount
   */
  takeDamage(amount) {
    if (this.isInvincible || this.state === STATE.DEAD) return;

    if (this.shieldActive) {
      this.energy -= amount;
      if (this.energy <= 0) {
        this.deactivateShield();
      }
      return;
    }

    this.health -= amount;
    this.state = STATE.HURT;
    this.isInvincible = true;

    // Knockback
    this.setVelocityY(-200);
    this.setVelocityX(this.facingRight ? -150 : 150);

    // Flash effect
    this.setTint(0xff0000);

    if (this.scene.audioSystem) this.scene.audioSystem.playSFX('hurt');
    if (this.scene.cameraSystem) this.scene.cameraSystem.shake(0.008, 200);
    if (this.scene.particleSystem) this.scene.particleSystem.createScreenFlash(0xff0000, 150);

    // Damage number
    this.scene.events.emit('damageNumber', this.x, this.y - 20, amount, true);

    // Recovery
    this.scene.time.delayedCall(300, () => {
      if (this.state !== STATE.DEAD) {
        this.state = STATE.IDLE;
      }
    });

    // Invincibility frames with flashing
    const flashTimer = this.scene.time.addEvent({
      delay: 100,
      repeat: Math.floor(INVINCIBILITY_DURATION / 100),
      callback: () => {
        this.setAlpha(this.alpha === 1 ? 0.5 : 1);
      }
    });

    this.scene.time.delayedCall(INVINCIBILITY_DURATION, () => {
      this.isInvincible = false;
      this.setAlpha(1);
      this.clearTint();
      flashTimer.remove();
    });

    // Check death
    if (this.health <= 0) {
      this.health = 0;
      this.die();
    }

    this.scene.events.emit('statsChanged');
  }

  /**
   * Handle player death
   */
  die() {
    this.state = STATE.DEAD;
    this.setVelocity(0, 0);
    this.body.setAllowGravity(false);
    this.setAlpha(0.5);

    if (this.scene.audioSystem) this.scene.audioSystem.playSFX('explosion');
    if (this.scene.particleSystem) {
      this.scene.particleSystem.createExplosion(this.x, this.y, COLORS.NEON_RED, 20);
    }

    this.scene.time.delayedCall(1500, () => {
      this.scene.events.emit('playerDeath');
    });
  }

  /**
   * Heal the player
   * @param {number} amount
   */
  heal(amount) {
    this.health = clamp(this.health + amount, 0, this.maxHealth);
    this.scene.events.emit('statsChanged');
  }

  /**
   * Restore energy
   * @param {number} amount
   */
  restoreEnergy(amount) {
    this.energy = clamp(this.energy + amount, 0, this.maxEnergy);
    this.scene.events.emit('statsChanged');
  }

  /**
   * Update sprite animation based on state
   */
  updateAnimation(delta) {
    this.animTimer += delta;
    const frameDelay = this.state === STATE.RUN ? 100 : 150;

    if (this.animTimer >= frameDelay) {
      this.animTimer = 0;
      this.animFrame++;
    }

    const textureMap = {
      [STATE.IDLE]:   { key: 'player_idle', frames: 4 },
      [STATE.WALK]:   { key: 'player_walk', frames: 6 },
      [STATE.RUN]:    { key: 'player_run', frames: 6 },
      [STATE.JUMP]:   { key: 'player_jump', frames: 1 },
      [STATE.FALL]:   { key: 'player_jump', frames: 1 },
      [STATE.DASH]:   { key: 'player_idle', frames: 4 },
      [STATE.ATTACK]: { key: 'player_idle', frames: 4 },
      [STATE.HURT]:   { key: 'player_hurt', frames: 2 },
      [STATE.DEAD]:   { key: 'player_dead', frames: 1 }
    };

    const anim = textureMap[this.state] || textureMap[STATE.IDLE];
    const frame = this.animFrame % anim.frames;

    if (this.texture.key !== anim.key) {
      this.setTexture(anim.key, frame);
    } else {
      this.setFrame(frame);
    }

    // Update shield position
    if (this._shieldVisual) {
      this._shieldVisual.setPosition(this.x, this.y);
    }
  }

  /**
   * Load player state from save data
   * @param {Object} saveData
   */
  loadFromSave(saveData) {
    if (!saveData) return;
    if (saveData.player) {
      this.health = saveData.player.health;
      this.energy = saveData.player.energy;
      this.playerLevel = saveData.player.level;
      this.xp = saveData.player.xp;
      this.coins = saveData.player.coins;
      this.codeFragments = saveData.player.codeFragments || 0;
      this.upgradeChips = saveData.player.upgradeChips || 0;
    }
    if (saveData.abilities) {
      this.abilities = { ...this.abilities, ...saveData.abilities };
    }
  }

  /**
   * Check if player is alive
   * @returns {boolean}
   */
  isAlive() {
    return this.state !== STATE.DEAD;
  }
}
