/**
 * PropertiesPanel Class
 * Manages the properties panel for editing selected objects
 */
class PropertiesPanel {
    constructor(editorApp) {
        this.app = editorApp;
        
        // DOM elements
        this.panel = document.getElementById('properties-panel');
        this.noSelectionDiv = this.panel.querySelector('.no-selection');
        this.formDiv = this.panel.querySelector('.properties-form');
        
        // Form inputs
        this.inputs = {
            id: document.getElementById('prop-id'),
            type: document.getElementById('prop-type'),
            x: document.getElementById('prop-x'),
            y: document.getElementById('prop-y'),
            width: document.getElementById('prop-width'),
            height: document.getElementById('prop-height'),
            zIndex: document.getElementById('prop-zindex'),
            zIndexValue: document.getElementById('prop-zindex-value'),
            collidable: document.getElementById('prop-collidable'),
            interactable: document.getElementById('prop-interactable'),
            metadata: document.getElementById('prop-metadata')
        };
        
        // Buttons
        this.applyBtn = document.getElementById('apply-properties');
        this.deleteBtn = document.getElementById('delete-object');
        
        // Current object being edited
        this.currentObject = null;
        
        this.init();
    }
    
    /**
     * Initialize the properties panel
     */
    init() {
        this.setupEventListeners();
        this.hide();
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Z-index slider
        this.inputs.zIndex.addEventListener('input', (e) => {
            this.inputs.zIndexValue.textContent = e.target.value;
        });
        
        // Apply button
        this.applyBtn.addEventListener('click', () => {
            this.applyChanges();
        });
        
        // Delete button
        this.deleteBtn.addEventListener('click', () => {
            this.deleteObject();
        });
        
        // Auto-apply on input change (optional)
        ['x', 'y', 'width', 'height'].forEach(key => {
            this.inputs[key].addEventListener('change', () => {
                if (this.currentObject) {
                    this.applyChanges();
                }
            });
        });
        
        // Checkbox changes
        this.inputs.collidable.addEventListener('change', () => {
            if (this.currentObject) {
                this.applyChanges();
            }
        });
        
        this.inputs.interactable.addEventListener('change', () => {
            if (this.currentObject) {
                this.applyChanges();
            }
        });
    }
    
    /**
     * Show properties for selected objects
     */
    show(objects) {
        if (!objects || objects.length === 0) {
            this.hide();
            return;
        }
        
        // For now, only show properties for single selection
        if (objects.length === 1) {
            this.showSingleObject(objects[0]);
        } else {
            this.showMultipleObjects(objects);
        }
    }
    
    /**
     * Show properties for single object
     */
    showSingleObject(obj) {
        this.currentObject = obj;
        
        // Show form, hide no-selection
        this.noSelectionDiv.style.display = 'none';
        this.formDiv.style.display = 'flex';
        
        // Populate form
        this.inputs.id.value = obj.id;
        this.inputs.type.value = obj.type;
        this.inputs.x.value = Math.round(obj.x);
        this.inputs.y.value = Math.round(obj.y);
        this.inputs.width.value = Math.round(obj.width);
        this.inputs.height.value = Math.round(obj.height);
        this.inputs.zIndex.value = obj.zIndex;
        this.inputs.zIndexValue.textContent = obj.zIndex;
        this.inputs.collidable.checked = obj.collidable;
        this.inputs.interactable.checked = obj.interactable;
        
        // Metadata as JSON
        try {
            this.inputs.metadata.value = JSON.stringify(obj.metadata, null, 2);
        } catch (e) {
            this.inputs.metadata.value = '{}';
        }
    }
    
