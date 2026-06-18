const SaveManager = (typeof require !== 'undefined') ? require('../utils/SaveManager') : window.SaveManager; // Placeholder logic for now

class GameScene extends Phaser.Scene {
    init(data) {
        if (data && data.checkpoint) {
            this.checkpoint = data.checkpoint;
        }
    }

    constructor() {
        super({ key: 'GameScene' });
        this.checkpoint = { x: 64, y: 400 };
    }

    preload() {
        this.load.json('level1', 'assets/levels/level1.json');
        this.load.json('enemies', 'assets/data/enemies.json');
        this.load.json('player', 'assets/data/player.json');
        this.load.json('music', 'assets/data/music.json');
        this.load.image('checkpoint', 'assets/PA1/Other/Transition.png');
    }

    create() {
        this.cameras.main.fadeIn(500);

        this.createBackground();
        this.createLevel();
        this.createPlayer();
        this.createEnemies();
        this.createCollectibles();
        this.createCrates();
        this.createCheckpoints();
        this.createPortal();
        this.createHUD();

        this.setupCollisions();
        this.setupCamera();

        this.events.on('player-hit', (health) => {
            this.hud.updateHealth(health);
        });

        this.events.on('player-heal', (health) => {
            this.hud.updateHealth(health);
        });

        this.events.on('player-died', () => {
            this.time.delayedCall(1000, () => {
                this.scene.restart({ checkpoint: this.checkpoint });
            });
        });

        this.events.on('enemy-killed', (enemy) => {
            const idx = this.enemies.indexOf(enemy);
            if (idx > -1) this.enemies.splice(idx, 1);
        });

        this.crystalsCollected = 0;
        this.slimes = [];
    }

    createBackground() {
        this.add.image(960, 270, 'bg-sky').setScrollFactor(0.1).setDepth(-10);

        for (let x = 0; x < CONFIG.level1.width; x += 128) {
            const tree = this.add.image(x, 300, 'tile-bg-tree');
            tree.setDepth(-5);
            tree.setScrollFactor(0.3);
        }

        for (let x = 0; x < CONFIG.level1.width; x += 96) {
            const bush = this.add.image(x, 400, 'tile-bg-bush');
            bush.setDepth(-3);
            bush.setScrollFactor(0.5);
        }
    }

    createLevel() {
        const T = 32;
        this.platforms = this.physics.add.staticGroup();
        this.ground = this.physics.add.staticGroup();

        const levelData = this.cache.json.get('level1').data;

        this.levelHeight = levelData.length;
        this.levelWidth = levelData[0].length;


        for (let row = 0; row < levelData.length; row++) {
            for (let col = 0; col < levelData[row].length; col++) {
                const ch = levelData[row][col];
                const x = col * T + T / 2;
                const y = row * T + T / 2;

                if (ch === '1') {
                    const tile = this.ground.create(x, y, row < 3 ? 'tile-ground' : 'tile-grass');
                    tile.setDepth(1);
                    tile.refreshBody();
                } else if (ch === 'P') {
                    const tile = this.platforms.create(x, y, 'tile-platform');
                    tile.setDepth(1);
                    tile.refreshBody();
                } else if (ch === '2') {
                    const tile = this.ground.create(x, y, 'tile-ground');
                    tile.setDepth(1);
                    tile.refreshBody();
                    const spike = this.physics.add.staticImage(x, y - T / 2 + 8, 'spikes');
                    spike.setDepth(2);
                    spike.refreshBody();
                    spike.body.setSize(28, 12);
                    spike.body.setOffset(2, 0);
                    this.spikes = this.spikes || [];
                    this.spikes.push(spike);
                    spike.setData('hazard', true);
                }
            }
        }
    }

    createCheckpoints() {
        this.checkpoints = this.physics.add.staticGroup();
        const cp = this.checkpoints.create(1500, 430, 'checkpoint');
        cp.setDepth(2);
        cp.refreshBody();
        cp.setData('active', true);
    }

    createPlayer() {
        this.player = new Player(this, this.checkpoint.x, this.checkpoint.y, this.cache.json.get('player'));
        this.enemies = [];
    }

    createEnemies() {
        const enemyConfig = this.cache.json.get('enemies');
        const spawnPoints = [
            { x: 500, y: 450 },
            { x: 900, y: 450 },
            { x: 1400, y: 450 },
            { x: 2000, y: 450 },
        ];

        spawnPoints.forEach(sp => {
            const slime = new Slime(this, sp.x, sp.y, enemyConfig.slime);
            this.enemies.push(slime);
            this.slimes.push(slime);
        });
    }

    createCollectibles() {
        this.crystals = [];
        const crystalPositions = [
            { x: 300, y: 350 }, { x: 600, y: 300 },
            { x: 1000, y: 350 }, { x: 1300, y: 200 },
            { x: 1600, y: 300 }, { x: 1900, y: 350 },
            { x: 2200, y: 250 }, { x: 2600, y: 300 },
        ];

        crystalPositions.forEach(pos => {
            const crystal = new Crystal(this, pos.x, pos.y);
            this.crystals.push(crystal);
        });
    }

