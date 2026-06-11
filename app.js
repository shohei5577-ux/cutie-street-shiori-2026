/* ============================================================
   CUTIE STREET 有明遠征しおり — interactions
   ============================================================ */
(function () {
  'use strict';

  var VALID = ['home', 'd16', 'd17', 'd18', 'gourmet', 'info'];
  var DAY_OF = { '2026-06-16': 'd16', '2026-06-17': 'd17', '2026-06-18': 'd18' };

  var tabs = Array.prototype.slice.call(document.querySelectorAll('.tab'));
  var pages = Array.prototype.slice.call(document.querySelectorAll('.page'));
  var scroller = document.querySelector('.pages');

  function showPage(id, opts) {
    if (VALID.indexOf(id) < 0) id = 'home';
    pages.forEach(function (p) {
      var on = p.id === 'page-' + id;
      p.classList.toggle('is-active', on);
    });
    tabs.forEach(function (t) {
      var on = t.dataset.tab === id;
      t.classList.toggle('is-active', on);
      if (on) t.setAttribute('aria-current', 'page');
      else t.removeAttribute('aria-current');
    });
    if (scroller) scroller.scrollTop = 0;
    window.scrollTo(0, 0);
    try { localStorage.setItem('cs_tab', id); } catch (e) {}
    if (!opts || !opts.fromPop) {
      try { history.replaceState({ tab: id }, '', '#' + id); } catch (e) { location.hash = id; }
    }
  }

  tabs.forEach(function (t) {
    t.addEventListener('click', function () { showPage(t.dataset.tab); });
  });

  // ホームのクイックリンク → ページ遷移
  document.querySelectorAll('[data-goto]').forEach(function (el) {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      showPage(el.dataset.goto);
    });
  });

  // 戻る/進む(ハッシュ変更)に追従
  window.addEventListener('hashchange', function () {
    var id = (location.hash || '').replace('#', '');
    if (VALID.indexOf(id) >= 0) showPage(id, { fromPop: true });
  });

  /* ---------- 初期ページ: ハッシュ → 当日 → 前回 → home ---------- */
  function pickInitial() {
    var h = (location.hash || '').replace('#', '');
    if (VALID.indexOf(h) >= 0) return h;
    var todayKey = isoToday();
    if (DAY_OF[todayKey]) return DAY_OF[todayKey];
    try {
      var saved = localStorage.getItem('cs_tab');
      if (VALID.indexOf(saved) >= 0) return saved;
    } catch (e) {}
    return 'home';
  }

  function isoToday() {
    var d = new Date();
    var m = ('0' + (d.getMonth() + 1)).slice(-2);
    var day = ('0' + d.getDate()).slice(-2);
    return d.getFullYear() + '-' + m + '-' + day;
  }

  showPage(pickInitial());

  /* ---------- 今日カード(ホーム) ---------- */
  (function () {
    var card = document.getElementById('today-card');
    if (!card) return;
    var kicker = document.getElementById('today-kicker');
    var title = document.getElementById('today-title');
    var sub = document.getElementById('today-sub');

    var TRIP = [
      { iso: '2026-06-16', tab: 'd16', label: '6.16 Day1', sub: '出発＆ライブ初日' },
      { iso: '2026-06-17', tab: 'd17', label: '6.17 Day2', sub: '研修＆ライブ2日目' },
      { iso: '2026-06-18', tab: 'd18', label: '6.18 Day3', sub: 'えらべる東京＆帰宅日' }
    ];
    var todayKey = isoToday();
    var match = null;
    for (var i = 0; i < TRIP.length; i++) { if (TRIP[i].iso === todayKey) { match = TRIP[i]; break; } }

    var target = 'd16';
    if (match) {
      kicker.textContent = 'TODAY';
      title.textContent = '今日は ' + match.label;
      sub.textContent = match.sub;
      target = match.tab;
      card.hidden = false;
    } else {
      // 出発までの日数(6/16 0:00 基準)
      var start = new Date(2026, 5, 16);
      var now = new Date();
      var startMid = new Date(start.getFullYear(), start.getMonth(), start.getDate());
      var nowMid = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      var days = Math.round((startMid - nowMid) / 86400000);
      if (days > 0) {
        kicker.textContent = 'COUNTDOWN';
        title.textContent = '東京遠征まで あと ' + days + '日';
        sub.textContent = 'Day1（6.16）の予定を見る';
        card.hidden = false;
      } else if (days <= 0 && days >= -3) {
        kicker.textContent = 'THANK YOU';
        title.textContent = 'おつかれさま！';
        sub.textContent = '最高の3日間でした';
        target = 'home';
        card.hidden = false;
      }
    }
    card.addEventListener('click', function () { showPage(target); });
  })();

  /* ---------- チェックリスト(永続化) ---------- */
  document.querySelectorAll('.todo__item').forEach(function (item) {
    var key = 'cs_chk_' + item.dataset.key;
    try { if (localStorage.getItem(key) === '1') item.classList.add('is-done'); } catch (e) {}
    item.addEventListener('click', function () {
      item.classList.toggle('is-done');
      try { localStorage.setItem(key, item.classList.contains('is-done') ? '1' : '0'); } catch (e) {}
    });
  });

  /* ---------- グルメ: お気に入り(♡)＋ カテゴリフィルタ ---------- */
  var gcatBtns = Array.prototype.slice.call(document.querySelectorAll('.gcat__btn'));
  var stores = Array.prototype.slice.call(document.querySelectorAll('.store'));
  var gEmpty = document.getElementById('gourmet-empty');
  var activeCat = 'all';

  function applyGourmetFilter() {
    var shown = 0;
    stores.forEach(function (s) {
      var show;
      if (activeCat === 'all') {
        show = true;
      } else if (activeCat === 'fav') {
        var fav = s.querySelector('.store__fav');
        show = !!(fav && fav.classList.contains('is-on'));
      } else {
        show = s.dataset.cat === activeCat;
      }
      s.classList.toggle('is-hidden', !show);
      if (show) shown++;
    });
    // 「行きたい」で1件も無いときだけ空状態を表示
    if (gEmpty) gEmpty.hidden = !(activeCat === 'fav' && shown === 0);
  }

  // お気に入りトグル(localStorage で永続化)。「行きたい」表示中は即反映
  document.querySelectorAll('.store__fav').forEach(function (btn) {
    var key = 'cs_fav_' + btn.dataset.key;
    try { if (localStorage.getItem(key) === '1') btn.classList.add('is-on'); } catch (e) {}
    btn.setAttribute('aria-pressed', btn.classList.contains('is-on') ? 'true' : 'false');
    btn.addEventListener('click', function () {
      btn.classList.toggle('is-on');
      var on = btn.classList.contains('is-on');
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      try { localStorage.setItem(key, on ? '1' : '0'); } catch (e) {}
      if (activeCat === 'fav') applyGourmetFilter();
    });
  });

  // カテゴリ切替
  gcatBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      activeCat = btn.dataset.cat;
      gcatBtns.forEach(function (b) {
        var on = b === btn;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      applyGourmetFilter();
    });
  });

  /* ---------- Service Worker ---------- */
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('./sw.js').catch(function (err) {
        console.warn('SW registration failed:', err);
      });
    });
    // 新しい SW が有効化されたら一度だけリロードして最新を反映
    var reloaded = false;
    navigator.serviceWorker.addEventListener('controllerchange', function () {
      if (reloaded) return;
      reloaded = true;
      window.location.reload();
    });
  }
})();
