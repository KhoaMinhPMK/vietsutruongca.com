/**
 * EditorState - Manage editor state and history
 */
class EditorState {
    constructor() {
        this.history = [];
        this.historyIndex = -1;
        this.maxHistory = EDITOR_CONFIG.MAX_HISTORY;
        this.isDirty = false;
    }
    
    /**
     * Save current state to history
     */
    saveState(objectManager) {
        // Remove any states after current index
        this.history = this.history.slice(0, this.historyIndex + 1);
        
        // Save current state
        const state = objectManager.saveToJSON();
        this.history.push(state);
        
        // Limit history size
        if (this.history.length > this.maxHistory) {
            this.history.shift();
        } else {
            this.historyIndex++;
        }
        
        this.isDirty = true;
    }
    
    /**
     * Undo to previous state
     */
    undo(objectManager) {
        if (!this.canUndo()) return false;
        
        this.historyIndex--;
        const state = this.history[this.historyIndex];
        objectManager.loadFromJSON(state);
        return true;
    }
    
    /**
     * Redo to next state
     */
    redo(objectManager) {
        if (!this.canRedo()) return false;
        
        this.historyIndex++;
        const state = this.history[this.historyIndex];
        objectManager.loadFromJSON(state);
        return true;
    }
    
    /**
     * Check if can undo
     */
    canUndo() {
        return this.historyIndex > 0;
    }
    
    /**
     * Check if can redo
     */
    canRedo() {
        return this.historyIndex < this.history.length - 1;
    }
    
    /**
     * Clear history
     */
    clear() {
        this.history = [];
        this.historyIndex = -1;
        this.isDirty = false;
    }
    
    /**
     * Mark as saved
     */
    markSaved() {
        this.isDirty = false;
    }
}
