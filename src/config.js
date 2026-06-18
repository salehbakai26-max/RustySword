const CONFIG = {
    width: 960,
    height: 540,
    gravity: 800,
    tileSize: 32,

    player: {
        speed: 180,
        jump: -380,
        dashSpeed: 400,
        dashDuration: 200,
        maxHealth: 3,
        swordRange: 40,
        attackDuration: 300,
        hitInvincible: 800,
    },

    slime: {
        speed: 40,
        patrolRange: 80,
    },

    crystal: {
        value: 10,
    },

    level1: {
        name: 'الغابة الخضراء',
        width: 3200,
        height: 540,
    },

    colors: {
        sky: '#87CEEB',
        ground: '#5a3a1a',
        grass: '#3a7a2a',
        platform: '#7a5a3a',
        platformTop: '#5a8a3a',
        bgTrees: '#2a5a1a',
        bgFar: '#4a8a4a',
    },
};
