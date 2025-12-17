// Connection Screen - Shows unstable connection message
class ConnectionScreen {
    constructor() {
        this.connectionScreen = document.getElementById('connection-screen');
        this.displayDuration = 5000; // Show for 5 seconds
    }

    /**
     * Start connection screen
     */
    start() {
        console.log('Connection screen started');
        
        // Auto transition to Screen1 after duration
        setTimeout(() => {
            this.transitionToGame();
        }, this.displayDuration);
    }

    /**
     * Transition to main game (Screen1)
     */
    transitionToGame() {
        console.log('Transitioning to game...');
        
        // Switch to screen 1
        switchScreen(SCREENS.CONNECTION, SCREENS.SCREEN1);
        
        // Start screen 1 if exists
        if (window.screen1) {
            window.screen1.start();
        }
    }

    /**
     * Skip to game immediately (for testing or user action)
     */
    skip() {
        this.transitionToGame();
    }
}

