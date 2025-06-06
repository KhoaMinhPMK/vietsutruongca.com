// Advanced Particle System for Enhanced Visual Effects
class ParticleSystem {
    constructor() {
        this.container = document.getElementById('particles');
        this.particles = [];
        this.maxParticles = 150;
        this.animationId = null;
        this.isRunning = false;
        
        this.init();
    }

    init() {
        if (!this.container) {
            console.error('Particles container not found');
            return;
        }

        this.createParticles();
        this.start();
        this.setupEventListeners();
        
        console.log('Particle system initialized');
    }

    createParticles() {
        for (let i = 0; i < this.maxParticles; i++) {
            this.createParticle();
        }
    }

    createParticle() {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random particle type
        const types = ['', 'large', 'small'];
        const randomType = types[Math.floor(Math.random() * types.length)];
        if (randomType) {
            particle.classList.add(randomType);
        }

        // Set initial properties
        const properties = this.generateParticleProperties();
        this.setParticleProperties(particle, properties);
        
        this.container.appendChild(particle);
        this.particles.push({
            element: particle,
            ...properties
        });
    }

    generateParticleProperties() {
        return {
            x: Math.random() * window.innerWidth,
            y: window.innerHeight + 50,
            speed: Math.random() * 3 + 1,
            drift: (Math.random() - 0.5) * 2,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 4,
            opacity: Math.random() * 0.8 + 0.2,
            scale: Math.random() * 0.8 + 0.6,
            life: 0,
            maxLife: Math.random() * 1000 + 2000
        };
    }

    setParticleProperties(particle, props) {
        particle.style.left = props.x + 'px';
        particle.style.top = props.y + 'px';
        particle.style.opacity = props.opacity;
        particle.style.transform = `
            scale(${props.scale}) 
            rotate(${props.rotation}deg)
        `;
    }

    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            // Update position
            particle.y -= particle.speed;
            particle.x += particle.drift;
            particle.rotation += particle.rotationSpeed;
            particle.life += 16; // Assuming 60fps
            
            // Update opacity based on life
            const lifeRatio = particle.life / particle.maxLife;
            if (lifeRatio < 0.2) {
                particle.opacity = lifeRatio * 5;
            } else if (lifeRatio > 0.8) {
                particle.opacity = (1 - lifeRatio) * 5;
            }
            
            // Apply changes to DOM element
            this.setParticleProperties(particle.element, particle);
            
            // Remove particle if it's off screen or life is over
            if (particle.y < -50 || particle.x < -50 || particle.x > window.innerWidth + 50 || particle.life >= particle.maxLife) {
                this.removeParticle(i);
                this.createParticle(); // Create new particle to maintain count
            }
        }
    }

    removeParticle(index) {
        const particle = this.particles[index];
        if (particle && particle.element) {
            this.container.removeChild(particle.element);
        }
        this.particles.splice(index, 1);
    }

    animate() {
        if (!this.isRunning) return;
        
        this.updateParticles();
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    start() {
        this.isRunning = true;
        this.animate();
    }

    stop() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    setupEventListeners() {
        // Pause particles when page is not visible
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.stop();
            } else {
                this.start();
            }
        });

        // Adjust particle count based on window size
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // Mouse interaction effects
        document.addEventListener('mousemove', (e) => {
            this.handleMouseMove(e);
        });
    }

    handleResize() {
        // Adjust max particles based on screen size
        const screenArea = window.innerWidth * window.innerHeight;
        const baseArea = 1920 * 1080;
        const ratio = Math.min(screenArea / baseArea, 1);
        
        this.maxParticles = Math.floor(150 * ratio);
        
        // Remove excess particles if screen is smaller
        while (this.particles.length > this.maxParticles) {
            this.removeParticle(this.particles.length - 1);
        }
        
        // Add particles if screen is larger
        while (this.particles.length < this.maxParticles) {
            this.createParticle();
        }
    }

    handleMouseMove(e) {
        // Create mouse interaction effect
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        const interactionRadius = 100;
        
        this.particles.forEach(particle => {
            const dx = particle.x - mouseX;
            const dy = particle.y - mouseY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < interactionRadius) {
                const force = (interactionRadius - distance) / interactionRadius;
                particle.drift += (dx / distance) * force * 0.5;
                particle.speed += force * 0.5;
                
                // Add some sparkle effect
                particle.opacity = Math.min(particle.opacity + force * 0.3, 1);
            }
        });
    }

    destroy() {
        this.stop();
        
        // Remove all particles
        this.particles.forEach(particle => {
            if (particle.element) {
                this.container.removeChild(particle.element);
            }
        });
        
        this.particles = [];
    }
}

