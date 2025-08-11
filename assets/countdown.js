(function () {
  // helper: left-pad to 2 chars (no padStart for broader support)
  function lpad2(n) {
    var s = String(Math.max(0, Math.floor(n)));
    return s.length < 2 ? '0' + s : s;
  }

  function setTwo(el, val) {
    var s = lpad2(val);
    var spans = el.querySelectorAll('span');
    if (!spans.length) { el.innerHTML = '<span>0</span><span>0</span>'; spans = el.querySelectorAll('span'); }
    if (spans[0].textContent !== s.charAt(0)) spans[0].textContent = s.charAt(0);
    if (spans[1].textContent !== s.charAt(1)) spans[1].textContent = s.charAt(1);
  }

  function setDays(el, d) {
    // support 2 or 3 digits for days, always centered by grid gap
    var need = d > 99 ? 3 : 2;
    if (el.children.length !== need) {
      el.innerHTML = need === 3 ? '<span>0</span><span>0</span><span>0</span>' : '<span>0</span><span>0</span>';
    }
    var s = String(d);
    while (s.length < need) s = '0' + s;
    for (var i = 0; i < need; i++) {
      var sp = el.children[i];
      if (sp.textContent !== s.charAt(i)) sp.textContent = s.charAt(i);
    }
  }

  function init() {
    var daysEl = document.getElementById('cd-days');
    var hoursEl = document.getElementById('cd-hours');
    var minsEl  = document.getElementById('cd-mins');
    var secsEl  = document.getElementById('cd-secs');

    // End time: edit here (ISO with timezone) or wire up from querystring later
    var endStr = document.querySelector('main.cd') ? '2025-12-31T23:59:59-05:00' : null;
    // If needed, you can read from a data attr instead:
    // var endStr = document.body.getAttribute('data-end') || '2025-12-31T23:59:59-05:00';

    var endMs = Date.parse(endStr);
    if (isNaN(endMs)) { var tmp = new Date(endStr); if (!isNaN(tmp)) endMs = tmp.getTime(); }

    function tick() {
      var now = Date.now();
      var diff = endMs - now;

      if (diff <= 0) {
        setDays(daysEl, 0);
        setTwo(hoursEl, 0);
        setTwo(minsEl, 0);
        setTwo(secsEl, 0);
        return;
      }

      var d = Math.floor(diff / 86400000); diff -= d * 86400000;
      var h = Math.floor(diff / 3600000);  diff -= h * 3600000;
      var m = Math.floor(diff / 60000);    diff -= m * 60000;
      var s = Math.floor(diff / 1000);

      setDays(daysEl, d);
      setTwo(hoursEl, h);
      setTwo(minsEl, m);
      setTwo(secsEl, s);
    }

    tick();
    var iv = setInterval(function () {
      tick();
      if (Date.now() >= endMs) clearInterval(iv);
    }, 1000);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
