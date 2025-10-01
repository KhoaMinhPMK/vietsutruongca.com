/**
 * Advanced Image Scroll Controller with Performance Optimization
 * Tạo hiệu ứng scroll image tương tự các tập đoàn lớn
 * Enhanced with smart throttling, device detection, and reduced motion support
 */

class ImageScrollController {
    constructor() {
        this.images = [];
        this.isInitialized = false;
        this.scrollRAF = null;
        this.lastScrollTime = 0;
        this.hoverDebounceTimer = null;
          // Performance settings
        this.performanceSettings = {
            throttleInterval: this.detectMobile() ? 32 : 16, // 30fps mobile, 60fps desktop
            hoverDebounce: 150,   // Increased debounce for better performance
            reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
            isLowEndDevice: this.detectLowEndDevice(),
            isMobile: this.detectMobile(),
            adaptiveThrottling: true // Enable adaptive throttling based on performance
        };
        
        this.init();
    }

    /**
     * Detect low-end device capabilities
     */
    detectLowEndDevice() {
        // Check device memory (if available)
        if (navigator.deviceMemory && navigator.deviceMemory <= 4) {
            return true;
        }
        
        // Check CPU cores (if available)
        if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) {
            return true;
        }
        
        // Check user agent for older devices
        const userAgent = navigator.userAgent.toLowerCase();
        const oldDevicePatterns = [
            /android [1-4]\./,
            /iphone os [5-9]_/,
            /cpu os [5-9]_/
        ];
        
