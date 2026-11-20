(function(){
  "use strict";
  var KEY = "rca-gf-2026-done";
  function load(){ try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch(e){ return []; } }
  function save(v){ try { localStorage.setItem(KEY, JSON.stringify(v)); } catch(e){} }


  // Dagsorden + "Behandlet"
  var items = Array.prototype.slice.call(document.querySelectorAll("#agenda details.item"));
  var done = load();
  document.getElementById("total-count").textContent = items.length;

  items.forEach(function(it, i){
    var label = document.createElement("label");
    label.className = "done-toggle";
    label.innerHTML = '<input type="checkbox"> Markér som behandlet';
    it.querySelector(".item-body").appendChild(label);
    var cb = label.querySelector("input");
    cb.checked = done.indexOf(i) > -1;
    cb.addEventListener("change", function(){ setDone(i, cb.checked); });
  });

  function setDone(i, val){
    done = done.filter(function(x){ return x !== i; });
    if (val) done.push(i);
    save(done); render();
  }
  function render(){
    items.forEach(function(it, i){
      var d = done.indexOf(i) > -1;
      it.classList.toggle("done", d);
      it.querySelector(".item-body .done-toggle input").checked = d;
    });
    document.getElementById("done-count").textContent = done.length;
    if (mmOpen) renderMM();
  }

  // Kalenderfil (.ics)
  document.getElementById("ics").addEventListener("click", function(){
    var ics = [
      "BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//RCA//Generalforsamling//DA","CALSCALE:GREGORIAN",
      "BEGIN:VTIMEZONE","TZID:Europe/Copenhagen",
      "BEGIN:STANDARD","DTSTART:19701025T030000","TZOFFSETFROM:+0200","TZOFFSETTO:+0100","RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU","END:STANDARD",
      "BEGIN:DAYLIGHT","DTSTART:19700329T020000","TZOFFSETFROM:+0100","TZOFFSETTO:+0200","RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU","END:DAYLIGHT",
      "END:VTIMEZONE",
      "BEGIN:VEVENT","UID:rca-stiftende-gf-20261115@rca-website.netlify.app","DTSTAMP:20261101T000000Z",
      "DTSTART;TZID=Europe/Copenhagen:20261115T120000","DTEND;TZID=Europe/Copenhagen:20261115T140000",
      "SUMMARY:Stiftende generalforsamling – RCA",
      "LOCATION:Fredericiagade 39\\, 1310 København K / Google Meet",
      "DESCRIPTION:Online: https://meet.google.com/qkq-qikf-phg\\nDagsorden: https://rca-website.netlify.app/generalforsamling",
      "URL:https://rca-website.netlify.app/generalforsamling",
      "END:VEVENT","END:VCALENDAR"
    ].join("\r\n");
    var a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([ics], {type:"text/calendar;charset=utf-8"}));
    a.download = "rca-stiftende-generalforsamling.ics";
    document.body.appendChild(a); a.click();
    setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); }, 500);
  });

  // Mødetilstand
  var mm = document.getElementById("mm"), cur = 0, mmOpen = false, t0 = null, timer = null, lastFocus = null;
  var dots = document.getElementById("mm-dots");
  items.forEach(function(it, i){
    var b = document.createElement("button");
    b.type = "button";
    b.setAttribute("aria-label", "Gå til punkt " + (i + 1));
    b.addEventListener("click", function(){ cur = i; renderMM(); });
    dots.appendChild(b);
  });

  function renderMM(){
    var it = items[cur];
    var title = it.querySelector(".sum-title").firstChild.textContent.trim();
    document.getElementById("mm-step").textContent = "Punkt " + (cur + 1) + " af " + items.length;
    document.getElementById("mm-title").textContent = title;
    var content = it.querySelector(".content").cloneNode(true);
    content.querySelectorAll("a.btn").forEach(function(a){ a.remove(); });
    var box = document.getElementById("mm-content");
    box.innerHTML = ""; box.appendChild(content);
    var dec = it.getAttribute("data-decision");
    document.getElementById("mm-decision").innerHTML = dec || "";
    document.getElementById("mm-done").checked = done.indexOf(cur) > -1;
    Array.prototype.forEach.call(dots.children, function(b, i){
      b.classList.toggle("done", done.indexOf(i) > -1);
      if (i === cur) b.setAttribute("aria-current", "step"); else b.removeAttribute("aria-current");
    });
    document.getElementById("mm-prev").disabled = cur === 0;
    document.getElementById("mm-next").disabled = cur === items.length - 1;
    document.querySelector(".mm-main").scrollTop = 0;
  }
  function tick(){
    var s = Math.floor((Date.now() - t0) / 1000);
    var h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), sec = s % 60;
    document.getElementById("mm-clock").textContent = (h ? h + ":" : "") + String(m).padStart(2, "0") + ":" + String(sec).padStart(2, "0");
  }
  function openMM(){
    lastFocus = document.activeElement;
    mm.hidden = false; mm.classList.add("open"); mmOpen = true;
    document.body.style.overflow = "hidden";
    if (!t0) t0 = Date.now();
    tick(); timer = setInterval(tick, 1000);
    renderMM();
    document.getElementById("mm-next").focus();
    if (mm.requestFullscreen) { mm.requestFullscreen().catch(function(){}); }
  }
  function closeMM(){
    mm.classList.remove("open"); mm.hidden = true; mmOpen = false;
    document.body.style.overflow = "";
    clearInterval(timer);
    if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(function(){});
    if (lastFocus) lastFocus.focus();
  }
  document.getElementById("start-mode").addEventListener("click", openMM);
  document.getElementById("mm-close").addEventListener("click", closeMM);
  document.getElementById("mm-prev").addEventListener("click", function(){ if (cur > 0) { cur--; renderMM(); } });
  document.getElementById("mm-next").addEventListener("click", function(){ if (cur < items.length - 1) { cur++; renderMM(); } });
  document.getElementById("mm-done").addEventListener("change", function(e){ setDone(cur, e.target.checked); });
  document.addEventListener("fullscreenchange", function(){ if (!document.fullscreenElement && mmOpen) {/* bliv i mødetilstand uden fuldskærm */} });
  document.addEventListener("keydown", function(e){
    if (!mmOpen) return;
    if (e.key === "Escape") { closeMM(); }
    else if (e.key === "ArrowRight" || e.key === "PageDown") { e.preventDefault(); document.getElementById("mm-next").click(); }
    else if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); document.getElementById("mm-prev").click(); }
    else if (e.key === "Tab") {
      var f = mm.querySelectorAll("button:not([disabled]), input, a[href]");
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  render();
})();
