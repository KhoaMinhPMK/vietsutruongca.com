/**
 * GridHelper Class
 * Utilities for grid rendering, snapping, and coordinate conversions
 */
class GridHelper {
    /**
     * Snap value to grid
     * @param {number} value - Value to snap
     * @param {number} gridSize - Grid size
     * @returns {number} - Snapped value
     */
    static snap(value, gridSize = OBJECT_CONFIG.SNAP_SIZE) {
        return Math.round(value / gridSize) * gridSize;
    }
    
    /**
     * Snap position to grid
     * @param {number} x
     * @param {number} y
     * @param {number} gridSize
     * @returns {Object} - {x, y}
     */
    static snapPosition(x, y, gridSize = OBJECT_CONFIG.SNAP_SIZE) {
        return {
            x: GridHelper.snap(x, gridSize),
            y: GridHelper.snap(y, gridSize)
        };
    }
    
    /**
     * Snap rectangle to grid
     * @param {Object} rect - {x, y, width, height}
     * @param {number} gridSize
     * @returns {Object} - Snapped rect
     */
    static snapRect(rect, gridSize = OBJECT_CONFIG.SNAP_SIZE) {
        return {
            x: GridHelper.snap(rect.x, gridSize),
            y: GridHelper.snap(rect.y, gridSize),
            width: GridHelper.snap(rect.width, gridSize),
            height: GridHelper.snap(rect.height, gridSize)
        };
    }
    
    /**
     * Get grid cell coordinates
     * @param {number} x - World X
     * @param {number} y - World Y
     * @param {number} gridSize
     * @returns {Object} - {cellX, cellY}
     */
    static getGridCell(x, y, gridSize = OBJECT_CONFIG.SNAP_SIZE) {
        return {
            cellX: Math.floor(x / gridSize),
            cellY: Math.floor(y / gridSize)
        };
    }
    
    /**
     * Get world position from grid cell
     * @param {number} cellX
     * @param {number} cellY
     * @param {number} gridSize
     * @returns {Object} - {x, y}
     */
    static cellToWorld(cellX, cellY, gridSize = OBJECT_CONFIG.SNAP_SIZE) {
        return {
            x: cellX * gridSize,
            y: cellY * gridSize
        };
    }
    
    /**
     * Draw grid on canvas
     * @param {CanvasRenderingContext2D} ctx
     * @param {Object} camera - {x, y, width, height, zoom}
     * @param {number} gridSize
     * @param {Object} options - {color, lineWidth, majorGridSize, majorColor}
     */
    static drawGrid(ctx, camera, gridSize = OBJECT_CONFIG.SNAP_SIZE, options = {}) {
        const {
            color = 'rgba(255, 255, 255, 0.1)',
            lineWidth = 1,
            majorGridSize = gridSize * 4,
            majorColor = 'rgba(255, 255, 255, 0.2)',
            majorLineWidth = 2
        } = options;
        
        const startX = Math.floor(camera.x / gridSize) * gridSize;
        const startY = Math.floor(camera.y / gridSize) * gridSize;
        const endX = camera.x + camera.width / camera.zoom;
        const endY = camera.y + camera.height / camera.zoom;
        
        // Draw minor grid
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth / camera.zoom;
        ctx.beginPath();
        
        for (let x = startX; x <= endX; x += gridSize) {
            ctx.moveTo(x, startY);
            ctx.lineTo(x, endY);
        }
        
        for (let y = startY; y <= endY; y += gridSize) {
            ctx.moveTo(startX, y);
            ctx.lineTo(endX, y);
        }
        
        ctx.stroke();
        
        // Draw major grid
        if (majorGridSize) {
            ctx.strokeStyle = majorColor;
            ctx.lineWidth = majorLineWidth / camera.zoom;
            ctx.beginPath();
            
            const majorStartX = Math.floor(camera.x / majorGridSize) * majorGridSize;
            const majorStartY = Math.floor(camera.y / majorGridSize) * majorGridSize;
            
            for (let x = majorStartX; x <= endX; x += majorGridSize) {
                ctx.moveTo(x, startY);
                ctx.lineTo(x, endY);
            }
            
            for (let y = majorStartY; y <= endY; y += majorGridSize) {
                ctx.moveTo(startX, y);
                ctx.lineTo(endX, y);
            }
            
            ctx.stroke();
        }
    }
    
    /**
     * Check if position is on grid
     * @param {number} x
     * @param {number} y
     * @param {number} gridSize
     * @returns {boolean}
     */
    static isOnGrid(x, y, gridSize = OBJECT_CONFIG.SNAP_SIZE) {
        return (x % gridSize === 0) && (y % gridSize === 0);
    }
    
    /**
     * Get nearest grid position
     * @param {number} x
     * @param {number} y
     * @param {number} gridSize
     * @returns {Object} - {x, y, distance}
     */
    static getNearestGridPosition(x, y, gridSize = OBJECT_CONFIG.SNAP_SIZE) {
        const snappedX = GridHelper.snap(x, gridSize);
        const snappedY = GridHelper.snap(y, gridSize);
        
        const dx = snappedX - x;
        const dy = snappedY - y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        return {
            x: snappedX,
            y: snappedY,
            distance
        };
    }
    
