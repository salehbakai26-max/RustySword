class StoryCinematic extends Phaser.Scene {
    constructor(){super({key:'Story'})}
    init(d){this._lv=d.level||1}
    create(){
        this.cameras.main.fadeIn(500);
        let w=CFG.W,h=CFG.H;
        this._slides = STORY[this._lv] || STORY[1];
        this._slideIdx = 0;
        this._img = this.add.image(w/2, h/2, this._slides[0].image).setAlpha(0).setDisplaySize(w, h);
        this._txt = this.add.text(w/2, 450, this._slides[0].text, {
            fontSize: '24px', fontFamily: 'monospace', color: '#fff', align: 'center', wordWrap: { width: 800 },
            stroke: '#000', strokeThickness: 4
        }).setOrigin(0.5).setAlpha(0);
        this.showSlide();
        this.input.on('pointerdown', () => { this._slideIdx++; this.showSlide(); });
    }
    showSlide() {
        if (this._slideIdx >= this._slides.length) { this.scene.start('Game', {level: this._lv}); return; }
        let s = this._slides[this._slideIdx];
        this._img.setTexture(s.image);
        this._txt.setText(s.text);
        this.tweens.add({ targets: [this._img, this._txt], alpha: 1, duration: 800 });
    }
}
