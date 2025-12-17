/**
 * GameObjectManager Class
 * Manages all game objects (adding, removing, updating, rendering)
 */
class GameObjectManager {
    constructor() {
        this.objects = []; // Array of GameObject instances
        this.objectsById = {}; // Quick lookup by ID
        this.selectedObjects = []; // For editor use
    }
    
    /**
     * Add object to manager
     * @param {GameObject} obj - GameObject instance
     */
    add(obj) {
        if (!(obj instanceof GameObject)) {
            console.error('Can only add GameObject instances');
            return false;
        }
        
        // Check if ID already exists
        if (this.objectsById[obj.id]) {
            console.warn(`Object with ID ${obj.id} already exists`);
            return false;
        }
        
        this.objects.push(obj);
        this.objectsById[obj.id] = obj;
        return true;
    }
    
    /**
     * Remove object by ID or reference
     * @param {string|GameObject} objOrId - Object ID or GameObject instance
     */
    remove(objOrId) {
        const id = typeof objOrId === 'string' ? objOrId : objOrId.id;
        const index = this.objects.findIndex(obj => obj.id === id);
        
        if (index === -1) {
            console.warn(`Object with ID ${id} not found`);
            return false;
        }
        
        this.objects.splice(index, 1);
        delete this.objectsById[id];
        
        // Remove from selection if selected
        const selIndex = this.selectedObjects.findIndex(obj => obj.id === id);
        if (selIndex !== -1) {
            this.selectedObjects.splice(selIndex, 1);
        }
        
        return true;
    }
    
    /**
     * Get object by ID
     * @param {string} id - Object ID
     * @returns {GameObject|null}
     */
    getById(id) {
        return this.objectsById[id] || null;
    }
    
    /**
     * Get all objects of a specific type
     * @param {string} type - Object type
     * @returns {GameObject[]}
     */
    getByType(type) {
        return this.objects.filter(obj => obj.type === type);
    }
    
    /**
     * Get objects at specific position
     * @param {number} x - World X coordinate
     * @param {number} y - World Y coordinate
     * @returns {GameObject[]}
     */
    getAtPosition(x, y) {
        return this.objects.filter(obj => obj.containsPoint(x, y));
    }
    
    /**
     * Get all objects in a rectangular area
     * @param {number} x - Top-left X
     * @param {number} y - Top-left Y
     * @param {number} width - Rectangle width
     * @param {number} height - Rectangle height
     * @returns {GameObject[]}
     */
    getInArea(x, y, width, height) {
        return this.objects.filter(obj => {
            const bounds = obj.getBounds();
            return !(bounds.x + bounds.width < x || 
                     bounds.x > x + width ||
                     bounds.y + bounds.height < y || 
                     bounds.y > y + height);
        });
    }
    
    /**
     * Clear all objects
     */
    clear() {
        this.objects = [];
        this.objectsById = {};
        this.selectedObjects = [];
    }
    
    /**
     * Update all objects
     * @param {number} deltaTime - Time since last update in ms
     */
    update(deltaTime) {
        for (const obj of this.objects) {
            obj.update(deltaTime);
        }
    }
    
    /**
     * Render all objects sorted by z-index
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Camera} camera - Camera for viewport
     */
    render(ctx, camera) {
        // Sort by z-index (lower renders first)
        const sorted = [...this.objects].sort((a, b) => a.zIndex - b.zIndex);
        
        for (const obj of sorted) {
            obj.render(ctx, camera);
        }
    }
    
    /**
     * Render objects in specific z-index range
     * @param {CanvasRenderingContext2D} ctx
     * @param {Camera} camera
     * @param {number} minZ - Minimum z-index (inclusive)
     * @param {number} maxZ - Maximum z-index (inclusive)
     */
    renderRange(ctx, camera, minZ, maxZ) {
        const filtered = this.objects.filter(obj => obj.zIndex >= minZ && obj.zIndex <= maxZ);
        const sorted = filtered.sort((a, b) => a.zIndex - b.zIndex);
        
        for (const obj of sorted) {
            obj.render(ctx, camera);
        }
    }
    
