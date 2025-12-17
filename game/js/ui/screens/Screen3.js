/**
 * Screen3 - Màn chơi thứ 3 (Thu thập gỗ với nhiều cây)
 * Last updated: 2025-12-17 (Cache Buster)
 */
class Screen3 {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        
        // State
        this.isLoaded = false;
        
        // Game objects
        this.map = null;
        this.tileset = null;
        this.player = null;
        this.camera = null;
        this.objectManager = null;
        
        // Input
        this.keys = {};
        
        // Sprite sheets
        this.idleSpriteSheet = null;
        this.runSpriteSheet = null;
        this.runBackSpriteSheet = null;
        this.runFrontSpriteSheet = null;
        
        this.animationId = null;
        this.lastTime = 0;
    }

    async start() {
        console.log('🎮 Screen3 starting...');
        
        // Hide other screens
        const screens = ['welcome-screen', 'intro-screen', 'loading-screen'];
        screens.forEach(id => {
            const screen = document.getElementById(id);
            if (screen) {
                screen.classList.remove('active');
                screen.style.display = 'none';
            }
        });
        
        // Show and setup canvas
        const canvas = document.getElementById('game-canvas');
        const canvasContainer = document.getElementById('canvas-container');
        
        if (canvasContainer) canvasContainer.style.display = 'block';
        if (canvas) {
            canvas.style.display = 'block';
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');
        }
        
        // Load Screen3
        await this.load();
        
        // Start game loop
        this.activate();
    }

    async load() {
        console.log('🎮 Loading Screen3...');
        
        try {
            // Load tileset (same as Screen1)
            this.tileset = new Tileset(
                MAP_CONFIG.TILESET_PATH, 
                MAP_CONFIG.TILE_SIZE,
                MAP_CONFIG.TILESET_TILE_SIZE
            );
            await this.tileset.load();
            console.log('🗺️ Tileset loaded');
            
            // Load player sprites
            this.idleSpriteSheet = new SpriteSheet(
                PLAYER_CONFIG.IDLE_SPRITE_PATH,
                PLAYER_CONFIG.IDLE_FRAME_WIDTH,
                PLAYER_CONFIG.IDLE_FRAME_HEIGHT,
                PLAYER_CONFIG.IDLE_FRAMES,
                0, 0
            );
            
            this.runSpriteSheet = new SpriteSheet(
                PLAYER_CONFIG.RUN_SPRITE_PATH,
                PLAYER_CONFIG.RUN_FRAME_WIDTH,
                PLAYER_CONFIG.RUN_FRAME_HEIGHT,
                PLAYER_CONFIG.RUN_FRAMES
            );
            
            this.runBackSpriteSheet = new SpriteSheet(
                PLAYER_CONFIG.RUN_BACK_SPRITE_PATH,
                PLAYER_CONFIG.RUN_BACK_FRAME_WIDTH,
                PLAYER_CONFIG.RUN_BACK_FRAME_HEIGHT,
                PLAYER_CONFIG.RUN_BACK_FRAMES,
                PLAYER_CONFIG.RUN_BACK_OFFSET_X || 0,
                PLAYER_CONFIG.RUN_BACK_OFFSET_Y || 0
            );
            
            this.runFrontSpriteSheet = new SpriteSheet(
                PLAYER_CONFIG.RUN_FRONT_SPRITE_PATH,
                PLAYER_CONFIG.RUN_FRONT_FRAME_WIDTH,
                PLAYER_CONFIG.RUN_FRONT_FRAME_HEIGHT,
                PLAYER_CONFIG.RUN_FRONT_FRAMES,
                PLAYER_CONFIG.RUN_FRONT_OFFSET_X || 0,
                PLAYER_CONFIG.RUN_FRONT_OFFSET_Y || 0,
                PLAYER_CONFIG.RUN_FRONT_START_FRAME || 0
            );

            await Promise.all([
                this.idleSpriteSheet.load(),
                this.runSpriteSheet.load(),
                this.runBackSpriteSheet.load(),
                this.runFrontSpriteSheet.load()
            ]);
            console.log('👤 Player sprites loaded');

            // Create player at center
            const centerX = (MAP_CONFIG.MAP_WIDTH * MAP_CONFIG.TILE_SIZE) / 2;
            const centerY = (MAP_CONFIG.MAP_HEIGHT * MAP_CONFIG.TILE_SIZE) / 2;
            
            this.player = new Player(
                centerX,
                centerY,
                this.idleSpriteSheet,
                this.runSpriteSheet,
                this.runBackSpriteSheet,
                this.runFrontSpriteSheet,
                null
            );
            console.log('✅ Player created at:', centerX, centerY);

            // Create map (same as Screen1)
            this.map = new Map(
                MAP_CONFIG.MAP_WIDTH,
                MAP_CONFIG.MAP_HEIGHT,
                MAP_CONFIG.TILE_SIZE,
                this.tileset
            );
            console.log('🗺️ Map created');

            // Create camera
            this.camera = new Camera(
                MAP_CONFIG.MAP_WIDTH,
                MAP_CONFIG.MAP_HEIGHT,
                MAP_CONFIG.TILE_SIZE,
                this.canvas.width,
                this.canvas.height
            );
            
            const playerCenter = this.player.getCenter();
            this.camera.update(playerCenter.x, playerCenter.y);
            console.log('📷 Camera centered on player');

            // Load objects from map_data.json (only trees, no houses!)
            this.objectManager = new GameObjectManager();
            await this.loadMapObjects();
            console.log('🌳 Loaded trees from map_data.json');

            this.isLoaded = true;
            console.log('✅ Screen3 loaded successfully!');
            
        } catch (error) {
            console.error('❌ Error loading Screen3:', error);
        }
    }

    async loadMapObjects() {
        try {
            const response = await fetch('map_data.json');
            if (!response.ok) {
                console.warn('No map_data.json found');
                return;
            }
            
            const mapData = await response.json();
            
            // Load all objects first
            this.objectManager.loadFromJSON(mapData);
            
            // Filter to keep only InteractiveTree objects (remove houses)
            this.objectManager.objects = this.objectManager.objects.filter(obj => {
                return obj instanceof InteractiveTree;
            });
            
            // Rebuild objectsById map
            this.objectManager.objectsById = {};
            this.objectManager.objects.forEach(obj => {
                this.objectManager.objectsById[obj.id] = obj;
            });
            
            console.log(`✓ Loaded ${this.objectManager.objects.length} trees (houses filtered out)`);
        } catch (error) {
            console.warn('Could not load map objects:', error.message);
        }
    }

    async generateRandomTrees(count) {
        const treeTypes = [
            { 
                imagePath: 'assets/sprites/tree1.png',
                width: 100, height: 150,
                collisionWidth: 40, collisionHeight: 40,
                collisionOffsetY: 110
            },
            { 
                imagePath: 'assets/sprites/tree2.png',
                width: 120, height: 180,
                collisionWidth: 50, collisionHeight: 50,
                collisionOffsetY: 130
            },
            { 
                imagePath: 'assets/sprites/tree3.png',
                width: 90, height: 140,
                collisionWidth: 35, collisionHeight: 35,
                collisionOffsetY: 105
            }
        ];

        const centerX = (MAP_CONFIG.MAP_WIDTH * MAP_CONFIG.TILE_SIZE) / 2;
        const centerY = (MAP_CONFIG.MAP_HEIGHT * MAP_CONFIG.TILE_SIZE) / 2;
        const minDistanceFromPlayer = 200;
        const mapSize = MAP_CONFIG.MAP_WIDTH * MAP_CONFIG.TILE_SIZE;
        const margin = 100;

        for (let i = 0; i < count; i++) {
            let x, y, attempts = 0;
            const maxAttempts = 50;

            // Try to find a valid position
            do {
                x = Math.random() * (mapSize - 2 * margin) + margin;
                y = Math.random() * (mapSize - 2 * margin) + margin;
                attempts++;
                
                const distanceToPlayer = Math.sqrt(
                    Math.pow(x - centerX, 2) + 
                    Math.pow(y - centerY, 2)
                );
                
                if (distanceToPlayer >= minDistanceFromPlayer) {
                    break;
                }
            } while (attempts < maxAttempts);

            // Random tree type
            const treeType = treeTypes[Math.floor(Math.random() * treeTypes.length)];
            
            // Create tree
            const tree = new InteractiveTree(
                x, y,
                treeType.imagePath,
                treeType.width,
                treeType.height,
                treeType.collisionWidth,
                treeType.collisionHeight,
                treeType.collisionOffsetY,
                null // No gameManager needed
            );

            await tree.load();
            this.trees.push(tree);
        }
    }

    update(deltaTime) {
        if (!this.isLoaded || !this.player) return;

        // Handle keyboard input
        let dx = 0, dy = 0;
        if (this.keys['w'] || this.keys['arrowup']) dy -= 1;
        if (this.keys['s'] || this.keys['arrowdown']) dy += 1;
        if (this.keys['a'] || this.keys['arrowleft']) dx -= 1;
        if (this.keys['d'] || this.keys['arrowright']) dx += 1;

        // Normalize diagonal movement
        if (dx !== 0 && dy !== 0) {
            dx *= 0.707;
            dy *= 0.707;
        }

        // Move player with collision detection
        this.movePlayerWithCollision(dx, dy);
        this.player.update(deltaTime, 0, 0);

        // Update camera to follow player
        const playerCenter = this.player.getCenter();
        this.camera.update(playerCenter.x, playerCenter.y);

        // Update trees
        if (this.objectManager) {
            this.objectManager.objects.forEach(tree => {
                if (tree instanceof InteractiveTree) {
                    tree.update(this.player.x, this.player.y);
                }
            });
        }
    }

    movePlayerWithCollision(dx, dy) {
        if (!this.player) return;
        
        // Update player animation state
        this.player.move(dx, dy);
        
        // If no movement, no need to check collision
        if (dx === 0 && dy === 0) return;
        
        // Get player size
        const playerSize = this.player.getSize();
        
        // Calculate new position
        const newX = this.player.x + dx * this.player.speed;
        const newY = this.player.y + dy * this.player.speed;
        
        // Create player bounding box at new position
        const playerBox = {
            x: newX,
            y: newY,
            width: playerSize.width,
            height: playerSize.height
        };
        
        // Check collision with all collidable objects
        let hasCollision = false;
        if (this.objectManager) {
            const collidableObjects = this.objectManager.objects.filter(obj => obj.collidable);
            
            for (const obj of collidableObjects) {
                const objBox = obj.getBounds();
                
                // AABB collision detection
                if (this.checkAABB(playerBox, objBox)) {
                    hasCollision = true;
                    break;
                }
            }
        }
        
        // Only update position if no collision
        if (!hasCollision) {
            this.player.x = newX;
            this.player.y = newY;
        }
    }

    checkAABB(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }

    render() {
        if (!this.isLoaded) return;

        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Render map
        this.map.render(this.ctx, this.camera);

        // Render trees (behind player) - only InteractiveTree objects
        if (this.objectManager) {
            this.objectManager.objects.forEach(obj => {
                if (obj instanceof InteractiveTree) {
                    obj.render(this.ctx, this.camera);
                }
            });
        }

        // Render player
        this.player.render(this.ctx, this.camera);
    }

    handleInput(key, isPressed) {
        if (this.player) {
            this.player.handleInput(key, isPressed);
        }
    }

    activate() {
        console.log('🎮 Screen3 activated');
        
        // Start render loop
        this.startRenderLoop();
        
        // Setup input handlers
        this.setupInputHandlers();
    }

    startRenderLoop() {
        this.lastTime = performance.now();
        const loop = (currentTime) => {
            const deltaTime = currentTime - this.lastTime;
            this.lastTime = currentTime;
            
            this.update(deltaTime);
            this.render();
            this.animationId = requestAnimationFrame(loop);
        };
        loop(this.lastTime);
    }

    setupInputHandlers() {
        // Remove old listeners if any
        if (this.keydownHandler) {
            document.removeEventListener('keydown', this.keydownHandler);
        }
        if (this.keyupHandler) {
            document.removeEventListener('keyup', this.keyupHandler);
        }
        
        // Add new listeners
        this.keydownHandler = (e) => {
            this.keys[e.key.toLowerCase()] = true;
        };
        this.keyupHandler = (e) => {
            this.keys[e.key.toLowerCase()] = false;
        };
        
        document.addEventListener('keydown', this.keydownHandler);
        document.addEventListener('keyup', this.keyupHandler);
    }

    deactivate() {
        console.log('👋 Screen3 deactivated');
        
        // Stop animation loop
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        // Remove input handlers
        if (this.keydownHandler) {
            document.removeEventListener('keydown', this.keydownHandler);
        }
        if (this.keyupHandler) {
            document.removeEventListener('keyup', this.keyupHandler);
        }
    }
}
