(function () {
  // Left-pad to 2 chars without String.padStart (older browser safe)
  function lpad2(n) {
    var s = String(Math.max(0, Math.floor(n)));
    return s.length < 2 ? '0' + s : s;
  }

  function setDigits(el, val) {
    var s = lpad2(val);
    var spans = el.querySelectorAll('span');
    if (spans[0].textContent !== s.charAt(0)) { spans[0].textContent = s.charAt(0); el.classList.add('pf-flip'); }
    if (spans[1].textContent !== s.charAt(1)) { spans[1].textContent = s.charAt(1); el.classList.add('pf-flip'); }
    setTimeout(function(){ el.classList.remove('pf-flip'); }, 260);
  }

  function buildSlot(label, id) {
    var slot = document.createElement('div'); slot.className = 'pf-countdown-slot';
    var digits = document.createElement('div'); digits.className = 'pf-countdown-digits'; digits.id = id;
    digits.innerHTML = '<span>0</span><span>0</span>';
    var lab = document.createElement('div'); lab.className = 'pf-countdown-label'; lab.textContent = label;
    slot.appendChild(digits); slot.appendChild(lab);
    return slot;
  }

  function initTightModes(panel, dd) {
    if (!('ResizeObserver' in window)) return; // graceful degrade
    var ro = new ResizeObserver(function(entries){
      for (var i=0; i<entries.length; i++) {
        var w = entries[i].contentRect.width;
        var daysDigits = dd.children.length; // 2 or 3
        // Tight mode triggers: very narrow panel OR 3-digit days on smaller panel
        var tight = (w < 420) || (daysDigits > 2 && w < 520);
        var xtight = (w < 340) || (daysDigits > 2 && w < 420);

        panel.classList.toggle('pf-tight', tight && !xtight);
        panel.classList.toggle('pf-x-tight', xtight);
        if (!tight && !xtight) {
          panel.classList.remove('pf-tight');
          panel.classList.remove('pf-x-tight');
        }
      }
    });
    ro.observe(panel);
  }

  function initOne(root) {
    var end = root.getAttribute('data-end');                 // ISO 8601 w/ timezone recommended
    var theme = (root.getAttribute('data-theme') || 'dark').toLowerCase();
    var headline = root.getAttribute('data-headline') || 'Offer Ends Soon!';
    var sub = root.getAttribute('data-sub') || '';
    var showCta = root.getAttribute('data-link') === 'true'; // default: not clickable
    var url = root.getAttribute('data-url') || '#';
    var widthAttr = (root.getAttribute('data-width') || '').trim(); // 'auto' or px/%/vw

    var endMs = Date.parse(end);
    if (isNaN(endMs)) {
      var maybe = new Date(end);
      if (!isNaN(maybe)) endMs = maybe.getTime();
    }

    // Build DOM
    var wrap = document.createElement('div'); 
    wrap.className = 'pf-countdown-wrap ' + (theme === 'light' ? 'pf-countdown--light' : 'pf-countdown--dark');

    if (headline) {
      var h = document.createElement('div');
      h.className = 'pf-countdown-headline';
      h.setAttribute('style','font-weight:800;font-size:28px;line-height:1.1;');
      h.textContent = headline;
      wrap.appendChild(h);
    }

    if (sub) {
      var p = document.createElement('div');
      p.className = 'pf-countdown-sub';
      p.setAttribute('style','color:#6b7280;font-weight:600;');
      p.textContent = sub;
      wrap.appendChild(p);
    }

    var panel = document.createElement('div'); panel.className = 'pf-countdown-panel';

    // Respect explicit width if provided (px/%/vw). Otherwise CSS handles fluid width.
    if (widthAttr && widthAttr.toLowerCase() !== 'auto') {
      if (/px$|%$|vw$/.test(widthAttr)) {
        panel.style.width = widthAttr;
      } else {
        var px = parseInt(widthAttr, 10);
        if (!isNaN(px) && px > 0) panel.style.width = px + 'px';
      }
    }

    var timer = document.createElement('div'); timer.className = 'pf-countdown-timer';
    var dd = buildSlot('DAYS', 'pf-dd');
    var hh = buildSlot('HOURS', 'pf-hh');
    var mm = buildSlot('MINUTES', 'pf-mm');
    var ss = buildSlot('SECONDS', 'pf-ss');

    function sep() { var s = document.createElement('div'); s.className = 'pf-countdown-sep'; s.textContent = ':'; return s; }

    timer.appendChild(dd); timer.appendChild(sep());
    timer.appendChild(hh); timer.appendChild(sep());
    timer.appendChild(mm); timer.appendChild(sep());
    timer.appendChild(ss);

    panel.appendChild(timer);

    if (showCta && url && url !== '#') {
      var a = document.createElement('a'); a.href = url; a.className = 'pf-countdown-cta'; a.textContent = 'Join Now';
      panel.appendChild(a);
    }

    wrap.appendChild(panel);
    root.innerHTML = '';
    root.appendChild(wrap);

    // Ticking logic
    var elDD = dd.querySelector('.pf-countdown-digits');
    var elHH = hh.querySelector('.pf-countdown-digits');
    var elMM = mm.querySelector('.pf-countdown-digits');
    var elSS = ss.querySelector('.pf-countdown-digits');

    // Auto tight modes (prevents overflow)
    initTightModes(panel, elDD);

    function tick() {
      var now = Date.now();
      var diff = endMs - now;

      if (diff <= 0) {
        setDigits(elDD, 0); setDigits(elHH, 0); setDigits(elMM, 0); setDigits(elSS, 0);
        return; // let interval clear below
      }

      var d = Math.floor(diff / 86400000); diff -= d * 86400000;
      var h = Math.floor(diff / 3600000);  diff -= h * 3600000;
      var m = Math.floor(diff / 60000);    diff -= m * 60000;
      var s = Math.floor(diff / 1000);

      // Expand days to 3 digits if >99
      if (d > 99 && elDD.children.length === 2) elDD.innerHTML = '<span>0</span><span>0</span><span>0</span>';

      // Update day digits
      var dayStr = String(d);
      while (dayStr.length < elDD.children.length) dayStr = '0' + dayStr;
      for (var i = 0; i < elDD.children.length; i++) {
        var sp = elDD.children[i];
        if (sp.textContent !== dayStr.charAt(i)) { sp.textContent = dayStr.charAt(i); elDD.classList.add('pf-flip'); }
      }
      setTimeout(function(){ elDD.classList.remove('pf-flip'); }, 260);

      setDigits(elHH, h);
      setDigits(elMM, m);
      setDigits(elSS, s);
    }

    tick();
    var iv = setInterval(function () {
      tick();
      if (Date.now() >= endMs) clearInterval(iv);
    }, 1000);
  }

  document.addEventListener('DOMContentLoaded', function () {
    var nodes = document.querySelectorAll('[data-countdown="pf"]');
    for (var i = 0; i < nodes.length; i++) initOne(nodes[i]);
  });
})();
