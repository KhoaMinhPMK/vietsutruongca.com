// Helper Functions

/**
 * Switch between screens
 * @param {string} hideScreenId - Screen to hide
 * @param {string} showScreenId - Screen to show
 */
function switchScreen(hideScreenId, showScreenId) {
    const hideScreen = document.getElementById(hideScreenId);
    const showScreen = document.getElementById(showScreenId);
    
    if (hideScreen) {
        hideScreen.classList.remove('active');
    }
    
    if (showScreen) {
        showScreen.classList.add('active');
    }
}

/**
 * Play audio with error handling
 * @param {HTMLAudioElement} audio - Audio element
 */
function playAudio(audio) {
    if (audio) {
        audio.play().catch(error => {
            console.warn('Audio playback failed:', error);
        });
    }
}

/**
 * Fade out audio smoothly
 * @param {HTMLAudioElement} audio - Audio element
 * @param {number} duration - Fade duration in ms (default: 1000ms)
 */
function fadeOutAudio(audio, duration = 1000) {
    if (!audio) return;
    
    const startVolume = audio.volume;
    const fadeStep = startVolume / (duration / 50); // Update every 50ms
    
    const fadeInterval = setInterval(() => {
        if (audio.volume > fadeStep) {
            audio.volume -= fadeStep;
        } else {
            audio.volume = 0;
            audio.pause();
            audio.currentTime = 0;
            audio.volume = startVolume; // Reset volume for next use
            clearInterval(fadeInterval);
        }
    }, 50);
}
