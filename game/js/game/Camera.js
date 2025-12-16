// Camera - Handle viewport scrolling
class Camera {
    constructor(mapWidth, mapHeight, tileSize, canvasWidth, canvasHeight) {
        this.x = 0; // Camera position X (in pixels)
        this.y = 0; // Camera position Y (in pixels)
        this.mapWidth = mapWidth * tileSize;
        this.mapHeight = mapHeight * tileSize;
        this.tileSize = tileSize;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
    }

    /**
     * Update camera position
     */
    update(targetX, targetY) {
        // Center camera on target
        this.x = targetX - this.canvasWidth / 2;
        this.y = targetY - this.canvasHeight / 2;

        // Clamp camera to map bounds
        this.x = Math.max(0, Math.min(this.x, this.mapWidth - this.canvasWidth));
        this.y = Math.max(0, Math.min(this.y, this.mapHeight - this.canvasHeight));
    }

    /**
     * Get visible tile range
     */
    getVisibleTiles() {
        return {
            startCol: Math.floor(this.x / this.tileSize),
            startRow: Math.floor(this.y / this.tileSize),
            endCol: Math.ceil((this.x + this.canvasWidth) / this.tileSize),
            endRow: Math.ceil((this.y + this.canvasHeight) / this.tileSize)
        };
    }

    /**
     * Convert world position to screen position
     */
    worldToScreen(worldX, worldY) {
        return {
            x: worldX - this.x,
            y: worldY - this.y
        };
    }

    /**
     * Convert screen position to world position
     */
    screenToWorld(screenX, screenY) {
        return {
            x: screenX + this.x,
            y: screenY + this.y
        };
    }
}
