class Crystal {
    constructor(scene, x, y) {
        this.scene = scene;
        this.collected = false;

        this.sprite = scene.physics.add.sprite(x, y, 'crystal-sheet', 0);
        this.sprite.setDepth(3);

        this.sprite.body.setAllowGravity(false);
        this.sprite.body.setImmovable(true);

        this.sprite.play('crystal-glow');

        scene.tweens.add({
            targets: this.sprite,
            y: y - 4,
            duration: 1200,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });
    }

    collect() {
        if (this.collected) return;
        this.collected = true;

        this.scene.tweens.add({
            targets: this.sprite,
            y: this.sprite.y - 30,
            alpha: 0,
            scaleX: 2,
            scaleY: 2,
            duration: 300,
            onComplete: () => {
                this.sprite.destroy();
            },
        });
    }

    destroy() {
        if (this.sprite && this.sprite.active) {
            this.sprite.destroy();
        }
    }
}

if (typeof module !== 'undefined') module.exports = Crystal;
