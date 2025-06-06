// Simple Navigation Interactive Effects
class NavigationEnhancer {
    constructor() {
        this.navLinks = document.querySelectorAll('.nav-link');
        this.navContainer = document.querySelector('.nav-container');
        
        this.init();
    }

    init() {
        this.setupSimpleEffects();
        this.setupKeyboardNavigation();
    }

    setupSimpleEffects() {
        this.navLinks.forEach(link => {
            // Simple click feedback
            link.addEventListener('click', (e) => {
                link.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    link.style.transform = '';
                }, 150);
            });

            // Simple hover sound (optional)
            link.addEventListener('mouseenter', () => {
                this.playSimpleHoverSound();
            });
        });
    }

    playSimpleHoverSound() {
        // Very subtle hover sound
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.01, audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.05);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.05);
        } catch (e) {
            // Silently fail
        }
    }    setupKeyboardNavigation() {
        // Simple keyboard navigation
        this.navLinks.forEach((link, index) => {
            link.addEventListener('keydown', (e) => {
                switch (e.key) {
                    case 'ArrowRight':
                    case 'ArrowDown':
                        e.preventDefault();
                        const nextIndex = (index + 1) % this.navLinks.length;
                        this.navLinks[nextIndex].focus();
                        break;
                    
                    case 'ArrowLeft':
                    case 'ArrowUp':
                        e.preventDefault();
                        const prevIndex = (index - 1 + this.navLinks.length) % this.navLinks.length;
                        this.navLinks[prevIndex].focus();
                        break;
                    
                    case 'Enter':
                    case ' ':
                        e.preventDefault();
                        link.click();
                        break;
                }
            });
        });
    }

    // Simple public methods
    activateLink(href) {
        this.navLinks.forEach(link => {
            link.classList.remove('active');
        });
        
        const targetLink = document.querySelector(`.nav-link[href="${href}"]`);
        if (targetLink) {
            targetLink.classList.add('active');
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.nav-container')) {
        window.navigationEnhancer = new NavigationEnhancer();
    }
});

// Export for external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NavigationEnhancer;
}
