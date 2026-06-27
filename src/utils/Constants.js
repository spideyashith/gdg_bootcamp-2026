/**
 * Constants.js - Game-wide constants for Project Eclipse
 * Central location for all magic numbers and configuration values
 */

// ─── Display ───────────────────────────────────────────────────────────────
export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;
export const TILE_SIZE = 32;

// ─── Physics ───────────────────────────────────────────────────────────────
export const GRAVITY = 800;
export const PLAYER_SPEED = 200;
export const PLAYER_RUN_SPEED = 320;
export const PLAYER_JUMP_FORCE = -420;
export const PLAYER_DASH_SPEED = 500;
export const PLAYER_DASH_DURATION = 200;
export const PLAYER_DOUBLE_JUMP_FORCE = -350;

// ─── Player Stats ──────────────────────────────────────────────────────────
export const PLAYER_MAX_HEALTH = 100;
export const PLAYER_MAX_ENERGY = 100;
export const ENERGY_REGEN_RATE = 5; // per second
export const SHIELD_ENERGY_COST = 30;
export const PROJECTILE_ENERGY_COST = 15;
export const LIGHTNING_SLASH_COST = 40;
export const ULTIMATE_ENERGY_COST = 80;
export const INVINCIBILITY_DURATION = 1000; // ms after being hit

// ─── Combat ────────────────────────────────────────────────────────────────
export const SWORD_DAMAGE = 15;
export const SWORD_COMBO_MULTIPLIER = [1.0, 1.2, 1.8]; // 3-hit combo multipliers
export const PROJECTILE_DAMAGE = 20;
export const LIGHTNING_SLASH_DAMAGE = 35;
export const ULTIMATE_DAMAGE = 80;
export const SWORD_RANGE = 48;
export const PROJECTILE_SPEED = 400;
export const ATTACK_COOLDOWN = 300; // ms between attacks

// ─── Experience / Leveling ─────────────────────────────────────────────────
export const XP_PER_LEVEL = [0, 100, 250, 500, 800, 1200, 1700, 2300, 3000, 3800, 4700, 5700, 7000];
export const MAX_LEVEL = 12;

// ─── Ability Unlock Levels ─────────────────────────────────────────────────
export const ABILITY_UNLOCK = {
  DASH: 1,
  DOUBLE_JUMP: 3,
  ENERGY_SHIELD: 5,
  LIGHTNING_SLASH: 8,
  ULTIMATE: 12
};

// ─── Enemy Stats ───────────────────────────────────────────────────────────
export const ENEMY_STATS = {
  VIRUS:              { health: 30,  damage: 10, speed: 80,  xp: 15,  detectionRange: 200, attackRange: 40  },
  MALWARE:            { health: 40,  damage: 15, speed: 60,  xp: 25,  detectionRange: 280, attackRange: 200 },
  FIREWALL_GUARDIAN:  { health: 80,  damage: 25, speed: 50,  xp: 40,  detectionRange: 180, attackRange: 50  },
  DRONE:              { health: 35,  damage: 12, speed: 100, xp: 20,  detectionRange: 250, attackRange: 180 },
  ELITE_VIRUS:        { health: 60,  damage: 20, speed: 100, xp: 35,  detectionRange: 250, attackRange: 45  },
  MINI_BOSS:          { health: 300, damage: 30, speed: 70,  xp: 150, detectionRange: 400, attackRange: 60  },
  FINAL_BOSS:         { health: 800, damage: 40, speed: 90,  xp: 500, detectionRange: 600, attackRange: 80  }
};

