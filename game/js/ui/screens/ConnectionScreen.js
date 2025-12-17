// Connection Screen - Shows unstable connection message (stays indefinitely)
class ConnectionScreen {
    constructor() {
        this.connectionScreen = document.getElementById('connection-screen');
    }

    /**
     * Start connection screen - stays here indefinitely
     */
    start() {
        console.log('Connection screen started - connection unstable');
        
        // Screen will stay here indefinitely
        // No automatic transition
    }

    /**
     * Skip to game manually (for testing or manual override)
     */
    skip() {
        console.log('Manually skipping to game...');
        
        // Switch to screen 1
        switchScreen(SCREENS.CONNECTION, SCREENS.SCREEN1);
        
        // Start screen 1 if exists
        if (window.screen1) {
            window.screen1.start();
        }
    }
}

