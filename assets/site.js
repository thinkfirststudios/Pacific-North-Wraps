// ── CURSOR ──────────────────────────────────────
const cur = document.getElementById('cur');
const ring = document.getElementById('cur-ring');
let mx=0,my=0,rx=0,ry=0;
if(cur && window.matchMedia('(pointer:fine)').matches){
  document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;cur.style.left=mx+'px';cur.style.top=my+'px'});
  (function raf(){rx+=(mx-rx)*.13;ry+=(my-ry)*.13;ring.style.left=rx+'px';ring.style.top=ry+'px';requestAnimationFrame(raf)})();
  document.querySelectorAll('a,button,.svc-card,.rev-card,.gal-item,.trust-card,.top-link,.kcard,.krev-card').forEach(el=>{
    el.addEventListener('mouseenter',()=>{cur.classList.add('big');ring.classList.add('big')});
    el.addEventListener('mouseleave',()=>{cur.classList.remove('big');ring.classList.remove('big')});
  });
}

// ── TOP NAV ──────────────────────────────────────
const topNav = document.querySelector('.top-nav');
const topLinks = document.querySelector('.top-links');
const topBurger = document.querySelector('.top-burger');

// Scroll: add .scrolled class after 40px
if(topNav){
  window.addEventListener('scroll',()=>{
    topNav.classList.toggle('scrolled', scrollY > 40);
  },{passive:true});
}

// Mobile burger toggle
if(topBurger && topLinks){
  topBurger.addEventListener('click',()=>{
    topLinks.classList.toggle('open');
    topBurger.classList.toggle('open');
  });
}

// Mobile: tap Services top-link to expand dropdown
document.querySelectorAll('.top-item.has-sub > .top-link').forEach(link=>{
  link.addEventListener('click',e=>{
    if(window.innerWidth <= 900){
      e.preventDefault();
      link.parentElement.classList.toggle('open');
    }
  });
});

// Close mobile menu when a leaf link is tapped
document.querySelectorAll('.top-sub a, .top-item:not(.has-sub) .top-link[href]').forEach(a=>{
  a.addEventListener('click',()=>{
    if(window.innerWidth <= 900 && topLinks){
      topLinks.classList.remove('open');
      if(topBurger) topBurger.classList.remove('open');
    }
  });
});

// ── SCROLL REVEAL ────────────────────────────────
const io = new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}
  });
},{threshold:0.1});
document.querySelectorAll('.rev,.rev-l,.rev-r').forEach(el=>io.observe(el));
