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
    try { localStorage.setItem('cs_image_slots', JSON.stringify(slots)); } catch (e) {}
  }

  function getSlot(id) {
    const v = slots[id];
    if (!v) return null;
    return typeof v === 'string' ? { u: v, s: 1, x: 0, y: 0 } : v;
  }

  function setSlot(id, val) {
    if (!id) return;
    if (val) slots[id] = val;
    else delete slots[id];
    saveStore();
    subs.forEach(fn => fn());
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
  const stylesheet =
    ':host{display:inline-block;position:relative;vertical-align:top;' +
    '  font:13px/1.3 system-ui,-apple-system,sans-serif;color:rgba(0,0,0,.55);width:240px;height:160px}' +
    '.frame{position:absolute;inset:0;overflow:hidden;background:rgba(0,0,0,.04)}' +
    '.frame img{position:absolute;max-width:none;transform:translate(-50%,-50%);' +
    '  -webkit-user-drag:none;user-select:none;touch-action:none;object-fit:cover;' +
    '  width:100%;height:100%;left:50%;top:50%;transform:translate(-50%,-50%)}' +
    '.empty{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;' +
    '  justify-content:center;gap:6px;text-align:center;padding:12px;box-sizing:border-box;' +
    '  cursor:pointer;user-select:none}' +
    '.empty svg{opacity:.45}' +
    '.empty .cap{max-width:90%;font-weight:500;letter-spacing:.01em}' +
    '.empty .sub{font-size:11px;color:rgba(0,0,0,.4)}' +
    ':host([data-over]) .frame{outline:2px solid #ec3d7a;outline-offset:-2px;' +
    '  background:rgba(236,61,122,.08)}' +
    '.ring{position:absolute;inset:0;pointer-events:none;border:1.5px dashed rgba(0,0,0,.18);' +
    '  transition:border-color .12s}' +
    ':host([data-over]) .ring{border-color:#ec3d7a}' +
    ':host([data-filled]) .ring{display:none}' +
    '.ctl{position:absolute;top:100%;left:50%;transform:translateX(-50%);padding-top:6px;' +
    '  display:flex;gap:5px;opacity:0;pointer-events:none;transition:opacity .12s;z-index:2;' +
    '  white-space:nowrap}' +
    ':host([data-filled]:hover) .ctl{opacity:1;pointer-events:auto}' +
    '.ctl button{appearance:none;border:0;border-radius:6px;padding:4px 9px;cursor:pointer;' +
    '  background:rgba(0,0,0,.6);color:#fff;font:11px/1 system-ui,-apple-system,sans-serif}' +
    '.ctl button:hover{background:rgba(0,0,0,.8)}' +
    '.err{position:absolute;left:8px;bottom:8px;right:8px;color:#b3261e;font-size:11px;' +
    '  background:rgba(255,255,255,.85);padding:4px 6px;border-radius:5px;pointer-events:none}';

  const icon =
    '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
    'stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' +
    '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>' +
    '<path d="m21 15-5-5L5 21"/></svg>';

  class ImageSlot extends HTMLElement {
    static get observedAttributes() {
      return ['shape', 'radius', 'mask', 'fit', 'position', 'placeholder', 'src', 'id'];
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
        '    <div class="sub">タップして写真を追加</div></div>' +
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
        const act = e.target && e.target.getAttribute && e.target.getAttribute('data-act');
        if (act === 'replace') { this._input.click(); }
        if (act === 'clear') {
          this._gen++;
          if (this.id) setSlot(this.id, null);
          else { this._local = null; this._render(); }
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
        if (this.id) setSlot(this.id, val);
        else { this._local = val; this._render(); }
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

      const stored = this.id ? getSlot(this.id) : this._local;
      const url = (stored && stored.u && /^data:image\//i.test(stored.u) ? stored.u : null)
                  || this.getAttribute('src') || '';

      this._cap.textContent = this.getAttribute('placeholder') || 'Drop an image';

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
