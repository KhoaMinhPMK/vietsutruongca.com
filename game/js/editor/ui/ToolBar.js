/**
 * ToolBar Class
 * Manages the toolbar with tool selection and action buttons
 */
class ToolBar {
    constructor(editorApp) {
        this.app = editorApp;
        
        // Tool buttons
        this.toolButtons = {};
        document.querySelectorAll('.tool-btn[data-tool]').forEach(btn => {
            this.toolButtons[btn.dataset.tool] = btn;
        });
        
        // Action buttons
        this.actionButtons = {
            new: document.getElementById('new-btn'),
            load: document.getElementById('load-btn'),
            save: document.getElementById('save-btn'),
            export: document.getElementById('export-btn'),
            undo: document.getElementById('undo-btn'),
            redo: document.getElementById('redo-btn')
        };
        
        this.init();
    }
    
    /**
     * Initialize toolbar
     */
    init() {
        this.setupToolButtons();
        this.setupActionButtons();
    }
    
    /**
     * Setup tool buttons
     */
    setupToolButtons() {
        Object.entries(this.toolButtons).forEach(([toolName, button]) => {
            button.addEventListener('click', () => {
                // Call app.setTool which will then call back selectTool to update UI
                this.app.setTool(toolName);
            });
        });
    }
    
    /**
     * Setup action buttons
     */
    setupActionButtons() {
        // New map
        this.actionButtons.new.addEventListener('click', () => {
            this.newMap();
        });
        
        // Load map
        this.actionButtons.load.addEventListener('click', () => {
            this.loadMap();
        });
        
        // Save map
        this.actionButtons.save.addEventListener('click', () => {
            this.saveMap();
        });
        
        // Export map
        this.actionButtons.export.addEventListener('click', () => {
            this.exportMap();
        });
        
        // Undo
        this.actionButtons.undo.addEventListener('click', () => {
            this.undo();
        });
        
        // Redo
        this.actionButtons.redo.addEventListener('click', () => {
            this.redo();
        });
    }
    
    /**
     * Select tool (update UI only, don't call app.setTool to avoid infinite loop)
     */
    selectTool(toolName) {
        // Update button states
        Object.entries(this.toolButtons).forEach(([name, button]) => {
            button.classList.toggle('active', name === toolName);
        });
    }
    
    /**
     * Get active tool
     */
    getActiveTool() {
        for (const [name, button] of Object.entries(this.toolButtons)) {
            if (button.classList.contains('active')) {
                return name;
            }
        }
        return 'select';
    }
    
    /**
     * Enable/disable tool button
     */
    setToolEnabled(toolName, enabled) {
        const button = this.toolButtons[toolName];
        if (button) {
            button.disabled = !enabled;
            button.style.opacity = enabled ? '1' : '0.5';
        }
    }
    
    /**
     * Enable/disable action button
     */
    setActionEnabled(actionName, enabled) {
        const button = this.actionButtons[actionName];
        if (button) {
            button.disabled = !enabled;
            button.style.opacity = enabled ? '1' : '0.5';
        }
    }
    
    /**
     * New map action
     */
    newMap() {
        if (this.app.objectManager.objects.length > 0) {
            if (!confirm('Create new map? All unsaved changes will be lost.')) {
                return;
            }
        }
        
        this.app.objectManager.clear();
        this.app.canvas.camera.x = 0;
        this.app.canvas.camera.y = 0;
        this.app.canvas.resetZoom();
        
        this.app.updateStatus('New map created');
        this.app.updateObjectCount();
        this.app.updateSelectedCount();
    }
    
    /**
     * Load map action
     */
    loadMap() {
        const input = document.getElementById('file-input');
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    this.app.objectManager.loadFromJSON(data);
                    this.app.updateStatus(`Loaded ${data.objects.length} objects`);
                    this.app.updateObjectCount();
                    this.app.updateSelectedCount();
                } catch (error) {
                    console.error('Failed to load map:', error);
                    alert('Failed to load map: ' + error.message);
                    this.app.updateStatus('Error loading map');
                }
            };
            reader.readAsText(file);
            
            // Reset input
            input.value = '';
        };
        
        input.click();
    }
    
    /**
     * Save map action
     */
    saveMap() {
        try {
            const data = this.app.objectManager.saveToJSON();
            const json = JSON.stringify(data, null, 2);
            
            // Create blob and download
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'map_data.json';
            a.click();
            URL.revokeObjectURL(url);
            
            this.app.updateStatus(`Saved ${data.objectCount} objects to map_data.json`);
        } catch (error) {
            console.error('Failed to save map:', error);
            alert('Failed to save map: ' + error.message);
            this.app.updateStatus('Error saving map');
        }
    }
    
    /**
     * Export map action (same as save for now)
     */
    exportMap() {
        this.saveMap();
    }
    
    /**
     * Undo action
     */
    undo() {
        if (this.app.state.history && this.app.state.history.length > 0) {
            // TODO: Implement undo system
            this.app.updateStatus('Undo (not implemented yet)');
        } else {
            this.app.updateStatus('Nothing to undo');
        }
        
        // Update button state
        this.updateUndoRedoButtons();
    }
    
    /**
     * Redo action
     */
    redo() {
        if (this.app.state.historyIndex < this.app.state.history.length - 1) {
            // TODO: Implement redo system
            this.app.updateStatus('Redo (not implemented yet)');
        } else {
            this.app.updateStatus('Nothing to redo');
        }
        
        // Update button state
        this.updateUndoRedoButtons();
    }
    
    /**
     * Update undo/redo button states
     */
    updateUndoRedoButtons() {
        const canUndo = this.app.state.history && this.app.state.history.length > 0 && this.app.state.historyIndex >= 0;
        const canRedo = this.app.state.history && this.app.state.historyIndex < this.app.state.history.length - 1;
        
        this.setActionEnabled('undo', canUndo);
        this.setActionEnabled('redo', canRedo);
    }
    
    /**
     * Update toolbar state
     */
    update() {
        this.updateUndoRedoButtons();
    }
}
