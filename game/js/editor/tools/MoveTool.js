/**
 * MoveTool Class
 * Tool for moving selected objects by dragging
 */
class MoveTool {
    constructor(editorApp) {
        this.app = editorApp;
        this.name = 'move';
        
        // Drag state
        this.isDragging = false;
        this.draggedObjects = [];
        this.dragStartPositions = [];
        this.dragOffsetX = 0;
        this.dragOffsetY = 0;
    }
    
    /**
     * Mouse down - start moving
     */
    onMouseDown(worldX, worldY, e) {
        // Check if clicking on a selected object
        const clickedObjects = this.app.objectManager.getAtPosition(worldX, worldY);
        
        if (clickedObjects.length > 0) {
            const clickedObject = clickedObjects[0];
            
            // If clicking on an unselected object, select it first
            if (!this.app.objectManager.selectedObjects.includes(clickedObject)) {
                if (!e.ctrlKey) {
                    this.app.objectManager.clearSelection();
                }
                this.app.objectManager.select(clickedObject, e.ctrlKey);
                this.app.updateSelectedCount();
                this.app.propertiesPanel.refresh();
            }
            
            // Prepare for dragging
            this.draggedObjects = [...this.app.objectManager.selectedObjects];
            this.dragStartPositions = this.draggedObjects.map(obj => ({
                x: obj.x,
                y: obj.y
            }));
            
            // Calculate offset from click position to first object
            if (this.draggedObjects.length > 0) {
                this.dragOffsetX = worldX - this.draggedObjects[0].x;
                this.dragOffsetY = worldY - this.draggedObjects[0].y;
            }
        } else {
            // Clicked on empty space - clear selection
            if (!e.ctrlKey) {
                this.app.objectManager.clearSelection();
                this.app.updateSelectedCount();
                this.app.propertiesPanel.refresh();
            }
        }
    }
    
    /**
     * Drag - move objects
     */
    onDrag(worldX, worldY, dragStartX, dragStartY, e) {
        if (this.draggedObjects.length === 0) return;
        
        this.isDragging = true;
        
        // Calculate delta from drag start
        const deltaX = worldX - dragStartX;
        const deltaY = worldY - dragStartY;
        
        // Move all selected objects
        this.draggedObjects.forEach((obj, index) => {
            let newX = this.dragStartPositions[index].x + deltaX;
            let newY = this.dragStartPositions[index].y + deltaY;
            
            // Apply snap if enabled
            if (this.app.state.snapEnabled && !e.altKey) {
                const snapped = GridHelper.snapPosition(newX, newY);
                newX = snapped.x;
                newY = snapped.y;
            }
            
            // Update position
            obj.x = newX;
            obj.y = newY;
        });
        
        // Update properties panel
        if (this.draggedObjects.length === 1) {
            this.app.propertiesPanel.updateField('x', Math.round(this.draggedObjects[0].x));
            this.app.propertiesPanel.updateField('y', Math.round(this.draggedObjects[0].y));
        }
    }
    
    /**
     * Drag end - finalize movement
     */
    onDragEnd(worldX, worldY, e) {
        if (this.isDragging && this.draggedObjects.length > 0) {
            this.app.statusBar.showSuccess(`Moved ${this.draggedObjects.length} object(s)`);
            this.app.propertiesPanel.refresh();
        }
        
        this.isDragging = false;
        this.draggedObjects = [];
        this.dragStartPositions = [];
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
                this.app.statusBar.showInfo(`Moved by ${dx}, ${dy}`);
            }
        }
    }
    
    /**
     * Render tool overlay
     */
    render(ctx, camera) {
        // Show movement guides when dragging
        if (this.isDragging && this.draggedObjects.length > 0) {
            ctx.save();
            
            // Draw guides from original positions
            ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)';
            ctx.lineWidth = 1 / camera.zoom;
            ctx.setLineDash([5 / camera.zoom, 5 / camera.zoom]);
            
            this.draggedObjects.forEach((obj, index) => {
                const startPos = this.dragStartPositions[index];
                
                // Draw line from start to current
                ctx.beginPath();
                ctx.moveTo(startPos.x + obj.width / 2, startPos.y + obj.height / 2);
                ctx.lineTo(obj.x + obj.width / 2, obj.y + obj.height / 2);
                ctx.stroke();
                
                // Draw start position outline
                ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
                ctx.strokeRect(startPos.x, startPos.y, obj.width, obj.height);
            });
            
            ctx.restore();
        }
        
        // Draw snap guide
        if (this.app.state.snapEnabled && this.isDragging) {
            ctx.save();
            ctx.fillStyle = '#ffff00';
            ctx.font = `${10 / camera.zoom}px Arial`;
            ctx.textAlign = 'left';
            ctx.fillText('Snap: ON (Hold Alt to disable)', 10 / camera.zoom + camera.x, 20 / camera.zoom + camera.y);
            ctx.restore();
        }
    }
    
    /**
     * Activate tool
     */
    onActivate() {
        this.app.statusBar.showToolInfo('move');
        
        if (this.app.objectManager.selectedObjects.length === 0) {
            this.app.statusBar.showInfo('Select objects first, then drag to move');
        }
    }
    
    /**
     * Deactivate tool
     */
    onDeactivate() {
        this.isDragging = false;
        this.draggedObjects = [];
        this.dragStartPositions = [];
    }
}
