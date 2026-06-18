const AudioSystem = {
    play: (sfxName) => {
        if (window.SFX && typeof window.SFX[sfxName] === 'function') {
            window.SFX[sfxName]();
        }
    }
};

if (typeof module !== 'undefined') module.exports = AudioSystem;
