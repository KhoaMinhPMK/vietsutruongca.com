// GSAP Scroll Animations Controller
class ScrollAnimations {
    constructor() {
        this.animations = [];
        this.scrollTriggers = [];
        this.init();
    }    init() {
        // Register GSAP plugins
        gsap.registerPlugin(ScrollTrigger);
        
        // CRITICAL FIX: Setup coordination with ImageScrollController
        this.setupAnimationCoordination();
        
        this.setupHeroAnimations();
        this.setupSectionAnimations();
        this.setupParallaxEffects();
        this.setupTextAnimations();
        this.setupImageAnimations();
        this.setupStaggerAnimations();
        
        console.log('🎯 GSAP Scroll animations initialized with coordination');
    }
    
    /**
     * Setup coordination system to prevent conflicts with other animation systems
     */
    setupAnimationCoordination() {
        // CRITICAL: Setup global coordination flags
        window.animationCoordination = {
            gsapActive: false,
            imageScrollActive: false,
            conflictResolution: 'gsap-priority' // GSAP takes priority when both systems target same element
        };
        
        // Enhanced ScrollTrigger configuration for better performance
        ScrollTrigger.config({
            limitCallbacks: true, // Reduce callback frequency
            syncInterval: 16, // 60fps sync
            autoRefreshEvents: "visibilitychange,DOMContentLoaded,load,resize"
        });
        
        // Global refresh handler for better coordination
        ScrollTrigger.addEventListener("refresh", () => {
            window.animationCoordination.gsapActive = true;
            
            // Notify ImageScrollController about refresh
            if (window.imageScrollController && window.imageScrollController.shouldUpdateImages) {
                setTimeout(() => {
                    window.animationCoordination.gsapActive = false;
                }, 100); // Brief pause after GSAP refresh
            }
        });
        
        console.log('✅ Animation coordination system initialized');
    }

    setupHeroAnimations() {
        // Hero title animation
        const heroTitle = document.querySelector('.hero-title');
        if (heroTitle) {
            gsap.set(heroTitle, { opacity: 0, y: 100, scale: 0.8 });
            
            gsap.to(heroTitle, {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 1.5,
                ease: "back.out(1.7)",
                delay: 1
            });
        }

        // Hero description animation
        const heroDesc = document.querySelector('.hero-description');
        if (heroDesc) {
            gsap.set(heroDesc, { opacity: 0, y: 50 });
            
            gsap.to(heroDesc, {
                opacity: 1,
                y: 0,
                duration: 1,
                ease: "power2.out",
                delay: 1.5
            });
        }

        // Hero buttons animation
        const heroButtons = document.querySelectorAll('.hero-buttons .btn');
        if (heroButtons.length > 0) {
            gsap.set(heroButtons, { opacity: 0, y: 30, scale: 0.8 });
            
            gsap.to(heroButtons, {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.8,
                ease: "back.out(1.7)",
                stagger: 0.2,
                delay: 2
            });
        }

        // Scroll indicator animation
        const scrollIndicator = document.querySelector('.scroll-indicator');
        if (scrollIndicator) {
            gsap.set(scrollIndicator, { opacity: 0, y: 20 });
            
            gsap.to(scrollIndicator, {
                opacity: 1,
                y: 0,
                duration: 1,
                ease: "power2.out",
                delay: 2.5
            });
        }
    }

