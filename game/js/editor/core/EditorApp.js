/**
 * EditorApp Class
 * Main application entry point for the map editor
 * Coordinates all editor components
 */
class EditorApp {
    constructor() {
        // Core components
        this.canvas = null;
        this.objectManager = null;
        this.state = null;
        this.input = null;
        
        // UI components
        this.objectLibrary = null;
        this.propertiesPanel = null;
        this.toolbar = null;
        this.statusBar = null;
        
        // Tools
        this.tools = {};
        this.currentTool = null;
        
        // Camera (for panning and zooming)
        this.camera = null;
        
        // Debug mode
        this.debugMode = false;
    }
    
    /**
     * Initialize the editor
     */
    async init() {
        console.log('🚀 Initializing Map Editor...');
        
        try {
            // Initialize core systems
            this.initCore();
            
            // Initialize UI components (placeholder for now)
            this.initUI();
            
            // Initialize tools (placeholder for now)
            this.initTools();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Start render loop
            this.startRenderLoop();
            
            console.log('✅ Map Editor initialized successfully!');
            this.updateStatus('Ready - Press P to place objects, V to select');
            
        } catch (error) {
            console.error('❌ Failed to initialize editor:', error);
            alert('Failed to initialize editor. Check console for details.');
        }
    }
    
    /**
     * Initialize core systems
     */
    initCore() {
        // Initialize object manager
        this.objectManager = new GameObjectManager();
        
        // Initialize EditorCanvas
        const canvasEl = document.getElementById('editor-canvas');
        this.canvas = new EditorCanvas(canvasEl, this.objectManager);
        
        // Get camera reference from canvas
        this.camera = this.canvas.camera;
        
        // Initialize EditorInput
        this.input = new EditorInput(this.canvas, this);
        
        // Initialize state
        this.state = {
            selectedObjects: [],
            currentTool: 'select',
            selectedObjectType: null,
            gridEnabled: true,
            snapEnabled: true,
            debugEnabled: false,
            history: [],
            historyIndex: -1
        };
        
        console.log('✓ Core systems initialized');
    }
    
    /**
     * Initialize UI components
     */
    initUI() {
        // Initialize UI components
        this.objectLibrary = new ObjectLibrary(this);
        this.propertiesPanel = new PropertiesPanel(this);
        this.toolbar = new ToolBar(this);
        this.statusBar = new StatusBar(this);
        
        console.log('✓ UI components initialized');
    }
    
    /**
     * Initialize tools
     */
    initTools() {
        // Create tool instances
        this.tools = {
            select: new SelectTool(this),
            place: new PlaceTool(this),
            move: new MoveTool(this),
            delete: new DeleteTool(this)
        };
        
        // Set default tool
        this.setTool('select');
        
        console.log('✓ Tools initialized');
    }
    
    /**
     * Set active tool
     */
    setTool(toolName) {
        if (this.currentTool && this.currentTool.onDeactivate) {
            this.currentTool.onDeactivate();
        }
        
        this.currentTool = this.tools[toolName];
        this.state.currentTool = toolName;
        
        if (this.currentTool && this.currentTool.onActivate) {
            this.currentTool.onActivate();
        }
        
        // Update toolbar
        if (this.toolbar) {
            this.toolbar.selectTool(toolName);
        }
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Canvas controls
        document.getElementById('toggle-grid').addEventListener('change', (e) => {
            this.canvas.showGrid = e.target.checked;
        });
        document.getElementById('toggle-snap').addEventListener('change', (e) => {
            this.state.snapEnabled = e.target.checked;
        });
        document.getElementById('toggle-debug').addEventListener('change', (e) => {
            this.canvas.showDebug = e.target.checked;
        });
        
        console.log('✓ Event listeners setup');
    }
    
    /**
     * Map operations
     */
    newMap() {
        if (confirm('Create new map? Unsaved changes will be lost.')) {
            this.objectManager.clear();
            this.updateStatus('New map created');
            this.updateObjectCount();
        }
    }
    
    saveMap() {
        const data = this.objectManager.saveToJSON();
        const json = JSON.stringify(data, null, 2);
        
        // Download as file
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'map_data.json';
        a.click();
        URL.revokeObjectURL(url);
        
        this.updateStatus('Map saved successfully');
    }
    
    loadMap() {
        const input = document.getElementById('file-input');
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    this.objectManager.loadFromJSON(data);
                    this.updateStatus('Map loaded successfully');
                    this.updateObjectCount();
                } catch (error) {
                    alert('Failed to load map: ' + error.message);
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }
    
    exportMap() {
        this.saveMap(); // Same as save for now
    }
    
    deleteSelected() {
        // Placeholder
        console.log('Delete selected objects');
    }
    
    undo() {
        console.log('Undo');
    }
    
    redo() {
        console.log('Redo');
    }
    
    /**
     * Start render loop
     */
    startRenderLoop() {
        let lastTime = performance.now();
        
        const render = (currentTime) => {
            // Calculate delta time in seconds
            const deltaTime = (currentTime - lastTime) / 1000;
            lastTime = currentTime;
            
            // Update NPCs animations
            if (this.objectManager && this.objectManager.objects) {
                for (const obj of this.objectManager.objects) {
                    if (obj instanceof NPC) {
                        obj.update(deltaTime);
                    }
                }
            }
            
            // Use EditorCanvas render method
            this.canvas.render();
            
            // Call current tool's render if it has one
            if (this.currentTool && this.currentTool.render) {
                this.canvas.ctx.save();
                this.canvas.ctx.scale(this.camera.zoom, this.camera.zoom);
                this.canvas.ctx.translate(-this.camera.x, -this.camera.y);
                this.currentTool.render(this.canvas.ctx, this.camera);
                this.canvas.ctx.restore();
            }
            
            requestAnimationFrame(render);
        };
        
        render(lastTime);
        console.log('✓ Render loop started');
    }
    
    /**
     * Update status bar
     */
    updateStatus(message) {
        if (this.statusBar) {
            this.statusBar.setMessage(message);
        }
    }
    
    /**
     * Update object count display
     */
    updateObjectCount() {
        if (this.statusBar) {
            this.statusBar.updateObjectCount();
        }
    }
    
    /**
     * Update selected count display
     */
    updateSelectedCount() {
        if (this.statusBar) {
            this.statusBar.updateSelectedCount();
        }
    }
}
