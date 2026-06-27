/**
 * Enemy type implementations for Project Eclipse
 * Each extends EnemyBase with unique behaviors and attacks
 */
import { EnemyBase, ENEMY_STATE } from './EnemyBase.js';
import { DEPTH, COLORS, PROJECTILE_SPEED } from '../utils/Constants.js';
import { distance } from '../utils/MathUtils.js';

// ═══════════════════════════════════════════════════════════════════════════
// VIRUS - Basic melee enemy
// ═══════════════════════════════════════════════════════════════════════════
export class Virus extends EnemyBase {
  constructor(scene, x, y) {
    super(scene, x, y, 'enemy_virus', 'VIRUS');
    this.body.setSize(20, 20);
    this.body.setOffset(6, 6);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// MALWARE - Ranged enemy that fires projectiles
// ═══════════════════════════════════════════════════════════════════════════
export class Malware extends EnemyBase {
  constructor(scene, x, y) {
    super(scene, x, y, 'enemy_malware', 'MALWARE');
    this.body.setSize(20, 22);
    this.body.setOffset(6, 4);
    this.attackCooldownMax = 2000;
  }

  performAttack(player, time, delta) {
    if (this.attackCooldown > 0) return;

    // Fire projectile at player
    const dir = player.x > this.x ? 1 : -1;
    const proj = this.scene.physics.add.sprite(this.x + dir * 16, this.y, 'projectile_enemy', 0);
    proj.setDepth(DEPTH.PROJECTILES);
    proj.body.setAllowGravity(false);
    proj.setVelocityX(200 * dir);
    proj.setData('damage', this.damage);

    if (this.scene.enemyProjectiles) {
      this.scene.enemyProjectiles.add(proj);
    }

    this.scene.time.delayedCall(2000, () => {
      if (proj.active) proj.destroy();
    });

    this.attackCooldown = this.attackCooldownMax;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// FIREWALL GUARDIAN - Heavy melee tank
// ═══════════════════════════════════════════════════════════════════════════
export class FirewallGuardian extends EnemyBase {
  constructor(scene, x, y) {
    super(scene, x, y, 'enemy_guardian', 'FIREWALL_GUARDIAN');
    this.body.setSize(20, 26);
    this.body.setOffset(6, 3);
    this.attackCooldownMax = 1500;
  }

  chase(player, delta) {
    // Guardian moves slower but is relentless
    const dir = player.x > this.x ? 1 : -1;
    this.setVelocityX(this.moveSpeed * dir * 0.8);
    this.setFlipX(dir < 0);
  }

  takeDamage(amount, knockbackDir) {
    // Guardians take reduced knockback
    super.takeDamage(amount, knockbackDir * 0.3);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// DRONE - Flying enemy
// ═══════════════════════════════════════════════════════════════════════════
export class Drone extends EnemyBase {
  constructor(scene, x, y) {
    super(scene, x, y, 'enemy_drone', 'DRONE');
    this.body.setSize(18, 14);
    this.body.setOffset(7, 8);
    this.body.setAllowGravity(false);
    this.isFlying = true;
    this.floatY = y;
    this.floatTimer = 0;
    this.attackCooldownMax = 1800;
  }

  patrol(delta) {
    super.patrol(delta);
    // Floating up and down
    this.floatTimer += delta * 0.003;
    this.setVelocityY(Math.sin(this.floatTimer) * 30);
  }

  chase(player, delta) {
    const dirX = player.x > this.x ? 1 : -1;
    const dirY = player.y < this.y ? -1 : 1;
    this.setVelocityX(this.moveSpeed * dirX);
    this.setVelocityY(this.moveSpeed * 0.5 * dirY);
    this.setFlipX(dirX < 0);
  }

  performAttack(player, time, delta) {
    if (this.attackCooldown > 0) return;

    // Dive bomb attack
    const dir = player.x > this.x ? 1 : -1;
    const proj = this.scene.physics.add.sprite(this.x, this.y + 10, 'projectile_enemy', 0);
    proj.setDepth(DEPTH.PROJECTILES);
    proj.body.setAllowGravity(false);

    // Aim at player
    const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
    proj.setVelocity(Math.cos(angle) * 180, Math.sin(angle) * 180);
    proj.setData('damage', this.damage);

    if (this.scene.enemyProjectiles) {
      this.scene.enemyProjectiles.add(proj);
    }

    this.scene.time.delayedCall(2000, () => {
      if (proj.active) proj.destroy();
    });

    this.attackCooldown = this.attackCooldownMax;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// ELITE VIRUS - Faster, tougher virus
// ═══════════════════════════════════════════════════════════════════════════
export class EliteVirus extends EnemyBase {
  constructor(scene, x, y) {
    super(scene, x, y, 'enemy_elite', 'ELITE_VIRUS');
    this.body.setSize(22, 22);
    this.body.setOffset(5, 5);
    this.attackCooldownMax = 800;
  }

  chase(player, delta) {
    // Elite virus is fast and erratic
    const dir = player.x > this.x ? 1 : -1;
    this.setVelocityX(this.moveSpeed * dir);
    this.setFlipX(dir < 0);

    // Occasional jump
    if (this.body.blocked.down && Math.random() < 0.02) {
      this.setVelocityY(-250);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// MINI BOSS
// ═══════════════════════════════════════════════════════════════════════════
export class MiniBoss extends EnemyBase {
  constructor(scene, x, y) {
    super(scene, x, y, 'enemy_miniboss', 'MINI_BOSS');
    this.body.setSize(36, 40);
    this.body.setOffset(6, 4);
    this.attackCooldownMax = 1200;
    this.attackPattern = 0;
    this.setScale(1);
  }

  performAttack(player, time, delta) {
    if (this.attackCooldown > 0) return;

    this.attackPattern = (this.attackPattern + 1) % 3;

    switch (this.attackPattern) {
      case 0: // Ground slam
        this.groundSlam(player);
        break;
      case 1: // Projectile barrage
        this.projectileBarrage(player);
        break;
      case 2: // Charge
        this.charge(player);
        break;
    }

    this.attackCooldown = this.attackCooldownMax;
  }

  groundSlam(player) {
    if (this.scene.cameraSystem) this.scene.cameraSystem.shake(0.008, 300);
    if (this.scene.particleSystem) {
      this.scene.particleSystem.createExplosion(this.x, this.y + 20, COLORS.BOSS_COLOR, 10);
    }
    // Damage if player is close and on ground
    const dist = distance(this.x, this.y, player.x, player.y);
    if (dist < 80 && player.body.blocked.down) {
      player.takeDamage(this.damage);
    }
  }

  projectileBarrage(player) {
    for (let i = 0; i < 3; i++) {
      this.scene.time.delayedCall(i * 300, () => {
        if (!this.active) return;
        const dir = player.x > this.x ? 1 : -1;
        const proj = this.scene.physics.add.sprite(this.x + dir * 20, this.y - 10 + i * 10, 'projectile_enemy', 0);
        proj.setDepth(DEPTH.PROJECTILES);
        proj.body.setAllowGravity(false);
        proj.setVelocityX(250 * dir);
        proj.setData('damage', this.damage * 0.6);
        if (this.scene.enemyProjectiles) this.scene.enemyProjectiles.add(proj);
        this.scene.time.delayedCall(2000, () => { if (proj.active) proj.destroy(); });
      });
    }
  }

  charge(player) {
    const dir = player.x > this.x ? 1 : -1;
    this.setVelocityX(this.moveSpeed * 3 * dir);
    this.scene.time.delayedCall(600, () => {
      if (this.active) this.setVelocityX(0);
    });
  }

  takeDamage(amount, knockbackDir) {
    // Mini boss has reduced knockback
    super.takeDamage(amount, knockbackDir * 0.15);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// FINAL BOSS - Eclipse
// ═══════════════════════════════════════════════════════════════════════════
export class FinalBoss extends EnemyBase {
  constructor(scene, x, y) {
    super(scene, x, y, 'enemy_boss', 'FINAL_BOSS');
    this.body.setSize(48, 56);
    this.body.setOffset(8, 4);
    this.attackCooldownMax = 1500;
    this.phase = 1; // Boss has 3 phases
    this.attackPattern = 0;
    this.setScale(1);
  }

  update(time, delta) {
    // Update phase based on health
    const healthPercent = this.health / this.maxHealth;
    if (healthPercent < 0.33) this.phase = 3;
    else if (healthPercent < 0.66) this.phase = 2;

    super.update(time, delta);
  }

  performAttack(player, time, delta) {
    if (this.attackCooldown > 0) return;

    this.attackPattern = (this.attackPattern + 1) % (this.phase + 2);

    switch (this.attackPattern) {
      case 0: this.laserSweep(player); break;
      case 1: this.orbBarrage(player); break;
      case 2: this.teleportSlam(player); break;
      case 3: this.corruptionWave(player); break;
      case 4: this.desperation(player); break;
    }

    // Faster attacks in later phases
    this.attackCooldown = this.attackCooldownMax / this.phase;
  }

  laserSweep(player) {
    // Fire multiple projectiles in a fan
    const count = 3 + this.phase;
    const spreadAngle = Math.PI / 4;
    const baseAngle = Math.atan2(player.y - this.y, player.x - this.x);

    for (let i = 0; i < count; i++) {
      const angle = baseAngle - spreadAngle / 2 + (spreadAngle * i) / (count - 1);
      const proj = this.scene.physics.add.sprite(this.x, this.y, 'projectile_enemy', 0);
      proj.setDepth(DEPTH.PROJECTILES);
      proj.body.setAllowGravity(false);
      proj.setVelocity(Math.cos(angle) * 200, Math.sin(angle) * 200);
      proj.setData('damage', this.damage * 0.5);
      if (this.scene.enemyProjectiles) this.scene.enemyProjectiles.add(proj);
      this.scene.time.delayedCall(3000, () => { if (proj.active) proj.destroy(); });
    }
  }

  orbBarrage(player) {
    // Circular projectile burst
    const count = 8 * this.phase;
    for (let i = 0; i < count; i++) {
      this.scene.time.delayedCall(i * 80, () => {
        if (!this.active) return;
        const angle = (Math.PI * 2 * i) / count;
        const proj = this.scene.physics.add.sprite(this.x, this.y, 'projectile_enemy', 0);
        proj.setDepth(DEPTH.PROJECTILES);
        proj.body.setAllowGravity(false);
        proj.setVelocity(Math.cos(angle) * 150, Math.sin(angle) * 150);
        proj.setData('damage', this.damage * 0.3);
        if (this.scene.enemyProjectiles) this.scene.enemyProjectiles.add(proj);
        this.scene.time.delayedCall(2500, () => { if (proj.active) proj.destroy(); });
      });
    }
  }

  teleportSlam(player) {
    // Flash to player position
    if (this.scene.particleSystem) {
      this.scene.particleSystem.createExplosion(this.x, this.y, COLORS.BOSS_COLOR, 8);
    }
    this.setPosition(player.x, player.y - 60);
    this.setVelocityY(400);

    this.scene.time.delayedCall(500, () => {
      if (!this.active) return;
      if (this.scene.cameraSystem) this.scene.cameraSystem.shake(0.01, 300);
      if (this.scene.particleSystem) {
        this.scene.particleSystem.createExplosion(this.x, this.y + 20, COLORS.BOSS_COLOR, 12);
      }
      const dist = distance(this.x, this.y, player.x, player.y);
      if (dist < 80) player.takeDamage(this.damage);
    });
  }

  corruptionWave(player) {
    // Ground wave attack (phase 2+)
    for (let i = 0; i < 5; i++) {
      this.scene.time.delayedCall(i * 200, () => {
        if (!this.active) return;
        const dir = player.x > this.x ? 1 : -1;
        const wave = this.scene.add.rectangle(
          this.x + dir * (60 + i * 50), this.y + 20,
          20, 30, COLORS.BOSS_COLOR, 0.6
        );
        wave.setDepth(DEPTH.EFFECTS);

        const waveBody = this.scene.physics.add.existing(wave);
        wave.body.setAllowGravity(false);

        // Check overlap with player
        this.scene.physics.add.overlap(this.scene.player, wave, () => {
          player.takeDamage(this.damage * 0.4);
          wave.destroy();
        });

        this.scene.tweens.add({
          targets: wave,
          alpha: 0,
          duration: 800,
          onComplete: () => wave.destroy()
        });
      });
    }
  }

  desperation(player) {
    // Phase 3 only - massive attack
    if (this.scene.particleSystem) {
      this.scene.particleSystem.createScreenFlash(COLORS.BOSS_COLOR, 500);
    }
    if (this.scene.cameraSystem) this.scene.cameraSystem.shake(0.015, 500);
    // Rapid-fire projectiles
    for (let i = 0; i < 12; i++) {
      this.scene.time.delayedCall(i * 100, () => {
        if (!this.active) return;
        const angle = Math.random() * Math.PI * 2;
        const proj = this.scene.physics.add.sprite(this.x, this.y, 'projectile_enemy', 0);
        proj.setDepth(DEPTH.PROJECTILES);
        proj.body.setAllowGravity(false);
        proj.setVelocity(Math.cos(angle) * 250, Math.sin(angle) * 250);
        proj.setData('damage', this.damage * 0.35);
        if (this.scene.enemyProjectiles) this.scene.enemyProjectiles.add(proj);
        this.scene.time.delayedCall(2000, () => { if (proj.active) proj.destroy(); });
      });
    }
  }

  takeDamage(amount, knockbackDir) {
    // Boss has minimal knockback
    super.takeDamage(amount, knockbackDir * 0.05);
  }

  die() {
    // Override for special death sequence
    this.aiState = ENEMY_STATE.DEAD;
    this.setVelocity(0, 0);
    this.body.enable = false;

    // Epic death sequence
    if (this.scene.cameraSystem) this.scene.cameraSystem.shake(0.02, 2000);

    let explosionCount = 0;
    const deathInterval = this.scene.time.addEvent({
      delay: 200,
      repeat: 10,
      callback: () => {
        if (this.scene.particleSystem) {
          const ox = this.x + (Math.random() - 0.5) * 60;
          const oy = this.y + (Math.random() - 0.5) * 60;
          this.scene.particleSystem.createExplosion(ox, oy, COLORS.BOSS_COLOR, 8);
        }
        if (this.scene.audioSystem) this.scene.audioSystem.playSFX('explosion');
        explosionCount++;
      }
    });

    // Award XP and complete quest
    if (this.scene.player && this.scene.player.xpSystem) {
      this.scene.player.xpSystem.awardXP(this.xpReward);
    }
    if (this.scene.questSystem) {
      this.scene.questSystem.updateProgress('kill', 'FINAL_BOSS');
    }

    // Final death after sequence
    this.scene.time.delayedCall(2500, () => {
      if (this.healthBarBg) this.healthBarBg.destroy();
      if (this.healthBarFill) this.healthBarFill.destroy();

      if (this.scene.particleSystem) {
        this.scene.particleSystem.createExplosion(this.x, this.y, 0xffffff, 30);
        this.scene.particleSystem.createScreenFlash(0xffffff, 1000);
      }

      this.destroy();

      // Trigger victory
      this.scene.time.delayedCall(1500, () => {
        this.scene.events.emit('bossDefeated');
      });
    });
  }
}
