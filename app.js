/* CCNA Daily — app engine */
"use strict";

/* ---------- safe storage (works on GH Pages; in-memory fallback elsewhere) ---------- */
const mem = {};
const store = {
  get(k) { try { return localStorage.getItem(k); } catch (e) { return mem[k] ?? null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch (e) { mem[k] = v; } }
};

/* ---------- dates ---------- */
const pad = n => String(n).padStart(2, "0");
function dstr(d = new Date()) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
function addDays(s, n) { const [y, m, d] = s.split("-").map(Number); return dstr(new Date(y, m - 1, d + n)); }
function daysBetween(a, b) { const [y1,m1,d1]=a.split("-").map(Number),[y2,m2,d2]=b.split("-").map(Number); return Math.round((new Date(y2,m2-1,d2)-new Date(y1,m1-1,d1))/86400000); }
function niceDate(s){ const [y,m,d]=s.split("-").map(Number); return new Date(y,m-1,d).toLocaleDateString(undefined,{month:"short",day:"numeric"}); }

/* ---------- state ---------- */
const KEY = "ccna_daily_v1";
let S = load();
function fresh() {
  return { v: 1, firstDay: dstr(), done: {}, lastDate: null, streak: 0, best: 0,
           srs: [], grad: 0, answered: 0, correct: 0, firstTryPerfects: 0,
           reviewAnswers: 0, maintLast: null, maintCount: 0, exam: null, badges: {}, notifWanted: false, sn: { a: 0, c: 0, st: 0, best: 0 }, activity: {}, pace: 1, font: 1, seen: false };
}
function load() {
  let s = fresh();
  try { const raw = store.get(KEY); if (raw) s = Object.assign(fresh(), JSON.parse(raw)); } catch (e) {}
  if (!s.sn) s.sn = { a: 0, c: 0, st: 0, best: 0 };
  if (!s.activity) s.activity = {};
  if (!Object.keys(s.activity).length)
    for (const id in s.done) { const d = s.done[id].date; s.activity[d] = (s.activity[d] || 0) + 3; }
  if (typeof s.pace !== "number") s.pace = 1;
  if (typeof s.font !== "number") s.font = 1;
  if (typeof s.seen !== "boolean") s.seen = Object.keys(s.done).length > 0;
  return s;
}
function save() { store.set(KEY, JSON.stringify(S)); }
function bumpAct(n = 1) { const t = dstr(); S.activity[t] = (S.activity[t] || 0) + n; }

/* ---------- derived ---------- */
const byId = id => LESSONS.find(l => l.id === id);
function doneCount() { return Object.keys(S.done).length; }
function allDone() { return doneCount() >= LESSONS.length; }
function todaysLesson() { return LESSONS.find(l => !S.done[l.id]) || null; }
function completedToday() {
  const t = dstr();
  if (S.lastDate === t || S.maintLast === t) return true;
  return Object.values(S.done).some(d => d.date === t);
}
function lastLessonDate() {
  let m = null;
  for (const id in S.done) { const d = S.done[id].date; if (!m || d > m) m = d; }
  return m;
}
function isLessonDay() {
  if (allDone()) return false;
  const last = lastLessonDate();
  return !last || daysBetween(last, dstr()) >= S.pace;
}
function dueReviews() { const t = dstr(); return S.srs.filter(x => x.due <= t); }
function domainStats() {
  const out = {};
  for (const k in DOMAINS) out[k] = { total: 0, done: 0 };
  for (const l of LESSONS) { out[l.d].total++; if (S.done[l.id]) out[l.d].done++; }
  return out;
}
function accuracy() { return S.answered ? Math.round(100 * S.correct / S.answered) : null; }

/* ---------- streak ---------- */
function bumpStreak() {
  const t = dstr();
  if (S.lastDate === t) return;
  S.streak = (S.lastDate === addDays(t, -1)) ? S.streak + 1 : 1;
  S.best = Math.max(S.best, S.streak);
  S.lastDate = t;
}
function streakAlive() { const t = dstr(); return S.lastDate === t || S.lastDate === addDays(t, -1); }
function shownStreak() { return streakAlive() ? S.streak : 0; }

/* ---------- badges ---------- */
const BADGES = [
  { id: "first",   icon: "▶", name: "Link Up",        desc: "Complete lesson 1", test: () => doneCount() >= 1 },
  { id: "week",    icon: "🔥", name: "7-Day Streak",   desc: "Study 7 days straight", test: () => S.best >= 7 },
  { id: "month",   icon: "⚡", name: "30-Day Streak",  desc: "Study 30 days straight", test: () => S.best >= 30 },
  { id: "l15",     icon: "◔", name: "Quarter Way",    desc: "15 lessons done", test: () => doneCount() >= 15 },
  { id: "l30",     icon: "◑", name: "Halfway",        desc: "30 lessons done", test: () => doneCount() >= 30 },
  { id: "l60",     icon: "★", name: "Full Table",     desc: "All 60 lessons done", test: () => doneCount() >= 60 },
  { id: "fund",    icon: "F", name: "Fundamentals",   desc: "Finish the FUND domain", test: () => domDone("fund") },
  { id: "acc",     icon: "A", name: "Network Access", desc: "Finish the ACCESS domain", test: () => domDone("acc") },
  { id: "ip",      icon: "R", name: "Routing Ace",    desc: "Finish the IP CONN domain", test: () => domDone("ip") },
  { id: "svc",     icon: "S", name: "Services",       desc: "Finish the SERVICES domain", test: () => domDone("svc") },
  { id: "sec",     icon: "🛡", name: "Hardened",       desc: "Finish the SECURITY domain", test: () => domDone("sec") },
  { id: "auto",    icon: "⌁", name: "Automated",      desc: "Finish the AUTO domain", test: () => domDone("auto") },
  { id: "sharp",   icon: "◎", name: "First-Try 10",   desc: "10 quizzes perfect on try 1", test: () => S.firstTryPerfects >= 10 },
  { id: "rev25",   icon: "↻", name: "Reviewer",       desc: "Answer 25 review questions", test: () => S.reviewAnswers >= 25 },
  { id: "grad10",  icon: "✓", name: "Long-Term",      desc: "Graduate 10 review cards", test: () => S.grad >= 10 },
  { id: "maint7",  icon: "∞", name: "Maintainer",     desc: "7 maintenance drills after day 60", test: () => S.maintCount >= 7 },
  { id: "sn25",    icon: "◱", name: "Subnet Slayer",  desc: "25 correct subnet answers", test: () => S.sn.c >= 25 },
  { id: "snrun10", icon: "⌁", name: "Block Party",    desc: "10 subnet answers in a row", test: () => S.sn.best >= 10 }
];
function domDone(d) { const s = domainStats()[d]; return s.done >= s.total; }
function checkBadges() {
  const won = [];
  for (const b of BADGES) if (!S.badges[b.id] && b.test()) { S.badges[b.id] = dstr(); won.push(b); }
  if (won.length) { save(); won.forEach((b, i) => setTimeout(() => toast(b.icon + " Badge earned: " + b.name), 600 + i * 1400)); }
}

/* ---------- tiny dom helpers ---------- */
const $ = s => document.querySelector(s);
function esc(t) { return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
function md(t) { return esc(t).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/`([^`]+)`/g, "<code>$1</code>"); }
function toast(msg) {
  const el = $("#toast"); el.textContent = msg; el.classList.add("show");
  clearTimeout(toast._t); toast._t = setTimeout(() => el.classList.remove("show"), 2600);
}

/* ---------- navigation ---------- */
let activeTab = "today";
function showTab(name) {
  activeTab = name;
  document.querySelectorAll(".page").forEach(p => p.classList.toggle("on", p.id === "page-" + name));
  document.querySelectorAll(".tabbar button").forEach(b => b.classList.toggle("on", b.dataset.tab === name));
  closeOverlays();
  render();
  window.scrollTo(0, 0);
}
function closeOverlays() {
  $("#ov-lesson").classList.remove("open");
  $("#ov-quiz").classList.remove("open");
  $("#sheet").classList.remove("open");
  document.body.classList.remove("locked");
}

/* ---------- render: header + today ---------- */
function render() {
  $("#streakpill").innerHTML = "🔥 <b>" + shownStreak() + "</b>";
  $("#streakpill").classList.toggle("dim", shownStreak() === 0);
  renderToday(); renderLibrary(); renderReview(); renderStats(); renderRef();
  updateAppBadge();
}

function renderToday() {
  const el = $("#page-today"); const t = dstr();
  const n = doneCount(); const lesson = todaysLesson(); const doneNow = completedToday();
  let hero = "";

  if (!allDone()) {
    const L = lesson; const D = DOMAINS[L.d];
    const ud = addDays(lastLessonDate() || t, S.pace);
    const dd = Math.max(1, daysBetween(t, ud));
    const unlockTxt = dd <= 1 ? "unlocks tomorrow" : `unlocks in ${dd} days`;
    if (doneNow) {
      hero = `
      <div class="card hero done">
        <div class="eyebrow">day complete · streak ${shownStreak()}</div>
        <h1>Nice work.</h1>
        <div class="meta">Lesson ${pad(L.id)} — “${esc(L.t)}” — ${unlockTxt}. Review is always open.</div>
        <button class="btn ghost" onclick="showTab('review')">Go to review</button>
      </div>`;
    } else if (isLessonDay()) {
      hero = `
      <div class="card hero">
        <div class="eyebrow">day ${pad(L.id)}/60 · ${D.short}</div>
        <h1>${esc(L.t)}</h1>
        <div class="meta">Short read, one step at a time · 3-question check</div>
        <button class="btn primary" onclick="openLesson(${L.id},'daily')">Start today's lesson</button>
      </div>`;
    } else {
      const due = dueReviews().length;
      hero = `
      <div class="card hero">
        <div class="eyebrow">review day · lesson ${pad(L.id)} ${unlockTxt}</div>
        <h1>Review day</h1>
        <div class="meta">Your pace is a new lesson every ${S.pace} days. One quick session keeps the 🔥 streak alive.</div>
        <button class="btn primary" onclick="${due ? "startReviewSession()" : "startQuick5()"}">${due ? "Review " + due + " card" + (due > 1 ? "s" : "") : "Quick quiz"}</button>
      </div>`;
    }
  } else {
    const doneMaint = S.maintLast === t;
    hero = doneMaint ? `
      <div class="card hero done">
        <div class="eyebrow">maintenance mode · streak ${shownStreak()}</div>
        <h1>Drill complete.</h1>
        <div class="meta">All 60 lessons finished. Tomorrow brings a fresh 5-question mixed drill.</div>
      </div>` : `
      <div class="card hero">
        <div class="eyebrow">maintenance mode · all 60 done</div>
        <h1>Daily drill</h1>
        <div class="meta">5 mixed questions from the whole curriculum · pass 4/5 to keep the streak</div>
        <button class="btn primary" onclick="startMaintenance()">Start drill</button>
      </div>`;
  }

  const exam = S.exam ? examChip() : "";
  const due = dueReviews().length;
  const dueChip = due ? `<button class="chip warn" onclick="showTab('review')">↻ ${due} review card${due>1?"s":""} due</button>` : "";

  el.innerHTML = hero +
    `<div class="chiprow">${exam}${dueChip}</div>` +
    `<div class="card">
       <div class="eyebrow">topology · ${n}/60 nodes up</div>
       ${topoSVG()}
     </div>` +
    `<div class="card">
       <div class="eyebrow">show ip interface brief</div>
       ${ifaceTable()}
     </div>`;
}

function examChip() {
  const d = daysBetween(dstr(), S.exam);
  if (d < 0) return `<span class="chip">exam date passed — update in settings</span>`;
  if (d === 0) return `<span class="chip warn">⚑ EXAM DAY. Go get it.</span>`;
  return `<span class="chip">⚑ exam in <b>&nbsp;${d}&nbsp;</b> day${d>1?"s":""}</span>`;
}

/* ---------- signature: topology grid ---------- */
function topoSVG() {
  const cols = 10, rows = 6, gap = 34, r = 6, padd = 16;
  const W = padd * 2 + gap * (cols - 1), H = padd * 2 + gap * (rows - 1);
  const pos = i => {
    const row = Math.floor(i / cols); let col = i % cols;
    if (row % 2 === 1) col = cols - 1 - col;            // serpentine
    return [padd + col * gap, padd + row * gap];
  };
  let path = "";
  for (let i = 0; i < 60; i++) { const [x, y] = pos(i); path += (i ? "L" : "M") + x + " " + y + " "; }
  const n = doneCount(); const todayIdx = allDone() ? -1 : n;
  let nodes = "";
  for (let i = 0; i < 60; i++) {
    const [x, y] = pos(i);
    const st = i < n ? "up" : (i === todayIdx ? "now" : "down");
    const tap = i < n ? `onclick="openLesson(${i + 1},'view')"` : (i === todayIdx && !completedToday() ? `onclick="openLesson(${i + 1},'daily')"` : "");
    nodes += `<g class="node ${st}" ${tap}>
      <circle class="hit" cx="${x}" cy="${y}" r="14"></circle>
      ${st === "now" ? `<circle class="ring" cx="${x}" cy="${y}" r="10"></circle>` : ""}
      <circle class="dot" cx="${x}" cy="${y}" r="${r}"></circle>
    </g>`;
  }
  const donePts = Math.max(0, Math.min(60, n));
  let upPath = "";
  for (let i = 0; i < donePts; i++) { const [x, y] = pos(i); upPath += (i ? "L" : "M") + x + " " + y + " "; }
  return `<svg class="topo" viewBox="0 0 ${W} ${H}" role="img" aria-label="Progress map: ${n} of 60 lessons complete">
    <path class="wire" d="${path}"/>
    ${donePts > 1 ? `<path class="wire up" d="${upPath}"/>` : ""}
    ${nodes}
  </svg>`;
}

function ifaceTable() {
  const ds = domainStats();
  let rows = "";
  for (const k in DOMAINS) {
    const D = DOMAINS[k], s = ds[k];
    const pct = Math.round(100 * s.done / s.total);
    const status = s.done === s.total ? "up/up" : (s.done ? "up" : "down");
    rows += `<div class="ifrow ${status === "up/up" ? "full" : ""}">
      <span class="if">${D.iface}</span>
      <span class="ifname">${D.short}</span>
      <span class="bar"><i style="width:${pct}%"></i></span>
      <span class="cnt">${s.done}/${s.total}</span>
      <span class="st ${status === "down" ? "d" : "u"}">${status}</span>
    </div>`;
  }
  return `<div class="iftable">${rows}</div>`;
}

/* ---------- library ---------- */
function renderLibrary() {
  const el = $("#page-library");
  let html = `<div class="card"><div class="eyebrow">curriculum · tap any completed lesson to reread & practice</div><input class="search" type="search" placeholder="Search 60 lessons…" oninput="libFilter(this.value)" style="margin-top:10px"></div>`;
  for (const k in DOMAINS) {
    const D = DOMAINS[k];
    html += `<div class="dgroup"><div class="dhead"><span class="if">${D.iface}</span> ${D.name}</div><div class="card list">`;
    for (const L of LESSONS.filter(l => l.d === k)) {
      const done = S.done[L.id];
      const isToday = !completedToday() && todaysLesson() && todaysLesson().id === L.id;
      const state = done ? "done" : (isToday ? "now" : "lock");
      const right = done ? `<span class="lstate ok">✓ ${niceDate(done.date)}</span>`
                  : isToday ? `<span class="lstate now">today ▸</span>`
                  : `<span class="lstate lk">day ${pad(L.id)}</span>`;
      const tap = done ? `onclick="openLesson(${L.id},'view')"` : (isToday ? `onclick="openLesson(${L.id},'daily')"` : "");
      html += `<div class="lrow ${state}" data-t="${(pad(L.id) + " " + L.t + " " + D.short).toLowerCase()}" ${tap}><span class="lnum">${pad(L.id)}</span><span class="ltitle">${esc(L.t)}</span>${right}</div>`;
    }
    html += `</div></div>`;
  }
  el.innerHTML = html;
}

/* ---------- lesson view: one small step at a time ---------- */
let ctx = null; // {mode:'daily'|'view', id}
let lsteps = [], lstep = 0;
function buildSteps(L) {
  const s = [];
  s.push({ h: "In plain English", t: L.eli || L.c[0], intro: true });
  L.c.forEach((p, i) => s.push({ h: `The details · part ${i + 1} of ${L.c.length}`, t: p }));
  s.push({ h: "Lock these in", list: L.k });
  if (L.cmd) s.push({ h: "On the console", cmd: L.cmd });
  if (L.use) s.push({ h: "Where you'll actually use this", t: L.use });
  s.push({ h: "Ready check", t: "Three quick questions — get all 3 and " + (ctx && ctx.mode === "daily" ? "today is done." : "you're solid.") });
  return s;
}
function openLesson(id, mode) {
  const L = byId(id); if (!L) return;
  ctx = { mode, id };
  lsteps = buildSteps(L); lstep = 0;
  $("#ov-lesson").classList.add("open");
  document.body.classList.add("locked");
  renderStep();
}
function stepNext() { if (lstep < lsteps.length - 1) { lstep++; renderStep(); } }
function stepBack() { if (lstep > 0) { lstep--; renderStep(); } }
function renderStep() {
  const L = byId(ctx.id), st = lsteps[lstep], D = DOMAINS[L.d];
  const dots = lsteps.map((_, i) => `<i class="${i < lstep ? "past" : i === lstep ? "cur" : ""}"></i>`).join("");
  let body;
  if (st.list) body = `<ul class="bigkeys">${st.list.map(x => `<li>${md(x)}</li>`).join("")}</ul>`;
  else if (st.cmd) body = `<div class="term big"><div class="tbar">R1# console — type these, in order</div>${st.cmd.map(c => `<div class="tline">${esc(c)}</div>`).join("")}</div>`;
  else body = `<p class="bigtext">${md(st.t)}</p>`;
  const last = lstep === lsteps.length - 1;
  const head = st.intro
    ? `<h1 class="steph">${esc(L.t)}</h1><div class="stepsub">${st.h}</div>`
    : `<h1 class="steph">${st.h}</h1>`;
  $("#ov-lesson .body").innerHTML = `
    <div class="qtop"><span class="eyebrow">${ctx.mode === "view" ? "review" : "day " + pad(L.id) + "/60"} · ${D.short}</span><span class="qdots">${dots}</span></div>
    ${head}
    ${body}
    <div class="steprow">
      ${lstep > 0 ? `<button class="btn ghost half" onclick="stepBack()">‹ Back</button>` : ""}
      <button class="btn primary half" onclick="${last ? "startQuiz()" : "stepNext()"}">${last ? (ctx.mode === "daily" ? "Start the check" : "Practice quiz") : "Next ›"}</button>
    </div>
    <div class="spacer"></div>`;
  $("#ov-lesson").scrollTop = 0;
}

