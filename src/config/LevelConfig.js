/**
 * LevelConfig.js - Level definitions for Project Eclipse
 * Each level defines platforms, enemies, collectibles, NPCs, and visual settings
 */
import { GAME_WIDTH, GAME_HEIGHT, TILE_SIZE } from '../utils/Constants.js';

/**
 * Generate platform layout for a level
 * Returns array of { x, y, width, height } rectangles
 */
function createPlatforms(layout) {
  return layout.map(p => ({
    x: p[0] * TILE_SIZE,
    y: p[1] * TILE_SIZE,
    width: p[2] * TILE_SIZE,
    height: p[3] * TILE_SIZE
  }));
}

/**
 * Level configurations
 * Coordinates are in tile units (32px per tile)
 * Level width is in tiles, height is fixed at GAME_HEIGHT
 */
export const LEVELS = [
  // ─── Level 0: Tutorial ──────────────────────────────────────────────
  {
    name: 'Tutorial',
    subtitle: 'Training Simulation',
    width: 80,  // tiles wide (2560px)
    height: 23, // tiles tall (736px)
    bgStyle: 'cyber',
    hasRain: false,
    hasFog: true,
    musicKey: 'menu',
    playerStart: { x: 3, y: 18 },
    platforms: createPlatforms([
      // [tileX, tileY, widthTiles, heightTiles]
      // Ground
      [0, 21, 80, 2],
      // Step platforms
      [10, 18, 4, 1],
      [16, 16, 4, 1],
      [22, 14, 5, 1],
      // Wall to climb
      [30, 12, 6, 1],
      [33, 17, 3, 1],
      // Gap area
      [40, 21, 0, 0], // gap marker (no platform from 38-42)
      [42, 19, 3, 1],
      [47, 17, 4, 1],
      // Combat area
      [54, 21, 26, 2],
      [58, 16, 3, 1],
      [64, 14, 4, 1],
      [70, 16, 3, 1],
    ]),
    enemies: [
      { type: 'VIRUS', x: 56, y: 19 },
      { type: 'VIRUS', x: 62, y: 19 },
      { type: 'VIRUS', x: 68, y: 19 },
    ],
    collectibles: [
      { type: 'COIN', x: 12, y: 16 },
      { type: 'COIN', x: 18, y: 14 },
      { type: 'HEALTH_PACK', x: 24, y: 12 },
      { type: 'COIN', x: 44, y: 17 },
      { type: 'CODE_FRAGMENT', x: 49, y: 15 },
      { type: 'ENERGY_CELL', x: 60, y: 14 },
    ],
    npcs: [
      { type: 'AI_ASSISTANT', x: 5, y: 19, dialogue: [
        { speaker: 'ARIA', portrait: 'aria', text: 'Welcome to the training simulation, Aiden.' },
        { speaker: 'ARIA', portrait: 'aria', text: 'Use ARROW KEYS or WASD to move. Press UP or W to jump.' },
        { speaker: 'ARIA', portrait: 'aria', text: 'Press SPACE or click to attack with your energy blade.' },
        { speaker: 'ARIA', portrait: 'aria', text: 'Collect Code Fragments to progress. Good luck!' },
      ]}
    ],
    exitX: 76,
    quests: [
      { id: 'tutorial_main', type: 'main', name: 'First Steps', description: 'Complete the training simulation', objectives: [
        { type: 'reach', target: 'exit', description: 'Reach the exit portal' }
      ], rewards: { xp: 50, coins: 20 }}
    ]
  },

  // ─── Level 1: Cyber City ────────────────────────────────────────────
  {
    name: 'Cyber City',
    subtitle: 'Neon District',
    width: 120,
    height: 23,
    bgStyle: 'city',
    hasRain: true,
    hasFog: true,
    musicKey: 'battle',
    playerStart: { x: 3, y: 18 },
    platforms: createPlatforms([
      // Street level
      [0, 21, 25, 2],
      // Building platforms
      [8, 17, 5, 1],
      [15, 14, 4, 1],
      [21, 11, 5, 1],
      // Gap
      [28, 21, 20, 2],
      [30, 17, 4, 1],
      [36, 15, 3, 1],
      [41, 13, 4, 1],
      // Rooftop section
      [50, 21, 30, 2],
      [52, 16, 5, 1],
      [60, 14, 4, 1],
      [66, 12, 5, 1],
      [73, 16, 3, 1],
      // Street level continued
      [84, 21, 36, 2],
      [88, 17, 4, 1],
      [95, 15, 5, 1],
      [103, 13, 4, 1],
      [108, 17, 4, 1],
    ]),
    enemies: [
      { type: 'VIRUS', x: 20, y: 19 },
      { type: 'VIRUS', x: 32, y: 15 },
      { type: 'MALWARE', x: 45, y: 19 },
      { type: 'VIRUS', x: 55, y: 19 },
      { type: 'VIRUS', x: 63, y: 12 },
      { type: 'MALWARE', x: 75, y: 19 },
      { type: 'VIRUS', x: 90, y: 19 },
      { type: 'MALWARE', x: 100, y: 19 },
      { type: 'VIRUS', x: 110, y: 19 },
    ],
    collectibles: [
      { type: 'COIN', x: 10, y: 15 },
      { type: 'COIN', x: 17, y: 12 },
      { type: 'HEALTH_PACK', x: 38, y: 13 },
      { type: 'CODE_FRAGMENT', x: 54, y: 14 },
      { type: 'COIN', x: 62, y: 12 },
      { type: 'ENERGY_CELL', x: 68, y: 10 },
      { type: 'COIN', x: 90, y: 15 },
      { type: 'UPGRADE_CHIP', x: 105, y: 11 },
      { type: 'HEALTH_PACK', x: 112, y: 15 },
    ],
    npcs: [
      { type: 'MERCHANT', x: 50, y: 19, dialogue: [
        { speaker: 'BYTE', portrait: 'merchant', text: 'Hey, you look like you could use some upgrades.' },
        { speaker: 'BYTE', portrait: 'merchant', text: 'I trade Upgrade Chips for ability enhancements.' },
        { speaker: 'BYTE', portrait: 'merchant', text: 'Come back when you have some chips to trade!' },
      ]},
    ],
    exitX: 116,
    quests: [
      { id: 'city_main', type: 'main', name: 'Neon Streets', description: 'Navigate through Cyber City', objectives: [
        { type: 'kill', target: 'VIRUS', count: 4, description: 'Defeat 4 Virus entities' },
        { type: 'reach', target: 'exit', description: 'Reach the Data Forest gateway' }
      ], rewards: { xp: 150, coins: 50 }},
      { id: 'city_side1', type: 'side', name: 'Malware Cleanup', description: 'Destroy all Malware in Cyber City', objectives: [
        { type: 'kill', target: 'MALWARE', count: 3, description: 'Defeat 3 Malware entities' }
      ], rewards: { xp: 80, coins: 30 }}
    ]
  },

  // ─── Level 2: Data Forest ──────────────────────────────────────────
  {
    name: 'Data Forest',
    subtitle: 'Digital Wilderness',
    width: 130,
    height: 23,
    bgStyle: 'forest',
    hasRain: false,
    hasFog: true,
    musicKey: 'battle',
    playerStart: { x: 3, y: 18 },
    platforms: createPlatforms([
      // Ground with gaps
      [0, 21, 18, 2],
      [6, 16, 3, 1],
      [12, 13, 4, 1],
      // Tree canopy area
      [20, 21, 10, 2],
      [22, 17, 3, 1],
      [27, 14, 4, 1],
      [20, 10, 3, 1],
      // Dense section
      [34, 21, 25, 2],
      [36, 16, 3, 1],
      [42, 14, 4, 1],
      [48, 12, 3, 1],
      [44, 18, 3, 1],
      [53, 16, 4, 1],
      // Hidden path area
      [62, 21, 20, 2],
      [64, 17, 3, 1],
      [70, 15, 5, 1],
      [77, 13, 3, 1],
      // Final stretch
      [86, 21, 44, 2],
      [90, 17, 4, 1],
      [97, 15, 3, 1],
      [103, 13, 4, 1],
      [110, 16, 5, 1],
      [118, 14, 4, 1],
      [124, 17, 3, 1],
    ]),
    enemies: [
      { type: 'MALWARE', x: 15, y: 19 },
      { type: 'DRONE', x: 25, y: 10 },
      { type: 'MALWARE', x: 38, y: 19 },
      { type: 'DRONE', x: 46, y: 8 },
      { type: 'MALWARE', x: 55, y: 19 },
      { type: 'DRONE', x: 68, y: 12 },
      { type: 'MALWARE', x: 73, y: 19 },
      { type: 'DRONE', x: 95, y: 10 },
      { type: 'MALWARE', x: 105, y: 19 },
      { type: 'DRONE', x: 115, y: 10 },
      { type: 'ELITE_VIRUS', x: 122, y: 19 },
    ],
    collectibles: [
      { type: 'COIN', x: 8, y: 14 },
      { type: 'CODE_FRAGMENT', x: 14, y: 11 },
      { type: 'HEALTH_PACK', x: 29, y: 12 },
      { type: 'COIN', x: 44, y: 12 },
      { type: 'ENERGY_CELL', x: 50, y: 10 },
      { type: 'COIN', x: 66, y: 15 },
      { type: 'CODE_FRAGMENT', x: 79, y: 11 },
      { type: 'UPGRADE_CHIP', x: 99, y: 13 },
      { type: 'HEALTH_PACK', x: 112, y: 14 },
    ],
    npcs: [
      { type: 'SCIENTIST', x: 34, y: 19, dialogue: [
        { speaker: 'DR. CIPHER', portrait: 'scientist', text: 'You made it past Cyber City? Impressive.' },
        { speaker: 'DR. CIPHER', portrait: 'scientist', text: 'Eclipse has corrupted the data streams here.' },
        { speaker: 'DR. CIPHER', portrait: 'scientist', text: 'Watch out for Drones - they attack from above!' },
      ]},
    ],
    exitX: 126,
    quests: [
      { id: 'forest_main', type: 'main', name: 'Digital Wilderness', description: 'Traverse the corrupted Data Forest', objectives: [
        { type: 'collect', target: 'CODE_FRAGMENT', count: 2, description: 'Collect 2 Code Fragments' },
        { type: 'reach', target: 'exit', description: 'Reach the Firewall Fortress' }
      ], rewards: { xp: 250, coins: 80 }},
      { id: 'forest_side1', type: 'side', name: 'Drone Hunter', description: 'Eliminate all Drones in Data Forest', objectives: [
        { type: 'kill', target: 'DRONE', count: 4, description: 'Defeat 4 Drones' }
      ], rewards: { xp: 120, coins: 50 }}
    ]
  },

  // ─── Level 3: Firewall Fortress ────────────────────────────────────
  {
    name: 'Firewall Fortress',
    subtitle: 'The Great Barrier',
    width: 140,
    height: 23,
    bgStyle: 'fortress',
    hasRain: false,
    hasFog: false,
    musicKey: 'battle',
    playerStart: { x: 3, y: 18 },
    platforms: createPlatforms([
      // Entrance
      [0, 21, 20, 2],
      [5, 17, 4, 1],
      [12, 14, 5, 1],
      // Inner walls
      [22, 21, 15, 2],
      [24, 16, 3, 1],
      [30, 13, 4, 1],
      [34, 18, 3, 1],
      // Puzzle section
      [40, 21, 20, 2],
      [42, 17, 3, 1],
      [48, 14, 4, 1],
      [54, 11, 3, 1],
      [46, 19, 2, 1],
      [52, 17, 3, 1],
      // Guardian gauntlet
      [64, 21, 30, 2],
      [68, 16, 5, 1],
      [76, 14, 4, 1],
      [82, 12, 5, 1],
      [88, 16, 4, 1],
      // Upper fortress
      [98, 21, 42, 2],
      [102, 17, 4, 1],
      [108, 14, 5, 1],
      [116, 12, 4, 1],
      [122, 16, 5, 1],
      [130, 14, 4, 1],
      [134, 17, 3, 1],
    ]),
    enemies: [
      { type: 'FIREWALL_GUARDIAN', x: 18, y: 19 },
      { type: 'VIRUS', x: 28, y: 19 },
      { type: 'FIREWALL_GUARDIAN', x: 35, y: 19 },
      { type: 'ELITE_VIRUS', x: 50, y: 19 },
      { type: 'FIREWALL_GUARDIAN', x: 70, y: 19 },
      { type: 'FIREWALL_GUARDIAN', x: 80, y: 19 },
      { type: 'ELITE_VIRUS', x: 90, y: 19 },
      { type: 'FIREWALL_GUARDIAN', x: 106, y: 19 },
      { type: 'ELITE_VIRUS', x: 120, y: 19 },
      { type: 'FIREWALL_GUARDIAN', x: 132, y: 19 },
    ],
    collectibles: [
      { type: 'COIN', x: 7, y: 15 },
      { type: 'HEALTH_PACK', x: 14, y: 12 },
      { type: 'ENERGY_CELL', x: 32, y: 11 },
      { type: 'CODE_FRAGMENT', x: 56, y: 9 },
      { type: 'COIN', x: 72, y: 14 },
      { type: 'UPGRADE_CHIP', x: 84, y: 10 },
      { type: 'HEALTH_PACK', x: 104, y: 15 },
      { type: 'ENERGY_CELL', x: 118, y: 10 },
      { type: 'CODE_FRAGMENT', x: 128, y: 12 },
    ],
    npcs: [
      { type: 'LOST_PROGRAMMER', x: 40, y: 19, dialogue: [
        { speaker: 'ZERO', portrait: 'programmer', text: 'Oh thank god, another person! I\'ve been trapped here!' },
        { speaker: 'ZERO', portrait: 'programmer', text: 'The Firewall Guardians are relentless...' },
        { speaker: 'ZERO', portrait: 'programmer', text: 'If you can defeat them all, I might find a way out.' },
      ]},
    ],
    exitX: 136,
    quests: [
      { id: 'fortress_main', type: 'main', name: 'Breach the Firewall', description: 'Fight through the Firewall Fortress', objectives: [
        { type: 'kill', target: 'FIREWALL_GUARDIAN', count: 5, description: 'Defeat 5 Firewall Guardians' },
        { type: 'reach', target: 'exit', description: 'Reach the Core Network' }
      ], rewards: { xp: 400, coins: 120 }},
      { id: 'fortress_side1', type: 'side', name: 'Rescue Zero', description: 'Clear the path for the lost programmer', objectives: [
        { type: 'kill', target: 'FIREWALL_GUARDIAN', count: 5, description: 'Defeat all Guardians near Zero' }
      ], rewards: { xp: 200, coins: 80, upgradeChips: 1 }}
    ]
  },

  // ─── Level 4: Core Network ─────────────────────────────────────────
  {
    name: 'Core Network',
    subtitle: 'The Heart of the System',
    width: 150,
    height: 23,
    bgStyle: 'core',
    hasRain: false,
    hasFog: true,
    musicKey: 'boss',
    playerStart: { x: 3, y: 18 },
    platforms: createPlatforms([
      // Entry corridor
      [0, 21, 20, 2],
      [6, 17, 4, 1],
      [13, 14, 4, 1],
      // Data stream section
      [22, 21, 25, 2],
      [24, 16, 3, 1],
      [30, 13, 4, 1],
      [36, 10, 3, 1],
      [28, 18, 3, 1],
      [40, 16, 4, 1],
      // Conveyor area
      [50, 21, 30, 2],
      [54, 16, 5, 1],
      [62, 14, 4, 1],
      [68, 12, 5, 1],
      [74, 16, 3, 1],
      // Mini-boss arena
      [84, 21, 25, 2],
      [86, 16, 4, 1],
      [92, 14, 5, 1],
      [100, 16, 4, 1],
      // Final stretch
      [112, 21, 38, 2],
      [116, 17, 4, 1],
      [123, 14, 5, 1],
      [130, 12, 4, 1],
      [136, 16, 5, 1],
      [144, 14, 4, 1],
    ]),
    enemies: [
      { type: 'ELITE_VIRUS', x: 15, y: 19 },
      { type: 'DRONE', x: 28, y: 10 },
      { type: 'MALWARE', x: 35, y: 19 },
      { type: 'ELITE_VIRUS', x: 42, y: 19 },
      { type: 'FIREWALL_GUARDIAN', x: 58, y: 19 },
      { type: 'DRONE', x: 65, y: 8 },
      { type: 'ELITE_VIRUS', x: 72, y: 19 },
      { type: 'MINI_BOSS', x: 95, y: 16 },
      { type: 'FIREWALL_GUARDIAN', x: 120, y: 19 },
      { type: 'ELITE_VIRUS', x: 135, y: 19 },
      { type: 'DRONE', x: 140, y: 8 },
    ],
    collectibles: [
      { type: 'COIN', x: 8, y: 15 },
      { type: 'HEALTH_PACK', x: 16, y: 12 },
      { type: 'ENERGY_CELL', x: 32, y: 11 },
      { type: 'CODE_FRAGMENT', x: 38, y: 8 },
      { type: 'UPGRADE_CHIP', x: 56, y: 14 },
      { type: 'HEALTH_PACK', x: 70, y: 10 },
      { type: 'COIN', x: 88, y: 14 },
      { type: 'CODE_FRAGMENT', x: 102, y: 14 },
      { type: 'HEALTH_PACK', x: 125, y: 12 },
      { type: 'UPGRADE_CHIP', x: 132, y: 10 },
    ],
    npcs: [
      { type: 'SCIENTIST', x: 50, y: 19, dialogue: [
        { speaker: 'DR. CIPHER', portrait: 'scientist', text: 'Aiden, you\'ve come so far. Eclipse is close.' },
        { speaker: 'DR. CIPHER', portrait: 'scientist', text: 'A Mini-Boss guards the path ahead. Be ready.' },
        { speaker: 'DR. CIPHER', portrait: 'scientist', text: 'Use everything you\'ve learned. I believe in you.' },
      ]},
    ],
    exitX: 146,
    quests: [
      { id: 'core_main', type: 'main', name: 'Core Access', description: 'Penetrate the Core Network', objectives: [
        { type: 'kill', target: 'MINI_BOSS', count: 1, description: 'Defeat the Network Guardian' },
        { type: 'reach', target: 'exit', description: 'Reach Eclipse\'s domain' }
      ], rewards: { xp: 600, coins: 200 }}
    ]
  },

  // ─── Level 5: Final AI Core ────────────────────────────────────────
  {
    name: 'Final AI Core',
    subtitle: 'Eclipse\'s Domain',
    width: 60,
    height: 23,
    bgStyle: 'boss',
    hasRain: false,
    hasFog: true,
    musicKey: 'boss',
    playerStart: { x: 3, y: 18 },
    platforms: createPlatforms([
      // Boss arena - flat with some platforms
      [0, 21, 60, 2],
      // Arena platforms
      [10, 16, 4, 1],
      [25, 13, 5, 1],
      [40, 16, 4, 1],
      [15, 10, 3, 1],
      [35, 10, 3, 1],
    ]),
    enemies: [
      { type: 'FINAL_BOSS', x: 30, y: 16 },
    ],
    collectibles: [
      { type: 'HEALTH_PACK', x: 5, y: 19 },
      { type: 'ENERGY_CELL', x: 55, y: 19 },
    ],
    npcs: [
      { type: 'AI_ASSISTANT', x: 5, y: 19, dialogue: [
        { speaker: 'ARIA', portrait: 'aria', text: 'This is it, Aiden. Eclipse is right ahead.' },
        { speaker: 'ARIA', portrait: 'aria', text: 'It won\'t go down easily. Use all your abilities.' },
        { speaker: 'ARIA', portrait: 'aria', text: 'The fate of the digital world rests on you.' },
        { speaker: 'ARIA', portrait: 'aria', text: 'Good luck, programmer.' },
      ]},
    ],
    exitX: 55,
    quests: [
      { id: 'final_main', type: 'main', name: 'Project Eclipse', description: 'Defeat Eclipse and restore the digital world', objectives: [
        { type: 'kill', target: 'FINAL_BOSS', count: 1, description: 'Defeat Eclipse' }
      ], rewards: { xp: 1000, coins: 500 }}
    ]
  }
];
