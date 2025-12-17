// Screen 1 - Main Game Screen with Map
class Screen1 {
    constructor() {
        this.screen = document.getElementById('screen-1');
        this.canvas = null;
        this.ctx = null;
        this.map = null;
        this.camera = null;
        this.tileset = null;
        this.player = null;
        this.idleSpriteSheet = null;
        this.runSpriteSheet = null;
        this.runBackSpriteSheet = null;
        this.runFrontSpriteSheet = null;
        this.animationId = null;
        this.lastTime = 0;
        
        // Game objects from editor
        this.objectManager = null;
        
        // Keyboard state
        this.keys = {};
        
        // Joystick state (for mobile)
        this.joystick = {
            active: false,
            startX: 0,
            startY: 0,
            currentX: 0,
            currentY: 0,
            deltaX: 0,
            deltaY: 0
        };
        
        this.setupCanvas();
    }

    /**
     * Setup canvas element
     */
    setupCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'game-canvas';
        
        // Make canvas responsive
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (isMobile) {
            // Mobile: Full screen
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        } else {
            // Desktop: Fixed size
            this.canvas.width = MAP_CONFIG.CANVAS_WIDTH;
            this.canvas.height = MAP_CONFIG.CANVAS_HEIGHT;
        }
        
        this.ctx = this.canvas.getContext('2d');
        
        // Style canvas for mobile
        this.canvas.style.display = 'block';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.touchAction = 'none'; // Prevent default touch behaviors
        
        // Clear screen and add canvas
        this.screen.innerHTML = '';
        this.screen.appendChild(this.canvas);
        
        // Add joystick for mobile
        const joystickHTML = `
            <div id="joystick-container" style="
                position: fixed;
                bottom: 50px;
                left: 50px;
                width: 150px;
                height: 150px;
                background: rgba(255, 255, 255, 0.1);
                border: 3px solid rgba(212, 175, 55, 0.5);
                border-radius: 50%;
                display: none;
                touch-action: none;
            ">
                <div id="joystick-stick" style="
                    position: absolute;
                    width: 60px;
                    height: 60px;
                    background: rgba(212, 175, 55, 0.8);
                    border: 2px solid #d4af37;
                    border-radius: 50%;
                    left: 50%;
                    top: 50%;
                    transform: translate(-50%, -50%);
                    pointer-events: none;
                "></div>
            </div>
        `;
        this.screen.insertAdjacentHTML('beforeend', joystickHTML);
        
        // Auto-resize canvas for mobile/desktop
        this.setupCanvasResize();
        
        console.log('Canvas created:', this.canvas.width, 'x', this.canvas.height);
        console.log('Device:', /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop');
    }

