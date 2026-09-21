// ── REGION CONFIG ────────────────────────────────
// One site, two states. Everything that differs between Oregon and California
// lives here — change a value once and it updates everywhere on the site.
//
// TODO (waiting on Chris): the California city still doesn't exist, so `ca`
// falls back to a state-only location. The CA direct line is live as of his
// Sept 9 notes — drop the city in here the moment he has it.
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
    phone: '(949) 480-7656',
    tel: '9494807656'
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

  // Copy that only applies to one state — e.g. the Northwest-roads paragraph
  // on the PPF page, which Chris wants hidden on the California side.
  document.querySelectorAll('[data-region-only]').forEach(el => {
    const only = el.getAttribute('data-region-only').split(/\s+/);
    el.hidden = only.indexOf(key) === -1;
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
// The photo field needs enctype="multipart/form-data" on the form for uploads
// to actually come through — Netlify caps file uploads at 8MB per submission.
const MAKES = ['Acura','Audi','BMW','Buick','Cadillac','Chevrolet','Chrysler','Dodge','Ford','Genesis','GMC','Honda','Hyundai','Infiniti','Jeep','Kia','Land Rover','Lexus','Lincoln','Mazda','Mercedes-Benz','Nissan','Porsche','Ram','Subaru','Tesla','Toyota','Volkswagen','Volvo'];

function yearOptions() {
  const now = new Date().getFullYear() + 1;
  let out = '<option value="">Select</option>';
  for (let y = now; y >= 1985; y--) out += '<option>' + y + '</option>';
  return out;
}

// `preset` is the service name to preselect — passed by the Request a Quote
// button on each service page so people don't re-pick what they just clicked.
function showQuoteModal(preset) {
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
          '<option value="">Select a service</option><option>Vinyl Wrap</option><option>PPF</option><option>Ceramic Coating</option><option>More than one</option>' +
        '</select></div>' +
        '<div class="qm-field wide"><label>Details</label><textarea name="details" placeholder="Finish, coverage, timing — whatever helps us price it."></textarea></div>' +
        '<div class="qm-field wide"><label>Photos</label>' +
          '<label class="qm-file">' +
            '<input type="file" name="photos" accept="image/*" multiple/>' +
            '<span class="qm-file-btn">Choose Photos</span>' +
            '<span class="qm-file-name">Or take one now — helps us quote faster.</span>' +
          '</label></div>' +
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

  // Show what's been picked — a bare file input says nothing useful on a phone.
  const fileInput = ov.querySelector('.qm-file input');
  const fileName = ov.querySelector('.qm-file-name');
  fileInput.addEventListener('change', () => {
    const n = fileInput.files.length;
    fileName.textContent = n === 0 ? 'Or take one now — helps us quote faster.'
      : n === 1 ? fileInput.files[0].name
      : n + ' photos selected';
  });

  if (preset) {
    const sel = ov.querySelector('select[name="service"]');
    const match = Array.prototype.find.call(sel.options, o => o.value === preset || o.text === preset);
    if (match) sel.value = match.value || match.text;
  }

  openOverlay(ov);
  applyRegion(readRegion() || 'or');
}

// ── GALLERY LIGHTBOX ─────────────────────────────
// One card per build on gallery.html; clicking it opens that car's set.
// Paths resolve from the nav logo so this works from any folder depth.
const ASSET_BASE = logoSrc.indexOf('../') === 0 ? '../' : '';

const GALLERY_SETS = {
  civic: {
    name: 'Honda Civic',
    sub: 'Gloss White Color Change',
    cover: 'civic-05-after.jpg',
    photos: [
      ['civic-01-before.jpg', 'Factory black, before we started'],
      ['civic-02-before-rear.jpg', 'Original paint, rear three-quarter'],
      ['civic-03-progress.jpg', 'Mid-wrap — rear quarter and bumper laid in'],
      ['civic-04-progress-bay.jpg', 'Roof and glass panel going on in the bay'],
      ['civic-05-after.jpg', 'Finished in gloss white'],
      ['civic-06-after-rear.jpg', 'Every edge tucked, back on the road']
    ]
  },
  z4: {
    name: 'BMW Z4 M40i',
    sub: 'Gloss Purple Color Change',
    photos: [
      ['z4-01-front.jpg', 'Finished and ready for pickup'],
      ['z4-02-detail.jpg', 'Front quarter — colour shifting in the light'],
      ['z4-03-rear.jpg', 'Rear three-quarter at golden hour'],
      ['z4-04-progress.jpg', 'Deck lid open, working the rear panels'],
      ['z4-05-progress-bay.jpg', 'In the bay, panels apart']
    ]
  },
  s8: {
    name: '2003 Audi S8',
    sub: 'Gloss Purple Color Change',
    photos: [
      ['s8-01-front.jpg', 'Finished front three-quarter'],
      ['s8-02-profile.jpg', 'Full profile in the sun'],
      ['s8-03-rear.jpg', 'Rear three-quarter']
    ]
  }
};

function showLightbox(key, start) {
  const set = GALLERY_SETS[key];
  if (!set) return;
  let i = start || 0;

  const ov = document.createElement('div');
  ov.className = 'ov';
  ov.innerHTML =
    '<div class="lb-card">' +
      '<div class="lb-head">' +
        '<h3 class="lb-title">' + set.name + '<span>' + set.sub + '</span></h3>' +
        '<button class="lb-x" aria-label="Close">&times;</button>' +
      '</div>' +
      '<div class="lb-stage">' +
        '<button class="lb-nav lb-prev" aria-label="Previous">&#8249;</button>' +
        '<img alt=""/>' +
        '<button class="lb-nav lb-next" aria-label="Next">&#8250;</button>' +
      '</div>' +
      '<div class="lb-foot">' +
        '<p class="lb-cap"></p>' +
        '<p class="lb-count"></p>' +
      '</div>' +
      '<div class="lb-thumbs"></div>' +
    '</div>';

  const img = ov.querySelector('.lb-stage img');
  const cap = ov.querySelector('.lb-cap');
  const count = ov.querySelector('.lb-count');
  const thumbs = ov.querySelector('.lb-thumbs');

  set.photos.forEach(function (ph, n) {
    const t = document.createElement('button');
    t.className = 'lb-thumb';
    t.style.backgroundImage = 'url("' + ASSET_BASE + 'images/gallery/' + ph[0] + '")';
    t.setAttribute('aria-label', 'Photo ' + (n + 1));
    t.addEventListener('click', function () { i = n; render(); });
    thumbs.appendChild(t);
  });

  function render() {
    const ph = set.photos[i];
    img.src = ASSET_BASE + 'images/gallery/' + ph[0];
    img.alt = set.name + ' — ' + ph[1];
    cap.textContent = ph[1];
    count.textContent = (i + 1) + ' / ' + set.photos.length;
    Array.prototype.forEach.call(thumbs.children, function (t, n) {
      t.classList.toggle('on', n === i);
    });
  }
  function step(d) { i = (i + d + set.photos.length) % set.photos.length; render(); }

  ov.querySelector('.lb-prev').addEventListener('click', function () { step(-1); });
  ov.querySelector('.lb-next').addEventListener('click', function () { step(1); });
  ov.querySelector('.lb-x').addEventListener('click', function () { closeOverlay(ov); });
  ov.addEventListener('click', function (e) { if (e.target === ov) closeOverlay(ov); });

  ov.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'ArrowRight') step(1);
  });

  // preload the neighbours so paging doesn't flash
  set.photos.forEach(function (ph) { new Image().src = ASSET_BASE + 'images/gallery/' + ph[0]; });

  render();
  openOverlay(ov);
  ov.setAttribute('tabindex', '-1');
  ov.focus();
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


// gallery cards: cover art comes from the first photo in each set
document.querySelectorAll('.gal-item[data-set]').forEach(el => {
  const key = el.getAttribute('data-set');
  const set = GALLERY_SETS[key];
  if (!set) return;
  const bg = el.querySelector('.gal-bg');
  if (bg) bg.style.backgroundImage = 'url("' + ASSET_BASE + 'images/gallery/' + (set.cover || set.photos[0][0]) + '")';
  el.addEventListener('click', () => showLightbox(key, 0));
});

document.querySelectorAll('[data-quote]').forEach(el => {
  el.addEventListener('click', e => {
    e.preventDefault();
    showQuoteModal(el.getAttribute('data-service'));
  });
});

document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  const ov = document.querySelector('.ov');
  if (ov && (ov.querySelector('.qm-card') || ov.querySelector('.lb-card'))) closeOverlay(ov);
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
