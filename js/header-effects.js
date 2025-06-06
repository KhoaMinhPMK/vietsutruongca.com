// Enhanced Header Effects for Vietnamese Historical Game
class HeaderEffects {
    constructor() {
        this.nav = document.querySelector('.nav-container');
        this.logo = document.querySelector('.logo');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.isInitialized = false;
        
        this.init();
    }

    init() {
        if (!this.nav) return;
        
        this.setupLogoEffects();
        this.setupNavigationHover();
        this.setupScrollEffects();
        this.setupVietnameseCulturalEffects();
        this.setupParticleSystem();
        this.isInitialized = true;
    }

    setupLogoEffects() {
        if (!this.logo) return;

        // Logo hover effect with Vietnamese cultural elements
        this.logo.addEventListener('mouseenter', () => {
            this.createLogoHoverEffect();
        });

        this.logo.addEventListener('mouseleave', () => {
            this.removeLogoHoverEffect();
        });

        // Click effect for logo
        this.logo.addEventListener('click', () => {
            this.createLogoClickEffect();
        });
    }

    createLogoHoverEffect() {
        const logoMain = this.logo.querySelector('.logo-main');
        const logoSubtitle = this.logo.querySelector('.logo-subtitle');

        // Enhanced glow effect
        gsap.to(logoMain, {
            textShadow: '0 0 30px rgba(212, 175, 55, 0.8), 0 0 60px rgba(212, 175, 55, 0.4)',
            scale: 1.05,
            duration: 0.4,
            ease: 'power2.out'
        });

        gsap.to(logoSubtitle, {
            textShadow: '0 0 15px rgba(255, 107, 53, 0.6)',
            opacity: 1,
            duration: 0.4,
            ease: 'power2.out'
        });

        // Create floating Vietnamese symbols
        this.createFloatingSymbols();
    }

    removeLogoHoverEffect() {
        const logoMain = this.logo.querySelector('.logo-main');
        const logoSubtitle = this.logo.querySelector('.logo-subtitle');

        gsap.to(logoMain, {
            textShadow: '0 0 20px rgba(212, 175, 55, 0.3)',
            scale: 1,
            duration: 0.4,
            ease: 'power2.out'
        });

        gsap.to(logoSubtitle, {
            textShadow: '0 0 12px rgba(212, 175, 55, 0.4)',
            opacity: 0.8,
            duration: 0.4,
            ease: 'power2.out'
        });
    }

    createLogoClickEffect() {
        // Create ripple effect
        const ripple = document.createElement('div');
        ripple.className = 'logo-ripple';
        ripple.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            width: 0;
            height: 0;
            background: radial-gradient(circle, rgba(212, 175, 55, 0.3) 0%, transparent 70%);
            border-radius: 50%;
            transform: translate(-50%, -50%);
            pointer-events: none;
            z-index: -1;
        `;

        this.logo.style.position = 'relative';
        this.logo.appendChild(ripple);

        gsap.to(ripple, {
            width: 200,
            height: 200,
            opacity: 0,
            duration: 0.8,
            ease: 'power2.out',
            onComplete: () => {
                if (ripple.parentNode) {
                    ripple.parentNode.removeChild(ripple);
                }
            }
        });

        // Logo pulse effect
        gsap.to(this.logo, {
            scale: 0.95,
            duration: 0.1,
            ease: 'power2.out',
            yoyo: true,
            repeat: 1
        });
    }

    createFloatingSymbols() {
        const symbols = ['⚔️', '🏛️', '🐉', '🌸', '🏮'];
        const logoRect = this.logo.getBoundingClientRect();

        symbols.forEach((symbol, index) => {
            const element = document.createElement('div');
            element.innerHTML = symbol;
            element.style.cssText = `
                position: fixed;
                font-size: 1.2rem;
                pointer-events: none;
                z-index: 1001;
                opacity: 0;
                left: ${logoRect.left + logoRect.width / 2}px;
                top: ${logoRect.top + logoRect.height / 2}px;
            `;

            document.body.appendChild(element);

            const angle = (index / symbols.length) * Math.PI * 2;
            const distance = 80 + Math.random() * 40;
            const endX = Math.cos(angle) * distance;
            const endY = Math.sin(angle) * distance;

            gsap.to(element, {
                x: endX,
                y: endY,
                opacity: 0.8,
                rotation: 360,
                duration: 1.5,
                ease: 'power2.out',
                delay: index * 0.1
            });

            gsap.to(element, {
                opacity: 0,
                scale: 0,
                duration: 0.5,
                delay: 1.2 + index * 0.1,
                onComplete: () => {
                    if (element.parentNode) {
                        element.parentNode.removeChild(element);
                    }
                }
            });
        });
    }

    setupNavigationHover() {
        this.navLinks.forEach(link => {
            link.addEventListener('mouseenter', (e) => {
                this.createNavLinkHoverEffect(e.target);
            });

            link.addEventListener('mouseleave', (e) => {
                this.removeNavLinkHoverEffect(e.target);
            });
        });
    }

    createNavLinkHoverEffect(link) {
        // Create glowing particle trail
        const trail = document.createElement('div');
        trail.className = 'nav-link-trail';
        trail.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(45deg, 
                rgba(212, 175, 55, 0.1) 0%,
                rgba(255, 107, 53, 0.1) 100%);
            border-radius: 25px;
            opacity: 0;
            pointer-events: none;
            z-index: -1;
        `;

        link.style.position = 'relative';
        link.appendChild(trail);

        gsap.to(trail, {
            opacity: 1,
            scale: 1.05,
            duration: 0.3,
            ease: 'power2.out'
        });

        // Add text glow
        gsap.to(link, {
            textShadow: '0 0 15px rgba(212, 175, 55, 0.6)',
            duration: 0.3,
            ease: 'power2.out'
        });
    }

