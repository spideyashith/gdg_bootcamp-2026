/**
 * CameraSystem.js - Smooth camera following, screen shake, and effects
 */
import { GAME_WIDTH, GAME_HEIGHT } from '../utils/Constants.js';

export class CameraSystem {
  /**
   * @param {Phaser.Scene} scene
   */
  constructor(scene) {
    this.scene = scene;
    this.camera = scene.cameras.main;
    this.isShaking = false;
  }

  /**
   * Set up camera to follow the player smoothly
   * @param {Phaser.GameObjects.Sprite} target - Player sprite
   * @param {number} worldWidth - Level width in pixels
   * @param {number} worldHeight - Level height in pixels
   */
  setupFollow(target, worldWidth, worldHeight) {
    this.camera.setBounds(0, 0, worldWidth, worldHeight);
    this.camera.startFollow(target, true, 0.08, 0.08);
    this.camera.setDeadzone(100, 50);
  }

  /**
   * Trigger screen shake
   * @param {number} intensity - Shake intensity (default 0.005)
   * @param {number} duration - Duration in ms (default 200)
   */
  shake(intensity = 0.005, duration = 200) {
    if (this.isShaking) return;
    this.isShaking = true;
    this.camera.shake(duration, intensity, false, (cam, progress) => {
      if (progress >= 1) {
        this.isShaking = false;
      }
    });
  }

  /**
   * Flash the camera
   * @param {number} duration
   * @param {number} r - Red (0-255)
   * @param {number} g - Green (0-255)
   * @param {number} b - Blue (0-255)
   */
  flash(duration = 200, r = 255, g = 255, b = 255) {
    this.camera.flash(duration, r, g, b, false);
  }

  /**
   * Fade camera to black
   * @param {number} duration
   * @param {Function} callback
   */
  fadeOut(duration = 500, callback = null) {
    this.camera.fadeOut(duration, 0, 0, 0);
    if (callback) {
      this.camera.once('camerafadeoutcomplete', callback);
    }
  }

  /**
   * Fade camera in from black
   * @param {number} duration
   * @param {Function} callback
   */
  fadeIn(duration = 500, callback = null) {
    this.camera.fadeIn(duration, 0, 0, 0);
    if (callback) {
      this.camera.once('camerafadeincomplete', callback);
    }
  }

  /**
   * Reset camera to default state
   */
  reset() {
    this.camera.stopFollow();
    this.camera.setBounds(0, 0, GAME_WIDTH, GAME_HEIGHT);
    this.camera.setScroll(0, 0);
    this.isShaking = false;
  }
}
