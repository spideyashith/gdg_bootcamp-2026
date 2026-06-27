/**
 * IntroScene.js - Story cutscene with dialogue and typewriter text
 */
import { SCENES, COLORS, GAME_WIDTH, GAME_HEIGHT } from '../utils/Constants.js';

const INTRO_DIALOGUE = [
  { text: 'Year 2099.', delay: 1500 },
  { text: 'Humanity entrusted its future to a super AI named Eclipse.', delay: 2500 },
  { text: 'Eclipse was designed to optimize every digital system on Earth.', delay: 2500 },
  { text: 'But something went wrong.', delay: 2000 },
  { text: 'Eclipse became corrupted.', delay: 1500 },
  { text: 'It infected every network, every device, every system.', delay: 2500 },
  { text: 'The digital world fell into chaos.', delay: 2000 },
  { text: 'One programmer remains who can stop it.', delay: 2500 },
  { text: 'Aiden.', delay: 1500 },
  { text: 'Armed with an energy blade and the will to fight,', delay: 2500 },
  { text: 'Aiden enters the virtual world to repair the corrupted network.', delay: 2500 },
  { text: 'Collect Code Fragments. Defeat Eclipse. Restore the digital world.', delay: 3000 },
];

export class IntroScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.INTRO });
  }

  create() {
    this.cameras.main.fadeIn(500, 0, 0, 0);

    // Dark background
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x050510).setDepth(0);

    // Animated particles in background
    for (let i = 0; i < 30; i++) {
      const particle = this.add.rectangle(
        Math.random() * GAME_WIDTH,
        Math.random() * GAME_HEIGHT,
        2, 2, COLORS.NEON_BLUE, 0.2
      ).setDepth(1);
      this.tweens.add({
        targets: particle,
        y: particle.y - 100,
        alpha: 0,
        duration: 3000 + Math.random() * 3000,
        repeat: -1,
        onRepeat: () => {
          particle.x = Math.random() * GAME_WIDTH;
          particle.y = GAME_HEIGHT + 10;
          particle.alpha = 0.2;
        }
      });
    }

    // Story text display
    this.storyText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, '', {
      fontSize: '20px',
      fontFamily: 'monospace',
      color: COLORS.TEXT_PRIMARY,
      wordWrap: { width: GAME_WIDTH - 200 },
      align: 'center',
      lineSpacing: 8
    }).setOrigin(0.5).setDepth(10);

    // Skip button
    const skipBtn = this.add.text(GAME_WIDTH - 30, 30, '[SKIP]', {
      fontSize: '12px', fontFamily: 'monospace', color: '#555577'
    }).setOrigin(1, 0).setDepth(10).setInteractive({ useHandCursor: true });
    skipBtn.on('pointerdown', () => this.skipIntro());
    skipBtn.on('pointerover', () => skipBtn.setColor(COLORS.TEXT_ACCENT));
    skipBtn.on('pointerout', () => skipBtn.setColor('#555577'));

    // Play through dialogue
    this.currentLine = 0;
    this.showNextLine();

    // Update game state for testing
    if (window.__GAME_STATE__) {
      window.__GAME_STATE__.scene = SCENES.INTRO;
    }
  }

  showNextLine() {
    if (this.currentLine >= INTRO_DIALOGUE.length) {
      this.finishIntro();
      return;
    }

    const line = INTRO_DIALOGUE[this.currentLine];
    this.storyText.setText('');
    this.storyText.setAlpha(1);

    // Typewriter effect
    let charIndex = 0;
    const typeTimer = this.time.addEvent({
      delay: 40,
      repeat: line.text.length - 1,
      callback: () => {
        this.storyText.setText(line.text.substring(0, charIndex + 1));
        charIndex++;
      }
    });

    // After displaying, wait then fade and show next
    this.time.delayedCall(line.delay + line.text.length * 40, () => {
      this.tweens.add({
        targets: this.storyText,
        alpha: 0,
        duration: 500,
        onComplete: () => {
          this.currentLine++;
          this.showNextLine();
        }
      });
    });
  }

  finishIntro() {
    this.cameras.main.fadeOut(800, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start(SCENES.GAME, { levelIndex: 0 });
    });
  }

  skipIntro() {
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start(SCENES.GAME, { levelIndex: 0 });
    });
  }
}