    /**
     * Show properties for multiple objects
     */
    showMultipleObjects(objects) {
        this.currentObject = null;
        
        // Show form, hide no-selection
        this.noSelectionDiv.style.display = 'none';
        this.formDiv.style.display = 'flex';
        
        // Show mixed values
        this.inputs.id.value = `${objects.length} objects selected`;
        this.inputs.type.value = 'Multiple';
        
        // Show average position
        const avgX = objects.reduce((sum, obj) => sum + obj.x, 0) / objects.length;
        const avgY = objects.reduce((sum, obj) => sum + obj.y, 0) / objects.length;
        this.inputs.x.value = Math.round(avgX);
        this.inputs.y.value = Math.round(avgY);
        
        // Disable size editing for multiple
        this.inputs.width.value = '-';
        this.inputs.width.disabled = true;
        this.inputs.height.value = '-';
        this.inputs.height.disabled = true;
        
        // Show common z-index if all same
        const zIndexes = objects.map(obj => obj.zIndex);
        const allSameZ = zIndexes.every(z => z === zIndexes[0]);
        if (allSameZ) {
            this.inputs.zIndex.value = zIndexes[0];
            this.inputs.zIndexValue.textContent = zIndexes[0];
        } else {
            this.inputs.zIndexValue.textContent = 'Mixed';
        }
        
        this.inputs.metadata.value = `${objects.length} objects selected`;
        this.inputs.metadata.disabled = true;
    }
    
    /**
     * Hide properties panel
     */
    hide() {
        this.currentObject = null;
        this.noSelectionDiv.style.display = 'block';
        this.formDiv.style.display = 'none';
        
        // Re-enable disabled inputs
        this.inputs.width.disabled = false;
        this.inputs.height.disabled = false;
        this.inputs.metadata.disabled = false;
    }
    
    /**
     * Apply changes to current object
     */
    applyChanges() {
        if (!this.currentObject) {
            // Apply to multiple objects
            this.applyToMultiple();
            return;
        }
        
        try {
            // Update object properties
            this.currentObject.x = parseFloat(this.inputs.x.value) || 0;
            this.currentObject.y = parseFloat(this.inputs.y.value) || 0;
            this.currentObject.width = parseFloat(this.inputs.width.value) || 32;
            this.currentObject.height = parseFloat(this.inputs.height.value) || 32;
            this.currentObject.zIndex = parseInt(this.inputs.zIndex.value) || 50;
            this.currentObject.collidable = this.inputs.collidable.checked;
            this.currentObject.interactable = this.inputs.interactable.checked;
            
            // Parse metadata JSON
            try {
                const metadataText = this.inputs.metadata.value.trim();
                if (metadataText) {
                    this.currentObject.metadata = JSON.parse(metadataText);
                }
            } catch (e) {
                console.warn('Invalid metadata JSON:', e);
                this.app.updateStatus('Warning: Invalid metadata JSON');
            }
            
            this.app.updateStatus('Properties updated');
            
        } catch (e) {
            console.error('Failed to apply changes:', e);
            this.app.updateStatus('Error: Failed to update properties');
        }
    }
    
    /**
     * Apply changes to multiple selected objects
     */
    applyToMultiple() {
        const selected = this.app.objectManager.getSelected();
        if (selected.length === 0) return;
        
        // Apply z-index if changed
        const zIndex = parseInt(this.inputs.zIndex.value);
        if (!isNaN(zIndex)) {
            selected.forEach(obj => {
                obj.zIndex = zIndex;
            });
        }
        
        // Apply collidable/interactable
        selected.forEach(obj => {
            obj.collidable = this.inputs.collidable.checked;
            obj.interactable = this.inputs.interactable.checked;
        });
        
        this.app.updateStatus(`Updated ${selected.length} objects`);
    }
    
    /**
     * Delete current object
     */
    deleteObject() {
        if (!this.currentObject) {
            // Delete all selected
            const selected = [...this.app.objectManager.getSelected()];
            if (selected.length === 0) return;
            
            if (confirm(`Delete ${selected.length} selected objects?`)) {
                selected.forEach(obj => {
                    this.app.objectManager.remove(obj);
                });
                this.app.updateStatus(`Deleted ${selected.length} objects`);
                this.app.updateObjectCount();
                this.hide();
            }
            return;
        }
        
        if (confirm('Delete this object?')) {
            this.app.objectManager.remove(this.currentObject);
            this.app.updateStatus('Object deleted');
            this.app.updateObjectCount();
            this.hide();
        }
    }
    
    /**
     * Refresh panel with current selection
     */
    refresh() {
        const selected = this.app.objectManager.getSelected();
        this.show(selected);
    }
    
    /**
     * Update single field
     */
    updateField(fieldName, value) {
        if (this.inputs[fieldName]) {
            this.inputs[fieldName].value = value;
            
            if (fieldName === 'zIndex') {
                this.inputs.zIndexValue.textContent = value;
            }
        }
    }
}
