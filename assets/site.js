// ── REGION CONFIG ────────────────────────────────
// One site, two states. Everything that differs between Oregon and California
// lives here — change a value once and it updates everywhere on the site.
//
// TODO (waiting on Chris): the California city and phone line don't exist yet,
// so `ca` currently reuses the Oregon number and a state-only location. Swap in
// the real values here the moment he has them — nothing else needs touching.
const REGIONS = {
  or: {
    label: 'Oregon',
    built: 'Oregon Built',
    city: 'Coos Bay, Oregon',
    heroTitle: "PNW'S PREMIER<br><em>WRAP STUDIO</em>",
    phone: '(503) 949-0023',
    tel: '5039490023'
  },
  ca: {
    label: 'California',
    built: 'California Built',
    city: 'California',
    heroTitle: "CALIFORNIA'S PREMIER<br><em>WRAP STUDIO</em>",
    phone: '(503) 949-0023',
    tel: '5039490023'
  }
};

const REGION_KEY = 'pnw-region';

function readRegion() {
  try {
    const r = localStorage.getItem(REGION_KEY);
    return REGIONS[r] ? r : null;
  } catch (e) { return null; }
}

function saveRegion(r) {
  try { localStorage.setItem(REGION_KEY, r); } catch (e) {}
}

// Fills every [data-region="..."] hook on the page from the config above.
function applyRegion(key) {
  const cfg = REGIONS[key];
  if (!cfg) return;
  document.documentElement.setAttribute('data-region', key);

  document.querySelectorAll('[data-region]').forEach(el => {
    const field = el.getAttribute('data-region');
    if (field === 'phone') {
      el.childNodes.forEach(n => { if (n.nodeType === 3) n.remove(); });
      el.appendChild(document.createTextNode(cfg.phone));
      if (el.tagName === 'A') el.setAttribute('href', 'tel:' + cfg.tel);
    } else if (field === 'hero-title') {
      el.innerHTML = cfg.heroTitle;
    } else if (cfg[field] !== undefined) {
      el.textContent = cfg[field];
    }
  });

  document.querySelectorAll('.rsw b').forEach(b => { b.textContent = cfg.label; });
}

// ── OVERLAY PLUMBING ─────────────────────────────
const logoEl = document.querySelector('.top-logo img');
const logoSrc = logoEl ? logoEl.getAttribute('src') : 'images/logo-full.png';

function openOverlay(node) {
  document.body.appendChild(node);
  document.body.classList.add('ov-open');
  requestAnimationFrame(() => node.classList.add('in'));
}

function closeOverlay(node) {
  node.classList.remove('in');
  document.body.classList.remove('ov-open');
  setTimeout(() => node.remove(), 320);
}

// ── REGION GATE ──────────────────────────────────
// Required on a first visit: Chris wants people to pick a state before they
// can browse. The choice is remembered, so it only ever asks once.
function showRegionGate(forced) {
  const ov = document.createElement('div');
  ov.className = 'ov';
  ov.innerHTML =
    '<div class="rg-card">' +
      '<img src="' + logoSrc + '" alt="Pacific North Wraps"/>' +
      '<p class="rg-eyebrow">Two States, One Shop</p>' +
      '<h2 class="rg-h">WHERE ARE WE <em>WRAPPING?</em></h2>' +
      '<p class="rg-sub">Pick your state and we\'ll show you the right location, hours, and direct line.</p>' +
      '<div class="rg-opts">' +
        '<button class="rg-opt" data-pick="or"><span class="rg-opt-name">OREGON</span><span class="rg-opt-sub">Coos Bay</span></button>' +
        '<button class="rg-opt" data-pick="ca"><span class="rg-opt-name">CALIFORNIA</span><span class="rg-opt-sub">Now Booking</span></button>' +
      '</div>' +
    '</div>';

  ov.querySelectorAll('.rg-opt').forEach(btn => {
    btn.addEventListener('click', () => {
      const pick = btn.getAttribute('data-pick');
      saveRegion(pick);
      applyRegion(pick);
      closeOverlay(ov);
    });
  });

  // Re-opened from the footer switcher, so it's dismissable; on a first visit
  // there is nothing to fall back to, so it isn't.
  if (forced) {
    ov.addEventListener('click', e => { if (e.target === ov) closeOverlay(ov); });
  }

  openOverlay(ov);
}

