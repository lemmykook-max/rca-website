(function(){
  "use strict";
  var KEY = "rca-gf-2026-referat";
  // Adgangskode til referent-tilstand. Skift den ved at erstatte hashen med SHA-256 af "rca-referent-v1:" + ny adgangskode.
  var PW_SALT = "rca-referent-v1:";
  var PW_HASH = "5326b6bb2609b2fd75afe4d020d412d943108a64c573d8b89460867ae2b15f3e";
  var items = Array.prototype.slice.call(document.querySelectorAll("#agenda details.item"));
  if (!items.length) return;

  var POSTS = [
    ["formand","Formand","2029"],["sekretaer","Sekretær","2029"],["kasserer","Kasserer","2030"],
    ["naestformand","Næstformand","2030"],["kommunikation","Kommunikationsansvarlig","2030"],
    ["suppleant1","Suppleant","2027"],["suppleant2","Suppleant","2027"]
  ];
  // Ekstra felter pr. punkt (indeks 0 = punkt 1)
  var EXTRA = {
    0: [["dirigent","Valgt dirigent"],["referent","Valgt referent"],["stem_lokal","Stemmeberettigede i lokalet","number"],["stem_online","Stemmeberettigede online","number"]],
    4: [["k_fuld","Fuldt medlemskab, kr. pr. år","number","460"],["k_studie","Studie-, pensionist- og børnemedlemskab, kr.","number","190"],["k_stoette","Støttemedlemskab, kr.","number","230"],["k_periode","Første betalingsperiode","text","fx kalenderåret 2027"],["k_frist","Betalingsfrist","text","fx 1. februar 2027"]],
    5: POSTS.map(function(p){ return [p[0], p[1] + (p[2] ? " (frem til " + p[2] + ")" : "")]; }),
    6: [["revisor","Valgt revisor"]]
  };

  function load(){ try { return JSON.parse(localStorage.getItem(KEY)) || {meta:{},items:{}}; } catch(e){ return {meta:{},items:{}}; } }
  var state = load();
  state.meta = state.meta || {}; state.items = state.items || {};
  var savedEl = null, t = null;
  function save(){
    clearTimeout(t);
    t = setTimeout(function(){
      try { localStorage.setItem(KEY, JSON.stringify(state)); if (savedEl) savedEl.textContent = "Gemt i denne browser kl. " + new Date().toLocaleTimeString("da-DK",{hour:"2-digit",minute:"2-digit"}); }
      catch(e){ if (savedEl) savedEl.textContent = "Kunne ikke gemme i browseren – eksportér en sikkerhedskopi."; }
    }, 300);
  }
  function esc(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
  function it(i){ return state.items[i] = state.items[i] || {f:{}}; }
  function field(id, label, type, ph, val){
    var tag = type === "area"
      ? '<textarea id="' + id + '" rows="4" placeholder="' + esc(ph || "") + '">' + esc(val) + '</textarea>'
      : '<input id="' + id + '" type="' + (type || "text") + '"' + (type === "number" ? ' min="0" inputmode="numeric"' : "") + ' placeholder="' + esc(ph || "") + '" value="' + esc(val) + '">';
    return '<label class="rf"><span>' + label + '</span>' + tag + '</label>';
  }

  // Referentfelter under hvert punkt
  items.forEach(function(item, i){
    var d = it(i), hasDecision = item.classList.contains("has-decision");
    var html = '<div class="ref-box"><p class="ref-head">Referentens noter · punkt ' + (i + 1) + '</p>';
    if (EXTRA[i]) {
      html += '<div class="rf-grid">' + EXTRA[i].map(function(x){ return field("r" + i + "-" + x[0], x[1], x[2], x[3], d.f[x[0]]); }).join("") + '</div>';
    }
    html += field("r" + i + "-notes", "Drøftelse og kommentarer", "area", "Hvad blev sagt? Skriv kort og sagligt – ingen personlige historier.", d.notes);
    if (hasDecision) {
      html += field("r" + i + "-decision", "Beslutning", "area", "Hvad blev besluttet?", d.decision);
      html += '<div class="rf-grid votes">' + field("r" + i + "-for", "For", "number", "", d.for) + field("r" + i + "-imod", "Imod", "number", "", d.imod) + field("r" + i + "-blank", "Blank / undlod", "number", "", d.blank) + '</div>';
    }
    html += '</div>';
    var wrap = document.createElement("div");
    wrap.className = "ref-only";
    wrap.innerHTML = html;
    var body = item.querySelector(".item-body");
    var toggle = body.querySelector(".done-toggle");
    body.insertBefore(wrap, toggle || null);
    wrap.addEventListener("input", function(e){
      var m = e.target.id.match(/^r(\d+)-(.+)$/); if (!m) return;
      var k = m[2], o = it(+m[1]);
      if (["notes","decision","for","imod","blank"].indexOf(k) > -1) o[k] = e.target.value; else o.f[k] = e.target.value;
      save();
    });
  });

  // Referat-panel
  var panel = document.getElementById("referat");
  var on = false;
  try { on = localStorage.getItem(KEY + "-on") === "1"; } catch(e){}
  savedEl = document.getElementById("ref-saved");
  ["start","slut"].forEach(function(k){
    var el = document.getElementById("ref-" + k);
    el.value = state.meta[k] || "";
    el.addEventListener("input", function(){ state.meta[k] = el.value; save(); });
  });
  var tgl = document.getElementById("ref-toggle");
  var unlocked = false;
  try { unlocked = sessionStorage.getItem(KEY + "-unlocked") === "1"; } catch(e){}
  function setOn(v){
    if (v && !unlocked) v = false;
    on = v; document.body.classList.toggle("ref-on", v);
    tgl.setAttribute("aria-pressed", v);
    tgl.textContent = v ? "Slå referent-tilstand fra" : "Slå referent-tilstand til";
    try { localStorage.setItem(KEY + "-on", v ? "1" : "0"); } catch(e){}
  }
  function setUnlocked(v){
    unlocked = v;
    document.body.classList.toggle("ref-unlocked", v);
    try { if (v) sessionStorage.setItem(KEY + "-unlocked", "1"); else sessionStorage.removeItem(KEY + "-unlocked"); } catch(e){}
    if (!v) setOn(false);
  }
  tgl.addEventListener("click", function(){
    setOn(!on);
    if (on) items.forEach(function(x){ x.open = true; });
  });
  function sha256(str){
    return crypto.subtle.digest("SHA-256", new TextEncoder().encode(str)).then(function(buf){
      return Array.prototype.map.call(new Uint8Array(buf), function(b){ return b.toString(16).padStart(2, "0"); }).join("");
    });
  }
  var form = document.getElementById("ref-lock"), pw = document.getElementById("ref-pw"), msg = document.getElementById("ref-pw-msg"), tries = 0;
  form.addEventListener("submit", function(e){
    e.preventDefault();
    if (!window.crypto || !crypto.subtle) { msg.textContent = "Browseren kan ikke tjekke adgangskoden her. Åbn siden via https."; return; }
    sha256(PW_SALT + pw.value).then(function(h){
      if (h === PW_HASH) { pw.value = ""; msg.textContent = ""; setUnlocked(true); setOn(true); items.forEach(function(x){ x.open = true; }); tgl.focus(); }
      else { tries++; msg.textContent = "Forkert adgangskode."; pw.select(); if (tries >= 5) { form.querySelector("button").disabled = true; setTimeout(function(){ form.querySelector("button").disabled = false; tries = 0; }, 30000); msg.textContent = "For mange forsøg. Prøv igen om 30 sekunder."; } }
    });
  });
  document.getElementById("ref-lockbtn").addEventListener("click", function(){ setUnlocked(false); pw.focus(); });
  setUnlocked(unlocked);
  setOn(on);
  if (on) items.forEach(function(x){ x.open = true; });

  // Generér referat
  function title(item){ return item.querySelector(".sum-title").firstChild.textContent.trim(); }
  function kl(v){ return String(v || "").replace(":", "."); }
  function n(v){ return v === "" || v == null ? null : +v; }
  function build(){
    var f0 = it(0).f, out = [];
    var lok = n(f0.stem_lokal), onl = n(f0.stem_online);
    var head = {
      time: "Søndag den 15. november 2026" + (state.meta.start ? ", kl. " + kl(state.meta.start) + (state.meta.slut ? "–" + kl(state.meta.slut) : "") : ""),
      place: "Fredericiagade 39, 1310 København K, og online via Google Meet",
      dirigent: f0.dirigent || "", referent: f0.referent || "",
      stem: (lok != null || onl != null) ? ((lok || 0) + " i lokalet og " + (onl || 0) + " online, i alt " + ((lok || 0) + (onl || 0))) : ""
    };
    items.forEach(function(item, i){
      var d = it(i), sec = {no: i + 1, title: title(item), lines: [], list: []};
      if (i === 0) {
        if (f0.dirigent) sec.lines.push(f0.dirigent + " blev valgt som dirigent og konstaterede, at generalforsamlingen var lovligt indkaldt.");
        if (f0.referent) sec.lines.push(f0.referent + " blev valgt som referent.");
      }
      if (i === 4) {
        var k = d.f, rows = [];
        if (k.k_fuld) rows.push("Fuldt medlemskab: " + k.k_fuld + " kr. pr. år");
        if (k.k_studie) rows.push("Studie-, pensionist- og børnemedlemskab: " + k.k_studie + " kr. pr. år");
        if (k.k_stoette) rows.push("Støttemedlemskab: " + k.k_stoette + " kr. pr. år");
        if (k.k_periode) rows.push("Første betalingsperiode: " + k.k_periode);
        if (k.k_frist) rows.push("Betalingsfrist: " + k.k_frist);
        if (rows.length) { sec.listTitle = "Vedtagne kontingenter:"; sec.list = rows; }
      }
      if (i === 5) {
        var b = POSTS.filter(function(p){ return d.f[p[0]]; }).map(function(p){ return p[1] + ": " + d.f[p[0]] + (p[2] ? " (frem til den ordinære generalforsamling i " + p[2] + ")" : ""); });
        if (b.length) { sec.listTitle = "Følgende blev valgt:"; sec.list = b; }
      }
      if (i === 6 && d.f.revisor) sec.lines.push(d.f.revisor + " blev valgt som revisor.");
      if (d.notes) sec.notes = d.notes;
      if (d.decision) sec.decision = d.decision;
      var vf = n(d.for), vi = n(d.imod), vb = n(d.blank);
      if (vf != null || vi != null || vb != null) sec.vote = (vf || 0) + " for, " + (vi || 0) + " imod, " + (vb || 0) + " blanke/undlod";
      out.push(sec);
    });
    return {head: head, secs: out};
  }

  function toHTML(r, forFile){
    var h = '<h1>Referat</h1><p class="rp-sub">Stiftende generalforsamling i Ressourcecenter for Adopterede (RCA)</p>' +
      '<p><b>' + esc(r.head.time) + '</b><br>' + esc(r.head.place) + '</p>' +
      '<p>Dirigent: ' + esc(r.head.dirigent || "____________") + '<br>Referent: ' + esc(r.head.referent || "____________") +
      (r.head.stem ? '<br>Fremmødte stemmeberettigede: ' + esc(r.head.stem) : '') + '</p>';
    r.secs.forEach(function(s){
      h += '<h2>' + s.no + '. ' + esc(s.title) + '</h2>';
      s.lines.forEach(function(l){ h += '<p>' + esc(l) + '</p>'; });
      if (s.notes) h += '<p>' + esc(s.notes).replace(/\n/g, "<br>") + '</p>';
      if (s.list.length) h += '<p>' + esc(s.listTitle) + '</p><ul>' + s.list.map(function(x){ return '<li>' + esc(x) + '</li>'; }).join("") + '</ul>';
      if (s.decision) h += '<p><b>Beslutning:</b> ' + esc(s.decision).replace(/\n/g, "<br>") + '</p>';
      if (s.vote) h += '<p><i>Afstemning: ' + esc(s.vote) + '.</i></p>';
      if (!s.lines.length && !s.notes && !s.list.length && !s.decision && !s.vote) h += '<p class="rp-empty">Intet noteret.</p>';
    });
    if (state.meta.slut) h += '<p style="margin-top:18px">Dirigenten hævede generalforsamlingen kl. ' + esc(kl(state.meta.slut)) + '.</p>';
    h += '<table class="rp-sign"><tr><td>______________________________<br>Dirigent' + (r.head.dirigent ? ': ' + esc(r.head.dirigent) : '') + '</td><td>______________________________<br>Referent' + (r.head.referent ? ': ' + esc(r.head.referent) : '') + '</td></tr></table>';
    return h;
  }
  function toText(r){
    var L = ["REFERAT", "Stiftende generalforsamling i Ressourcecenter for Adopterede (RCA)", "", r.head.time, r.head.place, "",
      "Dirigent: " + (r.head.dirigent || "—"), "Referent: " + (r.head.referent || "—")];
    if (r.head.stem) L.push("Fremmødte stemmeberettigede: " + r.head.stem);
    r.secs.forEach(function(s){
      L.push("", s.no + ". " + s.title.toUpperCase());
      s.lines.forEach(function(l){ L.push(l); });
      if (s.notes) L.push(s.notes);
      if (s.list.length) { L.push(s.listTitle); s.list.forEach(function(x){ L.push("- " + x); }); }
      if (s.decision) L.push("Beslutning: " + s.decision);
      if (s.vote) L.push("Afstemning: " + s.vote + ".");
    });
    if (state.meta.slut) L.push("", "Dirigenten hævede generalforsamlingen kl. " + kl(state.meta.slut) + ".");
    L.push("", "Dirigent: ____________________     Referent: ____________________");
    return L.join("\n");
  }

  var preview = document.getElementById("ref-preview");
  function download(name, type, data){
    var a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([data], {type: type}));
    a.download = name; document.body.appendChild(a); a.click();
    setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  var DOC_CSS = 'body{font-family:Calibri,Arial,sans-serif;font-size:11pt;color:#17424d;line-height:1.45}h1{font-family:Georgia,serif;font-size:22pt;margin:0}h2{font-family:Georgia,serif;font-size:13pt;margin:16pt 0 4pt}.rp-sub{font-style:italic;color:#2e6b73}.rp-empty{color:#888}.rp-sign{margin-top:40pt;width:100%}.rp-sign td{width:50%;padding-top:30pt;vertical-align:top}';

  document.getElementById("ref-generate").addEventListener("click", function(){
    preview.innerHTML = toHTML(build());
    preview.hidden = false;
    document.getElementById("ref-actions").hidden = false;
    preview.scrollIntoView({behavior: "smooth", block: "start"});
  });
  document.getElementById("ref-word").addEventListener("click", function(){
    var html = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><title>Referat</title><style>' + DOC_CSS + '</style></head><body>' + toHTML(build()) + '</body></html>';
    download("referat-stiftende-generalforsamling-RCA.doc", "application/msword", "﻿" + html);
  });
  document.getElementById("ref-print").addEventListener("click", function(){
    preview.innerHTML = toHTML(build()); preview.hidden = false;
    document.body.classList.add("print-ref"); window.print();
    setTimeout(function(){ document.body.classList.remove("print-ref"); }, 500);
  });
  document.getElementById("ref-copy").addEventListener("click", function(e){
    var btn = e.currentTarget, txt = toText(build());
    function ok(){ btn.textContent = "Kopieret ✓"; setTimeout(function(){ btn.textContent = "Kopiér som tekst"; }, 2000); }
    if (navigator.clipboard) navigator.clipboard.writeText(txt).then(ok, function(){ download("referat.txt", "text/plain;charset=utf-8", txt); });
    else download("referat.txt", "text/plain;charset=utf-8", txt);
  });
  document.getElementById("ref-export").addEventListener("click", function(){
    download("referat-backup-RCA.json", "application/json", JSON.stringify(state, null, 2));
  });
  document.getElementById("ref-import").addEventListener("change", function(e){
    var file = e.target.files[0]; if (!file) return;
    file.text().then(function(txt){
      try { var s = JSON.parse(txt); if (!s || typeof s !== "object" || !s.items) throw 0; state = s; localStorage.setItem(KEY, JSON.stringify(state)); location.reload(); }
      catch(err){ savedEl.textContent = "Filen kunne ikke læses som en sikkerhedskopi."; }
    });
  });
  var clr = document.getElementById("ref-clear"), armed = false;
  clr.addEventListener("click", function(){
    if (!armed) { armed = true; clr.textContent = "Klik igen for at slette alle noter"; setTimeout(function(){ armed = false; clr.textContent = "Ryd alle noter"; }, 4000); return; }
    try { localStorage.removeItem(KEY); } catch(e){}
    location.reload();
  });
})();
