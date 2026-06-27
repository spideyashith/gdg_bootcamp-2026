/**
 * GameScene.js - Core gameplay loop for Project Eclipse
 * Manages player, enemies, NPCs, collectibles, level loading, and all game systems
 */
import { SCENES, COLORS, GAME_WIDTH, GAME_HEIGHT, DEPTH, TILE_SIZE } from '../utils/Constants.js';
import { Player } from '../player/Player.js';
import { Virus, Malware, FirewallGuardian, Drone, EliteVirus, MiniBoss, FinalBoss } from '../enemies/Enemies.js';
import { createNPC } from '../npcs/NPCs.js';
import { HUD } from '../ui/HUD.js';
import { DialogueBox } from '../ui/DialogueBox.js';
import { DamageNumbers } from '../ui/DamageNumbers.js';
import { LevelManager } from '../systems/LevelManager.js';
import { CameraSystem } from '../systems/CameraSystem.js';
import { ParticleSystem } from '../systems/ParticleSystem.js';
import { AudioSystem } from '../systems/AudioSystem.js';
import { CollectibleSystem } from '../systems/CollectibleSystem.js';
import { QuestSystem } from '../systems/QuestSystem.js';
import { InventorySystem } from '../systems/InventorySystem.js';
import { ExperienceSystem } from '../systems/ExperienceSystem.js';
import { loadGame, autoSave } from '../systems/SaveSystem.js';
import { isActionJustDown, setupInputs } from '../config/Controls.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.GAME });
  }

  /**
   * @param {Object} data - { levelIndex, loadSave }
   */
  init(data) {
    this.levelIndex = data.levelIndex || 0;
    this.shouldLoadSave = data.loadSave || false;
  }

  create() {
    // ─── Initialize Systems ───────────────────────────────────────────
    this.cameraSystem = new CameraSystem(this);
    this.particleSystem = new ParticleSystem(this);
    this.audioSystem = new AudioSystem(this);
    this.audioSystem.init();
    this.levelManager = new LevelManager(this);
    this.collectibleSystem = new CollectibleSystem(this);
    this.questSystem = new QuestSystem(this);
    this.inventorySystem = new InventorySystem(this);

    // Physics groups for projectiles
    this.playerProjectiles = this.physics.add.group({ allowGravity: false });
    this.enemyProjectiles = this.physics.add.group({ allowGravity: false });
    this.enemies = this.physics.add.group({ runChildUpdate: false });
    this.npcs = [];

    // ─── Load Level ───────────────────────────────────────────────────
    if (this.shouldLoadSave) {
      const saveData = loadGame();
      if (saveData) {
        this.levelIndex = saveData.currentLevel || 0;
      }
    }
    this.currentLevelIndex = this.levelIndex;
    const levelInfo = this.levelManager.loadLevel(this.levelIndex);
    const levelConfig = this.levelManager.getLevelConfig();

    // ─── Create Player ────────────────────────────────────────────────
    const startX = levelConfig.playerStart.x * TILE_SIZE;
    const startY = levelConfig.playerStart.y * TILE_SIZE;
    this.player = new Player(this, startX, startY);

    // Player systems
    this.player.xpSystem = new ExperienceSystem(this, this.player);
    this.player.inventorySystem = this.inventorySystem;

    // Load save data if continuing
    if (this.shouldLoadSave) {
      const saveData = loadGame();
      if (saveData) {
        this.player.loadFromSave(saveData);
        this.inventorySystem.loadItems(saveData.inventory);
        this.questSystem.loadState(saveData.questsCompleted, saveData.questsActive);
      }
    }

    // ─── Camera Setup ─────────────────────────────────────────────────
    this.cameraSystem.setupFollow(this.player, levelInfo.worldWidth, levelInfo.worldHeight);
    this.cameraSystem.fadeIn(500);

    // ─── Collisions ───────────────────────────────────────────────────
    const platforms = this.levelManager.getPlatforms();
    this.physics.add.collider(this.player, platforms);
    this.physics.add.collider(this.enemies, platforms);
    this.physics.add.collider(this.collectibleSystem.getGroup(), platforms);

    // Player ↔ Enemy collision
    this.physics.add.overlap(this.player, this.enemies, (player, enemy) => {
      if (enemy.aiState !== 'dead' && !this.player.isInvincible) {
        this.player.takeDamage(enemy.damage);
      }
    });

    // Player projectiles ↔ Enemies
    this.physics.add.overlap(this.playerProjectiles, this.enemies, (proj, enemy) => {
      if (enemy.aiState !== 'dead') {
        const damage = proj.getData('damage') || 20;
        const dir = proj.body.velocity.x > 0 ? 1 : -1;
        enemy.takeDamage(damage, dir);
        proj.destroy();
      }
    });

    // Enemy projectiles ↔ Player
    this.physics.add.overlap(this.player, this.enemyProjectiles, (player, proj) => {
      if (!this.player.isInvincible) {
        const damage = proj.getData('damage') || 10;
        this.player.takeDamage(damage);
        proj.destroy();
      }
    });

    // Player ↔ Collectibles
    this.physics.add.overlap(this.player, this.collectibleSystem.getGroup(), (player, collectible) => {
      this.collectibleSystem.collect(player, collectible);
    });

    // Player ↔ Portal
    const portal = this.levelManager.getPortal();
    if (portal) {
      this.physics.add.overlap(this.player, portal, () => {
        this.reachExit();
      });
    }

    // ─── Spawn Enemies ────────────────────────────────────────────────
    this.spawnEnemies(levelConfig.enemies);

    // ─── Spawn Collectibles ───────────────────────────────────────────
    this.collectibleSystem.spawnFromConfig(levelConfig.collectibles);

    // ─── Spawn NPCs ───────────────────────────────────────────────────
    this.spawnNPCs(levelConfig.npcs);

    // ─── Register Quests ──────────────────────────────────────────────
    this.questSystem.registerQuests(levelConfig.quests);
    this.questSystem.activateAllAvailable();

    // ─── UI ───────────────────────────────────────────────────────────
    this.hud = new HUD(this);
    this.hud.setLevelName(`${levelConfig.name} — ${levelConfig.subtitle}`);
    this.dialogueBox = new DialogueBox(this);
    this.damageNumbers = new DamageNumbers(this);

    // ─── Events ───────────────────────────────────────────────────────
    this.events.on('startDialogue', (dialogue, callback) => {
      this.dialogueBox.startDialogue(dialogue, callback);
    });

    this.events.on('playerDeath', () => {
      this.gameOver();
    });

    this.events.on('bossDefeated', () => {
      this.victory();
    });

    this.events.on('questCompleted', (quest) => {
      // Auto-claim rewards
      this.questSystem.claimRewards(quest.id, this.player);
      // Show notification
      this.showNotification(`Quest Complete: ${quest.name}`);
    });

    // ─── Music ────────────────────────────────────────────────────────
    this.audioSystem.playMusic(levelConfig.musicKey);

    // ─── Pause input ──────────────────────────────────────────────────
    this.pauseKeys = setupInputs(this);

    // ─── Game state for testing ───────────────────────────────────────
    if (window.__GAME_STATE__) {
      window.__GAME_STATE__.scene = SCENES.GAME;
      window.__GAME_STATE__.level = this.levelIndex;
      window.__GAME_STATE__.player = this.player;
    }
  }

  /**
   * Spawn enemies from level config
   */
  spawnEnemies(enemyDefs) {
    const enemyClasses = {
      VIRUS: Virus,
      MALWARE: Malware,
      FIREWALL_GUARDIAN: FirewallGuardian,
      DRONE: Drone,
      ELITE_VIRUS: EliteVirus,
      MINI_BOSS: MiniBoss,
      FINAL_BOSS: FinalBoss
    };

    for (const def of enemyDefs) {
      const EnemyClass = enemyClasses[def.type];
      if (EnemyClass) {
        const enemy = new EnemyClass(this, def.x * TILE_SIZE, def.y * TILE_SIZE);
        this.enemies.add(enemy);
        // Collide NPCs with platforms
        this.physics.add.collider(enemy, this.levelManager.getPlatforms());
      }
    }
  }

  /**
   * Spawn NPCs from level config
   */
  spawnNPCs(npcDefs) {
    for (const def of npcDefs) {
      const npc = createNPC(this, def);
      this.npcs.push(npc);
      this.physics.add.collider(npc, this.levelManager.getPlatforms());
    }
  }

  /**
   * Main game update loop
   */
  update(time, delta) {
    // Don't update if dialogue is active
    const dialogueActive = this.dialogueBox && this.dialogueBox.getIsActive();

    if (!dialogueActive) {
      // Player update
      if (this.player && this.player.isAlive()) {
        this.player.update(time, delta);
      }

      // Enemy updates
      this.enemies.getChildren().forEach(enemy => {
        if (enemy.active) enemy.update(time, delta);
      });

      // NPC updates + interaction check
      this.npcs.forEach(npc => {
        if (npc.active) {
          npc.update(time, delta);
          // Check for interaction
          if (npc.canInteract && isActionJustDown(this.pauseKeys, 'interact')) {
            npc.interact();
          }
        }
      });
    }

    // HUD minimap update
    if (this.hud) this.hud.updateMinimap();

    // Pause
    if (isActionJustDown(this.pauseKeys, 'pause')) {
      this.pauseGame();
    }

    // Inventory toggle
    if (isActionJustDown(this.pauseKeys, 'inventory')) {
      this.toggleInventory();
    }

    // Update game state for testing
    if (window.__GAME_STATE__) {
      window.__GAME_STATE__.playerHealth = this.player ? this.player.health : 0;
      window.__GAME_STATE__.playerAlive = this.player ? this.player.isAlive() : false;
      window.__GAME_STATE__.enemyCount = this.enemies ? this.enemies.countActive() : 0;
    }
  }

  /**
   * Handle reaching the level exit portal
   */
  reachExit() {
    if (this._exiting) return;
    this._exiting = true;

    // Update quest progress
    this.questSystem.updateProgress('reach', 'exit');

    // Auto-save
    autoSave(this);

    // Check if there are more levels
    if (this.levelManager.hasNextLevel()) {
      this.showNotification('Level Complete!');
      this.cameraSystem.fadeOut(800, () => {
        this.cleanup();
        this.scene.restart({ levelIndex: this.levelIndex + 1 });
      });
    } else {
      // Last level — check if boss is defeated
      const bossAlive = this.enemies.getChildren().some(e => e.enemyType === 'FINAL_BOSS' && e.aiState !== 'dead');
      if (!bossAlive) {
        this.victory();
      }
    }
  }

  /**
   * Pause the game
   */
  pauseGame() {
    this.audioSystem.stopMusic();
    this.scene.pause();
    this.scene.launch(SCENES.PAUSE, { gameScene: this });
  }

  /**
   * Toggle inventory (simple display)
   */
  toggleInventory() {
    this.showNotification('Inventory: ' + this.inventorySystem.items.map(i => `${i.type}×${i.count}`).join(', ') || 'Empty');
  }

  /**
   * Show a notification text
   * @param {string} message
   */
  showNotification(message) {
    const text = this.add.text(GAME_WIDTH / 2, 120, message, {
      fontSize: '18px', fontFamily: 'monospace', color: COLORS.TEXT_ACCENT,
      fontStyle: 'bold', stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5).setScrollFactor(0).setDepth(DEPTH.OVERLAY);

    this.tweens.add({
      targets: text,
      y: 100, alpha: 0,
      duration: 2000, delay: 1500,
      ease: 'Cubic.easeOut',
      onComplete: () => text.destroy()
    });
  }

  /**
   * Game over sequence
   */
  gameOver() {
    this.audioSystem.stopMusic();
    this.cameraSystem.fadeOut(1000, () => {
      this.cleanup();
      this.scene.start(SCENES.GAME_OVER, { levelIndex: this.levelIndex });
    });
  }

  /**
   * Victory sequence
   */
  victory() {
    this.audioSystem.stopMusic();
    autoSave(this);
    this.time.delayedCall(500, () => {
      this.cameraSystem.fadeOut(1500, () => {
        this.cleanup();
        this.scene.start(SCENES.VICTORY);
      });
    });
  }

  /**
   * Clean up all scene resources
   */
  cleanup() {
    this.levelManager.cleanup();
    this.collectibleSystem.destroy();
    if (this.hud) this.hud.destroy();
    if (this.dialogueBox) this.dialogueBox.destroy();
    this.audioSystem.destroy();
    this.npcs.forEach(n => n.destroy());
    this.npcs = [];
    this._exiting = false;
  }
}