    setupSectionAnimations() {
        // Section headers
        const sectionHeaders = document.querySelectorAll('.section-header');
        sectionHeaders.forEach(header => {
            const title = header.querySelector('.section-title');
            const subtitle = header.querySelector('.section-subtitle');
            
            if (title) {
                gsap.set(title, { opacity: 0, y: 50 });
                
                ScrollTrigger.create({
                    trigger: title,
                    start: "top 80%",
                    onEnter: () => {
                        gsap.to(title, {
                            opacity: 1,
                            y: 0,
                            duration: 1,
                            ease: "power2.out"
                        });
                    }
                });
            }
            
            if (subtitle) {
                gsap.set(subtitle, { opacity: 0, y: 30 });
                
                ScrollTrigger.create({
                    trigger: subtitle,
                    start: "top 80%",
                    onEnter: () => {
                        gsap.to(subtitle, {
                            opacity: 1,
                            y: 0,
                            duration: 1,
                            ease: "power2.out",
                            delay: 0.3
                        });
                    }
                });
            }
        });

        // Story cards - DISABLED scroll animation for performance
        // Cards are now visible immediately
        const storyCards = document.querySelectorAll('.story-card');
        storyCards.forEach((card, index) => {
            gsap.set(card, { opacity: 1, x: 0, rotationY: 0 });
        });

        // Character cards - DISABLED scroll animation for performance
        const characterCards = document.querySelectorAll('.character-card');
        characterCards.forEach((card, index) => {
            gsap.set(card, { opacity: 1, y: 0, scale: 1, rotationX: 0 });
        });

        // Feature cards - DISABLED scroll animation for performance
        const featureCards = document.querySelectorAll('.feature-card');
        featureCards.forEach((card, index) => {
            gsap.set(card, { opacity: 1, y: 0, scale: 1 });
        });
    }    setupParallaxEffects() {
        // CRITICAL FIX: Disable GSAP parallax for story images to avoid conflicts
        // Let ImageScrollController handle story image parallax for better performance
        
        // Skip story image parallax - let ImageScrollController handle it
        // const parallaxImages = document.querySelectorAll('.parallax-img');
        // This prevents double animation conflicts
        
        console.log('📝 GSAP parallax disabled for story images to prevent conflicts');

        // Background parallax for sections - IMPROVED performance
        const sections = document.querySelectorAll('.story-section, .characters-section, .gameplay-section');
        sections.forEach((section, index) => {
            // OPTIMIZED: Reduced parallax speed for better performance
            const speed = (index % 2 === 0) ? 0.3 : -0.2; // Reduced from 0.5/-0.3
            
            gsap.to(section, {
                backgroundPosition: `50% ${50 + speed * 100}%`,
                ease: "none",
                scrollTrigger: {
                    trigger: section,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: 2, // Smoother scrub
                    invalidateOnRefresh: true
                }
            });
        });

        // Floating elements parallax - ENHANCED with conflict prevention
        const floatingElements = document.querySelectorAll('.floating-element');
        floatingElements.forEach((element, index) => {
            // OPTIMIZED: Reduced intensity for smoother animation
            const speed = 0.1 + (index * 0.05); // Reduced from 0.2 + (index * 0.1)
            
            gsap.to(element, {
                y: -100 * speed, // Reduced from -200
                rotation: 180 * speed, // Reduced from 360
                ease: "none",
                scrollTrigger: {
                    trigger: document.body,
                    start: "top top",
                    end: "bottom bottom",
                    scrub: 1.5, // Smoother scrub
                    invalidateOnRefresh: true
                }
            });
        });
    }