// ─── Loot Drop Rates (0-1) ─────────────────────────────────────────────────
export const LOOT_TABLES = {
  VIRUS:             { coin: 0.8, healthPack: 0.2, energyCell: 0.15, codeFragment: 0.05, upgradeChip: 0.0  },
  MALWARE:           { coin: 0.7, healthPack: 0.25, energyCell: 0.2, codeFragment: 0.1,  upgradeChip: 0.02 },
  FIREWALL_GUARDIAN: { coin: 0.9, healthPack: 0.3, energyCell: 0.25, codeFragment: 0.15, upgradeChip: 0.05 },
  DRONE:             { coin: 0.7, healthPack: 0.15, energyCell: 0.3, codeFragment: 0.1,  upgradeChip: 0.02 },
  ELITE_VIRUS:       { coin: 0.9, healthPack: 0.35, energyCell: 0.3, codeFragment: 0.2,  upgradeChip: 0.08 },
  MINI_BOSS:         { coin: 1.0, healthPack: 0.5, energyCell: 0.5, codeFragment: 0.8,  upgradeChip: 0.3  },
  FINAL_BOSS:        { coin: 1.0, healthPack: 1.0, energyCell: 1.0, codeFragment: 1.0,  upgradeChip: 1.0  }
};

// ─── Collectible Values ────────────────────────────────────────────────────
export const COLLECTIBLE_VALUES = {
  COIN: 10,
  HEALTH_PACK: 25,
  ENERGY_CELL: 30,
  CODE_FRAGMENT: 1, // quest item count
  UPGRADE_CHIP: 1   // upgrade currency
};

// ─── Colors (Cyberpunk Palette) ────────────────────────────────────────────
export const COLORS = {
  // Main palette
  NEON_BLUE:     0x00d4ff,
  NEON_PURPLE:   0xb400ff,
  NEON_PINK:     0xff00aa,
  NEON_GREEN:    0x00ff88,
  NEON_YELLOW:   0xffee00,
  NEON_RED:      0xff2244,
  NEON_ORANGE:   0xff8800,

  // Background tones
  DARK_BG:       0x0a0a1a,
  MID_BG:        0x141428,
  LIGHT_BG:      0x1e1e3c,

  // UI colors
  HEALTH_BAR:    0xff2244,
  ENERGY_BAR:    0x00d4ff,
  XP_BAR:        0x00ff88,
  SHIELD_COLOR:  0x00d4ff,

  // Text
  TEXT_PRIMARY:  '#e0e0ff',
  TEXT_ACCENT:   '#00d4ff',
  TEXT_WARNING:  '#ff2244',
  TEXT_GOLD:     '#ffee00',

  // Enemy colors
  VIRUS_COLOR:     0x44ff44,
  MALWARE_COLOR:   0xff4444,
  GUARDIAN_COLOR:  0x4488ff,
  DRONE_COLOR:     0xffaa00,
  ELITE_COLOR:     0xff00ff,
  BOSS_COLOR:      0xff0044
};

// ─── Scene Keys ────────────────────────────────────────────────────────────
export const SCENES = {
  BOOT:      'BootScene',
  MENU:      'MainMenuScene',
  INTRO:     'IntroScene',
  GAME:      'GameScene',
  PAUSE:     'PauseScene',
  SETTINGS:  'SettingsScene',
  GAME_OVER: 'GameOverScene',
  VICTORY:   'VictoryScene',
  CREDITS:   'CreditsScene'
};

// ─── Level Names ───────────────────────────────────────────────────────────
export const LEVEL_NAMES = [
  'Tutorial',
  'Cyber City',
  'Data Forest',
  'Firewall Fortress',
  'Core Network',
  'Final AI Core'
];

// ─── Save Key ──────────────────────────────────────────────────────────────
export const SAVE_KEY = 'project_eclipse_save';

// ─── Depth Layers ──────────────────────────────────────────────────────────
export const DEPTH = {
  BG_FAR:        0,
  BG_MID:        10,
  BG_NEAR:       20,
  TILES:         30,
  COLLECTIBLES:  40,
  NPCS:          50,
  ENEMIES:       60,
  PLAYER:        70,
  PROJECTILES:   80,
  EFFECTS:       90,
  UI:            100,
  OVERLAY:       110,
  DIALOGUE:      120
};
