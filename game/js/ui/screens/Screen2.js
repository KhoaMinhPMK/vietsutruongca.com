/**
 * Screen2 - Màn chơi thứ 2 (Combat Arena)
 */
class Screen2 {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.map = null;
        this.camera = null;
        this.player = null;
        this.animationId = null;
        this.lastTime = 0;
        
        // Keyboard state
        this.keys = {};
        
        // Joystick state
        this.joystick = {
            active: false,
            startX: 0,
            startY: 0,
            currentX: 0,
            currentY: 0,
            deltaX: 0,
            deltaY: 0
        };
        
        // Attack state
        this.isAttacking = false;
        this.projectiles = [];
        this.lastAttackTime = 0;
        this.attackCooldown = 1000; // 1 second cooldown
        
        // Enemy system
        this.enemies = [];
        this.enemySpawnTimer = 0;
        this.enemySpawnInterval = 3000; // Spawn every 3 seconds
        this.killCount = 0;
        this.requiredKills = 2;
        this.missionComplete = false;
        
        // Lives system
        this.lives = 3;
        this.maxLives = 3;
        this.gameOver = false;
        
        // Explosion effects
        this.explosions = [];
        
        // Top wall object
        this.topWall = null;
        
        console.log('✅ Screen2 initialized');
    }
    
    setupCanvas() {
        this.canvas = document.getElementById('game-canvas');
        if (!this.canvas) {
            console.error('Canvas not found!');
            return;
        }
        this.ctx = this.canvas.getContext('2d');
    }
    
    async init() {
        console.log('📺 Screen2 init');
        
        // Setup canvas first
        this.setupCanvas();
        
        if (!this.canvas) {
            console.error('❌ Canvas not available for Screen2!');
            return;
        }
        
        try {
            // Create square map (size matches scaled wall)
            const mapWidth = 700;
            const mapHeight = 700;
            this.map = {
                width: mapWidth,
                height: mapHeight,
                tileSize: 32
            };
            
            // Create camera
            console.log('Canvas size:', this.canvas.width, 'x', this.canvas.height);
            
            // Calculate player position at center
            const playerX = mapWidth / 2 - 20;
            const playerY = 150; // Near wall (wall is at top, so spawn below it)
            
            // Camera starts at origin
            // Camera(mapWidth, mapHeight, tileSize, canvasWidth, canvasHeight)
            this.camera = new Camera(
                mapWidth / 32, // mapWidth in tiles
                mapHeight / 32, // mapHeight in tiles
                32, // tileSize
                this.canvas.width,
                this.canvas.height
            );
            
            // Load player sprites
            await this.loadPlayerSprites();
            
            // Create player at center
            this.player = new Player(
                playerX,
                playerY,
                this.idleSpriteSheet,
                this.runSpriteSheet,
                this.runBackSpriteSheet,
                this.runFrontSpriteSheet,
                this.attackSpriteSheet
            );
            
            // Create top wall
            this.createTopWall();
            
            // Center camera on player
            const playerCenter = this.player.getCenter();
            this.camera.update(playerCenter.x, playerCenter.y);
            console.log('Camera centered on player:', this.camera.x, this.camera.y);
            
            // Setup controls
            this.setupKeyboardControls();
            this.setupJoystickControls();
            this.setupAttackButton();
            
            console.log('✅ Screen2 loaded successfully!');
            
        } catch (error) {
            console.error('Failed to load Screen2:', error);
        }
    }
    
    async loadPlayerSprites() {
        // Use same sprite config as Screen1
        this.idleSpriteSheet = new SpriteSheet(
            PLAYER_CONFIG.IDLE_SPRITE_PATH,
            PLAYER_CONFIG.IDLE_FRAME_WIDTH,
            PLAYER_CONFIG.IDLE_FRAME_HEIGHT,
            PLAYER_CONFIG.IDLE_FRAMES,
            0,
            0
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
        
        this.attackSpriteSheet = new SpriteSheet(
            'assets/sprites/actack1.png',
            27.3, // Frame width
            50,   // Frame height
            8,    // Total frames
            20,   // Offset X
            0     // Offset Y
        );
        
        this.enemySpriteSheet = new SpriteSheet(
            'assets/sprites/linh_run_back.png',
            30,   // Frame width
            50,   // Frame height
            8,    // Total frames
            4,    // Offset X
            0     // Offset Y
        );
        
        await Promise.all([
            this.idleSpriteSheet.load(),
            this.runSpriteSheet.load(),
            this.runBackSpriteSheet.load(),
            this.runFrontSpriteSheet.load(),
            this.attackSpriteSheet.load(),
            this.enemySpriteSheet.load()
        ]);
    }
    
    createTopWall() {
        // Load top wall sprite
        const wallSprite = new Image();
        wallSprite.src = 'assets/sprites/coloathanh.png';
        
        wallSprite.onload = () => {
            const wallWidth = this.map.width; // Full map width
            const wallHeight = wallSprite.height / 3;
            
            this.topWall = {
                x: 0,
                y: 0,
                width: wallWidth,
                height: wallHeight,
                sprite: wallSprite,
                
                // Collision box (top 20% of sprite height)
                getBounds: function() {
                    const collisionHeight = this.height * 0.2;
                    return {
                        x: this.x,
                        y: this.y,
                        width: this.width,
                        height: collisionHeight
                    };
                },
                
                render: function(ctx, camera) {
                    ctx.drawImage(
                        this.sprite,
                        this.x,
                        this.y,
                        this.width,
                        this.height
                    );
                }
            };
            
            console.log(`🧱 Top wall created: ${wallWidth}x${wallHeight}`);
        };
    }
    
    setupKeyboardControls() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            
            // Space = attack
            if (e.code === 'Space' && !this.isAttacking) {
                this.attack();
            }
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
    }
    
    setupJoystickControls() {
        // Touch start
        this.canvas.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            
            // Left side = joystick
            if (x < this.canvas.width / 2) {
                this.joystick.active = true;
                this.joystick.startX = x;
                this.joystick.startY = y;
                this.joystick.currentX = x;
                this.joystick.currentY = y;
            }
        });
        
        // Touch move
        this.canvas.addEventListener('touchmove', (e) => {
            if (!this.joystick.active) return;
            
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            this.joystick.currentX = touch.clientX - rect.left;
            this.joystick.currentY = touch.clientY - rect.top;
            
            const dx = this.joystick.currentX - this.joystick.startX;
            const dy = this.joystick.currentY - this.joystick.startY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const maxDistance = 50;
            
            if (distance > maxDistance) {
                this.joystick.currentX = this.joystick.startX + (dx / distance) * maxDistance;
                this.joystick.currentY = this.joystick.startY + (dy / distance) * maxDistance;
            }
            
            this.joystick.deltaX = (this.joystick.currentX - this.joystick.startX) / maxDistance;
            this.joystick.deltaY = (this.joystick.currentY - this.joystick.startY) / maxDistance;
            
            e.preventDefault();
        });
        
        // Touch end
        const endTouch = () => {
            this.joystick.active = false;
            this.joystick.deltaX = 0;
            this.joystick.deltaY = 0;
        };
        
        this.canvas.addEventListener('touchend', endTouch);
        this.canvas.addEventListener('touchcancel', endTouch);
    }
    
    setupAttackButton() {
        // Create attack button (HTML)
        const attackBtn = document.createElement('button');
        attackBtn.id = 'attack-button';
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
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        attackBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.attack();
            attackBtn.style.transform = 'scale(0.9)';
        });
        
        attackBtn.addEventListener('touchend', () => {
            attackBtn.style.transform = 'scale(1)';
        });
        
        attackBtn.addEventListener('mousedown', (e) => {
            e.preventDefault();
            this.attack();
            attackBtn.style.transform = 'scale(0.9)';
        });
        
        attackBtn.addEventListener('mouseup', () => {
            attackBtn.style.transform = 'scale(1)';
        });
        
        document.body.appendChild(attackBtn);
        
        // Store reference for cleanup
        this.attackButton = attackBtn;
    }
    
    attack() {
        if (this.isAttacking || !this.player) return;
        
        // Check cooldown
        const currentTime = performance.now();
        if (currentTime - this.lastAttackTime < this.attackCooldown) {
            console.log('⏱️ Attack on cooldown!');
            return;
        }
        
        this.isAttacking = true;
        this.lastAttackTime = currentTime;
        this.player.attack();
        
        // Spawn projectile
        this.spawnProjectile();
        
        console.log('⚔️ Attack!');
    }
    
    spawnProjectile() {
        if (!this.player) return;
        
        // Get player center
        const playerCenter = this.player.getCenter();
        
        // Always shoot downward (front direction)
        const projectile = {
            x: playerCenter.x,
            y: playerCenter.y,
            speed: 8,
            active: true,
            size: 8
        };
        
        this.projectiles.push(projectile);
        console.log('🏹 Projectile spawned: downward');
    }
    
    spawnEnemy() {
        // Random X position across map width
        const randomX = Math.random() * (this.map.width - 60) + 30;
        
        const enemy = {
            x: randomX,
            y: this.map.height - 20, // Start at bottom
            speed: 1, // Reduced speed
            width: 30,
            height: 50,
            active: true,
            animation: {
                currentFrame: 0,
                frameTime: 100,
                elapsedTime: 0
            }
        };
        
        this.enemies.push(enemy);
        console.log('🪖 Enemy spawned at:', randomX, 'y:', enemy.y, 'Map height:', this.map.height, 'Wall height:', this.topWall?.height);
    }
    
    updateEnemies(deltaTime) {
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            
            // Move upward
            enemy.y -= enemy.speed;
            
            // Update animation
            enemy.animation.elapsedTime += deltaTime;
            if (enemy.animation.elapsedTime >= enemy.animation.frameTime) {
                enemy.animation.currentFrame = (enemy.animation.currentFrame + 1) % 8;
                enemy.animation.elapsedTime = 0;
            }
            
            // Check collision with projectiles
            for (let j = this.projectiles.length - 1; j >= 0; j--) {
                const proj = this.projectiles[j];
                
                if (this.checkCollision(
                    { x: enemy.x, y: enemy.y, width: enemy.width, height: enemy.height },
                    { x: proj.x - 5, y: proj.y - 5, width: 10, height: 10 }
                )) {
                    // Hit!
                    this.createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
                    this.enemies.splice(i, 1);
                    this.projectiles.splice(j, 1);
                    this.killCount++;
                    console.log('💥 Enemy killed! Count:', this.killCount);
                    
                    // Check mission complete
                    if (this.killCount >= this.requiredKills) {
                        this.missionComplete = true;
                        console.log('🎉 Mission Complete! Switching to Screen3...');
                        
                        // Stop Screen2 and switch to Screen3
                        setTimeout(() => {
                            this.stopGame();
                            if (window.screen3) {
                                window.screen3.start();
                            }
                        }, 1500);
                    }
                    break;
                }
            }
            
            // Remove if out of bounds or reaches the wall collision area
            if (enemy.y < -enemy.height) {
                // Out of top - just remove
                this.enemies.splice(i, 1);
            } else if (this.topWall) {
                // Check collision with wall's collision box (20% top)
                const wallCollisionBox = this.topWall.getBounds();
                const enemyBottom = enemy.y + enemy.height;
                
                // Enemy reached the wall collision area
                if (enemyBottom <= wallCollisionBox.y + wallCollisionBox.height) {
                    this.lives--;
                    console.log('💔 Lost a life! Lives remaining:', this.lives, 'Enemy was at y:', enemy.y);
                    
                    if (this.lives <= 0) {
                        this.gameOver = true;
                        console.log('☠️ Game Over!');
                    }
                    this.enemies.splice(i, 1);
                }
            }
        }
    }
    
    createExplosion(x, y) {
        this.explosions.push({
            x: x,
            y: y,
            radius: 5,
            maxRadius: 30,
            life: 300, // 300ms
            elapsed: 0
        });
    }
    
    updateExplosions(deltaTime) {
        for (let i = this.explosions.length - 1; i >= 0; i--) {
            const exp = this.explosions[i];
            exp.elapsed += deltaTime;
            
            // Expand
            const progress = exp.elapsed / exp.life;
            exp.radius = exp.maxRadius * progress;
            
            // Remove when done
            if (exp.elapsed >= exp.life) {
                this.explosions.splice(i, 1);
            }
        }
    }
    
    updateProjectiles() {
        // Update each projectile
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const proj = this.projectiles[i];
            
            // Move projectile downward
            proj.y += proj.speed;
            
            // Check if out of map bounds
            if (proj.y > this.map.height) {
                this.projectiles.splice(i, 1);
            }
        }
    }
    
    checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    update(deltaTime) {
        if (!this.player || !this.camera) return;
        
        // Stop everything when mission complete or game over
        if (this.missionComplete || this.gameOver) return;
        
        // Movement input
        let dx = 0;
        let dy = 0;
        
        // Keyboard
        if (this.keys['w'] || this.keys['arrowup']) dy -= 1;
        if (this.keys['s'] || this.keys['arrowdown']) dy += 1;
        if (this.keys['a'] || this.keys['arrowleft']) dx -= 1;
        if (this.keys['d'] || this.keys['arrowright']) dx += 1;
        
        // Joystick
        if (this.joystick.active) {
            dx = this.joystick.deltaX;
            dy = this.joystick.deltaY;
        }
        
        // Normalize diagonal
        if (dx !== 0 && dy !== 0 && !this.joystick.active) {
            dx *= 0.707;
            dy *= 0.707;
        }
        
        // Move with collision
        const speed = 3;
        const newX = this.player.x + dx * speed;
        const newY = this.player.y + dy * speed;
        
        // Check collision with top wall
        let canMove = true;
        if (this.topWall) {
            const playerBounds = {
                x: newX,
                y: newY,
                width: 40,
                height: 55
            };
            
            if (this.checkCollision(playerBounds, this.topWall.getBounds())) {
                canMove = false;
            }
        }
        
        // Apply movement
        if (canMove) {
            this.player.x = newX;
            this.player.y = newY;
        }
        
        // Clamp to map bounds
        this.player.x = Math.max(0, Math.min(this.player.x, this.map.width - 40));
        this.player.y = Math.max(0, Math.min(this.player.y, this.map.height - 55));
        
        // Update player animation (call move first if not attacking)
        if (!this.isAttacking) {
            this.player.move(dx, dy);
        }
        this.player.update(deltaTime, 0, 0);
        
        // Sync isAttacking state with player
        if (this.isAttacking && !this.player.isAttacking) {
            this.isAttacking = false;
        }
        
        // Update projectiles
        this.updateProjectiles();
        
        // Update enemies
        this.updateEnemies(deltaTime);
        
        // Update explosions
        this.updateExplosions(deltaTime);
        
        // Spawn enemies
        if (!this.missionComplete && !this.gameOver) {
            this.enemySpawnTimer += deltaTime;
            if (this.enemySpawnTimer >= this.enemySpawnInterval) {
                this.spawnEnemy();
                this.enemySpawnTimer = 0;
            }
        }
        
        // Camera follow
        const playerCenter = this.player.getCenter();
        this.camera.update(playerCenter.x, playerCenter.y);
    }
    
    render() {
        if (!this.ctx || !this.canvas) return;
        
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Render grass background using camera
        if (this.map && this.camera) {
            const visibleTiles = this.camera.getVisibleTiles();
            const tileSize = this.map.tileSize;
            
            this.ctx.fillStyle = '#5a8f5a'; // Grass color
            
            for (let row = visibleTiles.startRow; row < visibleTiles.endRow; row++) {
                for (let col = visibleTiles.startCol; col < visibleTiles.endCol; col++) {
                    const worldX = col * tileSize;
                    const worldY = row * tileSize;
                    const screenPos = this.camera.worldToScreen(worldX, worldY);
                    
                    this.ctx.fillRect(screenPos.x, screenPos.y, tileSize, tileSize);
                }
            }
        }
        
        // Render top wall
        if (this.topWall && this.camera) {
            const wallScreen = this.camera.worldToScreen(this.topWall.x, this.topWall.y);
            this.ctx.drawImage(
                this.topWall.sprite,
                wallScreen.x,
                wallScreen.y,
                this.topWall.width,
                this.topWall.height
            );
        }
        
        // Render player
        if (this.player && this.camera) {
            this.player.render(this.ctx, this.camera);
        }
        
        // Render enemies
        this.renderEnemies();
        
        // Render projectiles
        this.renderProjectiles();
        
        // Render explosions
        this.renderExplosions();
        
        // Render mission complete message
        if (this.missionComplete) {
            this.renderMissionComplete();
        }
        
        // Render game over screen
        if (this.gameOver) {
            this.renderGameOver();
        }
        
        // Render kill counter
        this.renderKillCounter();
        
        // Render lives (hearts)
        this.renderLives();
        
        // Render joystick
        if (this.joystick.active) {
            this.renderJoystick();
        }
    }
    
    renderEnemies() {
        if (!this.camera || !this.enemySpriteSheet) {
            console.log('Cannot render enemies - camera or sprite missing');
            return;
        }
        
        if (this.enemies.length > 0) {
            console.log('Rendering', this.enemies.length, 'enemies, camera at:', this.camera.x, this.camera.y);
        }
        
        this.enemies.forEach((enemy, index) => {
            const screenPos = this.camera.worldToScreen(enemy.x, enemy.y);
            
            console.log(`Enemy ${index}: world(${enemy.x.toFixed(0)}, ${enemy.y.toFixed(0)}) -> screen(${screenPos.x.toFixed(0)}, ${screenPos.y.toFixed(0)})`);
            
            // Draw debug rectangle
            this.ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
            this.ctx.fillRect(screenPos.x, screenPos.y, enemy.width, enemy.height);
            
            this.enemySpriteSheet.drawFrame(
                this.ctx,
                enemy.animation.currentFrame,
                screenPos.x,
                screenPos.y,
                1, // Scale
                false // No flip
            );
        });
    }
    
    renderExplosions() {
        if (!this.camera) return;
        
        this.explosions.forEach(exp => {
            const screenPos = this.camera.worldToScreen(exp.x, exp.y);
            const alpha = 1 - (exp.elapsed / exp.life);
            
            // Outer circle (orange)
            this.ctx.fillStyle = `rgba(255, 150, 0, ${alpha * 0.6})`;
            this.ctx.beginPath();
            this.ctx.arc(screenPos.x, screenPos.y, exp.radius, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Inner circle (yellow)
            this.ctx.fillStyle = `rgba(255, 255, 0, ${alpha})`;
            this.ctx.beginPath();
            this.ctx.arc(screenPos.x, screenPos.y, exp.radius * 0.5, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }
    
    renderKillCounter() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(10, 10, 150, 40);
        
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 20px Arial';
        this.ctx.fillText(`Kills: ${this.killCount}/${this.requiredKills}`, 20, 35);
    }
    
    renderMissionComplete() {
        // Overlay
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Message box
        const boxWidth = 400;
        const boxHeight = 150;
        const boxX = (this.canvas.width - boxWidth) / 2;
        const boxY = (this.canvas.height - boxHeight) / 2;
        
        this.ctx.fillStyle = '#5c3d2e';
        this.ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
        
        this.ctx.strokeStyle = '#d4af37';
        this.ctx.lineWidth = 4;
        this.ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);
        
        // Title
        this.ctx.fillStyle = '#d4af37';
        this.ctx.font = 'bold 32px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('🎉 HOÀN THÀNH! 🎉', this.canvas.width / 2, boxY + 60);
        
        // Message
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '20px Arial';
        this.ctx.fillText(`Đã tiêu diệt ${this.killCount} lính`, this.canvas.width / 2, boxY + 100);
        
        this.ctx.textAlign = 'left';
    }
    
    renderLives() {
        const heartSize = 30;
        const spacing = 35;
        const startX = this.canvas.width - (this.maxLives * spacing) - 10;
        const startY = 15;
        
        for (let i = 0; i < this.maxLives; i++) {
            const x = startX + (i * spacing);
            
            if (i < this.lives) {
                // Full heart (red)
                this.ctx.fillStyle = '#ff0000';
            } else {
                // Empty heart (gray)
                this.ctx.fillStyle = '#555';
            }
            
            // Draw heart shape
            this.ctx.beginPath();
            this.ctx.moveTo(x, startY + 8);
            this.ctx.bezierCurveTo(x, startY + 5, x - 5, startY, x - 10, startY);
            this.ctx.bezierCurveTo(x - 15, startY, x - 15, startY + 8, x - 15, startY + 8);
            this.ctx.bezierCurveTo(x - 15, startY + 13, x - 10, startY + 18, x, startY + 25);
            this.ctx.bezierCurveTo(x + 10, startY + 18, x + 15, startY + 13, x + 15, startY + 8);
            this.ctx.bezierCurveTo(x + 15, startY + 8, x + 15, startY, x + 10, startY);
            this.ctx.bezierCurveTo(x + 5, startY, x, startY + 5, x, startY + 8);
            this.ctx.fill();
        }
    }
    
    renderGameOver() {
        // Overlay
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Message box
        const boxWidth = 400;
        const boxHeight = 150;
        const boxX = (this.canvas.width - boxWidth) / 2;
        const boxY = (this.canvas.height - boxHeight) / 2;
        
        this.ctx.fillStyle = '#3d2817';
        this.ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
        
        this.ctx.strokeStyle = '#ff0000';
        this.ctx.lineWidth = 4;
        this.ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);
        
        // Title
        this.ctx.fillStyle = '#ff0000';
        this.ctx.font = 'bold 32px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('☠️ GAME OVER ☠️', this.canvas.width / 2, boxY + 60);
        
        // Message
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '20px Arial';
        this.ctx.fillText(`Đã tiêu diệt ${this.killCount} lính`, this.canvas.width / 2, boxY + 100);
        
        this.ctx.textAlign = 'left';
    }
    
    renderProjectiles() {
        if (!this.camera) return;
        
        this.projectiles.forEach(proj => {
            const screenPos = this.camera.worldToScreen(proj.x, proj.y);
            
            // Draw arrow pointing down
            this.ctx.fillStyle = '#ffaa00';
            this.ctx.beginPath();
            
            // Arrow pointing downward
            this.ctx.moveTo(screenPos.x - proj.size / 2, screenPos.y - proj.size);
            this.ctx.lineTo(screenPos.x, screenPos.y + proj.size);
            this.ctx.lineTo(screenPos.x + proj.size / 2, screenPos.y - proj.size);
            
            this.ctx.closePath();
            this.ctx.fill();
            
            // Glow effect
            this.ctx.strokeStyle = '#ffdd00';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        });
    }
    
    renderJoystick() {
        // Base circle
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.beginPath();
        this.ctx.arc(this.joystick.startX, this.joystick.startY, 50, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Stick
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        this.ctx.beginPath();
        this.ctx.arc(this.joystick.currentX, this.joystick.currentY, 25, 0, Math.PI * 2);
        this.ctx.fill();
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
    
    stopGame() {
        console.log('⏹️ Stopping Screen2...');
        
        // Stop animation loop
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        // Remove all event listeners
        document.removeEventListener('keydown', this.boundHandleKeyDown);
        document.removeEventListener('keyup', this.boundHandleKeyUp);
        
        // Clear enemies and projectiles
        this.enemies = [];
        this.projectiles = [];
        this.explosions = [];
        
        console.log('✅ Screen2 stopped');
    }
    
    cleanup() {
        console.log('🧹 Screen2 cleanup');
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        // Remove attack button
        if (this.attackButton) {
            this.attackButton.remove();
        }
    }
}
