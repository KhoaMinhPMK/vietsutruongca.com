/**
 * Main Application Controller
 * Việt Sử Trường Ca: Tiếng Vọng Ngàn Năm
 * 
 * This file initializes and coordinates all game systems
 */

class GameApplication {
    constructor() {
        this.isInitialized = false;
        this.controllers = {};
        this.isLoading = true;
        this.loadingController = null;
        
        // Performance monitoring
        this.performanceMetrics = {
            loadStartTime: performance.now(),
            componentsLoaded: 0,
            totalComponents: 5
        };
        
        // Don't auto-initialize, wait for loading screen
        this.waitForLoadingScreen();
    }

    /**
     * Wait for loading screen to be ready, then initialize
     */
    async waitForLoadingScreen() {        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            await new Promise(resolve => {
                document.addEventListener('DOMContentLoaded', resolve);
            });
        }

        // Start initialization immediately
        this.init();
    }

    /**
     * Initialize the application
     */
    async init() {
        try {
            console.log('🎮 Khởi tạo Việt Sử Trường Ca...');
            
            // Initialize all systems in sequence
            await this.initializeSystems();
            
            // Complete initialization and hide loading screen
            await this.completeInitialization();
            
            console.log('✅ Game initialized successfully!');
            
        } catch (error) {
            console.error('❌ Initialization failed:', error);
            this.handleInitializationError(error);
        }
    }

    /**
     * Update loading progress through the loading controller
     */
    updateLoadingProgress(progress, text) {
        if (this.loadingController) {
            this.loadingController.updateProgress(progress, text);
        }
    }

    /**
     * Initialize all game systems
     */
    async initializeSystems() {
        const systems = [
            {
                name: 'Video Controller',
                progress: 20,
                text: 'Khởi tạo hệ thống video...',
                init: () => this.initVideoController()
            },
            {
                name: 'Three.js Scene',
                progress: 40,
                text: 'Tạo thế giới 3D...',
                init: () => this.initThreeScene()
            },
            {
                name: 'Image Scroll',
                progress: 60,
                text: 'Tải hình ảnh lịch sử...',
                init: () => this.initImageScrollController()
            },
            {
                name: 'Scroll Animations',
                progress: 80,
                text: 'Khởi tạo hiệu ứng cuộn...',
                init: () => this.initScrollAnimations()
            },
            {
                name: 'Navigation',
                progress: 90,
                text: 'Chuẩn bị giao diện...',
                init: () => this.initNavigation()
            }
        ];

        for (const system of systems) {
            try {
                this.updateLoadingProgress(system.progress, system.text);
                
                console.log(`🔄 Initializing ${system.name}...`);
                const controller = await system.init();
                
                if (controller) {
                    this.controllers[system.name.toLowerCase().replace(/\s+/g, '_')] = controller;
                    this.performanceMetrics.componentsLoaded++;
                }
                
                // Small delay to show progress
                await new Promise(resolve => setTimeout(resolve, 300));
                
            } catch (error) {
                console.error(`❌ Failed to initialize ${system.name}:`, error);
            }
        }
    }

    /**
     * Initialize video controller
     */
    async initVideoController() {
        if (typeof VideoController !== 'undefined') {
            const controller = new VideoController();
            console.log('✅ Video controller initialized');
            return controller;
        } else {
            console.warn('⚠️ VideoController not available');
            return null;
        }
    }

    /**
     * Initialize Three.js scene
     */
    async initThreeScene() {
        if (typeof ThreeSceneController !== 'undefined') {
            const controller = new ThreeSceneController();
            console.log('✅ Three.js scene initialized');
            return controller;
        } else {
            console.warn('⚠️ ThreeSceneController not available');
            return null;
        }
    }    /**
     * Initialize image scroll controller with enhanced coordination
     */
    async initImageScrollController() {
        if (typeof ImageScrollController !== 'undefined') {
            const controller = new ImageScrollController();
            
            // CRITICAL FIX: Store reference globally for coordination
            window.imageScrollController = controller;
            
            console.log('✅ Image scroll controller initialized with coordination');
            return controller;
        } else {
            console.warn('⚠️ ImageScrollController not available');
            return null;
        }
    }

    /**
     * Initialize scroll animations with coordination
     */
    async initScrollAnimations() {
        if (typeof ScrollAnimations !== 'undefined') {
            const controller = new ScrollAnimations();
            
            // ENHANCED: Store reference globally for coordination
            window.scrollAnimationsController = controller;
            
            console.log('✅ Scroll animations initialized with coordination');
            return controller;
        } else {
            console.warn('⚠️ ScrollAnimationController not available');
            return null;
        }
    }    /**
     * Initialize navigation
     */
    async initNavigation() {
        if (typeof NavigationController !== 'undefined') {
            const controller = new NavigationController();
            
            // Also initialize the enhancer if available
            if (typeof NavigationEnhancer !== 'undefined') {
                setTimeout(() => {
                    new NavigationEnhancer();
                }, 100);
            }
            
            console.log('✅ Navigation controller initialized');
            return controller;
        } else {
            console.warn('⚠️ NavigationController not available');
            return null;
        }
    }

    /**
     * Complete initialization and show content
     */
    async completeInitialization() {
        this.updateLoadingProgress(95, 'Hoàn tất khởi tạo...');
        
        // Setup global event listeners
        this.setupGlobalEvents();
        
        this.updateLoadingProgress(100, 'Sẵn sàng!');
        
        // Wait a moment then hide loading screen
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Hide loading screen through controller
        if (this.loadingController) {
            await this.loadingController.hide();
        }
        
        this.isInitialized = true;
        this.isLoading = false;
        
        // Performance logging
        const loadTime = performance.now() - this.performanceMetrics.loadStartTime;
        console.log(`🚀 Application loaded in ${loadTime.toFixed(2)}ms`);
        console.log(`📊 Components loaded: ${this.performanceMetrics.componentsLoaded}/${this.performanceMetrics.totalComponents}`);
        
        // Dispatch ready event
        window.dispatchEvent(new CustomEvent('gameReady', {
            detail: {
                loadTime,
                controllers: this.controllers,
                componentsLoaded: this.performanceMetrics.componentsLoaded
            }
        }));
    }

    /**
     * Setup global event listeners
     */
    setupGlobalEvents() {
        // Performance monitoring
        window.addEventListener('beforeunload', () => {
            const sessionTime = performance.now() - this.performanceMetrics.loadStartTime;
            console.log(`📊 Session duration: ${(sessionTime / 1000).toFixed(1)}s`);
        });

        // Handle visibility changes for performance
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAnimations();
            } else {
                this.resumeAnimations();
            }
        });

        // Handle resize events
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.handleResize();
            }, 250);
        });

        // Touch device optimization
        if ('ontouchstart' in window) {
            document.body.classList.add('touch-device');
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });
    }

    /**
     * Handle keyboard shortcuts
     */
    handleKeyboardShortcuts(event) {
        // Debug shortcuts (only in development)
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            switch (event.key) {
                case 'F1':
                    event.preventDefault();
                    this.showDebugInfo();
                    break;
                case 'F2':
                    event.preventDefault();
                    this.togglePerformanceMode();
                    break;
            }
        }
    }

    /**
     * Pause animations for performance
     */
    pauseAnimations() {
        Object.values(this.controllers).forEach(controller => {
            if (controller && typeof controller.pause === 'function') {
                controller.pause();
            }
        });
    }

    /**
     * Resume animations
     */
    resumeAnimations() {
        Object.values(this.controllers).forEach(controller => {
            if (controller && typeof controller.resume === 'function') {
                controller.resume();
            }
        });
    }

    /**
     * Handle window resize
     */
    handleResize() {
        Object.values(this.controllers).forEach(controller => {
            if (controller && typeof controller.handleResize === 'function') {
                controller.handleResize();
            }
        });
    }

    /**
     * Show debug information
     */
    showDebugInfo() {
        console.group('🐛 Debug Information');
        console.log('Controllers:', this.controllers);
        console.log('Performance:', this.performanceMetrics);
        console.log('Is Initialized:', this.isInitialized);
        console.log('Is Loading:', this.isLoading);
        console.groupEnd();
    }

    /**
     * Toggle performance mode
     */
    togglePerformanceMode() {
        document.body.classList.toggle('performance-mode');
        const isPerformanceMode = document.body.classList.contains('performance-mode');
        console.log(`🔧 Performance mode: ${isPerformanceMode ? 'ON' : 'OFF'}`);
    }

    /**
     * Handle initialization errors
     */
    handleInitializationError(error) {
        console.error('🚨 Critical initialization error:', error);
        
        // Hide loading screen if it exists
        if (this.loadingController) {
            this.loadingController.hide();
        }
        
        // Show error message to user
        const errorHTML = `
            <div id="error-screen" style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #1a1a1a 0%, #2d1b3d 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                color: white;
                font-family: Arial, sans-serif;
                text-align: center;
            ">
                <div>
                    <h1 style="color: #ff6b6b; margin-bottom: 1rem;">⚠️ Lỗi Khởi Tạo</h1>
                    <p style="margin-bottom: 2rem; opacity: 0.8;">Có lỗi xảy ra khi tải game. Vui lòng thử lại.</p>
                    <button onclick="location.reload()" style="
                        background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
                        border: none;
                        padding: 12px 24px;
                        border-radius: 25px;
                        color: white;
                        cursor: pointer;
                        font-size: 1rem;
                        transition: transform 0.2s ease;
                    " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                        🔄 Tải Lại Trang
                    </button>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', errorHTML);
    }

    /**
     * Public API for external access
     */
    getController(name) {
        return this.controllers[name];
    }

    isReady() {
        return this.isInitialized && !this.isLoading;
    }

    getPerformanceMetrics() {
        return { ...this.performanceMetrics };
    }
}

// Initialize the application
let gameApp;

// Wait for loading screen to be available before initializing
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        gameApp = new GameApplication();
    });
} else {
    gameApp = new GameApplication();
}

// Export for global access
window.GameApplication = GameApplication;
window.gameApp = gameApp;
