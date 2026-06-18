class StoryScene extends Phaser.Scene {
    constructor() {
        super({ key: 'StoryScene' });
    }

    init(data) {
        this.storyData = data.story || [];
        this.nextScene = data.nextScene || 'GameScene';
    }

    create() {
        this.currentIndex = 0;
        this.showSlide();
    }

    showSlide() {
        if (this.currentIndex >= this.storyData.length) {
            this.scene.start(this.nextScene);
            return;
        }

        const slide = this.storyData[this.currentIndex];
        
        // Background image
        if (this.bg) this.bg.destroy();
        this.bg = this.add.image(480, 270, slide.image).setAlpha(0);
        this.tweens.add({ targets: this.bg, alpha: 1, duration: 1000 });

        // Text
        if (this.text) this.text.destroy();
        this.text = this.add.text(480, 450, slide.text, {
            fontSize: '24px', fontFamily: 'monospace', color: '#fff', align: 'center', wordWrap: { width: 800 }
        }).setOrigin(0.5).setAlpha(0);
        this.tweens.add({ targets: this.text, alpha: 1, duration: 1000 });

        this.input.once('pointerdown', () => {
            this.currentIndex++;
            this.showSlide();
        });
    }
}

if (typeof module !== 'undefined') module.exports = StoryScene;
