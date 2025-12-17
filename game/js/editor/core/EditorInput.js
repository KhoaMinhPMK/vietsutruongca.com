/**
 * EditorInput Class
 * Handles all mouse and keyboard input for the editor
 * Delegates events to appropriate handlers (tools, canvas, etc.)
 */
class EditorInput {
    constructor(editorCanvas, editorApp) {
        this.app = editorApp;
        this.canvas = editorCanvas;
        
        // Mouse state
        this.mouseDown = false;
        this.mouseButton = -1;
        this.mouseX = 0;
        this.mouseY = 0;
        this.worldX = 0;
        this.worldY = 0;
        this.lastWorldX = 0;
        this.lastWorldY = 0;
        
        // Keyboard state
        this.keysPressed = new Set();
        
        // Drag state
        this.isDragging = false;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.dragThreshold = 5; // pixels before considering it a drag
        
        // Double click detection
        this.lastClickTime = 0;
        this.doubleClickDelay = 300; // ms
        
        // Pan with middle mouse or space+drag
        this.isPanningWithMouse = false;
        this.spacePressed = false;
        
        this.setupListeners();
    }
    
    /**
     * Setup all event listeners
     */
    setupListeners() {
        const canvas = this.canvas.canvas;
        
        // Mouse events
        canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));
        canvas.addEventListener('wheel', (e) => this.onWheel(e), { passive: false });
        canvas.addEventListener('contextmenu', (e) => e.preventDefault());
        
        // Keyboard events
        window.addEventListener('keydown', (e) => this.onKeyDown(e));
        window.addEventListener('keyup', (e) => this.onKeyUp(e));
        
        // Prevent default behaviors
        canvas.addEventListener('dragstart', (e) => e.preventDefault());
    }
    
    /**
     * Mouse down event
     */
    onMouseDown(e) {
        e.preventDefault();
        
        this.mouseDown = true;
        this.mouseButton = e.button;
        this.updateMousePosition(e);
        
        this.dragStartX = this.mouseX;
        this.dragStartY = this.mouseY;
        this.isDragging = false;
        
        // Check for double click
        const now = Date.now();
        const isDoubleClick = (now - this.lastClickTime) < this.doubleClickDelay;
        this.lastClickTime = now;
        
        // Middle mouse button = pan
        if (e.button === 1) {
            this.isPanningWithMouse = true;
            this.canvas.startPan(this.mouseX, this.mouseY);
            return;
        }
        
        // Space + left mouse = pan
        if (this.spacePressed && e.button === 0) {
            this.isPanningWithMouse = true;
            this.canvas.startPan(this.mouseX, this.mouseY);
            return;
        }
        
        // Delegate to current tool
        if (this.app.currentTool) {
            if (isDoubleClick && this.app.currentTool.onDoubleClick) {
                this.app.currentTool.onDoubleClick(this.worldX, this.worldY, e);
            } else if (this.app.currentTool.onMouseDown) {
                this.app.currentTool.onMouseDown(this.worldX, this.worldY, e);
            }
        }
    }
    
    /**
     * Mouse move event
     */
    onMouseMove(e) {
        this.updateMousePosition(e);
        
        // Check if we're dragging
        if (this.mouseDown && !this.isDragging) {
            const dx = this.mouseX - this.dragStartX;
            const dy = this.mouseY - this.dragStartY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > this.dragThreshold) {
                this.isDragging = true;
                
                // Notify tool of drag start
                if (this.app.currentTool && this.app.currentTool.onDragStart) {
                    this.app.currentTool.onDragStart(this.worldX, this.worldY, e);
                }
            }
        }
        
        // Handle panning
        if (this.isPanningWithMouse) {
            this.canvas.updatePan(this.mouseX, this.mouseY);
            return;
        }
        
        // Delegate to current tool
        if (this.app.currentTool) {
            if (this.isDragging && this.app.currentTool.onDrag) {
                const worldDragStartX = this.dragStartX / this.canvas.camera.zoom + this.canvas.camera.x;
                const worldDragStartY = this.dragStartY / this.canvas.camera.zoom + this.canvas.camera.y;
                this.app.currentTool.onDrag(this.worldX, this.worldY, worldDragStartX, worldDragStartY, e);
            } else if (this.app.currentTool.onMouseMove) {
                this.app.currentTool.onMouseMove(this.worldX, this.worldY, e);
            }
        }
        
        // Update status bar
        this.updateStatusBar();
    }
    
    /**
     * Mouse up event
     */
    onMouseUp(e) {
        this.updateMousePosition(e);
        
        const wasDragging = this.isDragging;
        
        // Stop panning
        if (this.isPanningWithMouse) {
            this.isPanningWithMouse = false;
            this.canvas.stopPan();
        }
        
        // Delegate to current tool
        if (this.app.currentTool) {
            if (wasDragging && this.app.currentTool.onDragEnd) {
                this.app.currentTool.onDragEnd(this.worldX, this.worldY, e);
            } else if (!wasDragging && this.app.currentTool.onClick) {
                this.app.currentTool.onClick(this.worldX, this.worldY, e);
            }
            
            if (this.app.currentTool.onMouseUp) {
                this.app.currentTool.onMouseUp(this.worldX, this.worldY, e);
            }
        }
        
        this.mouseDown = false;
        this.mouseButton = -1;
        this.isDragging = false;
    }
    
    /**
     * Mouse wheel event
     */
    onWheel(e) {
        e.preventDefault();
        
        const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
        this.canvas.zoom(zoomFactor, this.mouseX, this.mouseY);
        
        // Update zoom display
        const zoomPercent = Math.round(this.canvas.camera.zoom * 100);
        document.getElementById('zoom-level').textContent = `Zoom: ${zoomPercent}%`;
    }
    
    /**
     * Key down event
     */
    onKeyDown(e) {
        this.keysPressed.add(e.key.toLowerCase());
        
        // Space key for panning
        if (e.key === ' ') {
            this.spacePressed = true;
            this.canvas.canvas.style.cursor = 'grab';
            e.preventDefault();
            return;
        }
        
        // Tool shortcuts
        if (e.key === 'v' || e.key === 'V') {
            this.app.setTool('select');
            e.preventDefault();
        } else if (e.key === 'p' || e.key === 'P') {
            this.app.setTool('place');
            e.preventDefault();
        } else if (e.key === 'm' || e.key === 'M') {
            this.app.setTool('move');
            e.preventDefault();
        } else if (e.key === 'd' || e.key === 'D') {
            this.app.setTool('delete');
            e.preventDefault();
        }
        
        // Delete selected
        if (e.key === 'Delete') {
            this.app.deleteSelected();
            e.preventDefault();
        }
        
        // Undo/Redo
        if (e.ctrlKey && e.key === 'z') {
            this.app.undo();
            e.preventDefault();
        }
        if (e.ctrlKey && e.key === 'y') {
            this.app.redo();
            e.preventDefault();
        }
        
        // Save
        if (e.ctrlKey && e.key === 's') {
            this.app.saveMap();
            e.preventDefault();
        }
        
        // Select all
        if (e.ctrlKey && e.key === 'a') {
            this.selectAll();
            e.preventDefault();
        }
        
        // Copy/Paste
        if (e.ctrlKey && e.key === 'c') {
            this.copy();
            e.preventDefault();
        }
        if (e.ctrlKey && e.key === 'v') {
            this.paste();
            e.preventDefault();
        }
        
        // WASD panning
        this.handleKeyboardPan();
        
        // Delegate to tool
        if (this.app.currentTool && this.app.currentTool.onKeyDown) {
            this.app.currentTool.onKeyDown(e);
        }
    }
    
    /**
     * Key up event
     */
    onKeyUp(e) {
        this.keysPressed.delete(e.key.toLowerCase());
        
        if (e.key === ' ') {
            this.spacePressed = false;
            if (!this.isPanningWithMouse) {
                this.canvas.canvas.style.cursor = 'crosshair';
            }
        }
        
        // Delegate to tool
        if (this.app.currentTool && this.app.currentTool.onKeyUp) {
            this.app.currentTool.onKeyUp(e);
        }
    }
    
    /**
     * Handle WASD keyboard panning
     */
    handleKeyboardPan() {
        let dx = 0;
        let dy = 0;
        
        if (this.keysPressed.has('w')) dy = -1;
        if (this.keysPressed.has('s')) dy = 1;
        if (this.keysPressed.has('a')) dx = -1;
        if (this.keysPressed.has('d')) dx = 1;
        
        if (dx !== 0 || dy !== 0) {
            this.canvas.panByKeys(dx, dy);
        }
    }
    
    /**
     * Update mouse position and world coordinates
     */
    updateMousePosition(e) {
        const rect = this.canvas.canvas.getBoundingClientRect();
        this.mouseX = e.clientX - rect.left;
        this.mouseY = e.clientY - rect.top;
        
        const world = this.canvas.screenToWorld(this.mouseX, this.mouseY);
        this.lastWorldX = this.worldX;
        this.lastWorldY = this.worldY;
        this.worldX = world.x;
        this.worldY = world.y;
    }
    
    /**
     * Update status bar with cursor position
     */
    updateStatusBar() {
        const x = Math.floor(this.worldX);
        const y = Math.floor(this.worldY);
        document.getElementById('cursor-pos').textContent = `X: ${x}, Y: ${y}`;
        
        // Show tile coordinates
        const tileX = Math.floor(this.worldX / MAP_CONFIG.TILE_SIZE);
        const tileY = Math.floor(this.worldY / MAP_CONFIG.TILE_SIZE);
        document.getElementById('cursor-pos').textContent = `X: ${x}, Y: ${y} (Tile: ${tileX}, ${tileY})`;
    }
    
    /**
     * Select all objects
     */
    selectAll() {
        this.app.objectManager.selectedObjects = [...this.app.objectManager.objects];
        this.app.updateSelectedCount();
    }
    
    /**
     * Copy selected objects
     */
    copy() {
        if (this.app.objectManager.selectedObjects.length > 0) {
            this.app.clipboard = this.app.objectManager.selectedObjects.map(obj => obj.toJSON());
            this.app.updateStatus(`Copied ${this.app.clipboard.length} objects`);
        }
    }
    
    /**
     * Paste objects
     */
    paste() {
        if (this.app.clipboard && this.app.clipboard.length > 0) {
            this.app.objectManager.clearSelection();
            
            for (const objData of this.app.clipboard) {
                const newObj = GameObject.fromJSON(objData);
                // Offset position slightly
                newObj.x += 32;
                newObj.y += 32;
                this.app.objectManager.add(newObj);
                this.app.objectManager.select(newObj, true);
            }
            
            this.app.updateStatus(`Pasted ${this.app.clipboard.length} objects`);
            this.app.updateObjectCount();
            this.app.updateSelectedCount();
        }
    }
    
    /**
     * Check if key is pressed
     */
    isKeyPressed(key) {
        return this.keysPressed.has(key.toLowerCase());
    }
    
    /**
     * Get snapped position
     */
    getSnappedPosition(x, y) {
        if (this.app.state.snapEnabled) {
            const snapSize = OBJECT_CONFIG.SNAP_SIZE;
            return {
                x: Math.round(x / snapSize) * snapSize,
                y: Math.round(y / snapSize) * snapSize
            };
        }
        return { x, y };
    }
}
