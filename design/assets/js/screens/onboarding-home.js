/* Screens: splash/onboarding, home, notifications */
(function (A) {
  var D = A.DATA, ic = A.ic;

  // ---------- Onboarding (3 steps + goal) ----------
  function onbArt(hue) {
    var bars = '';
    for (var i = 0; i < 28; i++) bars += '<rect x="' + (i * 14) + '" y="' + (120 - A.rand(hue + i) * 110) + '" width="8" height="' + (20 + A.rand(hue + i) * 110) + '" rx="4" fill="hsl(' + ((hue + i * 4) % 360) + ' 70% 60% / ' + (0.25 + A.rand(i) * 0.5) + ')"/>';
    return '<div class="onb__art"><svg viewBox="0 0 390 420" preserveAspectRatio="xMidYMid slice" width="100%" height="100%"><defs><radialGradient id="og' + hue + '" cx="70%" cy="20%" r="80%"><stop offset="0" stop-color="hsl(' + hue + ' 65% 35%)"/><stop offset="1" stop-color="#0E0D0B"/></radialGradient></defs><rect width="390" height="420" fill="url(#og' + hue + ')"/><g transform="translate(0 120)">' + bars + '</g><g transform="translate(0 260) scale(1 -1)" opacity="0.4">' + bars + '</g></svg></div>';
  }
  var ONB = [
    { hue: 40, eyebrow: 'ASIQPAI', title: 'Запиши трек прямо в Telegram', text: 'Выбери бит, запиши MID, BACK и ADLIBS, обработай вокал и сохрани WAV. Без DAW и без ноутбука.' },
    { hue: 290, eyebrow: 'AI Studio', title: 'AI подтянет вокал под бит', text: 'Vocal Slicer режет дубли на фразы, AI Fit выравнивает тайминг и тон. Ты решаешь, насколько сильно.' },
    { hue: 170, eyebrow: 'Сообщество', title: 'Выкладывай, находи фиты, зарабатывай', text: 'Публикуй демо, участвуй в челленджах продюсеров, покупай лицензии и получай роялти в кошелёк.' }
  ];
  A.screens.onboarding = function (p) {
    var step = p.step || 0; var s = ONB[step];
    return onbArt(s.hue) + '<div class="onb">' +
      '<div class="onb__dots">' + ONB.map(function (_, i) { return '<i class="' + (i === step ? 'is-active' : '') + '"></i>'; }).join('') + '</div>' +
      '<div class="stack" style="--gap:10px"><p class="t-label c-gold">' + s.eyebrow + '</p><h1 class="t-display">' + s.title + '</h1><p class="t-body c-2">' + s.text + '</p></div>' +
      '<div class="stack" style="--gap:8px;margin-top:8px"><button class="btn btn--primary btn--lg btn--block" data-act="onb-next" data-step="' + step + '">' + (step < 2 ? 'Дальше' : 'Начать') + ' ' + ic('arrowRight') + '</button>' +
      '<button class="btn btn--ghost btn--block" data-go="goal">Пропустить</button></div></div>';
  };
  A.screens.onboarding.modal = true;
  A.actions['onb-next'] = function (t) { var s = +t.dataset.step; if (s < 2) A.replace('onboarding', { step: s + 1 }); else A.replace('goal'); };

  A.screens.goal = function () {
    var goals = [['mic', 'Записать вокал', 'на готовый бит'], ['sparkles', 'Сделать AI-сэмплы', 'голос, фразы, адлибы'], ['music', 'Найти бит', 'и купить лицензию'], ['users', 'Найти фит', 'и показать работы']];
    var g = A.state.goal;
    return A.appbar({ back: true, title: '' }) + '<div class="screen__body screen__body--notab">' +
      '<div class="stack" style="--gap:8px"><p class="t-label c-gold">Шаг 1 из 1</p><h1 class="t-h1">Что хочешь сделать первым?</h1><p class="t-sm c-2">Настроим главный экран под тебя. Это можно поменять в профиле.</p></div>' +
      '<div class="goal-grid">' + goals.map(function (x, i) { return '<button class="goal ' + (g === i ? 'is-active' : '') + '" data-act="pick-goal" data-i="' + i + '">' + ic(x[0]) + '<b>' + x[1] + '</b><span>' + x[2] + '</span></button>'; }).join('') + '</div>' +
      '<div class="field"><label class="field__label" for="onb-name">Как тебя называть</label><input class="input" id="onb-name" placeholder="Сценическое имя" value="ARMAN.K"><span class="field__hint">Берём имя из Telegram, можно изменить</span></div>' +
      '</div><div class="footer-actions"><button class="btn btn--primary btn--lg btn--block ' + (g == null ? 'is-disabled' : '') + '" data-act="finish-onb">Продолжить</button></div>';
  };
  A.actions['pick-goal'] = function (t) { A.state.goal = +t.dataset.i; A.render(); };
  A.actions['finish-onb'] = function () { if (A.state.goal == null) return A.toast('Выбери одну цель', 'error'); A.state.onboarded = true; A.setTab('home'); A.toast('Добро пожаловать, ' + D.me.name, 'success', 'sparkles'); };

  // ---------- Home ----------
  A.screens.home = function () {
    var me = D.me; var hot = D.beats.filter(function (b) { return b.hot || b.free; }).concat(D.beats.slice(1, 4));
    var proj = D.projects[0]; var pb = A.beatById(proj.beat);
    return A.appbar({ cls: 'appbar--home', center: false,
      left: '<div class="brand"><span class="brand__mark">' + ic('mic', { style: '--ic:18px' }) + '</span><span class="brand__name">ASIQPAI</span></div>',
      title: '', right: '<button class="icon-btn" data-go="notifications" aria-label="Уведомления">' + ic('bell') + '<span class="icon-btn__dot"></span></button><button class="icon-btn" data-go="profile" aria-label="Профиль" style="padding:0">' + A.avatar(me.avatar, 40, '') + '</button>' }) +
      A.offlineBar() +
      '<div class="screen__body screen__body--player">' +
      // Hero: continue project or start
      '<div class="hero"><div class="hero__bars">' + [0, 1, 2, 3, 4, 5, 6].map(function (i) { return '<i style="animation-delay:' + (i * 0.15) + 's"></i>'; }).join('') + '</div>' +
      '<div class="row row--between"><span class="badge badge--gold">' + ic('history', { style: '--ic:12px' }) + ' Продолжить</span><span class="t-xs c-3">' + proj.updated + '</span></div>' +
      '<div class="stack" style="--gap:4px"><h2 class="t-h1">' + A.esc(proj.title) + '</h2><p class="t-sm c-2">' + A.esc(pb.producer) + ' · ' + pb.bpm + ' BPM · ' + pb.key + ' · 3 дорожки</p></div>' +
      '<div class="row"><button class="btn btn--primary grow" data-go="studio-record" data-id="' + proj.id + '">' + ic('mic') + ' Открыть студию</button><button class="icon-btn icon-btn--filled" data-act="play" data-id="' + pb.id + '" aria-label="Слушать">' + ic('play') + '</button></div></div>' +
      // Quick actions
      '<div class="quick"><button class="quick__item" data-go="beat-picker">' + ic('music') + 'Новая запись</button><button class="quick__item" data-go="samples">' + ic('sparkles') + 'AI Samples</button><button class="quick__item" data-go="slicer">' + ic('scissors') + 'Vocal Slicer</button><button class="quick__item" data-go="wallet">' + ic('wallet') + 'Кошелёк</button></div>' +
      // Credits strip
      '<button class="card card--tap row" data-go="wallet"><div class="li__icon li__icon--gold">' + ic('zap') + '</div><div class="grow"><div class="li__title">' + me.credits.toLocaleString('ru-RU') + ' AI-кредитов · план ' + me.plan + '</div><div class="li__sub">Хватит примерно на 24 AI Fit или 12 генераций</div></div>' + ic('forward', { cls: 'c-3' }) + '</button>' +
      // Beats of the week
      '<div class="section"><div class="section-head"><h3 class="t-h2">Биты недели</h3><button class="section-head__link" data-tab="music">Все</button></div><div class="hscroll">' +
      hot.slice(0, 5).map(function (b, i) { return '<div class="tile" role="button" tabindex="0" data-go="beat" data-id="' + b.id + '"><div class="cover cover--lg">' + A.cover(b.hue, i + 11) + (b.free ? '<span class="badge badge--success" style="position:absolute;top:8px;left:8px">FREE</span>' : '') + '<button class="icon-btn icon-btn--gold icon-btn--sm cover__play" data-act="play" data-id="' + b.id + '" aria-label="Слушать">' + ic('play') + '</button></div><span class="tile__title clamp-1">' + A.esc(b.title) + '</span><span class="tile__meta">' + A.esc(b.producer) + ' · ' + b.bpm + ' BPM</span></div>'; }).join('') + '</div></div>' +
      // Challenge
      '<div class="section"><div class="section-head"><h3 class="t-h2">Челлендж недели</h3></div>' +
      '<div class="card card--gold stack" style="--gap:10px"><div class="row row--between"><span class="badge badge--ai">' + ic('crown', { style: '--ic:12px' }) + ' Qara Prod</span><span class="t-xs c-3">до 20 окт · 41 заявка</span></div><h3 class="t-h3">Куплет на Kui 2.0</h3><p class="t-sm c-2">Лучшие 3 получают Premium-лицензию. Запиши прямо из карточки бита.</p><div class="row"><button class="btn btn--sm btn--outline" data-go="beat" data-id="b6">Открыть бит</button><button class="btn btn--sm btn--ghost" data-tab="community">Заявки</button></div></div></div>' +
      // Recent in community
      '<div class="section"><div class="section-head"><h3 class="t-h2">В сообществе</h3><button class="section-head__link" data-tab="community">Лента</button></div>' + A.postCard(D.posts[0], true) + '</div>' +
      '</div>' + A.miniplayer() + A.tabbar('home');
  };

  // ---------- Notifications ----------
  A.screens.notifications = function () {
    return A.appbar({ back: true, title: 'Уведомления', right: '<button class="icon-btn" data-act="toast" data-text="Все прочитаны" aria-label="Прочитать все">' + ic('check') + '</button>' }) +
      '<div class="screen__body screen__body--notab"><div class="list">' + D.notifications.map(function (n) {
        return '<button class="li"><div class="li__icon ' + (n.unread ? 'li__icon--gold' : '') + '">' + ic(n.icon) + '</div><div class="li__body"><span class="li__title" style="white-space:normal;font-weight:' + (n.unread ? 600 : 400) + '">' + n.text + '</span><span class="li__sub">' + n.time + '</span></div>' + (n.unread ? '<i style="width:8px;height:8px;border-radius:50%;background:var(--gold)"></i>' : '') + '</button>';
      }).join('') + '</div><p class="t-xs c-3" style="text-align:center">Уведомления также приходят в чат бота ASIQPAI</p></div>';
  };
})(ASQ);
