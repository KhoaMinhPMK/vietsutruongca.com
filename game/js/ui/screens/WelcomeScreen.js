// Welcome Screen Logic
class WelcomeScreen {
    constructor() {
        this.welcomeScreen = document.getElementById('welcome-screen');
        this.playButton = document.getElementById('play-button');
        
        this.init();
    }

    /**
     * Initialize welcome screen
     */
    init() {
        // Add click event to play button
        if (this.playButton) {
            this.playButton.addEventListener('click', () => {
                this.onPlayClick();
            });
        }
        
        // Add keyboard support (Space key)
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && this.welcomeScreen.classList.contains('active')) {
                e.preventDefault();
                this.onPlayClick();
            }
        });
    }

    /**
     * Handle play button click
     */
    async onPlayClick() {
        console.log('Play button clicked');
        
        // Try to enter fullscreen immediately (user gesture)
        await this.tryEnterFullscreen();
        
        // Hide welcome screen, show intro screen
        switchScreen(SCREENS.WELCOME, SCREENS.INTRO);
        
        // Start intro sequence
        if (window.introScreen) {
            console.log('Starting intro...');
            window.introScreen.start();
        } else {
            console.error('IntroScreen not found! window.introScreen is:', window.introScreen);
        }
    }
    
    /**
     * Try to enter fullscreen on mobile
     */
    async tryEnterFullscreen() {
        try {
            const isMobile = window.innerWidth <= 768 || 
                           /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            
            if (isMobile && !document.fullscreenElement) {
                await document.documentElement.requestFullscreen({ navigationUI: "hide" });
                console.log('✓ Fullscreen enabled on Play click');
            }
        } catch (error) {
            console.log('Fullscreen not available:', error.message);
        }
    }

    /**
     * Show welcome screen
     */
    show() {
        this.welcomeScreen.classList.add('active');
    }

    /**
     * Hide welcome screen
     */
    hide() {
        this.welcomeScreen.classList.remove('active');
    }
}