// Enhanced Particle Effects for Specific Sections
class SectionParticleEffects {
    constructor() {
        this.effects = new Map();
        this.init();
    }

    init() {
        this.setupScrollTriggerEffects();
        this.setupHoverEffects();
    }

    setupScrollTriggerEffects() {
        // Create particles when sections come into view
        const sections = document.querySelectorAll('.story-section, .characters-section, .gameplay-section');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.triggerSectionEffect(entry.target);
                }
            });
        }, {
            threshold: 0.3
        });

        sections.forEach(section => {
            observer.observe(section);
        });
    }

    setupHoverEffects() {
        // Add particle effects on card hover
        const cards = document.querySelectorAll('.story-card, .character-card, .feature-card');
        
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                this.createHoverEffect(card);
            });
        });
    }

    triggerSectionEffect(section) {
        const sectionId = section.id || section.className.split(' ')[0];
        
        if (this.effects.has(sectionId)) {
            return; // Effect already triggered
        }

        const rect = section.getBoundingClientRect();
        const particleCount = 20;
        
        for (let i = 0; i < particleCount; i++) {
            setTimeout(() => {
                this.createSectionParticle(rect);
            }, i * 100);
        }
        
        this.effects.set(sectionId, true);
    }

    createSectionParticle(rect) {
        const particle = document.createElement('div');
        particle.className = 'section-particle';
        
        // Style the particle
        particle.style.cssText = `
            position: fixed;
            width: 6px;
            height: 6px;
            background: radial-gradient(circle, #d4af37, #ff6b35);
            border-radius: 50%;
            pointer-events: none;
            z-index: 1000;
            left: ${rect.left + Math.random() * rect.width}px;
            top: ${rect.top + rect.height}px;
            opacity: 0;
            transform: scale(0);
        `;
        
        document.body.appendChild(particle);
        
        // Animate the particle
        const animation = particle.animate([
            {
                opacity: 0,
                transform: 'scale(0) translateY(0px)',
                offset: 0
            },
            {
                opacity: 1,
                transform: 'scale(1) translateY(-50px)',
                offset: 0.3
            },
            {
                opacity: 1,
                transform: 'scale(1.2) translateY(-100px)',
                offset: 0.7
            },
            {
                opacity: 0,
                transform: 'scale(0) translateY(-150px)',
                offset: 1
            }
        ], {
            duration: 2000,
            easing: 'ease-out'
        });
        
        animation.onfinish = () => {
            document.body.removeChild(particle);
        };
    }

    createHoverEffect(element) {
        const rect = element.getBoundingClientRect();
        const particleCount = 8;
        
        for (let i = 0; i < particleCount; i++) {
            setTimeout(() => {
                this.createHoverParticle(rect);
            }, i * 50);
        }
    }

    createHoverParticle(rect) {
        const particle = document.createElement('div');
        particle.className = 'hover-particle';
        
        const angle = Math.random() * Math.PI * 2;
        const distance = 50 + Math.random() * 30;
        const endX = Math.cos(angle) * distance;
        const endY = Math.sin(angle) * distance;
        
        particle.style.cssText = `
            position: fixed;
            width: 4px;
            height: 4px;
            background: #d4af37;
            border-radius: 50%;
            pointer-events: none;
            z-index: 1000;
            left: ${rect.left + rect.width / 2}px;
            top: ${rect.top + rect.height / 2}px;
            opacity: 1;
            box-shadow: 0 0 10px #d4af37;
        `;
        
        document.body.appendChild(particle);
        
        const animation = particle.animate([
            {
                transform: 'translate(0, 0) scale(1)',
                opacity: 1,
                offset: 0
            },
            {
                transform: `translate(${endX}px, ${endY}px) scale(0.5)`,
                opacity: 0.5,
                offset: 0.8
            },
            {
                transform: `translate(${endX * 1.5}px, ${endY * 1.5}px) scale(0)`,
                opacity: 0,
                offset: 1
            }
        ], {
            duration: 1000,
            easing: 'ease-out'
        });
        
        animation.onfinish = () => {
            document.body.removeChild(particle);
        };
    }
}

// Initialize particle systems when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.particleSystem = new ParticleSystem();
    window.sectionEffects = new SectionParticleEffects();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ParticleSystem, SectionParticleEffects };
}