/* ---------- quiz engine ---------- */
let quiz = null;
function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

function buildItems(L) {
  return L.q.map((q, qi) => ({ lid: L.id, qi, q: q.q, e: q.e,
    opts: shuffle(q.o.map((t, oi) => ({ t, correct: oi === q.a }))) }));
}

function startQuiz() {
  const L = byId(ctx.id);
  quiz = { kind: ctx.mode === "daily" ? "daily" : "practice", items: buildItems(L), i: 0, right: 0, missed: [], attempt: (quiz && quiz.lid === L.id ? quiz.attempt : 0) + 1, lid: L.id, pass: L.q.length };
  $("#ov-quiz").classList.add("open");
  renderQ();
}

function startReviewSession() {
  const due = dueReviews(); if (!due.length) return;
  const items = shuffle(due).slice(0, 10).map(card => {
    const q = byId(card.lid).q[card.qi];
    return { lid: card.lid, qi: card.qi, q: q.q, e: q.e, card, opts: shuffle(q.o.map((t, oi) => ({ t, correct: oi === q.a }))) };
  });
  quiz = { kind: "review", items, i: 0, right: 0, missed: [] };
  ctx = { mode: "review" };
  $("#ov-quiz").classList.add("open"); document.body.classList.add("locked");
  renderQ();
}

