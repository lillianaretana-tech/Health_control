const CACHE='health-control-calma-v3';
const ASSETS=['./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',event=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE);
    await Promise.allSettled(ASSETS.map(url=>cache.add(url)));
    await self.skipWaiting();
  })());
});
self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(key=>key.startsWith('health-control-calma-')&&key!==CACHE).map(key=>caches.delete(key)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;
  event.respondWith((async()=>{
    try{
      const response=await fetch(event.request);
      if(response.ok){const cache=await caches.open(CACHE);cache.put(event.request,response.clone()).catch(()=>{});}
      return response;
    }catch(error){return (await caches.match(event.request))||Response.error();}
  })());
});