    /**
     * Setup canvas auto-resize for responsive design
     */
    setupCanvasResize() {
        const updateAppHeight = () => {
            // Update CSS variable for real viewport height (fixes mobile browser chrome)
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
        };
        
        const resizeCanvas = () => {
            const isMobile = window.innerWidth <= 768;
            
            // Update app height for mobile browsers
            updateAppHeight();
            
            if (isMobile) {
                // Full screen on mobile - use actual viewport height
                this.canvas.width = window.innerWidth;
                this.canvas.height = window.innerHeight;
                
                // Force canvas to fill screen
                this.canvas.style.width = `${window.innerWidth}px`;
                this.canvas.style.height = `${window.innerHeight}px`;
                
                // Show joystick on mobile
                const joystick = document.getElementById('joystick-container');
                if (joystick) joystick.style.display = 'block';
            } else {
                // Fixed size on desktop (16:9 aspect ratio)
                const maxWidth = window.innerWidth - 40;
                const maxHeight = window.innerHeight - 40;
                const aspectRatio = 16 / 9;
                
                let width = maxWidth;
                let height = width / aspectRatio;
                
                if (height > maxHeight) {
                    height = maxHeight;
                    width = height * aspectRatio;
                }
                
                this.canvas.width = width;
                this.canvas.height = height;
                
                // Reset canvas style
                this.canvas.style.width = '';
                this.canvas.style.height = '';
                
                // Hide joystick on desktop
                const joystick = document.getElementById('joystick-container');
                if (joystick) joystick.style.display = 'none';
            }
            
            // Update camera dimensions if camera exists
            if (this.camera) {
                this.camera.canvasWidth = this.canvas.width;
                this.camera.canvasHeight = this.canvas.height;
                this.camera.width = this.canvas.width;
                this.camera.height = this.canvas.height;
            }
            
            console.log(`Canvas resized: ${this.canvas.width}x${this.canvas.height} (${isMobile ? 'Mobile' : 'Desktop'})`);
        };
        
        // Initial resize
        resizeCanvas();
        
        // Resize on window resize or orientation change
        window.addEventListener('resize', resizeCanvas);
        window.addEventListener('orientationchange', () => {
            setTimeout(resizeCanvas, 100); // Delay for orientation change
        });
        
        // Handle mobile browser address bar show/hide
        let resizeTimer;
        window.addEventListener('scroll', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(resizeCanvas, 100);
        });
    }

    /**
     * Start screen 1 - Load and render map
     */
    async start() {
        console.log('Screen 1 started - Loading map...');
        
        try {
            // Load tileset
            this.tileset = new Tileset(
                MAP_CONFIG.TILESET_PATH, 
                MAP_CONFIG.TILE_SIZE,
                MAP_CONFIG.TILESET_TILE_SIZE
            );
            await this.tileset.load();
            
            // Try to load player spritesheets (optional)
            try {
                this.idleSpriteSheet = new SpriteSheet(
                    PLAYER_CONFIG.IDLE_SPRITE_PATH,
                    PLAYER_CONFIG.IDLE_FRAME_WIDTH,
                    PLAYER_CONFIG.IDLE_FRAME_HEIGHT,
                    PLAYER_CONFIG.IDLE_FRAMES,
                    0,
                    0
                );
                await this.idleSpriteSheet.load();
                
                this.runSpriteSheet = new SpriteSheet(
                    PLAYER_CONFIG.RUN_SPRITE_PATH,
                    PLAYER_CONFIG.RUN_FRAME_WIDTH,
                    PLAYER_CONFIG.RUN_FRAME_HEIGHT,
                    PLAYER_CONFIG.RUN_FRAMES
                );
                await this.runSpriteSheet.load();
                
                this.runBackSpriteSheet = new SpriteSheet(
                    PLAYER_CONFIG.RUN_BACK_SPRITE_PATH,
                    PLAYER_CONFIG.RUN_BACK_FRAME_WIDTH,
                    PLAYER_CONFIG.RUN_BACK_FRAME_HEIGHT,
                    PLAYER_CONFIG.RUN_BACK_FRAMES,
                    PLAYER_CONFIG.RUN_BACK_OFFSET_X || 0,
                    PLAYER_CONFIG.RUN_BACK_OFFSET_Y || 0
                );
                await this.runBackSpriteSheet.load();
                
                this.runFrontSpriteSheet = new SpriteSheet(
                    PLAYER_CONFIG.RUN_FRONT_SPRITE_PATH,
                    PLAYER_CONFIG.RUN_FRONT_FRAME_WIDTH,
                    PLAYER_CONFIG.RUN_FRONT_FRAME_HEIGHT,
                    PLAYER_CONFIG.RUN_FRONT_FRAMES,
                    PLAYER_CONFIG.RUN_FRONT_OFFSET_X || 0,
                    PLAYER_CONFIG.RUN_FRONT_OFFSET_Y || 0,
                    PLAYER_CONFIG.RUN_FRONT_START_FRAME || 0
                );
                await this.runFrontSpriteSheet.load();
                
                // Create player at center of map
                const centerX = (MAP_CONFIG.MAP_WIDTH * MAP_CONFIG.TILE_SIZE) / 2;
                const centerY = (MAP_CONFIG.MAP_HEIGHT * MAP_CONFIG.TILE_SIZE) / 2;
                this.player = new Player(centerX, centerY, this.idleSpriteSheet, this.runSpriteSheet, this.runBackSpriteSheet, this.runFrontSpriteSheet);
                
                console.log('Player loaded successfully!');
            } catch (error) {
                console.warn('Player sprite not found, skipping player:', error.message);
                this.player = null;
            }
            
            // Create map
            this.map = new Map(
                MAP_CONFIG.MAP_WIDTH,
                MAP_CONFIG.MAP_HEIGHT,
                MAP_CONFIG.TILE_SIZE,
                this.tileset
            );
            
            // Initialize object manager and try to load map objects
            this.objectManager = new GameObjectManager();
            await this.loadMapObjects();
            
            // Create camera with actual canvas dimensions
            this.camera = new Camera(
                MAP_CONFIG.MAP_WIDTH,
                MAP_CONFIG.MAP_HEIGHT,
                MAP_CONFIG.TILE_SIZE,
                this.canvas.width,
                this.canvas.height
            );
            
            // Center camera on player or map center
            if (this.player) {
                const playerCenter = this.player.getCenter();
                this.camera.update(playerCenter.x, playerCenter.y);
            } else {
                // Center camera on middle of map
                const centerX = (MAP_CONFIG.MAP_WIDTH * MAP_CONFIG.TILE_SIZE) / 2;
                const centerY = (MAP_CONFIG.MAP_HEIGHT * MAP_CONFIG.TILE_SIZE) / 2;
                this.camera.update(centerX, centerY);
            }
            
            console.log('Map loaded successfully!');
            
            // ===== SPAWN NPCs TỪ CODE (Tùy chọn) =====
            // Comment dòng loadMapObjects() ở trên và dùng code dưới đây
            // để spawn NPCs trực tiếp từ code thay vì dùng map_data.json
            /*
            this.spawnNPC('npc_caolo', 100, 100, 'sprites/caolo.png', {
                name: 'Cao Lỗ số 1'
            });
            
            // Hoặc spawn nhiều NPCs cùng lúc:
            this.spawnNPCs([
                { type: 'npc_caolo', x: 200, y: 150, sprite: 'sprites/caolo.png' },
                { type: 'npc_caolo', x: 300, y: 200, sprite: 'sprites/caolo.png' },
                { type: 'npc_caolo', x: 400, y: 250, sprite: 'sprites/caolo.png' }
            ]);
            */
            
            // Start render loop
            this.startRenderLoop();
            
            // Add controls
            this.setupMouseControls();
            this.setupKeyboardControls();
            this.setupJoystickControls();
            
            // Setup global console commands for easy NPC spawning
            this.setupConsoleCommands();
            
        } catch (error) {
            console.error('Failed to load map:', error);
        }
    }

    /**     * Load map objects from JSON file
     */
    async loadMapObjects() {
        try {
            const response = await fetch('map_data.json');
            if (!response.ok) {
                console.warn('No map_data.json found, starting with empty map');
                return;
            }
            
            const mapData = await response.json();
            this.objectManager.loadFromJSON(mapData);
            console.log(`✓ Loaded ${this.objectManager.objects.length} objects from map_data.json`);
        } catch (error) {
            console.warn('Could not load map objects:', error.message);
        }
    }

    /**
     * Spawn NPC từ code (tiện hơn editor!)
     * @param {string} npcType - Loại NPC (vd: 'npc_caolo', 'npc_guard')
     * @param {number} x - Vị trí X
     * @param {number} y - Vị trí Y
     * @param {string} spritePath - Đường dẫn sprite
     * @param {Object} options - Tùy chọn thêm (width, height, animation, etc.)
     */
    spawnNPC(npcType, x, y, spritePath, options = {}) {
        const npcData = {
            id: `npc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: npcType,
            spritePath: spritePath,
            x: x,
            y: y,
            width: options.width || 30,
            height: options.height || 50,
            zIndex: options.zIndex || 50,
            collidable: options.collidable !== undefined ? options.collidable : true,
            interactable: options.interactable !== undefined ? options.interactable : true,
            metadata: {
                name: options.name || npcType,
                animation: options.animation || {
                    frameCount: 8,
                    frameTime: 100
                }
            }
        };
        
        const npc = NPC.fromJSON(npcData);
        this.objectManager.add(npc);
        console.log(`✓ Spawned ${npcType} at (${x}, ${y})`);
        return npc;
    }

    /**
     * Spawn nhiều NPCs cùng lúc từ danh sách vị trí
     * @param {Array} npcList - Array of {type, x, y, sprite, ...options}
     */
    spawnNPCs(npcList) {
        for (const npcConfig of npcList) {
            this.spawnNPC(
                npcConfig.type,
                npcConfig.x,
                npcConfig.y,
                npcConfig.sprite,
                npcConfig.options || {}
            );
        }
        console.log(`✓ Spawned ${npcList.length} NPCs`);
    }

    /**
     * Setup global console commands để spawn NPCs dễ dàng
     */
    setupConsoleCommands() {
        // Make this Screen1 instance accessible globally
        window.gameScreen = this;
        
        // Command: spawn(type, x, y) - Spawn NPCs
        window.spawn = (type, x, y, name) => {
            const spriteMap = {
                'caolo': 'assets/sprites/caolo.png',
                'guard': 'assets/sprites/guard_idle.png',
                'villager': 'assets/sprites/villager_idle.png',
                'merchant': 'assets/sprites/merchant_idle.png'
            };
            
            const sprite = spriteMap[type] || 'assets/sprites/caolo.png';
            const npcType = `npc_${type}`;
            
            return this.spawnNPC(npcType, x, y, sprite, {
                name: name || type
            });
        };
        
        // Command: house(type, x, y) - Spawn houses
        window.house = (type, x, y) => {
            const houseMap = {
                'small': { sprite: 'assets/objects/buildings/house_small.png', width: 64, height: 80 },
                'large': { sprite: 'assets/objects/buildings/house_large.png', width: 128, height: 160 },
                'medium': { sprite: 'assets/objects/buildings/house.png', width: 96, height: 120 }
            };
            
            const config = houseMap[type] || houseMap['small'];
            const objData = {
                id: `house_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                type: `house_${type}`,
                spritePath: config.sprite,
                x: x,
                y: y,
                width: config.width,
                height: config.height,
                zIndex: 60,
                collidable: true,
                interactable: false,
                metadata: { name: `House ${type}` }
            };
            
            const obj = GameObject.fromJSON(objData);
            this.objectManager.add(obj);
            console.log(`✓ Spawned house_${type} at (${x}, ${y})`);
            return obj;
        };
        
        // Command: spawnAt(type, name) - spawn at mouse position
        window.spawnAt = (type, name) => {
            if (!this.mouseWorldX || !this.mouseWorldY) {
                console.error('❌ Di chuyển chuột trên map trước!');
                return;
            }
            return window.spawn(type, this.mouseWorldX, this.mouseWorldY, name);
        };
        
        // Command: clearNPCs() - xóa tất cả NPCs
        window.clearNPCs = () => {
            const npcCount = this.objectManager.objects.length;
            this.objectManager.objects = [];
            this.objectManager.objectsById = {};
            console.log(`✓ Đã xóa ${npcCount} NPCs`);
        };
        
        // Command: listNPCs() - list all NPCs
        window.listNPCs = () => {
            console.table(this.objectManager.objects.map(obj => ({
                id: obj.id,
                type: obj.type,
                x: obj.x,
                y: obj.y,
                name: obj.metadata?.name
            })));
        };
        
        console.log('%c🎮 Console Commands đã sẵn sàng!', 'color: #00ff00; font-size: 14px; font-weight: bold');
        console.log('%cCách dùng:', 'color: #d4af37; font-weight: bold');
        console.log('  spawn("caolo", 200, 300)          - Spawn NPC Cao Lỗ tại (200, 300)');
        console.log('  spawnAt("caolo")                  - Spawn NPC tại vị trí chuột');
        console.log('  house("small", 200, 300)          - Spawn nhà nhỏ tại (200, 300)');
        console.log('  house("large", 400, 500)          - Spawn nhà lớn tại (400, 500)');
        console.log('  listNPCs()                        - Xem tất cả objects');
        console.log('  clearNPCs()                       - Xóa tất cả objects');
        console.log('%cVí dụ: Di chuột đến vị trí → xem Mouse: X, Y → gõ lệnh', 'color: #00ff00');
    }

    /**     * Setup mouse controls for camera
     */
    setupMouseControls() {
        let isDragging = false;
        let lastX = 0;
        let lastY = 0;

        this.canvas.addEventListener('mousedown', (e) => {
            isDragging = true;
            lastX = e.clientX;
            lastY = e.clientY;
            this.canvas.style.cursor = 'grabbing';
        });

        this.canvas.addEventListener('mousemove', (e) => {
            // Update mouse world position for debug display
            const rect = this.canvas.getBoundingClientRect();
            const canvasX = e.clientX - rect.left;
            const canvasY = e.clientY - rect.top;
            this.mouseWorldX = Math.floor(this.camera.x + canvasX);
            this.mouseWorldY = Math.floor(this.camera.y + canvasY);
            
            if (!isDragging) return;

            const deltaX = e.clientX - lastX;
            const deltaY = e.clientY - lastY;

            this.camera.x -= deltaX;
            this.camera.y -= deltaY;

            // Clamp camera
            this.camera.x = Math.max(0, Math.min(this.camera.x, this.camera.mapWidth - this.camera.canvasWidth));
            this.camera.y = Math.max(0, Math.min(this.camera.y, this.camera.mapHeight - this.camera.canvasHeight));

            lastX = e.clientX;
            lastY = e.clientY;
        });

        this.canvas.addEventListener('mouseup', () => {
            isDragging = false;
            this.canvas.style.cursor = 'grab';
        });

        this.canvas.addEventListener('mouseleave', () => {
            isDragging = false;
            this.canvas.style.cursor = 'grab';
        });

        this.canvas.style.cursor = 'grab';
    }

    /**
     * Setup keyboard controls for player movement
     */
    setupKeyboardControls() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
    }

    /**
     * Setup joystick controls for mobile
     */
    setupJoystickControls() {
        const container = document.getElementById('joystick-container');
        const stick = document.getElementById('joystick-stick');
        
        if (!container || !stick) return;
        
        // Show joystick on touch devices
        if ('ontouchstart' in window) {
            container.style.display = 'block';
        }
        
        const maxDistance = 45; // Max distance stick can move from center
        
        const handleStart = (x, y) => {
            this.joystick.active = true;
            this.joystick.startX = x;
            this.joystick.startY = y;
            this.joystick.currentX = x;
            this.joystick.currentY = y;
        };
        
        const handleMove = (x, y) => {
            if (!this.joystick.active) return;
            
            this.joystick.currentX = x;
            this.joystick.currentY = y;
            
            // Calculate delta from center
            const deltaX = x - this.joystick.startX;
            const deltaY = y - this.joystick.startY;
            
            // Calculate distance and angle
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            const angle = Math.atan2(deltaY, deltaX);
            
            // Limit distance
            const limitedDistance = Math.min(distance, maxDistance);
            
            // Update stick position
            const stickX = Math.cos(angle) * limitedDistance;
            const stickY = Math.sin(angle) * limitedDistance;
            stick.style.transform = `translate(calc(-50% + ${stickX}px), calc(-50% + ${stickY}px))`;
            
            // Normalize for movement (-1 to 1)
            this.joystick.deltaX = stickX / maxDistance;
            this.joystick.deltaY = stickY / maxDistance;
        };
        
        const handleEnd = () => {
            this.joystick.active = false;
            this.joystick.deltaX = 0;
            this.joystick.deltaY = 0;
            stick.style.transform = 'translate(-50%, -50%)';
        };
        
        // Touch events
        container.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            handleStart(touch.clientX, touch.clientY);
        });
        
        container.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            handleMove(touch.clientX, touch.clientY);
        });
        
        container.addEventListener('touchend', (e) => {
            e.preventDefault();
            handleEnd();
        });
        
        // Mouse events (for testing on desktop)
        container.addEventListener('mousedown', (e) => {
            handleStart(e.clientX, e.clientY);
        });
        
        window.addEventListener('mousemove', (e) => {
            handleMove(e.clientX, e.clientY);
        });
        
        window.addEventListener('mouseup', () => {
            handleEnd();
        });
    }

    /**
     * Start render loop
     */
    startRenderLoop() {
        this.lastTime = performance.now();
        const render = (currentTime) => {
            const deltaTime = currentTime - this.lastTime;
            this.lastTime = currentTime;
            
            this.update(deltaTime);
            this.render();
            this.animationId = requestAnimationFrame(render);
        };
        render(this.lastTime);
    }

    /**
     * Move player with collision detection
     */
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
    
    /**
     * Check AABB collision between two rectangles
     */
    checkAABB(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    /**
     * Update game logic
     */
    update(deltaTime) {
        if (this.player && this.camera) {
            // Handle WASD movement
            let dx = 0;
            let dy = 0;
            
            // Keyboard input
            if (this.keys['w'] || this.keys['arrowup']) dy -= 1;
            if (this.keys['s'] || this.keys['arrowdown']) dy += 1;
            if (this.keys['a'] || this.keys['arrowleft']) dx -= 1;
            if (this.keys['d'] || this.keys['arrowright']) dx += 1;
            
            // Joystick input (overrides keyboard if active)
            if (this.joystick.active) {
                dx = this.joystick.deltaX;
                dy = this.joystick.deltaY;
            }
            
            // Normalize diagonal movement
            if (dx !== 0 && dy !== 0 && !this.joystick.active) {
                dx *= 0.707; // 1/sqrt(2)
                dy *= 0.707;
            }
            
            // Move player with collision detection
            this.movePlayerWithCollision(dx, dy);
            this.player.update(deltaTime, 0, 0); // Update animation only, no map bounds
            
            // Update NPCs animations
            if (this.objectManager && this.objectManager.objects) {
                for (const obj of this.objectManager.objects) {
                    // Update NPC animations
                    if (obj instanceof NPC) {
                        obj.update(deltaTime);
                    }
                }
            }
            
            // Camera follow player first
            const playerCenter = this.player.getCenter();
            this.camera.update(playerCenter.x, playerCenter.y);
            
            // STRICT viewport constraint: Player cannot go outside what camera sees
            const margin = 5;
            const playerWidth = 40; // Fixed width for boundary check
            const playerHeight = 55; // Fixed height for boundary check
            
            // Player must stay within camera viewport
            const leftBound = this.camera.x + margin;
            const rightBound = this.camera.x + this.camera.canvasWidth - playerWidth - margin;
            const topBound = this.camera.y + margin;
            const bottomBound = this.camera.y + this.camera.canvasHeight - playerHeight - margin;
            
            // Clamp player to viewport
            if (this.player.x < leftBound) this.player.x = leftBound;
            if (this.player.x > rightBound) this.player.x = rightBound;
            if (this.player.y < topBound) this.player.y = topBound;
            if (this.player.y > bottomBound) this.player.y = bottomBound;
        }
    }

    /**
     * Render everything
     */
    render() {
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Render map (tilemap background)
        if (this.map && this.camera) {
            this.map.render(this.ctx, this.camera);
        }

        // Render game objects (from editor) using LayeredRenderer
        if (this.objectManager && this.camera) {
            // Save context for camera transform
            this.ctx.save();
            
            // Get objects behind player (z-index < 50)
            const objectsBehind = this.objectManager.objects.filter(obj => obj.zIndex < 50);
            const objectsInFront = this.objectManager.objects.filter(obj => obj.zIndex >= 50);
            
            // Render objects behind player
            objectsBehind.forEach(obj => obj.render(this.ctx, this.camera));
            
            this.ctx.restore();
            
            // Render player
            if (this.player) {
                this.player.render(this.ctx, this.camera);
            }
            
            // Save context again for objects in front
            this.ctx.save();
            
            // Render objects in front of player
            objectsInFront.forEach(obj => obj.render(this.ctx, this.camera));
            
            this.ctx.restore();
        } else {
            // No objects, just render player
            if (this.player && this.camera) {
                this.player.render(this.ctx, this.camera);
            }
        }

        // Draw info text
        this.drawDebugInfo();
    }

    /**
     * Draw debug information
     */
    drawDebugInfo() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(10, 10, 350, 150);
        
        this.ctx.fillStyle = '#d4af37';
        this.ctx.font = '16px monospace';
        this.ctx.fillText(`Map: ${MAP_CONFIG.MAP_WIDTH}x${MAP_CONFIG.MAP_HEIGHT} tiles`, 20, 30);
        this.ctx.fillText(`Camera: ${Math.round(this.camera.x)}, ${Math.round(this.camera.y)}`, 20, 55);
        
        if (this.player) {
            this.ctx.fillText(`Player: ${Math.round(this.player.x)}, ${Math.round(this.player.y)}`, 20, 80);
            this.ctx.fillText(`Animation: ${this.player.currentAnimation.name}`, 20, 105);
        }
        
        // Display mouse world coordinates
        if (this.mouseWorldX !== undefined && this.mouseWorldY !== undefined) {
            this.ctx.fillStyle = '#00ff00';
            this.ctx.fillText(`Mouse: ${this.mouseWorldX}, ${this.mouseWorldY}`, 20, 130);
        }
    }

    /**
     * Stop screen
     */
    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
}
