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
        
        // Resource management
        this.resourceManager = new ResourceManager();
        this.resourceBar = new ResourceBar(this.resourceManager);
        
        // Setup mission complete callback
        this.resourceManager.onMissionComplete = () => {
            this.showMissionComplete();
        };
        
        // Dialog system
        this.dialogPanel = new DialogPanel();
        
        // Completion panel
        this.completionPanel = new CompletionPanel();
        
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
        
        // Debug panel state
        this.showDebugPanel = false;
        
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
            
            <!-- Fullscreen Button -->
            <button id="fullscreen-btn" style="
                position: fixed;
                top: 20px;
                right: 20px;
                width: 50px;
                height: 50px;
                background: rgba(0, 0, 0, 0.7);
                border: 2px solid #d4af37;
                border-radius: 10px;
                color: #d4af37;
                font-size: 24px;
                cursor: pointer;
                z-index: 1000;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
            " title="Full màn hình">
                ⛶
            </button>
            
            <!-- Debug Button -->
            <button id="debug-btn" style="
                position: fixed;
                top: 20px;
                left: 20px;
                width: 50px;
                height: 50px;
                background: rgba(0, 0, 0, 0.8);
                border: 2px solid #666;
                border-radius: 10px;
                color: #fff;
                font-size: 28px;
                cursor: pointer;
                z-index: 1000;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
            " title="Debug Panel">
                🪲
            </button>
        `;
        this.screen.insertAdjacentHTML('beforeend', joystickHTML);
        
        // Setup fullscreen button
        this.setupFullscreenButton();
        
        // Setup debug button
        this.setupDebugButton();
        
        // Auto-resize canvas for mobile/desktop
        this.setupCanvasResize();
        
        console.log('Canvas created:', this.canvas.width, 'x', this.canvas.height);
        console.log('Device:', /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop');
    }

    /**
     * Setup fullscreen button
     */
    setupFullscreenButton() {
        const btn = document.getElementById('fullscreen-btn');
        if (!btn) return;
        
        const toggleFullscreen = async () => {
            try {
                if (!document.fullscreenElement) {
                    // Enter fullscreen
                    await document.documentElement.requestFullscreen({ navigationUI: "hide" });
                    btn.innerHTML = '⛶'; // Change icon when fullscreen
                    btn.style.background = 'rgba(212, 175, 55, 0.3)';
                } else {
                    // Exit fullscreen
                    await document.exitFullscreen();
                    btn.innerHTML = '⛶';
                    btn.style.background = 'rgba(0, 0, 0, 0.7)';
                }
            } catch (error) {
                console.warn('Fullscreen not supported:', error);
            }
        };
        
        // Button click
        btn.addEventListener('click', toggleFullscreen);
        
        // Handle fullscreen change (user pressing ESC, etc.)
        document.addEventListener('fullscreenchange', () => {
            if (document.fullscreenElement) {
                btn.style.opacity = '0.3'; // Fade out when fullscreen
                btn.innerHTML = '✕'; // X icon to exit
            } else {
                btn.style.opacity = '1';
                btn.innerHTML = '⛶'; // Fullscreen icon
            }
        });
        
        // Hover effects
        btn.addEventListener('mouseenter', () => {
            btn.style.transform = 'scale(1.1)';
            btn.style.background = 'rgba(212, 175, 55, 0.5)';
        });
        
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'scale(1)';
            if (!document.fullscreenElement) {
                btn.style.background = 'rgba(0, 0, 0, 0.7)';
            }
        });
    }

    /**
     * Setup debug button
     */
    setupDebugButton() {
        const btn = document.getElementById('debug-btn');
        if (!btn) return;
        
        // Toggle debug panel
        btn.addEventListener('click', () => {
            this.showDebugPanel = !this.showDebugPanel;
            console.log('🪲 Debug panel:', this.showDebugPanel ? 'OPENED' : 'CLOSED');
        });
        
        // Hover effects
        btn.addEventListener('mouseenter', () => {
            btn.style.transform = 'scale(1.1)';
            btn.style.background = 'rgba(100, 100, 100, 0.8)';
        });
        
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'scale(1)';
            btn.style.background = 'rgba(0, 0, 0, 0.8)';
        });
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
                if (joystick) {
                    joystick.style.display = 'block';
                    joystick.style.zIndex = '2000'; // Ensure on top
                }
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
        
        // Handle fullscreen changes - resize canvas and show joystick
        document.addEventListener('fullscreenchange', () => {
            console.log('Fullscreen changed, resizing...');
            setTimeout(resizeCanvas, 100); // Resize after fullscreen change
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
                this.player = new Player(centerX, centerY, this.idleSpriteSheet, this.runSpriteSheet, this.runBackSpriteSheet, this.runFrontSpriteSheet, null);
                
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
            // Spawn random 1-3 Cao Lỗ NPCs at random positions
            this.spawnRandomCaoLo();
            
            // Start render loop
            this.startRenderLoop();
            
            // Add controls
            this.setupMouseControls();
            this.setupKeyboardControls();
            this.setupJoystickControls();
            this.setupTreeInteraction();
            this.setupNPCInteraction(); // Now includes gate interaction
            
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
            
            // Pass resourceManager to all InteractiveTree objects
            this.objectManager.objects.forEach(obj => {
                if (obj instanceof InteractiveTree) {
                    obj.resourceManager = this.resourceManager;
                }
            });
            console.log('✓ ResourceManager linked to all interactive trees');
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
                },
                dialogs: options.dialogs || null
            }
        };
        
        const npc = NPC.fromJSON(npcData);
        this.objectManager.add(npc);
        console.log(`✓ Spawned ${npcType} at (${x}, ${y})`, options.dialogs ? `with ${options.dialogs.length} dialogs` : '');
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
     * Spawn random 1-3 Cao Lỗ NPCs at random positions
     */
    spawnRandomCaoLo() {
        // Random number of NPCs (1-3)
        const count = Math.floor(Math.random() * 3) + 1;
        
        // Player spawn position (center of map)
        const playerX = (MAP_CONFIG.MAP_WIDTH * MAP_CONFIG.TILE_SIZE) / 2;
        const playerY = (MAP_CONFIG.MAP_HEIGHT * MAP_CONFIG.TILE_SIZE) / 2;
        
        // Spawn around player position (radius 200-500 pixels)
        const minRadius = 200;
        const maxRadius = 500;
        
        console.log(`🎲 Spawning ${count} random Cao Lỗ NPC(s) near player...`);
        
        for (let i = 0; i < count; i++) {
            // Random angle and distance
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * (maxRadius - minRadius) + minRadius;
            
            // Calculate position
            const x = Math.floor(playerX + Math.cos(angle) * distance);
            const y = Math.floor(playerY + Math.sin(angle) * distance);
            
            this.spawnNPC('npc_caolo', x, y, 'assets/sprites/caolo.png', {
                name: `Cao Lỗ ${i + 1}`,
                width: 31,
                height: 48,
                dialogs: [
                    { speaker: 'thucphan', text: 'Quân Tần mạnh, nhưng chúng ta không dễ bị khuất phục. Ta sẽ không đối đầu trực diện với chúng, mà phải tìm cách để khiến chúng tiến không được mà lùi cũng không xong! Các khanh có kế sách nào để làm suy yếu địch mà giảm tối thiểu xương máu quân dân ta không?' },
                    { speaker: 'caolo', text: 'Muôn tâu, dù quân Tần đã có ba năm chinh chiến ở đất Bách Việt, nhưng vẫn không đủ để quân chúng đối phó với xứ ta. Địa thế của ta không chỉ là tường thành, mà còn là một cái bẫy. Chúng không chỉ đối mặt với núi non hiểm trở, mà còn phải chống chọi với khí hậu khắc nghiệt. Ở đây, ngày thì nóng như thiêu, đêm lại lạnh buốt sẽ bào mòn sức lực của chúng từng ngày.' },
                    { speaker: 'thucphan', text: 'Đúng vậy! Để tránh thế mạnh lúc đầu của quân Tần, người Việt ta sẽ đều vào rừng, ở với cầm thú, không ai chịu để cho quân Tần bắt.' },
                    { speaker: 'thucphan', text: 'Làm vậy, quân giặc không cướp bóc được lương thực, cũng không nắm được dân, buộc chúng rơi vào nghiệt cảnh đóng quân ở đất vô dụng, tiến không được, thoái cũng không xong.' },
                    { speaker: 'thucphan', text: 'Tướng quân, ta giao cho ngươi trọng trách hãy mau chóng di tản dân cư' },
                    { speaker: 'player', text: 'Thần nhận lệnh' }
                ]
            });
            
            console.log(`  ✓ Spawned Cao Lỗ ${i + 1} at (${x}, ${y}) - ${Math.floor(distance)}px from player`);
        }
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
        
        // Command: checkTrees() - check interactive trees
        window.checkTrees = () => {
            const trees = this.objectManager.objects.filter(obj => obj instanceof InteractiveTree);
            console.log(`Found ${trees.length} InteractiveTree instances`);
            if (trees.length > 0) {
                console.log('First tree:', trees[0]);
                console.log('Player:', this.player);
                console.log('Player position:', this.player.x, this.player.y);
                console.log('Player width/height:', this.player.width, this.player.height);
                console.log('First tree position:', trees[0].x, trees[0].y);
                console.log('Distance:', trees[0].getDistanceToPlayer(this.player));
                console.log('Interaction range:', trees[0].interactionRange);
            }
        };
        
        console.log('%c🎮 Console Commands đã sẵn sàng!', 'color: #00ff00; font-size: 14px; font-weight: bold');
        console.log('%cCách dùng:', 'color: #d4af37; font-weight: bold');
        console.log('  spawn("caolo", 200, 300)          - Spawn NPC Cao Lỗ tại (200, 300)');
        console.log('  spawnAt("caolo")                  - Spawn NPC tại vị trí chuột');
        console.log('  house("small", 200, 300)          - Spawn nhà nhỏ tại (200, 300)');
        console.log('  house("large", 400, 500)          - Spawn nhà lớn tại (400, 500)');
        console.log('  listNPCs()                        - Xem tất cả objects');
        console.log('  clearNPCs()                       - Xóa tất cả objects');
        console.log('  checkTrees()                      - Kiểm tra cây interactive');
        console.log('%cVí dụ: Di chuột đến vị trí → xem Mouse: X, Y → gõ lệnh', 'color: #00ff00');
    }

    /**     * Setup mouse controls for camera
     */
    setupMouseControls() {
        let isDragging = false;
        let lastX = 0;
        let lastY = 0;

        this.canvas.addEventListener('mousedown', (e) => {
            // Check if clicking on tree button first
            if (this.isClickingTreeButton(e)) {
                return; // Don't start camera drag
            }
            
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
     * Check if mouse event is clicking on a tree button
     * @param {MouseEvent} e
     * @returns {boolean}
     */
    isClickingTreeButton(e) {
        if (!this.objectManager || !this.camera) return false;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Find trees with visible buttons
        const trees = this.objectManager.objects.filter(obj => 
            obj instanceof InteractiveTree && 
            obj.showButton && 
            !obj.isChopped
        );
        
        // Check if click is on any tree's button (with padding)
        for (const tree of trees) {
            const screenX = tree.x - this.camera.x;
            const screenY = tree.y - this.camera.y;
            const buttonWidth = 160;
            const buttonHeight = 50;
            const buttonX = screenX + tree.width / 2 - buttonWidth / 2;
            const buttonY = screenY - 60;
            
            // Add 30px padding for easier clicking
            const clickPadding = 30;
            const hitX = buttonX - clickPadding;
            const hitY = buttonY - clickPadding;
            const hitWidth = buttonWidth + clickPadding * 2;
            const hitHeight = buttonHeight + clickPadding * 2;
            
            if (x >= hitX && x <= hitX + hitWidth &&
                y >= hitY && y <= hitY + hitHeight) {
                return true;
            }
        }
        
        return false;
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
     * Setup tree interaction (chop mechanic)
     */
    setupTreeInteraction() {
        let activeTree = null;
        
        const startChopping = (x, y) => {
            if (!this.objectManager || !this.camera) return false;
            
            // Find trees at this position
            const trees = this.objectManager.objects.filter(obj => 
                obj instanceof InteractiveTree && 
                obj.showButton && 
                !obj.isChopped
            );
            
            console.log(`🔍 Checking ${trees.length} trees with buttons visible`);
            
            // Check if click is on any tree's button (with padding for easier clicking)
            for (const tree of trees) {
                const screenX = tree.x - this.camera.x;
                const screenY = tree.y - this.camera.y;
                const buttonWidth = 160;
                const buttonHeight = 50;
                const buttonX = screenX + tree.width / 2 - buttonWidth / 2;
                const buttonY = screenY - 60;
                
                // Add 30px padding around button for easier clicking
                const clickPadding = 30;
                const hitX = buttonX - clickPadding;
                const hitY = buttonY - clickPadding;
                const hitWidth = buttonWidth + clickPadding * 2;
                const hitHeight = buttonHeight + clickPadding * 2;
                
                console.log(`Tree button at (${buttonX}, ${buttonY}) size ${buttonWidth}x${buttonHeight}, HIT AREA: (${hitX}, ${hitY}) to (${hitX + hitWidth}, ${hitY + hitHeight}), click at (${x}, ${y})`);
                
                if (x >= hitX && x <= hitX + hitWidth &&
                    y >= hitY && y <= hitY + hitHeight) {
                    activeTree = tree;
                    tree.startChopping();
                    console.log('✅ Started chopping tree!');
                    return true; // Clicked on button
                }
            }
            
            return false; // Did not click on button
        };
        
        const stopChopping = () => {
            if (activeTree) {
                activeTree.stopChopping();
                console.log('⏹️ Stopped chopping');
                activeTree = null;
            }
        };
        
        // Mouse events - high priority (capture phase)
        this.canvas.addEventListener('mousedown', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Check tree interaction
            if (startChopping(x, y)) {
                e.stopPropagation(); // Stop event from reaching camera controls
                e.preventDefault();
            }
        }, true); // Use capture phase
        
        window.addEventListener('mouseup', () => {
            stopChopping();
        });
        
        // Touch events
        this.canvas.addEventListener('touchstart', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const touch = e.touches[0];
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            
            if (startChopping(x, y)) {
                e.stopPropagation();
                e.preventDefault();
            }
        }, true);
        
        this.canvas.addEventListener('touchend', () => {
            stopChopping();
        });
    }

    /**
     * Show mission complete panel
     */
    showMissionComplete() {
        console.log('🎉 Showing mission complete panel...');
        this.completionPanel.show(
            'Đã thu thập đủ gỗ! Chuẩn bị di chuyển...',
            () => {
                this.transitionToScreen2();
            }
        );
    }

    /**
     * Transition to Screen2
     */
    async transitionToScreen2() {
        console.log('🌀 Transition started...');
        
        // Clean up Screen1 (stop animation loop)
        this.cleanup();
        
        // Show Screen2 (canvas stays visible)
        if (window.screen2) {
            await window.screen2.init();
            window.screen2.startRenderLoop();
            console.log('✅ Screen2 activated');
        }
    }

    /**
     * Setup NPC interaction (dialog)
     */
    setupNPCInteraction() {
        const openDialog = (x, y) => {
            if (!this.objectManager || !this.camera || !this.player) return false;
            
            // Check dialog không đang mở
            if (this.dialogPanel.isOpen()) return false;
            
            // Find NPCs near player
            const playerSize = this.player.getSize();
            const playerCenterX = this.player.x + playerSize.width / 2;
            const playerCenterY = this.player.y + playerSize.height / 2;
            
            const npcs = this.objectManager.objects.filter(obj => obj instanceof NPC);
            
            for (const npc of npcs) {
                // Check distance to NPC
                const npcCenterX = npc.x + npc.width / 2;
                const npcCenterY = npc.y + npc.height / 2;
                const distance = Math.sqrt(
                    Math.pow(playerCenterX - npcCenterX, 2) +
                    Math.pow(playerCenterY - npcCenterY, 2)
                );
                
                // If player is near (150px) and has dialogs
                if (distance < 150 && npc.metadata && npc.metadata.dialogs) {
                    // Check if clicking on interact button
                    const screenX = npc.x - this.camera.x;
                    const screenY = npc.y - this.camera.y;
                    const buttonWidth = 140;
                    const buttonHeight = 40;
                    const buttonX = screenX + npc.width / 2 - buttonWidth / 2;
                    const buttonY = screenY - 50;
                    
                    // Hit area with padding
                    const hitPadding = 20;
                    if (x >= buttonX - hitPadding && x <= buttonX + buttonWidth + hitPadding &&
                        y >= buttonY - hitPadding && y <= buttonY + buttonHeight + hitPadding) {
                        // Open dialog
                        this.dialogPanel.open(npc.metadata.name || 'NPC', npc.metadata.dialogs);
                        return true;
                    }
                }
            }
            
            return false;
        };
        
        // Mouse events
        this.canvas.addEventListener('mousedown', (e) => {
            // Priority 1: Check dialog next button
            if (this.dialogPanel.isOpen()) {
                const rect = this.canvas.getBoundingClientRect();
                const scaleX = this.canvas.width / rect.width;
                const scaleY = this.canvas.height / rect.height;
                const x = (e.clientX - rect.left) * scaleX;
                const y = (e.clientY - rect.top) * scaleY;
                
                console.log('🖱️ Dialog click:', { 
                    clientX: e.clientX, 
                    clientY: e.clientY, 
                    canvasX: x, 
                    canvasY: y,
                    scale: { scaleX, scaleY }
                });
                
                if (this.dialogPanel.isClickOnNextButton(x, y)) {
                    this.dialogPanel.next();
                    e.stopPropagation();
                    e.preventDefault();
                    return;
                }
            }
            
            // Priority 2: Check NPC interaction
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.canvas.width / rect.width;
            const scaleY = this.canvas.height / rect.height;
            const x = (e.clientX - rect.left) * scaleX;
            const y = (e.clientY - rect.top) * scaleY;
            
            if (openDialog(x, y)) {
                e.stopPropagation();
                e.preventDefault();
            }
        }, true);
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
            
            // Update NPCs animations and Interactive Trees
            if (this.objectManager && this.objectManager.objects) {
                for (const obj of this.objectManager.objects) {
                    // Update NPC animations
                    if (obj instanceof NPC) {
                        obj.update(deltaTime);
                    }
                    // Update InteractiveTree (chopping progress, etc.)
                    else if (obj instanceof InteractiveTree) {
                        obj.update(deltaTime, this.player);
                    }
                }
            }
            
            // Update completion panel timer
            if (this.completionPanel) {
                this.completionPanel.update(deltaTime);
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
            
            // Render InteractiveTree UI (buttons and progress bars) on top
            this.ctx.save();
            this.objectManager.objects.forEach(obj => {
                if (obj instanceof InteractiveTree) {
                    obj.renderUI(this.ctx, this.camera);
                }
            });
            this.ctx.restore();
            
            // Render NPC interaction UI (dialog buttons) on top
            if (!this.dialogPanel.isOpen()) {
                this.ctx.save();
                this.renderNPCInteractionUI();
                this.ctx.restore();
            }
        } else {
            // No objects, just render player
            if (this.player && this.camera) {
                this.player.render(this.ctx, this.camera);
            }
        }

        // Draw resource bar (always on top)
        if (this.resourceBar) {
            this.resourceBar.render(this.ctx, this.canvas.width);
        }

        // Draw debug panel if enabled (on top of resource bar)
        if (this.showDebugPanel) {
            this.drawDebugPanel();
        }
        
        // Draw dialog panel (topmost layer)
        if (this.dialogPanel) {
            this.dialogPanel.render(this.ctx, this.canvas.width, this.canvas.height);
        }
        
        // Draw completion panel (above everything)
        if (this.completionPanel) {
            this.completionPanel.render(this.ctx, this.canvas.width, this.canvas.height);
        }
    }

    /**
     * Render NPC interaction UI (buttons)
     */
    renderNPCInteractionUI() {
        if (!this.objectManager || !this.player) return;
        
        const playerSize = this.player.getSize();
        const playerCenterX = this.player.x + playerSize.width / 2;
        const playerCenterY = this.player.y + playerSize.height / 2;
        
        const npcs = this.objectManager.objects.filter(obj => obj instanceof NPC);
        
        for (const npc of npcs) {
            // Check if NPC has dialogs
            if (!npc.metadata || !npc.metadata.dialogs) continue;
            
            // Check distance to player
            const npcCenterX = npc.x + npc.width / 2;
            const npcCenterY = npc.y + npc.height / 2;
            const distance = Math.sqrt(
                Math.pow(playerCenterX - npcCenterX, 2) +
                Math.pow(playerCenterY - npcCenterY, 2)
            );
            
            // Show button if player is near
            if (distance < 150) {
                const screenX = npc.x - this.camera.x;
                const screenY = npc.y - this.camera.y;
                const buttonWidth = 140;
                const buttonHeight = 40;
                const buttonX = screenX + npc.width / 2 - buttonWidth / 2;
                const buttonY = screenY - 50;
                
                // Button background
                const gradient = this.ctx.createLinearGradient(buttonX, buttonY, buttonX, buttonY + buttonHeight);
                gradient.addColorStop(0, 'rgba(100, 200, 100, 0.9)');
                gradient.addColorStop(1, 'rgba(50, 150, 50, 0.9)');
                this.ctx.fillStyle = gradient;
                this.ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
                
                // Button border
                this.ctx.strokeStyle = '#fff';
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);
                
                // Button text
                this.ctx.fillStyle = '#fff';
                this.ctx.font = 'bold 16px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText('💬 Trò chuyện', buttonX + buttonWidth / 2, buttonY + buttonHeight / 2);
            }
        }
    }

    /**
     * Draw debug information panel
     */
    drawDebugPanel() {
        const panelWidth = 380;
        const panelHeight = 180;
        const panelX = 10;
        const panelY = 70; // Move down to avoid overlapping with debug button
        
        // Panel background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        this.ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
        
        // Panel border
        this.ctx.strokeStyle = '#d4af37';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);
        
        // Debug info text
        this.ctx.fillStyle = '#d4af37';
        this.ctx.font = '16px monospace';
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'alphabetic';
        
        this.ctx.fillText(`Map: ${MAP_CONFIG.MAP_WIDTH}x${MAP_CONFIG.MAP_HEIGHT} tiles`, panelX + 20, panelY + 40);
        this.ctx.fillText(`Camera: ${Math.round(this.camera.x)}, ${Math.round(this.camera.y)}`, panelX + 20, panelY + 70);
        
        if (this.player) {
            this.ctx.fillText(`Player: ${Math.round(this.player.x)}, ${Math.round(this.player.y)}`, panelX + 20, panelY + 100);
            this.ctx.fillText(`Animation: ${this.player.currentAnimation.name}`, panelX + 20, panelY + 130);
        }
        
        // Display mouse world coordinates
        if (this.mouseWorldX !== undefined && this.mouseWorldY !== undefined) {
            this.ctx.fillStyle = '#00ff00';
            this.ctx.fillText(`Mouse: ${this.mouseWorldX}, ${this.mouseWorldY}`, panelX + 20, panelY + 160);
        }
    }

    /**
     * Stop screen
     */
    /**
     * Cleanup Screen1 resources
     */
    cleanup() {
        console.log('🧹 Screen1 cleanup');
        
        // Stop animation loop
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        // Clear keyboard listeners
        this.keys = {};
    }
    
    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
}
