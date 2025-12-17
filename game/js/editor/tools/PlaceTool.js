/**
 * PlaceTool Class
 * Tool for placing new objects on the canvas
 */
class PlaceTool {
    constructor(editorApp) {
        this.app = editorApp;
        this.name = 'place';
        
        // Preview object
        this.previewObject = null;
        this.previewX = 0;
        this.previewY = 0;
        
        // Place multiple mode (hold Shift)
        this.multiPlaceMode = false;
    }
    
    /**
     * Click to place object
     */
    onClick(worldX, worldY, e) {
        const objectType = this.app.state.selectedObjectType;
        
        if (!objectType) {
            this.app.statusBar.showWarning('Please select an object from the library first');
            return;
        }
        
        // Create new object
        const objDefaults = getObjectTypeDefaults(objectType);
        
        // Calculate position (snap if enabled)
        let x = worldX;
        let y = worldY;
        
        if (this.app.state.snapEnabled) {
            const snapped = GridHelper.snapPosition(x, y);
            x = snapped.x;
            y = snapped.y;
        }
        
        // Center object at cursor
        x -= objDefaults.defaultWidth / 2;
        y -= objDefaults.defaultHeight / 2;
        
        // Create object
        const newObj = new GameObject({
            type: objectType,
            spritePath: `assets/objects/${objDefaults.category}/${objectType}.png`,
            x: x,
            y: y,
            width: objDefaults.defaultWidth,
            height: objDefaults.defaultHeight,
            zIndex: objDefaults.defaultZIndex,
            collidable: objDefaults.collidable,
            interactable: objDefaults.interactable,
            metadata: {
                name: objDefaults.displayName
            }
        });
        
        // Add to manager
        this.app.objectManager.add(newObj);
        
        // Select the new object
        if (!e.shiftKey) {
            this.app.objectManager.clearSelection();
        }
        this.app.objectManager.select(newObj, e.shiftKey);
        
        // Update UI
        this.app.updateObjectCount();
        this.app.updateSelectedCount();
        this.app.propertiesPanel.refresh();
        
        this.app.statusBar.showSuccess(`Placed ${objDefaults.displayName}`);
        
        // If not holding shift, switch to select tool
        if (!e.shiftKey) {
            this.app.setTool('select');
        }
    }
    
    /**
     * Mouse move for preview
     */
    onMouseMove(worldX, worldY, e) {
        this.previewX = worldX;
        this.previewY = worldY;
        
        // Update multi-place mode
        this.multiPlaceMode = e.shiftKey;
    }
    
    /**
     * Key down event
     */
    onKeyDown(e) {
        if (e.key === 'Shift') {
            this.multiPlaceMode = true;
        }
        
        // ESC to cancel
        if (e.key === 'Escape') {
            this.app.setTool('select');
        }
    }
    
    /**
     * Key up event
     */
    onKeyUp(e) {
        if (e.key === 'Shift') {
            this.multiPlaceMode = false;
        }
    }
    
    /**
     * Render tool overlay (preview)
     */
    render(ctx, camera) {
        const objectType = this.app.state.selectedObjectType;
        
        if (!objectType) return;
        
        const objDefaults = getObjectTypeDefaults(objectType);
        
        // Calculate preview position
        let x = this.previewX;
        let y = this.previewY;
        
        if (this.app.state.snapEnabled) {
            const snapped = GridHelper.snapPosition(x, y);
            x = snapped.x;
            y = snapped.y;
        }
        
        // Center at cursor
        x -= objDefaults.defaultWidth / 2;
        y -= objDefaults.defaultHeight / 2;
        
        ctx.save();
        
        // Draw preview rectangle
        ctx.fillStyle = 'rgba(0, 255, 0, 0.2)';
        ctx.fillRect(x, y, objDefaults.defaultWidth, objDefaults.defaultHeight);
        
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2 / camera.zoom;
        ctx.setLineDash([5 / camera.zoom, 5 / camera.zoom]);
        ctx.strokeRect(x, y, objDefaults.defaultWidth, objDefaults.defaultHeight);
        
        // Draw object name
        ctx.fillStyle = '#00ff00';
        ctx.font = `${12 / camera.zoom}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(objDefaults.displayName, x + objDefaults.defaultWidth / 2, y - 5 / camera.zoom);
        
        // Draw size
        ctx.font = `${10 / camera.zoom}px Arial`;
        ctx.fillText(`${objDefaults.defaultWidth}x${objDefaults.defaultHeight}`, x + objDefaults.defaultWidth / 2, y + objDefaults.defaultHeight + 12 / camera.zoom);
        
        // Draw multi-place indicator
        if (this.multiPlaceMode) {
            ctx.fillStyle = '#ffff00';
            ctx.font = `${10 / camera.zoom}px Arial`;
            ctx.fillText('Multi-place mode', x + objDefaults.defaultWidth / 2, y - 20 / camera.zoom);
        }
        
        ctx.restore();
    }
    
    /**
     * Activate tool
     */
    onActivate() {
        const objectType = this.app.state.selectedObjectType;
        
        if (!objectType) {
            this.app.statusBar.showWarning('Select an object from the library to place');
        } else {
            const objDefaults = getObjectTypeDefaults(objectType);
            this.app.statusBar.setMessage(`Place: ${objDefaults.displayName} (Click to place, Shift for multiple)`);
        }
    }
    
    /**
     * Deactivate tool
     */
    onDeactivate() {
        this.previewObject = null;
        this.multiPlaceMode = false;
    }
}
