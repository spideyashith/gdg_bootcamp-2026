/**
 * BootScene.js - Asset generation and loading scene
 * Generates all procedural assets before transitioning to the main menu
 */
import { SCENES, COLORS, GAME_WIDTH, GAME_HEIGHT } from '../utils/Constants.js';
import { AssetGenerator } from '../utils/AssetGenerator.js';
import { BackgroundGenerator } from '../utils/BackgroundGenerator.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.BOOT });
  }

  create() {
    // Loading text
    const loadingText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40, 'PROJECT ECLIPSE', {
      fontSize: '32px',
      fontFamily: 'monospace',
      color: COLORS.TEXT_ACCENT,
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const statusText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 10, 'Initializing...', {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: COLORS.TEXT_PRIMARY
    }).setOrigin(0.5);

    // Progress bar
    const barBg = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 50, 300, 8, 0x111122);
    const barFill = this.add.rectangle(GAME_WIDTH / 2 - 149, GAME_HEIGHT / 2 + 50, 0, 6, COLORS.NEON_BLUE);
    barFill.setOrigin(0, 0.5);

    // Generate assets in stages with visual progress
    const stages = [
      { name: 'Generating sprites...', fn: () => {
        const gen = new AssetGenerator(this);
        gen.generatePlayerSprites();
        gen.generateEnemySprites();
      }},
      { name: 'Generating NPCs & items...', fn: () => {
        const gen = new AssetGenerator(this);
        gen.generateNPCSprites();
        gen.generateCollectibles();
      }},
      { name: 'Generating tilesets...', fn: () => {
        const gen = new AssetGenerator(this);
        gen.generateTilesets();
      }},
      { name: 'Generating effects...', fn: () => {
        const gen = new AssetGenerator(this);
        gen.generateProjectiles();
        gen.generateEffects();
      }},
      { name: 'Generating UI...', fn: () => {
        const gen = new AssetGenerator(this);
        gen.generateUIElements();
        gen.generatePortraits();
      }},
      { name: 'Generating backgrounds...', fn: () => {
        const bgGen = new BackgroundGenerator(this);
        bgGen.generateAll();
      }},
    ];

    let currentStage = 0;
    const processNextStage = () => {
      if (currentStage >= stages.length) {
        statusText.setText('Ready!');
        barFill.width = 298;
        this.time.delayedCall(300, () => {
          this.cameras.main.fadeOut(500, 0, 0, 0);
          this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start(SCENES.MENU);
          });
        });
        return;
      }

      const stage = stages[currentStage];
      statusText.setText(stage.name);

      // Use a small delay to let the UI update
      this.time.delayedCall(50, () => {
        try {
          stage.fn();
        } catch (e) {
          console.warn(`[Boot] Error in stage "${stage.name}":`, e);
        }
        currentStage++;
        barFill.width = (currentStage / stages.length) * 298;
        processNextStage();
      });
    };

    processNextStage();

    // Expose game reference for testing
    if (typeof window !== 'undefined') {
      window.__GAME__ = this.game;
      window.__GAME_STATE__ = Object.assign(window.__GAME_STATE__ || {}, {
        scene: SCENES.BOOT,
        ready: false,
        playerHealth: 100,
        playerAlive: true
      });
    }
  }
}
