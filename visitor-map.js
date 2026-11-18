/* Self-contained SVG map, available even when all external APIs are offline.
   ipwho.is is queried ONLY after someone clicks the button; no precise GPS.
   The current visitor dot is ephemeral; no raw IP is stored by this website.
*/
(() => {
  'use strict';
  const svg = document.getElementById('visitorWorldSvg');
  const dots = document.getElementById('visitorDots');
  const button = document.getElementById('locateVisitor');
  const status = document.getElementById('mapStatus');
  const message = document.getElementById('mapMessage');
  const location = document.getElementById('mapLocation');
  const tooltip = document.getElementById('visitorTooltip');
  if (!svg || !dots || !button) return;
  const NS = 'http://www.w3.org/2000/svg';
  const make = (tag, attr = {}) => {
    const n = document.createElementNS(NS, tag);
    for (const [k,v] of Object.entries(attr)) n.setAttribute(k, v);
    return n;
  };
  const projected = (latitude, longitude) => ({
    x: ((longitude + 180) / 360) * 1000,
    y: ((90 - latitude) / 180) * 450
  });
  function showDot(lat, lon, label) {
    dots.replaceChildren();
    const {x,y}=projected(lat,lon);
    const halo=make('circle',{cx:x,cy:y,r:16,fill:'#d6d1c4',opacity:'.12'});
    const ring=make('circle',{cx:x,cy:y,r:9,fill:'none',stroke:'#e8e4d8','stroke-width':1,opacity:'.65'});
    const dot=make('circle',{cx:x,cy:y,r:4.7,fill:'#f3eee1',stroke:'#121212','stroke-width':1.4});
    const title=make('title');title.textContent=label;
    dot.appendChild(title); dots.append(halo,ring,dot);
    dots.setAttribute('aria-label','Current visitor approximately located in '+label);
    tooltip.hidden=false;
    tooltip.textContent='● '+label;
    tooltip.style.left=Math.max(7,Math.min(85,x/10))+'%';
    tooltip.style.top=Math.max(8,Math.min(83,y/4.5-11))+'%';
  }
  button.addEventListener('click', async () => {
    button.disabled=true;
    button.textContent='Locating…';
    status.textContent='LOOKING UP LOCATION';
    message.textContent='Locating…';
    try {
      const controller=new AbortController();
      const timeout=setTimeout(()=>controller.abort(),8000);
      let response;
      try { response=await fetch('https://ipwho.is/',{signal:controller.signal,cache:'no-store'}); }
      finally { clearTimeout(timeout); }
      if(!response.ok) throw Error('The geolocation service is unavailable.');
      const data=await response.json();
      const lat=Number(data.latitude),lon=Number(data.longitude);
      if(data.success!==true || !Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat)>90 || Math.abs(lon)>180) throw Error('Location could not be determined.');
      const display=[data.city,data.region,data.country].filter(Boolean).filter((p,i,a)=>a.indexOf(p)===i).join(', ')||'Approximate location';
      showDot(lat,lon,display);
      location.textContent=display;
      message.textContent='Approximate location';
      status.textContent='CURRENT VISIT LOCATED';
      button.textContent='Refresh my dot ↗';
    } catch(err) {
      status.textContent='MAP VISIBLE · IP LOOKUP UNAVAILABLE';
      message.textContent='Location unavailable';
      button.textContent='Retry location ↗';
    } finally {button.disabled=false;}
  });
  // Optional provider: only verifiable, user-supplied widget URLs; never claim to
  // have recorded visits before provider is configured and connected.
  const cfg=window.VISITOR_MAP_CONFIG||{};
  const mount=document.getElementById('providerMapMount');
  const section=document.getElementById('providerMapSection');
  const tracking=document.getElementById('trackingStatus');
  const valid=(s)=>typeof s==='string'&&/^https:\/\//i.test(s);
  if(mount && section) {
    const iframe=cfg.providerIframeUrl, image=cfg.providerImageUrl, script=cfg.providerScriptUrl;
    if(valid(iframe)||valid(image)||valid(script)) {
      section.hidden=false;
      // Once a real cumulative widget is supplied, show that map rather than two stacked maps.
      const demo=svg.closest('.live-map-stage');if(demo)demo.hidden=true;
      const currentVisit=button.closest('.map-info-row');if(currentVisit)currentVisit.hidden=true;
      tracking.textContent='';
      if(valid(iframe)) {
        const el=document.createElement('iframe');el.src=iframe;el.title='Historical visitor map';el.loading='lazy';el.referrerPolicy='strict-origin-when-cross-origin';mount.append(el);
      } else if(valid(image)) {
        const el=document.createElement('img');el.src=image;el.alt='Historical visitor locations from the map provider';el.loading='lazy';mount.append(el);
      } else {
        const el=document.createElement('script');el.src=script;el.async=true;el.referrerPolicy='strict-origin-when-cross-origin';mount.append(el);
      }
    }
  }
})();
