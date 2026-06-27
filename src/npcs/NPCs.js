/**
 * NPCs.js - NPC implementations for Project Eclipse
 * AI Assistant, Merchant, Scientist, Lost Programmer
 */
import { DEPTH, COLORS } from '../utils/Constants.js';

export class NPCBase extends Phaser.Physics.Arcade.Sprite {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {string} textureKey
   * @param {Array} dialogueData - Array of dialogue entries
   */
  constructor(scene, x, y, textureKey, dialogueData = []) {
    super(scene, x, y, textureKey, 0);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDepth(DEPTH.NPCS);
    this.body.setAllowGravity(true);
    this.body.setImmovable(true);
    this.setCollideWorldBounds(true);
    this.body.setSize(20, 28);
    this.body.setOffset(6, 4);

    this.dialogue = dialogueData;
    this.interactionRange = 60;
    this.canInteract = false;
    this.interacting = false;

    // Interaction prompt
    this.promptText = scene.add.text(x, y - 30, '[E] Talk', {
      fontSize: '10px',
      fontFamily: 'monospace',
      color: COLORS.TEXT_ACCENT,
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5).setDepth(DEPTH.UI).setAlpha(0);

    // Idle animation
    this.animTimer = 0;
    this.animFrame = 0;
  }

  /**
   * Update NPC - check player proximity
   */
  update(time, delta) {
    const player = this.scene.player;
    if (!player) return;

    const dist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
    this.canInteract = dist < this.interactionRange;

    // Show/hide interaction prompt
    this.promptText.setPosition(this.x, this.y - 30);
    this.promptText.setAlpha(this.canInteract && !this.interacting ? 1 : 0);

    // Face player when nearby
    if (this.canInteract) {
      this.setFlipX(player.x < this.x);
    }

    // Idle animation
    this.animTimer += delta;
    if (this.animTimer >= 400) {
      this.animTimer = 0;
      this.animFrame = (this.animFrame + 1) % 4;
      this.setFrame(this.animFrame);
    }
  }

  /**
   * Start dialogue interaction
   */
  interact() {
    if (!this.canInteract || this.interacting || this.dialogue.length === 0) return false;
    this.interacting = true;
    this.scene.events.emit('startDialogue', this.dialogue, () => {
      this.interacting = false;
    });
    return true;
  }

  destroy(fromScene) {
    if (this.promptText) this.promptText.destroy();
    super.destroy(fromScene);
  }
}

/**
 * Create an NPC from level config
 * @param {Phaser.Scene} scene
 * @param {Object} npcDef - NPC definition from LevelConfig
 * @returns {NPCBase}
 */
export function createNPC(scene, npcDef) {
  const textureMap = {
    AI_ASSISTANT: 'npc_assistant',
    MERCHANT: 'npc_merchant',
    SCIENTIST: 'npc_scientist',
    LOST_PROGRAMMER: 'npc_programmer'
  };

  const texture = textureMap[npcDef.type] || 'npc_assistant';
  return new NPCBase(scene, npcDef.x * 32, npcDef.y * 32, texture, npcDef.dialogue);
}
