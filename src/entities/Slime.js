class Slime {
    constructor(scene, x, y, config) {
        this.scene = scene;
        this.alive = true;
        this.config = config;

        this.sprite = scene.physics.add.sprite(x, y, 'slime-sheet', 0);
        this.sprite.setSize(24, 16);
        this.sprite.setOffset(4, 8);
        this.sprite.setBounce(0);
        this.sprite.setDepth(5);
        this.sprite.body.setAllowGravity(true);

        this.patrolOrigin = x;
        this.patrolRange = config.patrolRange;
        this.speed = config.speed;
        this.direction = -1;

        this.sprite.setData('alive', true);
        this.sprite.setData('ref', this);

        this.sprite.play('slime-idle');
    }

    update() {
        if (!this.alive) return;

        const dist = this.sprite.x - this.patrolOrigin;

        if (dist < -this.patrolRange) {
            this.direction = 1;
            this.sprite.setFlipX(true);
        } else if (dist > this.patrolRange) {
            this.direction = -1;
            this.sprite.setFlipX(false);
        }

        this.sprite.setVelocityX(this.speed * this.direction);

        const onGround = this.sprite.body.blocked.down;
        if (!onGround) {
            this.sprite.setVelocityX(0);
            if (this.direction > 0) this.direction = -1;
            else this.direction = 1;
            this.sprite.setFlipX(this.direction > 0);
        }
    }

    hit(dir) {
        if (!this.alive) return;
        this.alive = false;
        this.sprite.setData('alive', false);

        this.sprite.setVelocity(dir * 150, -200);
        this.sprite.body.setAllowGravity(true);

        this.scene.tweens.add({
            targets: this.sprite,
            alpha: 0,
            y: this.sprite.y - 20,
            duration: 500,
            onComplete: () => {
                this.sprite.destroy();
            },
        });

        this.scene.events.emit('enemy-killed', this);
    }

    destroy() {
        if (this.sprite && this.sprite.active) {
            this.sprite.destroy();
        }
    }
}

if (typeof module !== 'undefined') module.exports = Slime;
