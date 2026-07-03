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
           reviewAnswers: 0, maintLast: null, maintCount: 0, exam: null, badges: {}, notifWanted: false };
}
function load() {
  try { const raw = store.get(KEY); if (raw) return Object.assign(fresh(), JSON.parse(raw)); } catch (e) {}
  return fresh();
}
function save() { store.set(KEY, JSON.stringify(S)); }

/* ---------- derived ---------- */
const byId = id => LESSONS.find(l => l.id === id);
function doneCount() { return Object.keys(S.done).length; }
function allDone() { return doneCount() >= LESSONS.length; }
function todaysLesson() { return LESSONS.find(l => !S.done[l.id]) || null; }
function completedToday() {
  const t = dstr();
  if (S.maintLast === t) return true;
  return Object.values(S.done).some(d => d.date === t);
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
  { id: "maint7",  icon: "∞", name: "Maintainer",     desc: "7 maintenance drills after day 60", test: () => S.maintCount >= 7 }
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
  renderToday(); renderLibrary(); renderReview(); renderStats();
  updateAppBadge();
}

function renderToday() {
  const el = $("#page-today"); const t = dstr();
  const n = doneCount(); const lesson = todaysLesson(); const doneNow = completedToday();
  let hero = "";

  if (!allDone()) {
    const L = lesson; const D = DOMAINS[L.d];
    if (!doneNow) {
      hero = `
      <div class="card hero">
        <div class="eyebrow">day ${pad(L.id)}/60 · ${D.short}</div>
        <h1>${esc(L.t)}</h1>
        <div class="meta">~${L.min} min read · 3-question check · pass 3/3</div>
        <button class="btn primary" onclick="openLesson(${L.id},'daily')">Start today's lesson</button>
      </div>`;
    } else {
      const next = lesson;
      hero = `
      <div class="card hero done">
        <div class="eyebrow">day complete · streak ${shownStreak()}</div>
        <h1>Nice work.</h1>
        <div class="meta">Lesson ${pad(next.id)} — “${esc(next.t)}” — unlocks tomorrow. Review is always open.</div>
        <button class="btn ghost" onclick="showTab('review')">Go to review</button>
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
  let html = `<div class="card"><div class="eyebrow">curriculum · tap any completed lesson to reread & practice</div></div>`;
  for (const k in DOMAINS) {
    const D = DOMAINS[k];
    html += `<div class="dhead"><span class="if">${D.iface}</span> ${D.name}</div><div class="card list">`;
    for (const L of LESSONS.filter(l => l.d === k)) {
      const done = S.done[L.id];
      const isToday = !completedToday() && todaysLesson() && todaysLesson().id === L.id;
      const state = done ? "done" : (isToday ? "now" : "lock");
      const right = done ? `<span class="lstate ok">✓ ${niceDate(done.date)}</span>`
                  : isToday ? `<span class="lstate now">today ▸</span>`
                  : `<span class="lstate lk">day ${pad(L.id)}</span>`;
      const tap = done ? `onclick="openLesson(${L.id},'view')"` : (isToday ? `onclick="openLesson(${L.id},'daily')"` : "");
      html += `<div class="lrow ${state}" ${tap}><span class="lnum">${pad(L.id)}</span><span class="ltitle">${esc(L.t)}</span>${right}</div>`;
    }
    html += `</div>`;
  }
  el.innerHTML = html;
}

/* ---------- lesson view ---------- */
let ctx = null; // {mode:'daily'|'view', id}
function openLesson(id, mode) {
  const L = byId(id); if (!L) return;
  ctx = { mode, id };
  const D = DOMAINS[L.d];
  const cmds = L.cmd ? `<div class="term"><div class="tbar">R1# console</div>${L.cmd.map(c => `<div class="tline">${esc(c)}</div>`).join("")}</div>` : "";
  $("#ov-lesson .body").innerHTML = `
    <div class="eyebrow">${mode === "view" ? "review" : "day " + pad(L.id) + "/60"} · ${D.short} · ~${L.min} min</div>
    <h1>${esc(L.t)}</h1>
    ${L.c.map(p => `<p>${md(p)}</p>`).join("")}
    <div class="panel"><div class="ptitle">key points</div><ul>${L.k.map(x => `<li>${md(x)}</li>`).join("")}</ul></div>
    ${cmds}
    <button class="btn primary" onclick="startQuiz()">${mode === "daily" ? "Start the 3-question check" : "Practice quiz (3 questions)"}</button>
    <div class="spacer"></div>`;
  $("#ov-lesson").classList.add("open");
  document.body.classList.add("locked");
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
  if (pool.length < 5) { toast("Finish a few lessons first"); return; }
  const picks = shuffle(pool).slice(0, 5).map(({ lid, qi }) => {
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
  S.answered++; if (ok) { S.correct++; quiz.right++; } else quiz.missed.push(it);
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
      const first = !S.done[quiz.lid];
      S.done[quiz.lid] = { date: dstr(), tries: quiz.attempt };
      if (quiz.attempt === 1) S.firstTryPerfects++;
      bumpStreak(); save(); confetti(); checkBadges();
      html = resultCard("✓ 3/3 — lesson complete", `Day ${pad(quiz.lid)} is in the books. Streak: 🔥 ${shownStreak()}${first ? "" : ""}.`,
        `<button class="btn primary" onclick="closeQuizAll()">Done for today</button>`);
    } else {
      quiz.missed.forEach(it => queueSRS(it.lid, it.qi)); save();
      html = resultCard(`${right}/${total} — almost`, "You need 3/3 to lock the lesson. Skim it again or jump straight back in — the options reshuffle.",
        `<button class="btn primary" onclick="startQuiz()">Retry the check</button>
         <button class="btn ghost" onclick="backToLesson()">Reread the lesson</button>`);
    }
  } else if (quiz.kind === "maint") {
    passed = right >= 4;
    if (passed) { S.maintLast = dstr(); S.maintCount++; bumpStreak(); save(); confetti(); checkBadges();
      html = resultCard(`✓ ${right}/5 — drill passed`, `Streak holds at 🔥 ${shownStreak()}. Same time tomorrow.`,
        `<button class="btn primary" onclick="closeQuizAll()">Done</button>`);
    } else { save();
      html = resultCard(`${right}/5 — below the bar`, "Pass is 4/5. New questions every attempt.",
        `<button class="btn primary" onclick="startMaintenance()">Run it back</button>
         <button class="btn ghost" onclick="closeQuizAll()">Exit</button>`);
    }
  } else if (quiz.kind === "review") {
    save(); checkBadges();
    const left = dueReviews().length;
    html = resultCard(`${right}/${total} reviewed`, left ? `${left} card${left>1?"s":""} still due today.` : "Review queue clear. Cards return on their schedule: 1 → 3 → 7 → 14 → 30 days.",
      `${left ? `<button class="btn primary" onclick="startReviewSession()">Keep going</button>` : ""}
       <button class="btn ghost" onclick="closeQuizAll()">Done</button>`);
  } else { /* practice / quick */
    save(); checkBadges();
    html = resultCard(`${right}/${total}`, quiz.missed.length ? "Missed questions were added to your review queue for tomorrow." : "Clean run.",
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
    </div>
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
    <p class="fine center">CCNA Daily · 60 lessons · built for Brandon 🛠</p>
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

/* ---------- init ---------- */
document.querySelectorAll(".tabbar button").forEach(b => b.addEventListener("click", () => showTab(b.dataset.tab)));
$("#gear").addEventListener("click", openSettings);
document.querySelectorAll(".ovback").forEach(b => b.addEventListener("click", () => { closeOverlays(); render(); }));
document.addEventListener("visibilitychange", () => { if (!document.hidden) { render(); } });

if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});

render();
