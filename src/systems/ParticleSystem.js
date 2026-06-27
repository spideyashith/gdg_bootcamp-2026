/**
 * ParticleSystem.js - Visual effects and particle management
 */
import { COLORS, DEPTH } from '../utils/Constants.js';

export class ParticleSystem {
  /**
   * @param {Phaser.Scene} scene
   */
  constructor(scene) {
    this.scene = scene;
  }

  /**
   * Create an explosion effect at position
   * @param {number} x
   * @param {number} y
   * @param {number} color - Particle color
   * @param {number} count - Number of particles
   */
  createExplosion(x, y, color = COLORS.NEON_ORANGE, count = 12) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = 80 + Math.random() * 120;
      const particle = this.scene.add.rectangle(x, y, 4, 4, color);
      particle.setDepth(DEPTH.EFFECTS);
      particle.setAlpha(0.9);

      this.scene.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * speed,
        y: y + Math.sin(angle) * speed,
        alpha: 0,
        scaleX: 0.2,
        scaleY: 0.2,
        duration: 400 + Math.random() * 200,
        ease: 'Cubic.easeOut',
        onComplete: () => particle.destroy()
      });
    }
  }

  /**
   * Create death effect for an enemy
   * @param {number} x
   * @param {number} y
   * @param {number} color
   */
  createDeathEffect(x, y, color) {
    this.createExplosion(x, y, color, 16);

    // Flash circle
    const flash = this.scene.add.circle(x, y, 30, 0xffffff, 0.6);
    flash.setDepth(DEPTH.EFFECTS);
    this.scene.tweens.add({
      targets: flash,
      scaleX: 2,
      scaleY: 2,
      alpha: 0,
      duration: 300,
      onComplete: () => flash.destroy()
    });
  }

  /**
   * Create dash trail afterimages
   * @param {number} x
   * @param {number} y
   * @param {boolean} flipX
   */
  createDashTrail(x, y, flipX) {
    for (let i = 0; i < 3; i++) {
      const afterimage = this.scene.add.rectangle(
        x - (flipX ? -1 : 1) * i * 12,
        y,
        24, 28,
        COLORS.NEON_BLUE,
        0.3 - i * 0.1
      );
      afterimage.setDepth(DEPTH.EFFECTS - 1);

      this.scene.tweens.add({
        targets: afterimage,
        alpha: 0,
        duration: 200 + i * 100,
        onComplete: () => afterimage.destroy()
      });
    }
  }

  /**
   * Create a hit spark effect
   * @param {number} x
   * @param {number} y
   */
  createHitSpark(x, y) {
    for (let i = 0; i < 6; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 20 + Math.random() * 30;
      const spark = this.scene.add.rectangle(x, y, 3, 3, COLORS.NEON_BLUE, 0.9);
      spark.setDepth(DEPTH.EFFECTS);

      this.scene.tweens.add({
        targets: spark,
        x: x + Math.cos(angle) * dist,
        y: y + Math.sin(angle) * dist,
        alpha: 0,
        duration: 200 + Math.random() * 100,
        onComplete: () => spark.destroy()
      });
    }
  }

  /**
   * Create screen flash effect
   * @param {number} color
   * @param {number} duration
   */
  createScreenFlash(color = 0xffffff, duration = 150) {
    const flash = this.scene.add.rectangle(
      this.scene.cameras.main.scrollX + this.scene.cameras.main.width / 2,
      this.scene.cameras.main.scrollY + this.scene.cameras.main.height / 2,
      this.scene.cameras.main.width,
      this.scene.cameras.main.height,
      color,
      0.3
    );
    flash.setDepth(DEPTH.OVERLAY);
    flash.setScrollFactor(0);

    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration: duration,
      onComplete: () => flash.destroy()
    });
  }

  /**
   * Create level-up effect around player
   * @param {number} x
   * @param {number} y
   */
  createLevelUpEffect(x, y) {
    // Rising particles
    for (let i = 0; i < 20; i++) {
      const px = x - 30 + Math.random() * 60;
      const particle = this.scene.add.rectangle(px, y + 20, 3, 3, COLORS.NEON_GREEN, 0.8);
      particle.setDepth(DEPTH.EFFECTS);

      this.scene.tweens.add({
        targets: particle,
        y: y - 60 - Math.random() * 40,
        alpha: 0,
        duration: 800 + Math.random() * 400,
        delay: i * 50,
        ease: 'Cubic.easeOut',
        onComplete: () => particle.destroy()
      });
    }

    // Text burst
    const lvlText = this.scene.add.text(x, y - 40, 'LEVEL UP!', {
      fontSize: '16px',
      fontFamily: 'monospace',
      color: '#00ff88',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5).setDepth(DEPTH.EFFECTS);

    this.scene.tweens.add({
      targets: lvlText,
      y: y - 80,
      alpha: 0,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: 1200,
      ease: 'Cubic.easeOut',
      onComplete: () => lvlText.destroy()
    });
  }

  /**
   * Create pickup sparkle effect
   * @param {number} x
   * @param {number} y
   * @param {number} color
   */
  createPickupEffect(x, y, color = COLORS.NEON_YELLOW) {
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8;
      const spark = this.scene.add.rectangle(x, y, 2, 2, color, 0.9);
      spark.setDepth(DEPTH.EFFECTS);

      this.scene.tweens.add({
        targets: spark,
        x: x + Math.cos(angle) * 25,
        y: y + Math.sin(angle) * 25,
        alpha: 0,
        duration: 300,
        ease: 'Cubic.easeOut',
        onComplete: () => spark.destroy()
      });
    }
  }
}
