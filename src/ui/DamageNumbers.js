/**
 * DamageNumbers.js - Floating damage number display
 */
import { COLORS, DEPTH } from '../utils/Constants.js';

export class DamageNumbers {
  constructor(scene) {
    this.scene = scene;
    // Listen for damage number events
    scene.events.on('damageNumber', (x, y, amount, isPlayerDamage) => {
      this.show(x, y, amount, isPlayerDamage);
    });
  }

  /**
   * Show a floating damage number
   * @param {number} x
   * @param {number} y
   * @param {number} amount
   * @param {boolean} isPlayerDamage - True if damage to player (red), false if to enemy (white/yellow)
   */
  show(x, y, amount, isPlayerDamage) {
    const color = isPlayerDamage ? COLORS.TEXT_WARNING : COLORS.TEXT_GOLD;
    const fontSize = isPlayerDamage ? '14px' : (amount > 30 ? '16px' : '12px');

    const text = this.scene.add.text(x, y, `-${amount}`, {
      fontSize: fontSize,
      fontFamily: 'monospace',
      color: color,
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5).setDepth(DEPTH.UI + 5);

    // Float up and fade
    this.scene.tweens.add({
      targets: text,
      y: y - 40 - Math.random() * 20,
      x: x + (Math.random() - 0.5) * 30,
      alpha: 0,
      scaleX: amount > 30 ? 1.3 : 1,
      scaleY: amount > 30 ? 1.3 : 1,
      duration: 800,
      ease: 'Cubic.easeOut',
      onComplete: () => text.destroy()
    });
  }
}