function startQuick5() {
  const pool = [];
  for (const L of LESSONS) if (S.done[L.id]) L.q.forEach((q, qi) => pool.push({ lid: L.id, qi }));
  if (pool.length < 3) { toast("Finish a lesson first"); return; }
  const picks = shuffle(pool).slice(0, Math.min(5, pool.length)).map(({ lid, qi }) => {
    const q = byId(lid).q[qi];
    return { lid, qi, q: q.q, e: q.e, opts: shuffle(q.o.map((t, oi) => ({ t, correct: oi === q.a }))) };
  });
  quiz = { kind: "quick", items: picks, i: 0, right: 0, missed: [] };
  ctx = { mode: "quick" };
  $("#ov-quiz").classList.add("open"); document.body.classList.add("locked");
  renderQ();
}

function startMaintenance() {
  const pool = [];
  for (const L of LESSONS) L.q.forEach((q, qi) => pool.push({ lid: L.id, qi }));
  const picks = shuffle(pool).slice(0, 5).map(({ lid, qi }) => {
    const q = byId(lid).q[qi];
    return { lid, qi, q: q.q, e: q.e, opts: shuffle(q.o.map((t, oi) => ({ t, correct: oi === q.a }))) };
  });
  quiz = { kind: "maint", items: picks, i: 0, right: 0, missed: [] };
  ctx = { mode: "maint" };
  $("#ov-quiz").classList.add("open"); document.body.classList.add("locked");
  renderQ();
}