    createCrates() {
        this.crates = this.physics.add.staticGroup();
        const cratePositions = [
            { x: 700, y: 450 }, { x: 1100, y: 450 },
            { x: 1700, y: 450 }, { x: 2400, y: 450 },
        ];

        cratePositions.forEach(pos => {
            const crate = this.crates.create(pos.x, pos.y, 'crate');
            crate.setDepth(2);
            crate.refreshBody();
            crate.setData('contains', Math.random() > 0.5 ? 'heart' : 'crystal');
        });
    }

    createPortal() {
        const portalX = CONFIG.level1.width - 100;
        const portalY = 400;
        this.portal = this.physics.add.sprite(portalX, portalY, 'portal');
        this.portal.setDepth(3);
        this.portal.body.setAllowGravity(false);
        this.portal.body.setImmovable(true);

        this.tweens.add({
            targets: this.portal,
            scaleX: { from: 1, to: 1.05 },
            scaleY: { from: 1, to: 1.05 },
            duration: 1000,
            yoyo: true,
            repeat: -1,
        });
    }

    createHUD() {
        this.hud = new HUD(this);
    }

    setupCollisions() {
        this.physics.add.collider(this.player.sprite, this.ground);
        this.physics.add.collider(this.player.sprite, this.platforms);
        this.physics.add.collider(this.player.sprite, this.crates);

        this.enemies.forEach(enemy => {
            this.physics.add.collider(enemy.sprite, this.ground);
            this.physics.add.collider(enemy.sprite, this.platforms);

            this.physics.add.overlap(this.player.sprite, enemy.sprite, (playerSprite, enemySprite) => {
                const enemy = enemySprite.getData('ref');
                if (!enemy || !enemy.alive) return;

                const playerBody = playerSprite.body;
                const enemyBody = enemySprite.body;

                if (playerBody.velocity.y > 0 && playerBody.y + playerBody.halfHeight < enemyBody.y - enemyBody.halfHeight + 20) {
                    enemy.hit(0);
                    this.player.sprite.setVelocityY(-300);
                } else if (!this.player.isInvincible && !this.player.isDashing) {
                    this.player.hit(this.player.facingRight ? -1 : 1);
                }
            });
        });

        this.crystals.forEach(crystal => {
            this.physics.add.overlap(this.player.sprite, crystal.sprite, () => {
                if (!crystal.collected) {
                    this.collectCrystal(crystal);
                }
            });
        });

        this.physics.add.overlap(this.player.sprite, this.checkpoints, (player, cp) => {
            if (cp.getData('active')) {
                this.checkpoint = { x: cp.x, y: cp.y };
                cp.setData('active', false);
                cp.setTint(0x00ff00);
                this.showMessage('تم حفظ نقطة التفتيش!');
            }
        });

        this.physics.add.overlap(this.player.sprite, this.portal, () => {
            this.winLevel();
        });

        if (this.spikes) {
            this.spikes.forEach(spike => {
                this.physics.add.overlap(this.player.sprite, spike, () => {
                    if (!this.player.isInvincible && !this.player.isDashing) {
                        this.player.hit(0);
                        this.player.sprite.setVelocity(-100, -250);
                    }
                });
            });
        }
    }

    collectCrystal(crystal) {
        if (crystal.collected) return;
        crystal.collect();
        this.player.collectCrystal();
        this.crystalsCollected++;
        this.hud.updateCrystals(this.crystalsCollected);

        if (this.crystalsCollected === 3 && !this.player.canDash) {
            this.player.enableDash();
            this.hud.skillUnlocked('dash');
            this.showMessage('قدرة الاندفاع (Dash) مفتوحة!');
        }

        if (this.crystalsCollected === 6 && !this.player.canDoubleJump) {
            this.player.enableDoubleJump();
            this.hud.skillUnlocked('doubleJump');
            this.showMessage('قفز مزدوج (Double Jump) مفتوح!');
        }
    }

    breakCrate(crate) {
        if (crate.getData('broken')) return;
        crate.setData('broken', true);

        const contains = crate.getData('contains');
        if (contains === 'heart' && this.player.health < this.player.maxHealth) {
            this.player.heal(1);
        } else if (contains === 'crystal') {
            const crystal = new Crystal(this, crate.x, crate.y);
            this.crystals.push(crystal);
            this.physics.add.overlap(this.player.sprite, crystal.sprite, () => {
                if (!crystal.collected) {
                    crystal.collect();
                    this.player.collectCrystal();
                    this.crystalsCollected++;
                    this.hud.updateCrystals(this.crystalsCollected);
                }
            });
        }

        this.tweens.add({
            targets: crate,
            scaleX: 0,
            scaleY: 0,
            alpha: 0,
            duration: 200,
            onComplete: () => crate.destroy(),
        });

        const particles = this.add.particles(crate.x, crate.y, 'particle', {
            speed: { min: 50, max: 150 },
            lifespan: 400,
            quantity: 8,
            scale: { start: 2, end: 0 },
            tint: 0x8a6a3a,
            emitting: false,
        });
        particles.explode(8);
        this.time.delayedCall(500, () => particles.destroy());
    }

