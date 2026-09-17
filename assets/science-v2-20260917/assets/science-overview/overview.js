(() => {
  'use strict';
  document.documentElement.classList.add('js-overview');
  const button = document.querySelector('#hamburger');
  const menu = document.querySelector('#mobileMenu');
  button.hidden = false;
  const closeMenu = (focus = false) => { menu.hidden = true; button.setAttribute('aria-expanded','false'); button.innerHTML = 'Menu <span aria-hidden="true">＋</span>'; if(focus) button.focus(); };
  button.addEventListener('click', () => { const open=menu.hidden; menu.hidden=!open; button.setAttribute('aria-expanded', String(open)); button.innerHTML=open?'Close <span aria-hidden="true">−</span>':'Menu <span aria-hidden="true">＋</span>'; });
  menu.addEventListener('click', e => { if(e.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!menu.hidden){e.preventDefault();closeMenu(true);}});
  document.addEventListener('click',e=>{if(!menu.hidden&&!menu.contains(e.target)&&!button.contains(e.target))closeMenu();});
  const wide=matchMedia('(min-width:851px)');wide.addEventListener('change',e=>{if(e.matches)closeMenu();});
  const canvas=document.querySelector('#signal-canvas'),poster=document.querySelector('.measurement-poster'),toggle=document.querySelector('#motion-toggle');
  if(window.installSignalAnimation){
    try{canvas.hidden=false; const controller=window.installSignalAnimation(); if(controller){poster.hidden=false;toggle.hidden=false;document.documentElement.dataset.overviewAnimation='ready';}else canvas.hidden=true;}
    catch(error){canvas.hidden=true;poster.hidden=false;console.error('Measurement illustration unavailable',error);}
  }
})();
