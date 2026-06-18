class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    create() {
        const { width, height } = this.cameras.main;

        const text = this.add.text(width / 2, height / 2, 'جاري تحميل assets...', {
            fontSize: '24px',
            fontFamily: 'monospace',
            color: '#ffffff',
        }).setOrigin(0.5);

        const debugText = this.add.text(width / 2, height - 40, 'إذا علقت هنا: افتح F12 > Console وأرسل لي الخطأ', {
            fontSize: '14px',
            fontFamily: 'monospace',
            color: '#ffff00',
        }).setOrigin(0.5);

        try {
            SpriteGenerator.generate(this);
            debugText.setText('... جاري الانتقال للقائمة');
            this.scene.start('MenuScene');
        } catch (e) {
            text.setText('خطأ: ' + e.message);
            this.add.text(width / 2, height / 2 + 60, e.stack ? e.stack.split('\n').slice(0, 5).join('\n') : '', {
                fontSize: '12px',
                fontFamily: 'monospace',
                color: '#ff4444',
                wordWrap: { width: 800 },
            }).setOrigin(0.5);
            console.error(e);
        }
    }
}
