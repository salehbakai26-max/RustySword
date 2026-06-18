class Boot extends Phaser.Scene {
    constructor(){super({key:'Boot'})}
    preload(){
        const characters = ['Virtual Guy', 'Ninja Frog', 'Pink Man', 'Mask Dude'];
        characters.forEach(char => {
            const lowKey = char.toLowerCase().replace(' ', '-');
            this.load.spritesheet(lowKey + '-idle', `assets/PA1/Main Characters/${char}/Idle (32x32).png`, {frameWidth:32,frameHeight:32});
            this.load.spritesheet(lowKey + '-run', `assets/PA1/Main Characters/${char}/Run (32x32).png`, {frameWidth:32,frameHeight:32});
            this.load.spritesheet(lowKey + '-jump', `assets/PA1/Main Characters/${char}/Jump (32x32).png`, {frameWidth:32,frameHeight:32});
            this.load.spritesheet(lowKey + '-fall', `assets/PA1/Main Characters/${char}/Fall (32x32).png`, {frameWidth:32,frameHeight:32});
            this.load.spritesheet(lowKey + '-djump', `assets/PA1/Main Characters/${char}/Double Jump (32x32).png`, {frameWidth:32,frameHeight:32});
            this.load.spritesheet(lowKey + '-hit', `assets/PA1/Main Characters/${char}/Hit (32x32).png`, {frameWidth:32,frameHeight:32});
        });
        this.load.spritesheet('bat-fly','assets/PA2/Enemies/Bat/Flying (46x30).png',{frameWidth:46,frameHeight:30});
        this.load.spritesheet('bat-hit','assets/PA2/Enemies/Bat/Hit (46x30).png',{frameWidth:46,frameHeight:30});
        this.load.spritesheet('ghost-idle','assets/PA2/Enemies/Ghost/Idle (44x30).png',{frameWidth:44,frameHeight:30});
        this.load.spritesheet('ghost-hit','assets/PA2/Enemies/Ghost/Hit (44x30).png',{frameWidth:44,frameHeight:30});
        this.load.spritesheet('skull-idle','assets/PA2/Enemies/Skull/Idle 1 (52x54).png',{frameWidth:52,frameHeight:54});
        this.load.spritesheet('skull-hit','assets/PA2/Enemies/Skull/Hit (52x54).png',{frameWidth:52,frameHeight:54});
        this.load.spritesheet('pig-idle','assets/PA2/Enemies/AngryPig/Idle (36x30).png',{frameWidth:36,frameHeight:30});
        this.load.spritesheet('pig-run','assets/PA2/Enemies/AngryPig/Run (36x30).png',{frameWidth:36,frameHeight:30});
        this.load.spritesheet('pig-hit','assets/PA2/Enemies/AngryPig/Hit 1 (36x30).png',{frameWidth:36,frameHeight:30});
        this.load.spritesheet('s-idle','assets/PA2/Enemies/Slime/Idle-Run (44x30).png',{frameWidth:44,frameHeight:30});
        this.load.spritesheet('s-hit','assets/PA2/Enemies/Slime/Hit (44x30).png',{frameWidth:44,frameHeight:30});
        this.load.spritesheet('m-idle','assets/PA2/Enemies/Mushroom/Idle (32x32).png',{frameWidth:32,frameHeight:32});
        this.load.spritesheet('m-run','assets/PA2/Enemies/Mushroom/Run (32x32).png',{frameWidth:32,frameHeight:32});
        this.load.spritesheet('m-hit','assets/PA2/Enemies/Mushroom/Hit.png',{frameWidth:32,frameHeight:32});
        this.load.spritesheet('terrain','assets/PA1/Terrain/Terrain (16x16).png',{frameWidth:16,frameHeight:16});
        this.load.image('apple','assets/PA1/Items/Fruits/Apple.png');
        this.load.image('flag-end','assets/PA1/Items/Checkpoints/End/End (Idle).png');
        this.load.image('spikes','assets/PA1/Traps/Spikes/Idle.png');
        this.load.spritesheet('box','assets/PA1/Items/Boxes/Box1/Idle.png',{frameWidth:28,frameHeight:24});
        this.load.image('cloud1','assets/clouds/cloud_1.png');
        this.load.image('cloud3','assets/clouds/cloud_3.png');
        this.load.image('cloud4','assets/clouds/cloud_4.png');
        this.load.image('cloud5','assets/clouds/cloud_5.png');
        this.load.image('bg-flights','assets/backgrounds/parallax-forest-lights.png');
        this.load.image('bg-fback','assets/backgrounds/parallax-forest-back-trees.png');
        this.load.image('bg-fmid','assets/backgrounds/parallax-forest-middle-trees.png');
        this.load.image('bg-ffront','assets/backgrounds/parallax-forest-front-trees.png');
        this.load.image('bg-mtsky','assets/backgrounds/parallax-mountain-bg.png');
        this.load.image('bg-mtfar','assets/backgrounds/parallax-mountain-montain-far.png');
        this.load.image('bg-mtmid','assets/backgrounds/parallax-mountain-mountains.png');
        this.load.image('bg-mttrees','assets/backgrounds/parallax-mountain-trees.png');
        this.load.image('bg-mtfront','assets/backgrounds/parallax-mountain-foreground-trees.png');
    }
    create(){
        ['bg-flights','bg-fback','bg-fmid','bg-ffront','bg-mtsky','bg-mtfar','bg-mtmid','bg-mttrees','bg-mtfront'].forEach(k=>{
            let s=this.textures.get(k).getSourceImage();
            if(!s)return;
            let c=this.textures.createCanvas(k+'-fs',960,540);
            let cx=c.getContext();
            cx.imageSmoothingEnabled=false;
            cx.drawImage(s,0,0,960,540);
            c.refresh();
        });
        let gh=this.make.graphics({add:false});gh.fillStyle(0xff1144);gh.fillCircle(7,6,6);gh.fillCircle(17,6,6);gh.fillTriangle(1,9,23,9,12,20);gh.generateTexture('heart',24,22);gh.destroy();
        let gf=this.make.graphics({add:false});gf.fillStyle(0xff6600);gf.fillCircle(6,6,6);gf.fillStyle(0xffcc00,0.7);gf.fillCircle(6,6,3);gf.fillStyle(0xffffff,0.4);gf.fillCircle(5,5,2);gf.generateTexture('fireball',12,12);gf.destroy();
        let gr=this.make.graphics({add:false});gr.fillStyle(0x88bbff,0.5);gr.fillRect(0,0,2,8);gr.generateTexture('raindrop',2,8);gr.destroy();
        const characters = ['Virtual Guy', 'Ninja Frog', 'Pink Man', 'Mask Dude'];
        characters.forEach(char => {
            const k = char.toLowerCase().replace(' ', '-');
            this.anims.create({key: k + '-idle', frames: [{key: k + '-idle', frame: 0}], frameRate: 1, repeat: -1});
            this.anims.create({key: k + '-run', frames: this.anims.generateFrameNumbers(k + '-run', {start: 0, end: 11}), frameRate: 12, repeat: -1});
            this.anims.create({key: k + '-jump', frames: [{key: k + '-jump', frame: 0}], frameRate: 1, repeat: 0});
            this.anims.create({key: k + '-fall', frames: [{key: k + '-fall', frame: 0}], frameRate: 1, repeat: 0});
            this.anims.create({key: k + '-djump', frames: this.anims.generateFrameNumbers(k + '-djump', {start: 0, end: 5}), frameRate: 8, repeat: 0});
            this.anims.create({key: k + '-hit', frames: this.anims.generateFrameNumbers(k + '-hit', {start: 0, end: 6}), frameRate: 8, repeat: 0});
        });
        this.anims.create({key:'bat-fly',frames:this.anims.generateFrameNumbers('bat-fly',{start:0,end:6}),frameRate:10,repeat:-1});
        this.anims.create({key:'bat-dead',frames:this.anims.generateFrameNumbers('bat-hit',{start:0,end:4}),frameRate:10,repeat:0});
        this.anims.create({key:'ghost-move',frames:this.anims.generateFrameNumbers('ghost-idle',{start:0,end:9}),frameRate:8,repeat:-1});
        this.anims.create({key:'ghost-dead',frames:this.anims.generateFrameNumbers('ghost-hit',{start:0,end:4}),frameRate:10,repeat:0});
        this.anims.create({key:'skull-move',frames:this.anims.generateFrameNumbers('skull-idle',{start:0,end:7}),frameRate:8,repeat:-1});
        this.anims.create({key:'skull-dead',frames:this.anims.generateFrameNumbers('skull-hit',{start:0,end:4}),frameRate:10,repeat:0});
        this.anims.create({key:'pig-move',frames:this.anims.generateFrameNumbers('pig-idle',{start:0,end:8}),frameRate:8,repeat:-1});
        this.anims.create({key:'pig-rush',frames:this.anims.generateFrameNumbers('pig-run',{start:0,end:11}),frameRate:12,repeat:-1});
        this.anims.create({key:'pig-dead',frames:this.anims.generateFrameNumbers('pig-hit',{start:0,end:4}),frameRate:10,repeat:0});
        this.anims.create({key:'s-move',frames:this.anims.generateFrameNumbers('s-idle',{start:0,end:9}),frameRate:6,repeat:-1});
        this.anims.create({key:'s-dead',frames:this.anims.generateFrameNumbers('s-hit',{start:0,end:4}),frameRate:8,repeat:0});
        this.anims.create({key:'m-idle',frames:this.anims.generateFrameNumbers('m-idle',{start:0,end:13}),frameRate:6,repeat:-1});
        this.anims.create({key:'m-run',frames:this.anims.generateFrameNumbers('m-run',{start:0,end:15}),frameRate:10,repeat:-1});
        this.anims.create({key:'m-dead',frames:this.anims.generateFrameNumbers('m-hit',{start:0,end:4}),frameRate:8,repeat:0});
        this.input.addPointer(3);
        this.scene.start('Menu');
    }
}
