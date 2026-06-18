class SaveManager {
    static save(data) {
        localStorage.setItem('rusty_sword_save', JSON.stringify(data));
    }

    static load() {
        const data = localStorage.getItem('rusty_sword_save');
        return data ? JSON.parse(data) : { level: 1, crystals: 0, unlocked: [] };
    }
}

if (typeof module !== 'undefined') module.exports = SaveManager;