function renderQ() {
  const it = quiz.items[quiz.i];
  const L = byId(it.lid);
  const dots = quiz.items.map((_, i) => `<i class="${i < quiz.i ? "past" : i === quiz.i ? "cur" : ""}"></i>`).join("");
  $("#ov-quiz .body").innerHTML = `
    <div class="qtop"><span class="eyebrow">${quizLabel()} · Q${quiz.i + 1}/${quiz.items.length}</span><span class="qdots">${dots}</span></div>
    <div class="eyebrow dim2">${DOMAINS[L.d].short} · lesson ${pad(L.id)}</div>
    <h2 class="qtext">${md(it.q)}</h2>
    <div class="opts">${it.opts.map((o, i) => `<button class="opt" data-i="${i}" onclick="answer(${i})">${md(o.t)}</button>`).join("")}</div>
    <div class="explain" id="explain"></div>
    <button class="btn primary hiddenb" id="nextbtn" onclick="nextQ()">Next</button>`;
  $("#ov-quiz").scrollTop = 0;
}
function quizLabel() {
  return { daily: "daily check", practice: "practice", review: "smart review", quick: "quick 5", maint: "maintenance drill" }[quiz.kind];
}

function answer(i) {
  const it = quiz.items[quiz.i];
  if (it.answered) return; it.answered = true;
  const ok = it.opts[i].correct;
  S.answered++; bumpAct(); if (ok) { S.correct++; quiz.right++; } else quiz.missed.push(it);
  document.querySelectorAll(".opt").forEach((b, bi) => {
    b.disabled = true;
    if (it.opts[bi].correct) b.classList.add("right");
    else if (bi === i) b.classList.add("wrong");
    else b.classList.add("fade");
  });
  $("#explain").innerHTML = (ok ? `<span class="ok">✓ Correct.</span> ` : `<span class="bad">✗ Not quite.</span> `) + md(it.e);
  $("#explain").classList.add("show");
  const nb = $("#nextbtn"); nb.classList.remove("hiddenb");
  nb.textContent = quiz.i === quiz.items.length - 1 ? "See result" : "Next";
  /* review-mode SRS scheduling happens per answer */
  if (quiz.kind === "review") {
    S.reviewAnswers++;
    const card = it.card;
    if (ok) {
      const next = { 1: 3, 3: 7, 7: 14, 14: 30 }[card.iv];
      if (!next) { S.srs = S.srs.filter(c => c !== card); S.grad++; }
      else { card.iv = next; card.due = addDays(dstr(), next); }
    } else { card.iv = 1; card.due = addDays(dstr(), 1); }
  }
  if ((quiz.kind === "quick" || quiz.kind === "maint" || quiz.kind === "practice") && !ok) queueSRS(it.lid, it.qi);
  save();
}

function queueSRS(lid, qi) {
  if (S.srs.some(c => c.lid === lid && c.qi === qi)) {
    const c = S.srs.find(c => c.lid === lid && c.qi === qi); c.iv = 1; c.due = addDays(dstr(), 1);
  } else S.srs.push({ lid, qi, iv: 1, due: addDays(dstr(), 1) });
}

function nextQ() {
  if (quiz.i < quiz.items.length - 1) { quiz.i++; renderQ(); return; }
  finishQuiz();
}

function finishQuiz() {
  const total = quiz.items.length, right = quiz.right;
  let html = "", passed = false;

  if (quiz.kind === "daily") {
    passed = right === total;
    if (passed) {
      S.done[quiz.lid] = { date: dstr(), tries: quiz.attempt };
      if (quiz.attempt === 1) S.firstTryPerfects++;
      bumpStreak(); bumpAct(3); save(); confetti(); checkBadges();
      html = resultCard("✓ 3/3 — lesson complete", `Day ${pad(quiz.lid)} is in the books. Streak: 🔥 ${shownStreak()}.`,
        `<button class="btn primary" onclick="closeQuizAll()">Done for today</button>`);
    } else {
      quiz.missed.forEach(it => queueSRS(it.lid, it.qi)); save();
      html = resultCard(`${right}/${total} — almost`, "You need 3/3 to lock the lesson. Skim it again or jump straight back in — the options reshuffle.",
        `<button class="btn primary" onclick="startQuiz()">Retry the check</button>
         <button class="btn ghost" onclick="backToLesson()">Reread the lesson</button>`);
    }
  } else if (quiz.kind === "maint") {
    passed = right >= 4;
    if (passed) { S.maintLast = dstr(); S.maintCount++; bumpStreak(); bumpAct(2); save(); confetti(); checkBadges();
      html = resultCard(`✓ ${right}/5 — drill passed`, `Streak holds at 🔥 ${shownStreak()}. Same time tomorrow.`,
        `<button class="btn primary" onclick="closeQuizAll()">Done</button>`);
    } else { save();
      html = resultCard(`${right}/5 — below the bar`, "Pass is 4/5. New questions every attempt.",
        `<button class="btn primary" onclick="startMaintenance()">Run it back</button>
         <button class="btn ghost" onclick="closeQuizAll()">Exit</button>`);
    }
  } else if (quiz.kind === "review") {
    let rd = "";
    if (!allDone() && !isLessonDay() && !completedToday()) { bumpStreak(); bumpAct(); confetti(); rd = ` Review day complete — 🔥 ${shownStreak()}.`; }
    save(); checkBadges();
    const left = dueReviews().length;
    html = resultCard(`${right}/${total} reviewed`, (left ? `${left} card${left>1?"s":""} still due today.` : "Review queue clear. Cards return on their schedule: 1 → 3 → 7 → 14 → 30 days.") + rd,
      `${left ? `<button class="btn primary" onclick="startReviewSession()">Keep going</button>` : ""}
       <button class="btn ghost" onclick="closeQuizAll()">Done</button>`);
  } else { /* practice / quick */
    let rd = "";
    if (quiz.kind === "quick" && !allDone() && !isLessonDay() && !completedToday()) { bumpStreak(); bumpAct(); confetti(); rd = ` Review day complete — 🔥 ${shownStreak()}.`; }
    save(); checkBadges();
    html = resultCard(`${right}/${total}`, (quiz.missed.length ? "Missed questions were added to your review queue for tomorrow." : "Clean run.") + rd,
      `<button class="btn ghost" onclick="closeQuizAll()">Done</button>`);
  }
  $("#ov-quiz .body").innerHTML = html;
  updateAppBadge();
}

