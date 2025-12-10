// Character Slide Controller
class CharacterSlider {
    constructor() {
        this.container = document.querySelector('.character-slide-container');
        this.wrapper = document.querySelector('.character-slide-wrapper');
        this.slides = document.querySelectorAll('.character-slide');
        this.prevBtn = document.querySelector('.slide-nav-btn.prev');
        this.nextBtn = document.querySelector('.slide-nav-btn.next');
        this.indicators = document.querySelectorAll('.slide-indicator');

        this.currentSlide = 0;
        this.totalSlides = this.slides.length;
        this.isAnimating = false;
        this.autoSlideInterval = null;
        this.autoSlideDelay = 5000; // 5 seconds

        if (this.slides.length > 0) {
            this.init();
        }
    }

    init() {
        this.setupEventListeners();
        this.showSlide(0);
        this.startAutoSlide();
        console.log('🎭 Character Slider initialized with', this.totalSlides, 'slides');
    }

    setupEventListeners() {
        // Previous button click
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => {
                this.prevSlide();
            });
        }

        // Next button click
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => {
                this.nextSlide();
            });
        }

        // Indicator clicks
        this.indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                this.showSlide(index);
            });
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                this.prevSlide();
            } else if (e.key === 'ArrowRight') {
                this.nextSlide();
            }
        });

        // Pause on hover
        if (this.container) {
            this.container.addEventListener('mouseenter', () => {
                this.stopAutoSlide();
            });

            this.container.addEventListener('mouseleave', () => {
                this.startAutoSlide();
            });
        }

        // Touch swipe support
        this.setupTouchEvents();
    }

    setupTouchEvents() {
        let touchStartX = 0;
        let touchEndX = 0;

        if (this.container) {
            this.container.addEventListener('touchstart', (e) => {
                touchStartX = e.changedTouches[0].screenX;
            }, { passive: true });

            this.container.addEventListener('touchend', (e) => {
                touchEndX = e.changedTouches[0].screenX;
                this.handleSwipe(touchStartX, touchEndX);
            }, { passive: true });
        }
    }

    handleSwipe(startX, endX) {
        const swipeThreshold = 50;
        const diff = startX - endX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                this.nextSlide();
            } else {
                this.prevSlide();
            }
        }
    }

    showSlide(index, direction = 'next') {
        if (this.isAnimating || index === this.currentSlide) return;

        this.isAnimating = true;
        this.stopAutoSlide();

        // Update indicators
        this.updateIndicators(index);

        // Remove active class from all slides
        this.slides.forEach((slide, i) => {
            slide.classList.remove('active');
            if (i !== index) {
                slide.style.visibility = 'hidden';
                slide.style.opacity = '0';
                slide.style.zIndex = '1';
            }
        });

        // Set new active slide
        this.currentSlide = index;
        const activeSlide = this.slides[this.currentSlide];

        // Show and animate active slide
        activeSlide.style.visibility = 'visible';
        activeSlide.style.zIndex = '10';

        // Small delay to ensure proper rendering
        setTimeout(() => {
            activeSlide.classList.add('active');
            activeSlide.style.opacity = '1';
        }, 50);

        // Reset animation flag
        setTimeout(() => {
            this.isAnimating = false;
            this.startAutoSlide();
        }, 800);
    }

    nextSlide() {
        const nextIndex = (this.currentSlide + 1) % this.totalSlides;
        this.showSlide(nextIndex, 'next');
    }

    prevSlide() {
        const prevIndex = (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
        this.showSlide(prevIndex, 'prev');
    }

    updateIndicators(index) {
        this.indicators.forEach((indicator, i) => {
            if (i === index) {
                indicator.classList.add('active');
            } else {
                indicator.classList.remove('active');
            }
        });
    }

    startAutoSlide() {
        this.stopAutoSlide();
        this.autoSlideInterval = setInterval(() => {
            this.nextSlide();
        }, this.autoSlideDelay);
    }

    stopAutoSlide() {
        if (this.autoSlideInterval) {
            clearInterval(this.autoSlideInterval);
            this.autoSlideInterval = null;
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.characterSlider = new CharacterSlider();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CharacterSlider;
}