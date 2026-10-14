/* ASIQPAI demo data — fictional artists/beats; no personal data. Used by the prototype. */
window.ASQ = window.ASQ || {};
ASQ.DATA = {
  me: { name: 'ARMAN.K', handle: '@armank', city: 'Алматы', plan: 'Pro', credits: 1240, balance: 18500, currency: '₸', avatar: 'AK',
        stats: { tracks: 12, followers: 1480, plays: 23600 } },
  beats: [
    { id: 'b1', title: 'Night Drive', producer: 'Dias Beats', bpm: 142, key: 'F#m', genre: 'Trap', price: 9900, mood: 'dark', plays: 2140, hue: 38, dur: 184, hot: true },
    { id: 'b2', title: 'Dala Wind', producer: 'Qara Prod', bpm: 96, key: 'Am', genre: 'Qazaq Pop', price: 7500, mood: 'warm', plays: 1320, hue: 320, dur: 203 },
    { id: 'b3', title: 'Glass Tower', producer: 'NURZ', bpm: 128, key: 'Cm', genre: 'Drill', price: 12000, mood: 'cold', plays: 980, hue: 205, dur: 171 },
    { id: 'b4', title: 'Sunday Boom', producer: 'Dias Beats', bpm: 88, key: 'Dm', genre: 'Boom Bap', price: 6000, mood: 'chill', plays: 3410, hue: 20, dur: 195, free: true },
    { id: 'b5', title: 'Neon Steppe', producer: 'Aisha Wave', bpm: 150, key: 'Gm', genre: 'Hyperpop', price: 9900, mood: 'bright', plays: 760, hue: 285, dur: 158 },
    { id: 'b6', title: 'Kui 2.0', producer: 'Qara Prod', bpm: 110, key: 'Em', genre: 'Ethno Trap', price: 8900, mood: 'epic', plays: 1890, hue: 160, dur: 210 }
  ],
  genres: ['Все', 'Trap', 'Drill', 'Qazaq Pop', 'Boom Bap', 'R&B', 'Hyperpop', 'Ethno'],
  samplePacks: [
    { id: 's1', title: 'Steppe Vocals Vol.1', kind: 'Vocal chops', n: 48, hue: 38, ai: true },
    { id: 's2', title: 'Dombra Phrases', kind: 'Melodic', n: 32, hue: 160, ai: false },
    { id: 's3', title: '808 Almaty', kind: 'Drums', n: 64, hue: 205, ai: false },
    { id: 's4', title: 'Adlib Kit · RU/KZ', kind: 'Adlibs', n: 120, hue: 320, ai: true }
  ],
  projects: [
    { id: 'p1', title: 'Night Drive — take 3', beat: 'b1', updated: 'сегодня, 14:20', dur: 184, state: 'draft', tracks: 3, hue: 38 },
    { id: 'p2', title: 'Dala Wind demo', beat: 'b2', updated: 'вчера', dur: 203, state: 'mixed', tracks: 3, hue: 320 },
    { id: 'p3', title: 'freestyle 09.10', beat: 'b4', updated: '09 окт', dur: 95, state: 'raw', tracks: 1, hue: 20 }
  ],
  exports: [
    { id: 'e1', title: 'Dala Wind demo', fmt: 'WAV 24-bit', size: '41,2 МБ', date: '13 окт', hue: 320 },
    { id: 'e2', title: 'Night Drive — take 2', fmt: 'MP3 320', size: '4,4 МБ', date: '11 окт', hue: 38 }
  ],
  posts: [
    { id: 'c1', user: 'Aisha Wave', handle: '@aishawave', av: 'AW', time: '12 мин', text: 'Записала хук на Neon Steppe за один дубль. AI Fit подтянул тайминг — послушайте и скажите честно 🙏', likes: 48, comments: 7, dur: 31, hue: 285, badge: 'Pro' },
    { id: 'c2', user: 'Dias Beats', handle: '@diasbeats', av: 'DB', time: '1 ч', text: 'Night Drive вышел в топ недели. Ищу вокалиста на фит — пишите в личку.', likes: 131, comments: 23, dur: 60, hue: 38, badge: 'Producer' },
    { id: 'c3', user: 'Qara Prod', handle: '@qaraprod', av: 'QP', time: '3 ч', text: 'Челлендж недели: куплет на Kui 2.0. Лучшие 3 — бесплатная лицензия Premium.', likes: 92, comments: 41, dur: 45, hue: 160, badge: 'Challenge' }
  ],
  tx: [
    { id: 't1', title: 'Пополнение · Telegram Stars', sub: 'сегодня, 10:02', amt: 5000, in: true },
    { id: 't2', title: 'Лицензия Basic · Night Drive', sub: 'вчера, 18:40', amt: -9900 },
    { id: 't3', title: 'AI-кредиты · 500', sub: '11 окт', amt: -2500 },
    { id: 't4', title: 'Роялти · Dala Wind demo', sub: '09 окт', amt: 1240, in: true }
  ],
  presets: [
    { id: 'pr1', name: 'Clean Vocal', desc: 'Лёгкая компрессия, деэссер, воздух', ai: false },
    { id: 'pr2', name: 'Trap Lead', desc: 'Autotune 60%, delay 1/8, яркий EQ', ai: true },
    { id: 'pr3', name: 'Qazaq Pop', desc: 'Тёплый ревер, мягкая сатурация', ai: true },
    { id: 'pr4', name: 'Raw / без обработки', desc: 'Только нормализация', ai: false }
  ],
  notifications: [
    { id: 'n1', icon: 'heart', text: 'Aisha Wave и ещё 12 оценили «Dala Wind demo»', time: '15 мин', unread: true },
    { id: 'n2', icon: 'sparkles', text: 'AI Fit готов: Night Drive — take 3', time: '1 ч', unread: true },
    { id: 'n3', icon: 'gift', text: '+100 AI-кредитов за приглашённого друга', time: 'вчера' }
  ]
};
