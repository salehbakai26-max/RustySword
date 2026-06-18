class Player {
    constructor(scene, x, y, config) {
        this.scene = scene;
        this.config = config;

        this.sprite = scene.physics.add.sprite(x, y, 'player-sheet', 0);
        this.sprite.setSize(28, 56);
        this.sprite.setOffset(10, 8);
        this.sprite.setCollideWorldBounds(true);
        this.sprite.setBounce(0);
        this.sprite.setDepth(10);
        this.sprite.body.setMaxVelocityY(600);

        this.health = config.maxHealth;
        this.maxHealth = config.maxHealth;
        this.speed = config.speed;
        this.isAttacking = false;
        this.isDashing = false;
        this.isInvincible = false;
        this.crystalCount = 0;
        this.facingRight = true;
        this.attackCooldown = false;
        this.attackActive = false;
        this.attackDir = 1;
        this.dashCooldown = false;
        this.canDash = false;
        this.canDoubleJump = false;
        this.hasDoubleJumped = false;

        this.cursors = scene.input.keyboard.createCursorKeys();
        this.keyZ = scene.input.keyboard.addKey('Z');
        this.keyX = scene.input.keyboard.addKey('X');
        this.keySpace = scene.input.keyboard.addKey('SPACE');

        this.slashEmitter = scene.add.particles(0, 0, 'particle', {
            speed: { min: 50, max: 150 },
            lifespan: 200,
            scale: { start: 2, end: 0 },
            tint: 0xd4a030,
            emitting: false,
        });
        this.slashEmitter.setDepth(11);

        this.dustEmitter = scene.add.particles(0, 0, 'particle', {
            speed: { min: 20, max: 50 },
            lifespan: 300,
            scale: { start: 1, end: 0 },
            tint: 0xffffff,
            emitting: false,
        });
        this.dustEmitter.setDepth(9);
        this.wasOnGround = true;
    }

    emitDust() {
        this.dustEmitter.emitParticleAt(this.sprite.x, this.sprite.y + 16, 5);
    }

    update() {
        if (this.isAttacking || this.isDashing) return;

        const onGround = this.sprite.body.blocked.down;
        
        if (onGround && !this.wasOnGround) {
            window.AudioSystem.play('land');
            this.emitDust();
        }
        this.wasOnGround = onGround;

        if (onGround) {
            this.hasDoubleJumped = false;
        }

        if (this.cursors.left.isDown) {
            this.sprite.setVelocityX(-this.speed);
            this.facingRight = false;
            this.sprite.setFlipX(true);
        } else if (this.cursors.right.isDown) {
            this.sprite.setVelocityX(this.speed);
            this.facingRight = true;
            this.sprite.setFlipX(false);
        } else {
            this.sprite.setVelocityX(0);
        }

        if (this.cursors.up.isDown && onGround) {
            this.sprite.setVelocityY(this.config.jump);
            window.AudioSystem.play('jump');
        }

        if (this.cursors.up.isDown && !onGround && this.canDoubleJump && !this.hasDoubleJumped) {
            this.sprite.setVelocityY(this.config.jump * 0.8);
            this.hasDoubleJumped = true;
            window.AudioSystem.play('dbljump');
            this.emitDust();
        }

        if (Phaser.Input.Keyboard.JustDown(this.keyZ) && !this.attackCooldown) {
            this.attack();
        }

        if (Phaser.Input.Keyboard.JustDown(this.keyX) && this.canDash && !this.dashCooldown) {
            this.dash();
        }

            if (this.sprite.body.velocity.y < -10) {
                this.sprite.setTexture('player-sheet', 5);
            } else if (this.sprite.body.velocity.y > 10 && !onGround) {
                this.sprite.setTexture('player-sheet', 6);
            } else if (Math.abs(this.sprite.body.velocity.x) > 10 && onGround) {
                this.sprite.setTexture('player-sheet', Math.floor(this.scene.time.now / 120) % 4 + 1);
            } else {
                this.sprite.setTexture('player-sheet', 0);
            }
    }

    attack() {
        this.isAttacking = true;
        this.attackCooldown = true;
        this.sprite.setVelocityX(0);
        this.sprite.setTexture('player-sheet', 7);
        window.AudioSystem.play('attack');

        const dir = this.facingRight ? 1 : -1;
        const slashX = this.sprite.x + dir * 40;
        const slashY = this.sprite.y - 10;

        this.slashEmitter.emitParticleAt(slashX, slashY, 5);

        this.attackDir = dir;
        this.attackActive = true;

        this.scene.time.delayedCall(150, () => {
            this.attackActive = false;
        });

        this.scene.time.delayedCall(this.config.attackDuration, () => {
            this.isAttacking = false;
            this.scene.time.delayedCall(200, () => {
                this.attackCooldown = false;
            });
        });
    }

    dash() {
        this.isDashing = true;
        this.dashCooldown = true;
        window.AudioSystem.play('dash');
        this.sprite.body.allowGravity = false;
        this.sprite.setTexture('player-sheet', 9);

        const dir = this.facingRight ? 1 : -1;
        this.sprite.setVelocityX(dir * this.config.dashSpeed);
        this.sprite.setVelocityY(0);

        this.scene.tweens.add({
            targets: this.sprite,
            alpha: { from: 1, to: 0.5 },
            duration: 50,
            yoyo: true,
            repeat: 3,
        });

        this.scene.time.delayedCall(this.config.dashDuration, () => {
            this.sprite.body.allowGravity = true;
            this.isDashing = false;
            this.sprite.setAlpha(1);
            this.scene.time.delayedCall(500, () => {
                this.dashCooldown = false;
            });
        });
    }

    hit(dir) {
        if (this.isInvincible || this.isDashing) return;

        this.health--;
        this.isInvincible = true;
        window.AudioSystem.play('hit');

        const pushDir = dir || (this.facingRight ? -1 : 1);
        this.sprite.setVelocityX(pushDir * 200);
        this.sprite.setVelocityY(-200);

        this.scene.tweens.add({
            targets: this.sprite,
            alpha: { from: 1, to: 0.3 },
            duration: 100,
            yoyo: true,
            repeat: 3,
        });

        this.scene.cameras.main.shake(100, 0.01);

        this.scene.events.emit('player-hit', this.health);

        this.scene.time.delayedCall(this.config.hitInvincible, () => {
            this.isInvincible = false;
            this.sprite.setAlpha(1);
        });

        if (this.health <= 0) {
            this.die();
        }
    }

    die() {
        this.sprite.setVelocity(0, -300);
        this.sprite.body.allowGravity = false;
        this.scene.tweens.add({
            targets: this.sprite,
            y: this.sprite.y - 50,
            alpha: 0,
            duration: 800,
            onComplete: () => {
                this.scene.events.emit('player-died');
            },
        });
    }

    collectCrystal() {
        this.crystalCount++;
        this.speed = this.config.speed + this.crystalCount * 2;
    }

    heal(amount) {
        this.health = Math.min(this.maxHealth, this.health + amount);
        this.scene.events.emit('player-heal', this.health);
    }

    enableDash() {
        this.canDash = true;
    }

    enableDoubleJump() {
        this.canDoubleJump = true;
    }

    destroy() {
        this.sprite.destroy();
    }
}

if (typeof module !== 'undefined') module.exports = Player;
