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

  function findHotelCard() {
    // Detect Hotel page by the "HOTEL / 全2泊" kicker.
    var headings = document.querySelectorAll('div, span');
    for (var i = 0; i < headings.length; i++) {
      var t = (headings[i].textContent || '').trim();
      if (t === 'HOTEL / 全2泊' || /^HOTEL\s*\/\s*全\d+泊$/.test(t)) {
        // walk up to the surrounding card
        var card = headings[i];
        for (var hops = 0; hops < 6 && card.parentElement; hops++) {
          card = card.parentElement;
          if (card.style && (card.style.padding || card.style.borderRadius)) {
            return card;
          }
        }
        return headings[i].parentElement;
      }
    }
    return null;
  }

  function injectEmergencyDetails() {
    if (!window.TRIP || !window.TRIP.emergency) return;
    if (document.getElementById('emergency-details')) return; // idempotent
    var hotelCard = findHotelCard();
    if (!hotelCard) return;

    var em = window.TRIP.emergency;
    var hospitals = Array.isArray(em.hospitals) ? em.hospitals : [];

    var wrap = document.createElement('details');
    wrap.id = 'emergency-details';
    wrap.setAttribute('data-print', 'show');
    wrap.style.cssText = [
      'margin-top:14px',
      'padding:12px 14px',
      'background:#fff5f5',
      'border:1.5px dashed #ff6b9d',
      'border-radius:12px',
      'font-size:13px',
      'color:#3b1f2e',
      'line-height:1.6'
    ].join(';');

    var summary = document.createElement('summary');
    summary.style.cssText = 'cursor:pointer;font-weight:700;color:#c8366a;outline:none;';
    summary.textContent = '🚑 緊急 / 病院 (タップで展開)';
    wrap.appendChild(summary);

    var num = document.createElement('div');
    num.style.cssText = 'margin-top:8px;font-weight:600;';
    num.textContent = em.emergencyNumbers || '救急車 119 / #7119';
    wrap.appendChild(num);

    if (hospitals.length) {
      var list = document.createElement('div');
      list.style.cssText = 'margin-top:10px;display:grid;gap:8px;';
      hospitals.forEach(function (h) {
        var row = document.createElement('div');
        row.style.cssText = 'padding:8px 10px;background:#fff;border-radius:10px;box-shadow:0 0 0 1px rgba(255,107,157,.25);';
        var safeTel = (h.tel || '').replace(/[^0-9#+\-]/g, '');
        var telPart = safeTel
          ? '<a href="tel:' + safeTel + '" style="color:#c8366a;font-weight:700;text-decoration:none;">' + h.tel + '</a>'
          : '';
        row.innerHTML =
          '<div style="font-weight:700;color:#c8366a;">' + (h.area || '') + ' / ' + (h.name || '') + '</div>' +
          (telPart ? '<div style="margin-top:2px;">📞 ' + telPart + '</div>' : '') +
          (h.note ? '<div style="margin-top:2px;font-size:12px;color:rgba(59,31,46,.7);">' + h.note + '</div>' : '');
        list.appendChild(row);
      });
      wrap.appendChild(list);
    }

    hotelCard.appendChild(wrap);
  }

  function runAll(root) {
    enhanceImages(root);
    enhanceExternalLinks(root);
    enhanceButtons(root);
    markEmptyPlaceholders(root);
    injectEmergencyDetails();
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
