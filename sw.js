const CACHE = 'rusty-sword-v1';
const CORE = [
  'index.html','icon-192.png','icon-512.png','manifest.json',
  'lib/phaser.min.js',
  'js/cfg.js','js/audio.js','js/levels.js',
  'js/Boot.js','js/Menu.js','js/Story.js','js/Game.js','js/main.js'
];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.map(k=>{if(k!==CACHE)return caches.delete(k)}))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  e.respondWith(
    caches.match(e.request).then(r=>{
      if(r)return r;
      return fetch(e.request).then(res=>{
        if(res&&res.ok){
          let c=res.clone();
          caches.open(CACHE).then(ca=>ca.put(e.request,c));
        }
        return res;
      }).catch(()=>new Response('',{status:408}));
    })
  );
});
