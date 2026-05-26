function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// main.jsx — App entry, palette/tweaks wiring, booklet config, render.

const {
  useState: useStateMain,
  useEffect: useEffectMain,
  useRef: useRefMain
} = React;
const KP = window.KP;

// ── Editmode-managed defaults ──────────────────────────────────────────
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette": "pink",
  "memberA": "",
  "memberB": "",
  "fromCity": "",
  "showPacking": true,
  "showGoods": true
} /*EDITMODE-END*/;

// ── Tab (uses theme palette) ───────────────────────────────────────────
function KawaiiTab({
  label,
  active,
  onClick,
  idx,
  icon
}) {
  const C = KP.useC();
  const bg = C.tabBgs[idx % C.tabBgs.length];
  const ink = C.tabInks[idx % C.tabInks.length];
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    style: {
      position: 'relative',
      flex: '1 1 0',
      minWidth: 0,
      marginRight: -6,
      padding: '8px 3px 12px',
      border: 'none',
      cursor: 'pointer',
      background: bg,
      color: ink,
      borderRadius: '18px 18px 6px 6px',
      fontFamily: '"Klee One","Zen Maru Gothic",sans-serif',
      fontWeight: 700,
      fontSize: 10.8,
      letterSpacing: 0,
      boxShadow: active ? '0 -3px 0 rgba(255,255,255,.6) inset, 0 2px 0 rgba(0,0,0,.04)' : '0 -2px 0 rgba(0,0,0,.04) inset',
      transform: active ? 'translateY(0)' : 'translateY(6px)',
      opacity: active ? 1 : .78,
      zIndex: active ? 20 : Math.max(1, 14 - idx),
      transition: 'transform .25s, opacity .25s'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
      lineHeight: 1.1
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11.5,
      lineHeight: 1
    }
  }, icon), /*#__PURE__*/React.createElement("span", null, label)), active && /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      left: '50%',
      bottom: 6,
      transform: 'translateX(-50%)',
      width: 20,
      height: 3,
      background: ink,
      opacity: .4,
      borderRadius: 2
    }
  }));
}

// ── Booklet theme styles ───────────────────────────────────────────────
function useBookTheme(visiblePages) {
  const C = KP.useC();
  return {
    shellStyle: {
      width: '100%',
      height: '100%',
      boxSizing: 'border-box',
      padding: '20px 18px 18px',
      background: C.shellGrad,
      fontFamily: '"Zen Maru Gothic","Klee One",sans-serif'
    },
    bookStyle: {
      display: 'flex',
      flexDirection: 'column',
      height: '100%'
    },
    tabsStyle: {
      padding: '0 4px'
    },
    stageStyle: {
      flex: 1,
      background: '#fff',
      borderRadius: '18px',
      boxShadow: `0 4px 0 rgba(0,0,0,.06), 0 22px 50px ${C.primary}33, 0 0 0 1.5px rgba(255,255,255,.6)`,
      overflow: 'hidden'
    },
    pageStyle: {
      background: 'transparent'
    },
    Tab: props => {
      const idx = visiblePages.findIndex(p => p.label === props.label);
      return /*#__PURE__*/React.createElement(KawaiiTab, _extends({}, props, {
        idx: idx
      }));
    }
  };
}

