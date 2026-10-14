/* Screens: AI Studio hub, multitrack recording, FX/processing, Vocal Slicer / AI Fit, export */
(function (A) {
  var D = A.DATA, ic = A.ic, S = A.state.studio;
  var LANES = [['mid', 'MID', 'основной вокал', 'var(--trk-mid)'], ['back', 'BACK', 'даблы / бэки', 'var(--trk-back)'], ['adlibs', 'ADLIBS', 'адлибы', 'var(--trk-adlibs)']];

  // ---------- Studio hub ----------
  A.screens.studio = function () {
    return A.appbar({ cls: 'appbar--home', center: false, left: '', title: 'AI Studio', right: '<button class="icon-btn" data-sheet="studio-settings" aria-label="Настройки студии">' + ic('settings') + '</button>' }) +
      '<div class="screen__body screen__body--player">' +
      '<div class="grid-2"><button class="card card--gold card--tap stack" style="--gap:10px;min-height:150px" data-go="beat-picker">' + ic('mic', { style: '--ic:28px;color:var(--gold)' }) + '<div><div class="t-h3">Запись</div><div class="t-xs c-2">MID · BACK · ADLIBS на бит</div></div><span class="btn btn--sm btn--primary" style="align-self:flex-start">Новая</span></button>' +
      '<div class="stack" style="--gap:12px"><button class="card card--tap row" data-go="samples">' + ic('sparkles', { style: '--ic:24px;color:var(--gold)' }) + '<div class="grow"><div class="t-h3" style="font-size:14px">AI Samples</div><div class="t-xs c-3">голос → сэмплы</div></div></button><button class="card card--tap row" data-go="slicer">' + ic('scissors', { style: '--ic:24px;color:var(--gold)' }) + '<div class="grow"><div class="t-h3" style="font-size:14px">Vocal Slicer</div><div class="t-xs c-3">нарезка + AI Fit</div></div></button></div></div>' +
      '<div class="section"><div class="section-head"><h3 class="t-h2">Проекты</h3><button class="section-head__link" data-tab="library">Все</button></div><div class="list">' + D.projects.map(function (p, i) {
        var b = A.beatById(p.beat); var st = { draft: ['badge', 'Черновик'], mixed: ['badge badge--success', 'Сведён'], raw: ['badge badge--warning', 'Без обработки'] }[p.state];
        return '<button class="li" data-go="studio-record" data-id="' + p.id + '"><div class="cover cover--sm">' + A.cover(p.hue, i + 51) + '</div><div class="li__body"><span class="li__title">' + A.esc(p.title) + '</span><span class="li__sub">' + A.esc(b.title) + ' · ' + p.tracks + ' дор. · ' + p.updated + '</span></div><span class="' + st[0] + '">' + st[1] + '</span></button>';
      }).join('') + '</div></div>' +
      '<div class="section"><h3 class="t-h2">AI-пресеты обработки</h3><div class="hscroll">' + D.presets.map(function (p) { return '<button class="card tile" style="width:170px;padding:14px" data-sheet="preset" data-id="' + p.id + '"><div class="row row--between"><span class="t-h3" style="font-size:14px">' + p.name + '</span>' + (p.ai ? '<span class="badge badge--ai">AI</span>' : '') + '</div><span class="tile__meta clamp-2" style="white-space:normal">' + p.desc + '</span></button>'; }).join('') + '</div></div>' +
      '<div class="banner banner--gold">' + ic('zap') + '<div class="banner__body"><b>' + D.me.credits.toLocaleString('ru-RU') + ' AI-кредитов</b>AI Fit — 50, генерация сэмплов — 100, мастеринг — 80. <a style="color:var(--gold-hi)" data-go="wallet">Пополнить</a></div></div>' +
      '</div>' + A.miniplayer() + A.tabbar('studio');
  };
  A.sheets['studio-settings'] = function () {
    A.sheet('<div class="sheet__head"><h2 class="sheet__title">Настройки студии</h2><button class="icon-btn" data-act="dismiss">' + ic('close') + '</button></div><div class="sheet__body">' +
      '<label class="row row--between"><div><div>Мониторинг в наушниках</div><div class="t-xs c-3">Слышать себя во время записи</div></div><span class="switch"><input type="checkbox" checked id="st-mon"></span></label>' +
      '<label class="row row--between"><div><div>Метроном на вступлении</div><div class="t-xs c-3">4 клика перед стартом</div></div><span class="switch"><input type="checkbox" checked id="st-metro"></span></label>' +
      '<label class="row row--between"><div><div>Шумоподавление</div><div class="t-xs c-3">AI, работает при записи</div></div><span class="switch"><input type="checkbox" id="st-nr"></span></label>' +
      '<div class="field"><span class="field__label">Качество записи</span><div class="seg"><button class="seg__item" data-act="seg">44.1 / 16</button><button class="seg__item is-active" data-act="seg">48 / 24</button></div></div>' +
      '<div class="banner banner--info">' + ic('headphones') + '<div class="banner__body">Запись без наушников даст эхо от динамика: бит попадёт в микрофон.</div></div></div>');
  };
  A.sheets.preset = function (d) {
    var p = D.presets.filter(function (x) { return x.id === d.id; })[0];
    A.sheet('<div class="sheet__head"><h2 class="sheet__title">' + p.name + '</h2>' + (p.ai ? '<span class="badge badge--ai">AI</span>' : '') + '<button class="icon-btn" data-act="dismiss">' + ic('close') + '</button></div><div class="sheet__body"><p class="t-sm c-2">' + p.desc + '</p><div class="fx">' + fxRows().join('') + '</div></div><div class="sheet__actions"><button class="btn btn--primary btn--lg" data-act="dismiss">Применить к проекту</button></div>');
  };

  // ---------- Recording (multitrack) ----------
  function lane(key, name, sub, color, i) {
    var takes = S.takes[key]; var armed = S.armed === key; var empty = !takes;
    return '<div class="lane ' + (armed ? 'is-armed' : '') + (empty ? ' is-empty' : '') + '" style="--lc:' + color + '" data-act="arm" data-key="' + key + '">' +
      '<div class="lane__head"><span class="lane__name">' + name + '</span><span class="lane__sub">' + sub + '</span>' + (takes ? '<span class="lane__take">take ' + takes + ' · ' + (takes > 1 ? 'лучший' : '1 дубль') + '</span>' : '') + '</div>' +
      '<div class="lane__wave">' + (empty ? (armed ? 'Нажми запись' : 'Пусто · нажми, чтобы выбрать') : A.wave(i * 13 + 3, 44, S.pos, { silent: key === 'adlibs' ? [26, 40] : key === 'back' ? [14, 44] : null })) + '</div>' +
      '<div class="lane__ctrls"><button class="lane__ctrl is-mute" data-act="lane-mute" aria-label="Mute">M</button><button class="lane__ctrl is-solo" data-act="lane-solo" aria-label="Solo">S</button></div></div>';
  }
  A.screens['studio-record'] = function (p) {
    var b = A.beatById(S.beat) || D.beats[0]; var rec = S.recording; var proj = D.projects.filter(function (x) { return x.id === p.id; })[0];
    var title = proj ? proj.title : 'Новый проект';
    return A.appbar({ back: true, title: '<span class="clamp-1">' + A.esc(title) + '</span>', sub: A.esc(b.title) + ' · ' + b.bpm + ' BPM · ' + b.key, right: '<button class="icon-btn" data-sheet="project-more" aria-label="Ещё">' + ic('more') + '</button>' }) +
      '<div class="screen__body screen__body--notab screen__body--tight">' +
      // step strip
      '<div class="row" style="--gap:6px">' + ['Бит', 'Запись', 'Обработка', 'Экспорт'].map(function (s, i) { return '<div class="grow" style="text-align:center"><div class="progress" style="height:3px"><div class="progress__bar" style="--p:' + (i <= 1 ? '100%' : '0%') + '"></div></div><span class="t-xs ' + (i === 1 ? 'c-gold' : 'c-3') + '" style="display:block;margin-top:4px;font-weight:600">' + s + '</span></div>'; }).join('') + '</div>' +
      // transport
      '<div class="transport"><div class="transport__time">' + (rec ? '<span class="badge badge--rec" style="vertical-align:middle;margin-right:8px">REC</span>' : '') + A.fmtTime(b.dur * S.pos) + '<small>.' + (Math.round(S.pos * 1000) % 10) + '</small></div><div class="transport__meta"><span>' + b.bpm + ' BPM</span><span>·</span><span>4/4</span><span>·</span><span>Hook · такт 33</span></div></div>' +
      // lanes
      '<div class="lanes"><div class="lane" style="--lc:var(--trk-beat);opacity:0.85"><div class="lane__head"><span class="lane__name">BEAT</span><span class="lane__sub">' + A.esc(b.title) + '</span></div><div class="lane__wave">' + A.wave(99, 44, S.pos) + '</div><div class="lane__ctrls"><button class="lane__ctrl is-mute" data-act="lane-mute">M</button><button class="lane__ctrl" data-sheet="beat-vol" aria-label="Громкость">' + ic('volume', { style: '--ic:14px' }) + '</button></div></div>' +
      LANES.map(function (l, i) { return lane(l[0], l[1], l[2], l[3], i); }).join('') + '<div class="playhead" style="--x:calc(100px + (100% - 150px) * ' + S.pos + ')"></div></div>' +
      // input meter
      '<div class="row" style="--gap:10px"><span class="t-label">Вход</span><div class="meter grow">' + Array.apply(null, Array(24)).map(function (_, i) { var on = rec ? i < 17 : i < 6; return '<i class="' + (on ? 'on' : '') + (i > 18 ? ' hot' : '') + (i > 21 ? ' clip' : '') + '"></i>'; }).join('') + '</div><span class="t-mono c-3">' + (rec ? '−6 dB' : '−38 dB') + '</span></div>' +
      '<div class="transport__ctrls"><button class="icon-btn icon-btn--filled" data-act="toast" data-text="К началу" aria-label="В начало">' + ic('skipBack') + '</button><button class="icon-btn icon-btn--filled icon-btn--lg" data-act="toggle-play" aria-label="Играть">' + ic(A.state.playPaused === false ? 'pause' : 'play') + '</button><button class="rec-btn ' + (rec ? 'is-recording' : '') + '" data-act="rec" aria-label="' + (rec ? 'Стоп' : 'Запись') + '"><i></i></button><button class="icon-btn icon-btn--filled icon-btn--lg" data-act="toast" data-text="Переслушать дубль" aria-label="Переслушать">' + ic('rewind') + '</button><button class="icon-btn icon-btn--filled" data-sheet="takes" aria-label="Дубли">' + ic('layers') + '</button></div>' +
      '<p class="t-xs c-3" style="text-align:center">' + (rec ? 'Идёт запись дорожки ' + S.armed.toUpperCase() + '. Нажми ещё раз, чтобы остановить.' : 'Выбрана дорожка <b style="color:var(--fg)">' + S.armed.toUpperCase() + '</b>. Метроном даст 4 клика.') + '</p>' +
      '</div><div class="footer-actions footer-actions--row"><button class="btn btn--secondary btn--lg" data-go="slicer">' + ic('scissors') + ' Slicer</button><button class="btn btn--primary btn--lg" data-go="studio-fx">Обработка ' + ic('arrowRight') + '</button></div>';
  };
  A.screens['studio-record'].mount = function (el) {
    clearInterval(A._recT);
    if (S.recording) A._recT = setInterval(function () { S.pos = Math.min(0.98, S.pos + 0.004); var ph = el.querySelector('.playhead'); if (ph) ph.style.setProperty('--x', 'calc(100px + (100% - 150px) * ' + S.pos + ')'); var tt = el.querySelector('.transport__time'); if (tt) tt.lastChild.previousSibling.textContent = A.fmtTime((A.beatById(S.beat) || D.beats[0]).dur * S.pos); }, 100);
  };
  A.actions.arm = function (t) { if (S.recording) return; S.armed = t.dataset.key; A.render(); };
  A.actions['lane-mute'] = function (t, e) { e.stopPropagation(); t.classList.toggle('is-on'); };
  A.actions['lane-solo'] = function (t, e) { e.stopPropagation(); t.classList.toggle('is-on'); };
  A.actions.rec = function () {
    if (!S.recording) { S.recording = true; A.state.playPaused = false; A.hint('4 · 3 · 2 · 1'); A.render(); }
    else { S.recording = false; S.takes[S.armed] = (S.takes[S.armed] || 0) + 1; A.state.playPaused = true; A.render(); A.toast('Дубль ' + S.takes[S.armed] + ' сохранён на ' + S.armed.toUpperCase(), 'success', 'mic'); }
  };
  A.sheets.takes = function () {
    A.sheet('<div class="sheet__head"><h2 class="sheet__title">Дубли · ' + S.armed.toUpperCase() + '</h2><button class="icon-btn" data-act="dismiss">' + ic('close') + '</button></div><div class="sheet__body"><div class="list">' + [1, 2, 3].slice(0, Math.max(1, S.takes[S.armed] || 1)).map(function (n, i) { return '<div class="li"><input type="radio" name="take" ' + (i === 0 ? 'checked' : '') + ' style="accent-color:var(--gold);width:20px;height:20px"><div class="li__body"><span class="li__title">Take ' + n + (i === 0 ? ' <span class="badge badge--gold">лучший</span>' : '') + '</span><span class="li__sub">0:' + (41 + i * 3) + ' · ' + (i === 0 ? 'AI: тайминг 94%' : 'AI: тайминг ' + (80 - i * 9) + '%') + '</span></div><button class="icon-btn icon-btn--sm" data-act="toast" data-text="Играет take ' + n + '">' + ic('play') + '</button><button class="icon-btn icon-btn--sm c-3" data-act="del-take">' + ic('trash') + '</button></div>'; }).join('') + '</div><p class="t-xs c-3">AI оценивает попадание в сетку бита. Можно склеить лучшие фразы из разных дублей в Vocal Slicer.</p></div>');
  };
  A.actions['del-take'] = function () { A.dialog({ icon: 'trash', tone: 'danger', title: 'Удалить дубль?', text: 'Вернуть запись будет нельзя.', ok: 'Удалить', onOk: function () { A.toast('Дубль удалён', 'success'); } }); };
  A.sheets['beat-vol'] = function () { A.sheet('<div class="sheet__head"><h2 class="sheet__title">Громкость бита</h2><button class="icon-btn" data-act="dismiss">' + ic('close') + '</button></div><div class="sheet__body"><div class="param"><div class="param__head"><span>В наушниках при записи</span><span class="param__value">−8 dB</span></div><input class="range" type="range" min="-30" max="0" value="-8" data-unit=" dB" style="--p:73%"></div><div class="param"><div class="param__head"><span>В миксе</span><span class="param__value">−3 dB</span></div><input class="range" type="range" min="-30" max="0" value="-3" data-unit=" dB" style="--p:90%"></div></div>'); };
  A.sheets['project-more'] = function () {
    A.sheet('<div class="sheet__head"><h2 class="sheet__title">Проект</h2><button class="icon-btn" data-act="dismiss">' + ic('close') + '</button></div><div class="list list--plain">' + [['edit', 'Переименовать', 'soon'], ['music', 'Сменить бит', 'go:beat-picker'], ['copy', 'Дублировать проект', 'toast'], ['download', 'Экспорт', 'go:export'], ['trash', 'Удалить проект', 'del-proj']].map(function (x) { var a = x[2].indexOf('go:') === 0 ? 'data-go="' + x[2].slice(3) + '"' : 'data-act="' + x[2] + '" data-text="Готово"'; return '<button class="li" ' + a + '>' + ic(x[0], { cls: x[2] === 'del-proj' ? 'c-danger' : 'c-2' }) + '<span class="li__title ' + (x[2] === 'del-proj' ? 'c-danger' : '') + '">' + x[1] + '</span></button>'; }).join('') + '</div>');
  };
  A.actions['del-proj'] = function () { A.dismiss(); A.dialog({ icon: 'trash', tone: 'danger', title: 'Удалить проект?', text: 'Все дорожки и дубли будут удалены. Экспортированные файлы останутся в библиотеке.', ok: 'Удалить', onOk: function () { A.setTab('studio'); A.toast('Проект удалён', 'success'); } }); };

  // ---------- FX / processing ----------
  function fxRows() {
    return [['Autotune', 'ключ F#m · скорость 60%', 60, true], ['Компрессор', 'ratio 3:1 · −4 dB', 45, true], ['EQ · воздух', '+2.5 dB на 10 kHz', 55, true], ['Delay', '1/8 · feedback 25%', 30, true], ['Reverb', 'Plate · 1.4 s', 25, false], ['Деэссер', '6 kHz · −3 dB', 40, true]].map(function (f) {
      return '<div class="fx__row ' + (f[3] ? '' : 'is-off') + '"><span class="switch"><input type="checkbox" ' + (f[3] ? 'checked' : '') + ' aria-label="' + f[0] + '"></span><div class="fx__name">' + f[0] + '<small>' + f[1] + '</small></div><button class="knob" style="--a:' + f[2] + '%" data-sheet="fx-param" data-name="' + f[0] + '" aria-label="Настроить"><b>' + f[2] + '</b></button></div>';
    });
  }
  A.screens['studio-fx'] = function () {
    return A.appbar({ back: true, title: 'Обработка', sub: 'Шаг 3 из 4', right: '<button class="icon-btn" data-act="toast" data-text="A/B: оригинал" aria-label="Сравнить с оригиналом">' + ic('split') + '</button>' }) +
      '<div class="screen__body screen__body--notab screen__body--tight">' +
      '<div class="seg">' + LANES.map(function (l, i) { return '<button class="seg__item ' + (i === 0 ? 'is-active' : '') + '" data-act="seg" style="' + (i === 0 ? 'color:' + l[3] : '') + '">' + l[1] + '</button>'; }).join('') + '<button class="seg__item" data-act="seg">MASTER</button></div>' +
      '<div class="card stack" style="--gap:10px"><div class="row row--between"><span class="t-label">Пресет</span><span class="badge badge--ai">AI</span></div><div class="row"><div class="grow"><div class="t-h3">Trap Lead</div><div class="t-xs c-3">AI подобрал под бит Night Drive · F#m</div></div><button class="btn btn--sm btn--secondary" data-sheet="presets-pick">Сменить</button></div>' +
      '<div class="param"><div class="param__head"><span>Сила AI-обработки</span><span class="param__value">70%</span></div><input class="range" type="range" min="0" max="100" value="70" data-unit="%" style="--p:70%" aria-label="Сила обработки"><div class="row row--between t-xs c-3"><span>Естественно</span><span>Жёстко</span></div></div></div>' +
      '<div class="section"><div class="section-head"><h3 class="t-h3">Цепочка эффектов</h3><button class="section-head__link" data-act="toast" data-text="Сброшено к пресету">Сбросить</button></div><div class="fx">' + fxRows().join('') + '</div></div>' +
      '<div class="row"><button class="icon-btn icon-btn--gold icon-btn--lg" data-act="toggle-play" aria-label="Прослушать">' + ic('play') + '</button><div class="grow" style="--wh:40px;--wc:var(--trk-mid);--wpc:var(--trk-mid)">' + A.wave(5, 50, 0.4) + '</div></div>' +
      '<div class="banner">' + ic('info', { cls: 'c-gold' }) + '<div class="banner__body">Удерживай ' + ic('split', { style: '--ic:14px;display:inline;vertical-align:middle' }) + ' в шапке, чтобы услышать вокал без обработки.</div></div>' +
      '</div><div class="footer-actions footer-actions--row"><button class="btn btn--secondary btn--lg" data-act="ai-master">' + ic('sparkles') + ' AI-мастеринг <span class="btn__meta">80</span></button><button class="btn btn--primary btn--lg" data-go="export">Экспорт ' + ic('arrowRight') + '</button></div>';
  };
  A.sheets['fx-param'] = function (d) {
    A.sheet('<div class="sheet__head"><h2 class="sheet__title">' + d.name + '</h2><button class="icon-btn" data-act="dismiss">' + ic('close') + '</button></div><div class="sheet__body">' + [['Amount', 60, '%'], ['Attack', 12, ' ms'], ['Release', 120, ' ms'], ['Mix', 100, '%']].map(function (p) { return '<div class="param"><div class="param__head"><span>' + p[0] + '</span><span class="param__value">' + p[1] + p[2] + '</span></div><input class="range" type="range" min="0" max="' + (p[2] === '%' ? 100 : 300) + '" value="' + p[1] + '" data-unit="' + p[2] + '" style="--p:' + (p[1] / (p[2] === '%' ? 1 : 3)) + '%"></div>'; }).join('') + '</div><div class="sheet__actions"><button class="btn btn--primary" data-act="dismiss">Готово</button></div>');
  };
  A.sheets['presets-pick'] = function () {
    A.sheet('<div class="sheet__head"><h2 class="sheet__title">Пресеты</h2><button class="icon-btn" data-act="dismiss">' + ic('close') + '</button></div><div class="sheet__body"><div class="list">' + D.presets.map(function (p, i) { return '<button class="li" data-act="dismiss"><input type="radio" name="pr" ' + (i === 1 ? 'checked' : '') + ' style="accent-color:var(--gold);width:20px;height:20px"><div class="li__body"><span class="li__title">' + p.name + (p.ai ? ' <span class="badge badge--ai">AI</span>' : '') + '</span><span class="li__sub">' + p.desc + '</span></div></button>'; }).join('') + '</div></div>');
  };
  A.actions['ai-master'] = function (t) { A.go('ai-progress', { title: 'AI-мастеринг', steps: ['Анализ микса', 'Баланс частот', 'Громкость −14 LUFS', 'Готово'], next: 'export', cost: 80 }); };

  // ---------- Generic AI progress ----------
  A.screens['ai-progress'] = function (p) {
    return A.appbar({ title: '', right: '<button class="icon-btn" data-act="cancel-ai" aria-label="Отменить">' + ic('close') + '</button>' }) +
      '<div class="screen__body screen__body--notab" style="justify-content:center"><div class="gen-status"><div class="gen-orb">' + ic('sparkles') + '</div><div class="stack" style="--gap:6px"><h2 class="state__title">' + p.title + '</h2><p class="state__text" id="ai-eta">Обычно 20–40 секунд. Можно свернуть — пришлём уведомление.</p></div><div class="gen-steps" id="ai-steps">' + p.steps.map(function (s, i) { return '<div class="gen-step ' + (i === 0 ? 'is-active' : '') + '"><i>' + ic('check') + '</i>' + s + '</div>'; }).join('') + '</div><div class="progress" style="width:100%;max-width:260px"><div class="progress__bar" id="ai-bar" style="--p:8%"></div></div><span class="t-xs c-3">Спишется ' + p.cost + ' кредитов после успешного результата</span></div></div>' +
      '<div class="footer-actions"><button class="btn btn--ghost btn--block" data-act="cancel-ai">Отменить</button></div>';
  };
  A.screens['ai-progress'].modal = true;
  A.screens['ai-progress'].mount = function (el, p) {
    var steps = el.querySelectorAll('.gen-step'); var bar = el.querySelector('#ai-bar'); var i = 0; clearInterval(A._aiT);
    A._aiT = setInterval(function () {
      i++; if (i < steps.length) { steps[i - 1].className = 'gen-step is-done'; steps[i].className = 'gen-step is-active'; bar.style.setProperty('--p', Math.round(i / steps.length * 100) + '%'); }
      else { clearInterval(A._aiT); steps[steps.length - 1].className = 'gen-step is-done'; bar.style.setProperty('--p', '100%'); setTimeout(function () { if (p.fail) { A.replace('ai-error', p); } else { A.replace(p.next, p.nextParams || {}); A.toast(p.title + ': готово', 'success', 'sparkles'); } }, 400); }
    }, 900);
  };
  A.actions['cancel-ai'] = function () { clearInterval(A._aiT); A.dialog({ icon: 'alert', title: 'Отменить обработку?', text: 'Кредиты не спишутся. Результат не сохранится.', ok: 'Отменить', cancel: 'Продолжить', onOk: function () { A.back(); } }); };
  A.screens['ai-error'] = function (p) {
    return '<div class="screen__body screen__body--notab" style="justify-content:center"><div class="state state--error"><div class="state__art">' + ic('alert') + '</div><h2 class="state__title">Не получилось обработать</h2><p class="state__text">Сервер AI не ответил вовремя. Кредиты не списаны, дубли на месте.</p><div class="state__actions"><button class="btn btn--primary btn--lg" data-act="retry-ai">' + ic('refresh') + ' Повторить</button><button class="btn btn--ghost" data-go="back">Назад в студию</button></div><span class="t-xs c-3">Код: AI_TIMEOUT · 14:21</span></div></div>';
  };
  A.screens['ai-error'].modal = true;
  A.actions['retry-ai'] = function () { var cur = A.current().params; cur.fail = false; A.replace('ai-progress', cur); };

  // ---------- Vocal Slicer / AI Fit ----------
  A.screens.slicer = function (p) {
    var cuts = [8, 19, 31, 44, 57, 70, 83]; var sel = p.sel || 2;
    return A.appbar({ back: true, title: 'Vocal Slicer', sub: 'MID · take 1 · 0:41', right: '<button class="icon-btn" data-act="toast" data-text="Отменено" aria-label="Отменить">' + ic('rewind') + '</button>' }) +
      '<div class="screen__body screen__body--notab screen__body--tight">' +
      '<div class="seg"><button class="seg__item is-active" data-act="seg" data-show="slice">Нарезка</button><button class="seg__item" data-act="seg" data-show="fit">AI Fit</button><button class="seg__item" data-act="seg" data-show="pads">Пэды</button></div>' +
      '<div class="slicer"><div class="slicer__region" style="--l:' + cuts[sel] + '%;--w:' + (cuts[sel + 1] - cuts[sel]) + '%"></div>' + A.wave(5, 90, null) + cuts.map(function (c, i) { return '<div class="slicer__cut ' + (i === sel ? 'is-sel' : '') + '" style="--x:' + c + '%" data-n="' + (i + 1) + '"></div>'; }).join('') + '</div>' +
      '<div class="row row--between"><div class="row" style="--gap:8px"><button class="btn btn--sm btn--secondary" data-act="toast" data-text="AI нарезал по фразам: 7 кусков" data-tone="success">' + ic('sparkles') + ' По фразам</button><button class="btn btn--sm btn--secondary" data-act="toast" data-text="Нарезка по долям 1/4">По долям</button></div><span class="t-xs c-3 t-num">7 кусков</span></div>' +
      '<div data-pane="slice" class="stack">' +
      '<div class="card stack" style="--gap:10px"><div class="row row--between"><span class="t-h3">Кусок 3</span><span class="t-mono c-3">0:12.4 – 0:17.1</span></div><div class="row" style="--gap:8px"><button class="btn btn--sm btn--secondary grow" data-act="toast" data-text="Играет кусок 3">' + ic('play') + ' Прослушать</button><button class="btn btn--sm btn--secondary grow" data-act="toast" data-text="Заменено дублем 2" data-tone="success">' + ic('layers') + ' Из дубля 2</button><button class="btn btn--sm btn--secondary" data-act="toast" data-text="Кусок удалён" aria-label="Удалить">' + ic('trash') + '</button></div><div class="param"><div class="param__head"><span>Сдвиг</span><span class="param__value">+12 ms</span></div><input class="range" type="range" min="-100" max="100" value="12" data-unit=" ms" style="--p:56%"></div></div>' +
      '<div class="banner banner--info">' + ic('info') + '<div class="banner__body">Тапни по линии разреза, чтобы выбрать кусок; потяни — чтобы сдвинуть границу.</div></div></div>' +
      '<div data-pane="fit" hidden class="stack">' +
      '<div class="card stack" style="--gap:12px"><div class="row row--between"><div><div class="t-h3">AI Fit</div><div class="t-xs c-3">Подтянуть вокал под сетку и тональность бита</div></div><span class="badge badge--ai">AI</span></div>' +
      '<div class="param"><div class="param__head"><span>Тайминг</span><span class="param__value">80%</span></div><input class="range" type="range" min="0" max="100" value="80" data-unit="%" style="--p:80%"></div>' +
      '<div class="param"><div class="param__head"><span>Тон (F#m)</span><span class="param__value">50%</span></div><input class="range" type="range" min="0" max="100" value="50" data-unit="%" style="--p:50%"></div>' +
      '<label class="row row--between t-sm"><span>Сохранить дыхание и шумы</span><span class="switch"><input type="checkbox" checked id="fit-breath"></span></label>' +
      '<label class="row row--between t-sm"><span>Применить ко всем дорожкам</span><span class="switch"><input type="checkbox" id="fit-all"></span></label></div>' +
      '<div class="grid-2"><div class="card stack" style="--gap:4px"><span class="t-label">До</span><span class="stat__value c-3">71%</span><span class="t-xs c-3">попадание в сетку</span></div><div class="card card--gold stack" style="--gap:4px"><span class="t-label c-gold">После (оценка)</span><span class="stat__value c-gold">96%</span><span class="t-xs c-3">попадание в сетку</span></div></div>' +
      '<button class="btn btn--primary btn--lg btn--block" data-act="run-fit">' + ic('sparkles') + ' Запустить AI Fit <span class="btn__meta">50 кредитов</span></button></div>' +
      '<div data-pane="pads" hidden class="stack"><p class="t-sm c-2">Куски разложены по пэдам. Играй и записывай новый порядок на ADLIBS.</p><div class="pad-grid">' + Array.apply(null, Array(16)).map(function (_, i) { return '<button class="pad ' + (i < 7 ? (i === 2 ? 'is-active' : '') : 'is-empty') + '" data-act="pad">' + (i < 7 ? '<span>' + (i + 1) + '</span><small>0:0' + (i + 1) + '</small>' : '<span>+</span>') + '</button>'; }).join('') + '</div><div class="row"><button class="btn btn--secondary grow" data-act="toast" data-text="Пэды экспортированы в AI Samples" data-tone="success">' + ic('sparkles') + ' В AI Samples</button><button class="btn btn--secondary grow" data-act="toast" data-text="Записываем на ADLIBS">' + ic('mic') + ' Записать</button></div></div>' +
      '</div><div class="footer-actions footer-actions--row"><button class="btn btn--secondary btn--lg" data-go="back">Отмена</button><button class="btn btn--primary btn--lg" data-act="apply-slicer">Применить</button></div>';
  };
  A.actions.pad = function (t) { t.classList.add('is-active'); setTimeout(function () { if (!t.matches(':active')) t.classList.toggle('is-active', false); }, 180); };
  A.actions['run-fit'] = function () { A.go('ai-progress', { title: 'AI Fit', steps: ['Анализ сетки бита', 'Выравнивание тайминга', 'Коррекция тона', 'Рендер'], next: 'studio-fx', cost: 50 }); };
  A.actions['apply-slicer'] = function () { A.back(); A.toast('Нарезка применена к MID', 'success'); };

  // ---------- Export ----------
  A.screens.export = function () {
    return A.appbar({ back: true, title: 'Экспорт', sub: 'Шаг 4 из 4' }) +
      '<div class="screen__body screen__body--notab">' +
      '<div class="card row"><div class="cover cover--md">' + A.cover(38, 7) + '</div><div class="grow"><div class="li__title">Night Drive — take 3</div><div class="li__sub">3 дорожки · 3:04 · Trap Lead · −14 LUFS</div></div><button class="icon-btn icon-btn--filled" data-act="toggle-play">' + ic('play') + '</button></div>' +
      '<div class="section"><h3 class="t-h3">Формат</h3><div class="list">' + [['WAV 24-bit / 48 kHz', 'Без потерь · ≈ 41 МБ', true], ['WAV 16-bit / 44.1 kHz', 'CD-качество · ≈ 31 МБ', false], ['MP3 320 kbps', 'Для демо и мессенджеров · ≈ 7 МБ', false]].map(function (f) { return '<label class="li"><input type="radio" name="fmt" ' + (f[2] ? 'checked' : '') + ' style="accent-color:var(--gold);width:20px;height:20px"><div class="li__body"><span class="li__title">' + f[0] + '</span><span class="li__sub">' + f[1] + '</span></div></label>'; }).join('') + '</div></div>' +
      '<div class="section"><h3 class="t-h3">Что экспортировать</h3><div class="list">' + [['Сведённый микс', 'вокал + бит', true], ['Только вокал (a cappella)', 'MID + BACK + ADLIBS', false], ['Стемы по дорожкам', '3 файла, zip', false]].map(function (f) { return '<label class="li"><div class="li__body"><span class="li__title">' + f[0] + '</span><span class="li__sub">' + f[1] + '</span></div><span class="switch"><input type="checkbox" ' + (f[2] ? 'checked' : '') + '></span></label>'; }).join('') + '</div></div>' +
      '<div class="section"><h3 class="t-h3">Куда</h3><div class="grid-2"><label class="card row" style="padding:12px"><input type="checkbox" checked style="accent-color:var(--gold);width:20px;height:20px"><span class="t-sm">В чат бота</span></label><label class="card row" style="padding:12px"><input type="checkbox" checked style="accent-color:var(--gold);width:20px;height:20px"><span class="t-sm">В библиотеку</span></label></div></div>' +
      '<div class="banner banner--warning">' + ic('alert') + '<div class="banner__body"><b>Лицензия Basic не куплена</b>Экспорт микса доступен, публикация в сообществе и стриминг — после покупки лицензии.</div></div>' +
      '</div><div class="footer-actions"><button class="btn btn--primary btn--lg btn--block" data-act="do-export">' + ic('download') + ' Экспортировать WAV</button></div>';
  };
  A.actions['do-export'] = function () { A.go('ai-progress', { title: 'Рендер трека', steps: ['Сведение дорожек', 'Применение эффектов', 'Кодирование WAV', 'Отправка в чат'], next: 'export-success', cost: 0 }); };
  A.screens['export-success'] = function () {
    return '<div class="screen__body screen__body--notab" style="justify-content:center"><div class="state state--success"><div class="state__art">' + ic('circleCheck') + '</div><h2 class="state__title">Трек готов</h2><p class="state__text">Night Drive — take 3.wav (41,2 МБ) отправлен в чат бота и сохранён в библиотеке.</p><div class="state__actions"><button class="btn btn--primary btn--lg" data-sheet="publish">' + ic('users') + ' Опубликовать в сообществе</button><button class="btn btn--secondary" data-act="toast" data-text="Открываем чат бота">' + ic('send') + ' Открыть в чате</button><button class="btn btn--ghost" data-tab="library">В библиотеку</button></div></div></div>';
  };
  A.screens['export-success'].modal = true;
  A.sheets.publish = function () {
    A.sheet('<div class="sheet__head"><h2 class="sheet__title">Публикация</h2><button class="icon-btn" data-act="dismiss">' + ic('close') + '</button></div><div class="sheet__body"><div class="field"><label class="field__label" for="pub-title">Название</label><input class="input" id="pub-title" value="Night Drive (demo)"></div><div class="field"><label class="field__label" for="pub-text">Подпись</label><textarea class="textarea" id="pub-text" placeholder="Расскажи о треке. Хештеги работают."></textarea></div><div class="row row--wrap" style="--gap:8px"><button class="chip chip--sm is-active" data-act="toggle">#trap</button><button class="chip chip--sm" data-act="toggle">#challenge</button><button class="chip chip--sm" data-act="toggle">#ищуфит</button></div><label class="row row--between"><div><div>Открыть для фитов</div><div class="t-xs c-3">Другие смогут записать свою партию</div></div><span class="switch"><input type="checkbox" checked id="pub-feat"></span></label></div><div class="sheet__actions"><button class="btn btn--primary btn--lg" data-act="do-publish">Опубликовать</button></div>');
  };
  A.actions['do-publish'] = function () { A.dismiss(); A.setTab('community'); A.toast('Опубликовано в ленте', 'success'); };
})(ASQ);