function resultCard(title, sub, btns) {
  return `<div class="result"><div class="rscore">${title}</div><p>${sub}</p><div class="btncol">${btns}</div></div>`;
}
function backToLesson() { $("#ov-quiz").classList.remove("open"); }
function closeQuizAll() { closeOverlays(); render(); }

/* ---------- review tab ---------- */
function renderReview() {
  const el = $("#page-review");
  const due = dueReviews(); const upcoming = S.srs.filter(x => x.due > dstr()).sort((a, b) => a.due < b.due ? -1 : 1);
  let html = `<div class="card hero small">
      <div class="eyebrow">smart review · spaced repetition</div>
      <h1>${due.length ? due.length + " card" + (due.length>1?"s":"") + " due" : "Queue clear"}</h1>
      <div class="meta">Missed questions come back at 1 → 3 → 7 → 14 → 30 days until you graduate them.</div>
      ${due.length ? `<button class="btn primary" onclick="startReviewSession()">Review now</button>` : ""}
    </div>
    <div class="card">
      <div class="eyebrow">extra reps</div>
      <p class="meta" style="margin:6px 0 10px">Five random questions from lessons you've completed. Doesn't affect your daily lesson.</p>
      <button class="btn ghost" onclick="startQuick5()">Quick 5</button>
    </div>
    <div class="card">
      <div class="eyebrow">subnetting drill · ∞ generated</div>
      <p class="meta" style="margin:6px 0 10px">Endless generated problems — network, broadcast, host ranges, masks. All-time best run: <b>${S.sn.best}</b>.</p>
      <button class="btn ghost" onclick="startSN()">Start drill</button>
    </div>`;
  if (upcoming.length) {
    html += `<div class="card list"><div class="eyebrow" style="padding:2px 2px 8px">scheduled</div>` +
      upcoming.slice(0, 8).map(c => `<div class="lrow lock"><span class="lnum">${pad(c.lid)}</span><span class="ltitle">${esc(byId(c.lid).t)}</span><span class="lstate lk">${niceDate(c.due)} · ${c.iv}d</span></div>`).join("") +
      (upcoming.length > 8 ? `<div class="lrow lock"><span class="ltitle dim2">+ ${upcoming.length - 8} more</span></div>` : "") + `</div>`;
  }
  el.innerHTML = html;
}

/* ---------- stats ---------- */
function renderStats() {
  const el = $("#page-stats");
  const acc = accuracy();
  const pct = Math.round(100 * doneCount() / 60);
  const badgeGrid = BADGES.map(b => {
    const got = S.badges[b.id];
    return `<div class="badge ${got ? "got" : ""}" title="${esc(b.desc)}"><span class="bi">${b.icon}</span><span class="bn">${b.name}</span>${got ? `<span class="bd">${niceDate(got)}</span>` : `<span class="bd">${esc(b.desc)}</span>`}</div>`;
  }).join("");
  el.innerHTML = `
    <div class="statgrid">
      <div class="stat"><span class="sv">🔥 ${shownStreak()}</span><span class="sl">current streak</span></div>
      <div class="stat"><span class="sv">${S.best}</span><span class="sl">best streak</span></div>
      <div class="stat"><span class="sv">${doneCount()}<em>/60</em></span><span class="sl">lessons · ${pct}%</span></div>
      <div class="stat"><span class="sv">${acc === null ? "—" : acc + "%"}</span><span class="sl">quiz accuracy</span></div>
      <div class="stat"><span class="sv">${S.grad}</span><span class="sl">cards graduated</span></div>
      <div class="stat"><span class="sv">${niceDate(S.firstDay)}</span><span class="sl">day one</span></div>
      <div class="stat"><span class="sv">${S.sn.c}</span><span class="sl">subnets solved</span></div>
      <div class="stat"><span class="sv">⌁ ${S.sn.best}</span><span class="sl">best subnet run</span></div>
    </div>
    <div class="card"><div class="eyebrow">last 12 weeks</div>${heatHTML()}<div class="heatkey">less <i></i><i class="h1"></i><i class="h2"></i><i class="h3"></i> more</div></div>
    <div class="card"><div class="eyebrow">badges · ${Object.keys(S.badges).length}/${BADGES.length}</div><div class="badges">${badgeGrid}</div></div>`;
}

