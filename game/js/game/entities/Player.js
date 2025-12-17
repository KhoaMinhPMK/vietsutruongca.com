// Player - Game character with animation
class Player {
    constructor(x, y, idleSpriteSheet, runSpriteSheet, runBackSpriteSheet, runFrontSpriteSheet, attackSpriteSheet) {
        this.x = x;
        this.y = y;
        this.idleSpriteSheet = idleSpriteSheet;
        this.runSpriteSheet = runSpriteSheet;           // Left/Right
        this.runBackSpriteSheet = runBackSpriteSheet;   // Up
        this.runFrontSpriteSheet = runFrontSpriteSheet; // Down
        this.attackSpriteSheet = attackSpriteSheet;     // Attack
        this.scale = 1; // Scale player sprite
        this.runFrontScale = 0.9; // 10% smaller for run_front
        
        // Create animations
        this.idleAnimation = new Animation('idle', 0, PLAYER_CONFIG.IDLE_FRAMES, PLAYER_CONFIG.IDLE_FRAME_TIME);
        this.runAnimation = new Animation('run', 0, PLAYER_CONFIG.RUN_FRAMES, PLAYER_CONFIG.RUN_FRAME_TIME);
        this.runBackAnimation = new Animation('run_back', 0, PLAYER_CONFIG.RUN_BACK_FRAMES, PLAYER_CONFIG.RUN_FRAME_TIME);
        this.runFrontAnimation = new Animation('run_front', 0, PLAYER_CONFIG.RUN_FRONT_FRAMES, PLAYER_CONFIG.RUN_FRAME_TIME);
        this.attackAnimation = new Animation('attack', 0, 8, 100); // 8 frames, 100ms
        this.attackAnimation.loop = false; // Don't loop attack animation
        this.currentAnimation = this.idleAnimation;
        
        // Movement
        this.velocityX = 0;
        this.velocityY = 0;
        this.speed = PLAYER_CONFIG.SPEED;
        
        // Direction (for sprite flipping)
        this.facingLeft = false;
        
        // Attack state
        this.isAttacking = false;
    }

    /**
     * Update player
     * @param {number} deltaTime - Time since last update in ms
     * @param {number} mapWidth - Map width in pixels (optional)
     * @param {number} mapHeight - Map height in pixels (optional)
     */
    update(deltaTime, mapWidth = 0, mapHeight = 0) {
        // Update current animation
        this.currentAnimation.update(deltaTime);
        
        // Update position with boundaries
        this.updatePosition(mapWidth, mapHeight);
    }

    /**
     * Render player
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Camera} camera - Camera for screen position
     * @param {boolean} useWorldCoords - If true, render at world position (for ctx.translate). If false, use camera.worldToScreen
     */
    render(ctx, camera, useWorldCoords = false) {
        let renderX, renderY;
        
        if (useWorldCoords) {
            // Context is translated (Screen2) - use world position
            renderX = this.x;
            renderY = this.y;
        } else {
            // Context not translated (Screen1) - use screen position
            const screen = camera.worldToScreen(this.x, this.y);
            renderX = screen.x;
            renderY = screen.y;
        }
        
        const frameIndex = this.currentAnimation.getCurrentFrameIndex();
        
        // Use correct spritesheet based on animation
        let spriteSheet = this.idleSpriteSheet;
        if (this.currentAnimation.name === 'run') {
            spriteSheet = this.runSpriteSheet;
        } else if (this.currentAnimation.name === 'run_back') {
            spriteSheet = this.runBackSpriteSheet;
        } else if (this.currentAnimation.name === 'run_front') {
            spriteSheet = this.runFrontSpriteSheet;
        } else if (this.currentAnimation.name === 'attack') {
            spriteSheet = this.attackSpriteSheet;
        }
        
        // Use different scale for run_front
        const scale = this.currentAnimation.name === 'run_front' ? this.runFrontScale : this.scale;
        
        spriteSheet.drawFrame(
            ctx,
            frameIndex,
            renderX,
            renderY,
            scale,
            this.facingLeft // Auto flip based on direction
        );
    }

