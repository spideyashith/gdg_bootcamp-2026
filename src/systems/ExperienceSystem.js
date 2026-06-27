/**
 * ExperienceSystem.js - XP, leveling, and ability unlock system
 */
import { XP_PER_LEVEL, MAX_LEVEL, ABILITY_UNLOCK } from '../utils/Constants.js';

export class ExperienceSystem {
  /**
   * @param {Phaser.Scene} scene - The game scene
   * @param {Object} player - Player object reference
   */
  constructor(scene, player) {
    this.scene = scene;
    this.player = player;
  }

  /**
   * Award XP to the player and check for level ups
   * @param {number} amount - XP to award
   * @returns {Object} { leveled: boolean, newLevel: number, abilitiesUnlocked: string[] }
   */
  awardXP(amount) {
    if (this.player.playerLevel >= MAX_LEVEL) {
      return { leveled: false, newLevel: this.player.playerLevel, abilitiesUnlocked: [] };
    }

    this.player.xp += amount;
    const result = { leveled: false, newLevel: this.player.playerLevel, abilitiesUnlocked: [] };

    // Check for level up(s)
    while (this.player.playerLevel < MAX_LEVEL &&
           this.player.xp >= this.getXPForNextLevel()) {
      this.player.playerLevel++;
      result.leveled = true;
      result.newLevel = this.player.playerLevel;

      // Check ability unlocks
      const unlocked = this.checkAbilityUnlocks(this.player.playerLevel);
      result.abilitiesUnlocked.push(...unlocked);

      // Emit level up event
      this.scene.events.emit('levelUp', this.player.playerLevel);
    }

    // Update HUD
    this.scene.events.emit('xpChanged', this.player.xp, this.getXPForNextLevel());

    return result;
  }

  /**
   * Get XP required for the next level
   * @returns {number}
   */
  getXPForNextLevel() {
    if (this.player.playerLevel >= MAX_LEVEL) return Infinity;
    return XP_PER_LEVEL[this.player.playerLevel] || 999999;
  }

  /**
   * Get current XP progress as a fraction (0-1)
   * @returns {number}
   */
  getProgress() {
    const currentLevelXP = XP_PER_LEVEL[this.player.playerLevel - 1] || 0;
    const nextLevelXP = this.getXPForNextLevel();
    if (nextLevelXP === Infinity) return 1;
    return (this.player.xp - currentLevelXP) / (nextLevelXP - currentLevelXP);
  }

  /**
   * Check and unlock abilities for the given level
   * @param {number} level
   * @returns {string[]} Names of newly unlocked abilities
   */
  checkAbilityUnlocks(level) {
    const unlocked = [];
    for (const [ability, unlockLevel] of Object.entries(ABILITY_UNLOCK)) {
      const key = ability.toLowerCase().replace(/_/g, '');
      const camelKey = this._toCamelCase(ability);
      if (level >= unlockLevel && !this.player.abilities[camelKey]) {
        this.player.abilities[camelKey] = true;
        unlocked.push(ability.replace(/_/g, ' '));
      }
    }
    return unlocked;
  }

  /**
   * Convert SCREAMING_SNAKE to camelCase
   */
  _toCamelCase(str) {
    return str.toLowerCase().replace(/_([a-z])/g, (_, c) => c.toUpperCase());
  }
}
