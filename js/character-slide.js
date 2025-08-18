    showSlide(index, direction = 'next') {
        if (this.isAnimating || index === this.currentSlide) return;
        
        this.isAnimating = true;
        this.stopAutoSlide();

        // Update indicators
        this.updateIndicators(index);

        // Remove active class from all slides
        this.slides.forEach((slide, i) => {
            slide.classList.remove('active');
            // Hoàn toàn ẩn tất cả slide không phải active
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
            this.animateSlideContent();
        }, 50);

        // Reset animation flag
        setTimeout(() => {
            this.isAnimating = false;
            this.startAutoSlide();
        }, 800);
    }