/**
 * ObjectLibrary Class
 * Manages the object library sidebar with categories, search, and object selection
 */
class ObjectLibrary {
    constructor(editorApp) {
        this.app = editorApp;
        
        // DOM elements
        this.categoryTabsContainer = document.getElementById('category-tabs');
        this.objectListContainer = document.getElementById('object-list');
        this.searchInput = document.getElementById('object-search');
        
        // State
        this.currentCategory = null;
        this.selectedObjectType = null;
        this.searchQuery = '';
        
        this.init();
    }
    
    /**
     * Initialize the object library
     */
    init() {
        this.setupCategories();
        this.setupSearch();
        this.loadObjects();
    }
    
    /**
     * Setup category tabs
     */
    setupCategories() {
        const categories = getAllCategories();
        
        categories.forEach((category, index) => {
            const tab = document.createElement('button');
            tab.className = 'category-tab';
            tab.textContent = `${category.icon} ${category.name}`;
            tab.dataset.category = category.id;
            
            if (index === 0) {
                tab.classList.add('active');
                this.currentCategory = category.id;
            }
            
            tab.addEventListener('click', () => {
                this.selectCategory(category.id);
            });
            
            this.categoryTabsContainer.appendChild(tab);
        });
    }
    
    /**
     * Setup search functionality
     */
    setupSearch() {
        this.searchInput.addEventListener('input', (e) => {
            this.searchQuery = e.target.value.toLowerCase();
            this.filterObjects();
        });
    }
    
    /**
     * Select a category
     */
    selectCategory(categoryId) {
        this.currentCategory = categoryId;
        
        // Update active tab
        this.categoryTabsContainer.querySelectorAll('.category-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.category === categoryId);
        });
        
        // Reload objects
        this.loadObjects();
    }
    
    /**
     * Load objects for current category
     */
    loadObjects() {
        this.objectListContainer.innerHTML = '';
        
        if (!this.currentCategory) return;
        
        const objects = getObjectTypesByCategory(this.currentCategory);
        
        objects.forEach(obj => {
            this.createObjectItem(obj);
        });
    }
    
    /**
     * Create object item in list
     */
    createObjectItem(objType) {
        const item = document.createElement('div');
        item.className = 'object-item';
        item.dataset.type = objType.type;
        item.dataset.name = objType.displayName.toLowerCase();
        
        // Thumbnail
        const thumbnail = document.createElement('div');
        thumbnail.className = 'object-thumbnail';
        
        // Try to load sprite as thumbnail
        const spritePath = `assets/objects/${objType.category}/${objType.type}.png`;
        const img = new Image();
        img.src = spritePath;
        img.onerror = () => {
            // Fallback to icon/text
            thumbnail.textContent = this.getIconForType(objType.type);
        };
        img.onload = () => {
            thumbnail.innerHTML = '';
            thumbnail.appendChild(img);
        };
        
        thumbnail.textContent = this.getIconForType(objType.type);
        
        // Name
        const name = document.createElement('div');
        name.className = 'object-name';
        name.textContent = objType.displayName;
        
        item.appendChild(thumbnail);
        item.appendChild(name);
        
        // Click to select
        item.addEventListener('click', () => {
            this.selectObject(objType.type, item);
        });
        
        // Double click to place immediately
        item.addEventListener('dblclick', () => {
            this.selectObject(objType.type, item);
            this.app.setTool('place');
        });
        
        this.objectListContainer.appendChild(item);
    }
    
    /**
     * Select object type
     */
    selectObject(type, itemElement) {
        this.selectedObjectType = type;
        
        // Update UI
        this.objectListContainer.querySelectorAll('.object-item').forEach(item => {
            item.classList.remove('selected');
        });
        itemElement.classList.add('selected');
        
        // Store in app state
        this.app.state.selectedObjectType = type;
        
        // Get object info
        const objInfo = getObjectTypeDefaults(type);
        
        // Switch to place tool
        this.app.setTool('place');
        this.app.updateStatus(`Place: ${objInfo.displayName} (Click on canvas to place)`);
    }
    
    /**
     * Filter objects by search query
     */
    filterObjects() {
        const items = this.objectListContainer.querySelectorAll('.object-item');
        
        items.forEach(item => {
            const name = item.dataset.name || '';
            const matches = name.includes(this.searchQuery);
            item.style.display = matches ? '' : 'none';
        });
    }
    
    /**
     * Get icon for object type
     */
    getIconForType(type) {
        const iconMap = {
            // Houses
            house: '🏠',
            house_small: '🏘️',
            house_large: '🏰',
            
            // Trees
            tree: '🌳',
            tree_small: '🌲',
            tree_large: '🎄',
            
            // Rocks
            rock: '🪨',
            rock_small: '⬜',
            rock_large: '🗿',
            
            // Decorations
            flower: '🌸',
            bush: '🌿',
            grass_tuft: '🌾',
            
            // Structures
            fence: '🚧',
            fence_horizontal: '🚧',
            gate: '🚪',
            sign: '🪧',
            well: '⚗️',
            pond: '💧',
            
            // Interactive
            chest: '📦',
            npc: '🧑'
        };
        
        return iconMap[type] || '📦';
    }
    
    /**
     * Clear selection
     */
    clearSelection() {
        this.selectedObjectType = null;
        this.objectListContainer.querySelectorAll('.object-item').forEach(item => {
            item.classList.remove('selected');
        });
    }
    
    /**
     * Get selected object type
     */
    getSelectedType() {
        return this.selectedObjectType;
    }
    
    /**
     * Refresh library
     */
    refresh() {
        this.loadObjects();
        if (this.searchQuery) {
            this.filterObjects();
        }
    }
}
