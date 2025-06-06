// Character Slide Controller - Hollow Knight Style
class CharacterSlideController {
    constructor() {
        this.currentSlide = 0;
        this.slides = [];
        this.slideContainer = null;
        this.isAnimating = false;
        this.autoSlideInterval = null;
        this.autoSlideDelay = 8000; // 8 seconds
        
        this.init();
    }

    init() {
        this.slideContainer = document.querySelector('.character-slide-wrapper');
        if (!this.slideContainer) return;

        this.slides = document.querySelectorAll('.character-slide');
        this.setupControls();
        this.setupIndicators();
        this.setupKeyboardNavigation();
        this.setupTouchNavigation();
        this.showSlide(0);
        this.startAutoSlide();
        this.setupVisibilityChange();
    }

    setupControls() {
        const prevBtn = document.querySelector('.slide-nav-btn.prev');
        const nextBtn = document.querySelector('.slide-nav-btn.next');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.previousSlide());
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextSlide());
        }
    }

    setupIndicators() {
        const indicators = document.querySelectorAll('.slide-indicator');
        indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => this.goToSlide(index));
        });
    }

    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            if (!this.isSlideInView()) return;

            switch(e.key) {
                case 'ArrowLeft':
                case 'ArrowUp':
                    e.preventDefault();
                    this.previousSlide();
                    break;
                case 'ArrowRight':
                case 'ArrowDown':
                    e.preventDefault();
                    this.nextSlide();
                    break;
                case ' ': // Spacebar
                    e.preventDefault();
                    this.nextSlide();
                    break;
                case 'Home':
                    e.preventDefault();
                    this.goToSlide(0);
                    break;
                case 'End':
                    e.preventDefault();
                    this.goToSlide(this.slides.length - 1);
                    break;
            }
        });
    }

    setupTouchNavigation() {
        let touchStartX = 0;
        let touchEndX = 0;
        let touchStartY = 0;
        let touchEndY = 0;

        this.slideContainer.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        }, { passive: true });

        this.slideContainer.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].clientX;
            touchEndY = e.changedTouches[0].clientY;
            this.handleSwipe(touchStartX, touchEndX, touchStartY, touchEndY);
        }, { passive: true });
    }

    handleSwipe(startX, endX, startY, endY) {
        const deltaX = endX - startX;
        const deltaY = endY - startY;
        const minSwipeDistance = 50;

        // Check if horizontal swipe is more prominent than vertical
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
            if (deltaX > 0) {
                this.previousSlide();
            } else {
                this.nextSlide();
            }
        }
    }

    setupVisibilityChange() {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.stopAutoSlide();
            } else {
                this.startAutoSlide();
            }
        });

        // Pause auto-slide when user interacts
        this.slideContainer.addEventListener('mouseenter', () => this.stopAutoSlide());
        this.slideContainer.addEventListener('mouseleave', () => this.startAutoSlide());
    }

    isSlideInView() {
        const section = document.querySelector('.character-slide-section');
        if (!section) return false;

        const rect = section.getBoundingClientRect();
        const viewHeight = window.innerHeight;
        const threshold = viewHeight * 0.5; // 50% of viewport

        return rect.top < threshold && rect.bottom > (viewHeight - threshold);
    }

    showSlide(index, direction = 'next') {
        if (this.isAnimating || index === this.currentSlide) return;
        
        this.isAnimating = true;
        this.stopAutoSlide();

        // Update indicators
        this.updateIndicators(index);

        // Remove all classes
        this.slides.forEach(slide => {
            slide.classList.remove('active', 'prev', 'next');
        });

        // Set new active slide
        const prevIndex = this.currentSlide;
        this.currentSlide = index;

        // Add appropriate classes
        this.slides[this.currentSlide].classList.add('active');
        
        // Add prev/next classes for smooth transitions
        if (direction === 'next') {
            if (prevIndex < this.slides.length) {
                this.slides[prevIndex]?.classList.add('prev');
            }
        } else {
            if (prevIndex < this.slides.length) {
                this.slides[prevIndex]?.classList.add('next');
            }
        }

        // Animate slide content
        this.animateSlideContent();

        // Reset animation flag
        setTimeout(() => {
            this.isAnimating = false;
            this.startAutoSlide();
        }, 800);
    }

    animateSlideContent() {
        const activeSlide = this.slides[this.currentSlide];
        if (!activeSlide) return;

        const image = activeSlide.querySelector('.character-slide-image img');
        const info = activeSlide.querySelector('.character-slide-info');
        const name = activeSlide.querySelector('.character-name');
        const description = activeSlide.querySelector('.character-description');
        const stats = activeSlide.querySelectorAll('.character-stat');

        // Reset animations
        [image, info, name, description, ...stats].forEach(el => {
            if (el) {
                el.style.transform = 'translateY(20px)';
                el.style.opacity = '0';
            }
        });

        // Animate elements in sequence
        const timeline = [
            { element: image, delay: 0 },
            { element: info, delay: 200 },
            { element: name, delay: 400 },
            { element: description, delay: 600 },
            ...Array.from(stats).map((stat, i) => ({ element: stat, delay: 800 + (i * 100) }))
        ];

        timeline.forEach(({ element, delay }) => {
            if (element) {
                setTimeout(() => {
                    element.style.transition = 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                    element.style.transform = 'translateY(0)';
                    element.style.opacity = '1';
                }, delay);
            }
        });
    }

    updateIndicators(activeIndex) {
        const indicators = document.querySelectorAll('.slide-indicator');
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === activeIndex);
        });
    }

    nextSlide() {
        const nextIndex = (this.currentSlide + 1) % this.slides.length;
        this.showSlide(nextIndex, 'next');
    }

    previousSlide() {
        const prevIndex = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
        this.showSlide(prevIndex, 'prev');
    }

    goToSlide(index) {
        if (index >= 0 && index < this.slides.length) {
            const direction = index > this.currentSlide ? 'next' : 'prev';
            this.showSlide(index, direction);
        }
    }

    startAutoSlide() {
        this.stopAutoSlide();
        if (!this.isSlideInView()) return;

        this.autoSlideInterval = setInterval(() => {
            if (!document.hidden && this.isSlideInView()) {
                this.nextSlide();
            }
        }, this.autoSlideDelay);
    }

    stopAutoSlide() {
        if (this.autoSlideInterval) {
            clearInterval(this.autoSlideInterval);
            this.autoSlideInterval = null;
        }
    }

    // Public methods for external control
    pause() {
        this.stopAutoSlide();
    }

    resume() {
        this.startAutoSlide();
    }

    getCurrentSlide() {
        return this.currentSlide;
    }

    getTotalSlides() {
        return this.slides.length;
    }
}

// Initialize character slide when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit to ensure all other scripts are loaded
    setTimeout(() => {
        window.characterSlideController = new CharacterSlideController();
    }, 100);
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (window.characterSlideController) {
        if (document.hidden) {
            window.characterSlideController.pause();
        } else {
            window.characterSlideController.resume();
        }
    }
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CharacterSlideController;
}
