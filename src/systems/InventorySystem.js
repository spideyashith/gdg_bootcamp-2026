/**
 * InventorySystem.js - Item inventory management
 */

/**
 * Item types and their properties
 */
const ITEM_DEFINITIONS = {
  COIN:           { name: 'Coin', icon: 'collect_coin', stackable: true, maxStack: 999, description: 'Digital currency' },
  HEALTH_PACK:    { name: 'Health Pack', icon: 'collect_health', stackable: true, maxStack: 20, description: 'Restores 25 HP', usable: true },
  ENERGY_CELL:    { name: 'Energy Cell', icon: 'collect_energy', stackable: true, maxStack: 20, description: 'Restores 30 Energy', usable: true },
  CODE_FRAGMENT:  { name: 'Code Fragment', icon: 'collect_code', stackable: true, maxStack: 50, description: 'Key quest item' },
  UPGRADE_CHIP:   { name: 'Upgrade Chip', icon: 'collect_upgrade', stackable: true, maxStack: 20, description: 'Used for ability upgrades' }
};

export class InventorySystem {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} maxSlots - Maximum inventory slots
   */
  constructor(scene, maxSlots = 20) {
    this.scene = scene;
    this.maxSlots = maxSlots;
    /** @type {Array<{type: string, count: number}>} */
    this.items = [];
  }

  /**
   * Add an item to the inventory
   * @param {string} type - Item type key
   * @param {number} count - Amount to add
   * @returns {boolean} Whether the item was successfully added
   */
  addItem(type, count = 1) {
    const def = ITEM_DEFINITIONS[type];
    if (!def) {
      console.warn(`[Inventory] Unknown item type: ${type}`);
      return false;
    }

    if (def.stackable) {
      // Find existing stack
      const existing = this.items.find(i => i.type === type);
      if (existing) {
        existing.count = Math.min(existing.count + count, def.maxStack);
        this.scene.events.emit('inventoryChanged', this.items);
        return true;
      }
    }

    // Add new slot
    if (this.items.length < this.maxSlots) {
      this.items.push({ type, count });
      this.scene.events.emit('inventoryChanged', this.items);
      return true;
    }

    console.log('[Inventory] Inventory full!');
    return false;
  }

  /**
   * Remove an item from the inventory
   * @param {string} type
   * @param {number} count
   * @returns {boolean}
   */
  removeItem(type, count = 1) {
    const idx = this.items.findIndex(i => i.type === type);
    if (idx === -1) return false;

    this.items[idx].count -= count;
    if (this.items[idx].count <= 0) {
      this.items.splice(idx, 1);
    }
    this.scene.events.emit('inventoryChanged', this.items);
    return true;
  }

  /**
   * Get the count of a specific item type
   * @param {string} type
   * @returns {number}
   */
  getItemCount(type) {
    const item = this.items.find(i => i.type === type);
    return item ? item.count : 0;
  }

  /**
   * Check if the player has enough of an item
   * @param {string} type
   * @param {number} count
   * @returns {boolean}
   */
  hasItem(type, count = 1) {
    return this.getItemCount(type) >= count;
  }

  /**
   * Use a consumable item
   * @param {string} type
   * @param {Object} player - Player reference for applying effects
   * @returns {boolean}
   */
  useItem(type, player) {
    const def = ITEM_DEFINITIONS[type];
    if (!def || !def.usable || !this.hasItem(type)) return false;

    switch (type) {
      case 'HEALTH_PACK':
        player.heal(25);
        break;
      case 'ENERGY_CELL':
        player.restoreEnergy(30);
        break;
    }

    this.removeItem(type, 1);
    return true;
  }

  /**
   * Get all items (for save system)
   * @returns {Array}
   */
  getItems() {
    return [...this.items];
  }

  /**
   * Load items from save data
   * @param {Array} savedItems
   */
  loadItems(savedItems) {
    this.items = savedItems ? [...savedItems] : [];
    this.scene.events.emit('inventoryChanged', this.items);
  }

  /**
   * Get item definition
   * @param {string} type
   * @returns {Object}
   */
  static getDefinition(type) {
    return ITEM_DEFINITIONS[type] || null;
  }
}