/* ---------- settings ---------- */
function openSettings() {
  $("#sheet").classList.add("open"); document.body.classList.add("locked");
  renderSettings();
}
function renderSettings() {
  const perm = ("Notification" in window) ? Notification.permission : "unsupported";
  const permLabel = { granted: "✓ enabled", denied: "blocked in iOS Settings", default: "not enabled", unsupported: "not supported here" }[perm];
  $("#sheet .body").innerHTML = `
    <div class="sheeth"><h2>Settings</h2><button class="x" onclick="closeOverlays();render()">✕</button></div>

    <div class="panel">
      <div class="ptitle">exam countdown</div>
      <div class="rowline"><input type="date" id="examdate" value="${S.exam || ""}"><button class="btn mini" onclick="saveExam()">Save</button></div>
      <p class="fine">Shows a countdown chip on the Today screen.</p>
    </div>

    <div class="panel">
      <div class="ptitle">pace · new lesson every…</div>
      <div class="seg">${[1,2,3].map(n => `<button class="${S.pace === n ? "on" : ""}" onclick="setPace(${n})">${n === 1 ? "Day" : n + " days"}</button>`).join("")}</div>
      <p class="fine" style="margin-top:8px">Off days become review days — one quick session keeps your streak.</p>
    </div>

    <div class="panel">
      <div class="ptitle">text size</div>
      <div class="seg">${["Normal","Large","XL"].map((x, i) => `<button class="${S.font === i ? "on" : ""}" onclick="setFont(${i})">${x}</button>`).join("")}</div>
    </div>

    <div class="panel">
      <div class="ptitle">daily reminder</div>
      <p class="fine">Status: <b>${permLabel}</b>${perm !== "granted" ? "" : " · app badge shows when a lesson is waiting"}</p>
      ${perm === "default" ? `<button class="btn mini" onclick="askNotif()">Enable notifications</button>` : ""}
      ${perm === "granted" ? `<button class="btn mini" onclick="testNotif()">Send test notification</button>` : ""}
      <p class="fine" style="margin-top:10px">iOS doesn't let a web app fire scheduled pushes without a server, so the bulletproof daily reminder is a 2-minute Shortcuts automation:</p>
      <ol class="fine steps">
        <li>Shortcuts app → <b>Automation</b> → <b>+</b> → <b>Time of Day</b> (pick your study time, Daily, <b>Run Immediately</b>)</li>
        <li>Action: <b>Open App</b> → choose <b>CCNA Daily</b> (it's listed once added to Home Screen)</li>
      </ol>
      <p class="fine">Every day at that time, your phone opens straight to the lesson. The red app badge (iOS 16.4+) also appears whenever today's lesson is unfinished.</p>
    </div>

    <div class="panel">
      <div class="ptitle">backup & restore</div>
      <div class="rowline">
        <button class="btn mini" onclick="exportData()">Copy backup</button>
        <button class="btn mini" onclick="$('#importbox').classList.toggle('hiddenb')">Restore…</button>
      </div>
      <div id="importbox" class="hiddenb" style="margin-top:10px">
        <textarea id="importtext" placeholder="Paste a backup here"></textarea>
        <button class="btn mini" onclick="importData()">Restore backup</button>
      </div>
      <p class="fine">Progress lives on this device. Copy a backup occasionally (Notes works fine).</p>
    </div>

    <div class="panel">
      <div class="ptitle">danger zone</div>
      <button class="btn mini danger" onclick="resetAll()">Reset all progress</button>
    </div>
    <p class="fine center">CCNA Daily v3 · 60 lessons · ∞ subnet drill · your pace · built for Brandon 🛠</p>
    <div class="spacer"></div>`;
}
function saveExam() { const v = $("#examdate").value; S.exam = v || null; save(); toast(v ? "Exam date set" : "Exam date cleared"); render(); }
function exportData() {
  const data = JSON.stringify(S);
  const done = () => toast("Backup copied — paste it somewhere safe");
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(data).then(done, () => fallbackCopy(data, done));
  else fallbackCopy(data, done);
}
function fallbackCopy(text, done) {
  const ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta);
  ta.select(); try { document.execCommand("copy"); done(); } catch (e) { prompt("Copy this:", text); }
  ta.remove();
}
function importData() {
  try {
    const obj = JSON.parse($("#importtext").value.trim());
    if (!obj || typeof obj !== "object" || !("done" in obj)) throw 0;
    S = Object.assign(fresh(), obj); save(); toast("Backup restored"); closeOverlays(); render();
  } catch (e) { toast("That doesn't look like a valid backup"); }
}
function resetAll() {
  if (!confirm("Wipe all progress, streaks, and badges?")) return;
  S = fresh(); save(); closeOverlays(); render(); toast("Fresh start. Day 1 awaits.");
}

/* ---------- notifications + app badge ---------- */
function askNotif() {
  Notification.requestPermission().then(p => { S.notifWanted = p === "granted"; save(); renderSettings(); if (p === "granted") testNotif(); });
}
function testNotif() {
  if (navigator.serviceWorker && navigator.serviceWorker.ready) {
    navigator.serviceWorker.ready.then(reg =>
      reg.showNotification("CCNA Daily", { body: "Notifications are working. See you at study time. 🔥", icon: "icon-192.png", badge: "icon-192.png" })
    ).catch(() => {});
  }
}
function updateAppBadge() {
  if (!("setAppBadge" in navigator)) return;
  const pending = !completedToday();
  try { pending ? navigator.setAppBadge(1) : navigator.clearAppBadge(); } catch (e) {}
}

/* ---------- confetti (packet burst) ---------- */
function confetti() {
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const colors = ["#35C7F4", "#FFB454", "#3DDC97", "#EAF1FB"];
  for (let i = 0; i < 26; i++) {
    const p = document.createElement("i"); p.className = "pkt";
    p.style.left = 50 + (Math.random() * 30 - 15) + "%";
    p.style.background = colors[i % colors.length];
    p.style.setProperty("--dx", (Math.random() * 240 - 120) + "px");
    p.style.setProperty("--dy", (-(120 + Math.random() * 240)) + "px");
    p.style.setProperty("--rot", (Math.random() * 720 - 360) + "deg");
    p.style.animationDelay = (Math.random() * 120) + "ms";
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 1600);
  }
}

/* ================= v3: pace, text size, welcome ================= */
function applyFont() {
  document.body.classList.toggle("fs1", S.font === 1);
  document.body.classList.toggle("fs2", S.font === 2);
}
function setFont(i, inWelcome) {
  S.font = i; save(); applyFont();
  inWelcome ? renderWelcome() : renderSettings();
}
function setPace(n, inWelcome) {
  S.pace = n; save();
  if (inWelcome) renderWelcome();
  else { renderSettings(); toast("New lesson every " + (n === 1 ? "day" : n + " days")); }
  render();
}
function openWelcome() {
  $("#ov-welcome").classList.add("open");
  document.body.classList.add("locked");
  renderWelcome();
}
function renderWelcome() {
  $("#ov-welcome .body").innerHTML = `
    <div class="eyebrow">welcome · 30-second setup</div>
    <h1 class="steph">60 short lessons.<br>One at a time.<br>CCNA done.</h1>
    <p class="bigtext">Every lesson is broken into tiny steps — read one screen, tap Next. Pass a quick 3-question check and the day is done. Miss a question? It comes back later until you own it.</p>
    <div class="panel">
      <div class="ptitle">how fast do you want to go?</div>
      <div class="seg">${[1,2,3].map(n => `<button class="${S.pace === n ? "on" : ""}" onclick="setPace(${n},1)">${n === 1 ? "Every day" : "Every " + n + " days"}</button>`).join("")}</div>
      <p class="fine" style="margin-top:8px">Off days become easy review days — your 🔥 streak stays safe.</p>
    </div>
    <div class="panel">
      <div class="ptitle">text size</div>
      <div class="seg">${["Normal","Large","XL"].map((x, i) => `<button class="${S.font === i ? "on" : ""}" onclick="setFont(${i},1)">${x}</button>`).join("")}</div>
    </div>
    <button class="btn primary" onclick="closeWelcome()">Start Day 1 ›</button>
    <div class="spacer"></div>`;
}
function closeWelcome() {
  S.seen = true; save();
  $("#ov-welcome").classList.remove("open");
  document.body.classList.remove("locked");
  render();
}

/* ================= v2 additions ================= */

