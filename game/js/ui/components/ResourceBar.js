/**
 * ResourceBar - Thanh hiển thị tài nguyên ở trên màn hình
 */
class ResourceBar {
    /**
     * @param {ResourceManager} resourceManager - Manager quản lý tài nguyên
     */
    constructor(resourceManager) {
        this.resourceManager = resourceManager;
        
        // Icon images
        this.woodIcon = new Image();
        this.woodIcon.src = 'assets/sprites/wood.png';
        this.woodIconLoaded = false;
        
        this.woodIcon.onload = () => {
            this.woodIconLoaded = true;
            console.log('✅ Wood icon loaded');
        };
        
        this.woodIcon.onerror = () => {
            console.error('❌ Failed to load wood icon');
        };
        
        // Bar settings
        this.barHeight = 80;
        this.iconSize = 40;
        this.padding = 20;
        this.itemWidth = 180; // Width for each resource item
    }
    
    /**
     * Render resource bar on canvas
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} canvasWidth - Canvas width
     */
    render(ctx, canvasWidth) {
        // Wooden texture background with gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, this.barHeight);
        gradient.addColorStop(0, '#3d2817');
        gradient.addColorStop(0.5, '#5c3d2e');
        gradient.addColorStop(1, '#3d2817');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvasWidth, this.barHeight);
        
        // Decorative top border (golden)
        const topGradient = ctx.createLinearGradient(0, 0, canvasWidth, 0);
        topGradient.addColorStop(0, '#8b6914');
        topGradient.addColorStop(0.25, '#d4af37');
        topGradient.addColorStop(0.5, '#ffd700');
        topGradient.addColorStop(0.75, '#d4af37');
        topGradient.addColorStop(1, '#8b6914');
        ctx.fillStyle = topGradient;
        ctx.fillRect(0, 0, canvasWidth, 6);
        
        // Bottom decorative border
        ctx.fillStyle = '#1a0f08';
        ctx.fillRect(0, this.barHeight - 8, canvasWidth, 4);
        
        // Golden line above dark border
        ctx.strokeStyle = '#d4af37';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, this.barHeight - 10);
        ctx.lineTo(canvasWidth, this.barHeight - 10);
        ctx.stroke();
        
        // Embossed pattern (subtle lines)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        for (let i = 0; i < canvasWidth; i += 40) {
            ctx.beginPath();
            ctx.moveTo(i, 10);
            ctx.lineTo(i, this.barHeight - 15);
            ctx.stroke();
        }
        
        // Center position for resources
        const centerY = this.barHeight / 2 + 5;
        const startX = canvasWidth / 2 - this.itemWidth / 2;
        
        // Wood resource
        this.renderResource(ctx, startX, centerY, this.woodIcon, this.woodIconLoaded, 
            this.resourceManager.getWood(), '🪵');
    }
    
    /**
     * Render single resource item
     * @param {CanvasRenderingContext2D} ctx 
     * @param {number} x - X position
     * @param {number} y - Y center position
     * @param {Image} icon - Icon image
     * @param {boolean} iconLoaded - Is icon loaded
     * @param {number} amount - Resource amount
     * @param {string} fallbackEmoji - Fallback emoji if icon not loaded
     */
    renderResource(ctx, x, y, icon, iconLoaded, amount, fallbackEmoji) {
        // Decorative panel for resource
        const panelWidth = this.itemWidth;
        const panelHeight = 60;
        const panelX = x - 10;
        const panelY = y - panelHeight / 2;
        
        // Panel background (darker wood)
        ctx.fillStyle = 'rgba(26, 15, 8, 0.8)';
        ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
        
        // Panel border (golden embossed)
        ctx.strokeStyle = '#d4af37';
        ctx.lineWidth = 3;
        ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);
        
        // Inner glow
        ctx.strokeStyle = '#8b6914';
        ctx.lineWidth = 1;
        ctx.strokeRect(panelX + 2, panelY + 2, panelWidth - 4, panelHeight - 4);
        
        // Corner decorations
        this.drawCornerDecoration(ctx, panelX, panelY, 8, 'top-left');
        this.drawCornerDecoration(ctx, panelX + panelWidth, panelY, 8, 'top-right');
        this.drawCornerDecoration(ctx, panelX, panelY + panelHeight, 8, 'bottom-left');
        this.drawCornerDecoration(ctx, panelX + panelWidth, panelY + panelHeight, 8, 'bottom-right');
        
        // Icon background (circular frame)
        const iconX = x + 5;
        const iconY = y - this.iconSize / 2;
        const iconCenterX = iconX + this.iconSize / 2;
        const iconCenterY = iconY + this.iconSize / 2;
        
        // Circular golden frame
        ctx.beginPath();
        ctx.arc(iconCenterX, iconCenterY, this.iconSize / 2 + 4, 0, Math.PI * 2);
        ctx.fillStyle = '#8b6914';
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(iconCenterX, iconCenterY, this.iconSize / 2 + 2, 0, Math.PI * 2);
        ctx.fillStyle = '#d4af37';
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(iconCenterX, iconCenterY, this.iconSize / 2, 0, Math.PI * 2);
        ctx.fillStyle = '#3d2817';
        ctx.fill();
        
        // Draw icon
        if (iconLoaded && icon.complete) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(iconCenterX, iconCenterY, this.iconSize / 2 - 2, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(icon, iconX + 2, iconY + 2, this.iconSize - 4, this.iconSize - 4);
            ctx.restore();
        } else {
            // Fallback: Draw emoji
            ctx.font = '32px Arial';
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(fallbackEmoji, iconCenterX, iconCenterY);
        }
        
        // Draw amount text with ancient game style
        const textX = iconX + this.iconSize + 20;
        const amountStr = amount.toString();
        
        // Text shadow for depth
        ctx.font = 'bold 32px Georgia, serif';
        ctx.fillStyle = '#000000';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(amountStr, textX + 2, y + 2);
        
        // Text outline (dark gold)
        ctx.strokeStyle = '#8b6914';
        ctx.lineWidth = 4;
        ctx.strokeText(amountStr, textX, y);
        
        // Main text (bright gold)
        ctx.fillStyle = '#ffd700';
        ctx.fillText(amountStr, textX, y);
        
        // Highlight on text
        ctx.fillStyle = 'rgba(255, 255, 200, 0.5)';
        ctx.fillText(amountStr, textX - 1, y - 1);
    }
    
    /**
     * Draw decorative corner
     * @param {CanvasRenderingContext2D} ctx 
     * @param {number} x 
     * @param {number} y 
     * @param {number} size 
     * @param {string} corner - 'top-left', 'top-right', 'bottom-left', 'bottom-right'
     */
    drawCornerDecoration(ctx, x, y, size, corner) {
        ctx.fillStyle = '#d4af37';
        ctx.beginPath();
        
        switch(corner) {
            case 'top-left':
                ctx.moveTo(x, y);
                ctx.lineTo(x + size, y);
                ctx.lineTo(x, y + size);
                break;
            case 'top-right':
                ctx.moveTo(x, y);
                ctx.lineTo(x - size, y);
                ctx.lineTo(x, y + size);
                break;
            case 'bottom-left':
                ctx.moveTo(x, y);
                ctx.lineTo(x + size, y);
                ctx.lineTo(x, y - size);
                break;
            case 'bottom-right':
                ctx.moveTo(x, y);
                ctx.lineTo(x - size, y);
                ctx.lineTo(x, y - size);
                break;
        }
        
        ctx.closePath();
        ctx.fill();
    }
    
    /**
     * Get bar height
     * @returns {number}
     */
    getHeight() {
        return this.barHeight;
    }
}
