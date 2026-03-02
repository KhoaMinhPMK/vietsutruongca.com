/**
 * VideoScreen - Phát video 1.mp4 sau màn Loading, trước Screen1
 */
class VideoScreen {
    constructor() {
        this.screen = document.getElementById('video-screen');
        this.video = document.getElementById('story-video');
        this.skipBtn = document.getElementById('skip-video-btn');
        this.ended = false;

        this.setupEvents();
        console.log('✅ VideoScreen initialized');
    }

    /**
     * Setup video events
     */
    setupEvents() {
        // When video ends naturally
        if (this.video) {
            this.video.addEventListener('ended', () => {
                this.onVideoEnd();
            });
        }

        // Skip button
        if (this.skipBtn) {
            this.skipBtn.addEventListener('click', () => {
                this.onVideoEnd();
            });
        }

        // Allow skip with Space or Enter key
        this.keyHandler = (e) => {
            if ((e.code === 'Space' || e.code === 'Enter') && this.isActive()) {
                e.preventDefault();
                this.onVideoEnd();
            }
        };
    }

    /**
     * Check if this screen is currently active
     */
    isActive() {
        return this.screen && this.screen.classList.contains('active');
    }

    /**
     * Start playing the video
     */
    start() {
        console.log('🎬 VideoScreen started');
        this.ended = false;

        // Listen for skip key
        document.addEventListener('keydown', this.keyHandler);

        // Show skip button after 2 seconds
        if (this.skipBtn) {
            this.skipBtn.style.opacity = '0';
            this.skipBtn.style.display = 'block';
            setTimeout(() => {
                if (this.skipBtn) this.skipBtn.style.opacity = '1';
            }, 2000);
        }

        // Play video
        if (this.video) {
            this.video.currentTime = 0;
            this.video.play().catch(err => {
                console.error('Video play failed:', err);
                // If video fails, skip to next screen
                this.onVideoEnd();
            });
        } else {
            console.error('❌ Video element not found');
            this.onVideoEnd();
        }
    }

    /**
     * Handle video end (natural or skipped)
     */
    onVideoEnd() {
        if (this.ended) return; // Prevent double trigger
        this.ended = true;

        console.log('🎬 Video ended, transitioning to Screen1');

        // Remove key listener
        document.removeEventListener('keydown', this.keyHandler);

        // Pause video
        if (this.video) {
            this.video.pause();
        }

        // Transition to Screen1
        switchScreen(SCREENS.VIDEO, SCREENS.SCREEN1);

        // Start Screen1
        if (window.screen1) {
            window.screen1.start();
        }
    }

    /**
     * Cleanup
     */
    destroy() {
        document.removeEventListener('keydown', this.keyHandler);
        if (this.video) {
            this.video.pause();
            this.video.currentTime = 0;
        }
    }
}
