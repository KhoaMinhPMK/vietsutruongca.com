/**
 * SelectTool Class
 * Tool for selecting objects on the canvas
 * Supports: single click, multi-select with Ctrl, drag selection box
 */
class SelectTool {
    constructor(editorApp) {
        this.app = editorApp;
        this.name = 'select';
        
        // Selection box for drag selection
        this.selectionBox = null;
        this.isDragging = false;
    }
    
    /**
     * Mouse down event
     */
    onMouseDown(worldX, worldY, e) {
        // Check if clicking on an object
        const clickedObjects = this.app.objectManager.getAtPosition(worldX, worldY);
        
        if (clickedObjects.length > 0) {
            // Clicked on object(s)
            const topObject = this.getTopObject(clickedObjects);
            
            if (e.ctrlKey) {
                // Ctrl + click = toggle selection
                if (this.app.objectManager.selectedObjects.includes(topObject)) {
                    this.app.objectManager.deselect(topObject);
                } else {
                    this.app.objectManager.select(topObject, true);
                }
            } else {
                // Normal click = select only this object
                if (!this.app.objectManager.selectedObjects.includes(topObject)) {
                    this.app.objectManager.clearSelection();
                    this.app.objectManager.select(topObject, false);
                }
            }
            
            this.updateUI();
        } else {
            // Clicked on empty space
            if (!e.ctrlKey) {
                this.app.objectManager.clearSelection();
                this.updateUI();
            }
            
            // Start drag selection box
            this.selectionBox = {
                startX: worldX,
                startY: worldY,
                endX: worldX,
                endY: worldY
            };
        }
    }
    
    /**
     * Drag event (selection box)
     */
    onDrag(worldX, worldY, dragStartX, dragStartY, e) {
        if (this.selectionBox) {
            this.isDragging = true;
            this.selectionBox.endX = worldX;
            this.selectionBox.endY = worldY;
        }
    }
    
    /**
     * Drag end event
     */
    onDragEnd(worldX, worldY, e) {
        if (this.selectionBox && this.isDragging) {
            // Calculate selection rectangle
            const rect = GridHelper.rectFromPoints(
                this.selectionBox.startX,
                this.selectionBox.startY,
                this.selectionBox.endX,
                this.selectionBox.endY
            );
            
            // Find objects in selection
            const objectsInBox = this.app.objectManager.getInArea(
                rect.x,
                rect.y,
                rect.width,
                rect.height
            );
            
            if (objectsInBox.length > 0) {
                if (e.ctrlKey) {
                    // Add to selection
                    objectsInBox.forEach(obj => {
                        this.app.objectManager.select(obj, true);
                    });
                } else {
                    // Replace selection
                    this.app.objectManager.clearSelection();
                    objectsInBox.forEach(obj => {
                        this.app.objectManager.select(obj, true);
                    });
                }
                
                this.app.statusBar.showSuccess(`Selected ${objectsInBox.length} objects`);
            }
            
            this.updateUI();
        }
        
        this.selectionBox = null;
        this.isDragging = false;
    }
    
    /**
     * Double click event - edit properties
     */
    onDoubleClick(worldX, worldY, e) {
        const clickedObjects = this.app.objectManager.getAtPosition(worldX, worldY);
        
        if (clickedObjects.length > 0) {
            const topObject = this.getTopObject(clickedObjects);
            this.app.objectManager.clearSelection();
            this.app.objectManager.select(topObject, false);
            this.updateUI();
            
            // Focus on properties panel
            this.app.statusBar.showInfo('Edit properties in the sidebar');
        }
    }
    
    /**
     * Mouse move event (for hover preview)
     */
    onMouseMove(worldX, worldY, e) {
        // Could show hover highlight here
    }
    
    /**
     * Key down event
     */
    onKeyDown(e) {
        // Arrow keys to move selection
        if (this.app.objectManager.selectedObjects.length > 0) {
            let dx = 0, dy = 0;
            const step = e.shiftKey ? 1 : this.app.state.snapEnabled ? OBJECT_CONFIG.SNAP_SIZE : 1;
            
            if (e.key === 'ArrowLeft') { dx = -step; e.preventDefault(); }
            if (e.key === 'ArrowRight') { dx = step; e.preventDefault(); }
            if (e.key === 'ArrowUp') { dy = -step; e.preventDefault(); }
            if (e.key === 'ArrowDown') { dy = step; e.preventDefault(); }
            
            if (dx !== 0 || dy !== 0) {
                this.app.objectManager.selectedObjects.forEach(obj => {
                    obj.x += dx;
                    obj.y += dy;
                });
                this.app.propertiesPanel.refresh();
            }
        }
    }
    
    /**
     * Render tool overlay
     */
    render(ctx, camera) {
        // Draw selection box if dragging
        if (this.selectionBox && this.isDragging) {
            const rect = GridHelper.rectFromPoints(
                this.selectionBox.startX,
                this.selectionBox.startY,
                this.selectionBox.endX,
                this.selectionBox.endY
            );
            
            ctx.save();
            
            // Draw selection box
            ctx.strokeStyle = '#00ff00';
            ctx.lineWidth = 2 / camera.zoom;
            ctx.setLineDash([5 / camera.zoom, 5 / camera.zoom]);
            ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
            
            // Fill with transparent color
            ctx.fillStyle = 'rgba(0, 255, 0, 0.1)';
            ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
            
            ctx.restore();
        }
    }
    
    /**
     * Get top object from list (highest z-index)
     */
    getTopObject(objects) {
        return objects.reduce((top, obj) => {
            if (!top || obj.zIndex > top.zIndex) return obj;
            if (obj.zIndex === top.zIndex && obj.y > top.y) return obj;
            return top;
        }, null);
    }
    
    /**
     * Update UI after selection change
     */
    updateUI() {
        this.app.updateSelectedCount();
        this.app.propertiesPanel.refresh();
    }
    
    /**
     * Activate tool
     */
    onActivate() {
        this.app.statusBar.showToolInfo('select');
    }
    
    /**
     * Deactivate tool
     */
    onDeactivate() {
        this.selectionBox = null;
        this.isDragging = false;
    }
}
