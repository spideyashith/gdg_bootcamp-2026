/**
 * DialogueBox.js - Typewriter-style dialogue system with portraits
 */
import { COLORS, DEPTH, GAME_WIDTH, GAME_HEIGHT } from '../utils/Constants.js';

export class DialogueBox {
  constructor(scene) {
    this.scene = scene;
    this.isActive = false;
    this.dialogueQueue = [];
    this.currentIndex = 0;
    this.currentText = '';
    this.displayedText = '';
    this.charIndex = 0;
    this.typewriterTimer = null;
    this.onComplete = null;
    this.elements = [];
    this.create();
  }

  create() {
    const boxY = GAME_HEIGHT - 160;
    const boxW = GAME_WIDTH - 80;

    // Background panel
    this.bg = this.scene.add.rectangle(GAME_WIDTH / 2, boxY + 70, boxW, 140, 0x0a0a1a, 0.92)
      .setScrollFactor(0).setDepth(DEPTH.DIALOGUE).setVisible(false);
    this.border = this.scene.add.rectangle(GAME_WIDTH / 2, boxY + 70, boxW, 140)
      .setScrollFactor(0).setDepth(DEPTH.DIALOGUE + 1).setVisible(false)
      .setStrokeStyle(2, COLORS.NEON_BLUE, 0.6).setFillStyle(0, 0);

    // Portrait frame
    this.portrait = this.scene.add.rectangle(80, boxY + 70, 80, 80, 0x1a1a3a, 0.9)
      .setScrollFactor(0).setDepth(DEPTH.DIALOGUE + 2).setVisible(false);
    this.portraitImage = this.scene.add.rectangle(80, boxY + 70, 64, 64, 0x333366, 0.8)
      .setScrollFactor(0).setDepth(DEPTH.DIALOGUE + 3).setVisible(false);

    // Speaker name
    this.nameText = this.scene.add.text(140, boxY + 14, '', {
      fontSize: '14px', fontFamily: 'monospace', color: COLORS.TEXT_ACCENT,
      fontStyle: 'bold'
    }).setScrollFactor(0).setDepth(DEPTH.DIALOGUE + 2).setVisible(false);

    // Dialogue text
    this.textDisplay = this.scene.add.text(140, boxY + 36, '', {
      fontSize: '13px', fontFamily: 'monospace', color: COLORS.TEXT_PRIMARY,
      wordWrap: { width: boxW - 180 }, lineSpacing: 4
    }).setScrollFactor(0).setDepth(DEPTH.DIALOGUE + 2).setVisible(false);

    // Continue indicator
    this.continueText = this.scene.add.text(GAME_WIDTH - 80, boxY + 120, '▼ Click to continue', {
      fontSize: '10px', fontFamily: 'monospace', color: COLORS.TEXT_ACCENT
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(DEPTH.DIALOGUE + 2).setVisible(false);
    this.scene.tweens.add({
      targets: this.continueText,
      alpha: { from: 1, to: 0.3 },
      duration: 800,
      yoyo: true,
      repeat: -1
    });

    // Skip button
    this.skipText = this.scene.add.text(GAME_WIDTH - 60, boxY + 8, '[SKIP]', {
      fontSize: '10px', fontFamily: 'monospace', color: '#666688'
    }).setScrollFactor(0).setDepth(DEPTH.DIALOGUE + 3).setVisible(false)
      .setInteractive({ useHandCursor: true });
    this.skipText.on('pointerdown', () => this.endDialogue());
    this.skipText.on('pointerover', () => this.skipText.setColor(COLORS.TEXT_ACCENT));
    this.skipText.on('pointerout', () => this.skipText.setColor('#666688'));

    this.elements = [this.bg, this.border, this.portrait, this.portraitImage,
      this.nameText, this.textDisplay, this.continueText, this.skipText];

    // Click/Space to advance
    this.scene.input.on('pointerdown', () => {
      if (this.isActive) this.advance();
    });
  }

  /**
   * Start a dialogue sequence
   * @param {Array} dialogueEntries - Array of { speaker, portrait, text }
   * @param {Function} callback - Called when dialogue is complete
   */
  startDialogue(dialogueEntries, callback) {
    this.dialogueQueue = dialogueEntries;
    this.currentIndex = 0;
    this.onComplete = callback;
    this.isActive = true;

    this.elements.forEach(el => el.setVisible(true));
    this.showEntry(0);
  }

  /**
   * Show a specific dialogue entry with typewriter effect
   */
  showEntry(index) {
    if (index >= this.dialogueQueue.length) {
      this.endDialogue();
      return;
    }

    const entry = this.dialogueQueue[index];
    this.nameText.setText(entry.speaker || '');
    this.currentText = entry.text;
    this.displayedText = '';
    this.charIndex = 0;
    this.textDisplay.setText('');
    this.continueText.setVisible(false);

    // Update portrait color based on character
    const portraitColors = {
      aria: COLORS.NEON_BLUE,
      merchant: COLORS.NEON_YELLOW,
      scientist: 0xaaddff,
      programmer: 0x556644,
      eclipse: COLORS.BOSS_COLOR
    };
    const pColor = portraitColors[entry.portrait] || 0x333366;
    this.portraitImage.setFillStyle(pColor, 0.6);

    // If we have actual portrait textures
    if (this.scene.textures.exists(`portrait_${entry.portrait}`)) {
      this.portraitImage.setVisible(false);
      if (!this.portraitSprite) {
        this.portraitSprite = this.scene.add.sprite(80, GAME_HEIGHT - 90, `portrait_${entry.portrait}`);
        this.portraitSprite.setScrollFactor(0).setDepth(DEPTH.DIALOGUE + 3);
        this.portraitSprite.setScale(1);
      } else {
        this.portraitSprite.setTexture(`portrait_${entry.portrait}`);
        this.portraitSprite.setVisible(true);
      }
    }

    // Typewriter effect
    if (this.typewriterTimer) this.typewriterTimer.remove();
    this.typewriterTimer = this.scene.time.addEvent({
      delay: 30,
      repeat: this.currentText.length - 1,
      callback: () => {
        this.displayedText += this.currentText[this.charIndex];
        this.textDisplay.setText(this.displayedText);
        this.charIndex++;
        if (this.charIndex >= this.currentText.length) {
          this.continueText.setVisible(true);
        }
      }
    });
  }

  /**
   * Advance to next dialogue entry or complete current typewriter
   */
  advance() {
    if (this.charIndex < this.currentText.length) {
      // Complete typewriter immediately
      if (this.typewriterTimer) this.typewriterTimer.remove();
      this.textDisplay.setText(this.currentText);
      this.charIndex = this.currentText.length;
      this.continueText.setVisible(true);
    } else {
      // Next entry
      this.currentIndex++;
      if (this.scene.audioSystem) this.scene.audioSystem.playSFX('buttonClick');
      this.showEntry(this.currentIndex);
    }
  }

  /**
   * End dialogue and clean up
   */
  endDialogue() {
    this.isActive = false;
    if (this.typewriterTimer) this.typewriterTimer.remove();
    this.elements.forEach(el => el.setVisible(false));
    if (this.portraitSprite) this.portraitSprite.setVisible(false);
    if (this.onComplete) this.onComplete();
  }

  /**
   * Check if dialogue is currently active
   * @returns {boolean}
   */
  getIsActive() {
    return this.isActive;
  }

  destroy() {
    if (this.typewriterTimer) this.typewriterTimer.remove();
    this.elements.forEach(el => { if (el) el.destroy(); });
    if (this.portraitSprite) this.portraitSprite.destroy();
  }
}
