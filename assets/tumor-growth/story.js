/* Native page scrolling. One presented frame owns both artwork and captions. */
(() => {
 const root=document.getElementById('probProgression');
 if(!root || !window.TumorArt) return;
 const art=window.TumorArt, data=window.TUMOR_SEQUENCE;
 const pin=root.querySelector('.hf-growth-pin'), canvas=root.querySelector('canvas');
 const title=root.querySelector('.hf-growth-title'), caption=root.querySelector('.hf-growth-caption'), beat=root.querySelector('.hf-growth-beat');
 const progress=root.querySelector('.hf-growth-progress span'), status=root.querySelector('.hf-growth-status');
 const toggle=root.querySelector('.hf-growth-mode'), stills=root.querySelector('.hf-growth-static');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let reading=false, ready=false, loading=false, active=false, pending=0, lastWidth=innerWidth, lastHeight=innerHeight, shortViewport=innerHeight<=540;
 // Freeze runway and sticky viewport height until width/orientation changes.
 // Mobile toolbar expansion must never rewind the biological timeline.
 let distance=innerWidth<=600?1800:innerWidth<=880?2000:2200, pinHeight=0, navOffset=0, start=0, previousPosition=0;
 // Only this scene is sticky. Following sections remain in ordinary page flow.
 // Give the explanation room according to its reading chapter, not how many
 // source images happened to be drawn for that phase. All art frames remain.
 const weights={normal:.65,driver:1.25,division:1,cluster:1,premalignant:1,oxygen:1.15,vascular:1.25,invasion:1.15,closing:.9};
 const chapters=data.readingBeats.map((b,i)=>({
   from:Math.max(0,art.frames.findIndex(f=>f.readingBeat===i+1)-.07),
   to:i===data.readingBeats.length-1?art.frames.length-1:art.frames.findIndex(f=>f.readingBeat===i+2)-.07,
   weight:weights[b.id]||1
 }));
 const totalWeight=chapters.reduce((sum,c)=>sum+c.weight,0);
 function positionAtProgress(raw) {
   let remaining=Math.max(0,Math.min(1,raw))*totalWeight;
   for(const c of chapters){if(remaining<=c.weight)return c.from+(c.to-c.from)*remaining/c.weight;remaining-=c.weight;}
   return art.frames.length-1;
 }
 function progressAtPosition(position) {
   let before=0;
   for(const c of chapters){if(position<=c.to)return (before+c.weight*Math.max(0,(position-c.from)/(c.to-c.from)))/totalWeight;before+=c.weight;}
   return 1;
 }
 function place(img,f) {
   const [x0,y0,x1,y1]=f.bounds,h=f.extent/Math.max(1,f.bodyAspect);
   const sx=h*f.bodyAspect/(x1-x0),sy=h/(y1-y0);
   Object.assign(img.style,{width:(1254*sx*100)+'%',height:(1254*sy*100)+'%',left:((.5-(x0+x1)/2*sx)*100)+'%',top:((.46-(y0+y1)/2*sy)*100)+'%'});
 }
 place(root.querySelector('.hf-growth-poster img'),art.frames[0]);
 stills.querySelectorAll('figure').forEach((figure,i)=>place(figure.querySelector('img'),art.frames.find(f=>f.readingBeat===i+1)));
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 function staticAssets() {
   stills.querySelectorAll('img[data-src]').forEach(img=>{
     const full=img.dataset.src;
     img.onerror=()=>{
       if(img.src.includes('/960/')) {img.src=full;return;}
       img.onerror=null;img.hidden=true;
       const message=document.createElement('p');
       message.className='hf-growth-image-error';
       message.textContent='Illustration unavailable. Its description is shown here.';
       img.parentElement.append(message);
     };
     img.src=innerWidth<=880?full.replace('tumor-growth/','tumor-growth/960/'):full;
     delete img.dataset.src;
   });
 }
 function reserveCopy() {
   const story=root.querySelector('.hf-growth-story'), width=story.getBoundingClientRect().width;
   if(!width)return;
   const probe=story.cloneNode(true);
   probe.setAttribute('aria-hidden','true');
   probe.style.cssText='position:absolute;visibility:hidden;pointer-events:none;top:0;left:0;width:'+width+'px';
   root.append(probe);
   for(const [selector,key] of [['.hf-growth-title','title'],['.hf-growth-caption','caption']]){
     const field=probe.querySelector(selector);field.style.minHeight='0';field.style.height='auto';
     let maximum=0;
     for(const item of data.readingBeats){field.textContent=item[key];maximum=Math.max(maximum,field.getBoundingClientRect().height);}
     const real=story.querySelector(selector);real.style.minHeight='0';real.style.height=Math.ceil(maximum)+'px';
   }
   probe.remove();
 }
 function layout() {
   const nav=document.getElementById('nav'), navStyle=nav&&getComputedStyle(nav);
   // The story sits below the compact navigation, even when layout runs at the hero.
   navOffset=nav?Math.ceil(nav.getBoundingClientRect().height-parseFloat(navStyle.paddingTop)-parseFloat(navStyle.paddingBottom)+(innerWidth<=900?28:36)):(innerWidth<=900?73:81);
   root.style.setProperty('--growth-nav',navOffset+'px');
   active=!reading&&!reduced.matches&&!shortViewport;
   root.classList.toggle('hf-growth-short',shortViewport);
   root.classList.toggle('hf-growth-is-reading',reading);
   if(active)reserveCopy();
   // CSS uses svh; cache the actual box so transient innerHeight changes cannot alter progress.
   if(active&&!pinHeight) {
     pin.style.minHeight='calc(100svh - var(--growth-nav))';
     pin.style.height='';root.querySelector('.hf-growth-stage').style.width='';
     pinHeight=pin.getBoundingClientRect().height;
     const artWidth=root.querySelector('.hf-growth-stage').getBoundingClientRect().width;
     if(artWidth>0)root.querySelector('.hf-growth-stage').style.width=artWidth+'px';
   }
   if(active&&pinHeight>0){pin.style.height=pinHeight+'px';pin.style.minHeight=pinHeight+'px';}
   if(active) {
     root.style.height=(distance+pinHeight)+'px';
     stills.hidden=true;
     start=root.getBoundingClientRect().top+scrollY-navOffset;
   } else {pinHeight=0;root.style.height='auto';pin.style.height='auto';pin.style.minHeight='0px';stills.hidden=false;staticAssets();}
   request();
 }
 function render() {
   pending=0;
   if(!active||!ready) return;
   if(scrollY<start-pinHeight||scrollY>start+distance+pinHeight){document.body.classList.remove('hf-growth-inview');return;}
   const raw=clamp((scrollY-start)/distance,0,1);
   const position=positionAtProgress(raw);
   const size=Math.round(Math.min(1800,canvas.clientWidth*(devicePixelRatio||1)));
   if(size>0 && canvas.width!==size){canvas.width=size;canvas.height=size;}
   const state=art.draw(canvas,position,{stabilize:true});
   const frame=art.frames[state.dominant];
   if(root.dataset.frame!==String(state.dominant+1)){
     title.textContent=frame.title;caption.textContent=frame.caption;
     beat.textContent='GROWTH '+String(frame.readingBeat).padStart(2,'0')+' / '+data.readingBeats.length;
     canvas.setAttribute('aria-label',frame.visible);
     root.dataset.frame=String(state.dominant+1);root.dataset.beat=String(frame.readingBeat);
   }
   progress.style.transform='scaleX('+raw+')';
   status.textContent=frame.readingBeat===data.readingBeats.length?'':'Scroll to watch it grow';
   root.dataset.position=String(position);root.dataset.distance=String(distance);
   previousPosition=position;
   document.body.classList.toggle('hf-growth-inview',scrollY>start-pinHeight*.5&&scrollY<start+distance+pinHeight);
 }
 function request() { if(!pending)pending=requestAnimationFrame(render); }
 function load() {
   if(loading||!active) return;
   loading=true;status.textContent='Loading the growth sequence…';
   art.load().then(()=>{
     ready=true;root.classList.add('hf-growth-ready');status.textContent='Scroll to watch it grow';
     request();
   }).catch(()=>{
     reading=true;root.classList.add('hf-growth-load-failed');
     toggle.textContent='Read the growth sequence';toggle.disabled=true;
     layout();
   });
 }
 toggle.addEventListener('click',()=>{
   reading=!reading;toggle.textContent=reading?'Return to scroll':'Read as stills';
   toggle.setAttribute('aria-pressed',String(reading));layout();
   scrollTo({top:root.getBoundingClientRect().top+scrollY-navOffset,behavior:'instant'});
   if(!reading) load();
   window.ScrollTrigger?.refresh();
 });
 document.documentElement.classList.add('hf-growth-js');
 root.classList.toggle('hf-growth-compact',innerWidth<=880&&innerHeight<=740);
 layout();
 const observer=new IntersectionObserver(entries=>{
   if(entries.some(entry=>entry.isIntersecting)){load();if(loading)observer.disconnect();}
 },{rootMargin:'300px 0px'});
 observer.observe(root);
 addEventListener('scroll',request,{passive:true});
 addEventListener('resize',()=>{
   if(Math.abs(innerWidth-lastWidth)>1 || (innerWidth>900&&Math.abs(innerHeight-lastHeight)>1)){
     lastWidth=innerWidth;lastHeight=innerHeight;pinHeight=0;shortViewport=innerHeight<=540;
     const inStory=active&&scrollY>=start&&scrollY<=start+distance;
     root.classList.toggle('hf-growth-compact',innerWidth<=880&&innerHeight<=740);distance=innerWidth<=600?1800:innerWidth<=880?2000:2200;
     layout();
     if(active) load();
     if(inStory&&active) scrollTo({top:start+distance*progressAtPosition(previousPosition),behavior:'instant'});
   } else {
     // Toolbar/height-only changes never force the document to a new scrollY.
     start=root.getBoundingClientRect().top+scrollY-navOffset;
     request();
   }
 },{passive:true});
 function preferenceChange(){layout();if(active)load();window.ScrollTrigger?.refresh();}
 reduced.addEventListener('change',preferenceChange);
 addEventListener('beforeprint',staticAssets);
 document.fonts?.ready.then(()=>{pinHeight=0;layout();window.ScrollTrigger?.refresh();});
 addEventListener('load',()=>{layout();window.ScrollTrigger?.refresh();},{once:true});
 // Direct anchors need the reserved runway before their final browser scroll.
 if(location.hash==='#probProgression') requestAnimationFrame(()=>root.scrollIntoView({block:'start'}));

})();
