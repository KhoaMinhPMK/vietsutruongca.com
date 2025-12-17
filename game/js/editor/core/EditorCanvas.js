/**
 * EditorCanvas Class
 * Handles canvas rendering, pan, zoom, and viewport management
 */
class EditorCanvas {
    constructor(canvasElement, objectManager) {
        this.canvas = canvasElement;
        this.ctx = this.canvas.getContext('2d');
        this.objectManager = objectManager;
        
        // Camera/viewport
        this.camera = {
            x: 0,
            y: 0,
            width: this.canvas.width,
            height: this.canvas.height,
            zoom: 1,
            minZoom: 0.1,
            maxZoom: 5
        };
        
        // Pan state
        this.isPanning = false;
        this.panStartX = 0;
        this.panStartY = 0;
        this.panStartCameraX = 0;
        this.panStartCameraY = 0;
        
        // Render settings
        this.showGrid = true;
        this.showDebug = false;
        this.gridSize = OBJECT_CONFIG.SNAP_SIZE;
        
        // Background color
        this.backgroundColor = '#1e1e1e';
        
        // Map bounds (from constants)
        this.mapWidth = MAP_CONFIG.MAP_WIDTH * MAP_CONFIG.TILE_SIZE;
        this.mapHeight = MAP_CONFIG.MAP_HEIGHT * MAP_CONFIG.TILE_SIZE;
        
        // Tilemap
        this.tileset = null;
        this.map = null;
        this.tilemapLoaded = false;
        
        // Setup canvas
        this.resize();
        
        // Load tilemap
        this.loadTilemap();
    }
    
    /**
     * Load and initialize tilemap
     */
    async loadTilemap() {
        try {
            // Create and load tileset
            this.tileset = new Tileset(
                MAP_CONFIG.TILESET_PATH,
                MAP_CONFIG.TILE_SIZE,
                MAP_CONFIG.TILESET_TILE_SIZE
            );
            await this.tileset.load();
            
            // Create map
            this.map = new Map(
                MAP_CONFIG.MAP_WIDTH,
                MAP_CONFIG.MAP_HEIGHT,
                MAP_CONFIG.TILE_SIZE,
                this.tileset
            );
            
            this.tilemapLoaded = true;
            console.log('✓ Editor tilemap loaded');
        } catch (error) {
            console.error('Failed to load editor tilemap:', error);
            this.tilemapLoaded = false;
        }
    }
    
    /**
     * Resize canvas to fit container
     */
    resize() {
        const parent = this.canvas.parentElement;
        this.canvas.width = parent.clientWidth;
        this.canvas.height = parent.clientHeight;
        this.camera.width = this.canvas.width;
        this.camera.height = this.canvas.height;
    }
    
    /**
     * Start panning
     * @param {number} screenX - Mouse X in screen coordinates
     * @param {number} screenY - Mouse Y in screen coordinates
     */
    startPan(screenX, screenY) {
        this.isPanning = true;
        this.panStartX = screenX;
        this.panStartY = screenY;
        this.panStartCameraX = this.camera.x;
        this.panStartCameraY = this.camera.y;
        this.canvas.style.cursor = 'grabbing';
    }
    
    /**
     * Update pan
     * @param {number} screenX
     * @param {number} screenY
     */
    updatePan(screenX, screenY) {
        if (!this.isPanning) return;
        
        const deltaX = screenX - this.panStartX;
        const deltaY = screenY - this.panStartY;
        
        this.camera.x = this.panStartCameraX - deltaX;
        this.camera.y = this.panStartCameraY - deltaY;
        
        this.clampCamera();
    }
    
    /**
     * Stop panning
     */
    stopPan() {
        this.isPanning = false;
        this.canvas.style.cursor = 'crosshair';
    }
    
    /**
     * Zoom at a specific point
     * @param {number} factor - Zoom factor (>1 zoom in, <1 zoom out)
     * @param {number} centerX - Screen X to zoom towards
     * @param {number} centerY - Screen Y to zoom towards
     */
    zoom(factor, centerX = null, centerY = null) {
        const oldZoom = this.camera.zoom;
        this.camera.zoom *= factor;
        this.camera.zoom = Math.max(this.camera.minZoom, Math.min(this.camera.maxZoom, this.camera.zoom));
        
        // If zoom to specific point
        if (centerX !== null && centerY !== null) {
            const zoomChange = this.camera.zoom / oldZoom;
            const worldX = centerX + this.camera.x;
            const worldY = centerY + this.camera.y;
            
            this.camera.x = worldX - (worldX - this.camera.x) * zoomChange;
            this.camera.y = worldY - (worldY - this.camera.y) * zoomChange;
        }
        
        this.clampCamera();
    }
    
    /**
     * Reset zoom to 100%
     */
    resetZoom() {
        this.camera.zoom = 1;
        this.clampCamera();
    }
    
    /**
     * Clamp camera to map bounds
     */
    clampCamera() {
        const maxX = this.mapWidth - this.camera.width / this.camera.zoom;
        const maxY = this.mapHeight - this.camera.height / this.camera.zoom;
        
        this.camera.x = Math.max(0, Math.min(this.camera.x, maxX));
        this.camera.y = Math.max(0, Math.min(this.camera.y, maxY));
    }
    
