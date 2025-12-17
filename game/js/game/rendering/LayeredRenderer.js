/**
 * LayeredRenderer Class
 * Handles rendering of objects in layers based on z-index
 */
class LayeredRenderer {
    constructor() {
        this.layers = new Map();
        this.defaultLayer = 50; // Player z-index
    }
    
    /**
     * Define rendering layers
     * Lower z-index renders first (behind)
     */
    static LAYERS = {
        GROUND: -100,           // Ground tiles
        GROUND_DECORATION: 0,   // Ground decorations (flowers, grass)
        WATER: 30,              // Water features (ponds)
        OBJECTS_BACK: 40,       // Objects behind player (rocks, low items)
        PLAYER: 50,             // Player layer
        OBJECTS_MID: 55,        // Mid-height objects (trees)
        OBJECTS_FRONT: 60,      // Tall objects (houses)
        EFFECTS: 100,           // Visual effects
        UI: 1000                // UI elements
    };
    
    /**
     * Sort objects by z-index
     * @param {Array} objects - Array of objects with zIndex property
     * @returns {Array} - Sorted array
     */
    static sortByZIndex(objects) {
        return [...objects].sort((a, b) => {
            // Primary sort: z-index
            if (a.zIndex !== b.zIndex) {
                return a.zIndex - b.zIndex;
            }
            // Secondary sort: y position (objects lower on screen render in front)
            if (a.y !== b.y) {
                return a.y - b.y;
            }
            // Tertiary sort: x position (for consistency)
            return a.x - b.x;
        });
    }
    
    /**
     * Render objects in layers
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Camera} camera - Camera for viewport
     * @param {Array} objects - Objects to render
     * @param {Object} player - Player object
     */
    static renderLayered(ctx, camera, objects, player = null) {
        // Combine all objects
        const allObjects = [...objects];
        if (player) {
            allObjects.push(player);
        }
        
        // Sort by z-index and position
        const sorted = LayeredRenderer.sortByZIndex(allObjects);
        
        // Render each object
        for (const obj of sorted) {
            if (typeof obj.render === 'function') {
                obj.render(ctx, camera);
            }
        }
    }
    
    /**
     * Render objects in specific layer range
     * @param {CanvasRenderingContext2D} ctx
     * @param {Camera} camera
     * @param {Array} objects
     * @param {number} minZ - Minimum z-index
     * @param {number} maxZ - Maximum z-index
     */
    static renderRange(ctx, camera, objects, minZ, maxZ) {
        const filtered = objects.filter(obj => 
            obj.zIndex >= minZ && obj.zIndex <= maxZ
        );
        const sorted = LayeredRenderer.sortByZIndex(filtered);
        
        for (const obj of sorted) {
            if (typeof obj.render === 'function') {
                obj.render(ctx, camera);
            }
        }
    }
    
    /**
     * Render in split layers (objects behind and in front of player)
     * @param {CanvasRenderingContext2D} ctx
     * @param {Camera} camera
     * @param {Array} objects - Game objects
     * @param {Object} player - Player object
     */
    static renderSplit(ctx, camera, objects, player) {
        const playerZ = player.zIndex || LayeredRenderer.LAYERS.PLAYER;
        
        // Render objects behind player
        LayeredRenderer.renderRange(ctx, camera, objects, -Infinity, playerZ - 1);
        
        // Render player
        if (typeof player.render === 'function') {
            player.render(ctx, camera);
        }
        
        // Render objects in front of player
        LayeredRenderer.renderRange(ctx, camera, objects, playerZ + 1, Infinity);
    }
    
    /**
     * Get objects in viewport sorted by layer
     * @param {Array} objects
     * @param {Camera} camera
     * @returns {Array}
     */
    static getVisibleObjects(objects, camera) {
        return objects.filter(obj => {
            // Check if object is in viewport
            const screenX = obj.x - camera.x;
            const screenY = obj.y - camera.y;
            
            return !(screenX + obj.width < 0 || 
                     screenX > camera.width ||
                     screenY + obj.height < 0 || 
                     screenY > camera.height);
        });
    }
    
    /**
     * Organize objects into discrete layers
     * @param {Array} objects
     * @returns {Map} - Map of layer to objects array
     */
    static organizeLayers(objects) {
        const layers = new Map();
        
        for (const obj of objects) {
            const zIndex = obj.zIndex || 0;
            if (!layers.has(zIndex)) {
                layers.set(zIndex, []);
            }
            layers.get(zIndex).push(obj);
        }
        
        return layers;
    }
    
    /**
     * Debug: Draw layer boundaries
     * @param {CanvasRenderingContext2D} ctx
     * @param {Camera} camera
     */
    static debugDrawLayers(ctx, camera) {
        const layers = Object.entries(LayeredRenderer.LAYERS);
        
        ctx.save();
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        
        let y = 20;
        for (const [name, zIndex] of layers) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(10, y - 12, 200, 16);
            
            ctx.fillStyle = '#fff';
            ctx.fillText(`${name}: z=${zIndex}`, 15, y);
            y += 20;
        }
        
        ctx.restore();
    }
    
    /**
     * Get layer name for z-index
     * @param {number} zIndex
     * @returns {string}
     */
    static getLayerName(zIndex) {
        const layers = Object.entries(LayeredRenderer.LAYERS);
        
        // Find closest layer
        let closestName = 'CUSTOM';
        let closestDiff = Infinity;
        
        for (const [name, value] of layers) {
            const diff = Math.abs(value - zIndex);
            if (diff < closestDiff) {
                closestDiff = diff;
                closestName = name;
            }
        }
        
        return closestName;
    }
}
