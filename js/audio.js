let _actx;
function actx(){if(!_actx)_actx=new(window.AudioContext||window.webkitAudioContext)();return _actx}
function osc(f0,f1,dur,type,vol){try{
    let c=actx(),o=c.createOscillator(),g=c.createGain();
    o.type=type||'sine';o.frequency.setValueAtTime(f0,c.currentTime);o.frequency.linearRampToValueAtTime(f1,c.currentTime+dur);
    g.gain.setValueAtTime(vol||0.3,c.currentTime);g.gain.linearRampToValueAtTime(0,c.currentTime+dur);
    o.connect(g);g.connect(c.destination);o.start(c.currentTime);o.stop(c.currentTime+dur)
}catch(e){}}
function noise(dur,vol){try{
    let c=actx(),sr=c.sampleRate,b=c.createBuffer(1,~~(sr*dur),sr),d=b.getChannelData(0);
    for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
    let s=c.createBufferSource(),g=c.createGain();
    s.buffer=b;g.gain.setValueAtTime(vol||0.3,c.currentTime);g.gain.linearRampToValueAtTime(0,c.currentTime+dur);
    s.connect(g);g.connect(c.destination);s.start(c.currentTime);s.stop(c.currentTime+dur)
}catch(e){}}
function rainStart(){try{
    let c=actx(),sr=c.sampleRate,buflen=~~(sr*4),b=c.createBuffer(1,buflen,sr),d=b.getChannelData(0);
    for(let i=0;i<buflen;i++)d[i]=Math.random()*2-1;
    let src=c.createBufferSource(),g=c.createGain(),f=c.createBiquadFilter();
    src.buffer=b;src.loop=true;
    f.type='highpass';f.frequency.value=2000;f.Q.value=1;
    g.gain.setValueAtTime(0,c.currentTime);g.gain.linearRampToValueAtTime(0.06,c.currentTime+1);
    src.connect(f);f.connect(g);g.connect(c.destination);src.start();
    SFX._rain={src,g}
}catch(e){}}
function rainStop(){try{
    if(!SFX._rain)return;let c=actx();
    SFX._rain.g.gain.linearRampToValueAtTime(0,c.currentTime+0.5);
    setTimeout(()=>{try{SFX._rain.src.stop()}catch(e){};SFX._rain=null},600)
}catch(e){}}
const SFX={
    jump:()=>{osc(200,600,0.1,'sine',0.25)},
    dbljump:()=>{osc(400,900,0.1,'sine',0.2)},
    attack:()=>{osc(400,100,0.12,'square',0.2)},
    dash:()=>{noise(0.08,0.2)},
    collect:()=>{osc(880,880,0.06,'sine',0.25);setTimeout(()=>osc(1320,1320,0.06,'sine',0.25),70)},
    hit:()=>{osc(150,60,0.2,'square',0.25)},
    kill:()=>{osc(300,80,0.15,'sawtooth',0.15)},
    thunder:()=>{try{let c=actx(),n=c.currentTime,o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.setValueAtTime(55,n);o.frequency.exponentialRampToValueAtTime(18,n+1.8);g.gain.setValueAtTime(0,n);g.gain.linearRampToValueAtTime(0.22,n+0.08);g.gain.linearRampToValueAtTime(0.1,n+0.5);g.gain.linearRampToValueAtTime(0,n+2);o.connect(g);g.connect(c.destination);o.start(n);o.stop(n+2)}catch(e){}},
    land:()=>{osc(60,40,0.05,'square',0.12)},
    shoot:()=>{osc(800,200,0.08,'sawtooth',0.1)},
    explode:()=>{osc(200,60,0.2,'square',0.2);setTimeout(()=>noise(0.1,0.15),50)},
    win:()=>{osc(660,880,0.15,'sine',0.3);setTimeout(()=>osc(880,1100,0.2,'sine',0.3),200);setTimeout(()=>osc(1100,1320,0.3,'sine',0.3),450)},
    heal:()=>{osc(660,660,0.08,'sine',0.2);setTimeout(()=>osc(880,880,0.08,'sine',0.2),100)}
};
