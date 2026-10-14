/* ASIQPAI prototype runtime: router, sheets, toasts, dialogs, helpers */
window.ASQ = window.ASQ || {};
(function () {
  var A = ASQ;
  A.screens = {};
  A.state = { tab: 'home', stack: [], onboarded: false, playing: null, playingPos: 0.32, offline: false, textScale: 1, lang: 'ru',
              studio: { armed: 'mid', recording: false, takes: { mid: 1, back: 0, adlibs: 0 }, beat: 'b1', preset: 'pr2', pos: 0.3 },
              goal: null, likes: {}, cart: null, demoFlags: { emptyLibrary: false, walletEmpty: false } };

  // ---- tiny html helpers ----
  A.esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  A.fmtTime = function (sec) { sec = Math.max(0, Math.round(sec)); var m = Math.floor(sec / 60), s = sec % 60; return m + ':' + (s < 10 ? '0' : '') + s; };
  A.fmtMoney = function (n) { var s = Math.abs(n).toLocaleString('ru-RU'); return (n < 0 ? '−' : '') + s + ' ₸'; };
  A.rand = function (seed) { var x = Math.sin(seed * 9301 + 49297) * 233280; return x - Math.floor(x); };

  // Procedural waveform bars (deterministic by seed)
  A.wave = function (seed, n, played, opts) {
    opts = opts || {}; n = n || 48; var out = '';
    for (var i = 0; i < n; i++) {
      var v = 0.25 + 0.75 * Math.abs(Math.sin(i * 0.55 + seed) * 0.6 + A.rand(seed * 7 + i) * 0.5);
      if (opts.silent && (i < opts.silent[0] || i > opts.silent[1])) v = 0.06;
      out += '<i style="height:' + Math.round(v * 100) + '%" class="' + (played != null && i / n < played ? 'played' : '') + '"></i>';
    }
    return '<div class="wave" style="' + (opts.style || '') + '">' + out + '</div>';
  };
  // Procedural cover art
  A.cover = function (hue, seed, extra) {
    seed = seed || 1; var h2 = (hue + 40) % 360, h3 = (hue + 200) % 360;
    var circles = '';
    for (var i = 0; i < 4; i++) {
      circles += '<circle cx="' + (20 + A.rand(seed + i) * 60) + '" cy="' + (20 + A.rand(seed * 3 + i) * 60) + '" r="' + (14 + A.rand(seed * 5 + i) * 26) + '" fill="hsl(' + (i % 2 ? h2 : h3) + ' 70% 55% / 0.55)"/>';
    }
    var bars = '';
    for (var j = 0; j < 12; j++) bars += '<rect x="' + (14 + j * 6) + '" y="' + (60 - A.rand(seed * 11 + j) * 30) + '" width="3" height="' + (10 + A.rand(seed * 11 + j) * 30) + '" rx="1.5" fill="rgba(255,255,255,0.55)"/>';
    return '<svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="g' + seed + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(' + hue + ' 60% 28%)"/><stop offset="1" stop-color="hsl(' + h2 + ' 50% 12%)"/></linearGradient></defs>' +
      '<rect width="100" height="100" fill="url(#g' + seed + ')"/>' + circles + '<g opacity="0.8">' + bars + '</g>' + (extra || '') + '</svg>';
  };
  A.avatar = function (initials, hue, cls) { return '<div class="avatar ' + (cls || '') + '" style="background:linear-gradient(135deg,hsl(' + hue + ' 60% 55%),hsl(' + ((hue + 60) % 360) + ' 60% 35%))">' + A.esc(initials) + '</div>'; };
  A.beatById = function (id) { return A.DATA.beats.filter(function (b) { return b.id === id; })[0]; };

  // ---- Shared chrome ----
  A.appbar = function (o) {
    o = o || {};
    var left = o.back ? '<button class="icon-btn" data-go="back" aria-label="Назад">' + A.ic('back') + '</button>' : (o.left || '<span class="appbar__spacer"></span>');
    var right = o.right != null ? o.right : '<span class="appbar__spacer"></span>';
    return '<header class="appbar ' + (o.cls || '') + '">' + left + '<h1 class="appbar__title ' + (o.center !== false ? 'appbar__title--center' : '') + '">' + (o.title || '') + (o.sub ? '<span class="appbar__sub">' + o.sub + '</span>' : '') + '</h1>' + right + '</header>';
  };
  A.tabbar = function (active) {
    var tabs = [['home', 'home', 'Главная'], ['music', 'music', 'Музыка'], ['studio', 'mic', 'Студия'], ['community', 'users', 'Сообщество'], ['library', 'library', 'Библиотека']];
    return '<nav class="tabbar" aria-label="Разделы">' + tabs.map(function (t) {
      var isS = t[0] === 'studio';
      return '<button class="tabbar__item ' + (isS ? 'tabbar__item--studio ' : '') + (active === t[0] ? 'is-active' : '') + '" data-tab="' + t[0] + '" aria-current="' + (active === t[0] ? 'page' : 'false') + '">' +
        (isS ? '<span class="tabbar__orb">' + A.ic('mic') + '</span>' : A.ic(t[1])) + '<span>' + t[2] + '</span>' +
        (t[0] === 'community' ? '<span class="tabbar__badge">3</span>' : '') + '</button>';
    }).join('') + '</nav>';
  };
  A.miniplayer = function () {
    var p = A.state.playing; if (!p) return '';
    var b = A.beatById(p) || A.DATA.beats[0];
    return '<div class="miniplayer" data-go="player" role="button" tabindex="0">' +
      '<div class="cover cover--sm">' + A.cover(b.hue, 3) + '</div><div class="grow"><div class="li__title">' + A.esc(b.title) + '</div><div class="li__sub">' + A.esc(b.producer) + ' · ' + b.bpm + ' BPM</div></div>' +
      '<button class="icon-btn" data-act="toggle-play" aria-label="Пауза">' + A.ic(A.state.playPaused ? 'play' : 'pause') + '</button><button class="icon-btn icon-btn--sm" data-act="close-player" aria-label="Закрыть">' + A.ic('close') + '</button>' +
      '<div class="miniplayer__bar"><i style="--p:' + Math.round(A.state.playingPos * 100) + '%"></i></div></div>';
  };
  A.offlineBar = function () { return A.state.offline ? '<div class="offline">' + A.ic('wifiOff') + 'Нет соединения — показываем сохранённые данные</div>' : ''; };

  // ---- Router ----
  var root, overlay, toasts;
  A.mount = function (el) {
    root = el;
    root.innerHTML = '<div class="asq-screens" style="position:absolute;inset:0"></div><div class="asq-overlay"></div><div class="toast-stack"></div><div class="proto-hint"></div>';
    overlay = root.querySelector('.asq-overlay'); toasts = root.querySelector('.toast-stack');
    root.addEventListener('click', onClick);
    root.addEventListener('input', function (e) { if (e.target.classList.contains('range')) { var p = (e.target.value - e.target.min) / (e.target.max - e.target.min) * 100; e.target.style.setProperty('--p', p + '%'); var out = e.target.closest('.param') && e.target.closest('.param').querySelector('.param__value'); if (out) out.textContent = e.target.value + (e.target.dataset.unit || ''); } });
    A.render();
  };
  A.current = function () { return A.state.stack.length ? A.state.stack[A.state.stack.length - 1] : { name: A.state.tab }; };
  A.go = function (name, params, opts) {
    opts = opts || {};
    if (name === 'back') return A.back();
    if (!A.screens[name]) { A.toast('Экран «' + name + '» в прототип не входит', 'info'); return; }
    if (opts.root) { A.state.stack = []; A.state.tab = name; }
    else A.state.stack.push({ name: name, params: params || {} });
    A.render();
  };
  A.setTab = function (tab) { A.state.stack = []; A.state.tab = tab; A.render(); };
  A.back = function () { if (A.state.stack.length) A.state.stack.pop(); A.render(); };
  A.replace = function (name, params) { if (A.state.stack.length) A.state.stack.pop(); A.state.stack.push({ name: name, params: params || {} }); A.render(); };
  A.render = function () {
    var cur = A.current(); var def = A.screens[cur.name];
    var host = root.querySelector('.asq-screens');
    var html = def(cur.params || {});
    host.innerHTML = '<section class="screen ' + (def.modal ? 'screen--modal' : '') + '" data-screen="' + cur.name + '">' + html + '</section>';
    if (def.mount) def.mount(host.firstElementChild, cur.params || {});
    if (A.onRender) A.onRender(cur);
  };
  A.rerender = A.render;

  // ---- Overlays ----
  A.sheet = function (html, opts) {
    opts = opts || {};
    overlay.innerHTML = '<div class="scrim" data-act="dismiss"></div><div class="sheet" role="dialog" aria-modal="true"><div class="sheet__grip"></div>' + html + '</div>';
    if (opts.mount) opts.mount(overlay.querySelector('.sheet'));
  };
  A.dialog = function (o) {
    overlay.innerHTML = '<div class="scrim" data-act="dismiss"></div><div class="dialog" role="alertdialog" aria-modal="true">' +
      (o.icon ? '<div class="state__art ' + (o.tone === 'danger' ? '' : '') + '" style="margin:0 auto 4px;width:64px;height:64px;border-radius:20px;--ic:28px;' + (o.tone === 'danger' ? 'color:var(--danger);background:var(--danger-wash)' : 'color:var(--gold);background:var(--gold-wash)') + '">' + A.ic(o.icon) + '</div>' : '') +
      '<h2 class="dialog__title">' + o.title + '</h2>' + (o.text ? '<p class="dialog__text">' + o.text + '</p>' : '') +
      '<div class="dialog__actions"><button class="btn btn--secondary" data-act="dismiss">' + (o.cancel || 'Отмена') + '</button><button class="btn ' + (o.tone === 'danger' ? 'btn--danger' : 'btn--primary') + '" data-act="dialog-ok">' + (o.ok || 'Да') + '</button></div></div>';
    A._dialogOk = o.onOk;
  };
  A.dismiss = function () {
    var s = overlay.querySelector('.sheet'); if (s) { s.classList.add('is-leaving'); setTimeout(function () { overlay.innerHTML = ''; }, 180); } else overlay.innerHTML = '';
  };
  A.toast = function (text, tone, icon) {
    var el = document.createElement('div'); el.className = 'toast toast--' + (tone || 'info');
    el.innerHTML = A.ic(icon || (tone === 'success' ? 'circleCheck' : tone === 'error' ? 'xCircle' : 'info')) + '<span>' + text + '</span>';
    toasts.appendChild(el); setTimeout(function () { el.classList.add('is-leaving'); setTimeout(function () { el.remove(); }, 220); }, 2600);
  };
  A.hint = function (text) { var h = root.querySelector('.proto-hint'); h.textContent = text; h.classList.add('is-on'); clearTimeout(A._ht); A._ht = setTimeout(function () { h.classList.remove('is-on'); }, 1800); };

  // ---- Global delegated actions ----
  function onClick(e) {
    var t = e.target.closest('[data-go],[data-tab],[data-act],[data-sheet]'); if (!t) return;
    if (t.dataset.tab) { A.state.playPaused = A.state.playPaused; A.setTab(t.dataset.tab); return; }
    if (t.dataset.go) { var p = {}; if (t.dataset.id) p.id = t.dataset.id; if (t.dataset.params) try { p = Object.assign(p, JSON.parse(t.dataset.params)); } catch (x) {} A.go(t.dataset.go, p); return; }
    if (t.dataset.sheet) { var sh = A.sheets[t.dataset.sheet]; if (sh) sh(t.dataset); return; }
    var act = t.dataset.act;
    if (act === 'dismiss') return A.dismiss();
    if (act === 'dialog-ok') { A.dismiss(); if (A._dialogOk) A._dialogOk(); return; }
    if (act === 'toggle-play') { A.state.playPaused = !A.state.playPaused; A.render(); return; }
    if (act === 'close-player') { A.state.playing = null; A.render(); return; }
    if (act === 'play') { A.state.playing = t.dataset.id || A.DATA.beats[0].id; A.state.playPaused = false; A.render(); return; }
    if (act === 'like') { var id = t.dataset.id; A.state.likes[id] = !A.state.likes[id]; t.classList.toggle('is-on'); var c = t.querySelector('b'); if (c) c.textContent = +c.textContent + (A.state.likes[id] ? 1 : -1); return; }
    if (act === 'toast') { A.toast(t.dataset.text || 'Готово', t.dataset.tone || 'success'); return; }
    if (act === 'soon') { A.toast('В прототипе не реализовано', 'info'); return; }
    if (act === 'chip') { var g = t.parentElement; g.querySelectorAll('.chip').forEach(function (c) { c.classList.remove('is-active'); }); t.classList.add('is-active'); return; }
    if (act === 'seg') { var sg = t.parentElement; sg.querySelectorAll('.seg__item').forEach(function (c) { c.classList.remove('is-active'); }); t.classList.add('is-active'); if (t.dataset.show) { var scr = t.closest('.screen'); scr.querySelectorAll('[data-pane]').forEach(function (p) { p.hidden = p.dataset.pane !== t.dataset.show; }); } return; }
    if (act === 'tab') { var tb = t.parentElement; tb.querySelectorAll('.tabs__item').forEach(function (c) { c.classList.remove('is-active'); }); t.classList.add('is-active'); if (t.dataset.show) { var sc2 = t.closest('.screen'); sc2.querySelectorAll('[data-pane]').forEach(function (p) { p.hidden = p.dataset.pane !== t.dataset.show; }); } return; }
    if (act === 'toggle') { t.classList.toggle('is-on'); t.classList.toggle('is-active'); return; }
    if (A.actions && A.actions[act]) return A.actions[act](t, e);
  }
  A.actions = {}; A.sheets = {};
})();
