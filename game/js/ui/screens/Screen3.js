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
        this.joystick = {
            active: false,
            startX: 0,
            startY: 0,
            currentX: 0,
            currentY: 0,
            deltaX: 0,
            deltaY: 0
        };
        
        // Sprite sheets
        this.idleSpriteSheet = null;
        this.runSpriteSheet = null;
        this.runBackSpriteSheet = null;
        this.runFrontSpriteSheet = null;
        this.enemySpriteSheet = null;
        this.attackSpriteSheet = null;
        
        // Attack system
        this.isAttacking = false;
        this.attackCooldown = 0;
        this.attackRange = 100; // Attack range in pixels
        this.explosions = [];
        
        // Enemy system
        this.enemies = [];
        this.enemySpawnTimer = 0;
        this.enemySpawnInterval = 600; // 3000/5 = 600ms (spawn 5x faster)
        
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

            // Load enemy sprite
            this.enemySpriteSheet = new SpriteSheet(
                'assets/sprites/Run kiếm phải.png',
                30, 50, 8, 6, 0
            );
            
            // Load attack sprite
            this.attackSpriteSheet = new SpriteSheet(
                'assets/sprites/main2.png',
                43.5, 86, 5, 25, 4
            );
            this.attackSpriteSheet.frameTime = 124;
            this.attackSpriteSheet.loop = false;

            await Promise.all([
                this.idleSpriteSheet.load(),
                this.runSpriteSheet.load(),
                this.runBackSpriteSheet.load(),
                this.runFrontSpriteSheet.load(),
                this.enemySpriteSheet.load(),
                this.attackSpriteSheet.load()
            ]);
            console.log('👤 Player sprites loaded');
            console.log('⚔️ Enemy sprite loaded');
            console.log('💥 Attack sprite loaded');

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

            // Setup attack button
            this.setupAttackButton();
            
            this.isLoaded = true;
            console.log('✅ Screen3 loaded successfully!');
            
        } catch (error) {
            console.error('❌ Error loading Screen3:', error);
        }
    }

    spawnEnemy() {
        const mapSize = MAP_CONFIG.MAP_WIDTH * MAP_CONFIG.TILE_SIZE;
        const margin = 100;
        
        // Random position anywhere in map
        const randomX = Math.random() * (mapSize - 2 * margin) + margin;
        const randomY = Math.random() * (mapSize - 2 * margin) + margin;
        
        // Random direction
        const spawnFromLeft = Math.random() < 0.5;
        
        const enemy = {
            x: randomX,
            y: randomY,
            speed: 2,
            width: 30,
            height: 50,
            direction: spawnFromLeft ? 1 : -1, // 1 = right, -1 = left
            animation: {
                currentFrame: 0,
                frameTime: 100,
                elapsedTime: 0
            }
        };
        
        this.enemies.push(enemy);
        console.log('⚔️ Enemy spawned at:', randomX.toFixed(0), randomY.toFixed(0), spawnFromLeft ? 'RIGHT' : 'LEFT');
    }

    updateEnemies(deltaTime) {
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            
            // Move horizontally
            enemy.x += enemy.speed * enemy.direction;
            
            // Animate
            enemy.animation.elapsedTime += deltaTime;
            if (enemy.animation.elapsedTime >= enemy.animation.frameTime) {
                enemy.animation.currentFrame = (enemy.animation.currentFrame + 1) % 8;
                enemy.animation.elapsedTime = 0;
            }
            
            // Remove if out of map bounds
            const mapSize = MAP_CONFIG.MAP_WIDTH * MAP_CONFIG.TILE_SIZE;
            if (enemy.x < -100 || enemy.x > mapSize + 100) {
                this.enemies.splice(i, 1);
                console.log('⚔️ Enemy removed (out of bounds)');
            }
        }
    }

    renderEnemies() {
        if (!this.enemySpriteSheet || !this.camera) return;
        
        this.enemies.forEach(enemy => {
            const screenPos = this.camera.worldToScreen(enemy.x, enemy.y);
            
            // Flip sprite if moving left
            const flipX = enemy.direction === -1;
            
            this.enemySpriteSheet.drawFrame(
                this.ctx,
                enemy.animation.currentFrame,
                screenPos.x,
                screenPos.y,
                1, // scale (reduced from 2 to 1)
                flipX
            );
        });
    }

    setupAttackButton() {
        // Create attack button (HTML)
        const attackBtn = document.createElement('button');
        attackBtn.id = 'attack-button-s3';
        attackBtn.innerHTML = '⚔️';
        attackBtn.style.cssText = `
            position: fixed;
            bottom: 120px;
            right: 30px;
            width: 70px;
            height: 70px;
            border-radius: 50%;
            background: linear-gradient(135deg, #ff4444, #cc0000);
            border: 3px solid #fff;
            color: #fff;
            font-size: 32px;
            cursor: pointer;
            z-index: 1000;
            box-shadow: 0 4px 8px rgba(0,0,0,0.3);
            display: block;
        `;
        
        // Touch event for mobile
        attackBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleAttack();
        });
        
        // Click event for desktop
        attackBtn.addEventListener('click', () => {
            this.handleAttack();
        });
        
        document.body.appendChild(attackBtn);
        this.attackButton = attackBtn;
        console.log('⚔️ Attack button created');
    }
    
    handleAttack() {
        if (this.isAttacking || this.attackCooldown > 0) return;
        
        this.isAttacking = true;
        this.attackCooldown = 1000; // 1 second cooldown
        
        // Play attack animation on player
        if (this.player && this.attackSpriteSheet) {
            this.player.playAttackAnimation(this.attackSpriteSheet);
        }
        
        // Check for enemies in range
        this.checkAttackCollision();
        
        // Reset attack state after animation
        setTimeout(() => {
            this.isAttacking = false;
        }, 124 * 5); // 5 frames * 124ms
    }
    
    checkAttackCollision() {
        if (!this.player) return;
        
        const playerCenter = this.player.getCenter();
        
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            
            // Calculate distance
            const dx = enemy.x - playerCenter.x;
            const dy = enemy.y - playerCenter.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // If in range, destroy enemy
            if (distance <= this.attackRange) {
                // Create explosion
                this.createExplosion(enemy.x, enemy.y);
                
                // Remove enemy
                this.enemies.splice(i, 1);
                console.log('💥 Enemy destroyed!');
            }
        }
    }
    
    createExplosion(x, y) {
        this.explosions.push({
            x: x,
            y: y,
            radius: 0,
            maxRadius: 40,
            duration: 300,
            elapsed: 0
        });
    }
    
    updateExplosions(deltaTime) {
        for (let i = this.explosions.length - 1; i >= 0; i--) {
            const explosion = this.explosions[i];
            explosion.elapsed += deltaTime;
            
            // Expand explosion
            const progress = explosion.elapsed / explosion.duration;
            explosion.radius = explosion.maxRadius * progress;
            
            // Remove if finished
            if (explosion.elapsed >= explosion.duration) {
                this.explosions.splice(i, 1);
            }
        }
    }
    
    renderExplosions() {
        if (!this.camera) return;
        
        this.explosions.forEach(explosion => {
            const screenPos = this.camera.worldToScreen(explosion.x, explosion.y);
            
            // Draw expanding circle
            const alpha = 1 - (explosion.elapsed / explosion.duration);
            this.ctx.save();
            this.ctx.globalAlpha = alpha;
            
            // Orange outer circle
            this.ctx.beginPath();
            this.ctx.arc(screenPos.x, screenPos.y, explosion.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = '#ff8800';
            this.ctx.fill();
            
            // Yellow inner circle
            this.ctx.beginPath();
            this.ctx.arc(screenPos.x, screenPos.y, explosion.radius * 0.6, 0, Math.PI * 2);
            this.ctx.fillStyle = '#ffff00';
            this.ctx.fill();
            
            this.ctx.restore();
        });
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
        
        // Joystick input (overrides keyboard if active)
        if (this.joystick.active) {
            dx = this.joystick.deltaX;
            dy = this.joystick.deltaY;
        }

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
        
        // Update enemies
        this.updateEnemies(deltaTime);
        
        // Update explosions
        this.updateExplosions(deltaTime);
        
        // Update attack cooldown
        if (this.attackCooldown > 0) {
            this.attackCooldown -= deltaTime;
        }
        
        // Spawn enemies
        this.enemySpawnTimer += deltaTime;
        if (this.enemySpawnTimer >= this.enemySpawnInterval) {
            this.spawnEnemy();
            this.enemySpawnTimer = 0;
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
        
        // Render enemies
        this.renderEnemies();
        
        // Render explosions
        this.renderExplosions();

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
        this.setupJoystickControls();
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

    setupJoystickControls() {
        const container = document.getElementById('joystick-container');
        const stick = document.getElementById('joystick-stick');
        
        if (!container || !stick) return;
        
        // Show joystick
        container.style.display = 'block';
        
        const maxDistance = 45;
        
        this.touchStartHandler = (e) => {
            const touch = e.touches[0];
            const rect = container.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            this.joystick.active = true;
            this.joystick.startX = centerX;
            this.joystick.startY = centerY;
            this.joystick.currentX = touch.clientX;
            this.joystick.currentY = touch.clientY;
        };
        
        this.touchMoveHandler = (e) => {
            if (!this.joystick.active) return;
            
            const touch = e.touches[0];
            this.joystick.currentX = touch.clientX;
            this.joystick.currentY = touch.clientY;
            
            const deltaX = this.joystick.currentX - this.joystick.startX;
            const deltaY = this.joystick.currentY - this.joystick.startY;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            
            let finalX = deltaX;
            let finalY = deltaY;
            
            if (distance > maxDistance) {
                const angle = Math.atan2(deltaY, deltaX);
                finalX = Math.cos(angle) * maxDistance;
                finalY = Math.sin(angle) * maxDistance;
            }
            
            // Update stick visual position
            stick.style.transform = `translate(calc(-50% + ${finalX}px), calc(-50% + ${finalY}px))`;
            
            // Set normalized deltas for movement
            this.joystick.deltaX = finalX / maxDistance;
            this.joystick.deltaY = finalY / maxDistance;
            
            e.preventDefault();
        };
        
        this.touchEndHandler = () => {
            this.joystick.active = false;
            this.joystick.deltaX = 0;
            this.joystick.deltaY = 0;
            stick.style.transform = 'translate(-50%, -50%)';
        };
        
        container.addEventListener('touchstart', this.touchStartHandler);
        container.addEventListener('touchmove', this.touchMoveHandler);
        container.addEventListener('touchend', this.touchEndHandler);
        container.addEventListener('touchcancel', this.touchEndHandler);
    }

    deactivate() {
        console.log('👋 Screen3 deactivated');
        
        // Stop animation loop
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        // Remove attack button
        if (this.attackButton) {
            this.attackButton.remove();
        }
        
        // Remove input handlers
        if (this.keydownHandler) {
            document.removeEventListener('keydown', this.keydownHandler);
        }
        if (this.keyupHandler) {
            document.removeEventListener('keyup', this.keyupHandler);
        }
        
        // Remove joystick handlers
        const container = document.getElementById('joystick-container');
        if (container) {
            if (this.touchStartHandler) container.removeEventListener('touchstart', this.touchStartHandler);
            if (this.touchMoveHandler) container.removeEventListener('touchmove', this.touchMoveHandler);
            if (this.touchEndHandler) {
                container.removeEventListener('touchend', this.touchEndHandler);
                container.removeEventListener('touchcancel', this.touchEndHandler);
            }
        }
    }
}
