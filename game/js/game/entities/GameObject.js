/**
 * GameObject Class
 * Base class for all game objects (houses, trees, rocks, decorations, etc.)
 */
class GameObject {
    /**
     * @param {Object} config - Object configuration
     * @param {string} config.id - Unique identifier
     * @param {string} config.type - Object type (house, tree, rock, etc.)
     * @param {string} config.spritePath - Path to sprite image
     * @param {number} config.x - X position in world coordinates
     * @param {number} config.y - Y position in world coordinates
     * @param {number} config.width - Width in pixels
     * @param {number} config.height - Height in pixels
     * @param {number} config.zIndex - Layer ordering (default: 50)
     * @param {boolean} config.collidable - Can player collide with this object
     * @param {boolean} config.interactable - Can player interact with this object
     * @param {Object} config.metadata - Additional data (name, dialog, etc.)
     */
    constructor(config) {
        this.id = config.id || this.generateId();
        this.type = config.type || 'object';
        this.spritePath = config.spritePath || '';
        this.x = config.x || 0;
        this.y = config.y || 0;
        this.width = config.width || 32;
        this.height = config.height || 32;
        this.zIndex = config.zIndex !== undefined ? config.zIndex : 50;
        this.collidable = config.collidable !== undefined ? config.collidable : false;
        this.interactable = config.interactable !== undefined ? config.interactable : false;
        this.metadata = config.metadata || {};
        
        // Sprite loading
        this.sprite = null;
        this.spriteLoaded = false;
        
        if (this.spritePath) {
            this.loadSprite();
        }
    }
    
    /**
     * Generate unique ID
     */
    generateId() {
        return `obj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    /**
     * Load sprite image
     */
    loadSprite() {
        this.sprite = new Image();
        this.sprite.onload = () => {
            this.spriteLoaded = true;
        };
        this.sprite.onerror = () => {
            console.error(`Failed to load sprite: ${this.spritePath}`);
            this.spriteLoaded = false;
        };
        this.sprite.src = this.spritePath;
    }
    
    /**
     * Render object to canvas
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Camera} camera - Camera for world-to-screen conversion
     */
    render(ctx, camera) {
        if (!this.spriteLoaded || !this.sprite) {
            // Draw placeholder if sprite not loaded
            this.renderPlaceholder(ctx, camera);
            return;
        }
        
        // Convert world coordinates to screen coordinates
        const screenX = this.x - camera.x;
        const screenY = this.y - camera.y;
        
        // Only render if in viewport
        if (screenX + this.width < 0 || screenX > camera.width ||
            screenY + this.height < 0 || screenY > camera.height) {
            return;
        }
        
        // Draw sprite
        ctx.drawImage(
            this.sprite,
            screenX,
            screenY,
            this.width,
            this.height
        );
        
        // Debug: draw collision box if collidable
        if (this.collidable && window.DEBUG_MODE) {
            ctx.strokeStyle = 'red';
            ctx.lineWidth = 2;
            ctx.strokeRect(screenX, screenY, this.width, this.height);
        }
        
        // Debug: draw interaction indicator if interactable
        if (this.interactable && window.DEBUG_MODE) {
            ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
            ctx.fillRect(screenX, screenY, this.width, this.height);
        }
    }
    
    /**
     * Render placeholder when sprite not loaded
     */
    renderPlaceholder(ctx, camera) {
        const screenX = this.x - camera.x;
        const screenY = this.y - camera.y;
        
        // Draw gray rectangle
        ctx.fillStyle = '#888';
        ctx.fillRect(screenX, screenY, this.width, this.height);
        
        // Draw border
        ctx.strokeStyle = '#444';
        ctx.lineWidth = 1;
        ctx.strokeRect(screenX, screenY, this.width, this.height);
        
        // Draw type text
        ctx.fillStyle = '#fff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.type, screenX + this.width / 2, screenY + this.height / 2);
    }
    
    /**
     * Get bounding box for collision detection
     * @returns {Object} {x, y, width, height}
     */
    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
    
    /**
     * Check if point is inside object
     * @param {number} x - World X coordinate
     * @param {number} y - World Y coordinate
     * @returns {boolean}
     */
    containsPoint(x, y) {
        return x >= this.x && x <= this.x + this.width &&
               y >= this.y && y <= this.y + this.height;
    }
    
    /**
     * Update object (for animation, movement, etc.)
     * @param {number} deltaTime - Time since last update
     */
    update(deltaTime) {
        // Override in subclasses for animated objects
    }
    
    /**
     * Convert to JSON for saving
     * @returns {Object}
     */
    toJSON() {
        return {
            id: this.id,
            type: this.type,
            spritePath: this.spritePath,
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            zIndex: this.zIndex,
            collidable: this.collidable,
            interactable: this.interactable,
            metadata: this.metadata
        };
    }
    
    /**
     * Create GameObject from JSON data
     * @param {Object} data - JSON data
     * @returns {GameObject}
     */
    static fromJSON(data) {
        return new GameObject(data);
    }
    
    /**
     * Clone this object
     * @returns {GameObject}
     */
    clone() {
        return GameObject.fromJSON(this.toJSON());
    }
}
