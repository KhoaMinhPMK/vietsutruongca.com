// Game Constants
const GAME_CONFIG = {
    INTRO_DURATION: 7000, // 7 seconds
    FADE_IN_DURATION: 2000, // 2 seconds
    FADE_OUT_DURATION: 2000, // 2 seconds
};

// Screen IDs
const SCREENS = {
    WELCOME: 'welcome-screen',
    INTRO: 'intro-screen',
    LOADING: 'loading-screen',
    SCREEN1: 'screen-1',
    GAME: 'game-container',
};

// Map Configuration
const MAP_CONFIG = {
    TILE_SIZE: 16,                              // Pixels per tile (giảm xuống 16)
    MAP_WIDTH: 100,                             // Tiles (width) - 1600px
    MAP_HEIGHT: 70,                             // Tiles (height) - 1120px
    CANVAS_WIDTH: 1280,                         // Canvas width in pixels
    CANVAS_HEIGHT: 720,                         // Canvas height in pixels
    TILESET_PATH: 'assets/tilemap/grass.png',   // Path to tileset
    TILESET_COLS: 1,                            // Columns in tileset (1 for now)
    TILESET_TILE_SIZE: 64,                      // Original tile size in tileset file
};

// Player Configuration
const PLAYER_CONFIG = {
    IDLE_SPRITE_PATH: 'assets/sprites/player_idle.png', // Path to idle spritesheet
    IDLE_FRAME_WIDTH: 30,                       // Width of each idle frame
    IDLE_FRAME_HEIGHT: 50,                      // Height of each idle frame
    IDLE_FRAMES: 8,                             // Number of idle animation frames
    IDLE_FRAME_TIME: 100,                       // ms per frame for idle
    
    RUN_SPRITE_PATH: 'assets/sprites/Run.png',  // Path to run spritesheet (left/right)
    RUN_FRAME_WIDTH: 40,                        // Width of each run frame
    RUN_FRAME_HEIGHT: 50,                       // Height of each run frame
    RUN_FRAMES: 8,                              // Number of run animation frames
    RUN_FRAME_TIME: 80,                         // ms per frame for run
    
    RUN_BACK_SPRITE_PATH: 'assets/sprites/run_back.png', // Path to run back spritesheet (up)
    RUN_BACK_FRAME_WIDTH: 30,                  // Width of each run back frame
    RUN_BACK_FRAME_HEIGHT: 50,                 // Height of each run back frame
    RUN_BACK_FRAMES: 8,                        // Number of run back frames
    RUN_BACK_OFFSET_X: 8,                      // Offset X to skip empty space on left
    RUN_BACK_OFFSET_Y: 0,                      // Offset Y to skip empty space on top (chỉnh sau)
    
    RUN_FRONT_SPRITE_PATH: 'assets/sprites/run_front.png', // Path to run front spritesheet (down)
    RUN_FRONT_FRAME_WIDTH: 34.25,              // Width of each run front frame
    RUN_FRONT_FRAME_HEIGHT: 55,                // Height of each run front frame
    RUN_FRONT_FRAMES: 7,                       // Number of run front frames (skip first frame)
    RUN_FRONT_START_FRAME: 1,                  // Start from frame 1 (skip frame 0)
    RUN_FRONT_OFFSET_X: 23,                    // Offset X
    RUN_FRONT_OFFSET_Y: 66,                    // Offset Y
    
    SPEED: 3,                                   // Movement speed in pixels
};

// GameObject Configuration
const OBJECT_CONFIG = {
    DEFAULT_ZINDEX: 50,                         // Default z-index for objects
    PLAYER_ZINDEX: 50,                          // Player z-index
    SNAP_SIZE: 16,                              // Grid snap size in pixels
    INTERACTION_RANGE: 32,                      // Interaction distance in pixels
    DEBUG_MODE: false,                          // Show collision boxes and debug info
    
    // Z-Index layers
    LAYERS: {
        GROUND: -100,                           // Ground tiles
        GROUND_DECORATION: 0,                   // Ground decorations
        WATER: 30,                              // Water features
        OBJECTS_BACK: 40,                       // Objects behind player
        PLAYER: 50,                             // Player layer
        OBJECTS_MID: 55,                        // Mid-height objects (trees)
        OBJECTS_FRONT: 60,                      // Tall objects (houses)
        EFFECTS: 100,                           // Visual effects
        UI: 1000                                // UI elements
    },
    
    // Collision settings
    COLLISION: {
        ENABLED: true,                          // Enable collision detection
        CELL_SIZE: 64,                          // Spatial grid cell size
        PUSH_OUT: true                          // Push player out of obstacles
    }
};

// Assets to load
const GAME_ASSETS = {
    images: [
        'assets/images/bia.png',
        'assets/images/logo.png',
        'assets/images/bg1.png',
        'assets/images/bg2.png',
        'assets/tilemap/grass.png',
        'assets/sprites/player_idle.png',
        // Thêm các ảnh khác ở đây
    ],
    audio: [
        'assets/audio/logo.mp3',
        'assets/audio/sound.mp3',
        // Thêm các audio khác ở đây
    ],
    videos: [
        'assets/videos/video.mp4',
        // Thêm các video khác ở đây
    ]
};
