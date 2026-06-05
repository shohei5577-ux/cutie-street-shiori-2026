/* ============================================================
   CUTIE STREET 有明遠征しおり — interactions
   ============================================================ */
(function () {
  'use strict';

  /* ---------- Tab navigation ---------- */
  var tabs = document.querySelectorAll('.tab');
  var pages = document.querySelectorAll('.page');

  function showPage(id) {
    pages.forEach(function (p) { p.classList.toggle('is-active', p.id === 'page-' + id); });
    tabs.forEach(function (t) { t.classList.toggle('is-active', t.dataset.tab === id); });
    var scroller = document.querySelector('.pages');
    if (scroller) scroller.scrollTop = 0;
    window.scrollTo(0, 0);
    try { localStorage.setItem('cs_tab', id); } catch (e) {}
    location.hash = id;
  }

  tabs.forEach(function (t) {
    t.addEventListener('click', function () { showPage(t.dataset.tab); });
  });

  var initial = (location.hash || '').replace('#', '');
  if (!initial) { try { initial = localStorage.getItem('cs_tab'); } catch (e) {} }
  var valid = ['top', 'd16', 'd17', 'd18', 'gourmet'];
  showPage(valid.indexOf(initial) >= 0 ? initial : 'top');

  /* ---------- Today's check (persisted) ---------- */
  document.querySelectorAll('.todo__item').forEach(function (item) {
    var key = 'cs_chk_' + item.dataset.key;
    try { if (localStorage.getItem(key) === '1') item.classList.add('is-done'); } catch (e) {}
    item.addEventListener('click', function () {
      item.classList.toggle('is-done');
      try { localStorage.setItem(key, item.classList.contains('is-done') ? '1' : '0'); } catch (e) {}
    });
  });

  /* ---------- Favourite toggles (gourmet) ---------- */
  document.querySelectorAll('.store__fav').forEach(function (btn) {
    var key = 'cs_fav_' + btn.dataset.key;
    try { if (localStorage.getItem(key) === '1') btn.classList.add('is-on'); } catch (e) {}
    btn.addEventListener('click', function () {
      btn.classList.toggle('is-on');
      try { localStorage.setItem(key, btn.classList.contains('is-on') ? '1' : '0'); } catch (e) {}
    });
  });

  /* ---------- Gourmet category filter (visual only) ---------- */
  document.querySelectorAll('.gcat__btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.gcat__btn').forEach(function (b) { b.classList.remove('is-active'); });
      btn.classList.add('is-active');
    });
  });
})();
