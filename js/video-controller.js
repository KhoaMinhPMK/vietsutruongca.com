// Video Controller for Hero Section
class VideoController {
    constructor() {
        this.video = document.getElementById('hero-video');
        this.overlay = document.querySelector('.video-overlay');
        this.isPlaying = false;
        this.cycleStartTime = 3; // Start video at 3 seconds
        this.cycleEndTime = 35; // End video at 35 seconds
        this.fadeDuration = 2000; // 2 seconds fade duration
        
        this.init();
    }    init() {
        if (!this.video) {
            return;
        }

        // Wait for video metadata to load
        this.video.addEventListener('loadedmetadata', () => {
            this.setupVideoProperties();
            this.startVideoCycle();
        });        // Handle video loading errors
        this.video.addEventListener('error', (e) => {
            this.handleVideoError();
        });

        // Preload video
        this.video.load();
    }

    setupVideoProperties() {
        // Set video properties for optimal performance
        this.video.muted = true;
        this.video.loop = false;
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
            
            // Monitor video progress
            this.monitorVideoProgress();
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
    }    async endVideoSegment() {
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
    }    handleVideoError() {
        // Hide video and show a fallback background
        this.video.style.display = 'none';
        this.overlay.style.background = 'linear-gradient(135deg, #0f0f0f 0%, #2a1810 50%, #1a1a1a 100%)';
        this.overlay.classList.remove('transparent');
        this.overlay.classList.add('fade-in');
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
