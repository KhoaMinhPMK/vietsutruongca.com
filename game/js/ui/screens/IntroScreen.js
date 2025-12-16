// Intro Screen Logic
class IntroScreen {
    constructor() {
        this.introScreen = document.getElementById('intro-screen');
        this.introAudio = document.getElementById('intro-audio');
        this.logoImg = document.getElementById('intro-logo');
        this.introDuration = GAME_CONFIG.INTRO_DURATION;
        
        // Debug logo element
        console.log('Logo element:', this.logoImg);
        if (this.logoImg) {
            console.log('Logo src:', this.logoImg.src);
            console.log('Logo computed style:', window.getComputedStyle(this.logoImg).opacity);
        }
    }

    /**
     * Start the intro sequence
     */
    start() {
        console.log('Intro started');
        
        // Force logo to be visible and restart animation
        if (this.logoImg) {
            console.log('Restarting logo animation...');
            this.logoImg.style.animation = 'none';
            // Force reflow
            void this.logoImg.offsetWidth;
            this.logoImg.style.animation = 'introFade 7s ease-in-out forwards';
        }
        
        // Check if audio element exists
        if (!this.introAudio) {
            console.error('Audio element not found!');
        } else {
            console.log('Audio src:', this.introAudio.src);
            
            // Set volume to max
            this.introAudio.volume = 1.0;
            
            // Try to play audio with detailed error handling
            const playPromise = this.introAudio.play();
            
            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        console.log('Audio playing successfully!');
                    })
                    .catch(error => {
                        console.error('Audio playback failed:', error);
                        console.error('Error name:', error.name);
                        console.error('Error message:', error.message);
                    });
            }
        }
        
        // Automatically transition to game after intro duration
        setTimeout(() => {
            this.end();
        }, this.introDuration);
    }

    /**
     * End the intro and transition to loading screen
     */
    end() {
        console.log('Intro ended');
        
        // Fade out audio smoothly
        fadeOutAudio(this.introAudio, 800);
        
        // Switch to loading screen
        switchScreen(SCREENS.INTRO, SCREENS.LOADING);
        
        // Start loading screen
        if (window.loadingScreen) {
            window.loadingScreen.start();
        }
    }

    /**
     * Allow skipping intro (optional - có thể dùng sau)
     */
    skip() {
        this.end();
    }
}
