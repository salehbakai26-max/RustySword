class Game extends Phaser.Scene {
    constructor(){super({key:'Game'})}
    init(d){
        this._lv=d&&d.level?d.level:1;this._lvData=LV[this._lv];
        this._skin=window.selectedSkin||'virtual-guy';
        this._up=window.upgrades||{hp:0,range:40};
        this.maxHp=3+(this._up.hp||0);
    }
    create(){
        this.cameras.main.fadeIn(500);
        let lvDat=this._lvData;
        this.hp=this.maxHp;this.crystals=0;this.dashUnlock=false;this.djumpUnlock=false;this._djed=false;
        this.invincible=false;this.isAttacking=false;this.isDashing=false;
        this.attackActive=false;this.dashCD=false;this.atkCD=false;
        this.levelComplete=false;this.facingRight=true;this._dead=false;
        this.godMode=false;
        this.speedrunTime=0;this.speedrunVisible=false;
        this.checkpoint=null;
        this.bgLayers=lvDat.bg.map((k,i)=>{
            let s=lvDat.bgSpd[i],imgs=[];
            for(let j=0;j<3;j++){
                let img=this.add.image(480+(j-1)*960,270,k).setScrollFactor(0).setDepth(-20+i);
                imgs.push(img);
            }
            imgs._spd=s;return imgs;
        });
        if(this._lv===3){this.add.rectangle(480,270,960,600,0x1a0520,0.35).setScrollFactor(0).setDepth(-1)}
        if(this._lv===3){
            [300,900,1500,2100,2700,3300,3900].forEach(x=>{
                let post=this.add.rectangle(x,240,6,32,0x4a3520).setDepth(3);
                let flame=this.add.image(x,226,'fireball').setDepth(4).setScale(1.5);
                this.tweens.add({targets:flame,scaleX:{from:1.5,to:2},scaleY:{from:1.5,to:2.2},alpha:{from:1,to:0.5},duration:300+Math.random()*300,yoyo:true,repeat:-1});
                this.tweens.add({targets:post,x:x+Phaser.Math.Between(-1,1),duration:200+Math.random()*200,yoyo:true,repeat:-1});
            });
        }
        const T=16;
        this.ground=this.physics.add.staticGroup();
        this.platforms=this.physics.add.staticGroup();
        let ROWS=17,COLS=lvDat.w/16;
        const map=lvDat.map();
        this.spikes=[];
        for(let r=0;r<ROWS;r++){
            for(let c=0;c<COLS;c++){
                let ch=map[r][c],x=c*T+T/2,y=r*T+T/2;
                if(ch==='1'){let frame=r<ROWS-4?22:0;let t=this.ground.create(x,y,'terrain',frame);t.setDepth(1);t.refreshBody()}
                if(ch==='3'){let t=this.platforms.create(x,y,'terrain',18);t.setDepth(1);t.refreshBody()}
                if(ch==='4'){let t=this.ground.create(x,y,'terrain',0);t.setDepth(1);t.refreshBody();let s=this.physics.add.staticImage(x,y-12,'spikes');s.setDepth(2);s.refreshBody();s.body.setSize(28,10);this.spikes.push(s)}
            }
        }
        this.player=this.physics.add.sprite(lvDat.spawn[0],lvDat.spawn[1],this._skin+'-idle');
        this.player.setSize(20,28);this.player.setOffset(6,4);
        this.player.setCollideWorldBounds(true);this.player.setDepth(10);
        this.player.body.setMaxVelocityY(600);
        this._k={};this._atkPrev=false;this._dashPrev=false;this._jumpPrev=false;this._lastOnGround=false;
        this.input.keyboard.on('keydown',e=>{
            if(actx().state==='suspended')actx().resume();
            this._k[e.keyCode]=true;
            if([37,38,39,32,90,88,67,86].includes(e.keyCode))e.preventDefault();
        });
        this.input.keyboard.on('keyup',e=>{this._k[e.keyCode]=false});
        this.physics.world.setBounds(0,0,lvDat.w,lvDat.h);
        this.physics.add.collider(this.player,this.ground);
        this.physics.add.collider(this.player,this.platforms);
        this.physics.add.overlap(this.player,this.spikes,()=>{if(!this.invincible&&!this.isDashing)this.hitPlayer()});
        this.enemies=[];this.fruits=[];
        const diffMul = 1 + (this._lv - 1) * 0.25;
        this._diffMul = diffMul;
        const placeEnemy=(x,y,type)=>{
            let e=this.physics.add.sprite(x,y,type==='slime'?'s-idle':'m-idle');
            e.setDepth(5);e.setData('type',type);e.setData('alive',true);
            e.setData('px',x);e.setData('dir',-1);
            if(type==='slime'){e.setSize(30,20);e.setOffset(7,10);e.play('s-move')}
            else if(type==='shooter'){
                e.setSize(24,28);e.setOffset(4,4);e.play('m-idle');
                e.setData('lastShot',0);e.setData('shootCD',CFG.S.shootCD);
            }else{e.setSize(24,24);e.setOffset(4,8);e.play('m-idle')}
            this.physics.add.collider(e,this.ground);
            this.physics.add.collider(e,this.platforms);
            this.enemies.push(e);
            this.physics.add.overlap(this.player,e,(p,es)=>{
                if(!es.getData('alive'))return;
                if(p.body.velocity.y>0&&p.y<es.y-12){es.setData('alive',false);es.body.setAllowGravity(false);es.setVelocityY(-300);this.tweens.add({targets:es,alpha:0,y:es.y-20,duration:400,onComplete:()=>{es.body.enable=false;es.setActive(false).setVisible(false)}});p.setVelocityY(-300)}
                else if(!this.invincible&&!this.isDashing)this.hitPlayer();
            });
        };
        lvDat.enemies.forEach(([x,y,type])=>placeEnemy(x,y,type));
        lvDat.fruits.forEach(([x,y])=>{
            let f=this.physics.add.staticImage(x,y,'apple');
            f.setDepth(3);f.refreshBody();
            this.fruits.push(f);
            this.physics.add.overlap(this.player,f,
                ()=>{
                    f.setData('collected',true);this.crystals++;SFX.collect();
                    f.body.enable=false;
                    this.tweens.add({targets:f,y:f.y-30,alpha:0,scaleX:2,scaleY:2,duration:300,onComplete:()=>{f.setActive(false).setVisible(false)}});
                    this.updateHUD();
                    if(this.crystals===3&&!this.dashUnlock){this.dashUnlock=true;this.showMsg('قدرة الاندفاع (C) مفتوحة!')}
                    if(this.crystals===6&&!this.djumpUnlock){this.djumpUnlock=true;this.showMsg('قفز مزدوج (↑/Z) مفتوح!')}
                },
                (p,obj)=>obj.active
            );
        });
        this.boxes=this.physics.add.staticGroup();
        lvDat.boxes.forEach(([x,y])=>{
            let b=this.boxes.create(x,y,'box',0);
            b.setDepth(2);b.refreshBody();b.setData('broken',false);
        });
        this.physics.add.collider(this.player,this.boxes);
        this.portal=this.physics.add.staticImage(lvDat.w-80,240,'flag-end');
        this.portal.setDepth(3);
        // Portal checked manually in update() to avoid physics overlap bugs
        let cpx=Math.floor(lvDat.w*0.55);
        this.checkpointFlag=this.physics.add.staticImage(cpx,240,'flag-end');
        this.checkpointFlag.setDepth(3).setTint(0x8888ff);
        this.input.keyboard.on('keydown-F2',()=>{
            this.speedrunVisible=!this.speedrunVisible;
            this.hudTimer.setVisible(this.speedrunVisible);
        });
        this.cameras.main.setBounds(0,0,lvDat.w,lvDat.h);
        this.cameras.main.startFollow(this.player,true,0.1,0.1);
        this.hudHearts=[];
        for(let i=0;i<this.maxHp;i++){let h=this.add.image(24+i*24,24,'heart').setScrollFactor(0).setDepth(100).setScale(1);this.hudHearts.push(h)}
        this.hudName=this.add.text(6,6,HERO,{fontSize:'10px',fontFamily:'monospace',color:'#d4a030',stroke:'#000',strokeThickness:2}).setScrollFactor(0).setDepth(100);
        this.hudCrystal=this.add.text(100,16,'🍎 بلورات: 0',{fontSize:'14px',fontFamily:'monospace',color:'#fff',stroke:'#000',strokeThickness:3}).setScrollFactor(0).setDepth(100);
        this.hudSkills=this.add.text(CFG.W-180,16,'',{fontSize:'12px',fontFamily:'monospace',color:'#aaa',stroke:'#000',strokeThickness:2}).setScrollFactor(0).setDepth(100);
        this.hudTimer=this.add.text(CFG.W/2,6,'',{fontSize:'14px',fontFamily:'monospace',color:'#ffcc00',stroke:'#000',strokeThickness:2}).setScrollFactor(0).setDepth(100).setOrigin(0.5,0);
        this.updateHUD();
        this.clouds=[];
        [['cloud1',0.08,2,0.08],['cloud3',0.15,3,0.1],['cloud4',0.3,4,0.12]].forEach(([tex,speed,cnt,alpha])=>{
            for(let i=0;i<cnt;i++){
                let c=this.add.image(Phaser.Math.Between(0,lvDat.w),Phaser.Math.Between(20,130),tex);
                c.setAlpha(alpha).setDepth(-8).setData('speed',speed);
                this.clouds.push(c);
            }
        });
        this.flash=this.add.rectangle(480,270,CFG.W*2,600,0xffffff,0).setScrollFactor(0).setDepth(50);
        this._lastLightning=this.time.now;
        this.rainEmitter=this.add.particles(0,0,'raindrop',{
            x:{min:0,max:lvDat.w},y:-10,
            speedY:{min:250,max:450},speedX:{min:-80,max:-20},
            lifespan:3000,quantity:3,frequency:25,
            alpha:{start:0.5,end:0},scaleY:{start:1,end:0.3},emitting:true
        });
        this.rainEmitter.setDepth(8);
        rainStart();
        this.bullets=[];this.playerBullets=[];this._shootCD=false;
        this.musicTracks = ['assets/music/bgm1.mp3', 'assets/music/bgm2.mp3', 'assets/music/bgm3.mp3', 'assets/music/bgm4.mp3', 'assets/music/bgm5.mp3'];
        try {
            let track = this.musicTracks[Phaser.Math.Between(0, this.musicTracks.length - 1)];
            let a = new Audio(track);
            a.loop = true;
            a.volume = 0.35;
            a.play();
            this._bgm = a;
        } catch (e) {}
        this._paused=false;
        this.input.keyboard.on('keydown-ESC',()=>this.togglePause());
        this.input.keyboard.on('keydown-G',()=>{
            this.godMode=!this.godMode;
            this.showMsg(this.godMode?'🛡 وضع الخلود نشط':'وضع الخلود معطل');
        });
        this.input.keyboard.on('keydown-V',()=>this.playerShoot());
        this.createTouchControls();
    }
    createTouchControls(){
        let tc = this.add.container(0,0).setScrollFactor(0).setDepth(200);
        let btn = (x, y, r, label, key) => {
            let circle = this.add.circle(x, y, r, 0x000000, 0.4).setStrokeStyle(2, 0xffffff, 0.3);
            let txt = this.add.text(x, y, label, {fontSize:'18px',color:'#fff',stroke:'#000',strokeThickness:3}).setOrigin(0.5);
            circle.setInteractive();
            circle.on('pointerdown',()=>{this._k[key]=true});
            circle.on('pointerup',()=>{this._k[key]=false});
            circle.on('pointerout',()=>{this._k[key]=false});
            tc.add([circle, txt]);
        };
        let h=CFG.H;
        btn(55, h-65, 40, '◀', 37);
        btn(145, h-65, 40, '▶', 39);
        btn(480, h-50, 45, '↑', 38);
        btn(620, h-65, 40, '🗡', 88);
        btn(720, h-65, 40, '💥', 86);
        let dashBtn = this.add.circle(900, 55, 35, 0x000000, 0.4).setStrokeStyle(2, 0xffffff, 0.3);
        let dashTxt = this.add.text(900, 55, 'C', {fontSize:'18px',color:'#fff',stroke:'#000',strokeThickness:3}).setOrigin(0.5);
        dashBtn.setInteractive();
        dashBtn.on('pointerdown',()=>{this._k[67]=true});
        dashBtn.on('pointerup',()=>{this._k[67]=false});
        dashBtn.on('pointerout',()=>{this._k[67]=false});
        tc.add([dashBtn, dashTxt]);
    }
    update(){
        if(this._paused)return;
        let p=this.player,onGround=p.body.blocked.down,t=this.time.now;
        this.bgLayers.forEach(g=>{
            let off=this.cameras.main.scrollX*g._spd;
            g.forEach((img,i)=>{img.x=480+(i-1)*960-off});
            if(g[2].x<480)g.forEach(img=>img.x+=2880);
            if(g[0].x>480)g.forEach(img=>img.x-=2880);
        });
        this.clouds.forEach(c=>{
            c.x-=c.getData('speed');
            if(c.x<-160)c.x=this._lvData.w+80;
        });
        if(t-this._lastLightning>Phaser.Math.Between(20000,45000)){
            this._lastLightning=t;
            this.flash.setAlpha(0.9);
            this.time.delayedCall(80,()=>this.flash.setAlpha(0.3));
            this.time.delayedCall(250,()=>this.flash.setAlpha(0));
            SFX.thunder();
        }
        if(onGround&&!this._lastOnGround)SFX.land();
        this._lastOnGround=onGround;
        this.speedrunTime+=this.game.loop.delta;
        if(this.speedrunVisible){
            let totalSec=Math.floor(this.speedrunTime/1000);
            let min=Math.floor(totalSec/60),sec=totalSec%60;
            this.hudTimer.setText(`⏱ ${String(min).padStart(2,'0')}:${String(sec).padStart(2,'0')}`);
        }
        if(!this.isAttacking&&!this.isDashing){
            if(this._k[37]){p.setVelocityX(-CFG.P.spd);this.facingRight=false;p.setFlipX(true)}
            else if(this._k[39]){p.setVelocityX(CFG.P.spd);this.facingRight=true;p.setFlipX(false)}
            else p.setVelocityX(0);
        }
        if(!this.isAttacking&&!this.isDashing){
            if(p.body.velocity.y<-20)p.setTexture(this._skin+'-jump',0);
            else if(p.body.velocity.y>20&&!onGround)p.setTexture(this._skin+'-fall',0);
            else if(Math.abs(p.body.velocity.x)>10&&onGround){let frame=Math.floor(t/80)%12;p.setTexture(this._skin+'-run',frame)}
            else p.setTexture(this._skin+'-idle',0);
        }
        let aX=this._k[88];
        if(aX&&!this._atkPrev&&!this.atkCD){this.doAttack();SFX.attack()}
        this._atkPrev=aX;
        let dC=this._k[67];
        if(dC&&!this._dashPrev&&this.dashUnlock&&!this.dashCD){this.doDash();SFX.dash()}
        this._dashPrev=dC;
        let jp=this._k[38]||this._k[32]||this._k[90];
        if(jp&&!this._jumpPrev){
            if(p.body.blocked.down){
                p.setVelocityY(CFG.P.jmp);
                this._djed=false;
                SFX.jump();
            }else if(this.djumpUnlock&&!this._djed){
                p.setVelocityY(CFG.P.jmp);
                this._djed=true;
                SFX.dbljump();
            }
        }
        this._jumpPrev=jp;
        if(this._k[86]&&!this._shootCD){this.playerShoot()}
        if(this.attackActive)this.checkAttack();
        this.enemies.forEach(e=>{
            if(!e.getData('alive'))return;
            if(e.getData('type')==='shooter'){
                let d=e.x-e.getData('px');
                if(d<-40||e.body.blocked.left){e.setData('dir',1);e.setFlipX(true)}
                else if(d>40||e.body.blocked.right){e.setData('dir',-1);e.setFlipX(false)}
                e.setVelocityX(CFG.S.spd*0.5*e.getData('dir')*this._diffMul);
                if(t-e.getData('lastShot')>e.getData('shootCD')*this._diffMul&&Math.abs(p.x-e.x)<500){
                    e.setData('lastShot',t);this.shootProjectile(e);
                }
            }else{
                let d=e.x-e.getData('px');
                if(e.body.blocked.down){
                    if(d<-80||e.body.blocked.left){e.setData('dir',1);e.setFlipX(true)}
                    else if(d>80||e.body.blocked.right){e.setData('dir',-1);e.setFlipX(false)}
                }
                e.setVelocityX(CFG.S.spd*e.getData('dir')*this._diffMul);
            }
        });
        this.bullets=this.bullets.filter(b=>{
            if(!b.active||t>b.getData('lifespan')){
                b.body.enable=false;
                if(b.active){this.tweens.add({targets:b,alpha:0,scaleX:0,scaleY:0,duration:200,onComplete:()=>b.destroy()})}
                else b.destroy();
                return false;
            }
            return true;
        });
        this.playerBullets=this.playerBullets.filter(b=>{
            if(!b.active||Math.abs(b.x-p.x)>800||b.y<-50||b.y>this._lvData.h+50){
                b.body.enable=false;b.destroy();return false;
            }
            this.enemies.forEach(e=>{
                if(!e.getData('alive')||!b.active)return;
                let dx=Math.abs(b.x-e.x),dy=Math.abs(b.y-e.y);
                if(dx<30&&dy<30)this.killEnemy(e);
            });
            return true;
        });
        if(!this.levelComplete&&Math.abs(p.x-this.portal.x)<30&&Math.abs(p.y-this.portal.y)<30)this.win();
        if(this.checkpointFlag&&!this.checkpoint&&Math.abs(p.x-this.checkpointFlag.x)<30&&Math.abs(p.y-this.checkpointFlag.y)<30){
            this.checkpoint={x:this.checkpointFlag.x,y:this.checkpointFlag.y};this.showMsg('💾 تم الحفظ عند نقطة التفتيش!');
            this.checkpointFlag.setTint(0x00ff88);
        }
        if(p.y>this._lvData.h+50&&!this._dead&&!this.godMode){
            this._dead=true;this.hp=0;this.invincible=true;rainStop();
            p.setVelocity(0,-300);p.body.allowGravity=false;
            this.updateHUD();
            if(this.checkpoint){
                this.time.delayedCall(800,()=>{
                    this.cameras.main.fadeOut(500);
                    this.time.delayedCall(500,()=>{
                        this.scene.restart({level:this._lv});
                        this.cameras.main.fadeIn(300);
                    });
                });
            } else {
                this.time.delayedCall(800,()=>{this.cameras.main.fadeOut(500);this.time.delayedCall(500,()=>this.scene.start('Menu'))});
            }
        }
    }
    doAttack(){
        this.isAttacking=true;this.atkCD=true;this.attackActive=true;
        let p=this.player;p.setVelocityX(0);
        p.setTexture(this._skin+'-hit',0);
        this.time.delayedCall(50,()=>{if(p.active)p.setTexture(this._skin+'-hit',1)});
        this.time.delayedCall(100,()=>{if(p.active)p.setTexture(this._skin+'-hit',2)});
        this.time.delayedCall(150,()=>{this.attackActive=false;if(p.active)p.setTexture(this._skin+'-hit',3)});
        this.time.delayedCall(CFG.P.adur,()=>{this.isAttacking=false;this.time.delayedCall(200,()=>{this.atkCD=false})});
    }
    doDash(){
        this.isDashing=true;this.dashCD=true;
        this.player.body.allowGravity=false;
        let dir=this.facingRight?1:-1;
        this.player.setVelocityX(dir*CFG.P.dash);this.player.setVelocityY(0);
        this.tweens.add({targets:this.player,alpha:{from:1,to:0.5},duration:50,yoyo:true,repeat:3});
        this.time.delayedCall(CFG.P.ddur,()=>{
            this.player.body.allowGravity=true;this.isDashing=false;this.player.setAlpha(1);
            this.time.delayedCall(500,()=>{this.dashCD=false});
        });
    }
    shootProjectile(e){
        let dir=this.player.x<e.x?-1:1;
        let b=this.physics.add.sprite(e.x,e.y-8,'fireball');
        b.setDepth(6);b.body.setAllowGravity(false);
        b.setVelocityX(dir*CFG.S.bulletSpd);
        b.setData('lifespan',this.time.now+CFG.S.bulletLife);
        this.bullets.push(b);
        SFX.shoot();
        this.physics.add.overlap(this.player,b,(p,ball)=>{
            ball.body.enable=false;
            ball.setData('lifespan',0);
            if(!this.invincible&&!this.isDashing)this.hitPlayer();
        });
        this.physics.add.collider(b,this.ground,ball=>{ball.body.enable=false;ball.setData('lifespan',0)});
        this.physics.add.collider(b,this.platforms,ball=>{ball.body.enable=false;ball.setData('lifespan',0)});
    }
    playerShoot(){
        if(this._shootCD||this.playerBullets.length>=3)return;
        this._shootCD=true;let p=this.player,dir=this.facingRight?1:-1;
        let b=this.physics.add.sprite(p.x+dir*16,p.y-6,'fireball');
        b.setDepth(7);b.body.setAllowGravity(false);b.setData('lifespan',this.time.now+3000);
        b.setVelocityX(dir*350);this.playerBullets.push(b);
        this.time.delayedCall(350,()=>{this._shootCD=false});
        SFX.shoot();
    }
    checkAttack(){
        let px=this.player.x,py=this.player.y,dir=this.facingRight?1:-1,r=this._up.range||40;
        this.enemies.forEach(e=>{
            if(!e.getData('alive'))return;
            let dx=e.x-px,dy=e.y-py;
            if(Math.abs(dy)<40&&dx*dir>0&&Math.abs(dx)<r)this.killEnemy(e);
        });
        this.boxes.children.each(b=>{
            if(b.getData('broken'))return;
            let dx=b.x-px,dy=b.y-py;
            if(Math.abs(dy)<40&&Math.abs(dx)<50)this.breakBox(b);
        });
    }
    killEnemy(e){
        e.setData('alive',false);
        e.body.setAllowGravity(false);e.setVelocityY(-250);SFX.kill();
        if(e.getData('type')==='slime')e.play('s-dead');else e.play('m-dead');
        this.tweens.add({targets:e,alpha:0,y:e.y-20,duration:400,onComplete:()=>{e.body.enable=false;e.setActive(false).setVisible(false)}});
    }
    breakBox(b){
        if(b.getData('broken'))return;b.setData('broken',true);
        b.body.enable=false;
        if(this.hp<3){this.hp++;this.updateHUD();SFX.heal()}else{
            let f=this.physics.add.staticImage(b.x,b.y-20,'apple');
            f.refreshBody();this.fruits.push(f);
            this.physics.add.overlap(this.player,f,
                ()=>{
                    f.setData('collected',true);this.crystals++;SFX.collect();
                    f.body.enable=false;this.updateHUD();
                    if(this.crystals===3&&!this.dashUnlock){this.dashUnlock=true;this.showMsg('قدرة الاندفاع (C) مفتوحة!')}
                    if(this.crystals===6&&!this.djumpUnlock){this.djumpUnlock=true;this.showMsg('قفز مزدوج (↑/Z) مفتوح!')}
                    this.tweens.add({targets:f,y:f.y-30,alpha:0,scaleX:2,scaleY:2,duration:300,onComplete:()=>{f.setActive(false).setVisible(false)}});
                },
                (p,obj)=>obj.active
            );
        }
        b.setActive(false).setVisible(false);
    }
    hitPlayer(){
        if(this.invincible||this.isDashing||this._dead||this.godMode)return;
        if(this.hp<=0)return;
        this.hp--;this.invincible=true;SFX.hit();
        let dir=this.facingRight?-1:1;
        this.player.setVelocityX(dir*250);this.player.setVelocityY(-200);
        this.cameras.main.shake(100,0.01);
        this.tweens.add({targets:this.player,alpha:{from:1,to:0.3},duration:100,yoyo:true,repeat:3});
        this.time.delayedCall(1000,()=>{this.invincible=false;this.player.setAlpha(1)});
        this.updateHUD();
        if(this.hp<=0){this._dead=true;rainStop();this.player.setVelocity(0,-300);this.player.body.allowGravity=false;
            if(this.checkpoint){
                this.time.delayedCall(800,()=>{
                    this.cameras.main.fadeOut(500);
                    this.time.delayedCall(500,()=>{
                        this.scene.restart({level:this._lv});
                        this.cameras.main.fadeIn(300);
                    });
                });
            } else {
                this.time.delayedCall(800,()=>{this.cameras.main.fadeOut(500);this.time.delayedCall(500,()=>this.scene.start('Menu'))});
            }
        }
    }
    updateHUD(){
        this.hudHearts.forEach((h,i)=>h.setAlpha(i<this.hp?1:0.2));
        this.hudCrystal.setText('🍎 بلورات: '+this.crystals);
        let s=[];
        if(this.dashUnlock)s.push('C=اندفاع');
        if(this.djumpUnlock)s.push('↑=قفز مزدوج');
        this.hudSkills.setText(s.join(' | '));
    }
    showMsg(t){
        let m=this.add.text(480,130,t,{fontSize:'18px',fontFamily:'monospace',color:'#d4a030',stroke:'#000',strokeThickness:4}).setOrigin(0.5).setDepth(100).setScrollFactor(0);
        this.tweens.add({targets:m,y:90,alpha:{from:1,to:0},duration:2500,onComplete:()=>m.destroy()});
    }
    togglePause(){
        this._paused=!this._paused;
        if(this._paused){
            this.physics.world.isPaused=true;
            if(this._bgm)this._bgm.pause();
            this._pauseBg=this.add.rectangle(480,270,960,600,0x000000,0.6).setScrollFactor(0).setDepth(200);
            this._pauseTitle=this.add.text(480,180,'إيقاف مؤقت',{fontSize:'48px',fontFamily:'monospace',color:'#d4a030',stroke:'#000',strokeThickness:5}).setOrigin(0.5).setScrollFactor(0).setDepth(201);
            this._pauseResume=this.add.text(480,270,'▶ استئناف (Esc)',{fontSize:'22px',fontFamily:'monospace',color:'#fff',stroke:'#000',strokeThickness:3}).setOrigin(0.5).setScrollFactor(0).setDepth(201).setInteractive();
            this._pauseResume.on('pointerdown',()=>this.togglePause());
            this._pauseQuit=this.add.text(480,340,'✕ العودة للقائمة',{fontSize:'22px',fontFamily:'monospace',color:'#ff6666',stroke:'#000',strokeThickness:3}).setOrigin(0.5).setScrollFactor(0).setDepth(201).setInteractive();
            this._pauseQuit.on('pointerdown',()=>{this._paused=false;this.physics.world.isPaused=false;if(this._bgm)this._bgm.pause();rainStop();this.scene.start('Menu')});
        }else{
            this.physics.world.isPaused=false;
            if(this._bgm)this._bgm.play();
            if(this._pauseBg){this._pauseBg.destroy();this._pauseBg=null}
            if(this._pauseTitle){this._pauseTitle.destroy();this._pauseTitle=null}
            if(this._pauseResume){this._pauseResume.destroy();this._pauseResume=null}
            if(this._pauseQuit){this._pauseQuit.destroy();this._pauseQuit=null}
        }
    }
    win(){
        if(this.levelComplete)return;this.levelComplete=true;SFX.win();rainStop();
        this.player.setVelocity(0,0);this.player.body.setAllowGravity(false);
        this.invincible=true;
        let saveData=SaveManager.load();
        saveData.crystals+=this.crystals;
        if(this._lv>=saveData.level)saveData.level=Math.min(this._lv+1,3);
        if(!saveData.completedLevels)saveData.completedLevels=[];
        if(!saveData.completedLevels.includes(this._lv))saveData.completedLevels.push(this._lv);
        saveData.upgrades=window.upgrades;
        SaveManager.save(saveData);
        if(this._lv<3){
            let nextLv=this._lv+1;
            this.cameras.main.fadeOut(800,0,0,0,(c,p)=>{
                if(p===1)this.scene.start('Story',{level:nextLv})
            });
        }else{
            saveData.upgrades=window.upgrades;
            SaveManager.save(saveData);
            this.cameras.main.stopFollow();
            this.cameras.main.setScroll(0,0);
            this.cameras.main.fadeOut(1500,255,255,255,(c,p)=>{
                if(p!==1)return;
                this.cameras.main.fadeIn(500);
                ['bg-mtsky-fs','bg-mtfar-fs','bg-mtmid-fs','bg-mttrees-fs','bg-mtfront-fs'].forEach((k,i)=>{
                    this.add.image(480,270,k).setDepth(-20+i).setScrollFactor(0);
                });
                this.add.text(480,100,'! لقد هزمت الظلام',{fontSize:'46px',fontFamily:'monospace',color:'#d4a030',stroke:'#3a2a1a',strokeThickness:6}).setOrigin(0.5).setScrollFactor(0);
                this.add.text(480,180,'أكملت المغامرة: أسطورة السيف الصدئ',{fontSize:'18px',fontFamily:'monospace',color:'#fff',stroke:'#000',strokeThickness:3}).setOrigin(0.5).setScrollFactor(0);
                this.add.text(480,240,'الكريستالات: '+saveData.crystals,{fontSize:'18px',fontFamily:'monospace',color:'#c89ada'}).setOrigin(0.5).setScrollFactor(0);
                let rt=this.add.text(480,320,'اضغط للقائمة',{fontSize:'22px',fontFamily:'monospace',color:'#fff',stroke:'#000',strokeThickness:4}).setOrigin(0.5).setInteractive().setScrollFactor(0);
                rt.on('pointerdown',()=>this.scene.start('Menu'));
                this.tweens.add({targets:rt,alpha:{from:1,to:0.3},duration:800,yoyo:true,repeat:-1});
                this.input.keyboard.on('keydown-ENTER',()=>this.scene.start('Menu'));
            });
        }
    }
}
