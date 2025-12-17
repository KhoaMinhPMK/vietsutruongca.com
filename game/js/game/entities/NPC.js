/**
 * NPC Class - Non-Player Character with idle animation
 * Extends GameObject to add animation support
 */
class NPC extends GameObject {
    constructor(config) {
        super(config);
        
        // Animation properties
        this.spriteSheet = null;
        this.frameCount = 8; // Default 8 frames for idle
        this.frameTime = 100; // 100ms per frame
        this.currentFrame = 0;
        this.frameTimer = 0;
        this.animationLoaded = false;
        
        // Get animation config from metadata if available
        if (config.metadata && config.metadata.animation) {
            this.frameCount = config.metadata.animation.frameCount || 8;
            this.frameTime = config.metadata.animation.frameTime || 100;
        }
        
        // Load sprite as spritesheet
        this.loadSpriteSheet();
    }
    
    /**
     * Load sprite as animated spritesheet
     */
    loadSpriteSheet() {
        if (!this.spritePath) return;
        
        this.sprite = new Image();
        this.sprite.onload = () => {
            this.spriteLoaded = true;
            this.animationLoaded = true;
            
            // Create spritesheet
            const frameWidth = this.sprite.width / this.frameCount;
            const frameHeight = this.sprite.height;
            
            this.spriteSheet = new SpriteSheet(
                this.spritePath,
                frameWidth,
                frameHeight,
                this.frameCount,
                0,
                0
            );
            this.spriteSheet.image = this.sprite; // Reuse loaded image
            this.spriteSheet.loaded = true;
            
            console.log(`✓ NPC animation loaded: ${this.type} (${this.frameCount} frames)`);
        };
        
        this.sprite.onerror = () => {
            console.warn(`Failed to load NPC sprite: ${this.spritePath}`);
            this.spriteLoaded = false;
            this.animationLoaded = false;
        };
        
        this.sprite.src = this.spritePath;
    }
    
    /**
     * Update NPC animation
     */
    update(deltaTime) {
        if (!this.animationLoaded) return;
        
        // Update frame timer
        this.frameTimer += deltaTime;
        
        // Advance frame
        if (this.frameTimer >= this.frameTime) {
            this.currentFrame = (this.currentFrame + 1) % this.frameCount;
            this.frameTimer = 0;
        }
    }
    
    /**
     * Render NPC with animation
     */
    render(ctx, camera) {
        if (this.animationLoaded && this.spriteSheet) {
            // Render animated sprite
            const screen = camera.worldToScreen(this.x, this.y);
            
            // Draw current frame
            this.spriteSheet.drawFrame(
                ctx,
                this.currentFrame,
                screen.x,
                screen.y,
                1, // scale
                false // flip
            );
            
            // Debug: Draw collision box
            if (window.DEBUG_MODE && this.collidable) {
                ctx.strokeStyle = '#ff00ff';
                ctx.lineWidth = 2;
                ctx.strokeRect(screen.x, screen.y, this.width, this.height);
            }
        } else {
            // Fallback to static render
            super.render(ctx, camera);
        }
    }
    
    /**
     * Convert to JSON
     */
    toJSON() {
        const json = super.toJSON();
        
        // Add animation metadata
        if (!json.metadata) json.metadata = {};
        json.metadata.animation = {
            frameCount: this.frameCount,
            frameTime: this.frameTime
        };
        
        return json;
    }
    
    /**
     * Create NPC from JSON
     */
    static fromJSON(data) {
        return new NPC(data);
    }
}
