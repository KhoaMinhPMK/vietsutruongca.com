// Map - Render tilemap on canvas
class Map {
    constructor(width, height, tileSize, tileset) {
        this.width = width;      // Map width in tiles
        this.height = height;    // Map height in tiles
        this.tileSize = tileSize;
        this.tileset = tileset;
        
        // Generate map data - All grass for now (tile ID 0)
        this.mapData = this.generateMapData();
    }

    /**
     * Generate map data (2D array)
     */
    generateMapData() {
        const data = [];
        for (let row = 0; row < this.height; row++) {
            const rowData = [];
            for (let col = 0; col < this.width; col++) {
                // Create border fence on edges
                if (col === 0 || col === this.width - 1 || row === 0 || row === this.height - 1) {
                    rowData.push(0); // Border tile (use same grass for now, will be darker)
                } else {
                    rowData.push(0); // Interior grass tile
                }
            }
            data.push(rowData);
        }
        console.log(`Map generated: ${this.width}x${this.height} tiles with border fence`);
        return data;
    }

    /**
     * Get tile at position
     */
    getTile(col, row) {
        if (row < 0 || row >= this.height || col < 0 || col >= this.width) {
            return -1; // Out of bounds
        }
        return this.mapData[row][col];
    }

    /**
     * Set tile at position
     */
    setTile(col, row, tileId) {
        if (row < 0 || row >= this.height || col < 0 || col >= this.width) {
            return;
        }
        this.mapData[row][col] = tileId;
    }

    /**
     * Render visible portion of map
     */
    render(ctx, camera) {
        const visible = camera.getVisibleTiles();
        
        // Clamp to map bounds
        const startCol = Math.max(0, visible.startCol);
        const startRow = Math.max(0, visible.startRow);
        const endCol = Math.min(this.width, visible.endCol);
        const endRow = Math.min(this.height, visible.endRow);

        // Render only visible tiles
        for (let row = startRow; row < endRow; row++) {
            for (let col = startCol; col < endCol; col++) {
                const tileId = this.getTile(col, row);
                if (tileId === -1) continue;

                // Calculate world position
                const worldX = col * this.tileSize;
                const worldY = row * this.tileSize;

                // Convert to screen position
                const screen = camera.worldToScreen(worldX, worldY);

                // Draw tile
                this.tileset.drawTile(ctx, tileId, screen.x, screen.y, 1);
            }
        }
    }

    /**
     * Get map size in pixels
     */
    getPixelSize() {
        return {
            width: this.width * this.tileSize,
            height: this.height * this.tileSize
        };
    }
}
