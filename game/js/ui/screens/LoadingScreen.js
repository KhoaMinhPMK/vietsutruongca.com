// Loading Screen with background slideshow and real asset loading
class LoadingScreen {
    constructor() {
        this.loadingScreen = document.getElementById('loading-screen');
        this.loadingText = document.querySelector('.loading-text');
        this.loadingBarFill = document.querySelector('.loading-bar-fill');
        this.loadingPercentage = document.querySelector('.loading-percentage');
        this.backgroundVideo = document.getElementById('loading-video');
        this.backgroundImages = document.querySelectorAll('.loading-bg-image');
        this.loadingAudio = document.getElementById('loading-audio');
        
        this.currentBgIndex = 0;
        this.videoEnded = false;
        this.assetLoader = new AssetLoader();
    }

    /**
     * Start loading screen
     */
    start() {
        console.log('Loading screen started');
        
        // Play background music
        playAudio(this.loadingAudio);
        
        // Setup video ended event
        if (this.backgroundVideo) {
            this.backgroundVideo.addEventListener('ended', () => {
                this.onVideoEnded();
            });
            this.backgroundVideo.play().catch(err => {
                console.error('Video play failed:', err);
                this.onVideoEnded(); // Skip to images if video fails
            });
        } else {
            this.onVideoEnded(); // Start with images if no video
        }
        
        // Setup asset loader
        this.setupAssetLoader();
        
        // Start loading assets
        this.assetLoader.load();
    }

    /**
     * Setup asset loader with callbacks
     */
    setupAssetLoader() {
        // Set assets to load from config
        this.assetLoader.setAssets(GAME_ASSETS);
        
        // Progress callback
        this.assetLoader.onProgress((progress, loaded, total) => {
            this.updateProgress(progress);
        });
        
        // Complete callback
        this.assetLoader.onLoad(() => {
            this.onLoadingComplete();
        });
    }

    /**
     * Update loading progress (với fake delay để chậm hơn)
     */
    updateProgress(percentage) {
        const roundedPercent = Math.round(percentage);
        
        if (this.loadingBarFill) {
            this.loadingBarFill.style.width = roundedPercent + '%';
        }
        
        if (this.loadingPercentage) {
            this.loadingPercentage.textContent = roundedPercent + '%';
        }
        
        console.log('Loading progress:', roundedPercent + '%');
    }

    /**
     * Called when video ends
     */
    onVideoEnded() {
        console.log('Video ended, switching to images');
        this.videoEnded = true;
        
        // Hide video
        if (this.backgroundVideo) {
            this.backgroundVideo.style.display = 'none';
        }
        
        // Start image slideshow
        this.startImageSlideshow();
    }

    /**
     * Start background image slideshow
     */
    startImageSlideshow() {
        // Show first image
        if (this.backgroundImages.length > 0) {
            this.backgroundImages[0].classList.add('active');
            this.currentBgIndex = 0;
        }
        
        // Change image every 5 seconds
        this.slideshowInterval = setInterval(() => {
            this.nextBackground();
        }, 5000);
    }

    /**
     * Switch to next background image
     */
    nextBackground() {
        if (this.backgroundImages.length === 0) return;
        
        // Hide current
        this.backgroundImages[this.currentBgIndex].classList.remove('active');
        
        // Next index
        this.currentBgIndex = (this.currentBgIndex + 1) % this.backgroundImages.length;
        
        // Show next
        this.backgroundImages[this.currentBgIndex].classList.add('active');
    }

    /**
     * Called when all assets loaded
     */
    onLoadingComplete() {
        console.log('Loading complete!');
        
        // Stop slideshow
        if (this.slideshowInterval) {
            clearInterval(this.slideshowInterval);
        }
        
        // Fade out audio smoothly
        fadeOutAudio(this.loadingAudio, 1000);
        
        // Delay a bit before transition
        setTimeout(() => {
            this.transitionToGame();
        }, 1200); // Tăng thêm để đợi fade out hoàn tất
    }

    /**
     * Transition to main game
     */
    transitionToGame() {
        // Try to enter fullscreen automatically
        this.tryAutoFullscreen();
        
        // Switch to screen 1
        switchScreen(SCREENS.LOADING, SCREENS.SCREEN1);
        
        // Start screen 1 if exists
        if (window.screen1) {
            window.screen1.start();
        }
    }
    
    /**
     * Try to enter fullscreen automatically
     */
    async tryAutoFullscreen() {
        try {
            // Only try on mobile or if screen is small
            const isMobile = window.innerWidth <= 768 || 
                           /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            
            if (isMobile && !document.fullscreenElement) {
                await document.documentElement.requestFullscreen({ navigationUI: "hide" });
                console.log('✓ Auto fullscreen enabled');
            }
        } catch (error) {
            // Ignore error - user can manually click fullscreen button
            console.log('Auto fullscreen not available (user can click button)');
        }
    }
}
