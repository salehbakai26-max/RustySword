class Menu extends Phaser.Scene {
    constructor(){super({key:'Menu'})}
    create(){
        this.cameras.main.setBackgroundColor('#1a1a2e');
        let w=CFG.W,h=CFG.H;
        this.saveData = SaveManager.load();
        window.selectedSkin = this.saveData.selectedSkin;
        window.upgrades = this.saveData.upgrades;
        this.bgLayers=[];
        [{k:'bg-mtsky-fs',s:0.02},{k:'bg-mtfar-fs',s:0.08},{k:'bg-mtmid-fs',s:0.18},{k:'bg-mttrees-fs',s:0.35},{k:'bg-mtfront-fs',s:0.6}].forEach((l,i)=>{
            let g=[];
            for(let j=0;j<3;j++){
                let img=this.add.image(480+(j-1)*960,h/2,l.k).setDepth(-20+i);
                g.push(img);
            }
            g._spd=l.s;this.bgLayers.push(g);
        });
        this.add.text(w/2,50,'أسطورة السيف الصدئ',{fontSize:'38px',fontFamily:'monospace',color:'#d4a030',stroke:'#3a2a1a',strokeThickness:6}).setOrigin(0.5).setDepth(10);
        let p=this.add.sprite(w/2, 190, window.selectedSkin + '-idle').setScale(3.5).setDepth(10);
        p.play(window.selectedSkin + '-run');
        this.tweens.add({targets:p,x:w/2+30,duration:1200,yoyo:true,repeat:-1,ease:'Sine.easeInOut'});
        this.playerPreview = p;
        this.crystalText = this.add.text(w - 20, 20, `💎 الكريستالات: ${this.saveData.crystals}`, {fontSize:'18px',fontFamily:'monospace',color:'#00ffcc'}).setOrigin(1, 0).setDepth(10);
        this.add.text(w/2,260,'اختر المرحلة:',{fontSize:'16px',fontFamily:'monospace',color:'#d4a030',stroke:'#000',strokeThickness:3}).setOrigin(0.5).setDepth(10);
        for(let i=1;i<=3;i++){
            let cl=this.saveData.completedLevels||[],completed=cl.includes(i),avail=i===1||completed;
            let bx=w/2+(i-2)*160,by=290;
            let bg=this.add.rectangle(bx,by,130,34,avail?0x333366:0x222222,0.9).setDepth(10).setStrokeStyle(2,avail?0xd4a030:0x555555);
            let icon=completed?'⭐ ':(avail?'':'🔒 ');
            this.add.text(bx,by,icon+'مستوى '+i,{fontSize:'15px',fontFamily:'monospace',color:completed?'#00ff00':(avail?'#fff':'#666'),stroke:'#000',strokeThickness:2}).setOrigin(0.5).setDepth(11);
            if(avail){
                bg.setInteractive({useHandCursor:true});
                bg.on('pointerdown',()=>{this.cameras.main.fadeOut(300,0,0,0,(c,pr)=>{if(pr===1)this.scene.start('Story',{level:i})})});
                bg.on('pointerover',()=>bg.setFillStyle(0x555588));
                bg.on('pointerout',()=>bg.setFillStyle(0x333366));
            }
        }
        let t=this.add.text(w/2,340,'متابعة اللعب',{fontSize:'24px',fontFamily:'monospace',color:'#fff',stroke:'#000',strokeThickness:4}).setOrigin(0.5).setDepth(10).setInteractive();
        t.on('pointerdown',()=>this.start());
        this.tweens.add({targets:t,alpha:{from:1,to:0.2},duration:800,yoyo:true,repeat:-1});
        this.add.text(w/2,400,'← → حركة | Z قفز | ↑ قفز بديل | X هجوم | C اندفاع',{fontSize:'13px',fontFamily:'monospace',color:'#aaa'}).setOrigin(0.5).setDepth(10);
        this.add.text(w/2,425,'اجمع 3 كريستالات لفتح الاندفاع | 6 لفتح قفز مزدوج',{fontSize:'12px',fontFamily:'monospace',color:'#888'}).setOrigin(0.5).setDepth(10);
        this.add.text(w/2,450,'🍎 التفاح في المستوى = كريستالات | استخدمها في المتجر لشراء جلود وترقيات',{fontSize:'11px',fontFamily:'monospace',color:'#666'}).setOrigin(0.5).setDepth(10);
        this.drawShopUI();
        this.input.keyboard.on('keydown-ENTER',()=>this.start());
        this.input.keyboard.on('keydown-SPACE',()=>this.start());
        this.cameras.main.fadeIn(500);
        this._menuTime=0;
    }
    drawShopUI() {
        let w=CFG.W,h=CFG.H;
        if (this.shopGroup) { this.shopGroup.destroy(true); }
        this.shopGroup = this.add.group();
        let skinList = [
            { name: 'الفتى الافتراضي', key: 'virtual-guy', price: 0 },
            { name: 'الضفدع النينجا', key: 'ninja-frog', price: 10 },
            { name: 'الرجل الوردي', key: 'pink-man', price: 20 },
            { name: 'صاحب القناع', key: 'mask-dude', price: 30 }
        ];
        let titleText = this.add.text(w - 220, 85, 'الشخصيات المتاحة:', {fontSize:'15px',fontFamily:'monospace',color:'#d4a030',stroke:'#000',strokeThickness:2}).setOrigin(0).setDepth(10);
        this.shopGroup.add(titleText);
        skinList.forEach((skin, idx) => {
            let unlocked = this.saveData.skins.includes(skin.key);
            let selected = window.selectedSkin === skin.key;
            let statusText = selected ? 'مفعل' : (unlocked ? 'اختر' : `${skin.price} 💎`);
            let textColor = selected ? '#00ff00' : (unlocked ? '#ffffff' : '#ff4444');
            let btn = this.add.text(w - 220, 115 + idx * 30, `• ${skin.name} (${statusText})`, {
                fontSize: '13px', fontFamily: 'monospace', color: textColor, stroke: '#000', strokeThickness: 2
            }).setOrigin(0).setDepth(10).setInteractive();
            btn.on('pointerdown', () => {
                if (selected) return;
                if (unlocked) {
                    this.saveData.selectedSkin = skin.key;
                    window.selectedSkin = skin.key;
                    SaveManager.save(this.saveData);
                    this.playerPreview.play(skin.key + '-run');
                    this.drawShopUI();
                } else {
                    if (this.saveData.crystals >= skin.price) {
                        this.saveData.crystals -= skin.price;
                        this.saveData.skins.push(skin.key);
                        this.saveData.selectedSkin = skin.key;
                        window.selectedSkin = skin.key;
                        SaveManager.save(this.saveData);
                        this.playerPreview.play(skin.key + '-run');
                        this.crystalText.setText(`💎 الكريستالات: ${this.saveData.crystals}`);
                        this.drawShopUI();
                    } else {
                        let errMsg = this.add.text(w/2, 110, 'لا تملك بلورات كافية!', {fontSize:'16px',fontFamily:'monospace',color:'#ff0000',stroke:'#000',strokeThickness:3}).setOrigin(0.5).setDepth(20);
                        this.tweens.add({targets:errMsg, alpha:0, y:80, duration:1500, onComplete:()=>errMsg.destroy()});
                    }
                }
            });
            this.shopGroup.add(btn);
        });
        let upgradeTitle = this.add.text(50, 85, 'ترقيات المتجر:', {fontSize:'15px',fontFamily:'monospace',color:'#d4a030',stroke:'#000',strokeThickness:2}).setOrigin(0).setDepth(10);
        this.shopGroup.add(upgradeTitle);
        let hpPrice = 15;
        let hpText = window.upgrades.hp >= 5 ? 'مكتملة' : `زيادة القلوب: ${window.upgrades.hp}/5 (${hpPrice} 💎)`;
        let hpBtn = this.add.text(50, 115, hpText, {
            fontSize: '13px', fontFamily: 'monospace', color: window.upgrades.hp >= 5 ? '#00ff00' : '#ffffff', stroke: '#000', strokeThickness: 2
        }).setOrigin(0).setDepth(10).setInteractive();
        hpBtn.on('pointerdown', () => {
            if (window.upgrades.hp >= 5) return;
            if (this.saveData.crystals >= hpPrice) {
                this.saveData.crystals -= hpPrice;
                window.upgrades.hp++;
                this.saveData.upgrades = window.upgrades;
                SaveManager.save(this.saveData);
                this.crystalText.setText(`💎 الكريستالات: ${this.saveData.crystals}`);
                this.drawShopUI();
            } else {
                let errMsg = this.add.text(w/2, 110, 'لا تملك بلورات كافية!', {fontSize:'16px',fontFamily:'monospace',color:'#ff0000',stroke:'#000',strokeThickness:3}).setOrigin(0.5).setDepth(20);
                this.tweens.add({targets:errMsg, alpha:0, y:80, duration:1500, onComplete:()=>errMsg.destroy()});
            }
        });
        this.shopGroup.add(hpBtn);
        let rangePrice = 10;
        let currentRangeLevel = (window.upgrades.range - 40) / 10;
        let rangeText = window.upgrades.range >= 80 ? 'مكتملة' : `مدى السيف: +${currentRangeLevel * 10} (${rangePrice} 💎)`;
        let rangeBtn = this.add.text(50, 145, rangeText, {
            fontSize: '13px', fontFamily: 'monospace', color: window.upgrades.range >= 80 ? '#00ff00' : '#ffffff', stroke: '#000', strokeThickness: 2
        }).setOrigin(0).setDepth(10).setInteractive();
        rangeBtn.on('pointerdown', () => {
            if (window.upgrades.range >= 80) return;
            if (this.saveData.crystals >= rangePrice) {
                this.saveData.crystals -= rangePrice;
                window.upgrades.range += 10;
                this.saveData.upgrades = window.upgrades;
                SaveManager.save(this.saveData);
                this.crystalText.setText(`💎 الكريستالات: ${this.saveData.crystals}`);
                this.drawShopUI();
            } else {
                let errMsg = this.add.text(w/2, 110, 'لا تملك بلورات كافية!', {fontSize:'16px',fontFamily:'monospace',color:'#ff0000',stroke:'#000',strokeThickness:3}).setOrigin(0.5).setDepth(20);
                this.tweens.add({targets:errMsg, alpha:0, y:80, duration:1500, onComplete:()=>errMsg.destroy()});
            }
        });
        this.shopGroup.add(rangeBtn);
    }
    update(){
        this._menuTime=(this._menuTime||0)+1;
        this.bgLayers.forEach(g=>{
            let off=this._menuTime*g._spd;
            g.forEach((img,i)=>{img.x=480+(i-1)*960-off});
            if(g[2].x<480)g.forEach(img=>img.x+=2880);
            if(g[0].x>480)g.forEach(img=>img.x-=2880);
        });
    }
    start(){this.cameras.main.fadeOut(300,0,0,0,(c,p)=>{if(p===1)this.scene.start('Story',{level: this.saveData.level || 1})})}
}
