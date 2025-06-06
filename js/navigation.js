// Navigation Controller
class NavigationController {
    constructor() {
        this.nav = document.querySelector('.nav-container');
        this.navToggle = document.querySelector('.nav-toggle');
        this.navMenu = document.querySelector('.nav-menu');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.isMenuOpen = false;
        this.lastScrollY = 0;
        this.isScrollingDown = false;
        
        this.init();
    }    init() {
        if (!this.nav) {
            return;
        }

        this.setupEventListeners();
        this.setupScrollBehavior();
        this.setupSmoothScrolling();
    }

    setupEventListeners() {
        // Mobile menu toggle
        if (this.navToggle) {
            this.navToggle.addEventListener('click', () => {
                this.toggleMobileMenu();
            });
        }

        // Close mobile menu when clicking on links
        this.navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (this.isMenuOpen) {
                    this.toggleMobileMenu();
                }
            });
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isMenuOpen && !this.nav.contains(e.target)) {
                this.toggleMobileMenu();
            }
        });

        // Handle escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isMenuOpen) {
                this.toggleMobileMenu();
            }
        });

        // Window resize handler
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }    setupScrollBehavior() {
        let ticking = false;
        let lastScrollY = this.lastScrollY;
        let scrollTimeout;
        let isUpdating = false;
        let isScrollingStopped = true;
        let scrollDirection = 'up';
        let consecutiveScrolls = 0;

        const updateNavigation = () => {
            if (isUpdating) return;
            isUpdating = true;

            const currentScrollY = window.pageYOffset;
            const scrollDelta = Math.abs(currentScrollY - lastScrollY);
            const scrollSpeed = scrollDelta;
            
            // Ignore micro-movements and very fast erratic scrolls
            if (scrollDelta < 2) {
                isUpdating = false;
                ticking = false;
                return;
            }
            
            // Detect scroll direction change for stability
            const newDirection = currentScrollY > lastScrollY ? 'down' : 'up';
            if (newDirection !== scrollDirection) {
                consecutiveScrolls = 0;
                scrollDirection = newDirection;
            } else {
                consecutiveScrolls++;
            }
            
            // Smooth scrolled class transition with hysteresis
            if (currentScrollY > 80) {
                if (!this.nav.classList.contains('scrolled')) {
                    this.nav.classList.add('scrolled');
                }
            } else if (currentScrollY < 50) {
                if (this.nav.classList.contains('scrolled')) {
                    this.nav.classList.remove('scrolled');
                }
            }

            // Require multiple consistent scrolls before changing state
            const minConsecutiveScrolls = scrollSpeed > 15 ? 3 : 2;
            
            if (consecutiveScrolls >= minConsecutiveScrolls) {
                // Enhanced thresholds based on scroll speed
                const hideThreshold = scrollSpeed > 20 ? 150 : 100;
                const showThreshold = 60;
                
                if (scrollDirection === 'down' && currentScrollY > hideThreshold) {
                    if (!this.isScrollingDown && !this.isMenuOpen) {
                        this.isScrollingDown = true;
                        this.hideNavigation();
                    }
                } else if (scrollDirection === 'up' && currentScrollY <= showThreshold) {
                    if (this.isScrollingDown || currentScrollY < 100) {
                        this.isScrollingDown = false;
                        this.showNavigation();
                    }
                }
            }

            lastScrollY = currentScrollY;
            this.lastScrollY = currentScrollY;
            isUpdating = false;
            ticking = false;
            isScrollingStopped = false;
            
            // Reset scroll state after inactivity
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                isScrollingStopped = true;
                consecutiveScrolls = 0;
                this.showNavigation(); // Always show after scrolling stops
            }, 200);
        };

        // Optimized scroll handler with advanced throttling
        const handleScroll = () => {
            if (!ticking && !isUpdating) {
                requestAnimationFrame(updateNavigation);
                ticking = true;
            }
        };

        // Use passive listener for better performance
        window.addEventListener('scroll', handleScroll, { 
            passive: true,
            capture: false 
        });
    }

    setupSmoothScrolling() {
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                const targetId = link.getAttribute('href');
                if (targetId.startsWith('#')) {
                    const targetSection = document.querySelector(targetId);
                    if (targetSection) {
                        this.scrollToSection(targetSection);
                        this.setActiveLink(link);
                    }
                }
            });
        });

        // Update active link based on scroll position
        this.setupScrollSpy();
    }

    setupScrollSpy() {
        const sections = document.querySelectorAll('section[id]');
        const options = {
            threshold: 0.3,
            rootMargin: '-100px 0px -50% 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const activeLink = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
                    if (activeLink) {
                        this.setActiveLink(activeLink);
                    }
                }
            });
        }, options);

        sections.forEach(section => {
            observer.observe(section);
        });
    }

    toggleMobileMenu() {
        this.isMenuOpen = !this.isMenuOpen;
        
        // Toggle classes
        this.navToggle.classList.toggle('active');
        this.navMenu.classList.toggle('active');
        this.nav.classList.toggle('menu-open');
        
        // Prevent body scroll when menu is open
        if (this.isMenuOpen) {
            document.body.style.overflow = 'hidden';
            this.animateMenuOpen();
        } else {
            document.body.style.overflow = '';
            this.animateMenuClose();
        }
    }

    animateMenuOpen() {
        // Animate menu toggle icon
        gsap.to(this.navToggle.children[0], {
            rotation: 45,
            y: 6,
            duration: 0.3,
            ease: "power2.out"
        });
        
        gsap.to(this.navToggle.children[1], {
            opacity: 0,
            duration: 0.3,
            ease: "power2.out"
        });
        
        gsap.to(this.navToggle.children[2], {
            rotation: -45,
            y: -6,
            duration: 0.3,
            ease: "power2.out"
        });

        // Animate menu items
        gsap.fromTo(this.navLinks, 
            {
                opacity: 0,
                y: 30,
                rotationX: -90
            },
            {
                opacity: 1,
                y: 0,
                rotationX: 0,
                duration: 0.6,
                ease: "back.out(1.7)",
                stagger: 0.1,
                delay: 0.2
            }
        );
    }

    animateMenuClose() {
        // Reset menu toggle icon
        gsap.to(this.navToggle.children[0], {
            rotation: 0,
            y: 0,
            duration: 0.3,
            ease: "power2.out"
        });
        
        gsap.to(this.navToggle.children[1], {
            opacity: 1,
            duration: 0.3,
            ease: "power2.out"
        });
        
        gsap.to(this.navToggle.children[2], {
            rotation: 0,
            y: 0,
            duration: 0.3,
            ease: "power2.out"
        });

        // Animate menu items out
        gsap.to(this.navLinks, {
            opacity: 0,
            y: -20,
            duration: 0.3,
            ease: "power2.in",
            stagger: 0.05
        });
    }

    hideNavigation() {
        if (!this.isMenuOpen) {
            gsap.to(this.nav, {
                y: -100,
                duration: 0.4,
                ease: "power2.inOut"
            });
        }
    }

    showNavigation() {
        gsap.to(this.nav, {
            y: 0,
            duration: 0.4,
            ease: "power2.inOut"
        });
    }

    scrollToSection(section) {
        const offsetTop = section.offsetTop - 100; // Account for fixed header
        
        gsap.to(window, {
            duration: 1.2,
            scrollTo: {
                y: offsetTop,
                autoKill: false
            },
            ease: "power2.inOut"
        });
    }

    setActiveLink(activeLink) {
        // Remove active class from all links
        this.navLinks.forEach(link => {
            link.classList.remove('active');
        });
        
        // Add active class to current link
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }

    handleResize() {
        // Close mobile menu on resize to desktop
        if (window.innerWidth > 768 && this.isMenuOpen) {
            this.toggleMobileMenu();
        }
    }

    // Method to programmatically navigate to section
    navigateTo(sectionId) {
        const section = document.getElementById(sectionId);
        const link = document.querySelector(`.nav-link[href="#${sectionId}"]`);
        
        if (section) {
            this.scrollToSection(section);
            if (link) {
                this.setActiveLink(link);
            }
        }
    }

    // Method to update navigation theme based on section
    updateNavigationTheme(theme) {
        this.nav.className = `nav-container ${theme}`;
    }
}

