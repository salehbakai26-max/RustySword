new Phaser.Game({
    type:Phaser.CANVAS,width:CFG.W,height:CFG.H,parent:'g',
    backgroundColor:'#1a1a2e',pixelArt:true,roundPixels:true,
    physics:{default:'arcade',arcade:{gravity:{y:CFG.G},debug:false}},
    scene:[Boot,Menu,StoryCinematic,Game],
    scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},
});