    /**
     * Convert screen coordinates to world coordinates
     * @param {number} screenX
     * @param {number} screenY
     * @returns {Object} {x, y}
     */
    screenToWorld(screenX, screenY) {
        return {
            x: screenX / this.camera.zoom + this.camera.x,
            y: screenY / this.camera.zoom + this.camera.y
        };
    }
    
    /**
     * Convert world coordinates to screen coordinates
     * @param {number} worldX
     * @param {number} worldY
     * @returns {Object} {x, y}
     */
    worldToScreen(worldX, worldY) {
        return {
            x: (worldX - this.camera.x) * this.camera.zoom,
            y: (worldY - this.camera.y) * this.camera.zoom
        };
    }
    
    /**
     * Check if world rectangle is visible in viewport
     * @param {Object} rect - {x, y, width, height} in world coordinates
     * @returns {boolean}
     */
    isVisible(rect) {
        const viewLeft = this.camera.x;
        const viewRight = this.camera.x + this.camera.width / this.camera.zoom;
        const viewTop = this.camera.y;
        const viewBottom = this.camera.y + this.camera.height / this.camera.zoom;
        
        return !(rect.x + rect.width < viewLeft ||
                 rect.x > viewRight ||
                 rect.y + rect.height < viewTop ||
                 rect.y > viewBottom);
    }
    
    /**
     * Get visible tiles for Map rendering
     */
    getVisibleTiles() {
        const tileSize = MAP_CONFIG.TILE_SIZE;
        return {
            startCol: Math.floor(this.camera.x / tileSize),
            startRow: Math.floor(this.camera.y / tileSize),
            endCol: Math.ceil((this.camera.x + this.camera.width / this.camera.zoom) / tileSize),
            endRow: Math.ceil((this.camera.y + this.camera.height / this.camera.zoom) / tileSize)
        };
    }
    
    /**
     * Convert world coordinates to screen coordinates (for Map rendering)
     */
    worldToScreen(worldX, worldY) {
        return {
            x: worldX,
            y: worldY
        };
    }
    
    /**
     * Pan camera with WASD keys
     * @param {number} dx - Delta X
     * @param {number} dy - Delta Y
     */
    panByKeys(dx, dy) {
        const panSpeed = 10 / this.camera.zoom;
        this.camera.x += dx * panSpeed;
        this.camera.y += dy * panSpeed;
        this.clampCamera();
    }
    
    /**
     * Center camera on position
     * @param {number} x - World X
     * @param {number} y - World Y
     */
    centerOn(x, y) {
        this.camera.x = x - this.camera.width / (2 * this.camera.zoom);
        this.camera.y = y - this.camera.height / (2 * this.camera.zoom);
        this.clampCamera();
    }
    
    /**
     * Render everything
     */
    render() {
        // Clear canvas
        this.ctx.fillStyle = this.backgroundColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Save context state
        this.ctx.save();
        
        // Apply zoom
        this.ctx.scale(this.camera.zoom, this.camera.zoom);
        
        // Apply camera offset
        this.ctx.translate(-this.camera.x, -this.camera.y);
        
        // Draw map background
        this.drawMapBackground();
        
        // Draw grid
        if (this.showGrid) {
            this.drawGrid();
        }
        
        // Draw objects (using LayeredRenderer for proper z-index)
        this.drawObjects();
        
        // Restore context
        this.ctx.restore();
        
        // Draw UI overlays (not affected by zoom/pan)
        this.drawOverlays();
        
        // Draw debug info
        if (this.showDebug) {
            this.drawDebugInfo();
        }
    }
    
    /**
     * Draw map background
     */
    drawMapBackground() {
        if (this.tilemapLoaded && this.map) {
            // Render actual tilemap - pass EditorCanvas (this) as camera parameter
            // Map.render() will call camera.getVisibleTiles() and camera.worldToScreen()
            this.map.render(this.ctx, this);
        } else {
            // Fallback: Draw plain background if tilemap not loaded
            this.ctx.fillStyle = '#2a2a2a';
            this.ctx.fillRect(0, 0, this.mapWidth, this.mapHeight);
            
            // Show loading message
            if (!this.tilemapLoaded) {
                this.ctx.fillStyle = '#ffffff';
                this.ctx.font = '20px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(
                    'Loading tilemap...', 
                    this.mapWidth / 2, 
                    this.mapHeight / 2
                );
            }
        }
        
