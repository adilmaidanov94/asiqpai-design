/* Screens: Music catalog, beat page, beat picker, license/checkout, full player */
(function (A) {
  var D = A.DATA, ic = A.ic;

  A.beatRow = function (b, i, opts) {
    opts = opts || {};
    return '<div class="beat-row"><div class="cover cover--md" data-go="beat" data-id="' + b.id + '" role="button">' + A.cover(b.hue, i + 21) + '</div>' +
      '<div class="grow stack" style="--gap:2px"><div class="row" style="--gap:6px"><span class="li__title">' + A.esc(b.title) + '</span>' + (b.free ? '<span class="badge badge--success">FREE</span>' : '') + (b.hot ? '<span class="badge badge--gold">' + ic('trending', { style: '--ic:11px' }) + ' ТОП</span>' : '') + '</div>' +
      '<span class="li__sub">' + A.esc(b.producer) + ' · ' + b.genre + '</span><div class="row" style="--gap:8px;margin-top:2px"><span class="kv"><b>' + b.bpm + '</b>BPM</span><span class="kv"><b>' + b.key + '</b></span><span class="kv">' + A.fmtTime(b.dur) + '</span></div></div>' +
      '<div class="stack" style="--gap:6px;align-items:flex-end"><span class="price">' + (b.free ? 'Бесплатно' : A.fmtMoney(b.price)) + '</span>' +
      (opts.pick ? '<button class="btn btn--sm btn--primary" data-act="pick-beat" data-id="' + b.id + '">Выбрать</button>' : '<button class="icon-btn icon-btn--filled icon-btn--sm" data-act="play" data-id="' + b.id + '" aria-label="Слушать">' + ic(A.state.playing === b.id && !A.state.playPaused ? 'pause' : 'play') + '</button>') + '</div></div>';
  };

  // ---------- Music (catalog) ----------
  A.screens.music = function (p) {
    var empty = p && p.empty;
    return A.appbar({ center: false, cls: 'appbar--home', title: 'Музыка', left: '', right: '<button class="icon-btn" data-sheet="filters" aria-label="Фильтры">' + ic('filter') + '</button>' }) +
      '<div class="screen__body screen__body--player screen__body--tight">' +
      '<div class="search">' + ic('search') + '<input class="input" id="music-search" placeholder="Бит, продюсер, BPM, тональность" ' + (empty ? 'value="phonk 170"' : '') + '></div>' +
      '<div class="hscroll" style="--gap:8px">' + D.genres.map(function (g, i) { return '<button class="chip ' + (i === 0 ? 'is-active' : '') + '" data-act="chip">' + g + '</button>'; }).join('') + '</div>' +
      '<div class="seg"><button class="seg__item is-active" data-act="seg" data-show="beats">Биты</button><button class="seg__item" data-act="seg" data-show="tracks">Треки</button><button class="seg__item" data-act="seg" data-show="producers">Продюсеры</button></div>' +
      '<div data-pane="beats" class="stack" style="--gap:4px">' + (empty ?
        '<div class="state"><div class="state__art">' + ic('search') + '</div><h3 class="state__title">Ничего не нашли</h3><p class="state__text">По запросу «phonk 170» битов нет. Попробуй другой жанр или сними фильтры.</p><div class="state__actions"><button class="btn btn--secondary" data-go="music" data-params="{}">Сбросить фильтры</button></div></div>' :
        '<div class="section-head"><h3 class="t-h3">Новое и популярное</h3><span class="t-xs c-3">' + D.beats.length + ' битов</span></div>' + D.beats.map(A.beatRow).join('')) + '</div>' +
      '<div data-pane="tracks" hidden class="stack" style="--gap:4px">' + D.projects.map(function (pr, i) { var b = A.beatById(pr.beat); return '<div class="beat-row"><div class="cover cover--md">' + A.cover(pr.hue, i + 41) + '</div><div class="grow"><div class="li__title">' + A.esc(pr.title) + '</div><div class="li__sub">' + D.me.name + ' · на бите ' + A.esc(b.title) + '</div></div><button class="icon-btn icon-btn--filled icon-btn--sm" data-act="play" data-id="' + b.id + '">' + ic('play') + '</button></div>'; }).join('') + '</div>' +
      '<div data-pane="producers" hidden class="list list--plain">' + ['Dias Beats', 'Qara Prod', 'NURZ', 'Aisha Wave'].map(function (n, i) { return '<div class="li">' + A.avatar(n.split(' ').map(function (w) { return w[0]; }).join(''), 30 + i * 70) + '<div class="li__body" data-act="soon" role="button"><span class="li__title">' + n + '</span><span class="li__sub">' + (12 + i * 7) + ' битов · ' + (1.2 + i * 0.8).toFixed(1) + 'K подписчиков</span></div><button class="btn btn--sm btn--outline" data-act="follow">Подписаться</button></div>'; }).join('') + '</div>' +
      '</div>' + A.miniplayer() + A.tabbar('music');
  };
  A.sheets.filters = function () {
    A.sheet('<div class="sheet__head"><h2 class="sheet__title">Фильтры</h2><button class="icon-btn" data-act="dismiss" aria-label="Закрыть">' + ic('close') + '</button></div><div class="sheet__body">' +
      '<div class="param"><div class="param__head"><span>BPM</span><span class="param__value">80 – 160</span></div><input class="range" type="range" min="60" max="200" value="120" style="--p:50%" aria-label="BPM"></div>' +
      '<div class="field"><span class="field__label">Тональность</span><div class="row row--wrap" style="--gap:8px">' + ['Любая', 'Am', 'Cm', 'Dm', 'Em', 'F#m', 'Gm'].map(function (k, i) { return '<button class="chip chip--sm ' + (i === 0 ? 'is-active' : '') + '" data-act="chip">' + k + '</button>'; }).join('') + '</div></div>' +
      '<div class="field"><span class="field__label">Настроение</span><div class="row row--wrap" style="--gap:8px">' + ['dark', 'warm', 'chill', 'epic', 'bright'].map(function (k) { return '<button class="chip chip--sm" data-act="toggle">' + k + '</button>'; }).join('') + '</div></div>' +
      '<label class="row row--between"><span>Только бесплатные</span><span class="switch"><input type="checkbox" id="f-free"></span></label>' +
      '<label class="row row--between"><span>Есть стемы</span><span class="switch"><input type="checkbox" id="f-stems" checked></span></label>' +
      '</div><div class="sheet__actions"><button class="btn btn--primary btn--lg" data-act="dismiss">Показать 14 битов</button><button class="btn btn--ghost" data-act="dismiss">Сбросить</button></div>');
  };

  // ---------- Beat page ----------
  A.screens.beat = function (p) {
    var b = A.beatById(p.id) || D.beats[0]; var playing = A.state.playing === b.id && !A.state.playPaused;
    return A.appbar({ back: true, title: '', right: '<button class="icon-btn" data-act="toggle" aria-label="В избранное">' + ic('heart') + '</button><button class="icon-btn" data-sheet="share" aria-label="Поделиться">' + ic('share') + '</button>' }) +
      '<div class="screen__body screen__body--notab">' +
      '<div class="row" style="--gap:16px;align-items:flex-start"><div class="cover cover--lg" style="width:120px">' + A.cover(b.hue, 7) + '</div><div class="grow stack" style="--gap:6px"><div class="row row--wrap" style="--gap:6px">' + (b.hot ? '<span class="badge badge--gold">ТОП недели</span>' : '') + (b.free ? '<span class="badge badge--success">FREE</span>' : '') + '<span class="badge">' + b.genre + '</span></div><h1 class="t-h1">' + A.esc(b.title) + '</h1><button class="row t-sm c-2" style="background:none;border:0;padding:0;--gap:8px" data-act="soon">' + A.avatar(b.producer.slice(0, 2).toUpperCase(), b.hue, '') .replace('avatar ', 'avatar --av:24px ') + A.esc(b.producer) + ' ' + ic('forward', { style: '--ic:14px' }) + '</button></div></div>' +
      '<div class="grid-3">' + [['BPM', b.bpm], ['Тональность', b.key], ['Длина', A.fmtTime(b.dur)]].map(function (x) { return '<div class="stat card" style="padding:12px;align-items:center;text-align:center"><span class="stat__value" style="font-size:18px">' + x[1] + '</span><span class="stat__label">' + x[0] + '</span></div>'; }).join('') + '</div>' +
      '<div class="card stack" style="--gap:10px"><div class="row"><button class="icon-btn icon-btn--gold icon-btn--lg" data-act="play" data-id="' + b.id + '" aria-label="' + (playing ? 'Пауза' : 'Слушать') + '">' + ic(playing ? 'pause' : 'play') + '</button><div class="grow" style="--wh:48px">' + A.wave(b.hue, 60, playing ? A.state.playingPos : null) + '</div></div><div class="player-time"><span>' + A.fmtTime(playing ? b.dur * A.state.playingPos : 0) + '</span><span>' + b.plays.toLocaleString('ru-RU') + ' прослушиваний</span><span>' + A.fmtTime(b.dur) + '</span></div></div>' +
      '<div class="section"><h3 class="t-h3">Структура</h3><div class="row" style="--gap:4px">' + [['Intro', 8], ['Verse', 16], ['Hook', 16], ['Verse', 16], ['Hook', 16], ['Outro', 8]].map(function (s, i) { return '<div style="flex:' + s[1] + ';height:36px;border-radius:8px;background:' + (i % 2 ? 'var(--gold-wash)' : 'var(--surface-2)') + ';display:grid;place-items:center;font-size:10px;font-weight:600;color:' + (i % 2 ? 'var(--gold-hi)' : 'var(--fg-3)') + '">' + s[0] + '</div>'; }).join('') + '</div><p class="t-xs c-3">Маркеры разделов переносятся в студию и показываются на таймлайне</p></div>' +
      '<div class="section"><h3 class="t-h3">Похожие биты</h3><div class="hscroll">' + D.beats.filter(function (x) { return x.id !== b.id; }).slice(0, 4).map(function (x, i) { return '<button class="tile" data-go="beat" data-id="' + x.id + '" style="width:120px"><div class="cover cover--lg" style="width:120px">' + A.cover(x.hue, i + 31) + '</div><span class="tile__title clamp-1">' + A.esc(x.title) + '</span><span class="tile__meta">' + x.bpm + ' BPM · ' + x.key + '</span></button>'; }).join('') + '</div></div>' +
      '</div><div class="footer-actions footer-actions--row"><button class="btn btn--secondary btn--lg" data-go="license" data-id="' + b.id + '">' + (b.free ? 'Лицензия' : A.fmtMoney(b.price)) + '</button><button class="btn btn--primary btn--lg" data-act="pick-beat" data-id="' + b.id + '">' + ic('mic') + ' Записать на бит</button></div>';
  };

  A.sheets.share = function () {
    A.sheet('<div class="sheet__head"><h2 class="sheet__title">Поделиться</h2><button class="icon-btn" data-act="dismiss">' + ic('close') + '</button></div><div class="sheet__body"><div class="grid-3">' + [['send', 'В Telegram'], ['copy', 'Скопировать'], ['users', 'В сообщество']].map(function (x) { return '<button class="quick__item" data-act="toast" data-text="Готово">' + ic(x[0]) + x[1] + '</button>'; }).join('') + '</div><div class="input t-mono c-2" style="display:flex;align-items:center;gap:8px">' + ic('link', { style: '--ic:16px' }) + 't.me/asiqpai_bot/app?startapp=b1</div></div>');
  };

  // ---------- Beat picker (entry to recording) ----------
  A.screens['beat-picker'] = function () {
    return A.appbar({ back: true, title: 'Выбери бит', sub: 'Шаг 1 из 3 · Новая запись' }) +
      '<div class="screen__body screen__body--notab screen__body--tight">' +
      '<div class="search">' + ic('search') + '<input class="input" id="picker-search" placeholder="Поиск по каталогу"></div>' +
      '<div class="seg"><button class="seg__item is-active" data-act="seg" data-show="all">Каталог</button><button class="seg__item" data-act="seg" data-show="mine">Мои биты</button><button class="seg__item" data-act="seg" data-show="upload">Загрузить</button></div>' +
      '<div data-pane="all" class="stack" style="--gap:4px">' + D.beats.map(function (b, i) { return A.beatRow(b, i, { pick: true }); }).join('') + '</div>' +
      '<div data-pane="mine" hidden class="state"><div class="state__art">' + ic('folder') + '</div><h3 class="state__title">Купленных битов пока нет</h3><p class="state__text">Купленные лицензии появятся здесь, а бесплатные биты можно брать из каталога сразу.</p></div>' +
      '<div data-pane="upload" hidden class="stack"><button class="card card--flat state" style="padding:32px 16px;border-style:dashed" data-act="toast" data-text="Файл загружен: my_beat.wav" data-tone="success"><div class="state__art" style="width:64px;height:64px;border-radius:20px;--ic:28px">' + ic('upload') + '</div><span class="t-h3">Загрузить свой бит</span><span class="t-sm c-2">WAV, MP3, AIFF до 50 МБ. BPM определим автоматически.</span></button><div class="banner banner--info">' + ic('info') + '<div class="banner__body">Для публикации трека на чужой бит нужна лицензия. Для своих файлов — нет.</div></div></div>' +
      '</div>';
  };
  A.actions['pick-beat'] = function (t) { A.state.studio.beat = t.dataset.id; A.state.stack = []; A.state.tab = 'studio'; A.go('studio-record', { fresh: true }); A.toast('Бит добавлен в проект', 'success'); };

  // ---------- License / checkout ----------
  A.screens.license = function (p) {
    var b = A.beatById(p.id) || D.beats[0];
    var L = [['Basic', b.price, 'MP3 + WAV · до 100 000 стримов · 1 релиз'], ['Premium', b.price * 2.2, 'WAV + стемы · до 1 000 000 стримов · клипы'], ['Exclusive', b.price * 9, 'Полные права · бит снимается с продажи']];
    var sel = A.state.cart && A.state.cart.lic != null ? A.state.cart.lic : 0;
    return A.appbar({ back: true, title: 'Лицензия', sub: A.esc(b.title) + ' · ' + A.esc(b.producer) }) +
      '<div class="screen__body screen__body--notab">' +
      '<div class="stack" style="--gap:10px">' + L.map(function (l, i) { return '<button class="license ' + (i === sel ? 'is-active' : '') + '" data-act="pick-lic" data-i="' + i + '" data-id="' + b.id + '"><span class="license__name"><span>' + l[0] + (i === 1 ? ' <span class="badge badge--gold">Популярная</span>' : '') + '</span><span class="price">' + A.fmtMoney(Math.round(l[1])) + '</span></span><span class="license__terms">' + l[2] + '</span></button>'; }).join('') + '</div>' +
      '<div class="card stack" style="--gap:8px"><div class="row row--between t-sm"><span class="c-2">Лицензия ' + L[sel][0] + '</span><span class="t-num">' + A.fmtMoney(Math.round(L[sel][1])) + '</span></div><div class="row row--between t-sm"><span class="c-2">Комиссия сервиса</span><span class="t-num">0 ₸</span></div><hr class="divider"><div class="row row--between"><b>Итого</b><b class="price" style="font-size:16px">' + A.fmtMoney(Math.round(L[sel][1])) + '</b></div></div>' +
      '<div class="section"><h3 class="t-h3">Способ оплаты</h3><div class="list">' + [['tgstar', 'Telegram Stars', 'Баланс: 2 300 ★', true], ['wallet', 'Баланс кошелька', A.fmtMoney(D.me.balance), false], ['cardIcon', 'Карта', 'Kaspi, Visa, Mastercard', false]].map(function (m, i) { return '<label class="li"><div class="li__icon">' + ic(m[0]) + '</div><div class="li__body"><span class="li__title">' + m[1] + '</span><span class="li__sub">' + m[2] + '</span></div><input type="radio" name="pay" ' + (m[3] ? 'checked' : '') + ' style="accent-color:var(--gold);width:20px;height:20px"></label>'; }).join('') + '</div></div>' +
      '<p class="t-xs c-3">Нажимая «Оплатить», ты принимаешь условия лицензии продюсера. Договор придёт в чат бота PDF-файлом.</p>' +
      '</div><div class="footer-actions"><button class="btn btn--primary btn--lg btn--block" data-act="pay" data-id="' + b.id + '">' + ic('lock') + ' Оплатить ' + A.fmtMoney(Math.round(L[sel][1])) + '</button></div>';
  };
  A.actions.follow = function (t) { var on = t.classList.toggle('is-on'); t.textContent = on ? 'Вы подписаны' : 'Подписаться'; t.classList.toggle('btn--outline', !on); t.classList.toggle('btn--secondary', on); };
  A.actions['pick-lic'] = function (t) { A.state.cart = { lic: +t.dataset.i }; A.render(); };
  A.actions.pay = function (t) {
    var btn = t; btn.classList.add('is-loading');
    setTimeout(function () { A.replace('purchase-success', { id: t.dataset.id }); }, 1100);
  };
  A.screens['purchase-success'] = function (p) {
    var b = A.beatById(p.id) || D.beats[0];
    return '<div class="screen__body screen__body--notab" style="justify-content:center"><div class="state state--success"><div class="state__art">' + ic('circleCheck') + '</div><h2 class="state__title">Лицензия куплена</h2><p class="state__text">«' + A.esc(b.title) + '» добавлен в библиотеку. Файлы и договор уже в чате бота.</p><div class="state__actions"><button class="btn btn--primary btn--lg" data-act="pick-beat" data-id="' + b.id + '">' + ic('mic') + ' Записать на бит</button><button class="btn btn--ghost" data-tab="library">В библиотеку</button></div></div></div>';
  };
  A.screens['purchase-success'].modal = true;

  // ---------- Full player ----------
  A.screens.player = function () {
    var b = A.beatById(A.state.playing) || D.beats[0]; var paused = A.state.playPaused; var pos = A.state.playingPos;
    return A.appbar({ left: '<button class="icon-btn" data-go="back" aria-label="Свернуть">' + ic('down') + '</button>', title: '<span class="t-label" style="color:var(--fg-3)">Сейчас играет</span>', right: '<button class="icon-btn" data-sheet="track-more">' + ic('more') + '</button>' }) +
      '<div class="screen__body screen__body--notab" style="justify-content:space-between">' +
      '<div class="player-art">' + A.cover(b.hue, 7) + '</div>' +
      '<div class="stack" style="--gap:20px"><div class="row row--between"><div class="grow stack" style="--gap:2px"><h2 class="t-h1 clamp-1">' + A.esc(b.title) + '</h2><p class="t-body c-2">' + A.esc(b.producer) + ' · ' + b.bpm + ' BPM · ' + b.key + '</p></div><button class="icon-btn" data-act="toggle" aria-label="В избранное">' + ic('heart') + '</button></div>' +
      '<div class="stack" style="--gap:6px"><input class="range" type="range" min="0" max="100" value="' + Math.round(pos * 100) + '" style="--p:' + Math.round(pos * 100) + '%" aria-label="Позиция"><div class="player-time"><span>' + A.fmtTime(b.dur * pos) + '</span><span>−' + A.fmtTime(b.dur * (1 - pos)) + '</span></div></div>' +
      '<div class="player-ctrls"><button class="icon-btn" data-act="toggle">' + ic('shuffle') + '</button><button class="icon-btn icon-btn--lg" data-act="toast" data-text="Предыдущий">' + ic('skipBack') + '</button><button class="icon-btn icon-btn--gold icon-btn--lg" style="width:76px;height:76px;--ic:32px" data-act="toggle-play" aria-label="' + (paused ? 'Играть' : 'Пауза') + '">' + ic(paused ? 'play' : 'pause') + '</button><button class="icon-btn icon-btn--lg" data-act="toast" data-text="Следующий">' + ic('skipFwd') + '</button><button class="icon-btn" data-act="toggle">' + ic('repeat') + '</button></div>' +
      '<div class="row" style="--gap:8px"><button class="btn btn--secondary grow" data-go="license" data-id="' + b.id + '">' + ic('tag') + ' ' + (b.free ? 'Free' : A.fmtMoney(b.price)) + '</button><button class="btn btn--primary grow" data-act="pick-beat" data-id="' + b.id + '">' + ic('mic') + ' Записать</button></div></div></div>';
  };
  A.screens.player.modal = true;
  A.sheets['track-more'] = function () {
    A.sheet('<div class="sheet__head"><h2 class="sheet__title">Трек</h2><button class="icon-btn" data-act="dismiss">' + ic('close') + '</button></div><div class="list list--plain">' + [['plusSquare', 'Добавить в плейлист'], ['users', 'Страница продюсера'], ['share', 'Поделиться'], ['flag', 'Пожаловаться']].map(function (x) { return '<button class="li" data-act="dismiss">' + ic(x[0], { cls: 'c-2' }) + '<span class="li__title">' + x[1] + '</span></button>'; }).join('') + '</div>');
  };
})(ASQ);
