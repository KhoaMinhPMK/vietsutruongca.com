// Main Entry Point
let welcomeScreen;
let introScreen;
let loadingScreen;
let screen1;
let screen2;
let intermissionScreen;
let screen3;
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
    
    // Create screen 2 (but don't start yet)
    screen2 = new Screen2();
    window.screen2 = screen2;
    
    // Create intermission screen (map selection)
    intermissionScreen = new IntermissionScreen();
    window.intermissionScreen = intermissionScreen;
    
    // Create screen 3 (but don't start yet)
    screen3 = new Screen3();
    window.screen3 = screen3;
    
    // Create game object for global access
    game = {
        screen1,
        screen2,
        intermissionScreen,
        screen3
    };
    window.game = game;
    
    console.log('All screens initialized');
    
    // Debug: Test command để jump vào IntermissionScreen
    window.testIntermission = () => {
        console.log('🧪 Testing IntermissionScreen...');
        // Hide all screens
        document.querySelectorAll('.screen').forEach(s => s.style.display = 'none');
        // Load and show intermission
        intermissionScreen.load().then(() => {
            intermissionScreen.show();
        });
    };
    
    console.log('%c💡 Debug command: testIntermission()', 'color: #00ff00; font-weight: bold');
    
    // Welcome screen is already visible
    // Flow: Welcome -> Intro -> Loading -> Screen1 (Map) -> Screen2 (Wood) -> IntermissionScreen -> Screen3 (Combat)
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
