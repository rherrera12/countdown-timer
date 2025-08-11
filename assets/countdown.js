(function(){
  // ---------- Config: FIXED DEADLINE ----------
  // Oct 1, 2025 @ 00:00 Eastern. Change the timezone suffix if needed.
  var FIXED_END_ISO = "2025-10-01T00:00:00-04:00";
  var endMs = Date.parse(FIXED_END_ISO);
  if (isNaN(endMs)) {
    var tmp = new Date(FIXED_END_ISO);
    if (!isNaN(tmp)) endMs = tmp.getTime();
  }

  // Build a flip digit card
  function makeCard(){
    var card = document.createElement("div"); card.className = "pf-card";
    card.innerHTML = '<div class="pf-top">0</div><div class="pf-bottom">0</div>';
    return card;
  }

  // Ensure a flip group has exactly N cards (digits)
  function ensurePlaces(root, places){
    while (root.children.length < places) root.insertBefore(makeCard(), root.firstChild);
    while (root.children.length > places) root.removeChild(root.firstChild);
  }

  // Flip a single card to a new value if it changed
  function flipTo(card, newVal){
    var top = card.querySelector(".pf-top");
    var bottom = card.querySelector(".pf-bottom");
    var cur = top.textContent;
    newVal = String(newVal);

    if (cur === newVal) return;

    var topFlip = document.createElement("div");
    topFlip.className = "pf-top-flip";
    topFlip.textContent = cur;

    var bottomFlip = document.createElement("div");
    bottomFlip.className = "pf-bottom-flip";
    bottomFlip.textContent = newVal;

    // prepare current faces for end state
    top.textContent = cur;
    bottom.textContent = newVal;

    card.appendChild(topFlip);
    card.appendChild(bottomFlip);

    topFlip.addEventListener("animationend", function(){
      top.textContent = newVal;
      topFlip.remove();
    });
    bottomFlip.addEventListener("animationend", function(){
      bottom.textContent = newVal;
      bottomFlip.remove();
    });
  }

  // Set a multi-digit number string into a flip group
  function setNumber(group, value, places){
    var s = String(value);
    while (s.length < places) s = "0" + s;
    for (var i = 0; i < places; i++){
      flipTo(group.children[i], s[i]);
    }
  }

  // Elements
  var daysRoot  = document.getElementById("pf-days");
  var hoursRoot = document.getElementById("pf-hours");
  var minsRoot  = document.getElementById("pf-mins");
  var secsRoot  = document.getElementById("pf-secs");

  // Initialize fixed places for HH/MM/SS (2 each)
  ensurePlaces(hoursRoot, 2);
  ensurePlaces(minsRoot, 2);
  ensurePlaces(secsRoot, 2);

  // Tick logic
  function tick(){
    var now = Date.now();
    var diff = endMs - now;

    if (diff <= 0){
      ensurePlaces(daysRoot, 2);
      setNumber(daysRoot, 0, 2);
      setNumber(hoursRoot, 0, 2);
      setNumber(minsRoot, 0, 2);
      setNumber(secsRoot, 0, 2);
      return;
    }

    var d = Math.floor(diff / 86400000); diff -= d * 86400000;
    var h = Math.floor(diff / 3600000);  diff -= h * 3600000;
    var m = Math.floor(diff / 60000);    diff -= m * 60000;
    var s = Math.floor(diff / 1000);

    // Days can be 2 or 3 places; keep it tight & centered
    var places = d > 99 ? 3 : 2;
    ensurePlaces(daysRoot, places);

    setNumber(daysRoot,  d, places);
    setNumber(hoursRoot, h, 2);
    setNumber(minsRoot,  m, 2);
    setNumber(secsRoot,  s, 2);
  }

  document.addEventListener("DOMContentLoaded", function(){
    // Prepaint current values, then start
    tick();
    var iv = setInterval(function(){
      tick();
      if (Date.now() >= endMs) clearInterval(iv);
    }, 1000);
  });
})();
