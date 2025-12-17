/**
 * CollisionDetector Class
 * Handles collision detection for game objects
 */
class CollisionDetector {
    /**
     * Check AABB (Axis-Aligned Bounding Box) collision between two rectangles
     * @param {Object} rect1 - {x, y, width, height}
     * @param {Object} rect2 - {x, y, width, height}
     * @returns {boolean} - True if colliding
     */
    static checkAABB(rect1, rect2) {
        return !(
            rect1.x + rect1.width <= rect2.x ||
            rect1.x >= rect2.x + rect2.width ||
            rect1.y + rect1.height <= rect2.y ||
            rect1.y >= rect2.y + rect2.height
        );
    }
    
    /**
     * Check if a point is inside a rectangle
     * @param {number} x - Point X
     * @param {number} y - Point Y
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
     * Check circle collision
     * @param {Object} circle1 - {x, y, radius}
     * @param {Object} circle2 - {x, y, radius}
     * @returns {boolean}
     */
    static checkCircle(circle1, circle2) {
        const dx = circle1.x - circle2.x;
        const dy = circle1.y - circle2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < circle1.radius + circle2.radius;
    }
    
    /**
     * Get collision overlap amount
     * @param {Object} rect1
     * @param {Object} rect2
     * @returns {Object} - {x, y} overlap amounts (0 if no collision)
     */
    static getOverlap(rect1, rect2) {
        if (!CollisionDetector.checkAABB(rect1, rect2)) {
            return { x: 0, y: 0 };
        }
        
        const overlapX = Math.min(
            rect1.x + rect1.width - rect2.x,
            rect2.x + rect2.width - rect1.x
        );
        
        const overlapY = Math.min(
            rect1.y + rect1.height - rect2.y,
            rect2.y + rect2.height - rect1.y
        );
        
        return { x: overlapX, y: overlapY };
    }
    
    /**
     * Resolve collision by pushing rect1 out of rect2
     * @param {Object} rect1 - Moving object {x, y, width, height}
     * @param {Object} rect2 - Static object {x, y, width, height}
     * @returns {Object} - New position {x, y} for rect1
     */
    static resolveCollision(rect1, rect2) {
        const overlap = CollisionDetector.getOverlap(rect1, rect2);
        
        if (overlap.x === 0 && overlap.y === 0) {
            return { x: rect1.x, y: rect1.y };
        }
        
        // Push out in direction of smallest overlap
        const newPos = { x: rect1.x, y: rect1.y };
        
        if (overlap.x < overlap.y) {
            // Push horizontally
            if (rect1.x < rect2.x) {
                newPos.x = rect2.x - rect1.width;
            } else {
                newPos.x = rect2.x + rect2.width;
            }
        } else {
            // Push vertically
            if (rect1.y < rect2.y) {
                newPos.y = rect2.y - rect1.height;
            } else {
                newPos.y = rect2.y + rect2.height;
            }
        }
        
        return newPos;
    }
    
    /**
     * Check if movement from one position to another would collide
     * @param {Object} fromRect - Starting position {x, y, width, height}
     * @param {Object} toRect - Target position {x, y, width, height}
     * @param {Object} obstacle - Obstacle {x, y, width, height}
     * @returns {boolean}
     */
    static checkMovementCollision(fromRect, toRect, obstacle) {
        // Simple swept AABB
        const minX = Math.min(fromRect.x, toRect.x);
        const maxX = Math.max(fromRect.x + fromRect.width, toRect.x + toRect.width);
        const minY = Math.min(fromRect.y, toRect.y);
        const maxY = Math.max(fromRect.y + fromRect.height, toRect.y + toRect.height);
        
        const sweptRect = {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY
        };
        
        return CollisionDetector.checkAABB(sweptRect, obstacle);
    }
    
    /**
     * Find all collisions with a list of objects
     * @param {Object} rect - {x, y, width, height}
     * @param {Array} objects - Array of objects with getBounds() method
     * @returns {Array} - Array of colliding objects
     */
    static checkMultiple(rect, objects) {
        return objects.filter(obj => {
            const bounds = obj.getBounds ? obj.getBounds() : obj;
            return CollisionDetector.checkAABB(rect, bounds);
        });
    }
    