// Button Interaction Effects
class ButtonEffects {
    constructor() {
        this.init();
    }

    init() {
        this.setupButtonHoverEffects();
        this.setupButtonClickEffects();
        this.setupPlayButtonEffect();
    }

    setupButtonHoverEffects() {
        const buttons = document.querySelectorAll('.btn');
        
        buttons.forEach(button => {
            button.addEventListener('mouseenter', (e) => {
                this.createRippleEffect(e, button);
                this.addButtonHoverAnimation(button);
            });
            
            button.addEventListener('mouseleave', (e) => {
                this.removeButtonHoverAnimation(button);
            });
        });
    }

    setupButtonClickEffects() {
        const buttons = document.querySelectorAll('.btn');
        
        buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                this.createClickAnimation(button);
                this.createParticleExplosion(e, button);
            });
        });
    }

    setupPlayButtonEffect() {
        const playButton = document.getElementById('play-btn');
        const trailerButton = document.getElementById('trailer-btn');
        
        if (playButton) {
            playButton.addEventListener('click', () => {
                this.handlePlayButtonClick();
            });
        }
        
        if (trailerButton) {
            trailerButton.addEventListener('click', () => {
                this.handleTrailerButtonClick();
            });
        }
    }

    createRippleEffect(e, button) {
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        
        ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.3);
            transform: scale(0);
            left: ${e.clientX - rect.left - size / 2}px;
            top: ${e.clientY - rect.top - size / 2}px;
            width: ${size}px;
            height: ${size}px;
            pointer-events: none;
        `;
        
        button.style.position = 'relative';
        button.style.overflow = 'hidden';
        button.appendChild(ripple);
        
        gsap.to(ripple, {
            scale: 2,
            opacity: 0,
            duration: 0.6,
            ease: "power2.out",
            onComplete: () => {
                if (ripple.parentNode) {
                    ripple.parentNode.removeChild(ripple);
                }
            }
        });
    }

    addButtonHoverAnimation(button) {
        gsap.to(button, {
            scale: 1.05,
            duration: 0.3,
            ease: "power2.out"
        });
        
        // Add glow effect
        button.style.boxShadow = '0 10px 30px rgba(212, 175, 55, 0.4)';
    }

    removeButtonHoverAnimation(button) {
        gsap.to(button, {
            scale: 1,
            duration: 0.3,
            ease: "power2.out"
        });
        
        // Remove glow effect
        setTimeout(() => {
            button.style.boxShadow = '';
        }, 300);
    }

    createClickAnimation(button) {
        gsap.to(button, {
            scale: 0.95,
            duration: 0.1,
            ease: "power2.out",
            yoyo: true,
            repeat: 1
        });
    }

    createParticleExplosion(e, button) {
        const rect = button.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        for (let i = 0; i < 12; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: fixed;
                width: 4px;
                height: 4px;
                background: #d4af37;
                border-radius: 50%;
                pointer-events: none;
                z-index: 10000;
                left: ${centerX}px;
                top: ${centerY}px;
            `;
            
            document.body.appendChild(particle);
            
            const angle = (i / 12) * Math.PI * 2;
            const distance = 100 + Math.random() * 50;
            const endX = Math.cos(angle) * distance;
            const endY = Math.sin(angle) * distance;
            
            gsap.to(particle, {
                x: endX,
                y: endY,
                opacity: 0,
                scale: 0,
                duration: 1,
                ease: "power2.out",
                onComplete: () => {
                    document.body.removeChild(particle);
                }
            });
        }
    }    handlePlayButtonClick() {
        // Add game-specific logic here
        
        // Example: Show loading screen or redirect to game
        this.showGameLoadingScreen();
    }    handleTrailerButtonClick() {
        // Add trailer-specific logic here
        
        // Example: Open video modal or play inline video
        this.playTrailerVideo();
    }

    showGameLoadingScreen() {
        // Create loading overlay
        const loadingOverlay = document.createElement('div');
        loadingOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle, #0f0f0f, #000);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            color: #d4af37;
            font-family: 'Cinzel', serif;
        `;
        
        loadingOverlay.innerHTML = `
            <h2>Đang Khởi Động Game...</h2>
            <div class="loading-spinner"></div>
        `;
        
        document.body.appendChild(loadingOverlay);
        
        // Animate loading screen
        gsap.fromTo(loadingOverlay, 
            { opacity: 0 },
            { opacity: 1, duration: 0.5 }
        );
        
        // Remove after 3 seconds (replace with actual game loading)
        setTimeout(() => {
            gsap.to(loadingOverlay, {
                opacity: 0,
                duration: 0.5,
                onComplete: () => {
                    document.body.removeChild(loadingOverlay);
                }
            });
        }, 3000);
    }    playTrailerVideo() {
        // Example trailer video implementation
        // Add video modal or inline player logic here
    }
}

// Initialize navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.navigationController = new NavigationController();
    window.buttonEffects = new ButtonEffects();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { NavigationController, ButtonEffects };
}
