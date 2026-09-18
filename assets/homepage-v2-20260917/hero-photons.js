/* Ambient and cell-emitted light for the local homepage preview. */
(() => {
  const hero = document.querySelector('.hero');
  const film = document.querySelector('.hero-video');
  const canvas = document.getElementById('hero-canvas');
  const ctx = canvas.getContext('2d');
  const reduce = matchMedia('(prefers-reduced-motion:reduce)');
  let width=0, height=0, cell={x:0,y:0,r:0}, particles=[];
  let stopped=reduce.matches, inView=true, request=0, previous=0, elapsed=0;
  // Pointer response, as on the earlier site: the whole field leans a few pixels with
  // the mouse, nearer specks a little more than far ones. Specks never react singly.
  const finePointer=matchMedia('(hover:hover) and (pointer:fine)');
  const PARALLAX=14;
  const lean={x:0,y:0,tx:0,ty:0};

  function create(emitted, warmStart=false) {
    const life=emitted ? 16+Math.random()*14 : 12+Math.random()*15;
    const age=warmStart ? Math.random()*life : 0;
    const angle=Math.random()*Math.PI*2;
    const speed=emitted ? 3.5+Math.random()*6 : 2+Math.random()*5;
    const radius=cell.r*(.48+Math.random()*.45);
    const x=emitted ? cell.x+Math.cos(angle)*radius : Math.random()*width;
    const y=emitted ? cell.y+Math.sin(angle)*radius : Math.random()*height;
    const vx=Math.cos(angle)*speed;
    const vy=Math.sin(angle)*speed-2;
    return {emitted,life,age,x:x+vx*age,y:y+vy*age,vx,vy,
      size:emitted ? .8+Math.random()*1 : .5+Math.random()*.8,
      // Brand cyan for close to half, as on the earlier site; the rest stay pale.
      color:Math.random()<.45 ? '0,169,214' : '216,238,255',
      glow:Math.random()<.33,
      brightness:emitted ? .5+Math.random()*.38 : .26+Math.random()*.3,
      depth:.35+Math.random()*.65,
      phase:Math.random()*Math.PI*2,spark:Math.random()<.08};
  }
  // The soft navy fade behind the headline used to sit on the text block, above this
  // canvas, so it swallowed every speck on the left. It is painted here instead, as
  // the canvas's own background: still over the cell film, but under the specks.
  const content=hero.querySelector('.hero-content');
  const narrow=matchMedia('(max-width:900px)');
  function placeScrim() {
    const rect=hero.getBoundingClientRect(), box=content.getBoundingClientRect();
    const grow=narrow.matches ? {t:.18,r:.14,b:.20,l:.14} : {t:.22,r:.30,b:.24,l:.16};
    const stops=narrow.matches
      ? 'rgba(15,28,46,.86) 0%,rgba(15,28,46,.7) 40%,rgba(15,28,46,.34) 72%,rgba(15,28,46,0) 100%'
      : 'rgba(15,28,46,.9) 0%,rgba(15,28,46,.78) 38%,rgba(15,28,46,.42) 70%,rgba(15,28,46,0) 100%';
    const shape=narrow.matches ? 'ellipse 66% 60% at 48% 50%' : 'ellipse 64% 60% at 46% 50%';
    const w=box.width*(1+grow.l+grow.r), h=box.height*(1+grow.t+grow.b);
    canvas.style.background='radial-gradient('+shape+','+stops+') '
      +(box.left-rect.left-box.width*grow.l)+'px '+(box.top-rect.top-box.height*grow.t)+'px / '
      +w+'px '+h+'px no-repeat';
    hero.classList.add('hf-scrim-under-specks');
  }
  function resize() {
    const rect=hero.getBoundingClientRect(), box=film.getBoundingClientRect();
    width=rect.width;height=rect.height;
    const dpr=Math.min(devicePixelRatio||1,2);
    canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
    canvas.style.width=width+'px';canvas.style.height=height+'px';
    ctx.setTransform(dpr,0,0,dpr,0,0);
    const diameter=Math.min(box.width,box.height);
    cell={x:box.right-rect.left-diameter/2,y:box.top-rect.top+box.height/2,r:diameter*.485};
    const mobile=width<=768;
    const ambient=mobile?34:80, emitted=mobile?26:64;
    particles=Array.from({length:ambient},()=>create(false,true))
      .concat(Array.from({length:emitted},()=>create(true,true)));
    canvas.dataset.ambient=String(ambient);
    canvas.dataset.emitted=String(emitted);
    placeScrim();
    draw(0);
  }
  function draw(dt) {
    ctx.clearRect(0,0,width,height);
    elapsed+=dt;
    lean.x+=(lean.tx-lean.x)*Math.min(1,dt*3);lean.y+=(lean.ty-lean.y)*Math.min(1,dt*3);
    particles.forEach((q,i) => {
      q.age+=dt;q.x+=q.vx*dt;q.y+=q.vy*dt;
      if(q.age>=q.life || q.x < -35 || q.x>width+35 || q.y < -35 || q.y>height+35){
        particles[i]=create(q.emitted);return;
      }
      const p={x:q.x+lean.x*q.depth,y:q.y+lean.y*q.depth,size:q.size,color:q.color,glow:q.glow,
        brightness:q.brightness,age:q.age,life:q.life,phase:q.phase,spark:q.spark};
      const envelope=Math.pow(Math.sin(Math.PI*p.age/p.life),.85);
      const twinkle=.78+.22*Math.sin(elapsed*.95+p.phase);
      const alpha=p.brightness*envelope*twinkle;
      // Tight halos keep the moving points crisp and avoid clouding the artwork. About a
      // third carry a wider, soft cyan glow, as the earlier site's specks did.
      const reach=p.size*(p.glow?9:5.5);
      const glow=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,reach);
      glow.addColorStop(0,'rgba('+(p.glow?'0,169,214':p.color)+','+alpha*(p.glow?.42:.28)+')');
      glow.addColorStop(1,'rgba('+(p.glow?'0,169,214':p.color)+',0)');
      ctx.fillStyle=glow;ctx.beginPath();ctx.arc(p.x,p.y,reach,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='rgba('+p.color+','+alpha+')';
      ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,Math.PI*2);ctx.fill();
      if(p.spark && alpha>.42) {
        ctx.strokeStyle='rgba('+p.color+','+alpha*.35+')';ctx.lineWidth=.6;
        ctx.beginPath();ctx.moveTo(p.x-p.size*3,p.y);ctx.lineTo(p.x+p.size*3,p.y);
        ctx.moveTo(p.x,p.y-p.size*3);ctx.lineTo(p.x,p.y+p.size*3);ctx.stroke();
      }
    });
    canvas.dataset.motionTime=elapsed.toFixed(3);
  }
  function tick(now) {
    request=0;
    if(stopped||!inView||document.hidden||reduce.matches)return;
    const dt=previous ? Math.min((now-previous)/1000,.05) : 0;
    previous=now;draw(dt);request=requestAnimationFrame(tick);
  }
  function sync() {
    if(request)cancelAnimationFrame(request);
    request=0;previous=0;
    if(!stopped&&inView&&!document.hidden&&!reduce.matches)request=requestAnimationFrame(tick);
  }
  window.addEventListener('mousemove',event=>{
    if(!finePointer.matches)return;
    lean.tx=(event.clientX/innerWidth-.5)*2*PARALLAX;
    lean.ty=(event.clientY/innerHeight-.5)*2*PARALLAX;
  },{passive:true});
  window.addEventListener('helioflux:motion',event=>{stopped=event.detail.paused;sync();});
  document.addEventListener('visibilitychange',sync);
  reduce.addEventListener('change',sync);
  new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;sync();},{threshold:.08}).observe(hero);
  new ResizeObserver(resize).observe(hero);
  new ResizeObserver(placeScrim).observe(content);
  resize();sync();
})();
