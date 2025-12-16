// SpriteSheet - Load and manage sprite animations
class SpriteSheet {
    constructor(imagePath, frameWidth, frameHeight, framesPerRow, offsetX = 0, offsetY = 0, startFrame = 0) {
        this.image = new Image();
        this.imagePath = imagePath;
        this.frameWidth = frameWidth;
        this.frameHeight = frameHeight;
        this.framesPerRow = framesPerRow;
        this.offsetX = offsetX;  // Offset to skip empty space on left
        this.offsetY = offsetY;  // Offset to skip empty space on top
        this.startFrame = startFrame;  // First frame to use (for skipping frames)
        this.loaded = false;
    }

    /**
     * Load spritesheet image
     */
    load() {
        return new Promise((resolve, reject) => {
            this.image.onload = () => {
                this.loaded = true;
                console.log('SpriteSheet loaded:', this.imagePath);
                resolve(this);
            };
            this.image.onerror = () => {
                console.error('Failed to load spritesheet:', this.imagePath);
                reject(new Error('SpriteSheet load failed'));
            };
            this.image.src = this.imagePath;
        });
    }

    /**
     * Draw a specific frame from spritesheet
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} frameIndex - Frame number (0-based)
     * @param {number} x - X position on canvas
     * @param {number} y - Y position on canvas
     * @param {number} scale - Scale factor (default 1)
     * @param {boolean} flipX - Flip horizontally
     */
    drawFrame(ctx, frameIndex, x, y, scale = 1, flipX = false) {
        if (!this.loaded) return;

        // Add startFrame offset to skip initial frames
        const actualFrameIndex = frameIndex + this.startFrame;
        
        const col = actualFrameIndex % this.framesPerRow;
        const row = Math.floor(actualFrameIndex / this.framesPerRow);

        // Use precise decimal positions for accurate frame extraction, with offset
        const srcX = this.offsetX + (col * this.frameWidth);
        const srcY = this.offsetY + (row * this.frameHeight);

        const drawWidth = this.frameWidth * scale;
        const drawHeight = this.frameHeight * scale;

        ctx.save();
        
        if (flipX) {
            ctx.translate(x + drawWidth, y);
            ctx.scale(-1, 1);
            ctx.drawImage(
                this.image,
                srcX, srcY,
                this.frameWidth, this.frameHeight,
                0, 0,
                drawWidth, drawHeight
            );
        } else {
            ctx.drawImage(
                this.image,
                srcX, srcY,
                this.frameWidth, this.frameHeight,
                x, y,
                drawWidth, drawHeight
            );
        }
        
        ctx.restore();
    }
}
