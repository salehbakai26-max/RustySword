class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        const { width, height } = this.cameras.main;

        this.add.image(width / 2, height / 2, 'bg-sky').setDisplaySize(width, height);

        const titleShadow = this.add.text(width / 2 + 3, 83, 'أسطورة السيف الصدئ', {
            fontSize: '48px',
            fontFamily: 'monospace',
            color: '#000000',
            stroke: '#000000',
            strokeThickness: 4,
        }).setOrigin(0.5).setAlpha(0.3);

        const title = this.add.text(width / 2, 80, 'أسطورة السيف الصدئ', {
            fontSize: '48px',
            fontFamily: 'monospace',
            color: '#d4a030',
            stroke: '#3a2a1a',
            strokeThickness: 6,
        }).setOrigin(0.5);

        this.tweens.add({
            targets: [title, titleShadow],
            y: '+=6',
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        const subtitle = this.add.text(width / 2, 150, 'The Legend of the Rusty Sword', {
            fontSize: '16px',
            fontFamily: 'monospace',
            color: '#c89ada',
            stroke: '#000000',
            strokeThickness: 3,
        }).setOrigin(0.5);

        const knightPreview = this.add.image(width / 2, 260, 'player-sheet', 0);
        knightPreview.setScale(4);
        knightPreview.setFlipX(false);

        this.tweens.add({
            targets: knightPreview,
            x: width / 2 + 20,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        const slime1 = this.add.image(width / 2 - 80, 290, 'slime-sheet', 1);
        slime1.setScale(2);
        slime1.play('slime-idle');

        const slime2 = this.add.image(width / 2 + 80, 290, 'slime-sheet', 1);
        slime2.setScale(2);
        slime2.setFlipX(true);
        slime2.play('slime-idle');

        const startText = this.add.text(width / 2, 360, 'اضغط Enter أو Space للبدء', {
            fontSize: '22px',
            fontFamily: 'monospace',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4,
        }).setOrigin(0.5);

        this.tweens.add({
            targets: startText,
            alpha: { from: 1, to: 0.3 },
            duration: 800,
            yoyo: true,
            repeat: -1,
        });

        const controls = this.add.text(width / 2, 440, '↑ ↓ ← →  حركة  |  Z  هجوم  |  X  اندفاع  |  Space  قفز', {
            fontSize: '13px',
            fontFamily: 'monospace',
            color: '#aaaaaa',
            stroke: '#000000',
            strokeThickness: 2,
        }).setOrigin(0.5);

        const story = this.add.text(width / 2, 490,
            'اقرأ القصة... قروي بسيط يملك سيفاً صدئاً، يسعى ليصبح محارباً أسطورياً', {
            fontSize: '12px',
            fontFamily: 'monospace',
            color: '#888888',
            stroke: '#000000',
            strokeThickness: 1,
            wordWrap: { width: 600 },
            align: 'center',
        }).setOrigin(0.5);

        this.input.keyboard.on('keydown-ENTER', () => this.startGame());
        this.input.keyboard.on('keydown-SPACE', () => this.startGame());

        this.cameras.main.fadeIn(500);
    }

    startGame() {
        this.cameras.main.fadeOut(300, 0, 0, 0, (cam, progress) => {
            if (progress === 1) {
                this.scene.start('GameScene');
            }
        });
    }
}
