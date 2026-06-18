class HUD {
    constructor(scene) {
        this.scene = scene;

        this.hearts = [];
        this.crystalText = null;
        this.levelText = null;
        this.dashIcon = null;
        this.jumpIcon = null;

        this.container = scene.add.container(0, 0);
        this.container.setDepth(100);
        this.container.setScrollFactor(0);

        this.create();
    }

    create() {
        const scene = this.scene;

        const panel = scene.add.graphics();
        panel.fillStyle(0x000000, 0.5);
        panel.fillRoundedRect(10, 10, 200, 50, 8);
        panel.lineStyle(2, 0xd4a030, 0.8);
        panel.strokeRoundedRect(10, 10, 200, 50, 8);
        this.container.add(panel);

        const panel2 = scene.add.graphics();
        panel2.fillStyle(0x000000, 0.5);
        panel2.fillRoundedRect(10, 68, 200, 30, 8);
        panel2.lineStyle(1, 0x8ada4a, 0.5);
        panel2.strokeRoundedRect(10, 68, 200, 30, 8);
        this.container.add(panel2);

        for (let i = 0; i < 3; i++) {
            const heart = scene.add.image(30 + i * 28, 36, 'heart');
            heart.setScale(1.5);
            this.hearts.push(heart);
            this.container.add(heart);
        }

        this.crystalText = scene.add.text(160, 28, '0', {
            fontSize: '20px',
            fontFamily: 'monospace',
            color: '#c89ada',
            stroke: '#000000',
            strokeThickness: 2,
        });
        this.crystalText.setOrigin(1, 0);
        this.container.add(this.crystalText);

        const crystalIcon = scene.add.image(150, 36, 'crystal-sheet', 0);
        crystalIcon.setScale(1.2);
        this.container.add(crystalIcon);

        this.levelText = scene.add.text(20, 78, CONFIG.level1.name, {
            fontSize: '14px',
            fontFamily: 'monospace',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 1,
        });
        this.container.add(this.levelText);

        const rightPanel = scene.add.graphics();
        rightPanel.fillStyle(0x000000, 0.5);
        rightPanel.fillRoundedRect(scene.cameras.main.width - 160, 10, 150, 50, 8);
        rightPanel.lineStyle(2, 0xd4a030, 0.8);
        rightPanel.strokeRoundedRect(scene.cameras.main.width - 160, 10, 150, 50, 8);
        this.container.add(rightPanel);

        this.dashIcon = scene.add.text(scene.cameras.main.width - 140, 20, 'Dash: [X]', {
            fontSize: '14px',
            fontFamily: 'monospace',
            color: '#666666',
            stroke: '#000000',
            strokeThickness: 1,
        });
        this.container.add(this.dashIcon);

        this.jumpIcon = scene.add.text(scene.cameras.main.width - 140, 40, '2xJump: [Up]', {
            fontSize: '14px',
            fontFamily: 'monospace',
            color: '#666666',
            stroke: '#000000',
            strokeThickness: 1,
        });
        this.container.add(this.jumpIcon);
    }

    updateHealth(health) {
        this.hearts.forEach((heart, i) => {
            heart.setAlpha(i < health ? 1 : 0.2);
        });
    }

    updateCrystals(count) {
        this.crystalText.setText(count.toString());
    }

    skillUnlocked(skill) {
        if (skill === 'dash') {
            this.dashIcon.setColor('#d4a030');
        } else if (skill === 'doubleJump') {
            this.jumpIcon.setColor('#d4a030');
        }
    }
}

if (typeof module !== 'undefined') module.exports = HUD;
