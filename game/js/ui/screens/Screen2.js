/**
 * Screen2 - Màn chơi thứ 2
 */
class Screen2 {
    constructor(game) {
        this.game = game;
        this.name = 'Screen2';
        
        console.log('✅ Screen2 initialized');
    }
    
    /**
     * Initialize screen
     */
    init() {
        console.log('📺 Screen2 init');
        
        // Show canvas again
        const canvas = document.getElementById('gameCanvas');
        if (canvas) {
            canvas.style.display = 'block';
        }
        
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
    }
    
    /**
     * Start render loop
     */
    startRenderLoop() {
        this.lastTime = performance.now();
        const loop = (currentTime) => {
            const deltaTime = currentTime - this.lastTime;
            this.lastTime = currentTime;
            
            this.update(deltaTime);
            this.render(this.ctx, this.canvas.width, this.canvas.height);
            this.animationId = requestAnimationFrame(loop);
        };
        loop(this.lastTime);
    }
    
    /**
     * Handle keyboard input
     * @param {string} key
     * @param {boolean} isPressed
     */
    handleInput(key, isPressed) {
        // Placeholder for future controls
    }
    
    /**
     * Handle mouse clicks
     * @param {MouseEvent} e
     */
    handleClick(e) {
        // Placeholder for future interactions
    }
    
    /**
     * Update game state
     * @param {number} deltaTime
     */
    update(deltaTime) {
        // Placeholder for future logic
    }
    
    /**
     * Render screen
     * @param {CanvasRenderingContext2D} ctx
     * @param {number} canvasWidth
     * @param {number} canvasHeight
     */
    render(ctx, canvasWidth, canvasHeight) {
        // Black background
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        
        // Placeholder text
        ctx.fillStyle = '#fff';
        ctx.font = '32px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Screen 2 - Chờ lệnh...', canvasWidth / 2, canvasHeight / 2);
        
        // Instructions
        ctx.font = '16px Arial';
        ctx.fillStyle = '#888';
        ctx.fillText('Màn hình này đang trống. Chờ lệnh phát triển tiếp.', canvasWidth / 2, canvasHeight / 2 + 50);
    }
    
    /**
     * Cleanup when leaving screen
     */
    cleanup() {
        console.log('🧹 Screen2 cleanup');
    }
}
