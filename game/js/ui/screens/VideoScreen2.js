/**
 * VideoScreen2 - Phát video 2.mp4 sau IntermissionScreen, trước Screen3
 */
class VideoScreen2 {
    constructor() {
        this.screen = document.getElementById('video-screen-2');
        this.video = document.getElementById('story-video-2');
        this.skipBtn = document.getElementById('skip-video-btn-2');
        this.ended = false;

        this.setupEvents();
        console.log('✅ VideoScreen2 initialized');
    }

    /**
     * Setup video events
     */
    setupEvents() {
        if (this.video) {
            this.video.addEventListener('ended', () => {
                this.onVideoEnd();
            });
        }

        if (this.skipBtn) {
            this.skipBtn.addEventListener('click', () => {
                this.onVideoEnd();
            });
        }

        this.keyHandler = (e) => {
            if ((e.code === 'Space' || e.code === 'Enter') && this.isActive()) {
                e.preventDefault();
                this.onVideoEnd();
            }
        };
    }

    isActive() {
        return this.screen && this.screen.classList.contains('active');
    }

    /**
     * Start playing the video
     */
    start() {
        console.log('🎬 VideoScreen2 started');
        this.ended = false;

        // Show this screen
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        if (this.screen) this.screen.classList.add('active');

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
                console.error('Video 2 play failed:', err);
                this.onVideoEnd();
            });
        } else {
            console.error('❌ Video 2 element not found');
            this.onVideoEnd();
        }
    }

    /**
     * Handle video end (natural or skipped)
     */
    onVideoEnd() {
        if (this.ended) return;
        this.ended = true;

        console.log('🎬 Video 2 ended, transitioning to Screen3');

        document.removeEventListener('keydown', this.keyHandler);

        if (this.video) {
            this.video.pause();
        }

        // Hide video screen, show screen-3
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));

        // Start Screen3
        if (window.game && window.game.screen3) {
            window.game.screen3.start();
        }
    }

    destroy() {
        document.removeEventListener('keydown', this.keyHandler);
        if (this.video) {
            this.video.pause();
            this.video.currentTime = 0;
        }
    }
}
