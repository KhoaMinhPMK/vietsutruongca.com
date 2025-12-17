/**
 * InteractiveTree Class
 * Manages tree chopping mechanic with hold-to-chop UI
 */
class InteractiveTree extends GameObject {
    /**
     * @param {Object} config - Tree configuration
     */
    constructor(config) {
        super(config);
        
        // Tree state
        this.isChopped = false;
        this.chopProgress = 0;
        this.chopDuration = 3000; // 3 seconds
        this.isChopping = false;
        
        // Interaction range (increased for larger trees)
        this.interactionRange = 150;
        
        // UI elements
        this.showButton = false;
        this.buttonPressed = false;
        
        // Stump sprite (tree1)
        this.stumpSprite = null;
        this.stumpLoaded = false;
        this.stumpPath = config.stumpPath || '';
        
        if (this.stumpPath) {
            this.loadStumpSprite();
        }
    }
    
    /**
     * Load stump sprite
     */
    loadStumpSprite() {
        this.stumpSprite = new Image();
        this.stumpSprite.onload = () => {
            this.stumpLoaded = true;
        };
        this.stumpSprite.onerror = () => {
            console.error(`Failed to load stump sprite: ${this.stumpPath}`);
        };
        this.stumpSprite.src = this.stumpPath;
    }
    
    /**
     * Check if player is in interaction range
     * @param {Player} player
     * @returns {boolean}
     */
    isPlayerNearby(player) {
        if (!player || this.isChopped) return false;
        
        // Get player size
        const playerSize = player.getSize ? player.getSize() : { width: player.width || 0, height: player.height || 0 };
        
        const dx = (player.x + playerSize.width / 2) - (this.x + this.width / 2);
        const dy = (player.y + playerSize.height / 2) - (this.y + this.height / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        return distance <= this.interactionRange;
    }
    
    /**
     * Start chopping
     */
    startChopping() {
        if (this.isChopped) return;
        this.isChopping = true;
        this.buttonPressed = true;
    }
    
    /**
     * Stop chopping
     */
    stopChopping() {
        if (this.isChopped) return;
        this.isChopping = false;
        this.buttonPressed = false;
        // Reset progress if not fully chopped
        if (this.chopProgress < 1) {
            this.chopProgress = Math.max(0, this.chopProgress - 0.01);
        }
    }
    
    /**
     * Update tree state
     * @param {number} deltaTime
     * @param {Player} player
     */
    update(deltaTime, player) {
        if (this.isChopped) {
            this.showButton = false;
            return;
        }
        
        // Check player proximity
        const wasShowing = this.showButton;
        this.showButton = this.isPlayerNearby(player);
        
        // Debug: Log when button state changes
        if (this.showButton && !wasShowing) {
            console.log(`🌲 Tree button showing! Distance: ${Math.floor(this.getDistanceToPlayer(player))}px`);
        }
        
        // Update chopping progress
        if (this.isChopping && this.buttonPressed) {
            this.chopProgress += deltaTime / this.chopDuration;
            
            if (this.chopProgress >= 1) {
                this.chopProgress = 1;
                this.isChopped = true;
                this.isChopping = false;
                this.collidable = false;
                this.interactable = false;
                console.log('🪓 Tree chopped!');
                
                // Add wood to resource manager
                if (this.resourceManager) {
                    this.resourceManager.addWood(1);
                }
            }
        } else if (this.chopProgress > 0 && this.chopProgress < 1) {
            // Slowly decay progress when not chopping
            this.chopProgress = Math.max(0, this.chopProgress - deltaTime / 1000);
        }
    }
    
    /**
     * Get distance to player (helper for debugging)
     * @param {Player} player
     * @returns {number}
     */
    getDistanceToPlayer(player) {
        if (!player) return Infinity;
        
        // Get player size
        const playerSize = player.getSize ? player.getSize() : { width: player.width || 0, height: player.height || 0 };
        
        const dx = (player.x + playerSize.width / 2) - (this.x + this.width / 2);
        const dy = (player.y + playerSize.height / 2) - (this.y + this.height / 2);
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    /**
     * Render tree
     * @param {CanvasRenderingContext2D} ctx
     * @param {Camera} camera
     */
    render(ctx, camera) {
        const screenX = this.x - camera.x;
        const screenY = this.y - camera.y;
        
        // Render stump first (always)
        if (this.stumpLoaded && this.stumpSprite) {
            ctx.drawImage(
                this.stumpSprite,
                screenX,
                screenY,
                this.width,
                this.height
            );
        }
        
        // Render full tree on top if not chopped
        if (!this.isChopped && this.spriteLoaded && this.sprite) {
            ctx.drawImage(
                this.sprite,
                screenX,
                screenY,
                this.width,
                this.height
            );
        }
    }
    
    /**
     * Render UI elements (button and progress bar)
     * @param {CanvasRenderingContext2D} ctx
     * @param {Camera} camera
     */
    renderUI(ctx, camera) {
        if (!this.showButton || this.isChopped) return;
        
        const screenX = this.x - camera.x;
        const screenY = this.y - camera.y;
        
        // Larger button - adjusted for larger tree
        const buttonWidth = 160;
        const buttonHeight = 50;
        const buttonX = screenX + this.width / 2 - buttonWidth / 2;
        const buttonY = screenY - 60;
        
        // Draw button background
        ctx.fillStyle = this.buttonPressed ? 'rgba(100, 200, 100, 0.9)' : 'rgba(139, 69, 19, 0.9)';
        ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
        
        // Draw button border
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);
        
        // Draw button text
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🪓 Chặt cây', buttonX + buttonWidth / 2, buttonY + buttonHeight / 2);
        
        // Draw progress bar if chopping
        if (this.chopProgress > 0) {
            const progressBarWidth = 140;
            const progressBarHeight = 12;
            const progressBarX = screenX + this.width / 2 - progressBarWidth / 2;
            const progressBarY = buttonY + buttonHeight + 10;
            
            // Progress bar background
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(progressBarX, progressBarY, progressBarWidth, progressBarHeight);
            
            // Progress bar fill
            const fillWidth = progressBarWidth * Math.min(1, this.chopProgress);
            ctx.fillStyle = '#4CAF50';
            ctx.fillRect(progressBarX, progressBarY, fillWidth, progressBarHeight);
            
            // Progress bar border
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 1;
            ctx.strokeRect(progressBarX, progressBarY, progressBarWidth, progressBarHeight);
        }
    }
    
    /**
     * Convert to JSON
     * @returns {Object}
     */
    toJSON() {
        return {
            ...super.toJSON(),
            stumpPath: this.stumpPath,
            isChopped: this.isChopped,
            chopProgress: this.chopProgress
        };
    }
    
    /**
     * Create from JSON
     * @param {Object} data
     * @returns {InteractiveTree}
     */
    static fromJSON(data) {
        console.log('Creating InteractiveTree from JSON:', data.id);
        const tree = new InteractiveTree(data);
        tree.isChopped = data.isChopped || false;
        tree.chopProgress = data.chopProgress || 0;
        return tree;
    }
}
