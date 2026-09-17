/* HelioFlux measurement illustration. Paths, timing and scale are illustrative.
   The generated source stays unchanged; localized depth motion is a separate layer. */
(() => {
  'use strict';
  const WIDTH = 1536, HEIGHT = 1024, PERIOD = 18;
  const WINDOW = {x:1036, y:501, rx:25, ry:84};
  // Straight paths in several directions; only a minority enter the optical window.
  const emissions = [
    {from:[681,458], to:[1032,485], start:0, duration:2.8, detected:true},
    {from:[580,225], to:[715,48], start:1, duration:2.1},
    {from:[708,610], to:[943,785], start:2.5, duration:2.3},
    {from:[163,620], to:[30,712], start:3.6, duration:1.8},
    {from:[681,520], to:[1038,548], start:4.8, duration:2.6, detected:true},
    {from:[413,184], to:[402,24], start:6.1, duration:1.8},
    {from:[554,751], to:[700,945], start:7.6, duration:2.2},
    {from:[701,414], to:[957,252], start:9, duration:2.5},
    {from:[697,508], to:[1037,517], start:10.5, duration:2.8, detected:false},
    {from:[175,327], to:[40,174], start:11.8, duration:2},
    {from:[594,745], to:[854,886], start:13, duration:2.5},
    {from:[692,472], to:[1032,453], start:14.7, duration:2.7, detected:true},
    {from:[355,780], to:[290,971], start:16.2, duration:2.3}
  ];
  window.installSignalAnimation = () => {
    const canvas=document.querySelector('#signal-canvas');
    if(!canvas) return null;
    if(canvas.__signalAnimation) return canvas.__signalAnimation;
    const ctx=canvas.getContext('2d',{alpha:true});
    if(!ctx) return null;
    const toggle=document.querySelector('#motion-toggle');
    const reduced=matchMedia('(prefers-reduced-motion: reduce)');
    const film=window.installMeasurementFilm?.();
    let paused=reduced.matches, visible=false, disposed=false, time=1.4, last=0, raf=0;
    const age=(t,start)=>(t-start+PERIOD*2)%PERIOD;
    const drawLight=(x,y,dx,dy,alpha) => {
      ctx.save(); ctx.globalAlpha=alpha;
      const halo=ctx.createRadialGradient(x,y,0,x,y,19);
      halo.addColorStop(0,'rgba(255,248,215,.75)');
      halo.addColorStop(.19,'rgba(242,242,204,.34)');
      halo.addColorStop(1,'rgba(205,232,201,0)');
      ctx.fillStyle=halo; ctx.fillRect(x-19,y-19,38,38);
      const trail=ctx.createLinearGradient(x-dx*25,y-dy*25,x,y);
      trail.addColorStop(0,'rgba(226,239,203,0)');trail.addColorStop(1,'rgba(249,248,224,.88)');
      ctx.strokeStyle=trail;ctx.lineWidth=2;ctx.lineCap='round';
      ctx.beginPath();ctx.moveTo(x-dx*25,y-dy*25);ctx.lineTo(x,y);ctx.stroke();
      ctx.fillStyle='#fffae7';ctx.beginPath();ctx.arc(x,y,2.25,0,Math.PI*2);ctx.fill();
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
          const alpha=Math.min(1,u/.13)*Math.min(1,(1-u)/.1);
          drawLight(e.from[0]+dx*u,e.from[1]+dy*u,dx/length,dy/length,alpha);
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
      if(toggle){toggle.textContent=paused?'Play illustration':'Pause illustration';toggle.setAttribute('aria-pressed',String(paused));}
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