/* ---------- library search ---------- */
function libFilter(v) {
  v = v.trim().toLowerCase();
  document.querySelectorAll("#page-library .lrow").forEach(r => {
    r.style.display = (!v || (r.dataset.t || "").includes(v)) ? "" : "none";
  });
  document.querySelectorAll("#page-library .dgroup").forEach(g => {
    const any = [...g.querySelectorAll(".lrow")].some(r => r.style.display !== "none");
    g.style.display = any ? "" : "none";
  });
}

/* ---------- REF: quick-reference tables ---------- */
const REF = [
  { t: "well-known ports", rows: [["FTP","20/21 · TCP"],["TACACS+","49 · TCP"],["SSH","22 · TCP"],["Telnet","23 · TCP"],["SMTP","25 · TCP"],["DNS","53 · UDP+TCP"],["DHCP","67/68 · UDP"],["TFTP","69 · UDP"],["HTTP","80 · TCP"],["POP3","110 · TCP"],["NTP","123 · UDP"],["IMAP","143 · TCP"],["SNMP","161/162 · UDP"],["HTTPS","443 · TCP"],["Syslog","514 · UDP"],["RADIUS","1812/1813 · UDP"]] },
  { t: "administrative distance", rows: [["Connected","0"],["Static","1"],["eBGP","20"],["EIGRP","90"],["OSPF","110"],["IS-IS","115"],["RIP","120"],["iBGP","200"],["Unreachable","255"]] },
  { t: "subnet cheat table", rows: [["/24","255.255.255.0 · block 256 · 254 hosts"],["/25","255.255.255.128 · block 128 · 126"],["/26","255.255.255.192 · block 64 · 62"],["/27","255.255.255.224 · block 32 · 30"],["/28","255.255.255.240 · block 16 · 14"],["/29","255.255.255.248 · block 8 · 6"],["/30","255.255.255.252 · block 4 · 2"],["/16","255.255.0.0 · 65,534 hosts"],["/8","255.0.0.0 · 16.7M hosts"],["wildcard","255.255.255.255 − mask"]] },
  { t: "special ranges", rows: [["10.0.0.0/8","private · class A"],["172.16.0.0/12","private · class B"],["192.168.0.0/16","private · class C"],["169.254.0.0/16","APIPA / link-local"],["127.0.0.0/8","loopback"],["224.0.0.0/4","multicast"],["fe80::/10","IPv6 link-local"],["2000::/3","IPv6 global unicast"],["ff02::5 / ::6","OSPFv3 routers / DR"],["::1","IPv6 loopback"]] },
  { t: "stp / rstp", rows: [["timers","hello 2s · fwd-delay 15s · max-age 20s"],["cost","100M = 19 · 1G = 4 · 10G = 2"],["roles","root · designated · alternate · backup"],["RSTP states","discarding · learning · forwarding"],["root election","lowest bridge ID (priority + MAC)"],["edge ports","PortFast + BPDU Guard"]] },
  { t: "ospf", rows: [["neighbor states","down → init → 2-way → exstart → exchange → loading → full"],["timers","hello 10s · dead 40s (broadcast)"],["multicast","224.0.0.5 all-SPF · 224.0.0.6 DR/BDR"],["RID order","manual → highest loopback → highest interface"],["cost","reference-bw ÷ interface bw"],["DR priority","default 1 · 0 = never · no preempt"]] },
  { t: "fhrp", rows: [["HSRP vMAC","0000.0c07.acXX"],["HSRP timers","hello 3s · hold 10s"],["VRRP vMAC","0000.5e00.01XX"],["defaults","priority 100 · HSRP preempt off"],["GLBP","Cisco · adds load balancing"]] },
  { t: "go-to show commands", rows: [["show ip int brief","interfaces + IP + status"],["show ip route","RIB · codes · [AD/metric]"],["show vlan brief","VLANs + access ports"],["show interfaces trunk","trunks · native · allowed"],["show mac address-table","L2 forwarding table"],["show cdp neighbors","what's plugged in where"],["show ip ospf neighbor","adjacencies + state"],["show standby brief","HSRP at a glance"],["show port-security interface","violations · sticky MACs"],["show ip nat translations","live NAT table"]] },
  { t: "misc numbers", rows: [["DSCP EF","46 · voice"],["Ethernet MTU","1500 bytes"],["802.1Q tag","4 bytes · native = untagged"],["VLAN ranges","normal 1–1005 · extended 1006–4094"],["EtherChannel","LACP active/passive · PAgP desirable/auto"],["SNMPv3 authPriv","authentication + encryption"],["Syslog severities","0 emerg → 7 debug"],["SSH keys","RSA 2048 · needs hostname + domain"]] }
];
function renderRef() {
  const el = $("#page-ref");
  if (el.dataset.built) return;
  el.innerHTML =
    `<div class="card"><div class="eyebrow">quick reference · the numbers worth over-learning</div>
      <p class="meta" style="margin-top:4px">Skim one table a day. Also handy live at the desk.</p></div>` +
    REF.map(s => `<div class="card"><div class="eyebrow">${s.t}</div>` +
      s.rows.map(r => `<div class="refrow"><span class="refl">${r[0]}</span><span class="refr">${r[1]}</span></div>`).join("") +
      `</div>`).join("");
  el.dataset.built = "1";
}

/* ---------- stats heatmap (last 12 weeks) ---------- */
function heatHTML() {
  const today = dstr();
  const now = new Date();
  const start = new Date(now); start.setDate(now.getDate() - now.getDay() - 77); // Sunday, 12 weeks back
  let cells = "";
  for (let c = 0; c < 12; c++) for (let r = 0; r < 7; r++) {
    const d = new Date(start); d.setDate(start.getDate() + c * 7 + r);
    const ds = dstr(d);
    if (ds > today) { cells += `<i style="opacity:0"></i>`; continue; }
    const v = S.activity[ds] || 0;
    const h = v >= 6 ? 3 : v >= 3 ? 2 : v >= 1 ? 1 : 0;
    cells += `<i class="h${h}" title="${ds}: ${v}"></i>`;
  }
  return `<div class="heat">${cells}</div>`;
}

/* ---------- subnet drill: procedural, endless ---------- */
const i2ip = n => [n >>> 24 & 255, n >>> 16 & 255, n >>> 8 & 255, n & 255].join(".");
const maskOf = p => p ? (0xFFFFFFFF << (32 - p)) >>> 0 : 0;
const ri = n => Math.floor(Math.random() * n);

