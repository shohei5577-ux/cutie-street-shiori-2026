// Booklet.jsx — shared 旅行のしおり booklet component with page-flip animation.
// Themed via `theme` prop. Content from window.TRIP.
//
// Three tabs at the top of the page, click to flip. Page flips around its
// left edge (rotateY 0 → -178deg) revealing the next page underneath.

const {
  useState,
  useRef,
  useEffect,
  useCallback
} = React;

// One-time keyframes / shared CSS — page-flip mechanics live here.
if (!document.getElementById('booklet-base-styles')) {
  const s = document.createElement('style');
  s.id = 'booklet-base-styles';
  s.textContent = `
    .book {
      position: relative; width: 100%; height: 100%;
      perspective: 2200px; perspective-origin: 50% 50%;
    }
    .book-tabs {
      position: relative; z-index: 5;
      display: flex; align-items: flex-end; gap: 2px;
      padding: 0 18px;
    }
    .book-stage {
      position: relative; flex: 1; min-height: 0;
      transform-style: preserve-3d;
    }
    .book-page {
      position: absolute; inset: 0;
      transform-origin: left center;
      backface-visibility: hidden;
      pointer-events: none; opacity: 0;
      transition: opacity .12s linear .25s;
    }
    .book-page.is-active {
      opacity: 1; pointer-events: auto;
      transition: opacity .05s linear 0s;
    }
    .book-page.is-flipping {
      z-index: 4; opacity: 1; pointer-events: none;
      animation: pageFlip 720ms cubic-bezier(.55,.05,.35,1) forwards;
      box-shadow:
        0 0 0 1px rgba(0,0,0,.05),
        14px 12px 30px rgba(0,0,0,.15);
    }
    .book-page.is-flipping::after {
      content: ''; position: absolute; inset: 0;
      pointer-events: none;
      background: linear-gradient(90deg,
        rgba(0,0,0,0) 50%,
        rgba(0,0,0,.06) 70%,
        rgba(0,0,0,.20) 92%,
        rgba(0,0,0,.32) 100%);
      animation: pageFlipShade 720ms cubic-bezier(.55,.05,.35,1) forwards;
    }
    @keyframes pageFlip {
      0%   { transform: rotateY(0deg); }
      100% { transform: rotateY(-178deg); }
    }
    @keyframes pageFlipShade {
      0%   { opacity: 0; }
      40%  { opacity: 1; }
      100% { opacity: 0; }
    }
    .book-page-body {
      position: absolute; inset: 0;
      overflow: hidden;
    }
    .book-shell { position: relative; width: 100%; height: 100%; display: flex; flex-direction: column; }
  `;
  document.head.appendChild(s);
}

// ─── Booklet ────────────────────────────────────────────────────────────────
// Renders the tab strip + 3D stage. Each `page` is { id, label, render }.
function Booklet({
  pages,
  theme,
  ariaLabel
}) {
  const [active, setActive] = useState(0);
  const [flipping, setFlipping] = useState(null);
  const lockRef = useRef(false);
  const goTo = useCallback(idx => {
    if (idx === active || lockRef.current) return;
    lockRef.current = true;
    setFlipping(active);
    setActive(idx);
    window.setTimeout(() => {
      setFlipping(null);
      lockRef.current = false;
    }, 720);
  }, [active]);
  const Tab = theme.Tab || DefaultTab;
  return /*#__PURE__*/React.createElement("div", {
    className: "book-shell",
    "aria-label": ariaLabel,
    style: theme.shellStyle
  }, /*#__PURE__*/React.createElement("div", {
    className: "book",
    style: theme.bookStyle
  }, /*#__PURE__*/React.createElement("div", {
    className: "book-tabs",
    style: theme.tabsStyle
  }, pages.map((p, i) => /*#__PURE__*/React.createElement(Tab, {
    key: p.id,
    label: p.label,
    icon: p.icon,
    active: i === active,
    onClick: () => goTo(i)
  }))), /*#__PURE__*/React.createElement("div", {
    className: "book-stage",
    style: theme.stageStyle
  }, pages.map((p, i) => {
    const shouldRender = i === active || i === flipping;
    const cls = ['book-page', i === active ? 'is-active' : '', i === flipping ? 'is-flipping' : ''].filter(Boolean).join(' ');
    return /*#__PURE__*/React.createElement("div", {
      key: p.id,
      className: cls,
      style: theme.pageStyle
    }, /*#__PURE__*/React.createElement("div", {
      className: "book-page-body"
    }, shouldRender ? p.render() : null));
  }))));
}
function DefaultTab({
  label,
  active,
  onClick
}) {
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    style: {
      padding: '10px 18px',
      border: 'none',
      cursor: 'pointer',
      background: active ? '#fff' : '#eee',
      borderRadius: '8px 8px 0 0',
      fontFamily: 'inherit',
      fontSize: 14
    }
  }, label);
}
window.Booklet = Booklet;
