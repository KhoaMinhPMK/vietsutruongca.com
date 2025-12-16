// Main Entry Point
let welcomeScreen;
let introScreen;
let loadingScreen;
let screen1;
let game;

// Initialize when page loads
window.addEventListener('DOMContentLoaded', () => {
    console.log('Game loading...');
    
    // Create welcome screen
    welcomeScreen = new WelcomeScreen();
    window.welcomeScreen = welcomeScreen;
    
    // Create intro screen (but don't start yet)
    introScreen = new IntroScreen();
    window.introScreen = introScreen;
    
    // Create loading screen (but don't start yet)
    loadingScreen = new LoadingScreen();
    window.loadingScreen = loadingScreen;
    
    // Create screen 1 (but don't start yet)
    screen1 = new Screen1();
    window.screen1 = screen1;
    
    console.log('All screens initialized');
    
    // Welcome screen is already visible
    // Flow: Welcome -> Intro -> Loading -> Screen1 (Map)
});

// Optional: Allow skipping intro with Space key (only during intro)
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && introScreen) {
        const introScreenElement = document.getElementById('intro-screen');
        if (introScreenElement && introScreenElement.classList.contains('active')) {
            introScreen.skip();
        }
    }
});
