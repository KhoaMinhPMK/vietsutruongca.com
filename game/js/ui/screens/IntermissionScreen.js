/**
 * IntermissionScreen - Màn hình chuyển tiếp giữa Screen2 và Screen3
 * Code riêng, không phụ thuộc Screen1
 */

class IntermissionScreen {
    constructor(game, dialogPanel, mapSelectionPanel) {
        this.game = game || window.game;
        this.screen = document.getElementById('screen-2-5');
        this.canvas = document.getElementById('intermission-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Initialize UI components if not provided
        this.dialogPanel = dialogPanel || new DialogPanel();
        this.mapSelectionPanel = mapSelectionPanel || new MapSelectionPanel();
        
        // Game objects
        this.tileset = null;
        this.map = null;
        this.camera = null;
        this.player = null;
        this.objectManager = null;
        this.npc = null;
        
        // Spritesheets
        this.idleSpriteSheet = null;
        this.runSpriteSheet = null;
        this.runBackSpriteSheet = null;
        this.runFrontSpriteSheet = null;
        
        // State
        this.animationId = null;
        this.isLoading = false;
        this.started = false;
        this.lastTime = 0;
        
        // Input
        this.keys = {};
        
        this.setupCanvas();
        this.setupInput();
    }
    
    setupCanvas() {
        this.canvas.width = 1024;
        this.canvas.height = 640;
        this.ctx = this.canvas.getContext('2d');
    }
    
    setupInput() {
        // Keyboard
        this.keydownHandler = (e) => {
            this.keys[e.key.toLowerCase()] = true;
        };
        this.keyupHandler = (e) => {
            this.keys[e.key.toLowerCase()] = false;
        };
        
        // Mouse move for map selection hover
        this.mousemoveHandler = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.canvas.width / rect.width;
            const scaleY = this.canvas.height / rect.height;
            const mouseX = (e.clientX - rect.left) * scaleX;
            const mouseY = (e.clientY - rect.top) * scaleY;
            
            if (this.mapSelectionPanel && this.mapSelectionPanel.visible) {
                this.mapSelectionPanel.handleMouseMove(mouseX, mouseY, this.canvas.width, this.canvas.height);
            }
        };
        
        // Mouse click
        this.clickHandler = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.canvas.width / rect.width;
            const scaleY = this.canvas.height / rect.height;
            const mouseX = (e.clientX - rect.left) * scaleX;
            const mouseY = (e.clientY - rect.top) * scaleY;
            
            // Map selection panel
            if (this.mapSelectionPanel && this.mapSelectionPanel.visible) {
                this.mapSelectionPanel.handleClick(mouseX, mouseY, this.canvas.width, this.canvas.height);
                return;
            }
            
            // Dialog open - handle dialog click
            if (this.dialogPanel && this.dialogPanel.isOpen()) {
                this.dialogPanel.handleClick(mouseX, mouseY);
                return;
            }
            
            // NPC interaction
            this.handleNPCClick(mouseX, mouseY);
        };
        
