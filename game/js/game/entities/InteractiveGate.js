/**
 * InteractiveGate - Cổng thời gian với animation
 */
class InteractiveGate extends GameObject {
    /**
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} spritePath - Path to sprite sheet
     */
    constructor(x, y, spritePath = 'assets/sprites/Dimensional_Portal.png') {
        // GameObject expects a config object
        super({
            id: `gate_${Date.now()}`,
            type: 'gate',
            spritePath: spritePath,
            x: x,
            y: y,
            width: 96,
            height: 64,
            zIndex: 50,
            collidable: true,
            interactable: true
        });
        
        // Animation settings (2 rows x 3 cols = 6 frames)
        this.frameCount = 6;
        this.currentFrame = 0;
        this.frameTime = 150; // ms per frame
        this.elapsedTime = 0;
        this.cols = 3;
        this.rows = 2;
        
        // Interaction
        this.interactionRange = 150;
        this.showButton = false;
        this.requiredWood = 0; // TEMP: 0 for testing (was 2)
        this.resourceManager = null; // Will be set by Screen1
        
        // Load sprite
        this.sprite = new Image();
        this.sprite.src = spritePath;
        this.sprite.onload = () => {
            console.log('✅ Gate sprite loaded');
        };
        this.sprite.onerror = () => {
            console.error('❌ Failed to load gate sprite');
        };
    }
    
    /**
     * Check if player is nearby
     * @param {Player} player
     * @returns {boolean}
     */
    isPlayerNearby(player) {
        if (!player) return false;
        
        const playerSize = player.getSize();
        const playerCenterX = player.x + playerSize.width / 2;
        const playerCenterY = player.y + playerSize.height / 2;
        
        const gateCenterX = this.x + this.width / 2;
        const gateCenterY = this.y + this.height / 2;
        
        const distance = Math.sqrt(
            Math.pow(playerCenterX - gateCenterX, 2) +
            Math.pow(playerCenterY - gateCenterY, 2)
        );
        
        return distance < this.interactionRange;
    }
    
    /**
     * Check if player has enough wood
     * @returns {boolean}
     */
    hasEnoughWood() {
        if (!this.resourceManager) {
            console.log('⚠️ Gate: No resourceManager attached');
            return false;
        }
        const currentWood = this.resourceManager.getWood();
        const hasEnough = currentWood >= this.requiredWood;
        console.log(`🪵 Gate check: ${currentWood} wood (need ${this.requiredWood}) = ${hasEnough ? 'ENABLED' : 'DISABLED'}`);
        return hasEnough;
    }
    
    /**
     * Update animation and interaction state
     * @param {number} deltaTime
     * @param {Player} player
     */
    update(deltaTime, player) {
        // Update animation
        this.elapsedTime += deltaTime;
        
        if (this.elapsedTime >= this.frameTime) {
            this.currentFrame = (this.currentFrame + 1) % this.frameCount;
            this.elapsedTime = 0;
        }
        
        // Update interaction state
        const wasShowingButton = this.showButton;
        this.showButton = this.isPlayerNearby(player);
        
        if (this.showButton && !wasShowingButton) {
            console.log('🚪 Gate button showing!');
        }
    }
    
    /**
     * Render gate with animation
     * @param {CanvasRenderingContext2D} ctx
     * @param {Camera} camera
     */
    render(ctx, camera) {
        if (!this.sprite || !this.sprite.complete) return;
        
        const screenX = this.x - camera.x;
        const screenY = this.y - camera.y;
        
        // Calculate frame position in sprite sheet
        const frameWidth = this.sprite.width / this.cols;
        const frameHeight = this.sprite.height / this.rows;
        const col = this.currentFrame % this.cols;
        const row = Math.floor(this.currentFrame / this.cols);
        
        // Draw current frame
        ctx.drawImage(
            this.sprite,
            col * frameWidth,
            row * frameHeight,
            frameWidth,
            frameHeight,
            screenX,
            screenY,
            this.width,
            this.height
        );
    }
    
    /**
     * Render interaction UI (button)
     * @param {CanvasRenderingContext2D} ctx
     * @param {Camera} camera
     */
    renderUI(ctx, camera) {
        if (!this.showButton) return;
        
        const screenX = this.x - camera.x;
        const screenY = this.y - camera.y;
        const hasWood = this.hasEnoughWood();
        
        console.log(`🚪 Gate UI: showButton=${this.showButton}, hasWood=${hasWood}, pos=(${screenX}, ${screenY})`);
        
        // Button settings
        const buttonWidth = 160;
        const buttonHeight = 45;
        const buttonX = screenX + this.width / 2 - buttonWidth / 2;
        const buttonY = screenY - 55;
        
        // Button background
        const gradient = ctx.createLinearGradient(buttonX, buttonY, buttonX, buttonY + buttonHeight);
        if (hasWood) {
            gradient.addColorStop(0, 'rgba(50, 150, 255, 0.95)');
            gradient.addColorStop(1, 'rgba(30, 100, 200, 0.95)');
        } else {
            gradient.addColorStop(0, 'rgba(100, 100, 100, 0.8)');
            gradient.addColorStop(1, 'rgba(60, 60, 60, 0.8)');
        }
        ctx.fillStyle = gradient;
        ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
        
        // Button border
        ctx.strokeStyle = hasWood ? '#4db8ff' : '#888';
        ctx.lineWidth = 3;
        ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);
        
        // Button text
        ctx.fillStyle = hasWood ? '#fff' : '#aaa';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        if (hasWood) {
            ctx.fillText('⚡ Qua màn ➜', buttonX + buttonWidth / 2, buttonY + buttonHeight / 2);
        } else {
            ctx.font = '14px Arial';
            ctx.fillText(`🔒 Cần ${this.requiredWood} gỗ`, buttonX + buttonWidth / 2, buttonY + buttonHeight / 2);
        }
    }
    
    /**
     * Create from JSON
     */
    static fromJSON(data) {
        const gate = new InteractiveGate(
            data.x,
            data.y,
            data.spritePath || 'assets/sprites/Dimensional_Portal.png'
        );
        
        if (data.id) gate.id = data.id;
        if (data.zIndex !== undefined) gate.zIndex = data.zIndex;
        if (data.collidable !== undefined) gate.collidable = data.collidable;
        if (data.interactable !== undefined) gate.interactable = data.interactable;
        if (data.metadata) gate.metadata = data.metadata;
        
        return gate;
    }
}
