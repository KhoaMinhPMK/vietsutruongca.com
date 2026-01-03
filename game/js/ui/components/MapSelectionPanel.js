/**
 * MapSelectionPanel - UI bản đồ chọn màn chơi với 3 cấp độ
 * Hiển thị như game RPG phiêu lưu với các điểm trên map
 */
class MapSelectionPanel {
    constructor() {
        this.visible = false;
        this.onLevelSelected = null; // Callback khi chọn level
        
        // Panel dimensions
        this.panelWidth = 800;
        this.panelHeight = 500;
        
        // Level points on map (vị trí các điểm trên map - hàng ngang)
        this.levels = [
            {
                id: 'easy',
                name: 'Thôn Đông',
                difficulty: 'Dễ',
                x: 150,
                y: 180,
                color: '#4CAF50',
                unlocked: true
            },
            {
                id: 'medium',
                name: 'Làng Tây',
                difficulty: 'Trung bình',
                x: 360,
                y: 180,
                color: '#FF9800',
                unlocked: true
            },
            {
                id: 'hard',
                name: 'Thành Bắc',
                difficulty: 'Khó',
                x: 570,
                y: 180,
                color: '#F44336',
                unlocked: true
            }
        ];
        
        // Hover state
        this.hoveredLevel = null;
    }
    
    /**
     * Hiển thị panel
     */
    show(callback) {
        this.visible = true;
        this.onLevelSelected = callback;
        console.log('🗺️ Map Selection Panel opened');
    }
    
    /**
     * Ẩn panel
     */
    hide() {
        this.visible = false;
        this.hoveredLevel = null;
        console.log('🗺️ Map Selection Panel closed');
    }
    
    /**
     * Check if point is inside level circle
     */
    isPointInLevel(x, y, level) {
        const distance = Math.sqrt(
            Math.pow(x - level.x, 2) + Math.pow(y - level.y, 2)
        );
        return distance <= 40; // Radius của level point
    }
    
    /**
     * Handle mouse move
     */
    handleMouseMove(canvasX, canvasY, canvasWidth, canvasHeight) {
        if (!this.visible) return;
        
        // Convert canvas coords to panel coords
        const panelX = (canvasWidth - this.panelWidth) / 2;
        const panelY = (canvasHeight - this.panelHeight) / 2;
        
        const relX = canvasX - panelX;
        const relY = canvasY - panelY;
        
        // Check hover
        this.hoveredLevel = null;
        for (const level of this.levels) {
            if (level.unlocked && this.isPointInLevel(relX, relY, level)) {
                this.hoveredLevel = level;
                break;
            }
        }
    }
    
    /**
     * Handle click
     */
    handleClick(canvasX, canvasY, canvasWidth, canvasHeight) {
        if (!this.visible) return false;
        
        console.log('🖱️ Map click at canvas:', canvasX, canvasY);
        
        // Convert canvas coords to panel coords
        const panelX = (canvasWidth - this.panelWidth) / 2;
        const panelY = (canvasHeight - this.panelHeight) / 2;
        
        // Account for the map area offset (ctx.translate in render)
        const mapOffsetX = 40;
        const mapOffsetY = 120;
        
        const relX = canvasX - panelX - mapOffsetX;
        const relY = canvasY - panelY - mapOffsetY;
        
        console.log('🖱️ Relative to map:', relX, relY);
        
        // Check click on level
        for (const level of this.levels) {
            const distance = Math.sqrt(
                Math.pow(relX - level.x, 2) + Math.pow(relY - level.y, 2)
            );
            
            console.log(`  Level ${level.name} at (${level.x}, ${level.y}), distance: ${distance.toFixed(2)}`);
            
            if (level.unlocked && distance <= 55) { // Radius 55 to account for hover size
                console.log(`✅ Selected level: ${level.name} (${level.difficulty})`);
                if (this.onLevelSelected) {
                    this.onLevelSelected(level);
                }
                this.hide();
                return true;
            }
        }
        
        console.log('❌ No level clicked');
        return false;
    }
    