    removeNavLinkHoverEffect(link) {
        const trail = link.querySelector('.nav-link-trail');
        if (trail) {
            gsap.to(trail, {
                opacity: 0,
                scale: 1,
                duration: 0.3,
                ease: 'power2.out',
                onComplete: () => {
                    if (trail.parentNode) {
                        trail.parentNode.removeChild(trail);
                    }
                }
            });
        }

        gsap.to(link, {
            textShadow: 'none',
            duration: 0.3,
            ease: 'power2.out'
        });
    }

    setupScrollEffects() {
        let lastScrollY = 0;
        
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            const scrollProgress = Math.min(scrollY / 300, 1);

            // Dynamic background opacity based on scroll
            this.nav.style.setProperty('--scroll-opacity', scrollProgress);

            // Parallax effect for logo symbols
            const symbols = this.nav.querySelectorAll('::before, ::after');
            if (symbols.length > 0) {
                const offset = scrollY * 0.1;
                symbols.forEach(symbol => {
                    symbol.style.transform = `translateY(${offset}px)`;
                });
            }

            lastScrollY = scrollY;
        });
    }

    setupVietnameseCulturalEffects() {
        // Add Vietnamese pattern overlay on special occasions
        this.createVietnamesePatternOverlay();
        
        // Seasonal effects (Tết, etc.)
        this.checkSeasonalEffects();
    }

    createVietnamesePatternOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'vietnamese-pattern-overlay';
        overlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-image: 
                radial-gradient(circle at 20% 80%, rgba(212, 175, 55, 0.03) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(255, 107, 53, 0.03) 0%, transparent 50%);
            pointer-events: none;
            z-index: -1;
            animation: patternShift 20s ease-in-out infinite;
        `;

        this.nav.appendChild(overlay);
    }

    checkSeasonalEffects() {
        const currentDate = new Date();
        const month = currentDate.getMonth() + 1;
        const day = currentDate.getDate();

        // Tết Nguyên Đán (around January-February)
        if ((month === 1 && day >= 20) || (month === 2 && day <= 20)) {
            this.addTetEffects();
        }

        // Mid-Autumn Festival (around September)
        if (month === 9) {
            this.addMidAutumnEffects();
        }
    }

    addTetEffects() {
        // Add red and gold colors for Tết
        const tetOverlay = document.createElement('div');
        tetOverlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(45deg, 
                rgba(220, 20, 60, 0.05) 0%,
                rgba(255, 215, 0, 0.05) 100%);
            pointer-events: none;
            z-index: -1;
        `;

        this.nav.appendChild(tetOverlay);

        // Add plum blossom particles
        this.createPlumBlossomParticles();
    }

    addMidAutumnEffects() {
        // Add moonlight effect
        const moonOverlay = document.createElement('div');
        moonOverlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: radial-gradient(circle at 70% 30%, 
                rgba(255, 255, 255, 0.08) 0%, transparent 50%);
            pointer-events: none;
            z-index: -1;
        `;

        this.nav.appendChild(moonOverlay);
    }

    createPlumBlossomParticles() {
        const colors = ['#ff69b4', '#ffc0cb', '#ffffff'];
        
        setInterval(() => {
            if (Math.random() > 0.7) {
                const particle = document.createElement('div');
                particle.innerHTML = '🌸';
                particle.style.cssText = `
                    position: fixed;
                    font-size: ${Math.random() * 0.5 + 0.5}rem;
                    color: ${colors[Math.floor(Math.random() * colors.length)]};
                    pointer-events: none;
                    z-index: 999;
                    left: ${Math.random() * window.innerWidth}px;
                    top: -20px;
                    animation: plumBlossomFall ${Math.random() * 3 + 3}s linear forwards;
                `;

                document.body.appendChild(particle);

                setTimeout(() => {
                    if (particle.parentNode) {
                        particle.parentNode.removeChild(particle);
                    }
                }, 6000);
            }
        }, 2000);
    }

    setupParticleSystem() {
        // Ambient particle system for header
        this.createAmbientParticles();
    }

    createAmbientParticles() {
        const particleContainer = document.createElement('div');
        particleContainer.className = 'header-particles';
        particleContainer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            pointer-events: none;
            z-index: -1;
            overflow: hidden;
        `;

        this.nav.appendChild(particleContainer);

        // Create floating particles
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                this.createFloatingParticle(particleContainer);
            }, i * 2000);
        }
    }

    createFloatingParticle(container) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: absolute;
            width: 2px;
            height: 2px;
            background: var(--primary-color);
            border-radius: 50%;
            opacity: 0.3;
            left: ${Math.random() * 100}%;
            top: 100%;
        `;

        container.appendChild(particle);

        gsap.to(particle, {
            y: -container.offsetHeight - 50,
            x: `+=${Math.random() * 100 - 50}`,
            opacity: 0,
            duration: Math.random() * 10 + 10,
            ease: 'none',
            onComplete: () => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
                // Create new particle
                this.createFloatingParticle(container);
            }
        });
    }

    // Public methods for external control
    activateSpecialMode(mode) {
        switch (mode) {
            case 'celebration':
                this.activateCelebrationMode();
                break;
            case 'battle':
                this.activateBattleMode();
                break;
            case 'peaceful':
                this.activatePeacefulMode();
                break;
        }
    }

    activateCelebrationMode() {
        this.nav.classList.add('celebration-mode');
        this.createFireworks();
    }

    activateBattleMode() {
        this.nav.classList.add('battle-mode');
        this.createLightningEffects();
    }

    activatePeacefulMode() {
        this.nav.classList.add('peaceful-mode');
        this.createGentleGlow();
    }

    createFireworks() {
        // Fireworks effect for celebrations
        const colors = ['#d4af37', '#ff6b35', '#ffffff', '#ff69b4'];
        
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                const firework = document.createElement('div');
                firework.style.cssText = `
                    position: fixed;
                    width: 4px;
                    height: 4px;
                    background: ${colors[Math.floor(Math.random() * colors.length)]};
                    border-radius: 50%;
                    left: ${Math.random() * window.innerWidth}px;
                    top: ${Math.random() * 200 + 100}px;
                    pointer-events: none;
                    z-index: 1002;
                `;

                document.body.appendChild(firework);

                // Explode
                for (let j = 0; j < 12; j++) {
                    const spark = firework.cloneNode();
                    document.body.appendChild(spark);

                    const angle = (j / 12) * Math.PI * 2;
                    const distance = Math.random() * 100 + 50;

                    gsap.to(spark, {
                        x: Math.cos(angle) * distance,
                        y: Math.sin(angle) * distance,
                        opacity: 0,
                        scale: 0,
                        duration: 1.5,
                        ease: 'power2.out',
                        onComplete: () => {
                            if (spark.parentNode) {
                                spark.parentNode.removeChild(spark);
                            }
                        }
                    });
                }

                setTimeout(() => {
                    if (firework.parentNode) {
                        firework.parentNode.removeChild(firework);
                    }
                }, 100);
            }, i * 500);
        }
    }

    createLightningEffects() {
        // Lightning effect for battle mode
        const lightning = document.createElement('div');
        lightning.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(45deg, 
                rgba(255, 255, 255, 0.1) 0%,
                transparent 50%,
                rgba(212, 175, 55, 0.1) 100%);
            pointer-events: none;
            z-index: 1;
            opacity: 0;
        `;

        this.nav.appendChild(lightning);

        gsap.to(lightning, {
            opacity: 1,
            duration: 0.1,
            repeat: 3,
            yoyo: true,
            onComplete: () => {
                if (lightning.parentNode) {
                    lightning.parentNode.removeChild(lightning);
                }
            }
        });
    }

    createGentleGlow() {
        // Gentle glow for peaceful mode
        gsap.to(this.nav, {
            boxShadow: '0 8px 32px rgba(212, 175, 55, 0.2), 0 2px 8px rgba(212, 175, 55, 0.3)',
            duration: 2,
            ease: 'power2.inOut',
            yoyo: true,
            repeat: -1
        });
    }
}

// CSS Animations (inject into document)
const headerAnimationStyles = `
<style>
@keyframes patternShift {
    0%, 100% {
        background-position: 0% 50%;
    }
    50% {
        background-position: 100% 50%;
    }
}

@keyframes plumBlossomFall {
    0% {
        transform: translateY(0) rotate(0deg);
        opacity: 1;
    }
    100% {
        transform: translateY(100vh) rotate(360deg);
        opacity: 0;
    }
}

.celebration-mode {
    animation: celebrationGlow 2s ease-in-out infinite alternate;
}

.battle-mode::before {
    animation: battlePulse 1s ease-in-out infinite;
}

.peaceful-mode {
    filter: brightness(1.1) saturate(1.2);
}

@keyframes celebrationGlow {
    0% {
        filter: brightness(1) saturate(1);
    }
    100% {
        filter: brightness(1.1) saturate(1.3);
    }
}

@keyframes battlePulse {
    0%, 100% {
        opacity: 0.3;
    }
    50% {
        opacity: 0.7;
    }
}
</style>
`;

// Inject styles
document.head.insertAdjacentHTML('beforeend', headerAnimationStyles);

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.headerEffects = new HeaderEffects();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HeaderEffects;
}