    setupTextAnimations() {
        // Typewriter effect for specific elements
        const typewriterElements = document.querySelectorAll('[data-typewriter]');
        typewriterElements.forEach(element => {
            const text = element.textContent;
            element.textContent = '';
            
            ScrollTrigger.create({
                trigger: element,
                start: "top 80%",
                onEnter: () => {
                    this.typewriterEffect(element, text);
                }
            });
        });

        // Split text animation
        const splitTextElements = document.querySelectorAll('[data-split-text]');
        splitTextElements.forEach(element => {
            const text = element.textContent;
            const words = text.split(' ');
            element.innerHTML = words.map(word => `<span class="word">${word}</span>`).join(' ');
            
            const wordSpans = element.querySelectorAll('.word');
            gsap.set(wordSpans, { opacity: 0, y: 50, rotationX: -90 });
            
            ScrollTrigger.create({
                trigger: element,
                start: "top 80%",
                onEnter: () => {
                    gsap.to(wordSpans, {
                        opacity: 1,
                        y: 0,
                        rotationX: 0,
                        duration: 0.8,
                        ease: "power2.out",
                        stagger: 0.1
                    });
                }
            });
        });
    }    setupImageAnimations() {
        // Image reveal animations - DISABLED for performance
        // Images are now visible immediately without animations
        const storyImages = document.querySelectorAll('.story-image');
        storyImages.forEach(imageContainer => {
            const img = imageContainer.querySelector('img');
            // Set images to be fully visible immediately
            gsap.set(img, { scale: 1 });
            gsap.set(imageContainer, { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)" });
        });

        // Character image hover effects - OPTIMIZED for performance
        const characterImages = document.querySelectorAll('.character-image');
        characterImages.forEach(imageContainer => {
            const img = imageContainer.querySelector('img');
            
            imageContainer.addEventListener('mouseenter', () => {
                gsap.to(img, {
                    scale: 1.05, // Reduced from 1.1 for subtlety
                    filter: "brightness(1.1) saturate(1.2)", // Reduced intensity
                    duration: 0.4, // Faster transition
                    ease: "power2.out"
                });
            });
            
            imageContainer.addEventListener('mouseleave', () => {
                gsap.to(img, {
                    scale: 1,
                    filter: "brightness(1) saturate(1)",
                    duration: 0.4, // Faster transition
                    ease: "power2.out"
                });
            });
        });
    }

    setupStaggerAnimations() {
        // Navigation links
        const navLinks = document.querySelectorAll('.nav-link');
        if (navLinks.length > 0) {
            gsap.set(navLinks, { opacity: 0, y: -20 });
            
            gsap.to(navLinks, {
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: "power2.out",
                stagger: 0.1,
                delay: 0.5
            });
        }

        // Feature icons animation
        const featureIcons = document.querySelectorAll('.feature-icon');
        featureIcons.forEach(icon => {
            ScrollTrigger.create({
                trigger: icon.closest('.feature-card'),
                start: "top 80%",
                onEnter: () => {
                    gsap.fromTo(icon, 
                        {
                            scale: 0,
                            rotation: -180
                        },
                        {
                            scale: 1,
                            rotation: 0,
                            duration: 1,
                            ease: "back.out(1.7)",
                            delay: 0.3
                        }
                    );
                }
            });
        });

        // Download section animation
        const downloadContent = document.querySelector('.download-content');
        if (downloadContent) {
            const children = downloadContent.children;
            gsap.set(children, { opacity: 0, y: 50, scale: 0.9 });
            
            ScrollTrigger.create({
                trigger: downloadContent,
                start: "top 80%",
                onEnter: () => {
                    gsap.to(children, {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        duration: 1,
                        ease: "power2.out",
                        stagger: 0.2
                    });
                }
            });
        }
    }

    typewriterEffect(element, text, speed = 50) {
        let i = 0;
        const timer = setInterval(() => {
            element.textContent += text.charAt(i);
            i++;
            if (i > text.length - 1) {
                clearInterval(timer);
            }
        }, speed);
    }

    // Smooth scroll to section
    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            gsap.to(window, {
                duration: 1.5,
                scrollTo: {
                    y: section,
                    offsetY: 100
                },
                ease: "power2.inOut"
            });
        }
    }

    // Refresh ScrollTrigger (useful after dynamic content changes)
    refresh() {
        ScrollTrigger.refresh();
    }

    // Destroy all ScrollTrigger instances
    destroy() {
        ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        this.animations.forEach(animation => animation.kill());
    }
}

// Mouse follower effect
class MouseFollower {
    constructor() {
        this.mouse = { x: 0, y: 0 };
        this.pos = { x: 0, y: 0 };
        this.ratio = 0.15;
        this.active = false;
        
        this.init();
    }

    init() {
        this.createFollower();
        this.bindEvents();
        this.render();
    }

    createFollower() {
        this.follower = document.createElement('div');
        this.follower.className = 'mouse-follower';
        this.follower.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 20px;
            height: 20px;
            background: radial-gradient(circle, rgba(212, 175, 55, 0.8), rgba(255, 107, 53, 0.4));
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            opacity: 0;
            transform: translate(-50%, -50%);
            transition: opacity 0.3s ease;
            mix-blend-mode: screen;
        `;
        
        document.body.appendChild(this.follower);
    }

    bindEvents() {
        document.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
            
            if (!this.active) {
                this.active = true;
                this.follower.style.opacity = '1';
            }
        });

        document.addEventListener('mouseleave', () => {
            this.active = false;
            this.follower.style.opacity = '0';
        });

        // Scale up on interactive elements
        const interactiveElements = document.querySelectorAll('a, button, .btn, .character-card, .feature-card');
        interactiveElements.forEach(element => {
            element.addEventListener('mouseenter', () => {
                gsap.to(this.follower, {
                    scale: 2,
                    opacity: 0.6,
                    duration: 0.3,
                    ease: "power2.out"
                });
            });
            
            element.addEventListener('mouseleave', () => {
                gsap.to(this.follower, {
                    scale: 1,
                    opacity: 1,
                    duration: 0.3,
                    ease: "power2.out"
                });
            });
        });
    }

    render() {
        this.pos.x += (this.mouse.x - this.pos.x) * this.ratio;
        this.pos.y += (this.mouse.y - this.pos.y) * this.ratio;
        
        this.follower.style.transform = `translate(${this.pos.x - 10}px, ${this.pos.y - 10}px)`;
        
        requestAnimationFrame(() => this.render());
    }
}

// Initialize scroll animations when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.scrollAnimations = new ScrollAnimations();
    window.mouseFollower = new MouseFollower();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ScrollAnimations, MouseFollower };
}
