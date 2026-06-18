const CFG={W:960,H:540,G:800,T:16,P:{spd:180,jmp:-380,dash:400,ddur:200,hp:3,adur:300,inv:800},S:{spd:40,range:80,shootCD:2500,bulletSpd:250,bulletLife:3000},L1:{w:3200,h:540},L2:{w:3600,h:540},L3:{w:4000,h:540}};
const STORY = {
    1: [
        { image: 'bg-flights-fs', text: 'في قديم الزمان، تحت ظلال أشجار شجر البلوط العتيقة، ساد السلام أرجاء القرية...' },
        { image: 'bg-fback-fs', text: 'لكن فجأة، بدأت قوى الشر والوحوش البرية بالظهور لتسلب القرية أمنها.' },
        { image: 'bg-ffront-fs', text: 'لم يتبق سوى بطل واحد يجرؤ على مواجهتهم: خالد وسيفه الصدئ العظيم.' },
        { image: 'bg-flights-fs', text: 'انطلق الآن في رحلة المجد، واجمع الكريستالات السحرية لتستعيد قوة سيفك!' }
    ],
    2: [
        { image: 'bg-mtsky-fs', text: 'لقد تجاوزت الغابة المظلمة، لكن الرحلة تزداد وعورة وصعوبة.' },
        { image: 'bg-mtfar-fs', text: 'الآن، تقف على مشارف جبال الغسق والكهف الموحش حيث تسكن وحوش الخفافيش الطائرة.' },
        { image: 'bg-mttrees-fs', text: 'الكريستالات التي تجمعها تمنحك قوى جديدة مثل الاندفاع السريع والقفز المزدوج.' },
        { image: 'bg-mtfront-fs', text: 'تسلح بالشجاعة، فالشر يراقبك من بين الصخور الوعرة!' }
    ],
    3: [
        { image: 'bg-mtsky-fs', text: 'لقد وصلت إلى برج الظلال الملعون، الحصن الأخير لساحر الظل.' },
        { image: 'bg-flights-fs', text: 'هنا، الأرواح الهائمة والجمامجم الطائرة تحرس بوابات البرج لتمنعك من الوصول.' },
        { image: 'bg-fmid-fs', text: 'بطلنا سيفه على وشك التحرر التام واستعادة بريقه الأسطوري.' },
        { image: 'bg-mtsky-fs', text: 'هذه هي المواجهة الكبرى والأخيرة. اهزم الوحوش واستعد السلام الأبدي للقرية!' }
    ]
};
const HERO = 'خالد';
const SaveManager = {
    save: (data) => localStorage.setItem('rusty_sword_v2_save', JSON.stringify(data)),
    load: () => {
        const data = localStorage.getItem('rusty_sword_v2_save');
        return data ? JSON.parse(data) : { level: 1, crystals: 0, skins: ['virtual-guy'], selectedSkin: 'virtual-guy', upgrades: { hp: 3, range: 40, dashCD: 500 }, completedLevels: [] };
    }
};
