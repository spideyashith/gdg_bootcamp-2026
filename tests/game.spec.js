import { test, expect } from '@playwright/test';

test.describe('Project Eclipse E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Collect console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error(`Page error: ${msg.text()}`);
      }
    });
  });

  test('Game initializes successfully and renders canvas', async ({ page }) => {
    await page.goto('/');

    // Check page title
    await expect(page).toHaveTitle(/Project Eclipse/i);

    // Verify canvas is present
    const canvas = page.locator('#game-container canvas');
    await expect(canvas).toBeVisible({ timeout: 10000 });
  });

  test('Procedural asset generation completes and transitions to Menu or Level', async ({ page }) => {
    await page.goto('/');

    // Wait until global game instance is exposed
    await page.waitForFunction(() => window.__GAME__ !== undefined, null, { timeout: 15000 });

    // Wait for procedural assets to generate and boot scene to transition
    await page.waitForFunction(() => {
      const state = window.__GAME_STATE__;
      return state && state.scene !== 'BootScene';
    }, null, { timeout: 20000 });

    const scene = await page.evaluate(() => window.__GAME_STATE__.scene);
    expect(['MainMenuScene', 'GameScene']).toContain(scene);
  });

  test('Global game state tracks health and alive status accurately', async ({ page }) => {
    await page.goto('/');

    await page.waitForFunction(() => window.__GAME_STATE__ !== undefined, null, { timeout: 15000 });

    const state = await page.evaluate(() => window.__GAME_STATE__);
    expect(state).toHaveProperty('playerHealth');
    expect(state).toHaveProperty('playerAlive');
    expect(state.playerHealth).toBeGreaterThan(0);
    expect(state.playerAlive).toBe(true);
  });
});
