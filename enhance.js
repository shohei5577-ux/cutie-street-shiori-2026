/* ============================================
   enhance.js
   Post-render DOM enhancements for accessibility,
   lazy loading, and external-link safety.
   Runs after kawaii-pro mounts (defer + MutationObserver).
   ============================================ */
(function () {
  'use strict';

  function injectSkipLink() {
    if (document.querySelector('.skip-link')) return;
    var a = document.createElement('a');
    a.href = '#root';
    a.className = 'skip-link';
    a.textContent = 'メインコンテンツへスキップ';
    document.body.insertBefore(a, document.body.firstChild);
  }

  function enhanceImages(root) {
    var imgs = (root || document).querySelectorAll('img:not([loading])');
    imgs.forEach(function (img) {
      // Skip the cover image (above the fold)
      if (img.src && img.src.indexOf('cover-oshi-trip') !== -1) {
        img.setAttribute('fetchpriority', 'high');
      } else {
        img.setAttribute('loading', 'lazy');
        img.setAttribute('decoding', 'async');
      }
    });
  }

  function enhanceExternalLinks(root) {
    var links = (root || document).querySelectorAll('a[target="_blank"]');
    links.forEach(function (a) {
      var rel = (a.getAttribute('rel') || '').toLowerCase();
      var parts = rel.split(/\s+/).filter(Boolean);
      if (parts.indexOf('noopener') === -1) parts.push('noopener');
      if (parts.indexOf('noreferrer') === -1) parts.push('noreferrer');
      a.setAttribute('rel', parts.join(' '));
    });
  }

  function enhanceButtons(root) {
    var buttons = (root || document).querySelectorAll('button:not([aria-label])');
    buttons.forEach(function (btn) {
      var text = (btn.textContent || '').trim();
      if (text.length > 0 && text.length < 50) {
        btn.setAttribute('aria-label', text);
      }
    });

    // Tab strip detection: any sibling group of buttons that act like tabs
    // (best-effort -- kawaii-pro's tab layout uses inline-styled buttons)
    var tabGroups = (root || document).querySelectorAll('[role="tablist"], [data-tablist]');
    tabGroups.forEach(function (group) {
      var tabs = group.querySelectorAll('button');
      tabs.forEach(function (tab) {
        if (!tab.getAttribute('role')) tab.setAttribute('role', 'tab');
      });
    });
  }

  function markEmptyPlaceholders(root) {
    // Find any text node that contains "ここに...を入力" and mark its
    // closest ancestor with data-empty="1" so override.css can dim it.
    var walker = document.createTreeWalker(
      root || document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: function (node) {
          return /ここに.+を入力/.test(node.nodeValue || '')
            ? NodeFilter.FILTER_ACCEPT
            : NodeFilter.FILTER_REJECT;
        }
      },
      false
    );
    var node;
    while ((node = walker.nextNode())) {
      var el = node.parentElement;
      if (el) el.setAttribute('data-empty', '1');
    }
  }

  function runAll(root) {
    enhanceImages(root);
    enhanceExternalLinks(root);
    enhanceButtons(root);
    markEmptyPlaceholders(root);
  }

  // Initial pass
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      injectSkipLink();
      runAll(document);
      observe();
    });
  } else {
    injectSkipLink();
    runAll(document);
    observe();
  }

  // Re-run on DOM changes (React re-renders, page switches)
  function observe() {
    var target = document.getElementById('root');
    if (!target) return;
    var debounce;
    var observer = new MutationObserver(function () {
      clearTimeout(debounce);
      debounce = setTimeout(function () {
        runAll(target);
      }, 200);
    });
    observer.observe(target, { childList: true, subtree: true });
  }
})();
