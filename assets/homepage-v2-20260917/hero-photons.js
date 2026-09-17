/* Ambient and cell-emitted light for the local homepage preview. */
(() => {
  const hero = document.querySelector('.hero');
  const film = document.querySelector('.hero-video');
  const canvas = document.getElementById('hero-canvas');
  const ctx = canvas.getContext('2d');
  const reduce = matchMedia('(prefers-reduced-motion:reduce)');
  let width=0, height=0, cell={x:0,y:0,r:0}, particles=[];
  let stopped=reduce.matches, inView=true, request=0, previous=0, elapsed=0;

  function create(emitted, warmStart=false) {
    const life=emitted ? 9+Math.random()*8 : 12+Math.random()*15;
    const age=warmStart ? Math.random()*life : 0;
    const angle=Math.random()*Math.PI*2;
    const speed=emitted ? 9+Math.random()*13 : 2+Math.random()*5;
    const radius=cell.r*(.48+Math.random()*.45);
    const x=emitted ? cell.x+Math.cos(angle)*radius : Math.random()*width;
    const y=emitted ? cell.y+Math.sin(angle)*radius : Math.random()*height;
    const vx=Math.cos(angle)*speed;
    const vy=Math.sin(angle)*speed-2;
    return {emitted,life,age,x:x+vx*age,y:y+vy*age,vx,vy,
      size:emitted ? .7+Math.random()*.65 : .45+Math.random()*.65,
      color:Math.random()<.30 ? '94,205,237' : '216,238,255',
      brightness:emitted ? .46+Math.random()*.35 : .26+Math.random()*.3,
      phase:Math.random()*Math.PI*2,spark:Math.random()<.08};
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
    particles=Array.from({length:mobile?34:80},()=>create(false,true))
      .concat(Array.from({length:mobile?20:42},()=>create(true,true)));
    canvas.dataset.ambient=String(mobile?34:80);
    canvas.dataset.emitted=String(mobile?20:42);
    draw(0);
  }
  function draw(dt) {
    ctx.clearRect(0,0,width,height);
    elapsed+=dt;
    particles.forEach((p,i) => {
      p.age+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;
      if(p.age>=p.life || p.x < -35 || p.x>width+35 || p.y < -35 || p.y>height+35){
        particles[i]=create(p.emitted);return;
      }
      const envelope=Math.pow(Math.sin(Math.PI*p.age/p.life),.85);
      const twinkle=.78+.22*Math.sin(elapsed*.95+p.phase);
      const alpha=p.brightness*envelope*twinkle;
      // Tight halos keep the moving points crisp and avoid clouding the artwork.
      const glow=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.size*5.5);
      glow.addColorStop(0,'rgba('+p.color+','+alpha*.28+')');
      glow.addColorStop(1,'rgba('+p.color+',0)');
      ctx.fillStyle=glow;ctx.beginPath();ctx.arc(p.x,p.y,p.size*5.5,0,Math.PI*2);ctx.fill();
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
  window.addEventListener('helioflux:motion',event=>{stopped=event.detail.paused;sync();});
  document.addEventListener('visibilitychange',sync);
  reduce.addEventListener('change',sync);
  new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;sync();},{threshold:.08}).observe(hero);
  new ResizeObserver(resize).observe(hero);
  resize();sync();
})();