        // Draw border
        this.ctx.strokeStyle = '#007acc';
        this.ctx.lineWidth = 2 / this.camera.zoom;
        this.ctx.strokeRect(0, 0, this.mapWidth, this.mapHeight);
    }
    
    /**
     * Draw grid
     */
    drawGrid() {
        const startX = Math.floor(this.camera.x / this.gridSize) * this.gridSize;
        const startY = Math.floor(this.camera.y / this.gridSize) * this.gridSize;
        const endX = this.camera.x + this.camera.width / this.camera.zoom;
        const endY = this.camera.y + this.camera.height / this.camera.zoom;
        
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1 / this.camera.zoom;
        
        this.ctx.beginPath();
        
        // Vertical lines
        for (let x = startX; x <= endX; x += this.gridSize) {
            if (x < 0 || x > this.mapWidth) continue;
            this.ctx.moveTo(x, Math.max(0, this.camera.y));
            this.ctx.lineTo(x, Math.min(this.mapHeight, endY));
        }
        
        // Horizontal lines
        for (let y = startY; y <= endY; y += this.gridSize) {
            if (y < 0 || y > this.mapHeight) continue;
            this.ctx.moveTo(Math.max(0, this.camera.x), y);
            this.ctx.lineTo(Math.min(this.mapWidth, endX), y);
        }
        
        this.ctx.stroke();
        
        // Draw major grid lines every 64px (4 tiles)
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        this.ctx.lineWidth = 2 / this.camera.zoom;
        
        this.ctx.beginPath();
        
        const majorGridSize = this.gridSize * 4;
        for (let x = startX; x <= endX; x += majorGridSize) {
            if (x < 0 || x > this.mapWidth) continue;
            this.ctx.moveTo(x, Math.max(0, this.camera.y));
            this.ctx.lineTo(x, Math.min(this.mapHeight, endY));
        }
        
        for (let y = startY; y <= endY; y += majorGridSize) {
            if (y < 0 || y > this.mapHeight) continue;
            this.ctx.moveTo(Math.max(0, this.camera.x), y);
            this.ctx.lineTo(Math.min(this.mapWidth, endX), y);
        }
        
        this.ctx.stroke();
    }
    
    /**
     * Draw objects using LayeredRenderer
     */
    drawObjects() {
        // Create a simple camera object for GameObject.render()
        const camera = {
            x: this.camera.x,
            y: this.camera.y,
            width: this.camera.width / this.camera.zoom,
            height: this.camera.height / this.camera.zoom
        };
        
        // Render all objects sorted by z-index
        LayeredRenderer.renderLayered(this.ctx, camera, this.objectManager.objects);
    }
    
    /**
     * Draw overlays (selection boxes, etc.)
     */
    drawOverlays() {
        // Draw selection boxes for selected objects
        const selected = this.objectManager.getSelected();
        
        if (selected.length > 0) {
            this.ctx.save();
            this.ctx.scale(this.camera.zoom, this.camera.zoom);
            this.ctx.translate(-this.camera.x, -this.camera.y);
            
            this.ctx.strokeStyle = '#00ff00';
            this.ctx.lineWidth = 2 / this.camera.zoom;
            this.ctx.setLineDash([5 / this.camera.zoom, 5 / this.camera.zoom]);
            
            for (const obj of selected) {
                const bounds = obj.getBounds();
                this.ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
                
                // Draw corner handles
                const handleSize = 8 / this.camera.zoom;
                this.ctx.fillStyle = '#00ff00';
                this.ctx.fillRect(bounds.x - handleSize/2, bounds.y - handleSize/2, handleSize, handleSize);
                this.ctx.fillRect(bounds.x + bounds.width - handleSize/2, bounds.y - handleSize/2, handleSize, handleSize);
                this.ctx.fillRect(bounds.x - handleSize/2, bounds.y + bounds.height - handleSize/2, handleSize, handleSize);
                this.ctx.fillRect(bounds.x + bounds.width - handleSize/2, bounds.y + bounds.height - handleSize/2, handleSize, handleSize);
            }
            
            this.ctx.restore();
        }
    }
    
    /**
     * Draw debug info
     */
    drawDebugInfo() {
        const stats = this.objectManager.getStats();
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(10, 10, 220, 140);
        
        this.ctx.fillStyle = '#0f0';
        this.ctx.font = '12px monospace';
        
        let y = 30;
        this.ctx.fillText(`Objects: ${stats.total}`, 20, y); y += 20;
        this.ctx.fillText(`Camera: ${Math.floor(this.camera.x)}, ${Math.floor(this.camera.y)}`, 20, y); y += 20;
        this.ctx.fillText(`Zoom: ${Math.round(this.camera.zoom * 100)}%`, 20, y); y += 20;
        this.ctx.fillText(`Selected: ${this.objectManager.selectedObjects.length}`, 20, y); y += 20;
        this.ctx.fillText(`Collidable: ${stats.collidable}`, 20, y); y += 20;
        this.ctx.fillText(`Interactable: ${stats.interactable}`, 20, y); y += 20;
        this.ctx.fillText(`FPS: ${this.getFPS()}`, 20, y);
    }
    
    /**
     * Get FPS (simple calculation)
     */
    getFPS() {
        if (!this.lastFrameTime) this.lastFrameTime = performance.now();
        
        const now = performance.now();
        const fps = 1000 / (now - this.lastFrameTime);
        this.lastFrameTime = now;
        
        return Math.round(fps);
    }
    
    /**
     * Get camera info
     */
    getCameraInfo() {
        return {
            x: Math.floor(this.camera.x),
            y: Math.floor(this.camera.y),
            zoom: Math.round(this.camera.zoom * 100)
        };
    }
}
