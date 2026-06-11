// <image-slot> custom element — user-fillable image placeholder.
// Allows drag-and-drop or click-to-browse image filling.
// Images persist across reloads via localStorage (base64).
// Outside the design tool environment, operates as a static display component.
(() => {
  const MAX_DIM = 1200;
  const ACCEPT = ['image/png', 'image/jpeg', 'image/webp', 'image/avif'];

  // ── Shared store via localStorage ──────────────────────────────────────────
  let slots = {};
  const subs = new Set();

  function loadStore() {
    try {
      const raw = localStorage.getItem('cs_image_slots');
      if (raw) slots = JSON.parse(raw);
    } catch (e) {}
  }

  function saveStore() {
    try { localStorage.setItem('cs_image_slots', JSON.stringify(slots)); return true; }
    catch (e) { return false; }
  }

  function getSlot(id) {
    const v = slots[id];
    if (!v) return null;
    return typeof v === 'string' ? { u: v, s: 1, x: 0, y: 0 } : v;
  }

  function setSlot(id, val) {
    if (!id) return true;
    if (val) slots[id] = val;
    else delete slots[id];
    const ok = saveStore();
    subs.forEach(fn => fn());
    return ok;
  }

  loadStore();

  // ── Image downscale ─────────────────────────────────────────────────────
  async function toDataUrl(file, targetW) {
    const bitmap = await createImageBitmap(file);
    try {
      const cap = Math.min(MAX_DIM, Math.max(1, Math.round(targetW * 2)) || MAX_DIM);
      const scale = Math.min(1, cap / Math.max(bitmap.width, bitmap.height));
      const w = Math.max(1, Math.round(bitmap.width * scale));
      const h = Math.max(1, Math.round(bitmap.height * scale));
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(bitmap, 0, 0, w, h);
      return canvas.toDataURL('image/webp', 0.85);
    } finally {
      bitmap.close && bitmap.close();
    }
  }

  // ── Custom element ──────────────────────────────────────────────────────
  // カテゴリ別のパステルグラデーション(空状態を「デザインされた枠」に見せる)
  const VARIANTS = {
    pink: 'linear-gradient(150deg,#ffe1ee,#ffc7dd)',
    lav:  'linear-gradient(150deg,#ece2fb,#d8c7f6)',
    blue: 'linear-gradient(150deg,#dceefb,#bfe0f4)',
    cream:'linear-gradient(150deg,#fff0db,#ffe2bd)'
  };

  const stylesheet =
    ':host{display:inline-block;position:relative;vertical-align:top;' +
    '  font:13px/1.4 "Zen Maru Gothic",system-ui,-apple-system,sans-serif;color:#7d6a75;width:240px;height:160px}' +
    '.frame{position:absolute;inset:0;overflow:hidden;background:var(--ph,linear-gradient(150deg,#ffe1ee,#ffc7dd))}' +
    '.frame img{position:absolute;max-width:none;' +
    '  -webkit-user-drag:none;user-select:none;touch-action:none;object-fit:cover;' +
    '  width:100%;height:100%;left:50%;top:50%;transform:translate(-50%,-50%)}' +
    '.empty{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;' +
    '  justify-content:center;gap:5px;text-align:center;padding:10px;box-sizing:border-box;' +
    '  cursor:pointer;user-select:none}' +
    '.empty .bubble{width:38px;height:38px;border-radius:50%;background:rgba(255,255,255,.7);' +
    '  display:grid;place-items:center;color:#d6286e;box-shadow:0 2px 6px rgba(180,80,120,.18)}' +
    '.empty .cap{max-width:92%;font-weight:700;color:#a35d7e;font-size:12px}' +
    '.empty .sub{font-size:10px;color:#b083a0;font-weight:700;letter-spacing:.02em}' +
    /* 小さい枠(ヒーロー写真など)では中身を縮め、見切れを防ぐ */
    ':host([data-compact]) .empty{gap:2px;padding:5px}' +
    ':host([data-compact]) .empty .bubble{width:26px;height:26px}' +
    ':host([data-compact]) .empty .bubble svg{width:15px;height:15px}' +
    ':host([data-compact]) .empty .cap{font-size:10px}' +
    ':host([data-compact]) .empty .sub{display:none}' +
    ':host([data-over]) .frame{outline:2px solid #ec3d7a;outline-offset:-2px}' +
    '.ring{position:absolute;inset:0;pointer-events:none;border:1.5px dashed rgba(214,40,110,.30);' +
    '  border-radius:inherit;transition:border-color .12s}' +
    ':host([data-over]) .ring{border-color:#ec3d7a}' +
    ':host([data-filled]) .ring{display:none}' +
    '.ctl{position:absolute;right:6px;bottom:6px;' +
    '  display:flex;gap:5px;opacity:0;pointer-events:none;transition:opacity .12s;z-index:2;' +
    '  white-space:nowrap}' +
    ':host([data-filled][data-show-ctl]) .ctl{opacity:1;pointer-events:auto}' +
    '@media(hover:hover){:host([data-filled]:hover) .ctl{opacity:1;pointer-events:auto}}' +
    '.ctl button{appearance:none;border:0;border-radius:14px;padding:5px 11px;cursor:pointer;' +
    '  background:rgba(40,20,30,.62);color:#fff;font:11px/1 "Zen Maru Gothic",system-ui,sans-serif;font-weight:700}' +
    '.ctl button:hover{background:rgba(40,20,30,.82)}' +
    '.err{position:absolute;left:8px;bottom:8px;right:8px;color:#b3261e;font-size:11px;' +
    '  background:rgba(255,255,255,.9);padding:4px 6px;border-radius:5px;pointer-events:none}';

  const icon =
    '<span class="bubble"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
    'stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<rect x="3" y="6" width="18" height="14" rx="2.5"/><path d="m8.5 6 1.4-2.5h4.2L15.5 6"/>' +
    '<circle cx="12" cy="13" r="3.2"/></svg></span>';

  class ImageSlot extends HTMLElement {
    static get observedAttributes() {
      return ['shape', 'radius', 'mask', 'fit', 'position', 'placeholder', 'label', 'variant', 'src', 'id'];
    }

    constructor() {
      super();
      const root = this.attachShadow({ mode: 'open' });
      root.innerHTML =
        '<style>' + stylesheet + '</style>' +
        '<div class="frame" part="frame">' +
        '  <img part="image" alt="" draggable="false" style="display:none">' +
        '  <div class="empty" part="empty">' + icon +
        '    <div class="cap"></div>' +
        '    <div class="sub">タップで写真を追加</div></div>' +
        '  <div class="ring" part="ring"></div>' +
        '</div>' +
        '<div class="ctl">' +
        '  <button data-act="replace">変更</button>' +
        '  <button data-act="clear">削除</button>' +
        '</div>' +
        '<input type="file" accept="' + ACCEPT.join(',') + '" hidden>';

      this._frame = root.querySelector('.frame');
      this._ring = root.querySelector('.ring');
      this._img = root.querySelector('.frame img');
      this._empty = root.querySelector('.empty');
      this._cap = root.querySelector('.cap');
      this._err = null;
      this._input = root.querySelector('input');
      this._depth = 0;
      this._gen = 0;
      this._subFn = () => this._render();

      this._empty.addEventListener('click', () => this._input.click());
      root.addEventListener('click', (e) => {
        const act = e.target && e.target.closest && e.target.closest('[data-act]');
        const action = act && act.getAttribute('data-act');
        if (action === 'replace') { this._input.click(); return; }
        if (action === 'clear') {
          this._gen++;
          this.removeAttribute('data-show-ctl');
          if (this.id) setSlot(this.id, null);
          else { this._local = null; this._render(); }
          return;
        }
        // 写真が入っている状態でタップしたら操作ボタンを表示/非表示(モバイル向け)
        if (this.hasAttribute('data-filled')) {
          this.toggleAttribute('data-show-ctl');
        }
      });
      this._input.addEventListener('change', () => {
        const f = this._input.files && this._input.files[0];
        if (f) this._ingest(f);
        this._input.value = '';
      });
    }

    connectedCallback() {
      this.addEventListener('dragenter', this);
      this.addEventListener('dragover', this);
      this.addEventListener('dragleave', this);
      this.addEventListener('drop', this);
      subs.add(this._subFn);
      this._ro = new ResizeObserver(() => this._render());
      this._ro.observe(this);
      this._render();
    }

    disconnectedCallback() {
      subs.delete(this._subFn);
      this.removeEventListener('dragenter', this);
      this.removeEventListener('dragover', this);
      this.removeEventListener('dragleave', this);
      this.removeEventListener('drop', this);
      if (this._ro) { this._ro.disconnect(); this._ro = null; }
    }

    attributeChangedCallback() { if (this.shadowRoot) this._render(); }

    handleEvent(e) {
      if (e.type === 'dragenter' || e.type === 'dragover') {
        e.preventDefault(); e.stopPropagation();
        if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
        if (e.type === 'dragenter') this._depth++;
        this.setAttribute('data-over', '');
      } else if (e.type === 'dragleave') {
        if (--this._depth <= 0) { this._depth = 0; this.removeAttribute('data-over'); }
      } else if (e.type === 'drop') {
        e.preventDefault(); e.stopPropagation();
        this._depth = 0;
        this.removeAttribute('data-over');
        const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
        if (f) this._ingest(f);
      }
    }

    async _ingest(file) {
      this._setError(null);
      if (!file || ACCEPT.indexOf(file.type) < 0) {
        this._setError('PNG / JPEG / WebP / AVIF のみ対応しています。');
        return;
      }
      const gen = ++this._gen;
      try {
        const w = this.clientWidth || this.offsetWidth || MAX_DIM;
        const url = await toDataUrl(file, w);
        if (gen !== this._gen) return;
        const val = { u: url };
        if (this.id) {
          const ok = setSlot(this.id, val);
          if (!ok) this._setError('写真が大きすぎて保存できませんでした。');
        } else { this._local = val; this._render(); }
      } catch (err) {
        if (gen !== this._gen) return;
        this._setError('画像を読み込めませんでした。');
      }
    }

    _setError(msg) {
      if (this._err) { this._err.remove(); this._err = null; }
      if (!msg) return;
      const d = document.createElement('div');
      d.className = 'err'; d.textContent = msg;
      this.shadowRoot.appendChild(d);
      this._err = d;
      setTimeout(() => { if (this._err === d) { d.remove(); this._err = null; } }, 3000);
    }

    _render() {
      const mask = this.getAttribute('mask');
      const shape = (this.getAttribute('shape') || 'rounded').toLowerCase();
      let radius = '';
      if (shape === 'circle') radius = '50%';
      else if (shape === 'pill') radius = '9999px';
      else if (shape === 'rounded') {
        const n = parseFloat(this.getAttribute('radius'));
        radius = (Number.isFinite(n) ? n : 12) + 'px';
      }
      this._frame.style.borderRadius = mask ? '' : radius;
      this._frame.style.clipPath = mask || '';
      this._ring.style.borderRadius = mask ? '' : radius;

      // カテゴリ別グラデーション(空状態のデザイン)
      const variant = (this.getAttribute('variant') || 'pink').toLowerCase();
      this._frame.style.setProperty('--ph', VARIANTS[variant] || VARIANTS.pink);

      // 小さい枠ではコンパクト表示に切り替え(見切れ防止)
      const h = this.clientHeight || 0;
      if (h > 0) this.toggleAttribute('data-compact', h < 92);

      const stored = this.id ? getSlot(this.id) : this._local;
      const url = (stored && stored.u && /^data:image\//i.test(stored.u) ? stored.u : null)
                  || this.getAttribute('src') || '';

      this._cap.textContent = this.getAttribute('label') || this.getAttribute('placeholder') || '写真';

      if (url) {
        if (this._img.getAttribute('src') !== url) this._img.src = url;
        this._img.style.display = 'block';
        this._empty.style.display = 'none';
        this.setAttribute('data-filled', '');
      } else {
        this._img.style.display = 'none';
        this._img.removeAttribute('src');
        this._empty.style.display = 'flex';
        this.removeAttribute('data-filled');
      }
    }
  }

  if (!customElements.get('image-slot')) {
    customElements.define('image-slot', ImageSlot);
  }
})();
