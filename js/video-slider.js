class VideoGallerySlider {
    constructor(root) {
        this.root = root;
        this.track = root.querySelector('.video-gallery-track');
        this.slides = Array.from(root.querySelectorAll('.video-gallery-slide'));
        this.prevButton = root.querySelector('.video-gallery-nav-prev');
        this.nextButton = root.querySelector('.video-gallery-nav-next');
        this.indicators = Array.from(root.querySelectorAll('.video-gallery-indicator'));
        this.currentLabel = root.querySelector('.video-gallery-current');
        this.totalLabel = root.querySelector('.video-gallery-total');

        this.currentIndex = 0;
        this.totalSlides = this.slides.length;
        this.touchStartX = 0;
        this.touchEndX = 0;

        if (!this.track || this.totalSlides === 0) {
            return;
        }

        this.init();
    }

    init() {
        if (this.totalLabel) {
            this.totalLabel.textContent = this.formatSlideNumber(this.totalSlides);
        }

        this.ensureSlideLoaded(0);
        this.preloadAdjacentSlides(0);
        this.updateUI();
        this.bindEvents();

        if (this.totalSlides < 2) {
            this.hideNavigation();
        }
    }

    bindEvents() {
        if (this.prevButton) {
            this.prevButton.addEventListener('click', () => {
                this.goToSlide(this.currentIndex - 1);
            });
        }

        if (this.nextButton) {
            this.nextButton.addEventListener('click', () => {
                this.goToSlide(this.currentIndex + 1);
            });
        }

        this.indicators.forEach((indicator) => {
            indicator.addEventListener('click', () => {
                const nextIndex = Number.parseInt(indicator.dataset.slide || '0', 10);
                this.goToSlide(nextIndex);
            });
        });

        this.root.addEventListener('touchstart', (event) => {
            const [touch] = event.changedTouches;
            if (touch) {
                this.touchStartX = touch.clientX;
            }
        }, { passive: true });

        this.root.addEventListener('touchend', (event) => {
            const [touch] = event.changedTouches;
            if (!touch) {
                return;
            }

            this.touchEndX = touch.clientX;
            this.handleSwipe();
        }, { passive: true });
    }

    handleSwipe() {
        const swipeDistance = this.touchStartX - this.touchEndX;

        if (Math.abs(swipeDistance) < 50) {
            return;
        }

        if (swipeDistance > 0) {
            this.goToSlide(this.currentIndex + 1);
            return;
        }

        this.goToSlide(this.currentIndex - 1);
    }

    goToSlide(index) {
        const normalizedIndex = (index + this.totalSlides) % this.totalSlides;

        if (normalizedIndex === this.currentIndex) {
            return;
        }

        this.currentIndex = normalizedIndex;
        this.ensureSlideLoaded(this.currentIndex);
        this.preloadAdjacentSlides(this.currentIndex);
        this.updateUI();
    }

    updateUI() {
        this.track.style.transform = `translateX(-${this.currentIndex * 100}%)`;

        this.slides.forEach((slide, index) => {
            slide.setAttribute('aria-hidden', index === this.currentIndex ? 'false' : 'true');
        });

        this.indicators.forEach((indicator, index) => {
            const isActive = index === this.currentIndex;
            indicator.classList.toggle('active', isActive);
            indicator.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        });

        if (this.currentLabel) {
            this.currentLabel.textContent = this.formatSlideNumber(this.currentIndex + 1);
        }
    }

    ensureSlideLoaded(index) {
        const slide = this.slides[index];
        const iframe = slide ? slide.querySelector('iframe[data-embed-src]') : null;

        if (!iframe) {
            return;
        }

        iframe.src = iframe.dataset.embedSrc;
        iframe.removeAttribute('data-embed-src');
    }

    preloadAdjacentSlides(index) {
        if (this.totalSlides < 2) {
            return;
        }

        const nextIndex = (index + 1) % this.totalSlides;
        const prevIndex = (index - 1 + this.totalSlides) % this.totalSlides;

        this.ensureSlideLoaded(nextIndex);
        this.ensureSlideLoaded(prevIndex);
    }

    hideNavigation() {
        if (this.prevButton) {
            this.prevButton.hidden = true;
        }

        if (this.nextButton) {
            this.nextButton.hidden = true;
        }

        const indicatorRail = this.root.querySelector('.video-gallery-indicators');
        if (indicatorRail) {
            indicatorRail.hidden = true;
        }
    }

    formatSlideNumber(number) {
        return String(number).padStart(2, '0');
    }
}

function initializeVideoGallerySliders() {
    const sliders = document.querySelectorAll('.video-gallery-shell');

    sliders.forEach((sliderRoot) => {
        if (sliderRoot.dataset.videoGalleryReady === 'true') {
            return;
        }

        sliderRoot.dataset.videoGalleryReady = 'true';
        new VideoGallerySlider(sliderRoot);
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeVideoGallerySliders);
} else {
    initializeVideoGallerySliders();
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = VideoGallerySlider;
}