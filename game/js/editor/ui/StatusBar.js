/**
 * StatusBar Class
 * Manages the status bar display (messages, cursor position, counts, zoom)
 */
class StatusBar {
    constructor(editorApp) {
        this.app = editorApp;
        
        // DOM elements
        this.elements = {
            message: document.getElementById('status-message'),
            cursorPos: document.getElementById('cursor-pos'),
            objectCount: document.getElementById('object-count'),
            selectedCount: document.getElementById('selected-count'),
            zoomLevel: document.getElementById('zoom-level')
        };
        
        // Zoom buttons
        this.zoomButtons = {
            in: document.getElementById('zoom-in'),
            out: document.getElementById('zoom-out'),
            reset: document.getElementById('zoom-reset')
        };
        
        // Message queue for temporary messages
        this.messageQueue = [];
        this.messageTimeout = null;
        
        this.init();
    }
    
    /**
     * Initialize status bar
     */
    init() {
        this.setupZoomButtons();
        this.update();
    }
    
    /**
     * Setup zoom buttons
     */
    setupZoomButtons() {
        this.zoomButtons.in.addEventListener('click', () => {
            this.app.canvas.zoom(1.2);
            this.updateZoom();
        });
        
        this.zoomButtons.out.addEventListener('click', () => {
            this.app.canvas.zoom(0.8);
            this.updateZoom();
        });
        
        this.zoomButtons.reset.addEventListener('click', () => {
            this.app.canvas.resetZoom();
            this.updateZoom();
        });
    }
    
    /**
     * Update all status bar elements
     */
    update() {
        this.updateObjectCount();
        this.updateSelectedCount();
        this.updateZoom();
    }
    
    /**
     * Set status message
     * @param {string} message - Message to display
     * @param {number} duration - Duration in ms (0 = permanent)
     */
    setMessage(message, duration = 0) {
        this.elements.message.textContent = message;
        
        // Clear existing timeout
        if (this.messageTimeout) {
            clearTimeout(this.messageTimeout);
            this.messageTimeout = null;
        }
        
        // Set temporary message
        if (duration > 0) {
            this.messageTimeout = setTimeout(() => {
                this.elements.message.textContent = 'Ready';
            }, duration);
        }
    }
    
    /**
     * Update cursor position
     * @param {number} x - World X coordinate
     * @param {number} y - World Y coordinate
     */
    updateCursorPosition(x, y) {
        const tileX = Math.floor(x / MAP_CONFIG.TILE_SIZE);
        const tileY = Math.floor(y / MAP_CONFIG.TILE_SIZE);
        
        this.elements.cursorPos.textContent = `X: ${Math.floor(x)}, Y: ${Math.floor(y)} (Tile: ${tileX}, ${tileY})`;
    }
    
    /**
     * Update object count
     */
    updateObjectCount() {
        const count = this.app.objectManager.objects.length;
        this.elements.objectCount.textContent = `Objects: ${count}`;
    }
    
    /**
     * Update selected count
     */
    updateSelectedCount() {
        const count = this.app.objectManager.selectedObjects.length;
        this.elements.selectedCount.textContent = `Selected: ${count}`;
    }
    
    /**
     * Update zoom level
     */
    updateZoom() {
        const zoom = Math.round(this.app.canvas.camera.zoom * 100);
        this.elements.zoomLevel.textContent = `Zoom: ${zoom}%`;
        this.zoomButtons.reset.textContent = `${zoom}%`;
    }
    
    /**
     * Show temporary success message
     * @param {string} message
     */
    showSuccess(message) {
        this.setMessage(`✓ ${message}`, 3000);
    }
    
    /**
     * Show temporary error message
     * @param {string} message
     */
    showError(message) {
        this.setMessage(`✗ ${message}`, 5000);
    }
    
    /**
     * Show temporary warning message
     * @param {string} message
     */
    showWarning(message) {
        this.setMessage(`⚠ ${message}`, 4000);
    }
    
    /**
     * Show temporary info message
     * @param {string} message
     */
    showInfo(message) {
        this.setMessage(`ℹ ${message}`, 3000);
    }
    
    /**
     * Clear status message
     */
    clearMessage() {
        this.setMessage('Ready');
    }
    
    /**
     * Update camera info
     * @param {Object} camera - {x, y, zoom}
     */
    updateCameraInfo(camera) {
        // Could add camera position to status bar if needed
        // For now, just update zoom
        this.updateZoom();
    }
    
    /**
     * Show tool info
     * @param {string} toolName
     */
    showToolInfo(toolName) {
        const toolMessages = {
            select: 'Select: Click to select, drag to multi-select, Ctrl+Click to add',
            place: 'Place: Click to place object, hold Shift for multiple',
            move: 'Move: Drag selected objects to move',
            delete: 'Delete: Click object to delete, or press Delete key'
        };
        
        this.setMessage(toolMessages[toolName] || `Tool: ${toolName}`);
    }
    
    /**
     * Show statistics
     */
    showStats() {
        const stats = this.app.objectManager.getStats();
        
        let message = `Total: ${stats.total}`;
        
        if (stats.total > 0) {
            message += ` | Collidable: ${stats.collidable}`;
            message += ` | Interactable: ${stats.interactable}`;
            
            // Show type breakdown
            const types = Object.entries(stats.byType)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3)
                .map(([type, count]) => `${type}: ${count}`)
                .join(', ');
            
            if (types) {
                message += ` | ${types}`;
            }
        }
        
        this.setMessage(message, 5000);
    }
}