    /**
     * Check collision with player
     * @param {Object} playerBounds - {x, y, width, height}
     * @returns {GameObject[]} - Array of colliding objects
     */
    checkCollisions(playerBounds) {
        return this.objects.filter(obj => {
            if (!obj.collidable) return false;
            
            const bounds = obj.getBounds();
            return !(playerBounds.x + playerBounds.width <= bounds.x ||
                     playerBounds.x >= bounds.x + bounds.width ||
                     playerBounds.y + playerBounds.height <= bounds.y ||
                     playerBounds.y >= bounds.y + bounds.height);
        });
    }
    
    /**
     * Get interactable objects near player
     * @param {Object} playerBounds - {x, y, width, height}
     * @param {number} range - Interaction range in pixels
     * @returns {GameObject[]}
     */
    getInteractableNear(playerBounds, range = 32) {
        return this.objects.filter(obj => {
            if (!obj.interactable) return false;
            
            const bounds = obj.getBounds();
            const playerCenterX = playerBounds.x + playerBounds.width / 2;
            const playerCenterY = playerBounds.y + playerBounds.height / 2;
            const objCenterX = bounds.x + bounds.width / 2;
            const objCenterY = bounds.y + bounds.height / 2;
            
            const distance = Math.sqrt(
                Math.pow(playerCenterX - objCenterX, 2) +
                Math.pow(playerCenterY - objCenterY, 2)
            );
            
            return distance <= range;
        });
    }
    
    /**
     * Load objects from JSON data
     * @param {Object} data - JSON data with objects array
     */
    loadFromJSON(data) {
        this.clear();
        
        if (!data || !Array.isArray(data.objects)) {
            console.error('Invalid JSON data format');
            return false;
        }
        
        let treeCount = 0;
        for (const objData of data.objects) {
            let obj;
            // Create appropriate instance based on type
            if (objData.type && objData.type.startsWith('npc')) {
                obj = NPC.fromJSON(objData);
            } else if (objData.type === 'tree0' && objData.stumpPath) {
                // Create InteractiveTree for tree0 objects
                obj = InteractiveTree.fromJSON(objData);
                treeCount++;
            } else {
                obj = GameObject.fromJSON(objData);
            }
            this.add(obj);
        }
        
        console.log(`Loaded ${this.objects.length} objects from JSON (${treeCount} interactive trees)`);
        return true;
    }
    
    /**
     * Save objects to JSON format
     * @returns {Object}
     */
    saveToJSON() {
        return {
            version: '1.0',
            mapSize: {
                width: MAP_CONFIG.MAP_WIDTH,
                height: MAP_CONFIG.MAP_HEIGHT
            },
            objectCount: this.objects.length,
            objects: this.objects.map(obj => obj.toJSON())
        };
    }
    
    /**
     * Get statistics about objects
     * @returns {Object}
     */
    getStats() {
        const stats = {
            total: this.objects.length,
            byType: {},
            collidable: 0,
            interactable: 0,
            zIndexRange: { min: Infinity, max: -Infinity }
        };
        
        for (const obj of this.objects) {
            // Count by type
            stats.byType[obj.type] = (stats.byType[obj.type] || 0) + 1;
            
            // Count collidable
            if (obj.collidable) stats.collidable++;
            
            // Count interactable
            if (obj.interactable) stats.interactable++;
            
            // Z-index range
            if (obj.zIndex < stats.zIndexRange.min) stats.zIndexRange.min = obj.zIndex;
            if (obj.zIndex > stats.zIndexRange.max) stats.zIndexRange.max = obj.zIndex;
        }
        
        return stats;
    }
    
    /**
     * Select object (for editor)
     * @param {GameObject} obj
     * @param {boolean} multiSelect - Add to selection instead of replacing
     */
    select(obj, multiSelect = false) {
        if (!multiSelect) {
            this.selectedObjects = [];
        }
        
        if (!this.selectedObjects.includes(obj)) {
            this.selectedObjects.push(obj);
        }
    }
    
    /**
     * Deselect object (for editor)
     * @param {GameObject} obj
     */
    deselect(obj) {
        const index = this.selectedObjects.indexOf(obj);
        if (index !== -1) {
            this.selectedObjects.splice(index, 1);
        }
    }
    
    /**
     * Clear selection (for editor)
     */
    clearSelection() {
        this.selectedObjects = [];
    }
    
    /**
     * Get selected objects (for editor)
     * @returns {GameObject[]}
     */
    getSelected() {
        return this.selectedObjects;
    }
}
