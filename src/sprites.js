class SpriteGenerator {
    static generate(scene) {
        this.genPlayer(scene);
        this.genSlime(scene);
        this.genCrystal(scene);
        this.genHeart(scene);
        this.genTiles(scene);
        this.genBackground(scene);
        this.genCrate(scene);
        this.genSpikes(scene);
        this.genParticle(scene);
        this.genPortal(scene);
    }

    static rect(scene, key, w, h, color) {
        const c = scene.textures.createCanvas(key, w, h);
        const ctx = c.getContext();
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, w, h);
        c.refresh();
    }

    static genPlayer(scene) {
        const fw = 48, fh = 64;
        const total = 10;
        const c = scene.textures.createCanvas('player-sheet', fw * total, fh);
        const ctx = c.getContext();

        for (let f = 0; f < total; f++) {
            const ox = f * fw;
            ctx.fillStyle = '#4a4a4a';
            ctx.fillRect(ox + 8, 4, 32, 16);
            ctx.fillStyle = '#7a7a7a';
            ctx.fillRect(ox + 10, 8, 28, 8);
            ctx.fillStyle = '#e8e8e8';
            ctx.fillRect(ox + 16, 8, 4, 4);
            ctx.fillStyle = '#5a5a5a';
            ctx.fillRect(ox + 8, 20, 32, 20);
            ctx.fillStyle = '#d4a030';
            ctx.fillRect(ox + 28, 22, 4, 8);
            ctx.fillStyle = '#2a5a8a';
            ctx.fillRect(ox + 10, 40, 28, 12);
            ctx.fillStyle = '#6b4423';
            ctx.fillRect(ox + 10, 52, 10, 10);
            ctx.fillRect(ox + 28, 52, 10, 10);

            if (f >= 7 && f <= 8) {
                ctx.fillStyle = '#d4a030';
                ctx.fillRect(ox + 36, 24, 12, 4);
            }
            if (f === 9) {
                ctx.fillStyle = 'rgba(212,160,48,0.4)';
                ctx.fillRect(ox - 8, 28, 12, 8);
            }
        }
        c.refresh();

        for (let i = 0; i < total; i++) {
            scene.textures.get('player-sheet').add(i, 0, i * fw, 0, fw, fh);
        }

        const anims = [
            ['player-idle', [0], 0],
            ['player-run', [1, 2, 3, 4], 10],
            ['player-jump', [5], 0],
            ['player-fall', [6], 0],
            ['player-attack', [7, 8], 8],
            ['player-dash', [9], 0],
        ];
        anims.forEach(([key, frames, rate]) => {
            scene.anims.create({
                key,
                frames: frames.map(i => ({ key: 'player-sheet', frame: i })),
                frameRate: rate || 6,
                repeat: rate ? -1 : 0,
            });
        });
    }

    static genSlime(scene) {
        const fw = 28, fh = 20;
        const c = scene.textures.createCanvas('slime-sheet', fw * 4, fh);
        const ctx = c.getContext();
        for (let f = 0; f < 4; f++) {
            const ox = f * fw;
            ctx.fillStyle = '#3a8a2a';
            ctx.beginPath();
            ctx.ellipse(ox + 14, 12, 12, 8, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#5aba3a';
            ctx.beginPath();
            ctx.ellipse(ox + 14, 10, 8, 6, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(ox + 8, 8, 3, 3);
            ctx.fillRect(ox + 17, 8, 3, 3);
        }
        c.refresh();
        for (let i = 0; i < 4; i++) {
            scene.textures.get('slime-sheet').add(i, 0, i * fw, 0, fw, fh);
        }
        scene.anims.create({
            key: 'slime-idle',
            frames: [0, 1, 2, 3].map(i => ({ key: 'slime-sheet', frame: i })),
            frameRate: 4,
            repeat: -1,
        });
    }

    static genCrystal(scene) {
        const fw = 12, fh = 20;
        const c = scene.textures.createCanvas('crystal-sheet', fw * 4, fh);
        const ctx = c.getContext();
        const colors = ['#8a4ada', '#a67ada', '#c89ada', '#e8bada'];
        for (let f = 0; f < 4; f++) {
            const ox = f * fw;
            ctx.fillStyle = colors[f];
            ctx.beginPath();
            ctx.moveTo(ox + 6, 0);
            ctx.lineTo(ox + 10, 6);
            ctx.lineTo(ox + 10, 18);
            ctx.lineTo(ox + 2, 18);
            ctx.lineTo(ox + 2, 6);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(ox + 5, 4, 2, 4);
        }
        c.refresh();
        for (let i = 0; i < 4; i++) {
            scene.textures.get('crystal-sheet').add(i, 0, i * fw, 0, fw, fh);
        }
        scene.anims.create({
            key: 'crystal-glow',
            frames: [0, 1, 2, 3].map(i => ({ key: 'crystal-sheet', frame: i })),
            frameRate: 6,
            repeat: -1,
        });
    }

    static genHeart(scene) {
        const c = scene.textures.createCanvas('heart', 16, 16);
        const ctx = c.getContext();
        ctx.fillStyle = '#e84040';
        ctx.beginPath();
        ctx.arc(5, 6, 4, Math.PI, 0);
        ctx.arc(11, 6, 4, Math.PI, 0);
        ctx.fill();
        ctx.fillRect(1, 6, 14, 6);
        ctx.beginPath();
        ctx.moveTo(1, 8);
        ctx.lineTo(8, 16);
        ctx.lineTo(15, 8);
        ctx.fill();
        c.refresh();
    }

    static genTiles(scene) {
        this.rect(scene, 'tile-ground', 32, 32, '#5a3a1a');
        this.rect(scene, 'tile-grass', 32, 32, '#3a8a2a');
        this.rect(scene, 'tile-platform', 32, 32, '#7a5a3a');
        this.rect(scene, 'tile-bg-tree', 64, 128, '#3a5a2a');
        this.rect(scene, 'tile-bg-bush', 48, 24, '#2a6a1a');
    }

    static genBackground(scene) {
        const c = scene.textures.createCanvas('bg-sky', 960, 540);
        const ctx = c.getContext();
        const g = ctx.createLinearGradient(0, 0, 0, 540);
        g.addColorStop(0, '#4a8ad4');
        g.addColorStop(0.5, '#87CEEB');
        g.addColorStop(1, '#b5d9f0');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, 960, 540);
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        for (let i = 0; i < 6; i++) {
            ctx.beginPath();
            ctx.arc(i * 160 + 50, i * 30 + 20, 20 + i * 5, 0, Math.PI * 2);
            ctx.fill();
        }
        c.refresh();
    }

    static genCrate(scene) {
        this.rect(scene, 'crate', 32, 32, '#8a6a3a');
    }

    static genSpikes(scene) {
        const c = scene.textures.createCanvas('spikes', 32, 16);
        const ctx = c.getContext();
        ctx.fillStyle = '#6a6a6a';
        for (let x = 0; x < 32; x += 8) {
            ctx.beginPath();
            ctx.moveTo(x, 16);
            ctx.lineTo(x + 4, 0);
            ctx.lineTo(x + 8, 16);
            ctx.fill();
        }
        c.refresh();
    }

    static genParticle(scene) {
        const c = scene.textures.createCanvas('particle', 4, 4);
        const ctx = c.getContext();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 4, 4);
        c.refresh();
    }

    static genPortal(scene) {
        this.rect(scene, 'portal', 48, 64, '#4a1a6a');
    }
}

if (typeof module !== 'undefined') module.exports = SpriteGenerator;
