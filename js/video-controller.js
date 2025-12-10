// Video Controller for Hero Section
class VideoController {
    constructor() {
        this.video = document.getElementById('hero-video');
        this.overlay = document.querySelector('.video-overlay');
        this.fallback = document.querySelector('.video-fallback');
        this.isPlaying = false;
        this.cycleStartTime = 3; // Start video at 3 seconds
        this.cycleEndTime = 35; // End video at 35 seconds
        this.fadeDuration = 2000; // 2 seconds fade duration
        this.videoLoaded = false;
        this.retryCount = 0;
        this.maxRetries = 2;

        this.init();
    } init() {
        if (!this.video) {
            this.showFallback();
            return;
        }

        // Set timeout for video loading
        this.loadingTimeout = setTimeout(() => {
            if (!this.videoLoaded) {
                console.log('Video loading timeout, showing fallback');
                this.handleVideoError();
            }
        }, 5000); // 5 second timeout

        // Wait for video metadata to load
        this.video.addEventListener('loadedmetadata', () => {
            clearTimeout(this.loadingTimeout);
            this.videoLoaded = true;
            this.setupVideoProperties();
            this.hideFallback();
            this.startVideoCycle();
        });

        // Handle video loading errors
        this.video.addEventListener('error', (e) => {
            clearTimeout(this.loadingTimeout);
            this.handleVideoError();
        });

        // Handle video can play
        this.video.addEventListener('canplay', () => {
            if (!this.videoLoaded) {
                clearTimeout(this.loadingTimeout);
                this.videoLoaded = true;
                this.hideFallback();
            }
        });

        // Preload video
        this.video.load();
    }

    setupVideoProperties() {
        // Set video properties for optimal performance
        this.video.muted = true;
        this.video.loop = true; // Enable continuous looping
        this.video.preload = 'metadata';
        // Set initial video time
        this.video.currentTime = this.cycleStartTime;
    }

    startVideoCycle() {
        this.playVideoSegment();
    }

    async playVideoSegment() {
        try {
            // Ensure video starts at the correct time
            this.video.currentTime = this.cycleStartTime;

            // Start playing the video
            await this.video.play();
            this.isPlaying = true;

            // Fade in the video (fade out the overlay)
            this.fadeInVideo();

            console.log('🎬 Video playing continuously');
        } catch (error) {
            this.handleVideoError();
        }
    }

    monitorVideoProgress() {
        const checkProgress = () => {
            if (!this.isPlaying) return;

            const currentTime = this.video.currentTime;

            // Check if we've reached the end time for this cycle
            if (currentTime >= this.cycleEndTime) {
                this.endVideoSegment();
                return;
            }

            // Continue monitoring
            requestAnimationFrame(checkProgress);
        };

        requestAnimationFrame(checkProgress);
    }

    fadeInVideo() {        // Add visible class to video
        this.video.classList.add('visible');

        // Fade out the overlay to reveal video
        this.overlay.classList.add('transparent');
        this.overlay.classList.remove('fade-in');
    } async endVideoSegment() {
        // Pause the video
        this.video.pause();
        this.isPlaying = false;

        // Fade out the video (fade in the overlay)
        await this.fadeOutVideo();

        // Wait a moment before starting the next cycle
        setTimeout(() => {
            this.startVideoCycle();
        }, 1000); // 1 second pause between cycles
    }

    fadeOutVideo() {
        return new Promise((resolve) => {            // Fade in the overlay to hide video
            this.overlay.classList.remove('transparent');
            this.overlay.classList.add('fade-in');

            // Wait for fade animation to complete
            setTimeout(() => {
                this.video.classList.remove('visible');
                resolve();
            }, this.fadeDuration);
        });
    } handleVideoError() {
        console.log(`Video loading failed (attempt ${this.retryCount + 1}/${this.maxRetries})`);

        if (this.retryCount < this.maxRetries) {
            this.retryCount++;
            setTimeout(() => {
                this.video.load();
            }, 1000 * this.retryCount); // Progressive retry delay
        } else {
            // Final fallback
            this.showFallback();
            console.log('Video loading failed, using static fallback');
        }
    }

    showFallback() {
        if (this.video) {
            this.video.style.display = 'none';
        }

        if (this.fallback) {
            this.fallback.style.opacity = '1';
            this.fallback.classList.remove('hidden');
        }

        // Keep overlay for proper visual effect
        this.overlay.classList.remove('transparent');
        this.overlay.classList.add('fade-in');
    }

    hideFallback() {
        if (this.fallback) {
            this.fallback.style.opacity = '0';
            setTimeout(() => {
                this.fallback.classList.add('hidden');
            }, 2000);
        }
    }

    // Method to pause video cycle (useful for when user interacts with page)
    pauseVideoCycle() {
        if (this.isPlaying) {
            this.video.pause();
            this.isPlaying = false;
        }
    }

    // Method to resume video cycle
    resumeVideoCycle() {
        if (!this.isPlaying) {
            this.startVideoCycle();
        }
    }

    // Method to handle visibility change (pause when tab is not active)
    handleVisibilityChange() {
        if (document.hidden) {
            this.pauseVideoCycle();
        } else {
            // Resume after a short delay
            setTimeout(() => {
                this.resumeVideoCycle();
            }, 500);
        }
    }
}

// Page Visibility API to handle tab switching
document.addEventListener('visibilitychange', () => {
    if (window.videoController) {
        window.videoController.handleVisibilityChange();
    }
});

// Initialize video controller when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.videoController = new VideoController();
});

// Additional video optimization functions
function optimizeVideoPerformance() {
    const video = document.getElementById('hero-video');
    if (!video) return;

    // Set optimal video attributes for web performance
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');

    // Disable picture-in-picture on supported browsers
    if ('disablePictureInPicture' in video) {
        video.disablePictureInPicture = true;
    }

    // Prevent context menu on video
    video.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });

    // Prevent video controls
    video.controls = false;
}

// Call optimization function
document.addEventListener('DOMContentLoaded', optimizeVideoPerformance);

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VideoController;
}
