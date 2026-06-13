/* GO PREMIUM · EXCLUSIVE — interactions (motion 9/10, refined) */
(function(){
  'use strict';
  const root = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Nav state on scroll ---- */
  const nav = document.getElementById('nav');
  const onScroll = () => {
    if(window.scrollY > 40) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  };
  onScroll();
  window.addEventListener('scroll', onScroll, {passive:true});

  /* ---- Reveal on view ---- */
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, {threshold:0.12, rootMargin:'0px 0px -8% 0px'});
  document.querySelectorAll('.rv, .clip').forEach(el=>{
    // hero items already 'in' (above the fold) keep their class
    if(!el.classList.contains('in')) io.observe(el);
  });

  /* ---- Hero parallax on glows + dotgrid ---- */
  const hero = document.querySelector('.hero');
  const g1 = document.querySelector('.hero .glow-1');
  const g2 = document.querySelector('.hero .glow-2');
  const dg = document.querySelector('.hero .dotgrid');
  if(hero && !reduce){
    let raf=null;
    const para = () => {
      const y = window.scrollY;
      if(y > window.innerHeight) return;
      if(g1) g1.style.transform = `translate3d(0,${y*0.18}px,0)`;
      if(g2) g2.style.transform = `translate3d(0,${y*0.10}px,0)`;
      if(dg) dg.style.transform = `translate3d(0,${y*0.30}px,0)`;
      raf=null;
    };
    window.addEventListener('scroll', ()=>{ if(!raf) raf=requestAnimationFrame(para); }, {passive:true});

    /* pointer parallax */
    hero.addEventListener('pointermove', (e)=>{
      const cx = (e.clientX/window.innerWidth - .5);
      const cy = (e.clientY/window.innerHeight - .5);
      if(g1) g1.style.marginLeft = (cx*40)+'px';
      if(g2) g2.style.marginRight = (-cx*36)+'px';
    });
  }

  /* ---- Magnetic buttons ---- */
  if(!reduce && window.matchMedia('(pointer:fine)').matches){
    document.querySelectorAll('[data-magnetic]').forEach(btn=>{
      const strength = 18;
      btn.addEventListener('pointermove', (e)=>{
        const r = btn.getBoundingClientRect();
        const mx = (e.clientX - r.left - r.width/2)/r.width;
        const my = (e.clientY - r.top - r.height/2)/r.height;
        btn.style.transform = `translate(${mx*strength}px,${my*strength}px)`;
      });
      btn.addEventListener('pointerleave', ()=>{ btn.style.transform=''; });
    });
  }

  /* ---- Tailor-made spine progress ---- */
  const steps = document.getElementById('steps');
  const fill = document.getElementById('stepfill');
  if(steps && fill){
    const upd = () => {
      const r = steps.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = r.height;
      const seen = Math.min(Math.max(vh*0.55 - r.top, 0), total);
      fill.style.setProperty('--prog', (seen/total*100).toFixed(1)+'%');
      fill.style.height = (seen/total*100).toFixed(1)+'%';
    };
    upd();
    window.addEventListener('scroll', upd, {passive:true});
    window.addEventListener('resize', upd);
  }

  /* ---- Sync Precision mode chips with the 9s engrave cycle ---- */
  const modes = document.getElementById('modes');
  if(modes && !reduce){
    const cycle = 9000;
    const laserEl = modes.querySelector('[data-mode="laser"]');
    const uvEl = modes.querySelector('[data-mode="uv"]');
    const t0 = performance.now();
    const tick = () => {
      const p = ((performance.now() - t0) % cycle) / cycle;
      const laser = p < 0.58;
      laserEl.classList.toggle('active', laser);
      uvEl.classList.toggle('active', !laser);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* ---- Smooth anchor offset for sticky nav ---- */
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click', (e)=>{
      const id = a.getAttribute('href');
      if(id.length<2) return;
      const t = document.querySelector(id);
      if(!t) return;
      e.preventDefault();
      const y = t.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({top:y, behavior:'smooth'});
    });
  });
})();
