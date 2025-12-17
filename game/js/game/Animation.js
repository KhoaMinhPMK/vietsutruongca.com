// Animation - Handle sprite animation timing
class Animation {
    constructor(name, startFrame, frameCount, frameTime) {
        this.name = name;
        this.startFrame = startFrame;
        this.frameCount = frameCount;
        this.frameTime = frameTime; // milliseconds per frame
        this.currentFrame = 0;
        this.elapsedTime = 0;
        this.loop = true;
        this.finished = false;
    }

    /**
     * Update animation
     * @param {number} deltaTime - Time since last update in ms
     */
    update(deltaTime) {
        this.elapsedTime += deltaTime;

        if (this.elapsedTime >= this.frameTime) {
            this.elapsedTime -= this.frameTime;
            this.currentFrame++;

            if (this.currentFrame >= this.frameCount) {
                if (this.loop) {
                    this.currentFrame = 0;
                } else {
                    this.currentFrame = this.frameCount - 1;
                    this.finished = true;
                }
            }
        }
    }

    /**
     * Get current frame index in spritesheet
     */
    getCurrentFrameIndex() {
        return this.startFrame + this.currentFrame;
    }

    /**
     * Reset animation to first frame
     */
    reset() {
        this.currentFrame = 0;
        this.elapsedTime = 0;
        this.finished = false;
    }

    /**
     * Check if animation is complete (for non-looping animations)
     */
    isComplete() {
        return this.finished;
    }
}
