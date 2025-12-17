/**
 * DialogPanel - Hệ thống dialog RPG với portrait và tấm ván gỗ
 */
class DialogPanel {
    constructor() {
        this.visible = false;
        this.currentDialog = null;
        this.currentIndex = 0;
        this.dialogs = [];
        this.npcName = '';
        
        // Load portraits
        this.portraits = {
            player: new Image(),
            caolo: new Image()
        };
        
        this.portraits.player.src = 'assets/dialog/player.png';
        this.portraits.caolo.src = 'assets/dialog/caolodia.png';
        
        this.portraits.player.onload = () => console.log('✅ Player portrait loaded');
        this.portraits.caolo.onload = () => console.log('✅ Cao Lỗ portrait loaded');
        
        // Panel settings
        this.panelWidth = 500;
        this.panelHeight = 85;
        this.portraitSize = 60;
        this.portraitOffset = 12; // Nhô ra khỏi panel
        
        // Button bounds for click detection
        this.nextButtonBounds = null;
    }
    
    /**
     * Mở dialog với NPC
     * @param {string} npcName - Tên NPC
     * @param {Array} dialogs - Mảng dialogs [{speaker: 'player'|'caolo', text: '...'}]
     */
    open(npcName, dialogs) {
        this.npcName = npcName;
        this.dialogs = dialogs;
        this.currentIndex = 0;
        this.visible = true;
        console.log(`💬 Dialog opened with ${npcName}`);
    }
    
    /**
     * Đóng dialog
     */
    close() {
        this.visible = false;
        this.currentIndex = 0;
        this.dialogs = [];
        console.log('💬 Dialog closed');
    }
    
    /**
     * Chuyển sang dialog tiếp theo
     */
    next() {
        if (this.currentIndex < this.dialogs.length - 1) {
            this.currentIndex++;
            console.log(`💬 Dialog ${this.currentIndex + 1}/${this.dialogs.length}`);
        } else {
            this.close();
        }
    }
    
    /**
     * Kiểm tra xem có dialog đang mở không
     */
    isOpen() {
        return this.visible;
    }
    
    /**
     * Render dialog panel
     * @param {CanvasRenderingContext2D} ctx 
     * @param {number} canvasWidth 
     * @param {number} canvasHeight 
     */
    render(ctx, canvasWidth, canvasHeight) {
        if (!this.visible || this.dialogs.length === 0) return;
        
        const dialog = this.dialogs[this.currentIndex];
        
        // Panel position (bottom-center)
        const panelX = (canvasWidth - this.panelWidth) / 2;
        const panelY = canvasHeight - this.panelHeight - 50;
        
        // Semi-transparent overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        
        // === WOODEN PANEL BACKGROUND ===
        const gradient = ctx.createLinearGradient(panelX, panelY, panelX, panelY + this.panelHeight);
        gradient.addColorStop(0, '#3d2817');
        gradient.addColorStop(0.5, '#5c3d2e');
        gradient.addColorStop(1, '#3d2817');
        ctx.fillStyle = gradient;
        ctx.fillRect(panelX, panelY, this.panelWidth, this.panelHeight);
        
        // Wooden texture lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        for (let i = 0; i < this.panelWidth; i += 40) {
            ctx.beginPath();
            ctx.moveTo(panelX + i, panelY + 10);
            ctx.lineTo(panelX + i, panelY + this.panelHeight - 10);
            ctx.stroke();
        }
        
        // Golden border (main)
        ctx.strokeStyle = '#d4af37';
        ctx.lineWidth = 4;
        ctx.strokeRect(panelX, panelY, this.panelWidth, this.panelHeight);
        
        // Inner border (darker gold)
        ctx.strokeStyle = '#8b6914';
        ctx.lineWidth = 2;
        ctx.strokeRect(panelX + 3, panelY + 3, this.panelWidth - 6, this.panelHeight - 6);
        
        // Corner decorations
        this.drawCornerDecoration(ctx, panelX, panelY, 12, 'top-left');
        this.drawCornerDecoration(ctx, panelX + this.panelWidth, panelY, 12, 'top-right');
        this.drawCornerDecoration(ctx, panelX, panelY + this.panelHeight, 12, 'bottom-left');
        this.drawCornerDecoration(ctx, panelX + this.panelWidth, panelY + this.panelHeight, 12, 'bottom-right');
        
        // === PORTRAIT (Nhô ra khỏi panel) ===
        const portraitX = panelX + 20;
        const portraitY = panelY - this.portraitOffset;
        
        this.renderPortrait(ctx, portraitX, portraitY, dialog.speaker);
        
        // === TEXT AREA ===
        const textX = portraitX + this.portraitSize + 20;
        const textY = panelY + 15;
        const textWidth = this.panelWidth - (this.portraitSize + 60);
        
        // Speaker name
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 16px Georgia, serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        const speakerName = dialog.speaker === 'player' ? 'Người chơi' : this.npcName;
        ctx.fillText(speakerName, textX, textY);
        