    /**
     * Get distance between two points
     * @param {number} x1
     * @param {number} y1
     * @param {number} x2
     * @param {number} y2
     * @returns {number}
     */
    static getDistance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    /**
     * Get distance between centers of two rectangles
     * @param {Object} rect1
     * @param {Object} rect2
     * @returns {number}
     */
    static getDistanceBetween(rect1, rect2) {
        const center1X = rect1.x + rect1.width / 2;
        const center1Y = rect1.y + rect1.height / 2;
        const center2X = rect2.x + rect2.width / 2;
        const center2Y = rect2.y + rect2.height / 2;
        
        return CollisionDetector.getDistance(center1X, center1Y, center2X, center2Y);
    }
    
    /**
     * Check if rect is inside bounds
     * @param {Object} rect
     * @param {Object} bounds
     * @returns {boolean}
     */
    static isInsideBounds(rect, bounds) {
        return rect.x >= bounds.x &&
               rect.y >= bounds.y &&
               rect.x + rect.width <= bounds.x + bounds.width &&
               rect.y + rect.height <= bounds.y + bounds.height;
    }
    
    /**
     * Clamp rect to stay inside bounds
     * @param {Object} rect - {x, y, width, height}
     * @param {Object} bounds - {x, y, width, height}
     * @returns {Object} - Clamped position {x, y}
     */
    static clampToBounds(rect, bounds) {
        const x = Math.max(
            bounds.x,
            Math.min(rect.x, bounds.x + bounds.width - rect.width)
        );
        
        const y = Math.max(
            bounds.y,
            Math.min(rect.y, bounds.y + bounds.height - rect.height)
        );
        
        return { x, y };
    }
    
    /**
     * Get collision direction
     * @param {Object} rect1 - Moving object
     * @param {Object} rect2 - Static object
     * @returns {string} - 'top', 'bottom', 'left', 'right', or 'none'
     */
    static getCollisionSide(rect1, rect2) {
        if (!CollisionDetector.checkAABB(rect1, rect2)) {
            return 'none';
        }
        
        const overlap = CollisionDetector.getOverlap(rect1, rect2);
        
        if (overlap.x < overlap.y) {
            // Horizontal collision
            return rect1.x < rect2.x ? 'right' : 'left';
        } else {
            // Vertical collision
            return rect1.y < rect2.y ? 'bottom' : 'top';
        }
    }
    
    /**
     * Broad phase collision detection using spatial grid
     * @param {Array} objects - All objects
     * @param {number} cellSize - Grid cell size
     * @returns {Map} - Grid map
     */
    static buildSpatialGrid(objects, cellSize = 64) {
        const grid = new Map();
        
        for (const obj of objects) {
            const bounds = obj.getBounds ? obj.getBounds() : obj;
            
            const minCellX = Math.floor(bounds.x / cellSize);
            const maxCellX = Math.floor((bounds.x + bounds.width) / cellSize);
            const minCellY = Math.floor(bounds.y / cellSize);
            const maxCellY = Math.floor((bounds.y + bounds.height) / cellSize);
            
            for (let cx = minCellX; cx <= maxCellX; cx++) {
                for (let cy = minCellY; cy <= maxCellY; cy++) {
                    const key = `${cx},${cy}`;
                    if (!grid.has(key)) {
                        grid.set(key, []);
                    }
                    grid.get(key).push(obj);
                }
            }
        }
        
        return grid;
    }
    
    /**
     * Query spatial grid for potential collisions
     * @param {Object} rect
     * @param {Map} grid
     * @param {number} cellSize
     * @returns {Array}
     */
    static querySpatialGrid(rect, grid, cellSize = 64) {
        const minCellX = Math.floor(rect.x / cellSize);
        const maxCellX = Math.floor((rect.x + rect.width) / cellSize);
        const minCellY = Math.floor(rect.y / cellSize);
        const maxCellY = Math.floor((rect.y + rect.height) / cellSize);
        
        const potentialCollisions = new Set();
        
        for (let cx = minCellX; cx <= maxCellX; cx++) {
            for (let cy = minCellY; cy <= maxCellY; cy++) {
                const key = `${cx},${cy}`;
                const cellObjects = grid.get(key);
                if (cellObjects) {
                    cellObjects.forEach(obj => potentialCollisions.add(obj));
                }
            }
        }
        
        return Array.from(potentialCollisions);
    }
}