        return oldDevicePatterns.some(pattern => pattern.test(userAgent));
    }

    /**
     * Detect mobile devices
     */
    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               window.innerWidth <= 768;
    }

    /**
     * Khởi tạo controller
     */
    init() {
        if (this.isInitialized) return;
          // Tìm tất cả images cần áp dụng effect (chỉ những ảnh có class parallax-img)
        this.images = document.querySelectorAll('.parallax-img');
        
        if (this.images.length === 0) {
            return;
        }
          this.setupScrollListener();
        this.setupIntersectionObserver();
        this.setupHoverEffects();
        this.setupReducedMotionListener();
        this.setupVisibilityListener();
        
        this.isInitialized = true;
    }

    /**
     * Setup scroll listener với performance optimization
     * FIXED: Enhanced throttling and conflict resolution with GSAP
     */
    setupScrollListener() {
        let ticking = false;
        let lastKnownScrollPosition = 0;

        const handleScroll = () => {
            lastKnownScrollPosition = window.pageYOffset;
            
            // ENHANCED: Smart throttling with adaptive timing
            const currentTime = performance.now();
            const timeDiff = currentTime - this.lastScrollTime;
            let minInterval = this.performanceSettings.throttleInterval;
            
            // ADAPTIVE: Increase throttling if performance is poor
            if (this.performanceSettings.adaptiveThrottling && this.performanceMonitor) {
                const recentFrameTime = currentTime - this.performanceMonitor.lastFrameTime;
                if (recentFrameTime > 32) { // If frame time > 32ms (< 30fps)
                    minInterval = Math.min(minInterval * 1.5, 50); // Increase throttling
                }
                this.performanceMonitor.lastFrameTime = currentTime;
            }
            
            // Skip if not enough time has passed (prevents excessive calls)
            if (timeDiff < minInterval) {
                return;
            }
            
            // CRITICAL FIX: Ensure only one animation frame is active
            if (this.scrollRAF) {
                cancelAnimationFrame(this.scrollRAF);
                this.scrollRAF = null;
            }
              if (!ticking) {
                this.scrollRAF = requestAnimationFrame(() => {
                    // IMPROVED: Check for GSAP conflicts before updating
                    if (this.shouldUpdateImages()) {
                        // Skip if reduced motion is preferred
                        if (this.performanceSettings.reducedMotion) {
                            this.updateImagePositionsReduced();
                        } else {
                            this.updateImagePositions(lastKnownScrollPosition);
                        }
                    }
                    
                    this.lastScrollTime = performance.now();
                    this.scrollRAF = null;
                    ticking = false;
                });
                ticking = true;
            }
        };

        // Use passive listener for better performance
        window.addEventListener('scroll', handleScroll, { 
            passive: true,
            capture: false
        });
    }
    
    /**
     * Check if images should be updated (avoid GSAP conflicts)
     */
    shouldUpdateImages() {
        // Don't update if GSAP ScrollTrigger is actively running
        if (window.ScrollTrigger && window.ScrollTrigger.isRefreshing) {
            return false;
        }
        
        // Don't update if page is hidden (performance)
        if (document.hidden) {
            return false;
        }
        
        return true;
    }

    /**
     * Setup Intersection Observer cho performance
     * Optimized thresholds for mobile devices
     */
    setupIntersectionObserver() {
        // Adjust thresholds based on device performance
        const thresholds = this.performanceSettings.isLowEndDevice 
            ? [0, 0.5, 1] 
            : [0, 0.25, 0.5, 0.75, 1];

        const observerOptions = {
            root: null,
            rootMargin: this.performanceSettings.isMobile ? '50px 0px' : '100px 0px',
            threshold: thresholds
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                const container = entry.target.closest('.story-image');
                if (!container) return;

                if (entry.isIntersecting) {
                    container.classList.add('in-viewport');
                    container.dataset.intersectionRatio = entry.intersectionRatio;
                    this.startImageAnimation(container, entry.intersectionRatio);
                } else {
                    container.classList.remove('in-viewport');
                    // Cleanup animations when out of view for performance
                    if (this.performanceSettings.isLowEndDevice) {
                        this.cleanupImageAnimation(container);
                    }
                }
            });
        }, observerOptions);

        // Observe tất cả images
        this.images.forEach(img => {
            this.observer.observe(img);
        });
    }

    /**
     * Cập nhật vị trí images dựa trên scroll với performance optimization
     */
    updateImagePositions(scrollY = window.pageYOffset) {
        const windowHeight = window.innerHeight;

        this.images.forEach((img) => {
            const container = img.closest('.story-image');
            if (!container || !container.classList.contains('in-viewport')) return;

            const rect = container.getBoundingClientRect();
            const containerTop = rect.top + scrollY;
            const containerHeight = rect.height;

            // Tính toán progress dựa trên vị trí scroll
            const scrollProgress = this.calculateScrollProgress(
                scrollY,
                containerTop,
                containerHeight,
                windowHeight
            );

            // Áp dụng transform với performance considerations
            this.applyImageTransform(img, container, scrollProgress);
        });
    }

    /**
     * Simplified update for reduced motion preference
     */
    updateImagePositionsReduced() {
        this.images.forEach((img) => {
            const container = img.closest('.story-image');
            if (!container || !container.classList.contains('in-viewport')) return;

            // Simple fade effect only for reduced motion
            const intersectionRatio = parseFloat(container.dataset.intersectionRatio || 0);
            const opacity = Math.max(0.6, intersectionRatio);
            
            img.style.transform = 'translateY(0%) scale(1)';
            img.style.filter = `opacity(${opacity})`;
            img.style.transition = 'opacity 0.5s ease-out';
        });
    }

    /**
     * Tính toán scroll progress
     */
    calculateScrollProgress(scrollY, containerTop, containerHeight, windowHeight) {
        const elementEnterPoint = containerTop - windowHeight;
        const elementExitPoint = containerTop + containerHeight;
        const totalScrollDistance = elementExitPoint - elementEnterPoint;
        const currentScrollDistance = scrollY - elementEnterPoint;
        
        return Math.max(0, Math.min(1, currentScrollDistance / totalScrollDistance));
    }

    /**
     * Áp dụng transform cho image với device-specific optimizations
     * Fixed: No more scroll jitter with GSAP conflict resolution
     */
    applyImageTransform(img, container, progress) {
        // Skip if currently hovering to prevent jitter
        if (container.dataset.hovering === 'true') return;
        
        // CRITICAL FIX: Check if GSAP is controlling this element
        if (container.dataset.gsapControlled === 'true') {
            // Let GSAP handle the animation, don't interfere
            return;
        }
        
        // ENHANCED: Check for active GSAP ScrollTrigger on this element
        if (window.ScrollTrigger) {
            const triggers = window.ScrollTrigger.getAll();
            const hasActiveGSAPTrigger = triggers.some(trigger => {
                return trigger.trigger === container || 
                       trigger.trigger === img ||
                       container.contains(trigger.trigger) ||
                       (trigger.vars && trigger.vars.trigger === container);
            });
            
            if (hasActiveGSAPTrigger) {
                container.dataset.gsapControlled = 'true';
                return;
            }
        }
        
        // Adjust intensity based on device performance
        const intensity = this.performanceSettings.isLowEndDevice ? 0.5 : 1;
        const mobileReduction = this.performanceSettings.isMobile ? 0.7 : 1;
        
        // IMPROVED: Much more conservative translateY calculation to prevent content overlap
        const translateYStart = -1; // Minimal starting offset
        const translateYEnd = -8 * intensity * mobileReduction; // Very conservative range (max 8%)
        const easedProgress = this.easeOutCubic(progress); // Apply easing for smoother animation
        const translateY = translateYStart + (translateYEnd - translateYStart) * easedProgress;

        // OPTIMIZED: Further reduced effects intensity for smoother performance
        const scale = 1 + (easedProgress * 0.015 * intensity); // Further reduced from 0.02
        const brightness = 0.97 + (easedProgress * 0.08 * intensity); // More subtle brightness
        const contrast = 1.01 + (easedProgress * 0.04 * intensity); // More subtle contrast
        const saturate = 1 + (easedProgress * 0.02 * intensity); // More subtle saturation

        // CRITICAL FIX: Use will-change and transform3d for GPU acceleration
        img.style.willChange = 'transform, filter';
        img.style.transform = `translate3d(0, ${translateY}%, 0) scale(${scale})`;
        img.style.backfaceVisibility = 'hidden'; // Prevent flickering
        
        // Conditional filter application for performance
        if (!this.performanceSettings.isLowEndDevice) {
            img.style.filter = `brightness(${brightness}) contrast(${contrast}) saturate(${saturate})`;
        } else {
            // Simple brightness for low-end devices
            img.style.filter = `brightness(${brightness})`;
        }

        // Update classes for CSS animations
        this.updateScrollClasses(container, progress);
    }
    
    /**
     * Smooth easing function for better animation
     */
    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    /**
     * Cập nhật classes dựa trên scroll progress
     */
    updateScrollClasses(container, progress) {
        // Remove all scroll classes
        container.classList.remove('scroll-start', 'scroll-progress', 'scroll-complete');

        // Add appropriate class based on progress (updated thresholds)
        if (progress < 0.2) {
            container.classList.add('scroll-start');
        } else if (progress < 0.6) {
            container.classList.add('scroll-progress');
        } else {
            container.classList.add('scroll-complete');
        }
    }

    /**
     * Bắt đầu animation cho image
     * FIXED: Better coordination with GSAP to prevent conflicts
     */
    startImageAnimation(container, intersectionRatio) {
        const img = container.querySelector('.parallax-img');
        if (!img) return;

        // CRITICAL FIX: Mark as GSAP controlled if GSAP is handling this element
        if (window.ScrollTrigger) {
            const triggers = window.ScrollTrigger.getAll();
            const hasGSAPTrigger = triggers.some(trigger => 
                trigger.trigger === container || 
                trigger.trigger === img ||
                container.contains(trigger.trigger)
            );
              if (hasGSAPTrigger) {
                container.dataset.gsapControlled = 'true';
                return; // Let GSAP handle this element
            }
        }

        // Device-appropriate transition with smoother easing
        const transitionDuration = this.performanceSettings.isMobile ? '0.8s' : '1.2s'; // Faster transitions
        const easing = this.performanceSettings.isLowEndDevice 
            ? 'ease-out' 
            : 'cubic-bezier(0.25, 0.46, 0.45, 0.94)';

        // IMPROVED: Add will-change for better performance
        img.style.willChange = 'transform, filter';
        img.style.transition = `transform ${transitionDuration} ${easing}, filter ${transitionDuration} ease-out`;
        
        // ENHANCED: Delay initial animation slightly to avoid conflicts
        setTimeout(() => {
            requestAnimationFrame(() => {
                this.updateImagePositions();
            });
        }, 50); // Small delay to ensure GSAP is settled
    }

    /**
     * Cleanup animation cho performance
     */
    cleanupImageAnimation(container) {
        const img = container.querySelector('.parallax-img');
        if (!img) return;

        img.style.transform = '';
        img.style.filter = '';
        img.style.transition = '';
        
        container.classList.remove('scroll-start', 'scroll-progress', 'scroll-complete');
    }

    /**
     * Advanced hover effects với smooth transition (No Jitter)
     * FIXED: Enhanced conflict resolution with scroll animations
     */
    setupHoverEffects() {
        this.images.forEach((img) => {
            const container = img.closest('.story-image');
            if (!container) return;

            let isHovering = false;
            let hoverAnimationFrame = null;

            container.addEventListener('mouseenter', () => {
                if (this.performanceSettings.reducedMotion) return;
                
                isHovering = true;
                container.dataset.hovering = 'true';
                
                // Cancel any pending animation
                if (hoverAnimationFrame) {
                    cancelAnimationFrame(hoverAnimationFrame);
                }

                // IMPROVED: Smoother transition with better easing
                const transitionDuration = this.performanceSettings.isMobile ? '0.2s' : '0.3s'; // Faster hover
                img.style.transition = `transform ${transitionDuration} cubic-bezier(0.4, 0, 0.2, 1), filter ${transitionDuration} ease-out`;
                
                // Apply hover enhancement while preserving scroll position
                hoverAnimationFrame = requestAnimationFrame(() => {
                    const currentTransform = img.style.transform || 'translate3d(0, 0%, 0) scale(1)';
                    
                    // IMPROVED: Better regex for extracting transform values
                    const translateYMatch = currentTransform.match(/translate3d\([^,]*,\s*([^,]+),/);
                    const currentTranslateY = translateYMatch ? translateYMatch[1] : '0%';
                    
                    const scaleMatch = currentTransform.match(/scale\(([^)]+)\)/);
                    const currentScale = scaleMatch ? parseFloat(scaleMatch[1]) : 1;
                    
                    // OPTIMIZED: More subtle hover scale for smoother experience
                    const hoverScale = Math.min(currentScale * 1.01, 1.05); // Very subtle
                    
                    // CRITICAL FIX: Preserve will-change for performance
                    img.style.willChange = 'transform, filter';
                    img.style.transform = `translate3d(0, ${currentTranslateY}, 0) scale(${hoverScale})`;
                    
                    // Enhanced filter only for high-end devices
                    if (!this.performanceSettings.isLowEndDevice) {
                        img.style.filter = 'brightness(1.03) contrast(1.05) saturate(1.02)'; // More subtle
                    }
                });
            });

            container.addEventListener('mouseleave', () => {
                isHovering = false;
                container.dataset.hovering = 'false';
                
                // Cancel any pending hover animation
                if (hoverAnimationFrame) {
                    cancelAnimationFrame(hoverAnimationFrame);
                }

                // IMPROVED: Faster transition back with better timing
                const transitionDuration = this.performanceSettings.isMobile ? '0.3s' : '0.4s';
                img.style.transition = `transform ${transitionDuration} cubic-bezier(0.4, 0, 0.2, 1), filter ${transitionDuration} ease-out`;
                
                // ENHANCED: Debounced restore to prevent jitter
                clearTimeout(this.hoverRestoreTimer);
                this.hoverRestoreTimer = setTimeout(() => {
                    requestAnimationFrame(() => {
                        this.updateImagePositions();
                    });
                }, 16); // One frame delay
            });

            // Store hover state for use in scroll updates
            container.isHovering = () => isHovering;
        });
    }

    /**
     * Setup reduced motion listener
     */
    setupReducedMotionListener() {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
          const handleReducedMotionChange = (e) => {
            this.performanceSettings.reducedMotion = e.matches;
            
            if (e.matches) {
                this.updateImagePositionsReduced();
            }
        };

        mediaQuery.addListener(handleReducedMotionChange);
    }

    /**
     * Setup visibility listener for tab switching performance
     */
    setupVisibilityListener() {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pause();
            } else {
                this.resume();
            }
        });
    }

    /**
     * Enhanced performance monitoring with FPS counter
     */
    startPerformanceMonitoring() {
        if (this.performanceMonitor) return;

        let frameCount = 0;
        let lastTime = performance.now();
        let fps = 60;

        // Create FPS display
        const fpsDisplay = document.createElement('div');
        fpsDisplay.id = 'fps-monitor';
        fpsDisplay.style.cssText = `
            position: fixed;
            top: 60px;
            right: 20px;
            background: rgba(0, 0, 0, 0.8);
            color: #00ff00;
            padding: 5px 10px;
            border-radius: 3px;
            font-family: monospace;
            font-size: 11px;
            z-index: 10001;
            min-width: 80px;
        `;
        document.body.appendChild(fpsDisplay);

        // Create performance stats display
        const statsDisplay = document.createElement('div');
        statsDisplay.id = 'performance-stats';
        statsDisplay.style.cssText = `
            position: fixed;
            top: 90px;
            right: 20px;
            background: rgba(0, 0, 0, 0.8);
            color: #ffffff;
            padding: 5px 10px;
            border-radius: 3px;
            font-family: monospace;
            font-size: 10px;
            z-index: 10001;
            min-width: 120px;
            line-height: 1.3;
        `;
        document.body.appendChild(statsDisplay);

        this.performanceMonitor = {
            fpsDisplay,
            statsDisplay,
            frameCount: 0,
            totalScrollEvents: 0,
            gsapConflicts: 0,
            lastScrollTime: 0
        };

        // FPS calculation loop
        const updateFPS = () => {
            const currentTime = performance.now();
            frameCount++;

            if (currentTime - lastTime >= 1000) {
                fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
                frameCount = 0;
                lastTime = currentTime;

                // Update FPS display with color coding
                fpsDisplay.textContent = `FPS: ${fps}`;
                if (fps >= 55) {
                    fpsDisplay.style.color = '#00ff00'; // Green for good performance
                } else if (fps >= 30) {
                    fpsDisplay.style.color = '#ffff00'; // Yellow for moderate performance
                } else {
                    fpsDisplay.style.color = '#ff0000'; // Red for poor performance
                }

                // Update stats
                statsDisplay.innerHTML = `
                    Scroll Events: ${this.performanceMonitor.totalScrollEvents}<br>
                    GSAP Conflicts: ${this.performanceMonitor.gsapConflicts}<br>
                    Active Images: ${this.images.length}<br>
                    Last Scroll: ${Date.now() - this.performanceMonitor.lastScrollTime}ms ago
                `;
            }

            if (this.debugMode) {
                requestAnimationFrame(updateFPS);
            }
        };

        updateFPS();
    }

    /**
     * Stop performance monitoring
     */
    stopPerformanceMonitoring() {
        if (this.performanceMonitor) {
            this.performanceMonitor.fpsDisplay.remove();
            this.performanceMonitor.statsDisplay.remove();
            this.performanceMonitor = null;
        }
    }

    /**
     * Cleanup khi không cần thiết
     */
    destroy() {
        if (this.observer) {
            this.observer.disconnect();
        }

        if (this.scrollRAF) {
            cancelAnimationFrame(this.scrollRAF);
        }

        if (this.hoverDebounceTimer) {
            clearTimeout(this.hoverDebounceTimer);
        }

        // Remove all event listeners
        window.removeEventListener('scroll', this.updateImagePositions);
        
        this.isInitialized = false;
        console.log('🗑️ Image Scroll Controller destroyed');
    }

    /**
     * Reset tất cả images
     */
    reset() {
        this.images.forEach((img) => {
            img.style.transform = '';
            img.style.filter = '';
            img.style.transition = '';
            
            const container = img.closest('.story-image');
            if (container) {
                container.classList.remove('scroll-start', 'scroll-progress', 'scroll-complete', 'in-viewport');
            }
        });
    }

    /**
     * Pause cho tab visibility
     */
    pause() {
        if (this.observer) {
            this.observer.disconnect();
        }
        console.log('⏸️ Image Scroll Controller paused');
    }

    /**
     * Resume cho tab visibility
     */
    resume() {
        if (this.observer && this.images.length > 0) {
            this.images.forEach(img => {
                this.observer.observe(img);
            });
        }
        console.log('▶️ Image Scroll Controller resumed');
    }

    /**
     * Get performance stats
     */
    getPerformanceStats() {
        return {
            deviceType: this.performanceSettings.isMobile ? 'mobile' : 'desktop',
            performanceMode: this.performanceSettings.isLowEndDevice ? 'low-end' : 'standard',
            reducedMotion: this.performanceSettings.reducedMotion,
            throttleInterval: this.performanceSettings.throttleInterval,
            imageCount: this.images.length
        };
    }

    /**
     * Initialize debug controls for performance testing
     */
    initDebugControls() {
        document.addEventListener('keydown', (e) => {
            // Press 'D' to toggle debug mode
            if (e.key.toLowerCase() === 'd' && e.ctrlKey) {
                e.preventDefault();
                this.toggleDebugMode();
            }
        });
    }

    /**
     * Toggle debug mode and performance monitoring
     */
    toggleDebugMode() {
        this.debugMode = !this.debugMode;
        
        if (this.debugMode) {
            this.startPerformanceMonitoring();
            console.log('🔍 Debug mode activated - Press Ctrl+D to toggle');
            this.showDebugNotification('Debug Mode: ON');
        } else {
            this.stopPerformanceMonitoring();
            console.log('🔍 Debug mode deactivated');
            this.showDebugNotification('Debug Mode: OFF');
        }
    }

    /**
     * Show debug notification
     */
    showDebugNotification(message) {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px 15px;
            border-radius: 5px;
            font-family: monospace;
            font-size: 12px;
            z-index: 10000;
            animation: fadeInOut 2s ease-in-out;
        `;
        
        // Add animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeInOut {
                0%, 100% { opacity: 0; transform: translateX(100%); }
                20%, 80% { opacity: 1; transform: translateX(0); }
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
            style.remove();
        }, 2000);
    }

    /**
     * Show debug instructions on page load
     */
    showDebugInstructions() {
        // Only show once per session
        if (sessionStorage.getItem('debugInstructionsShown')) return;
        
        setTimeout(() => {
            const instructions = document.createElement('div');
            instructions.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(0, 0, 0, 0.9);
                color: white;
                padding: 20px;
                border-radius: 10px;
                text-align: center;
                font-family: Arial, sans-serif;
                z-index: 10002;
                max-width: 300px;
                animation: fadeIn 0.5s ease-in;
            `;
            
            instructions.innerHTML = `
                <h3 style="margin-top: 0; color: #00ff00;">🔍 Performance Testing</h3>
                <p style="margin: 10px 0; font-size: 14px;">Press <kbd style="background: #333; padding: 2px 6px; border-radius: 3px;">Ctrl + D</kbd> to toggle debug mode</p>
                <p style="margin: 10px 0; font-size: 12px; color: #ccc;">Monitor FPS and scroll performance</p>
                <button id="closeInstructions" style="background: #007acc; color: white; border: none; padding: 8px 16px; border-radius: 5px; cursor: pointer; margin-top: 10px;">Got it!</button>
            `;
            
            document.body.appendChild(instructions);
            
            // Add fade in animation
            const style = document.createElement('style');
            style.textContent = `
                @keyframes fadeIn {
                    from { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
                    to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                }
            `;
            document.head.appendChild(style);
            
            // Close button functionality
            document.getElementById('closeInstructions').onclick = () => {
                instructions.remove();
                style.remove();
                sessionStorage.setItem('debugInstructionsShown', 'true');
            };
            
            // Auto close after 5 seconds
            setTimeout(() => {
                if (instructions.parentNode) {
                    instructions.remove();
                    style.remove();
                    sessionStorage.setItem('debugInstructionsShown', 'true');
                }
            }, 5000);
            
        }, 2000); // Show after initial loading
    }
}

// Export cho global access
window.ImageScrollController = ImageScrollController;
