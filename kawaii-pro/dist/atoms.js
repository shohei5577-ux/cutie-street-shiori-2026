// atoms.jsx — palettes, theme context, shared atoms, helpers
// Attaches everything to window.KP for the other booklet files to consume.

(function () {
  const {
    useState,
    useEffect,
    useContext,
    createContext,
    useRef
  } = React;

  // ── Color palettes (swap via Tweaks) ────────────────────────────────
  const PALETTES = {
    pink: {
      key: 'pink',
      name: 'ピンク',
      paperA: '#fff5f4',
      paperB: '#ffe7eb',
      paperC: '#fff9f0',
      ink: '#3b1f2e',
      soft: '#7a4a5c',
      primary: '#ff7aa8',
      primaryD: '#e9457f',
      cool: '#c4a8e5',
      coolD: '#7a5dc0',
      // lav
      warm: '#fde58a',
      warmD: '#c79c2a',
      // yellow
      green: '#9bd9c1',
      greenD: '#3a9a72',
      // mint
      blue: '#a8c8f0',
      blueD: '#2a6f9e',
      orange: '#ffc4a8',
      orangeD: '#c95a2a',
      line: '#f0c4cf',
      shellGrad: 'linear-gradient(160deg,#fef0f3 0%,#ffe6d6 60%,#ffe1eb 100%)',
      tabBgs: ['#ffc9d8', '#d7c4f5', '#bfe8f5', '#fde9a1', '#ffd2b5', '#c4eccc', '#f0d8b5', '#dfdcf7'],
      tabInks: ['#8a2e51', '#4d3a78', '#1e556e', '#7a5a18', '#8a3c1e', '#1f6b3e', '#7a4a18', '#3a3a78']
    },
    lavender: {
      key: 'lavender',
      name: 'ラベンダー',
      paperA: '#f7f4fc',
      paperB: '#ece4f8',
      paperC: '#fbf6f9',
      ink: '#2a1f3e',
      soft: '#5a4a75',
      primary: '#a888e8',
      primaryD: '#7a5dc0',
      cool: '#9ec0f0',
      coolD: '#3a6fbc',
      warm: '#ffd6a5',
      warmD: '#c9762a',
      green: '#a8e0c4',
      greenD: '#3a9a72',
      blue: '#a8c8f0',
      blueD: '#2a6f9e',
      orange: '#ffc0d4',
      orangeD: '#c95a85',
      line: '#d6c8eb',
      shellGrad: 'linear-gradient(160deg,#efeafd 0%,#dde7fa 60%,#f0e4f7 100%)',
      tabBgs: ['#d2c4f5', '#bfe8f5', '#ffd2b5', '#fde9a1', '#ffc4dc', '#c4eccc', '#dfdcf7', '#f0c4d4'],
      tabInks: ['#4d3a78', '#1e556e', '#8a3c1e', '#7a5a18', '#8a2e51', '#1f6b3e', '#3a3a78', '#8a2e4a']
    },
    mint: {
      key: 'mint',
      name: 'ミント',
      paperA: '#f3faf5',
      paperB: '#e0f1e6',
      paperC: '#fbfaf0',
      ink: '#1f2e26',
      soft: '#4a6a57',
      primary: '#6dc89d',
      primaryD: '#2f9a6a',
      cool: '#a8c8f0',
      coolD: '#2a6f9e',
      warm: '#fde58a',
      warmD: '#c79c2a',
      green: '#a0d3a4',
      greenD: '#3a8a48',
      blue: '#9bd2e2',
      blueD: '#2a8a9e',
      orange: '#ffc0a0',
      orangeD: '#c95a2a',
      line: '#c4e2d2',
      shellGrad: 'linear-gradient(160deg,#e6f6ec 0%,#dff0e7 60%,#f0f6e0 100%)',
      tabBgs: ['#bfe6cd', '#bfe8f5', '#fde9a1', '#ffd2b5', '#d2c4f5', '#ffc9d8', '#dfecc4', '#c4ecdc'],
      tabInks: ['#1f6b3e', '#1e556e', '#7a5a18', '#8a3c1e', '#4d3a78', '#8a2e51', '#5a6a18', '#1f5a4e']
    },
    honey: {
      key: 'honey',
      name: 'ハニー',
      paperA: '#fff8ec',
      paperB: '#fbeacf',
      paperC: '#fff5e0',
      ink: '#3e2a14',
      soft: '#7a5a2e',
      primary: '#f5b942',
      primaryD: '#c98b1a',
      cool: '#c4a8e5',
      coolD: '#7a5dc0',
      warm: '#ff9a6a',
      warmD: '#c95a2a',
      green: '#a8d8a4',
      greenD: '#3a8a48',
      blue: '#9bcce2',
      blueD: '#2a6f9e',
      orange: '#ffa878',
      orangeD: '#c95a2a',
      line: '#ead4a8',
      shellGrad: 'linear-gradient(160deg,#fff0d4 0%,#ffe6c0 60%,#ffeed4 100%)',
      tabBgs: ['#fde2a1', '#ffc9a1', '#bfe8f5', '#fde9c1', '#ffcaa1', '#c4eccc', '#f0d8b5', '#dfdcf7'],
      tabInks: ['#7a5a18', '#8a3c1e', '#1e556e', '#7a5a18', '#8a3c1e', '#1f6b3e', '#7a4a18', '#3a3a78']
    }
  };

  // ── Theme context ────────────────────────────────────────────────────
  const ThemeCtx = createContext(PALETTES.pink);
  function ThemeProvider({
    palette,
    children
  }) {
    return /*#__PURE__*/React.createElement(ThemeCtx.Provider, {
      value: palette
    }, children);
  }
  function useC() {
    return useContext(ThemeCtx);
  }

  // ── Checklist hook (persists to localStorage) ────────────────────────
  function useChecklist(key, defaultLabels) {
    const storageKey = 'kp-cl-' + key;
    const [items, setItems] = useState(() => {
      try {
        const raw = localStorage.getItem(storageKey);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.map(x => x.label).join('\n') === defaultLabels.join('\n')) {
            return parsed;
          }
        }
      } catch (e) {}
      return defaultLabels.map(label => ({
        label,
        done: false
      }));
    });
    useEffect(() => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(items));
      } catch (e) {}
    }, [items, storageKey]);
    const toggle = i => setItems(its => its.map((x, j) => j === i ? {
      ...x,
      done: !x.done
    } : x));
    return [items, toggle];
  }
  function useLocalValue(key, defaultValue) {
    const storageKey = 'kp-val-' + key;
    const [value, setValue] = useState(() => {
      try {
        const raw = localStorage.getItem(storageKey);
        if (raw != null) return JSON.parse(raw);
      } catch (e) {}
      return defaultValue;
    });
    useEffect(() => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(value));
      } catch (e) {}
    }, [storageKey, value]);
    return [value, setValue];
  }
  function yen(value) {
    const n = Number(String(value || '').replace(/[^\d.-]/g, ''));
    if (!Number.isFinite(n) || n <= 0) return '¥ 0';
    return '¥ ' + Math.round(n).toLocaleString('ja-JP');
  }
  function mapsUrl(query) {
    return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(query);
  }

  // ── Tiny SVG atoms ──────────────────────────────────────────────────
  function Heart({
    size = 14,
    fill
  }) {
    const C = useC();
    return /*#__PURE__*/React.createElement("svg", {
      width: size,
      height: size,
      viewBox: "0 0 24 24",
      style: {
        verticalAlign: 'middle'
      }
    }, /*#__PURE__*/React.createElement("path", {
      fill: fill || C.primaryD,
      d: "M12 21s-7.5-4.6-9.8-9.2C.6 8 2.4 4 6.3 4c2 0 3.5 1.2 4.4 2.4l1.3 1.7 1.3-1.7C14.2 5.2 15.7 4 17.7 4c3.9 0 5.7 4 4.1 7.8C19.5 16.4 12 21 12 21z"
    }));
  }
  function Star({
    size = 12,
    fill
  }) {
    const C = useC();
    return /*#__PURE__*/React.createElement("svg", {
      width: size,
      height: size,
      viewBox: "0 0 24 24",
      style: {
        verticalAlign: 'middle'
      }
    }, /*#__PURE__*/React.createElement("path", {
      fill: fill || C.primaryD,
      d: "M12 2l2.4 6.6L21 10l-5 4.4L17.4 22 12 18l-5.4 4L8 14.4 3 10l6.6-1.4z"
    }));
  }
  function Sparkle({
    size = 10,
    top,
    left,
    right,
    bottom,
    color,
    rot = 0
  }) {
    const C = useC();
    return /*#__PURE__*/React.createElement("svg", {
      width: size,
      height: size,
      viewBox: "0 0 24 24",
      style: {
        position: 'absolute',
        top,
        left,
        right,
        bottom,
        transform: `rotate(${rot}deg)`,
        pointerEvents: 'none'
      }
    }, /*#__PURE__*/React.createElement("path", {
      fill: color || C.primary,
      d: "M12 0c.4 5 1.6 11 12 12-10.4 1-11.6 7-12 12-.4-5-1.6-11-12-12 10.4-1 11.6-7 12-12z"
    }));
  }
  function Washi({
    top = -8,
    left = '50%',
    rot = -4,
    w = 110,
    color = 'rgba(255,150,180,.55)'
  }) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        top,
        left,
        transform: `translateX(-50%) rotate(${rot}deg)`,
        width: w,
        height: 18,
        background: color,
        backgroundImage: 'repeating-linear-gradient(45deg,rgba(255,255,255,.28) 0 6px,transparent 6px 12px)',
        boxShadow: '0 1px 2px rgba(0,0,0,.05)',
        pointerEvents: 'none'
      }
    });
  }
  function Highlight({
    children,
    color
  }) {
    const C = useC();
    return /*#__PURE__*/React.createElement("span", {
      style: {
        background: `linear-gradient(transparent 55%, ${color || C.warm} 55% 92%, transparent 92%)`,
        padding: '0 2px'
      }
    }, children);
  }
  function Blank({
    value,
    w = 80,
    ph = '＿＿＿＿＿'
  }) {
    const C = useC();
    if (value) return /*#__PURE__*/React.createElement("span", null, value);
    return /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'inline-block',
        minWidth: w,
        borderBottom: `1.5px dashed ${C.line}`,
        color: 'rgba(0,0,0,.2)',
        textAlign: 'center',
        fontSize: '.9em'
      }
    }, ph);
  }
  function InfoTile({
    label,
    value,
    color
  }) {
    const C = useC();
    return /*#__PURE__*/React.createElement("div", {
      style: {
        background: '#fff',
        borderRadius: 12,
        padding: '9px 10px',
        boxShadow: '0 0 0 1.5px ' + C.line,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10.5,
        letterSpacing: '.16em',
        color: color || C.soft,
        fontWeight: 700,
        lineHeight: 1.2
      }
    }, label), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 3,
        fontSize: 13.5,
        fontWeight: 700,
        color: C.ink,
        lineHeight: 1.35,
        overflowWrap: 'anywhere'
      }
    }, value));
  }
  function LinkChip({
    query,
    children,
    color
  }) {
    const C = useC();
    const ink = color || C.primaryD;
    return /*#__PURE__*/React.createElement("a", {
      href: mapsUrl(query),
      target: "_blank",
      rel: "noreferrer",
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        textDecoration: 'none',
        background: '#fff',
        color: ink,
        borderRadius: 99,
        padding: '5px 10px',
        fontSize: 12.5,
        fontWeight: 700,
        boxShadow: '0 0 0 1.5px ' + C.line,
        whiteSpace: 'nowrap'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: '"Klee One",sans-serif'
      }
    }, "\u2197"), /*#__PURE__*/React.createElement("span", null, children));
  }
  function PhotoFrame({
    storageKey = 'cover-photo',
    label = 'ここに思い出の写真',
    defaultSrc = ''
  }) {
    const C = useC();
    const inputRef = useRef(null);
    const [photo, setPhoto] = useLocalValue(storageKey, '');
    const src = photo || defaultSrc;
    const choose = () => inputRef.current?.click();
    const onFile = e => {
      const file = e.target.files && e.target.files[0];
      if (!file || !file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = () => setPhoto(reader.result);
      reader.readAsDataURL(file);
      e.target.value = '';
    };
    return /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'relative',
        width: '68%',
        margin: '24px auto 0',
        aspectRatio: '4 / 3',
        background: '#fff',
        padding: 11,
        boxShadow: '0 8px 26px rgba(0,0,0,.08), 0 1px 0 rgba(0,0,0,.04)',
        transform: 'rotate(-1.5deg)'
      }
    }, /*#__PURE__*/React.createElement(Washi, {
      top: -10,
      left: "20%",
      rot: -6,
      w: 90,
      color: "rgba(255,210,150,.7)"
    }), /*#__PURE__*/React.createElement(Washi, {
      top: -10,
      left: "80%",
      rot: 8,
      w: 90,
      color: `${C.green}cc`
    }), /*#__PURE__*/React.createElement("input", {
      ref: inputRef,
      type: "file",
      accept: "image/*",
      onChange: onFile,
      style: {
        display: 'none'
      }
    }), /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: choose,
      style: {
        width: '100%',
        height: '100%',
        border: `1px dashed ${C.line}`,
        background: src ? '#fff' : `linear-gradient(135deg,${C.paperC},${C.paperB})`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: C.soft,
        fontSize: 13,
        letterSpacing: '.08em',
        cursor: 'pointer',
        padding: 0,
        overflow: 'hidden',
        fontFamily: '"Zen Maru Gothic","Klee One",sans-serif'
      }
    }, src ? /*#__PURE__*/React.createElement("img", {
      src: src,
      alt: label,
      style: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        display: 'block'
      }
    }) : /*#__PURE__*/React.createElement("span", {
      style: {
        textAlign: 'center'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'block',
        fontSize: 28,
        marginBottom: 5
      }
    }, "PHOTO"), /*#__PURE__*/React.createElement("span", null, label))), photo && /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: e => {
        e.stopPropagation();
        setPhoto('');
      },
      style: {
        position: 'absolute',
        right: 16,
        bottom: 16,
        width: 28,
        height: 28,
        borderRadius: '50%',
        border: 'none',
        background: 'rgba(255,255,255,.9)',
        color: C.primaryD,
        fontWeight: 800,
        cursor: 'pointer',
        boxShadow: '0 1px 6px rgba(0,0,0,.18)'
      }
    }, "\xD7"));
  }

  // ── Page wrapper ────────────────────────────────────────────────────
  function Page({
    children,
    bg,
    pad = 32,
    dots = true
  }) {
    const C = useC();
    return /*#__PURE__*/React.createElement("div", {
      style: {
        width: '100%',
        height: '100%',
        background: bg || C.paperA,
        backgroundImage: dots ? 'radial-gradient(rgba(0,0,0,.06) 1px,transparent 1px)' : 'none',
        backgroundSize: '18px 18px',
        backgroundPosition: '0 0',
        padding: pad,
        boxSizing: 'border-box',
        position: 'relative',
        overflow: 'hidden',
        color: C.ink,
        fontFamily: '"Zen Maru Gothic","Klee One",sans-serif',
        fontSize: 15,
        lineHeight: 1.7
      }
    }, children);
  }
  function PageHeader({
    kicker,
    title,
    color,
    accent
  }) {
    const C = useC();
    return /*#__PURE__*/React.createElement("div", {
      style: {
        marginBottom: 18,
        position: 'relative'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: '"Caveat",cursive',
        fontSize: 24,
        color: color || C.primaryD,
        lineHeight: 1
      }
    }, kicker), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 2,
        fontWeight: 700,
        fontSize: 26,
        color: C.ink,
        fontFamily: '"Klee One",sans-serif',
        letterSpacing: '.03em'
      }
    }, title), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        left: 0,
        bottom: -6,
        width: 54,
        height: 6,
        borderRadius: 3,
        background: accent || C.primary,
        opacity: .55
      }
    }));
  }
  function Row({
    k,
    v
  }) {
    const C = useC();
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: {
        color: C.soft,
        fontSize: 13,
        whiteSpace: 'nowrap'
      }
    }, k), /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 600,
        fontSize: 14
      }
    }, v));
  }
  function Tip({
    title,
    color,
    children
  }) {
    const C = useC();
    return /*#__PURE__*/React.createElement("div", {
      style: {
        background: '#fff',
        borderRadius: 12,
        padding: '13px 14px',
        boxShadow: '0 0 0 1.5px ' + C.line,
        position: 'relative'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 700,
        color: color || C.primary,
        fontFamily: '"Klee One",sans-serif',
        marginBottom: 6,
        fontSize: 15
      }
    }, title), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        lineHeight: 1.75,
        color: C.ink
      }
    }, children));
  }

  // Expose to window
  window.KP = {
    PALETTES,
    ThemeProvider,
    useC,
    useChecklist,
    useLocalValue,
    yen,
    mapsUrl,
    Heart,
    Star,
    Sparkle,
    Washi,
    Highlight,
    Blank,
    Page,
    PageHeader,
    Row,
    Tip,
    InfoTile,
    LinkChip,
    PhotoFrame
  };
})();