        // Dialog text with word wrap
        ctx.fillStyle = '#f5f5dc';
        ctx.font = '14px Georgia, serif';
        this.drawWrappedText(ctx, dialog.text, textX, textY + 22, textWidth, 18);
        
        // === NEXT/CLOSE BUTTON ===
        const isLastDialog = this.currentIndex === this.dialogs.length - 1;
        const buttonText = isLastDialog ? 'Đóng ✕' : 'Tiếp ➜';
        const buttonWidth = 80;
        const buttonHeight = 28;
        const buttonX = panelX + this.panelWidth - buttonWidth - 15;
        const buttonY = panelY + this.panelHeight - buttonHeight - 10;
        
        // Button background
        const btnGradient = ctx.createLinearGradient(buttonX, buttonY, buttonX, buttonY + buttonHeight);
        btnGradient.addColorStop(0, '#d4af37');
        btnGradient.addColorStop(1, '#8b6914');
        ctx.fillStyle = btnGradient;
        ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
        
        // Button border
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 2;
        ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);
        
        // Button text
        ctx.fillStyle = '#1a0f08';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(buttonText, buttonX + buttonWidth / 2, buttonY + buttonHeight / 2);
        
        // Store button bounds for click detection
        this.nextButtonBounds = {
            x: buttonX,
            y: buttonY,
            width: buttonWidth,
            height: buttonHeight
        };
        
        // Dialog counter
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '12px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(`${this.currentIndex + 1}/${this.dialogs.length}`, buttonX - 8, buttonY + buttonHeight / 2);
    }
    
    /**
     * Render portrait với frame vàng
     */
    renderPortrait(ctx, x, y, speaker) {
        // Portrait frame shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(x + 4, y + 4, this.portraitSize, this.portraitSize);
        
        // Portrait frame background (dark wood)
        ctx.fillStyle = '#1a0f08';
        ctx.fillRect(x, y, this.portraitSize, this.portraitSize);
        
        // Golden frame (outer)
        ctx.strokeStyle = '#d4af37';
        ctx.lineWidth = 4;
        ctx.strokeRect(x, y, this.portraitSize, this.portraitSize);
        
        // Golden frame (inner)
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 4, y + 4, this.portraitSize - 8, this.portraitSize - 8);
        
        // Draw portrait image
        const portrait = this.portraits[speaker];
        if (portrait && portrait.complete) {
            ctx.save();
            ctx.beginPath();
            ctx.rect(x + 6, y + 6, this.portraitSize - 12, this.portraitSize - 12);
            ctx.clip();
            ctx.drawImage(portrait, x + 6, y + 6, this.portraitSize - 12, this.portraitSize - 12);
            ctx.restore();
        } else {
            // Fallback: Draw emoji
            ctx.font = '60px Arial';
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const emoji = speaker === 'player' ? '🧑' : '👨';
            ctx.fillText(emoji, x + this.portraitSize / 2, y + this.portraitSize / 2);
        }
        
        // Corner decorations on portrait
        ctx.fillStyle = '#ffd700';
        const cornerSize = 8;
        // Top-left
        ctx.fillRect(x, y, cornerSize, 2);
        ctx.fillRect(x, y, 2, cornerSize);
        // Top-right
        ctx.fillRect(x + this.portraitSize - cornerSize, y, cornerSize, 2);
        ctx.fillRect(x + this.portraitSize - 2, y, 2, cornerSize);
        // Bottom-left
        ctx.fillRect(x, y + this.portraitSize - 2, cornerSize, 2);
        ctx.fillRect(x, y + this.portraitSize - cornerSize, 2, cornerSize);
        // Bottom-right
        ctx.fillRect(x + this.portraitSize - cornerSize, y + this.portraitSize - 2, cornerSize, 2);
        ctx.fillRect(x + this.portraitSize - 2, y + this.portraitSize - cornerSize, 2, cornerSize);
    }
    
    /**
     * Draw wrapped text
     */
    drawWrappedText(ctx, text, x, y, maxWidth, lineHeight) {
        const words = text.split(' ');
        let line = '';
        let lineY = y;
        
        for (let i = 0; i < words.length; i++) {
            const testLine = line + words[i] + ' ';
            const metrics = ctx.measureText(testLine);
            
            if (metrics.width > maxWidth && i > 0) {
                ctx.fillText(line, x, lineY);
                line = words[i] + ' ';
                lineY += lineHeight;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, x, lineY);
    }
    
    /**
     * Draw corner decoration
     */
    drawCornerDecoration(ctx, x, y, size, corner) {
        ctx.fillStyle = '#ffd700';
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
     * Check if click is on next button
     */
    isClickOnNextButton(x, y) {
        if (!this.nextButtonBounds) {
            console.log('❌ Next button bounds not set');
            return false;
        }
        
        const btn = this.nextButtonBounds;
        const hit = x >= btn.x && x <= btn.x + btn.width &&
                    y >= btn.y && y <= btn.y + btn.height;
        
        console.log('🖱️ Next button click check:', { x, y, btn, hit });
        return hit;
    }
}
