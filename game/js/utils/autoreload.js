/**
 * Auto-reload script for development
 * Detects code changes and automatically reloads the page
 */
(function() {
    'use strict';
    
    // Only enable in development (not on production domains)
    const isDevelopment = window.location.hostname === 'localhost' || 
                         window.location.hostname === '127.0.0.1' ||
                         window.location.protocol === 'file:';
    
    if (!isDevelopment) {
        console.log('Auto-reload disabled (production mode)');
        return;
    }
    
    let lastCheck = Date.now();
    const CHECK_INTERVAL = 2000; // Check every 2 seconds
    
    // Store initial load time
    const initialLoadTime = Date.now();
    
    /**
     * Check if page needs reload
     */
    function checkForUpdates() {
        // Simple version check using page load time
        const currentTime = Date.now();
        
        // If page has been open for more than 5 seconds, enable checking
        if (currentTime - initialLoadTime > 5000) {
            // Check localStorage for reload flag
            const shouldReload = localStorage.getItem('__dev_reload');
            if (shouldReload === 'true') {
                console.log('%c🔄 Code updated! Reloading...', 'color: #00ff00; font-weight: bold');
                localStorage.removeItem('__dev_reload');
                location.reload(true); // Force reload from server
            }
        }
    }
    
    /**
     * Keyboard shortcut to force reload
     * Ctrl+Shift+R or Cmd+Shift+R
     */
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'R') {
            e.preventDefault();
            console.log('%c🔄 Manual force reload...', 'color: #00ff00; font-weight: bold');
            
            // Clear all caches
            if ('caches' in window) {
                caches.keys().then(names => {
                    names.forEach(name => caches.delete(name));
                });
            }
            
            // Force reload
            location.reload(true);
        }
    });
    
    // Check for updates periodically
    setInterval(checkForUpdates, CHECK_INTERVAL);
    
    console.log('%c🔧 Auto-reload enabled (Dev mode)', 'color: #d4af37; font-weight: bold');
    console.log('%cPress Ctrl+Shift+R to force reload', 'color: #888');
    
    // Expose manual reload function
    window.forceReload = () => {
        console.log('%c🔄 Force reloading...', 'color: #00ff00; font-weight: bold');
        localStorage.setItem('__dev_reload', 'true');
        location.reload(true);
    };
    
})();
