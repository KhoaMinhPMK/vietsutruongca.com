/**
 * Object Type Definitions
 * Default properties for each object type
 */
const OBJECT_TYPES = {
    // Houses
    house: {
        displayName: 'House',
        category: 'buildings',
        defaultWidth: 96,
        defaultHeight: 128,
        defaultZIndex: 60,
        collidable: true,
        interactable: true,
        description: 'A house building'
    },
    
    house_small: {
        displayName: 'Small House',
        category: 'buildings',
        defaultWidth: 64,
        defaultHeight: 80,
        defaultZIndex: 60,
        collidable: true,
        interactable: true,
        description: 'A small house'
    },
    
    house_large: {
        displayName: 'Large House',
        category: 'buildings',
        defaultWidth: 128,
        defaultHeight: 160,
        defaultZIndex: 60,
        collidable: true,
        interactable: true,
        description: 'A large house'
    },
    
    // Trees
    tree: {
        displayName: 'Tree',
        category: 'nature',
        defaultWidth: 48,
        defaultHeight: 64,
        defaultZIndex: 55,
        collidable: true,
        interactable: false,
        description: 'A tree'
    },
    
    tree_small: {
        displayName: 'Small Tree',
        category: 'nature',
        defaultWidth: 32,
        defaultHeight: 48,
        defaultZIndex: 55,
        collidable: true,
        interactable: false,
        description: 'A small tree'
    },
    
    tree_large: {
        displayName: 'Large Tree',
        category: 'nature',
        defaultWidth: 64,
        defaultHeight: 96,
        defaultZIndex: 55,
        collidable: true,
        interactable: false,
        description: 'A large tree'
    },
    
    // Rocks
    rock: {
        displayName: 'Rock',
        category: 'nature',
        defaultWidth: 32,
        defaultHeight: 32,
        defaultZIndex: 45,
        collidable: true,
        interactable: false,
        description: 'A rock'
    },
    
    rock_small: {
        displayName: 'Small Rock',
        category: 'nature',
        defaultWidth: 16,
        defaultHeight: 16,
        defaultZIndex: 45,
        collidable: false,
        interactable: false,
        description: 'A small rock'
    },
    
    rock_large: {
        displayName: 'Large Rock',
        category: 'nature',
        defaultWidth: 48,
        defaultHeight: 48,
        defaultZIndex: 45,
        collidable: true,
        interactable: false,
        description: 'A large rock'
    },
    
    // Decorations
    flower: {
        displayName: 'Flower',
        category: 'decorations',
        defaultWidth: 16,
        defaultHeight: 16,
        defaultZIndex: 40,
        collidable: false,
        interactable: false,
        description: 'A flower'
    },
    
    bush: {
        displayName: 'Bush',
        category: 'decorations',
        defaultWidth: 32,
        defaultHeight: 24,
        defaultZIndex: 40,
        collidable: false,
        interactable: false,
        description: 'A bush'
    },
    
    grass_tuft: {
        displayName: 'Grass Tuft',
        category: 'decorations',
        defaultWidth: 16,
        defaultHeight: 16,
        defaultZIndex: 35,
        collidable: false,
        interactable: false,
        description: 'A tuft of grass'
    },
    
    // Structures
    fence: {
        displayName: 'Fence',
        category: 'structures',
        defaultWidth: 16,
        defaultHeight: 32,
        defaultZIndex: 50,
        collidable: true,
        interactable: false,
        description: 'A fence piece'
    },
    
    fence_horizontal: {
        displayName: 'Horizontal Fence',
        category: 'structures',
        defaultWidth: 32,
        defaultHeight: 16,
        defaultZIndex: 50,
        collidable: true,
        interactable: false,
        description: 'A horizontal fence piece'
    },
    
    gate: {
        displayName: 'Gate',
        category: 'structures',
        defaultWidth: 32,
        defaultHeight: 32,
        defaultZIndex: 50,
        collidable: false,
        interactable: true,
        description: 'A gate'
    },
    
    sign: {
        displayName: 'Sign',
        category: 'structures',
        defaultWidth: 24,
        defaultHeight: 32,
        defaultZIndex: 50,
        collidable: true,
        interactable: true,
        description: 'A sign post'
    },
    
    // Water features
    well: {
        displayName: 'Well',
        category: 'structures',
        defaultWidth: 48,
        defaultHeight: 48,
        defaultZIndex: 50,
        collidable: true,
        interactable: true,
        description: 'A water well'
    },
    
    pond: {
        displayName: 'Pond',
        category: 'nature',
        defaultWidth: 64,
        defaultHeight: 64,
        defaultZIndex: 30,
        collidable: true,
        interactable: false,
        description: 'A small pond'
    },
    
    // Special objects
    chest: {
        displayName: 'Chest',
        category: 'interactive',
        defaultWidth: 32,
        defaultHeight: 32,
        defaultZIndex: 45,
        collidable: true,
        interactable: true,
        description: 'A treasure chest'
    },
    
    npc: {
        displayName: 'NPC',
        category: 'interactive',
        defaultWidth: 32,
        defaultHeight: 48,
        defaultZIndex: 50,
        collidable: true,
        interactable: true,
        hasAnimation: true,
        animation: {
            frameCount: 8,
            frameTime: 100
        },
        description: 'A non-player character with idle animation'
    },
    
    npc_guard: {
        displayName: 'Guard',
        category: 'interactive',
        defaultWidth: 32,
        defaultHeight: 48,
        defaultZIndex: 50,
        collidable: true,
        interactable: true,
        hasAnimation: true,
        animation: {
            frameCount: 8,
            frameTime: 100
        },
        description: 'A guard NPC with idle animation'
    },
    
    npc_villager: {
        displayName: 'Villager',
        category: 'interactive',
        defaultWidth: 32,
        defaultHeight: 48,
        defaultZIndex: 50,
        collidable: true,
        interactable: true,
        hasAnimation: true,
        animation: {
            frameCount: 8,
            frameTime: 100
        },
        description: 'A villager NPC with idle animation'
    },
    
    npc_merchant: {
        displayName: 'Merchant',
        category: 'interactive',
        defaultWidth: 32,
        defaultHeight: 48,
        defaultZIndex: 50,
        collidable: true,
        interactable: true,
        hasAnimation: true,
        animation: {
            frameCount: 8,
            frameTime: 100
        },
        description: 'A merchant NPC with idle animation'
    },
    
    npc_caolo: {
        displayName: 'Cao Lỗ',
        category: 'interactive',
        defaultWidth: 30,
        defaultHeight: 50,
        defaultZIndex: 50,
        collidable: true,
        interactable: true,
        hasAnimation: true,
        animation: {
            frameCount: 8,
            frameTime: 100
        },
        defaultSprite: 'assets/sprites/caolo.png',
        description: 'Nhân vật Cao Lỗ với idle animation'
    },
    
    // Custom/default
    custom: {
        displayName: 'Custom Object',
        category: 'custom',
        defaultWidth: 32,
        defaultHeight: 32,
        defaultZIndex: 50,
        collidable: false,
        interactable: false,
        description: 'A custom object'
    }
};

/**
 * Object Categories for organizing in UI
 */
const OBJECT_CATEGORIES = {
    buildings: { name: 'Buildings', icon: '🏠' },
    nature: { name: 'Nature', icon: '🌳' },
    decorations: { name: 'Decorations', icon: '🌸' },
    structures: { name: 'Structures', icon: '🚧' },
    interactive: { name: 'Interactive', icon: '💬' },
    custom: { name: 'Custom', icon: '📦' }
};

/**
 * Get default properties for object type
 * @param {string} type - Object type
 * @returns {Object}
 */
function getObjectTypeDefaults(type) {
    return OBJECT_TYPES[type] || OBJECT_TYPES.custom;
}

/**
 * Get all object types in a category
 * @param {string} category - Category name
 * @returns {Array}
 */
function getObjectTypesByCategory(category) {
    return Object.entries(OBJECT_TYPES)
        .filter(([_, props]) => props.category === category)
        .map(([type, props]) => ({ type, ...props }));
}

/**
 * Get all categories
 * @returns {Array}
 */
function getAllCategories() {
    return Object.entries(OBJECT_CATEGORIES).map(([id, props]) => ({
        id,
        ...props
    }));
}
