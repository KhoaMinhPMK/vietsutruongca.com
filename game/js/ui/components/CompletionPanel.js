/**
 * CompletionPanel - Bảng hoàn thành nhiệm vụ
 */
class CompletionPanel {
    constructor() {
        this.isVisible = false;
        this.message = '';
        this.onComplete = null; // Callback khi xong
        this.displayTime = 0;
        this.duration = 3000; // 3 seconds
        
        // Panel settings
        this.panelWidth = 600;
        this.panelHeight = 200;
    }
    
    /**
     * Show completion panel
     * @param {string} message - Mission complete message
     * @param {Function} callback - Callback after duration
     */
    show(message, callback) {
        this.isVisible = true;
        this.message = message;
        this.onComplete = callback;
        this.displayTime = 0;
        
        console.log('🎉 Mission Complete panel shown!');
    }
    
    /**
     * Update timer
     * @param {number} deltaTime
     */
    update(deltaTime) {
        if (!this.isVisible) return;
        
        this.displayTime += deltaTime;
        
        // Auto close and trigger callback after duration
        if (this.displayTime >= this.duration) {
            this.isVisible = false;
            if (this.onComplete) {
                this.onComplete();
            }
        }
    }
    
    /**
     * Render completion panel
     * @param {CanvasRenderingContext2D} ctx
     * @param {number} canvasWidth
     * @param {number} canvasHeight
     */
    render(ctx, canvasWidth, canvasHeight) {
        if (!this.isVisible) return;
        
        // Semi-transparent overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        
        // Panel position (center)
        const panelX = (canvasWidth - this.panelWidth) / 2;
        const panelY = (canvasHeight - this.panelHeight) / 2;
        
        // Wooden panel background
        const gradient = ctx.createLinearGradient(panelX, panelY, panelX, panelY + this.panelHeight);
        gradient.addColorStop(0, '#5c3d2e');
        gradient.addColorStop(0.5, '#4a2f23');
        gradient.addColorStop(1, '#3d2817');
        ctx.fillStyle = gradient;
        ctx.fillRect(panelX, panelY, this.panelWidth, this.panelHeight);
        
        // Golden border
        ctx.strokeStyle = '#d4af37';
        ctx.lineWidth = 4;
        ctx.strokeRect(panelX, panelY, this.panelWidth, this.panelHeight);
        
        // Inner border
        ctx.strokeStyle = '#8b7355';
        ctx.lineWidth = 2;
        ctx.strokeRect(panelX + 8, panelY + 8, this.panelWidth - 16, this.panelHeight - 16);
        
        // Title: "NHIỆM VỤ HOÀN THÀNH"
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 32px Georgia';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🎉 NHIỆM VỤ HOÀN THÀNH 🎉', canvasWidth / 2, panelY + 60);
        
        // Message
        ctx.fillStyle = '#f5deb3';
        ctx.font = '20px Georgia';
        ctx.fillText(this.message, canvasWidth / 2, panelY + 110);
        
        // Progress bar (time remaining)
        const barWidth = 400;
        const barHeight = 8;
        const barX = (canvasWidth - barWidth) / 2;
        const barY = panelY + this.panelHeight - 40;
        
        // Bar background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // Bar fill (decreasing)
        const progress = 1 - (this.displayTime / this.duration);
        ctx.fillStyle = '#4db8ff';
        ctx.fillRect(barX, barY, barWidth * progress, barHeight);
        
        // "Chuyển màn sau..." text
        ctx.fillStyle = '#aaa';
        ctx.font = '14px Arial';
        const timeLeft = Math.ceil((this.duration - this.displayTime) / 1000);
        ctx.fillText(`Chuyển màn sau ${timeLeft}s...`, canvasWidth / 2, barY + 25);
    }
}
