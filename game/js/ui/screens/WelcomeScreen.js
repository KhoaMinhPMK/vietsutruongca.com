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
    onPlayClick() {
        console.log('Play button clicked');
        
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