    /**
     * Render map selection panel
     */
    render(ctx, canvasWidth, canvasHeight) {
        if (!this.visible) return;
        
        // === OVERLAY ===
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        
        // === PANEL POSITION ===
        const panelX = (canvasWidth - this.panelWidth) / 2;
        const panelY = (canvasHeight - this.panelHeight) / 2;
        
        // === PANEL SHADOW ===
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 30;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 10;
        
        // === PANEL BACKGROUND ===
        // Gradient background (dark wood)
        const gradient = ctx.createLinearGradient(panelX, panelY, panelX, panelY + this.panelHeight);
        gradient.addColorStop(0, '#3d2817');
        gradient.addColorStop(0.5, '#5c3d2e');
        gradient.addColorStop(1, '#3d2817');
        ctx.fillStyle = gradient;
        ctx.fillRect(panelX, panelY, this.panelWidth, this.panelHeight);
        
        // Reset shadow for other elements
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        // Outer golden border
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 5;
        ctx.strokeRect(panelX, panelY, this.panelWidth, this.panelHeight);
        
        // Inner decorative border
        ctx.strokeStyle = '#d4af37';
        ctx.lineWidth = 2;
        ctx.strokeRect(panelX + 8, panelY + 8, this.panelWidth - 16, this.panelHeight - 16);
        
        // Corner decorations
        const cornerSize = 25;
        ctx.fillStyle = '#ffd700';
        ctx.strokeStyle = '#8b6914';
        ctx.lineWidth = 2;
        
        // Top-left corner
        ctx.beginPath();
        ctx.moveTo(panelX, panelY);
        ctx.lineTo(panelX + cornerSize, panelY);
        ctx.lineTo(panelX, panelY + cornerSize);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Top-right corner
        ctx.beginPath();
        ctx.moveTo(panelX + this.panelWidth, panelY);
        ctx.lineTo(panelX + this.panelWidth - cornerSize, panelY);
        ctx.lineTo(panelX + this.panelWidth, panelY + cornerSize);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Bottom-left corner
        ctx.beginPath();
        ctx.moveTo(panelX, panelY + this.panelHeight);
        ctx.lineTo(panelX + cornerSize, panelY + this.panelHeight);
        ctx.lineTo(panelX, panelY + this.panelHeight - cornerSize);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Bottom-right corner
        ctx.beginPath();
        ctx.moveTo(panelX + this.panelWidth, panelY + this.panelHeight);
        ctx.lineTo(panelX + this.panelWidth - cornerSize, panelY + this.panelHeight);
        ctx.lineTo(panelX + this.panelWidth, panelY + this.panelHeight - cornerSize);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // === TITLE ===
        // Title shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 3;
        
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 36px Georgia, serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText('⚔ CHỌN TRẬN ĐỊA ⚔', panelX + this.panelWidth / 2, panelY + 25);
        
        // Reset shadow
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;
        
        // Subtitle
        ctx.fillStyle = '#d4af37';
        ctx.font = 'italic 18px Georgia, serif';
        ctx.fillText('Hãy chọn địa điểm để bảo vệ dân chúng khỏi quân Tần', panelX + this.panelWidth / 2, panelY + 70);
        
        // Divider line
        ctx.strokeStyle = '#d4af37';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(panelX + 100, panelY + 100);
        ctx.lineTo(panelX + this.panelWidth - 100, panelY + 100);
        ctx.stroke();
        
        // === MAP BACKGROUND (Stylized) ===
        ctx.save();
        ctx.translate(panelX + 40, panelY + 120);
        
        // Draw "ancient parchment" background for map
        const mapGradient = ctx.createRadialGradient(
            (this.panelWidth - 80) / 2, 
            (this.panelHeight - 180) / 2, 
            0,
            (this.panelWidth - 80) / 2, 
            (this.panelHeight - 180) / 2, 
            Math.max(this.panelWidth - 80, this.panelHeight - 180) / 2
        );
        mapGradient.addColorStop(0, '#f4e8d0');
        mapGradient.addColorStop(0.7, '#e8d9b8');
        mapGradient.addColorStop(1, '#d4c5a0');
        
        ctx.fillStyle = mapGradient;
        ctx.fillRect(0, 0, this.panelWidth - 80, this.panelHeight - 180);
        
        // Decorative border for map
        ctx.strokeStyle = '#8b6914';
        ctx.lineWidth = 4;
        ctx.strokeRect(0, 0, this.panelWidth - 80, this.panelHeight - 180);
        
        ctx.strokeStyle = '#d4af37';
        ctx.lineWidth = 2;
        ctx.strokeRect(4, 4, this.panelWidth - 88, this.panelHeight - 188);
        
        // Draw connecting paths between levels (straight horizontal)
        ctx.strokeStyle = 'rgba(139, 109, 20, 0.5)';
        ctx.lineWidth = 4;
        ctx.setLineDash([15, 10]);
        
        ctx.beginPath();
        ctx.moveTo(this.levels[0].x + 45, this.levels[0].y); // Start from right edge of first circle
        ctx.lineTo(this.levels[1].x - 45, this.levels[1].y); // To left edge of second circle
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(this.levels[1].x + 45, this.levels[1].y);
        ctx.lineTo(this.levels[2].x - 45, this.levels[2].y);
        ctx.stroke();
        
        ctx.setLineDash([]);
        
        // === DRAW LEVEL POINTS ===
        this.levels.forEach((level, index) => {
            const isHovered = this.hoveredLevel === level;
            const radius = isHovered ? 55 : 45;
            
            // Animated pulse effect when hovered
            if (isHovered) {
                const pulseRadius = radius + 10;
                ctx.fillStyle = level.color + '30'; // Semi-transparent
                ctx.beginPath();
                ctx.arc(level.x, level.y, pulseRadius, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // Glow effect when hovered
            if (isHovered) {
                ctx.shadowColor = level.color;
                ctx.shadowBlur = 25;
            }
            
            // Gradient for circle
            const circleGradient = ctx.createRadialGradient(
                level.x, level.y - 10, 10,
                level.x, level.y, radius
            );
            circleGradient.addColorStop(0, this.lightenColor(level.color, 30));
            circleGradient.addColorStop(1, level.color);
            
            ctx.fillStyle = level.unlocked ? circleGradient : '#555';
            ctx.beginPath();
            ctx.arc(level.x, level.y, radius, 0, Math.PI * 2);
            ctx.fill();
            
            // Double border
            ctx.strokeStyle = '#ffd700';
            ctx.lineWidth = 4;
            ctx.stroke();
            
            ctx.strokeStyle = level.unlocked ? '#fff' : '#888';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(level.x, level.y, radius - 5, 0, Math.PI * 2);
            ctx.stroke();
            
            // Reset shadow
            ctx.shadowBlur = 0;
            
            // Number indicator with background
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.beginPath();
            ctx.arc(level.x, level.y, 20, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 28px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText((index + 1).toString(), level.x, level.y);
            
            // Level name below circle with background
            const nameY = level.y + radius + 18;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            const nameWidth = ctx.measureText(level.name).width + 20;
            ctx.fillRect(level.x - nameWidth / 2, nameY - 12, nameWidth, 26);
            
            ctx.strokeStyle = level.color;
            ctx.lineWidth = 2;
            ctx.strokeRect(level.x - nameWidth / 2, nameY - 12, nameWidth, 26);
            
            ctx.fillStyle = '#2c1810';
            ctx.font = 'bold 18px Georgia, serif';
            ctx.fillText(level.name, level.x, nameY);
            
            // Difficulty badge
            ctx.fillStyle = level.color;
            ctx.font = 'bold 14px Georgia, serif';
            const diffText = `[${level.difficulty}]`;
            const diffWidth = ctx.measureText(diffText).width + 12;
            
            ctx.fillRect(level.x - diffWidth / 2, nameY + 16, diffWidth, 20);
            
            ctx.fillStyle = '#fff';
            ctx.fillText(diffText, level.x, nameY + 26);
            
            // Hover hint
            if (isHovered) {
                ctx.fillStyle = 'rgba(255, 215, 0, 0.2)';
                ctx.font = 'bold 14px Arial';
                ctx.fillText('← Click để chọn', level.x, level.y - radius - 15);
            }
        });
        
        ctx.restore();
        
        // === INSTRUCTIONS ===
        const instructY = panelY + this.panelHeight - 35;
        
        // Instruction background
        ctx.fillStyle = 'rgba(212, 175, 55, 0.2)';
        ctx.fillRect(panelX + 100, instructY - 20, this.panelWidth - 200, 40);
        
        ctx.strokeStyle = '#d4af37';
        ctx.lineWidth = 2;
        ctx.strokeRect(panelX + 100, instructY - 20, this.panelWidth - 200, 40);
        
        // Instruction text with icon
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 18px Georgia, serif';
        ctx.textAlign = 'center';
        ctx.fillText('👆 Nhấp vào điểm trên bản đồ để bắt đầu nhiệm vụ', panelX + this.panelWidth / 2, instructY);
    }
    
    /**
     * Helper: Lighten color
     */
    lightenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.min(255, ((num >> 16) & 0xFF) + amt);
        const G = Math.min(255, ((num >> 8) & 0xFF) + amt);
        const B = Math.min(255, (num & 0xFF) + amt);
        return '#' + (0x1000000 + (R << 16) + (G << 8) + B).toString(16).slice(1);
    }
}
