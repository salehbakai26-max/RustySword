window.AudioSystem = {
    play: (sfxName) => {
        if (window.SFX && typeof window.SFX[sfxName] === 'function') {
            window.SFX[sfxName]();
        }
    }
};

const SaveManager = {
    save: (data) => localStorage.setItem('rusty_sword_save', JSON.stringify(data)),
    load: () => {
        const data = localStorage.getItem('rusty_sword_save');
        return data ? JSON.parse(data) : { level: 1, crystals: 0, unlocked: [] };
    }
};

const config = {
    type: Phaser.AUTO,
    width: CONFIG.width,
    height: CONFIG.height,
    parent: 'game-container',
    pixelArt: true,
    roundPixels: true,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: CONFIG.gravity },
            debug: false,
        },
    },
    scene: [BootScene, MenuScene, StoryScene, GameScene],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    input: {
        keyboard: true,
    },
};

const game = new Phaser.Game(config);

window.addEventListener('error', (e) => {
    const el = document.getElementById('game-container');
    if (el) {
        el.innerHTML += '<div style="color:red;font-family:monospace;padding:20px">خطأ: ' + e.message + '</div>';
    }
});