        window.addEventListener('keydown', this.keydownHandler);
        window.addEventListener('keyup', this.keyupHandler);
        this.canvas.addEventListener('mousemove', this.mousemoveHandler);
        this.canvas.addEventListener('click', this.clickHandler);
    }
    
    /**
     * Helper: Load image as Promise
     */
    loadImageAsync(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error(`Failed to load: ${src}`));
            img.src = src;
        });
    }
    
    /**
     * Start the screen
     */
    async start() {
        if (this.started) {
            this.show();
            return;
        }
        
        // Hide all other screens to ensure clean state
        document.querySelectorAll('.screen').forEach(s => {
            if (s.id !== 'screen-2-5') s.style.display = 'none';
        });
        
        console.log('🎬 IntermissionScreen starting...');
        this.screen.style.display = 'block';
        
        try {
            await this.loadResources();
            this.started = true;
            this.gameLoop();
            console.log('✅ IntermissionScreen ready!');
        } catch (error) {
            console.error('❌ IntermissionScreen failed:', error);
        }
    }
    
    /**
     * Load all game resources
     */
    async loadResources() {
        if (this.isLoading) return;
        this.isLoading = true;
        
        try {
            // 1. Load tileset (giống Screen1)
            console.log('📦 Loading tileset...');
            this.tileset = new Tileset(
                MAP_CONFIG.TILESET_PATH,
                MAP_CONFIG.TILE_SIZE,
                MAP_CONFIG.TILESET_TILE_SIZE
            );
            await this.tileset.load();
            console.log('✓ Tileset loaded');
            
            // 2. Load player spritesheets (giống Screen1)
            console.log('👤 Loading player sprites...');
            this.idleSpriteSheet = new SpriteSheet(
                PLAYER_CONFIG.IDLE_SPRITE_PATH,
                PLAYER_CONFIG.IDLE_FRAME_WIDTH,
                PLAYER_CONFIG.IDLE_FRAME_HEIGHT,
                PLAYER_CONFIG.IDLE_FRAMES,
                0, 0
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
            console.log('✓ Player sprites loaded');
            
            // 3. Create map (nhỏ hơn Screen1)
            console.log('🗺️ Creating map...');
            const mapWidth = 80;  // Nhỏ hơn Screen1
            const mapHeight = 60;
            this.map = new Map(mapWidth, mapHeight, MAP_CONFIG.TILE_SIZE, this.tileset);
            console.log('✓ Map created:', mapWidth, 'x', mapHeight);
            
            // 4. Create camera
            console.log('📷 Creating camera...');
            this.camera = new Camera(
                mapWidth,
                mapHeight,
                MAP_CONFIG.TILE_SIZE,
                this.canvas.width,
                this.canvas.height
            );
            console.log('✓ Camera created');
            
            // 5. Create player ở giữa map
            console.log('🧑 Creating player...');
            const centerX = (mapWidth * MAP_CONFIG.TILE_SIZE) / 2;
            const centerY = (mapHeight * MAP_CONFIG.TILE_SIZE) / 2;
            this.player = new Player(
                centerX, centerY,
                this.idleSpriteSheet,
                this.runSpriteSheet,
                this.runBackSpriteSheet,
                this.runFrontSpriteSheet,
                null
            );
            this.camera.update(centerX, centerY);
            console.log('✓ Player at', centerX, centerY);
            
            // 6. Create object manager
            console.log('🎯 Creating object manager...');
            this.objectManager = new GameObjectManager(this.camera);
            
            // 7. Spawn random trees
            await this.spawnTrees(10);
            
            // 8. Spawn mission NPC
            await this.spawnMissionNPC();
            
            console.log('✅ All resources loaded!');
            
        } catch (error) {
            console.error('❌ Resource loading error:', error);
            throw error;
        } finally {
            this.isLoading = false;
        }
    }
    
    /**
     * Spawn random trees
     */
    async spawnTrees(count) {
        console.log(`🌲 Spawning ${count} trees...`);
        
        const mapPixelWidth = this.map.width * this.map.tileSize;
        const mapPixelHeight = this.map.height * this.map.tileSize;
        const playerX = this.player.x;
        const playerY = this.player.y;
        
        for (let i = 0; i < count; i++) {
            let x, y, distance;
            
            // Đảm bảo cây không spawn quá gần player
            do {
                x = Math.random() * (mapPixelWidth - 300) + 150;
                y = Math.random() * (mapPixelHeight - 300) + 150;
                distance = Math.sqrt(Math.pow(x - playerX, 2) + Math.pow(y - playerY, 2));
            } while (distance < 200);
            
            const tree = new InteractiveTree({
                id: `tree_${i}`,
                x: x,
                y: y,
                spritePath: 'assets/objects/interactive/tree1.png',
                width: 100,
                height: 120,
                type: 'tree'
            });
            
            if (this.player.resourceManager) {
                tree.setResourceManager(this.player.resourceManager);
            }
            this.objectManager.add(tree);
        }
        
        console.log(`✓ ${count} trees spawned`);
    }
    
    /**
     * Spawn mission NPC gần player
     */
    async spawnMissionNPC() {
        console.log('🎯 Spawning mission NPC...');
        
        // NPC spawn cách player 150px về bên phải
        const npcX = this.player.x + 150;
        const npcY = this.player.y;
        
        this.npc = new NPC({
            id: 'npc_thucphan',
            type: 'npc_thucphan',
            x: npcX,
            y: npcY,
            spritePath: 'assets/sprites/caolo.png',
            width: 31,
            height: 48,
            metadata: {
                name: 'Thục Phán',
                dialogs: [
                    { speaker: 'thucphan', text: 'Tướng quân! Quân Tần đang tiến đánh vào lãnh thổ của ta.' },
                    { speaker: 'thucphan', text: 'Chúng ta cần phải bảo vệ dân chúng và thủ thành chống giặc!' },
                    { speaker: 'thucphan', text: 'Di tản dân cư là nhiệm vụ cấp bách nhất lúc này.' },
                    { speaker: 'thucphan', text: 'Có ba địa điểm cần được bảo vệ ngay lập tức.' },
                    { speaker: 'player', text: 'Thần xin lĩnh mệnh! Thần sẽ bảo vệ dân chúng đến cùng!' },
                    { speaker: 'thucphan', text: 'Tốt lắm! Hãy chọn địa điểm để bắt đầu nhiệm vụ.' }
                ],
                isMissionNPC: true
            }
        });
        
        console.log('✓ Mission NPC spawned at', npcX, npcY);
    }
    
    /**
     * Handle click on NPC talk button
     */
    handleNPCClick(mouseX, mouseY) {
        if (!this.npc || !this.player || !this.camera) return;
        
        // Khoảng cách player đến NPC
        const distance = Math.sqrt(
            Math.pow(this.player.x - this.npc.x, 2) +
            Math.pow(this.player.y - this.npc.y, 2)
        );
        
        if (distance > 150) return; // Quá xa
        
        // Tính vị trí button trên screen
        const screenX = this.npc.x - this.camera.x;
        const screenY = this.npc.y - this.camera.y;
        const buttonW = 140;
        const buttonH = 40;
        const buttonX = screenX - 50;
        const buttonY = screenY - 60;
        
        // Check hit
        if (mouseX >= buttonX && mouseX <= buttonX + buttonW &&
            mouseY >= buttonY && mouseY <= buttonY + buttonH) {
            
            console.log('💬 Opening NPC dialog...');
            
            // Mở dialog
            if (this.dialogPanel) {
                this.dialogPanel.open(this.npc.metadata.name, this.npc.metadata.dialogs);
                
                // Set callback khi dialog đóng
                this.dialogPanel.onClose = () => {
                    console.log('✅ Dialog done - showing map selection');
                    this.showMapSelection();
                };
            }
        }
    }
    
    /**
     * Show map selection panel
     */
    showMapSelection() {
        console.log('🗺️ Showing map selection...');
        this.mapSelectionPanel.show((level) => {
            console.log('🎮 Level selected:', level.name);
            this.goToScreen3(level);
        });
    }
    
    /**
     * Transition to Screen3
     */
    goToScreen3(level) {
        console.log('🎮 Going to Screen3 with level:', level.name);
        this.cleanup();
        
        // Play video 2.mp4 before Screen3
        if (window.videoScreen2) {
            window.videoScreen2.start();
        } else if (window.game && window.game.screen3) {
            window.game.screen3.start();
        } else {
            console.error('❌ Screen3 not found in window.game!');
        }
    }
    
    /**
     * Game loop
     */
    gameLoop(timestamp = 0) {
        if (!this.started || this.screen.style.display === 'none') {
            return;
        }
        
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;
        
        this.update(deltaTime);
        this.render();
        
        this.animationId = requestAnimationFrame((t) => this.gameLoop(t));
    }
    
    /**
     * Update game state
     */
    update(deltaTime) {
        if (!this.player || !this.camera) return;
        
        // Không cho di chuyển khi dialog/map selection mở
        if ((this.dialogPanel && this.dialogPanel.isOpen()) || 
            (this.mapSelectionPanel && this.mapSelectionPanel.visible)) {
            this.player.move(0, 0);
            return;
        }
        
        // Di chuyển player
        const speed = 3;
        let dx = 0;
        let dy = 0;
        
        if (this.keys['w'] || this.keys['arrowup']) dy -= speed;
        if (this.keys['s'] || this.keys['arrowdown']) dy += speed;
        if (this.keys['a'] || this.keys['arrowleft']) dx -= speed;
        if (this.keys['d'] || this.keys['arrowright']) dx += speed;
        
        if (dx !== 0 || dy !== 0) {
            // Normalize diagonal movement
            if (dx !== 0 && dy !== 0) {
                dx *= 0.707;
                dy *= 0.707;
            }
            
            // Update animation
            this.player.move(dx, dy);
            
            // Update position manually (since Player.move doesn't do it)
            const newX = this.player.x + dx * speed;
            const newY = this.player.y + dy * speed;
            
            // Simple boundary check
            const mapWidth = this.map.width * this.map.tileSize;
            const mapHeight = this.map.height * this.map.tileSize;
            const size = this.player.getSize();
            
            this.player.x = Math.max(0, Math.min(newX, mapWidth - size.width));
            this.player.y = Math.max(0, Math.min(newY, mapHeight - size.height));
            
        } else {
            this.player.move(0, 0);
        }
        
        // Update camera theo player
        this.camera.update(this.player.x, this.player.y);
        
        // Update player animation
        this.player.update(deltaTime);
        
        // Update NPC
        if (this.npc && this.npc.update) {
            this.npc.update(deltaTime);
        }
    }
    
    /**
     * Render game
     */
    render() {
        if (!this.map || !this.camera || !this.player) return;
        
        // Clear
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Render map
        this.map.render(this.ctx, this.camera);
        
        // Render trees
        if (this.objectManager) {
            this.objectManager.render(this.ctx, this.camera);
        }
        
        // Render NPC
        if (this.npc) {
            this.npc.render(this.ctx, this.camera);
            
            // Render talk button nếu gần NPC
            this.renderNPCButton();
        }
        
        // Render player
        this.player.render(this.ctx, this.camera);
        
        // Render dialog panel
        if (this.dialogPanel && this.dialogPanel.visible) {
            this.dialogPanel.render(this.ctx, this.canvas.width, this.canvas.height);
        }
        
        // Render map selection panel
        if (this.mapSelectionPanel && this.mapSelectionPanel.visible) {
            this.mapSelectionPanel.render(this.ctx, this.canvas.width, this.canvas.height);
        }
    }
    
    /**
     * Render NPC talk button
     */
    renderNPCButton() {
        if (!this.npc || !this.player || !this.camera) return;
        if (this.dialogPanel && this.dialogPanel.isOpen()) return;
        
        const distance = Math.sqrt(
            Math.pow(this.player.x - this.npc.x, 2) +
            Math.pow(this.player.y - this.npc.y, 2)
        );
        
        if (distance > 150) return;
        
        const screenX = this.npc.x - this.camera.x;
        const screenY = this.npc.y - this.camera.y;
        
        // Background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(screenX - 50, screenY - 60, 140, 40);
        
        // Border
        this.ctx.strokeStyle = '#FFD700';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(screenX - 50, screenY - 60, 140, 40);
        
        // Text
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('💬 Nói chuyện', screenX + 20, screenY - 35);
    }
    
    /**
     * Show screen
     */
    show() {
        this.screen.style.display = 'block';
        if (this.started && !this.animationId) {
            this.gameLoop();
        }
    }
    
    /**
     * Hide screen
     */
    hide() {
        this.screen.style.display = 'none';
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
    
    /**
     * Cleanup
     */
    cleanup() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        if (this.dialogPanel) {
            this.dialogPanel.onClose = null;
        }
        
        window.removeEventListener('keydown', this.keydownHandler);
        window.removeEventListener('keyup', this.keyupHandler);
        this.canvas.removeEventListener('mousemove', this.mousemoveHandler);
        this.canvas.removeEventListener('click', this.clickHandler);
        
        this.hide();
        console.log('🧹 IntermissionScreen cleaned up');
    }
    
    stop() {
        this.cleanup();
    }
}
