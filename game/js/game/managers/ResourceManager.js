/**
 * ResourceManager - Quản lý tài nguyên của người chơi
 */
class ResourceManager {
    constructor() {
        this.resources = {
            wood: 0,
            stone: 0,
            gold: 0
        };
        
        // Callbacks khi tài nguyên thay đổi
        this.onResourceChange = null;
        this.onMissionComplete = null; // Callback khi hoàn thành nhiệm vụ
        this.missionWoodTarget = 2; // Số gỗ cần thu thập
        this.missionCompleted = false; // Đã hoàn thành chưa
    }
    
    /**
     * Thêm gỗ
     * @param {number} amount - Số lượng gỗ cần thêm
     */
    addWood(amount = 1) {
        this.resources.wood += amount;
        console.log(`🪵 +${amount} Wood! Total: ${this.resources.wood}`);
        
        if (this.onResourceChange) {
            this.onResourceChange('wood', this.resources.wood);
        }
        
        // Check mission complete
        if (!this.missionCompleted && this.resources.wood >= this.missionWoodTarget) {
            this.missionCompleted = true;
            console.log('🎉 Mission Complete! Collected enough wood!');
            if (this.onMissionComplete) {
                this.onMissionComplete();
            }
        }
    }
    
    /**
     * Thêm đá
     * @param {number} amount - Số lượng đá cần thêm
     */
    addStone(amount = 1) {
        this.resources.stone += amount;
        console.log(`🪨 +${amount} Stone! Total: ${this.resources.stone}`);
        
        if (this.onResourceChange) {
            this.onResourceChange('stone', this.resources.stone);
        }
    }
    
    /**
     * Thêm vàng
     * @param {number} amount - Số lượng vàng cần thêm
     */
    addGold(amount = 1) {
        this.resources.gold += amount;
        console.log(`🪙 +${amount} Gold! Total: ${this.resources.gold}`);
        
        if (this.onResourceChange) {
            this.onResourceChange('gold', this.resources.gold);
        }
    }
    
    /**
     * Lấy số lượng gỗ
     * @returns {number}
     */
    getWood() {
        return this.resources.wood;
    }
    
    /**
     * Lấy số lượng đá
     * @returns {number}
     */
    getStone() {
        return this.resources.stone;
    }
    
    /**
     * Lấy số lượng vàng
     * @returns {number}
     */
    getGold() {
        return this.resources.gold;
    }
    
    /**
     * Lấy tất cả tài nguyên
     * @returns {Object}
     */
    getAll() {
        return { ...this.resources };
    }
    
    /**
     * Reset tất cả tài nguyên về 0
     */
    reset() {
        this.resources.wood = 0;
        this.resources.stone = 0;
        this.resources.gold = 0;
        console.log('♻️ Resources reset!');
    }
}