    /**
     * Get player size
     */
    getSize() {
        let spriteSheet = this.idleSpriteSheet;
        if (this.currentAnimation.name === 'run') {
            spriteSheet = this.runSpriteSheet;
        } else if (this.currentAnimation.name === 'run_back') {
            spriteSheet = this.runBackSpriteSheet;
        } else if (this.currentAnimation.name === 'run_front') {
            spriteSheet = this.runFrontSpriteSheet;
        }
        
        return {
            width: spriteSheet.frameWidth * this.scale,
            height: spriteSheet.frameHeight * this.scale
        };
    }
    
    /**
     * Move player - Set animation based on direction (does NOT update position)
     * @param {number} dx - Delta X
     * @param {number} dy - Delta Y
     */
    move(dx, dy) {
        // Don't set velocity here - position is managed externally with collision
        // this.velocityX = dx;
        // this.velocityY = dy;
        
        // Switch animation based on movement direction
        if (dx !== 0 || dy !== 0) {
            // Prioritize vertical movement for animation
            if (Math.abs(dy) > Math.abs(dx)) {
                // Moving more vertically
                if (dy < 0) {
                    this.currentAnimation = this.runBackAnimation; // Moving up
                    this.facingLeft = false;
                } else {
                    this.currentAnimation = this.runFrontAnimation; // Moving down
                    this.facingLeft = false;
                }
            } else {
                // Moving more horizontally
                this.currentAnimation = this.runAnimation;
                if (dx < 0) {
                    this.facingLeft = true; // Moving left
                } else {
                    this.facingLeft = false; // Moving right
                }
            }
        } else {
            this.currentAnimation = this.idleAnimation;
        }
    }
    
    /**
     * Attack animation
     */
    attack() {
        if (this.isAttacking) return;
        
        this.isAttacking = true;
        this.currentAnimation = this.attackAnimation;
        this.attackAnimation.reset();
        
        console.log('⚔️ Player attacking!');
    }
    
    /**
     * Update player
     * @param {number} deltaTime - Time since last update in ms
     * @param {number} mapWidth - Map width in pixels (optional) OR dx for movement
     * @param {number} mapHeight - Map height in pixels (optional) OR dy for movement
     */
    update(deltaTime, mapWidth = 0, mapHeight = 0) {
        // Update current animation
        this.currentAnimation.update(deltaTime);
        
        // Check if attack animation finished
        if (this.isAttacking && this.attackAnimation.isComplete()) {
            this.isAttacking = false;
            this.currentAnimation = this.idleAnimation;
        }
        
        // Update position with boundaries (old behavior for Screen1)
        this.updatePosition(mapWidth, mapHeight);
    }
    
    /**
     * Update position with map boundaries
     * @param {number} mapWidth - Map width in pixels
     * @param {number} mapHeight - Map height in pixels
     */
    updatePosition(mapWidth = 0, mapHeight = 0) {
        // Calculate new position
        const newX = this.x + this.velocityX * this.speed;
        const newY = this.y + this.velocityY * this.speed;
        
        // Apply map boundaries if provided
        if (mapWidth > 0 && mapHeight > 0) {
            const size = this.getSize();
            
            // Clamp position to stay within map bounds (use larger margin for safety)
            const margin = 20; // Extra margin from edge
            this.x = Math.max(margin, Math.min(newX, mapWidth - size.width - margin));
            this.y = Math.max(margin, Math.min(newY, mapHeight - size.height - margin));
        } else {
            this.x = newX;
            this.y = newY;
        }
    }

    /**
     * Get player center position
     */
    getCenter() {
        const size = this.getSize();
        return {
            x: this.x + size.width / 2,
            y: this.y + size.height / 2
        };
    }
}