    /**
     * Get grid bounds that contain a rectangle
     * @param {Object} rect - {x, y, width, height}
     * @param {number} gridSize
     * @returns {Object} - {minX, minY, maxX, maxY} in grid cells
     */
    static getGridBounds(rect, gridSize = OBJECT_CONFIG.SNAP_SIZE) {
        return {
            minX: Math.floor(rect.x / gridSize),
            minY: Math.floor(rect.y / gridSize),
            maxX: Math.ceil((rect.x + rect.width) / gridSize),
            maxY: Math.ceil((rect.y + rect.height) / gridSize)
        };
    }
    
    /**
     * Get all grid cells that intersect a rectangle
     * @param {Object} rect
     * @param {number} gridSize
     * @returns {Array} - Array of {cellX, cellY}
     */
    static getIntersectingCells(rect, gridSize = OBJECT_CONFIG.SNAP_SIZE) {
        const bounds = GridHelper.getGridBounds(rect, gridSize);
        const cells = [];
        
        for (let x = bounds.minX; x < bounds.maxX; x++) {
            for (let y = bounds.minY; y < bounds.maxY; y++) {
                cells.push({ cellX: x, cellY: y });
            }
        }
        
        return cells;
    }
    
    /**
     * Convert world coordinates to tile coordinates
     * @param {number} x - World X
     * @param {number} y - World Y
     * @returns {Object} - {tileX, tileY}
     */
    static worldToTile(x, y) {
        return {
            tileX: Math.floor(x / MAP_CONFIG.TILE_SIZE),
            tileY: Math.floor(y / MAP_CONFIG.TILE_SIZE)
        };
    }
    
    /**
     * Convert tile coordinates to world coordinates
     * @param {number} tileX
     * @param {number} tileY
     * @returns {Object} - {x, y}
     */
    static tileToWorld(tileX, tileY) {
        return {
            x: tileX * MAP_CONFIG.TILE_SIZE,
            y: tileY * MAP_CONFIG.TILE_SIZE
        };
    }
    
    /**
     * Clamp value to range
     * @param {number} value
     * @param {number} min
     * @param {number} max
     * @returns {number}
     */
    static clamp(value, min, max) {
        return Math.max(min, Math.min(value, max));
    }
    
    /**
     * Lerp between two values
     * @param {number} a
     * @param {number} b
     * @param {number} t - 0 to 1
     * @returns {number}
     */
    static lerp(a, b, t) {
        return a + (b - a) * t;
    }
    
    /**
     * Get distance between two points
     * @param {number} x1
     * @param {number} y1
     * @param {number} x2
     * @param {number} y2
     * @returns {number}
     */
    static distance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    /**
     * Check if point is in rectangle
     * @param {number} x
     * @param {number} y
     * @param {Object} rect - {x, y, width, height}
     * @returns {boolean}
     */
    static pointInRect(x, y, rect) {
        return x >= rect.x &&
               x <= rect.x + rect.width &&
               y >= rect.y &&
               y <= rect.y + rect.height;
    }
    
    /**
     * Get rectangle from two points
     * @param {number} x1
     * @param {number} y1
     * @param {number} x2
     * @param {number} y2
     * @returns {Object} - {x, y, width, height}
     */
    static rectFromPoints(x1, y1, x2, y2) {
        return {
            x: Math.min(x1, x2),
            y: Math.min(y1, y2),
            width: Math.abs(x2 - x1),
            height: Math.abs(y2 - y1)
        };
    }
    
    /**
     * Expand rectangle by amount
     * @param {Object} rect
     * @param {number} amount
     * @returns {Object}
     */
    static expandRect(rect, amount) {
        return {
            x: rect.x - amount,
            y: rect.y - amount,
            width: rect.width + amount * 2,
            height: rect.height + amount * 2
        };
    }
    
    /**
     * Get center of rectangle
     * @param {Object} rect
     * @returns {Object} - {x, y}
     */
    static getRectCenter(rect) {
        return {
            x: rect.x + rect.width / 2,
            y: rect.y + rect.height / 2
        };
    }
    
    /**
     * Align rectangle to grid
     * @param {Object} rect
     * @param {string} alignment - 'top-left', 'center', 'bottom-right'
     * @param {number} gridSize
     * @returns {Object}
     */
    static alignToGrid(rect, alignment = 'top-left', gridSize = OBJECT_CONFIG.SNAP_SIZE) {
        switch (alignment) {
            case 'center':
                const center = GridHelper.getRectCenter(rect);
                const snappedCenter = GridHelper.snapPosition(center.x, center.y, gridSize);
                return {
                    x: snappedCenter.x - rect.width / 2,
                    y: snappedCenter.y - rect.height / 2,
                    width: rect.width,
                    height: rect.height
                };
            
            case 'bottom-right':
                return {
                    x: GridHelper.snap(rect.x + rect.width, gridSize) - rect.width,
                    y: GridHelper.snap(rect.y + rect.height, gridSize) - rect.height,
                    width: rect.width,
                    height: rect.height
                };
            
            case 'top-left':
            default:
                return {
                    x: GridHelper.snap(rect.x, gridSize),
                    y: GridHelper.snap(rect.y, gridSize),
                    width: rect.width,
                    height: rect.height
                };
        }
    }
}