// ── QUOTE MODAL ──────────────────────────────────
// MOCKUP ONLY. Submissions are intercepted and show a preview confirmation.
// When the site moves to Netlify, add `data-netlify="true"` plus a matching
// hidden static form so Netlify can detect it, and drop the submit handler.
const MAKES = ['Acura','Audi','BMW','Buick','Cadillac','Chevrolet','Chrysler','Dodge','Ford','Genesis','GMC','Honda','Hyundai','Infiniti','Jeep','Kia','Land Rover','Lexus','Lincoln','Mazda','Mercedes-Benz','Nissan','Porsche','Ram','Subaru','Tesla','Toyota','Volkswagen','Volvo'];

function yearOptions() {
  const now = new Date().getFullYear() + 1;
  let out = '<option value="">Select</option>';
  for (let y = now; y >= 1985; y--) out += '<option>' + y + '</option>';
  return out;
}

function showQuoteModal() {
  const ov = document.createElement('div');
  ov.className = 'ov';
  ov.innerHTML =
    '<div class="qm-card">' +
      '<div class="qm-head">' +
        '<h3 class="qm-h">REQUEST A <em>QUOTE</em></h3>' +
        '<button class="qm-x" aria-label="Close">&times;</button>' +
      '</div>' +
      '<p class="qm-sub">Tell us what you\'re driving and what you\'re after. Most quotes come back the same day.</p>' +
      '<form class="qm-form" name="quote">' +
        '<div class="qm-field"><label>First Name <span class="req">*</span></label><input name="first" required/></div>' +
        '<div class="qm-field"><label>Last Name <span class="req">*</span></label><input name="last" required/></div>' +
        '<div class="qm-field"><label>Email <span class="req">*</span></label><input type="email" name="email" required/></div>' +
        '<div class="qm-field"><label>Phone</label><input type="tel" name="phone"/></div>' +
        '<div class="qm-field"><label>Year</label><select name="year">' + yearOptions() + '</select></div>' +
        '<div class="qm-field"><label>Make</label><input name="make" list="qm-makes"/>' +
          '<datalist id="qm-makes">' + MAKES.map(m => '<option>' + m + '</option>').join('') + '</datalist></div>' +
        '<div class="qm-field"><label>Model</label><input name="model"/></div>' +
        '<div class="qm-field"><label>Current Color</label><input name="color"/></div>' +
        '<div class="qm-field wide"><label>What are you after? <span class="req">*</span></label><select name="service" required>' +
          '<option value="">Select a service</option><option>Vinyl Wrap</option><option>PPF</option><option>Ceramic Coating</option><option>More than one</option><option>Not sure yet</option>' +
        '</select></div>' +
        '<div class="qm-field wide"><label>Details</label><textarea name="details" placeholder="Finish, coverage, timing — whatever helps us price it."></textarea></div>' +
        '<div class="qm-actions"><button type="submit" class="btn-primary">Send Request</button></div>' +
        '<p class="qm-note">Prefer to talk it through? Call <a href="tel:5039490023" data-region="phone" style="color:var(--orange)">(503) 949-0023</a>.</p>' +
      '</form>' +
    '</div>';

  const card = ov.querySelector('.qm-card');
  ov.querySelector('.qm-x').addEventListener('click', () => closeOverlay(ov));
  ov.addEventListener('click', e => { if (e.target === ov) closeOverlay(ov); });

  ov.querySelector('.qm-form').addEventListener('submit', e => {
    e.preventDefault();
    card.innerHTML =
      '<div class="qm-done">' +
        '<div class="qm-done-mark">&#10003;</div>' +
        '<h4>LOOKS GOOD</h4>' +
        '<p>This is a preview of the quote form &mdash; live submissions switch on when the site launches.</p>' +
        '<button class="btn-primary" type="button">Close</button>' +
      '</div>';
    card.querySelector('button').addEventListener('click', () => closeOverlay(ov));
  });

  openOverlay(ov);
  applyRegion(readRegion() || 'or');
}

// ── BOOT ─────────────────────────────────────────
const saved = readRegion();
applyRegion(saved || 'or');
if (!saved) showRegionGate(false);

// nav switcher, so a wrong pick isn't permanent
const navHost = document.querySelector('.top-nav');
if (navHost) {
  const btn = document.createElement('button');
  btn.className = 'rsw';
  btn.type = 'button';
  btn.innerHTML = '<span class="rsw-lbl">Viewing:</span> <b>' + REGIONS[saved || 'or'].label + '</b>';
  btn.addEventListener('click', () => showRegionGate(true));
  navHost.insertBefore(btn, navHost.querySelector('.top-burger'));
}

document.querySelectorAll('[data-quote]').forEach(el => {
  el.addEventListener('click', e => { e.preventDefault(); showQuoteModal(); });
});

document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  const ov = document.querySelector('.ov');
  if (ov && ov.querySelector('.qm-card')) closeOverlay(ov);
});

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
