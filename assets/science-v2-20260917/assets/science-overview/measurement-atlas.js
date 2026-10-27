/* HelioFlux measurement illustration. Paths, timing and scale are illustrative.
   The generated source stays unchanged; localized depth motion is a separate layer. */
(() => {
  'use strict';
  const WIDTH = 1536, HEIGHT = 1024, PERIOD = 18;
  const WINDOW = {x:1036, y:501, rx:25, ry:84};
  // Each illustrated pulse leaves a drawn mitochondrion and travels directly
  // outward. Only one reaches the optical window; paths are not measured.
  const emissions = [
    {from:[625,334], to:[1032,485], start:0, duration:3.2, detected:true},
    {from:[555,712], to:[945,874], start:3.6, duration:3.2},
    {from:[625,334], to:[915,265], start:7.2, duration:3.2},
    {from:[555,712], to:[904,640], start:10.8, duration:3.2},
    {from:[625,334], to:[912,418], start:14.4, duration:3.2}
  ];
  window.installSignalAnimation = () => {
    const canvas=document.querySelector('#signal-canvas');
    if(!canvas) return null;
    if(canvas.__signalAnimation) return canvas.__signalAnimation;
    const ctx=canvas.getContext('2d',{alpha:true});
    if(!ctx) return null;
    const toggle=document.querySelector('#motion-toggle');
    const reduced=matchMedia('(prefers-reduced-motion: reduce)');
    // Phones and Save-Data visitors get the poster and the light canvas, not the 0.8 MB film (October 4).
    const film=(matchMedia('(min-width: 901px)').matches&&!navigator.connection?.saveData)?window.installMeasurementFilm?.():null;
    let paused=reduced.matches, visible=false, disposed=false, time=1.4, last=0, raf=0;
    const age=(t,start)=>(t-start+PERIOD*2)%PERIOD;
    const drawLight=(x,y,dx,dy,alpha,origin) => {
      ctx.save(); ctx.globalAlpha=alpha;
      const source=ctx.createRadialGradient(origin[0],origin[1],0,origin[0],origin[1],31);
      source.addColorStop(0,'rgba(255,250,214,.85)');
      source.addColorStop(.2,'rgba(244,242,199,.45)');
      source.addColorStop(1,'rgba(205,232,201,0)');
      ctx.fillStyle=source;ctx.fillRect(origin[0]-31,origin[1]-31,62,62);
      const ray=ctx.createLinearGradient(origin[0],origin[1],x,y);
      ray.addColorStop(0,'rgba(244,245,210,.58)');
      ray.addColorStop(1,'rgba(244,245,210,.26)');
      ctx.strokeStyle=ray;ctx.lineWidth=2.7;ctx.lineCap='round';
      ctx.beginPath();ctx.moveTo(origin[0],origin[1]);ctx.lineTo(x,y);ctx.stroke();
      const halo=ctx.createRadialGradient(x,y,0,x,y,25);
      halo.addColorStop(0,'rgba(255,248,215,.9)');
      halo.addColorStop(.19,'rgba(242,242,204,.48)');
      halo.addColorStop(1,'rgba(205,232,201,0)');
      ctx.fillStyle=halo; ctx.fillRect(x-25,y-25,50,50);
      const trail=ctx.createLinearGradient(x-dx*35,y-dy*35,x,y);
      trail.addColorStop(0,'rgba(226,239,203,0)');trail.addColorStop(1,'rgba(249,248,224,.88)');
      ctx.strokeStyle=trail;ctx.lineWidth=3;ctx.lineCap='round';
      ctx.beginPath();ctx.moveTo(x-dx*35,y-dy*35);ctx.lineTo(x,y);ctx.stroke();
      ctx.fillStyle='#fffae7';ctx.beginPath();ctx.arc(x,y,3.5,0,Math.PI*2);ctx.fill();
      ctx.restore();
    };
    const drawOutput=(elapsed) => {
      // A symbolic electrical pulse, never a measured trace or photon cascade.
      const alpha=Math.sin(Math.PI*elapsed/.95)*.85;
      ctx.save();ctx.globalAlpha=Math.max(0,alpha);ctx.strokeStyle='#c5d9b7';
      ctx.lineWidth=2;ctx.lineJoin='round';ctx.lineCap='round';ctx.beginPath();
      [[1138,721],[1196,721],[1205,721],[1211,693],[1218,733],[1225,721],[1306,721]].forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));
      ctx.stroke();ctx.restore();
    };
    const render=() => {
      ctx.setTransform(canvas.width/WIDTH,0,0,canvas.height/HEIGHT,0,0);
      ctx.clearRect(0,0,WIDTH,HEIGHT);
      for(const e of emissions){
        const elapsed=age(time,e.start);
        if(elapsed<=e.duration){
          const u=elapsed/e.duration,dx=e.to[0]-e.from[0],dy=e.to[1]-e.from[1],length=Math.hypot(dx,dy);
          const alpha=Math.min(1,elapsed/.18,(e.duration-elapsed)/.3);
          drawLight(e.from[0]+dx*u,e.from[1]+dy*u,dx/length,dy/length,alpha,e.from);
        }
        const response=elapsed-e.duration;
        if(e.detected&&response>=0&&response<.95) drawOutput(response);
      }
    };
    const canRun=()=>!disposed&&!paused&&visible&&!document.hidden;
    const frame=stamp=>{
      raf=0;if(!canRun()){last=0;return;}
      if(last)time=(time+Math.min((stamp-last)/1000,.1))%PERIOD;
      last=stamp;render();raf=requestAnimationFrame(frame);
    };
    const sync=()=>{
      if(raf)cancelAnimationFrame(raf);raf=0;last=0;
      if(toggle){toggle.textContent=paused?'Play illustration':'Pause illustration';}
      film?.setPlaying(canRun());
      if(canRun())raf=requestAnimationFrame(frame);
    };
    const setPaused=value=>{paused=value;sync();};
    const onToggle=()=>setPaused(!paused);
    const onVisibility=()=>sync();
    const onReduced=event=>{setPaused(event.matches);render();};
    const resize=()=>{
      const width=canvas.getBoundingClientRect().width;
      if(!width)return;
      const dpr=Math.min(devicePixelRatio||1,2);
      canvas.width=Math.round(width*dpr);canvas.height=Math.round(width*HEIGHT/WIDTH*dpr);render();
    };
    const intersection=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();},{threshold:0});
    const observer=new ResizeObserver(resize);
    intersection.observe(canvas);observer.observe(canvas);
    toggle?.addEventListener('click',onToggle);
    reduced.addEventListener('change',onReduced);
    document.addEventListener('visibilitychange',onVisibility);
    const controller={
      setPaused,
      renderAt(seconds){setPaused(true);time=((seconds%PERIOD)+PERIOD)%PERIOD;render();},
      getState(){return{paused,visible,time,running:canRun(),film:film?.getState()||null,window:WINDOW,emissions};},
      cleanup(){disposed=true;if(raf)cancelAnimationFrame(raf);film?.cleanup();observer.disconnect();intersection.disconnect();toggle?.removeEventListener('click',onToggle);reduced.removeEventListener('change',onReduced);document.removeEventListener('visibilitychange',onVisibility);delete canvas.__signalAnimation;}
    };
    canvas.__signalAnimation=controller;resize();sync();return controller;
  };
})();