    showMessage(text) {
        const msg = this.add.text(this.cameras.main.scrollX + 480, 150, text, {
            fontSize: '20px',
            fontFamily: 'monospace',
            color: '#d4a030',
            stroke: '#000000',
            strokeThickness: 4,
            align: 'center',
        }).setOrigin(0.5).setDepth(100).setScrollFactor(0);

        this.tweens.add({
            targets: msg,
            y: 100,
            alpha: { from: 1, to: 0 },
            duration: 2000,
            onComplete: () => msg.destroy(),
        });
    }

    setupCamera() {
        this.cameras.main.setBounds(0, 0, CONFIG.level1.width, CONFIG.level1.height);
        this.cameras.main.startFollow(this.player.sprite, true, 0.1, 0.1);
    }

    winLevel() {
        if (this.levelComplete) return;
        this.levelComplete = true;

        this.player.sprite.setVelocity(0, 0);
        this.player.sprite.body.setAllowGravity(false);

        this.cameras.main.fadeOut(1500, 255, 255, 255, (cam, progress) => {
            if (progress === 1) {
                this.showWinScreen();
            }
        });
    }

    showWinScreen() {
        const { width, height } = this.cameras.main;
        this.cameras.main.fadeIn(500);

        this.add.image(width / 2, height / 2, 'bg-sky').setDisplaySize(width, height);

        this.add.text(width / 2, 100, '! تهانينا', {
            fontSize: '48px',
            fontFamily: 'monospace',
            color: '#d4a030',
            stroke: '#3a2a1a',
            strokeThickness: 6,
        }).setOrigin(0.5);

        this.add.text(width / 2, 180, 'أكملت المرحلة الأولى: الغابة الخضراء', {
            fontSize: '20px',
            fontFamily: 'monospace',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3,
        }).setOrigin(0.5);

        this.add.text(width / 2, 230, `الكريستالات المجمعة: ${this.crystalsCollected}`, {
            fontSize: '18px',
            fontFamily: 'monospace',
            color: '#c89ada',
            stroke: '#000000',
            strokeThickness: 2,
        }).setOrigin(0.5);

        this.add.text(width / 2, 300, 'اضغط Enter للعودة للقائمة', {
            fontSize: '22px',
            fontFamily: 'monospace',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4,
        }).setOrigin(0.5);

        this.tweens.add({
            targets: this.children.list[this.children.list.length - 1],
            alpha: { from: 1, to: 0.3 },
            duration: 800,
            yoyo: true,
            repeat: -1,
        });

        this.input.keyboard.on('keydown-ENTER', () => {
            this.scene.start('MenuScene');
        });
    }

    update() {
        if (this.levelComplete) return;

        this.player.update();

        this.enemies.forEach(enemy => {
            if (enemy.alive) enemy.update();
        });

        if (this.player.attackActive) {
            this.checkAttackHits();
        }

        this.checkCrateBreak();

        if (this.player.sprite.y > CONFIG.level1.height + 50) {
            this.player.health = 0;
            this.events.emit('player-died');
        }
    }

    checkAttackHits() {
        const px = this.player.sprite.x;
        const py = this.player.sprite.y;
        const dir = this.player.attackDir || 1;
        const range = CONFIG.player.swordRange;

        this.enemies.forEach(enemy => {
            if (!enemy.alive) return;
            const ex = enemy.sprite.x;
            const ey = enemy.sprite.y;
            const dx = ex - px;
            const dy = ey - py;

            if (Math.abs(dy) < 32 && dx * dir > 0 && Math.abs(dx) < range) {
                enemy.hit(dir);
            }
        });

        this.crates.children.each(crate => {
            if (crate.getData('broken')) return;
            const cx = crate.x;
            const cy = crate.y;
            const dx = cx - px;
            const dy = cy - py;
            if (Math.abs(dy) < 32 && dx * dir > 0 && Math.abs(dx) < range) {
                this.breakCrate(crate);
            }
        });
    }

    checkCrateBreak() {
        if (!this.player.isDashing) return;
        const px = this.player.sprite.x;
        const py = this.player.sprite.y;
        const dir = this.player.facingRight ? 1 : -1;

        this.crates.children.each(crate => {
            if (crate.getData('broken')) return;
            const dx = crate.x - px;
            const dy = crate.y - py;
            if (Math.abs(dy) < 32 && Math.abs(dx) < 48) {
                this.breakCrate(crate);
            }
        });
    }
}
