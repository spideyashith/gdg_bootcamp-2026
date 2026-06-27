/**
 * QuestSystem.js - Quest tracking, objectives, and reward system
 */

/**
 * Quest states
 */
export const QUEST_STATE = {
  AVAILABLE: 'available',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  REWARDED: 'rewarded'
};

export class QuestSystem {
  /**
   * @param {Phaser.Scene} scene
   */
  constructor(scene) {
    this.scene = scene;
    /** @type {Map<string, Object>} */
    this.quests = new Map();
    /** @type {Map<string, Object>} Track objective progress */
    this.progress = new Map();
  }

  /**
   * Register quests from level config
   * @param {Array} questDefs - Quest definitions from LevelConfig
   */
  registerQuests(questDefs) {
    for (const def of questDefs) {
      if (!this.quests.has(def.id)) {
        this.quests.set(def.id, {
          ...def,
          state: QUEST_STATE.AVAILABLE,
          objectiveProgress: def.objectives.map(() => 0)
        });
      }
    }
  }

  /**
   * Activate a quest
   * @param {string} questId
   */
  activateQuest(questId) {
    const quest = this.quests.get(questId);
    if (quest && quest.state === QUEST_STATE.AVAILABLE) {
      quest.state = QUEST_STATE.ACTIVE;
      this.scene.events.emit('questActivated', quest);
      console.log(`[Quest] Activated: ${quest.name}`);
    }
  }

  /**
   * Auto-activate all available quests for current level
   */
  activateAllAvailable() {
    for (const [id, quest] of this.quests) {
      if (quest.state === QUEST_STATE.AVAILABLE) {
        this.activateQuest(id);
      }
    }
  }

  /**
   * Update quest progress based on an event
   * @param {string} eventType - 'kill', 'collect', 'reach'
   * @param {string} target - Target identifier
   * @param {number} count - Amount (default 1)
   */
  updateProgress(eventType, target, count = 1) {
    for (const [id, quest] of this.quests) {
      if (quest.state !== QUEST_STATE.ACTIVE) continue;

      for (let i = 0; i < quest.objectives.length; i++) {
        const obj = quest.objectives[i];
        if (obj.type === eventType && obj.target === target) {
          quest.objectiveProgress[i] = Math.min(
            (quest.objectiveProgress[i] || 0) + count,
            obj.count || 1
          );
          this.scene.events.emit('questProgress', quest, i);
        }
      }

      // Check if all objectives are complete
      if (this.isQuestComplete(id)) {
        quest.state = QUEST_STATE.COMPLETED;
        this.scene.events.emit('questCompleted', quest);
        console.log(`[Quest] Completed: ${quest.name}`);
      }
    }
  }

  /**
   * Check if all objectives for a quest are met
   * @param {string} questId
   * @returns {boolean}
   */
  isQuestComplete(questId) {
    const quest = this.quests.get(questId);
    if (!quest) return false;

    return quest.objectives.every((obj, i) => {
      const target = obj.count || 1;
      return (quest.objectiveProgress[i] || 0) >= target;
    });
  }

  /**
   * Claim rewards for a completed quest
   * @param {string} questId
   * @param {Object} player - Player reference
   * @returns {Object|null} Rewards object or null
   */
  claimRewards(questId, player) {
    const quest = this.quests.get(questId);
    if (!quest || quest.state !== QUEST_STATE.COMPLETED) return null;

    quest.state = QUEST_STATE.REWARDED;
    const rewards = quest.rewards;

    if (rewards.xp && player.xpSystem) {
      player.xpSystem.awardXP(rewards.xp);
    }
    if (rewards.coins) {
      player.coins += rewards.coins;
    }
    if (rewards.upgradeChips) {
      player.upgradeChips += rewards.upgradeChips;
    }

    this.scene.events.emit('questRewarded', quest, rewards);
    console.log(`[Quest] Rewards claimed for: ${quest.name}`);
    return rewards;
  }

  /**
   * Get all active quests
   * @returns {Array}
   */
  getActiveQuests() {
    return [...this.quests.values()].filter(q => q.state === QUEST_STATE.ACTIVE);
  }

  /**
   * Get completed (unclaimed) quests
   * @returns {Array}
   */
  getCompletedQuests() {
    return [...this.quests.values()].filter(q => q.state === QUEST_STATE.COMPLETED);
  }

  /**
   * Get all quest IDs that have been completed/rewarded
   * @returns {string[]}
   */
  getCompletedIds() {
    return [...this.quests.entries()]
      .filter(([_, q]) => q.state === QUEST_STATE.COMPLETED || q.state === QUEST_STATE.REWARDED)
      .map(([id]) => id);
  }

  /**
   * Get all active quest IDs
   * @returns {string[]}
   */
  getActiveIds() {
    return [...this.quests.entries()]
      .filter(([_, q]) => q.state === QUEST_STATE.ACTIVE)
      .map(([id]) => id);
  }

  /**
   * Restore quest state from save data
   * @param {string[]} completedIds
   * @param {string[]} activeIds
   */
  loadState(completedIds, activeIds) {
    for (const id of (completedIds || [])) {
      const quest = this.quests.get(id);
      if (quest) quest.state = QUEST_STATE.REWARDED;
    }
    for (const id of (activeIds || [])) {
      const quest = this.quests.get(id);
      if (quest && quest.state === QUEST_STATE.AVAILABLE) {
        quest.state = QUEST_STATE.ACTIVE;
      }
    }
  }
}