function randIp() {
  const r = Math.random(); let o1, o2 = ri(256);
  if (r < .25) o1 = 10;
  else if (r < .45) { o1 = 172; o2 = 16 + ri(16); }
  else if (r < .65) { o1 = 192; o2 = 168; }
  else { do { o1 = 1 + ri(222); } while (o1 === 127 || o1 === 10 || o1 === 172 || o1 === 192); }
  return (((o1 << 24) >>> 0) + (o2 << 16) + (ri(256) << 8) + (1 + ri(254))) >>> 0;
}
function randPfx() {
  const heavy = [24, 25, 26, 26, 27, 27, 28, 28, 29, 29, 30];
  const light = [10, 12, 14, 16, 18, 20, 21, 22, 23];
  return Math.random() < .8 ? heavy[ri(heavy.length)] : light[ri(light.length)];
}
function uniq3(correct, cands, padFn) {
  const seen = new Set([correct]); const out = [];
  for (const c of cands) { if (!seen.has(c)) { seen.add(c); out.push(c); } if (out.length === 3) break; }
  let k = 2;
  while (out.length < 3 && k < 40) { const c = padFn(k++); if (!seen.has(c)) { seen.add(c); out.push(c); } }
  return out;
}
function genSN() {
  const types = ["net", "bc", "first", "last", "hosts", "mask", "pfx"];
  const ty = types[ri(types.length)];
  let p = randPfx(); if ((ty === "mask" || ty === "pfx") && p < 9) p = 9 + ri(22);
  const ip = randIp();
  const m = maskOf(p), net = (ip & m) >>> 0, bc = (net | (~m >>> 0)) >>> 0;
  const size = 2 ** (32 - p), hosts = size - 2;
  const cidr = i2ip(ip) + "/" + p;
  const block = 2 ** (8 - ((p - 1) % 8 + 1));
  const oct = p > 24 ? 4 : p > 16 ? 3 : p > 8 ? 2 : 1;
  const ex = `/${p} → mask <b>${i2ip(m)}</b> · block ${block} in octet ${oct}. Network <b>${i2ip(net)}</b> · broadcast <b>${i2ip(bc)}</b> · usable ${i2ip((net + 1) >>> 0)}–${i2ip((bc - 1) >>> 0)}.`;
  const addrPad = k => i2ip((net + size * k) >>> 0);
  let q, correct, alts;
  if (ty === "net") { q = `Network address of <b>${cidr}</b>?`; correct = i2ip(net);
    alts = uniq3(correct, [i2ip((net + size) >>> 0), i2ip((net - size) >>> 0), i2ip(bc), i2ip(ip)], addrPad); }
  else if (ty === "bc") { q = `Broadcast address of <b>${cidr}</b>?`; correct = i2ip(bc);
    alts = uniq3(correct, [i2ip(net), i2ip((bc + size) >>> 0), i2ip((bc - 1) >>> 0), i2ip((bc - size) >>> 0)], addrPad); }
  else if (ty === "first") { q = `First usable host in the subnet of <b>${cidr}</b>?`; correct = i2ip((net + 1) >>> 0);
    alts = uniq3(correct, [i2ip(net), i2ip((net + 2) >>> 0), i2ip((bc - 1) >>> 0), i2ip((net + size + 1) >>> 0)], addrPad); }
  else if (ty === "last") { q = `Last usable host in the subnet of <b>${cidr}</b>?`; correct = i2ip((bc - 1) >>> 0);
    alts = uniq3(correct, [i2ip(bc), i2ip((bc - 2) >>> 0), i2ip((net + 1) >>> 0), i2ip((bc + size - 1) >>> 0)], addrPad); }
  else if (ty === "hosts") { q = `Usable host addresses in a <b>/${p}</b>?`; correct = hosts.toLocaleString("en-US");
    alts = uniq3(correct, [size, size / 2 - 2, size * 2 - 2, size - 1].map(n => n.toLocaleString("en-US")), k => (hosts + 2 * k).toLocaleString("en-US")); }
  else if (ty === "mask") { q = `Dotted-decimal mask for <b>/${p}</b>?`; correct = i2ip(m);
    alts = uniq3(correct, [maskOf(p - 1), maskOf(p + 1), maskOf(p + 2), maskOf(p - 2)].map(i2ip), k => i2ip(maskOf(9 + ((p + k) % 22)))); }
  else { q = `<b>${i2ip(m)}</b> is which prefix length?`; correct = "/" + p;
    alts = uniq3(correct, ["/" + (p - 1), "/" + (p + 1), "/" + (p + 2), "/" + (p - 2)], k => "/" + (9 + ((p + k) % 22))); }
  const opts = shuffle([{ t: correct, correct: true }, ...alts.map(t => ({ t, correct: false }))]);
  return { ty, q, ex, opts, net, bc, p, hosts, m };
}

let sn = null;
function startSN() {
  sn = { n: 0, right: 0 };
  ctx = { mode: "sn" };
  $("#ov-quiz").classList.add("open"); document.body.classList.add("locked");
  nextSN();
}
function nextSN() {
  sn.q = genSN(); sn.n++;
  $("#ov-quiz .body").innerHTML = `
    <div class="qtop"><span class="eyebrow">subnet drill · ∞</span>
      <span class="eyebrow dim2">Q${sn.n} · session ${sn.right}/${sn.n - 1} · run ⌁${S.sn.st} · best ${S.sn.best}</span></div>
    <h2 class="qtext">${sn.q.q}</h2>
    <div class="opts">${sn.q.opts.map((o, i) => `<button class="opt" onclick="answerSN(${i})">${o.t}</button>`).join("")}</div>
    <div class="explain" id="explain"></div>
    <button class="btn primary hiddenb" id="nextbtn" onclick="nextSN()">Next problem</button>
    <button class="btn ghost" onclick="closeQuizAll()">End drill</button>`;
  $("#ov-quiz").scrollTop = 0;
}
function answerSN(i) {
  if (sn.q.answered) return; sn.q.answered = true;
  const ok = sn.q.opts[i].correct;
  S.answered++; S.sn.a++; bumpAct();
  if (ok) { S.correct++; S.sn.c++; sn.right++; S.sn.st++; S.sn.best = Math.max(S.sn.best, S.sn.st); }
  else S.sn.st = 0;
  document.querySelectorAll(".opt").forEach((b, bi) => {
    b.disabled = true;
    if (sn.q.opts[bi].correct) b.classList.add("right");
    else if (bi === i) b.classList.add("wrong");
    else b.classList.add("fade");
  });
  $("#explain").innerHTML = (ok ? `<span class="ok">✓ Correct.</span> ` : `<span class="bad">✗ Not quite.</span> `) + sn.q.ex;
  $("#explain").classList.add("show");
  $("#nextbtn").classList.remove("hiddenb");
  save(); checkBadges();
}

/* ---------- init ---------- */
document.querySelectorAll(".tabbar button").forEach(b => b.addEventListener("click", () => showTab(b.dataset.tab)));
$("#gear").addEventListener("click", openSettings);
document.querySelectorAll(".ovback").forEach(b => b.addEventListener("click", () => { closeOverlays(); render(); }));
document.addEventListener("visibilitychange", () => { if (!document.hidden) { render(); } });

if ("serviceWorker" in navigator) {
  const hadSW = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.register("sw.js").catch(() => {});
  let reloaded = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (!hadSW || reloaded) return; reloaded = true; location.reload();
  });
}

applyFont();
render();
if (!S.seen) openWelcome();
