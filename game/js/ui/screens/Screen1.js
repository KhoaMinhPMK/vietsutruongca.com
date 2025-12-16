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
        
        console.log('Canvas created:', this.canvas.width, 'x', this.canvas.height);
        console.log('Device:', /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop');
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
            
            // Start render loop
            this.startRenderLoop();
            
            // Add controls
            this.setupMouseControls();
            this.setupKeyboardControls();
            this.setupJoystickControls();
            
        } catch (error) {
            console.error('Failed to load map:', error);
        }
    }

    /**
     * Setup mouse controls for camera
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
            
            this.player.move(dx, dy);
            this.player.update(deltaTime, 0, 0); // Update animation only, no map bounds
            
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

        // Render map
        if (this.map && this.camera) {
            this.map.render(this.ctx, this.camera);
        }

        // Render player
        if (this.player && this.camera) {
            this.player.render(this.ctx, this.camera);
        }

        // Draw info text
        this.drawDebugInfo();
    }

    /**
     * Draw debug information
     */
    drawDebugInfo() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(10, 10, 350, 120);
        
        this.ctx.fillStyle = '#d4af37';
        this.ctx.font = '16px monospace';
        this.ctx.fillText(`Map: ${MAP_CONFIG.MAP_WIDTH}x${MAP_CONFIG.MAP_HEIGHT} tiles`, 20, 30);
        this.ctx.fillText(`Camera: ${Math.round(this.camera.x)}, ${Math.round(this.camera.y)}`, 20, 55);
        
        if (this.player) {
            this.ctx.fillText(`Player: ${Math.round(this.player.x)}, ${Math.round(this.player.y)}`, 20, 80);
            this.ctx.fillText(`Animation: ${this.player.currentAnimation.name}`, 20, 105);
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
