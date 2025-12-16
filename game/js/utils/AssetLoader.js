// Asset Loader - Load game assets and track progress
class AssetLoader {
    constructor() {
        this.assets = {
            images: [],
            audio: [],
            videos: []
        };
        this.loadedCount = 0;
        this.totalCount = 0;
        this.onProgressCallback = null;
        this.onCompleteCallback = null;
        this.startTime = null;
        this.minimumLoadTime = 5000; // Thời gian loading tối thiểu: 5 giây
    }

    /**
     * Add assets to load queue
     * @param {Object} assetList - List of assets to load
     */
    setAssets(assetList) {
        if (assetList.images) {
            this.assets.images = assetList.images;
        }
        if (assetList.audio) {
            this.assets.audio = assetList.audio;
        }
        if (assetList.videos) {
            this.assets.videos = assetList.videos;
        }
        
        this.totalCount = this.assets.images.length + 
                         this.assets.audio.length + 
                         this.assets.videos.length;
        
        console.log('Total assets to load:', this.totalCount);
    }

    /**
     * Start loading all assets
     */
    load() {
        this.startTime = Date.now();
        
        if (this.totalCount === 0) {
            console.warn('No assets to load');
            this.onComplete();
            return;
        }

        // Load images
        this.assets.images.forEach(src => {
            this.loadImage(src);
        });

        // Load audio
        this.assets.audio.forEach(src => {
            this.loadAudio(src);
        });

        // Load videos
        this.assets.videos.forEach(src => {
            this.loadVideo(src);
        });
    }

    /**
     * Load a single image
     */
    loadImage(src) {
        const img = new Image();
        img.onload = () => {
            this.onAssetLoaded(src, 'image');
        };
        img.onerror = () => {
            console.error('Failed to load image:', src);
            this.onAssetLoaded(src, 'image', true);
        };
        img.src = src;
    }

    /**
     * Load a single audio file
     */
    loadAudio(src) {
        const audio = new Audio();
        audio.oncanplaythrough = () => {
            this.onAssetLoaded(src, 'audio');
        };
        audio.onerror = () => {
            console.error('Failed to load audio:', src);
            this.onAssetLoaded(src, 'audio', true);
        };
        audio.src = src;
    }

    /**
     * Load a single video file
     */
    loadVideo(src) {
        const video = document.createElement('video');
        video.oncanplaythrough = () => {
            this.onAssetLoaded(src, 'video');
        };
        video.onerror = () => {
            console.error('Failed to load video:', src);
            this.onAssetLoaded(src, 'video', true);
        };
        video.src = src;
    }

    /**
     * Called when an asset is loaded
     */
    onAssetLoaded(src, type, hasError = false) {
        this.loadedCount++;
        const realProgress = (this.loadedCount / this.totalCount) * 100;
        
        console.log(`Loaded [${type}]: ${src} (${this.loadedCount}/${this.totalCount})`);
        
        // Tính toán progress với fake delay
        const elapsed = Date.now() - this.startTime;
        const timeProgress = Math.min((elapsed / this.minimumLoadTime) * 100, 100);
        
        // Lấy progress thấp nhất giữa real progress và time progress
        // Đảm bảo loading chạy ít nhất 5 giây
        const displayProgress = Math.min(realProgress, timeProgress);
        
        // Call progress callback
        if (this.onProgressCallback) {
            this.onProgressCallback(displayProgress, this.loadedCount, this.totalCount);
        }

        // Check if all loaded
        if (this.loadedCount >= this.totalCount) {
            // Nếu load xong nhưng chưa đủ thời gian tối thiểu
            const remainingTime = this.minimumLoadTime - elapsed;
            
            if (remainingTime > 0) {
                console.log(`Assets loaded, waiting ${remainingTime}ms more...`);
                // Tiếp tục cập nhật progress từ từ
                this.fakeProgressToComplete(displayProgress, remainingTime);
            } else {
                this.onComplete();
            }
        }
    }
    
    /**
     * Fake progress from current to 100% over remaining time
     */
    fakeProgressToComplete(currentProgress, remainingTime) {
        const steps = 20; // Số bước để đến 100%
        const stepTime = remainingTime / steps;
        const progressPerStep = (100 - currentProgress) / steps;
        
        let step = 0;
        const interval = setInterval(() => {
            step++;
            const newProgress = Math.min(currentProgress + (progressPerStep * step), 100);
            
            if (this.onProgressCallback) {
                this.onProgressCallback(newProgress, this.loadedCount, this.totalCount);
            }
            
            if (step >= steps || newProgress >= 100) {
                clearInterval(interval);
                this.onComplete();
            }
        }, stepTime);
    }

    /**
     * Called when all assets are loaded
     */
    onComplete() {
        console.log('All assets loaded!');
        if (this.onCompleteCallback) {
            this.onCompleteCallback();
        }
    }

    /**
     * Set progress callback
     */
    onProgress(callback) {
        this.onProgressCallback = callback;
    }

    /**
     * Set complete callback
     */
    onLoad(callback) {
        this.onCompleteCallback = callback;
    }
}
