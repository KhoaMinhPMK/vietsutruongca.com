/**
 * FileManager - Handle file operations
 */
class FileManager {
    constructor() {
        this.currentFile = null;
    }
    
    /**
     * Save map data to JSON file
     */
    saveToFile(data, filename = 'map_data.json') {
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        
        URL.revokeObjectURL(url);
        this.currentFile = filename;
    }
    
    /**
     * Load map data from file
     */
    loadFromFile() {
        return new Promise((resolve, reject) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            
            input.onchange = (e) => {
                const file = e.target.files[0];
                if (!file) {
                    reject(new Error('No file selected'));
                    return;
                }
                
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const data = JSON.parse(event.target.result);
                        this.currentFile = file.name;
                        resolve(data);
                    } catch (error) {
                        reject(new Error('Invalid JSON file: ' + error.message));
                    }
                };
                reader.onerror = () => reject(new Error('Failed to read file'));
                reader.readAsText(file);
            };
            
            input.click();
        });
    }
    
    /**
     * Validate map data structure
     */
    validateMapData(data) {
        if (!data || typeof data !== 'object') {
            return { valid: false, error: 'Invalid data format' };
        }
        
        if (!data.version) {
            return { valid: false, error: 'Missing version' };
        }
        
        if (!Array.isArray(data.objects)) {
            return { valid: false, error: 'Missing or invalid objects array' };
        }
        
        return { valid: true };
    }
}