// ── App ────────────────────────────────────────────────────────────────
function App() {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const palette = KP.PALETTES[tweaks.palette] || KP.PALETTES.pink;

  // Auto-scale stage for any viewport
  const wrapRef = useRefMain(null);
  useEffectMain(() => {
    const fit = () => {
      if (!wrapRef.current) return;
      const W = window.innerWidth;
      const H = window.innerHeight;
      const margin = W < 600 ? 16 : 32;
      const s = Math.min((W - margin * 2) / 720, (H - margin * 2) / 920, 1.15);
      wrapRef.current.style.transform = `translate(-50%, -50%) scale(${s})`;
    };
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);

  // Pages — pages config wraps the actual components so tweaks flow in.
  const ALL_PAGES = [{
    id: 'cover',
    label: '表紙',
    icon: '◎',
    Comp: KP.pages.Cover,
    show: true
  }, {
    id: 'now',
    label: '今',
    icon: '▶',
    Comp: KP.pages.NowPage,
    show: true
  }, {
    id: 'schedule',
    label: '行程',
    icon: '≡',
    Comp: KP.pages.Schedule,
    show: true
  }, {
    id: 'transport',
    label: '交通',
    icon: '↔',
    Comp: KP.pages.Transport,
    show: true
  }, {
    id: 'hotel',
    label: '宿',
    icon: '⌂',
    Comp: KP.pages.Hotel,
    show: true
  }, {
    id: 'misokin',
    label: 'みそ',
    icon: '杯',
    Comp: KP.pages.Misokin,
    show: true
  }, {
    id: 'recommended',
    label: '厳選',
    icon: '★',
    Comp: KP.pages.Recommended,
    show: true
  }, {
    id: 'candidates',
    label: '候補',
    icon: '食',
    Comp: KP.pages.Candidates,
    show: true
  }, {
    id: 'packing',
    label: '持物',
    icon: '✓',
    Comp: KP.pages.Packing,
    show: tweaks.showPacking
  }, {
    id: 'goods',
    label: '予算',
    icon: '¥',
    Comp: KP.pages.Goods,
    show: tweaks.showGoods
  }, {
    id: 'map',
    label: 'MAP',
    icon: '⌖',
    Comp: KP.pages.MapPage,
    show: true
  }];
  const visible = ALL_PAGES.filter(p => p.show);
  const pages = visible.map(p => ({
    id: p.id,
    label: p.label,
    icon: p.icon,
    render: () => /*#__PURE__*/React.createElement(p.Comp, {
      tweaks: tweaks
    })
  }));
  const theme = useBookTheme(visible);
  return /*#__PURE__*/React.createElement(KP.ThemeProvider, {
    palette: palette
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      inset: 0,
      background: `radial-gradient(circle at 30% 20%, ${palette.primary}22, transparent 60%),
                     radial-gradient(circle at 70% 80%, ${palette.cool}22, transparent 60%),
                     #fbf6f1`,
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "app-brand",
    style: {
      position: 'absolute',
      top: 18,
      left: 22,
      zIndex: 10,
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      fontFamily: '"Klee One",sans-serif',
      fontWeight: 700,
      color: palette.primaryD,
      fontSize: 15,
      letterSpacing: '.05em',
      whiteSpace: 'nowrap'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      width: 24,
      height: 24,
      borderRadius: '50%',
      background: palette.primaryD,
      color: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 13
    }
  }, "\u2661"), /*#__PURE__*/React.createElement("span", null, "\u65C5 \u306E \u3057\u304A\u308A"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: '"Caveat",cursive',
      fontSize: 14,
      color: palette.soft,
      marginLeft: 6
    }
  }, "\xB7 Tokyo 2026")), /*#__PURE__*/React.createElement("div", {
    className: "app-hint",
    style: {
      position: 'absolute',
      top: 22,
      right: 22,
      zIndex: 10,
      fontFamily: '"Caveat",cursive',
      fontSize: 15,
      color: palette.soft,
      opacity: .75,
      whiteSpace: 'nowrap'
    }
  }, "\u21E2 \u30BF\u30D6\u3092\u62BC\u3059\u3068\u30DA\u30FC\u30B8\u304C\u3081\u304F\u308C\u307E\u3059"), /*#__PURE__*/React.createElement("div", {
    ref: wrapRef,
    style: {
      position: 'absolute',
      left: '50%',
      top: '50%',
      width: 720,
      height: 920,
      transformOrigin: 'center center',
      transition: 'transform .2s ease'
    }
  }, /*#__PURE__*/React.createElement(Booklet, {
    pages: pages,
    theme: theme,
    ariaLabel: "\u65C5\u884C\u306E\u3057\u304A\u308A"
  })), /*#__PURE__*/React.createElement(TweaksPanel, {
    title: "\u3057\u304A\u308A\u306E\u8A2D\u5B9A"
  }, /*#__PURE__*/React.createElement(TweakSection, {
    label: "\u30AB\u30E9\u30FC"
  }, /*#__PURE__*/React.createElement(TweakColor, {
    label: "\u30D1\u30EC\u30C3\u30C8",
    value: [palette.primary, palette.cool, palette.warm, palette.green],
    options: Object.values(KP.PALETTES).map(p => [p.primary, p.cool, p.warm, p.green]),
    onChange: arr => {
      const found = Object.values(KP.PALETTES).find(p => p.primary === arr[0] && p.cool === arr[1] && p.warm === arr[2] && p.green === arr[3]);
      if (found) setTweak('palette', found.key);
    }
  }), /*#__PURE__*/React.createElement(TweakSelect, {
    label: "\u30D1\u30EC\u30C3\u30C8\u540D",
    value: tweaks.palette,
    options: Object.values(KP.PALETTES).map(p => ({
      label: p.name,
      value: p.key
    })),
    onChange: v => setTweak('palette', v)
  })), /*#__PURE__*/React.createElement(TweakSection, {
    label: "\u540C\u884C\u30E1\u30F3\u30D0\u30FC"
  }, /*#__PURE__*/React.createElement(TweakText, {
    label: "\u3042\u306A\u305F\u306E\u540D\u524D",
    value: tweaks.memberA,
    placeholder: "\u4F8B\uFF1A\u3081\u3050",
    onChange: v => setTweak('memberA', v)
  }), /*#__PURE__*/React.createElement(TweakText, {
    label: "\u304A\u53CB\u9054\u306E\u540D\u524D",
    value: tweaks.memberB,
    placeholder: "\u4F8B\uFF1A\u3042\u3044",
    onChange: v => setTweak('memberB', v)
  }), /*#__PURE__*/React.createElement(TweakText, {
    label: "\u51FA\u767A\u5730",
    value: tweaks.fromCity,
    placeholder: "\u4F8B\uFF1A\u798F\u5CA1\u7A7A\u6E2F",
    onChange: v => setTweak('fromCity', v)
  })), /*#__PURE__*/React.createElement(TweakSection, {
    label: "\u8868\u793A\u3059\u308B\u30DA\u30FC\u30B8"
  }, /*#__PURE__*/React.createElement(TweakToggle, {
    label: "\u6301\u3061\u7269\u30DA\u30FC\u30B8",
    value: tweaks.showPacking,
    onChange: v => setTweak('showPacking', v)
  }), /*#__PURE__*/React.createElement(TweakToggle, {
    label: "\u30B0\u30C3\u30BA\uFF06\u4E88\u7B97\u30DA\u30FC\u30B8",
    value: tweaks.showGoods,
    onChange: v => setTweak('showGoods', v)
  })))));
}
ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(App, null));
