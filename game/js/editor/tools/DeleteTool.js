/**
 * DeleteTool Class
 * Tool for deleting objects by clicking
 */
class DeleteTool {
    constructor(editorApp) {
        this.app = editorApp;
        this.name = 'delete';
        
        // Hover state
        this.hoveredObject = null;
    }
    
    /**
     * Click to delete
     */
    onClick(worldX, worldY, e) {
        const objects = this.app.objectManager.getAtPosition(worldX, worldY);
        
        if (objects.length > 0) {
            const objectToDelete = objects[0]; // Get top-most object
            
            // Confirm deletion (can be disabled with Shift key)
            if (!e.shiftKey) {
                const confirm = window.confirm(
                    `Delete ${objectToDelete.type}?\n\n` +
                    `Position: (${Math.round(objectToDelete.x)}, ${Math.round(objectToDelete.y)})\n` +
                    `Size: ${objectToDelete.width}x${objectToDelete.height}`
                );
                
                if (!confirm) return;
            }
            
            // Delete the object
            this.app.objectManager.remove(objectToDelete.id);
            this.app.objectManager.deselect(objectToDelete);
            this.app.updateObjectCount();
            this.app.updateSelectedCount();
            this.app.propertiesPanel.refresh();
            this.app.statusBar.showSuccess(`Deleted ${objectToDelete.type}`);
            
            // Clear hover
            this.hoveredObject = null;
        } else {
            this.app.statusBar.showWarning('No object to delete');
        }
    }
    
    /**
     * Mouse move - track hover
     */
    onMouseMove(worldX, worldY, e) {
        const objects = this.app.objectManager.getAtPosition(worldX, worldY);
        this.hoveredObject = objects.length > 0 ? objects[0] : null;
    }
    
    /**
     * Key down event
     */
    onKeyDown(e) {
        // Delete key - delete all selected
        if (e.key === 'Delete' && this.app.objectManager.selectedObjects.length > 0) {
            const count = this.app.objectManager.selectedObjects.length;
            
            // Confirm if multiple
            if (count > 1) {
                const confirm = window.confirm(`Delete ${count} selected objects?`);
                if (!confirm) return;
            }
            
            // Delete all selected
            const selectedIds = this.app.objectManager.selectedObjects.map(obj => obj.id);
            selectedIds.forEach(id => this.app.objectManager.remove(id));
            
            this.app.objectManager.clearSelection();
            this.app.updateObjectCount();
            this.app.updateSelectedCount();
            this.app.propertiesPanel.refresh();
            this.app.statusBar.showSuccess(`Deleted ${count} object(s)`);
            
            e.preventDefault();
        }
    }
    
    /**
     * Render tool overlay
     */
    render(ctx, camera) {
        // Highlight hovered object in red
        if (this.hoveredObject) {
            ctx.save();
            
            const obj = this.hoveredObject;
            
            // Red outline
            ctx.strokeStyle = '#ff0000';
            ctx.lineWidth = 2 / camera.zoom;
            ctx.setLineDash([5 / camera.zoom, 5 / camera.zoom]);
            ctx.strokeRect(obj.x, obj.y, obj.width, obj.height);
            
            // Red fill overlay
            ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
            ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
            
            // Draw X mark
            ctx.strokeStyle = '#ff0000';
            ctx.lineWidth = 3 / camera.zoom;
            ctx.setLineDash([]);
            ctx.beginPath();
            ctx.moveTo(obj.x + 5, obj.y + 5);
            ctx.lineTo(obj.x + obj.width - 5, obj.y + obj.height - 5);
            ctx.moveTo(obj.x + obj.width - 5, obj.y + 5);
            ctx.lineTo(obj.x + 5, obj.y + obj.height - 5);
            ctx.stroke();
            
            // Object info
            ctx.fillStyle = '#ff0000';
            ctx.font = `bold ${12 / camera.zoom}px Arial`;
            ctx.textAlign = 'center';
            ctx.fillText(
                `Delete: ${obj.type}`,
                obj.x + obj.width / 2,
                obj.y - 10 / camera.zoom
            );
            
            // Instructions
            ctx.font = `${10 / camera.zoom}px Arial`;
            ctx.fillText(
                'Click to delete (Hold Shift to skip confirmation)',
                obj.x + obj.width / 2,
                obj.y + obj.height + 20 / camera.zoom
            );
            
            ctx.restore();
        }
        
        // Show delete mode indicator
        ctx.save();
        ctx.fillStyle = '#ff0000';
        ctx.font = `bold ${12 / camera.zoom}px Arial`;
        ctx.textAlign = 'left';
        ctx.fillText(
            '🗑️ DELETE MODE',
            10 / camera.zoom + camera.x,
            20 / camera.zoom + camera.y
        );
        ctx.restore();
    }
    
    /**
     * Activate tool
     */
    onActivate() {
        this.app.statusBar.showToolInfo('delete');
        this.app.statusBar.showWarning('Delete mode active - Click objects to delete');
        this.hoveredObject = null;
    }
    
    /**
     * Deactivate tool
     */
    onDeactivate() {
        this.hoveredObject = null;
    }
}
