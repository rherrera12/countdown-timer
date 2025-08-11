(function () {
  function pad2(n) { return String(Math.max(0, Math.floor(n))).padStart(2, '0'); }

  function setDigits(el, val) {
    const s = String(val).padStart(2, '0');
    const spans = el.querySelectorAll('span');
    if (spans[0].textContent !== s[0]) { spans[0].textContent = s[0]; el.classList.add('pf-flip'); }
    if (spans[1].textContent !== s[1]) { spans[1].textContent = s[1]; el.classList.add('pf-flip'); }
    setTimeout(() => el.classList.remove('pf-flip'), 260);
  }

  function buildSlot(label, id) {
    const slot = document.createElement('div'); slot.className = 'pf-countdown-slot';
    const digits = document.createElement('div'); digits.className = 'pf-countdown-digits'; digits.id = id;
    digits.innerHTML = '<span>0</span><span>0</span>';
    const lab = document.createElement('div'); lab.className = 'pf-countdown-label'; lab.textContent = label;
    slot.appendChild(digits); slot.appendChild(lab);
    return slot;
  }

  function initOne(root) {
    const end = root.dataset.end;                        // ISO 8601 with timezone recommended
    const theme = (root.dataset.theme || 'dark').toLowerCase();
    const headline = root.dataset.headline || 'Offer Ends Soon!';
    const sub = root.dataset.sub || '';
    const showCta = root.dataset.link === 'true';        // default: not clickable
    const url = root.dataset.url || '#';
    const widthAttr = (root.dataset.width || '').trim(); // 'auto' or px/%/vw

    let endMs = Date.parse(end);
    if (Number.isNaN(endMs)) {
      const maybe = new Date(end);
      if (!isNaN(maybe)) endMs = maybe.getTime();
    }

    // Build DOM
    const wrap = document.createElement('div'); wrap.className = 'pf-countdown-wrap ' + (theme === 'light' ? 'pf-countdown--light' : 'pf-countdown--dark');

    if (headline) {
      const h = document.createElement('div');
      h.className = 'pf-countdown-headline'; // kept for potential future styling
      h.style.cssText = 'font-weight:800;font-size:28px;line-height:1.1;';
      h.textContent = headline;
      wrap.appendChild(h);
    }

    if (sub) {
      const p = document.createElement('div');
      p.className = 'pf-countdown-sub';
      p.style.cssText = 'color:#6b7280;font-weight:600;';
      p.textContent = sub;
      wrap.appendChild(p);
    }

    const panel = document.createElement('div'); panel.className = 'pf-countdown-panel';

    // Width handling: if data-width provided and not 'auto', respect it; else CSS controls fluid width
    if (widthAttr && widthAttr.toLowerCase() !== 'auto') {
      panel.style.width = /px|%|vw$/.test(widthAttr) ? widthAttr : `${parseInt(widthAttr, 10)}px`;
    }

    const timer = document.createElement('div'); timer.className = 'pf-countdown-timer';
    const dd = buildSlot('DAYS', 'pf-dd');
    const hh = buildSlot('HOURS', 'pf-hh');
    const mm = buildSlot('MINUTES', 'pf-mm');
    const ss = buildSlot('SECONDS', 'pf-ss');

    function sep() { const s = document.createElement('div'); s.className = 'pf-countdown-sep'; s.textContent = ':'; return s; }

    timer.appendChild(dd); timer.appendChild(sep());
    timer.appendChild(hh); timer.appendChild(sep());
    timer.appendChild(mm); timer.appendChild(sep());
    timer.appendChild(ss);

    panel.appendChild(timer);

    if (showCta && url && url !== '#') {
      const a = document.createElement('a'); a.href = url; a.className = 'pf-countdown-cta'; a.textContent = 'Join Now';
      panel.appendChild(a);
    }

    wrap.appendChild(panel);
    root.innerHTML = '';
    root.appendChild(wrap);

    // Ticking logic
    const elDD = dd.querySelector('.pf-countdown-digits');
    const elHH = hh.querySelector('.pf-countdown-digits');
    const elMM = mm.querySelector('.pf-countdown-digits');
    const elSS = ss.querySelector('.pf-countdown-digits');

    function tick() {
      const now = Date.now();
      let diff = endMs - now;

      if (diff <= 0) {
        setDigits(elDD, 0); setDigits(elHH, 0); setDigits(elMM, 0); setDigits(elSS, 0);
        return; // stop visual updates; interval cleared just below
      }

      const d = Math.floor(diff / 86400000); diff -= d * 86400000;
      const h = Math.floor(diff / 3600000);  diff -= h * 3600000;
      const m = Math.floor(diff / 60000);    diff -= m * 60000;
      const s = Math.floor(diff / 1000);

      // Expand days to 3 digits if >99
      if (d > 99 && elDD.children.length === 2) elDD.innerHTML = '<span>0</span><span>0</span><span>0</span>';
      const dayStr = String(d).padStart(elDD.children.length, '0');
      [...elDD.children].forEach((sp, i) => {
        if (sp.textContent !== dayStr[i]) { sp.textContent = dayStr[i]; elDD.classList.add('pf-flip'); }
      });
      setTimeout(() => elDD.classList.remove('pf-flip'), 260);

      setDigits(elHH, h);
      setDigits(elMM, m);
      setDigits(elSS, s);
    }

    tick();
    const iv = setInterval(() => {
      tick();
      if (Date.now() >= endMs) clearInterval(iv);
    }, 1000);
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-countdown="pf"]').forEach(initOne);
  });
})();
