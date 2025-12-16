// Tileset Manager - Load and manage tileset
class Tileset {
    constructor(imagePath, renderSize, sourceSize = null) {
        this.image = new Image();
        this.imagePath = imagePath;
        this.renderSize = renderSize;        // Size to render on canvas
        this.sourceSize = sourceSize || renderSize; // Size in tileset file
        this.loaded = false;
    }

    /**
     * Load tileset image
     */
    load() {
        return new Promise((resolve, reject) => {
            this.image.onload = () => {
                this.loaded = true;
                console.log('Tileset loaded:', this.imagePath);
                resolve(this);
            };
            this.image.onerror = () => {
                console.error('Failed to load tileset:', this.imagePath);
                reject(new Error('Tileset load failed'));
            };
            this.image.src = this.imagePath;
        });
    }

    /**
     * Draw a tile from tileset to canvas
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} tileId - Tile ID (0-based)
     * @param {number} x - X position on canvas
     * @param {number} y - Y position on canvas
     * @param {number} cols - Columns in tileset
     */
    drawTile(ctx, tileId, x, y, cols = 1) {
        if (!this.loaded) return;

        const srcX = (tileId % cols) * this.sourceSize;
        const srcY = Math.floor(tileId / cols) * this.sourceSize;

        ctx.drawImage(
            this.image,
            srcX, srcY,                        // Source position
            this.sourceSize, this.sourceSize,  // Source size (from tileset)
            x, y,                              // Destination position
            this.renderSize, this.renderSize   // Destination size (render smaller)
        );
    }
}
