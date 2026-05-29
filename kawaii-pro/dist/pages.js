// pages.jsx — official booklet pages for the shared CUTIE STREET Tokyo trip.
// Reads atoms from window.KP, content from window.TRIP.

(function () {
  const {
    useC,
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
    PhotoFrame,
    useChecklist,
    useLocalValue,
    yen,
    mapsUrl
  } = window.KP;
  const {
    useState
  } = React;
  const T = window.TRIP;
  const dayColors = C => [C.primaryD, C.coolD, C.greenD];
  const dayBgs = C => [`color-mix(in srgb, ${C.primary} 16%, white)`, `color-mix(in srgb, ${C.cool} 18%, white)`, `color-mix(in srgb, ${C.green} 18%, white)`];
  const tripDayIds = ['day1', 'day2', 'day3'];
  function planForDayId(dayId) {
    const index = tripDayIds.indexOf(dayId);
    return index >= 0 ? (T.detailedSchedule || [])[index] : null;
  }
  function autoDayId() {
    const today = jstDate();
    const index = (T.detailedSchedule || []).findIndex(d => d.dateISO === today);
    return index >= 0 ? tripDayIds[index] : 'prep';
  }
  function currentItemForPlan(plan, useClock) {
    if (!plan || !plan.items || !plan.items.length) return null;
    if (!useClock) return plan.items[0];
    const now = jstMinutes();
    return plan.items.find(item => item.minutes >= now) || plan.items[plan.items.length - 1];
  }
  function routeUrl(origin, destination) {
    return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&travelmode=transit`;
  }
  function rowKey(row) {
    return `${row.name || ''}-${row.area || ''}`.replace(/\s+/g, '').toLowerCase();
  }
  function tripCountdownLabel() {
    const start = new Date(T.tripStartISO);
    if (Number.isNaN(start.getTime())) return T.daysNum;
    const days = Math.ceil((start.getTime() - Date.now()) / 86400000);
    if (days > 1) return `出発まで ${days} 日`;
    if (days === 1) return '出発まで 1 日';
    if (days === 0) return '今日出発';
    return '旅の思い出';
  }
  function jstDate() {
    return new Date().toLocaleDateString('sv-SE', {
      timeZone: 'Asia/Tokyo'
    });
  }
  function jstMinutes() {
    const parts = new Intl.DateTimeFormat('ja-JP', {
      timeZone: 'Asia/Tokyo',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).formatToParts(new Date());
    return Number(parts.find(p => p.type === 'hour').value) * 60 + Number(parts.find(p => p.type === 'minute').value);
  }
  function ScrollArea({
    children,
    top = 72
  }) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        left: 32,
        right: 32,
        top,
        bottom: 28,
        overflowY: 'auto',
        paddingRight: 6,
        scrollbarWidth: 'thin'
      }
    }, children);
  }
  function Pill({
    children,
    color,
    bg
  }) {
    const C = useC();
    return /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        minHeight: 24,
        padding: '3px 9px',
        borderRadius: 99,
        background: bg || '#fff',
        color: color || C.primaryD,
        fontSize: 11.5,
        fontWeight: 800,
        boxShadow: '0 0 0 1.2px ' + C.line,
        whiteSpace: 'nowrap'
      }
    }, children);
  }
  function Card({
    children,
    style
  }) {
    const C = useC();
    return /*#__PURE__*/React.createElement("div", {
      style: {
        background: '#fff',
        borderRadius: 14,
        padding: 14,
        boxShadow: '0 0 0 1.5px ' + C.line,
        ...style
      }
    }, children);
  }
  function TextInput({
    value,
    onChange,
    placeholder
  }) {
    const C = useC();
    return /*#__PURE__*/React.createElement("input", {
      value: value,
      onChange: e => onChange(e.target.value),
      placeholder: placeholder,
      style: {
        width: '100%',
        minHeight: 36,
        border: 'none',
        outline: 'none',
        borderRadius: 10,
        padding: '0 12px',
        background: '#fff',
        color: C.ink,
        boxShadow: '0 0 0 1.5px ' + C.line,
        fontFamily: 'inherit',
        fontSize: 13
      }
    });
  }
  function FilterButton({
    active,
    onClick,
    children,
    color
  }) {
    const C = useC();
    return /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: onClick,
      style: {
        border: 'none',
        borderRadius: 99,
        padding: '6px 10px',
        background: active ? color || C.primaryD : '#fff',
        color: active ? '#fff' : color || C.primaryD,
        boxShadow: '0 0 0 1.5px ' + (active ? 'transparent' : C.line),
        fontFamily: 'inherit',
        fontSize: 12,
        fontWeight: 800,
        cursor: 'pointer'
      }
    }, children);
  }
  function StoreLink({
    name,
    official
  }) {
    const C = useC();
    const href = official || mapsUrl(name);
    return /*#__PURE__*/React.createElement("a", {
      href: href,
      target: "_blank",
      rel: "noreferrer",
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        color: C.blueD,
        fontWeight: 800,
        textDecoration: 'none',
        fontSize: 12
      }
    }, "\u516C\u5F0F/\u5730\u56F3");
  }
  function Cover({
    tweaks
  }) {
    const C = useC();
    const names = [(tweaks.memberA || '').trim(), (tweaks.memberB || '').trim()].filter(Boolean);
    return /*#__PURE__*/React.createElement(Page, {
      bg: C.paperB,
      dots: false
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        inset: 20,
        border: `2px dashed ${C.primary}`,
        borderRadius: 20
      }
    }), /*#__PURE__*/React.createElement(Sparkle, {
      top: 30,
      left: 42,
      size: 16,
      color: C.primaryD
    }), /*#__PURE__*/React.createElement(Sparkle, {
      top: 54,
      right: 58,
      size: 11,
      color: C.cool,
      rot: 20
    }), /*#__PURE__*/React.createElement(Sparkle, {
      bottom: 92,
      left: 60,
      size: 13,
      color: C.primary,
      rot: -15
    }), /*#__PURE__*/React.createElement(Sparkle, {
      bottom: 46,
      right: 44,
      size: 18,
      color: C.primaryD
    }), /*#__PURE__*/React.createElement(Washi, {
      top: 8,
      left: "22%",
      rot: -8,
      w: 150,
      color: "rgba(255,180,200,.7)"
    }), /*#__PURE__*/React.createElement(Washi, {
      top: 8,
      left: "78%",
      rot: 6,
      w: 130,
      color: `${C.cool}aa`
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 48,
        textAlign: 'center',
        fontFamily: '"Caveat","Klee One",cursive',
        fontWeight: 700,
        fontSize: 74,
        lineHeight: .94,
        color: C.primaryD
      }
    }, "Tokyo", /*#__PURE__*/React.createElement("br", null), "Trip", /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 50,
        color: C.cool,
        marginLeft: 10
      }
    }, "\u2661")), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 14,
        textAlign: 'center',
        fontFamily: '"Klee One",sans-serif',
        fontSize: 18,
        fontWeight: 700
      }
    }, "\u301C ", /*#__PURE__*/React.createElement(Highlight, {
      color: `${C.primary}66`
    }, T.venue.liveTitle || 'CUTIE STREET LIVE'), " \u301C"), /*#__PURE__*/React.createElement("div", {
      style: {
        margin: '22px auto 0',
        width: '78%',
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 800,
        letterSpacing: '.16em',
        color: C.soft,
        padding: '10px 0',
        borderTop: `1.5px solid ${C.primary}`,
        borderBottom: `1.5px solid ${C.primary}`
      }
    }, T.dates), /*#__PURE__*/React.createElement("div", {
      style: {
        width: '84%',
        margin: '16px auto 0',
        display: 'grid',
        gridTemplateColumns: 'repeat(4, minmax(0,1fr))',
        gap: 8
      }
    }, /*#__PURE__*/React.createElement(InfoTile, {
      label: "COUNT",
      value: tripCountdownLabel(),
      color: C.primaryD
    }), T.quickFacts.slice(0, 3).map(x => /*#__PURE__*/React.createElement(InfoTile, {
      key: x.label,
      label: x.label,
      value: x.value
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'center',
        gap: 8,
        marginTop: 14,
        flexWrap: 'wrap'
      }
    }, /*#__PURE__*/React.createElement("a", {
      href: T.publicUrl,
      target: "_blank",
      rel: "noreferrer",
      style: {
        textDecoration: 'none',
        background: '#fff',
        color: C.primaryD,
        borderRadius: 99,
        padding: '6px 12px',
        fontSize: 12.5,
        fontWeight: 800,
        boxShadow: '0 0 0 1.5px ' + C.line
      }
    }, "\u5171\u6709URL\u3092\u958B\u304F"), /*#__PURE__*/React.createElement(LinkChip, {
      query: "\u6709\u660E\u30A2\u30EA\u30FC\u30CA",
      color: C.coolD
    }, "\u4F1A\u5834\u5730\u56F3")), /*#__PURE__*/React.createElement(PhotoFrame, {
      storageKey: "cover-photo",
      label: "\u3053\u3053\u306B\u601D\u3044\u51FA\u306E\u5199\u771F",
      defaultSrc: "assets/og-bg-generated.png"
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 30,
        textAlign: 'center',
        fontSize: 13,
        color: C.soft,
        letterSpacing: '.25em',
        fontFamily: '"Caveat",cursive'
      }
    }, names.length ? `For ${names.join(' & ')}` : 'For me & you', "\u3000", /*#__PURE__*/React.createElement(Heart, {
      size: 11
    })));
  }
  function NowPage() {
    const C = useC();
    const automaticDayId = autoDayId();
    const [mode, setMode] = useLocalValue('now-mode-v2', 'auto');
    const selectedDayId = mode === 'auto' ? automaticDayId : mode;
    const plan = planForDayId(selectedDayId);
    const useClock = mode === 'auto' && selectedDayId !== 'prep';
    const next = currentItemForPlan(plan, useClock);
    const nextIndex = plan && next ? plan.items.indexOf(next) : -1;
    const coming = plan && nextIndex >= 0 ? plan.items.slice(nextIndex, nextIndex + 3) : [];
    const prep = ['電子チケット・本人確認書類・FC情報を同じポーチへ', 'みそきん予約状況と集合時間をLINEで共有', 'SKY510 / SKY521 のターミナルと搭乗締切を確認', '雨具・モバイルバッテリー・飲み物を前日夜にセット'];
    const limits = [['6/16', '07:15', 'SKY510 那覇発'], ['6/17', '14:15', '表参道出発リミット'], ['6/18', '15:20', '羽田空港に着いていたい']];
    return /*#__PURE__*/React.createElement(Page, {
      bg: C.paperC
    }, /*#__PURE__*/React.createElement(PageHeader, {
      kicker: "today mode",
      title: "\u4ECA\u3084\u308B\u3053\u3068",
      color: C.primaryD,
      accent: C.primary
    }), /*#__PURE__*/React.createElement(ScrollArea, {
      top: 78
    }, (T.weather || T.wifi || T.liveDetails) && /*#__PURE__*/React.createElement(Card, { style: { marginBottom: 12 } }, /*#__PURE__*/React.createElement("div", { style: { fontWeight: 800, color: C.primaryD, marginBottom: 8 } }, "当日メモ（天気・WiFi・ライブ時刻）"), T.weather && /*#__PURE__*/React.createElement("div", { style: { fontSize: 13, marginBottom: 4 } }, "🌤 " + T.weather.season), T.weather && T.weather.tips && /*#__PURE__*/React.createElement("div", { style: { fontSize: 12, color: C.soft, marginBottom: 6 } }, T.weather.tips), T.weather && T.weather.links && /*#__PURE__*/React.createElement("div", { style: { display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 } }, T.weather.links.map(function (l, i) { return /*#__PURE__*/React.createElement("a", { key: i, href: l.href, target: "_blank", rel: "noopener noreferrer", style: { fontSize: 12, color: C.coolD, textDecoration: 'none', border: '1px solid ' + C.coolD, borderRadius: 999, padding: '2px 10px' } }, "↗ " + l.label); })), T.wifi && /*#__PURE__*/React.createElement("div", { style: { fontWeight: 700, color: C.coolD, marginBottom: 4, fontSize: 13 } }, "WiFi / 通信"), T.wifi && /*#__PURE__*/React.createElement("div", { style: { fontSize: 12, color: C.soft, marginBottom: 10, lineHeight: 1.6 } }, (T.wifi.hotel || "") + " / " + (T.wifi.carrier || "")), T.liveDetails && T.liveDetails.days && /*#__PURE__*/React.createElement("div", { style: { fontWeight: 700, color: C.warmD, marginBottom: 4, fontSize: 13 } }, "ライブ時刻"), T.liveDetails && T.liveDetails.days && /*#__PURE__*/React.createElement("div", { style: { fontSize: 12, color: C.soft, lineHeight: 1.7 } }, T.liveDetails.days.map(function (d, i) { return /*#__PURE__*/React.createElement("div", { key: i }, d.day + " " + d.date + " 開場" + d.open + " 開演" + d.start + " 終演目安" + d.expectedEnd); }))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 7,
        flexWrap: 'wrap',
        marginBottom: 10
      }
    }, /*#__PURE__*/React.createElement(FilterButton, {
      active: mode === 'auto',
      onClick: () => setMode('auto'),
      color: C.primaryD
    }, "\u81EA\u52D5"), /*#__PURE__*/React.createElement(FilterButton, {
      active: selectedDayId === 'prep' && mode !== 'auto',
      onClick: () => setMode('prep'),
      color: C.warmD
    }, "\u51FA\u767A\u524D"), tripDayIds.map((id, i) => /*#__PURE__*/React.createElement(FilterButton, {
      key: id,
      active: selectedDayId === id && mode !== 'auto',
      onClick: () => setMode(id),
      color: [C.primaryD, C.coolD, C.greenD][i]
    }, "DAY ", i + 1))), /*#__PURE__*/React.createElement(Card, {
      style: {
        background: `linear-gradient(135deg, #fff, color-mix(in srgb, ${C.primary} 14%, white))`
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        gap: 12,
        alignItems: 'flex-start'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: C.soft,
        fontWeight: 800,
        letterSpacing: '.12em'
      }
    }, plan ? 'NEXT ACTION' : 'PREP MODE'), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 25,
        fontWeight: 900,
        marginTop: 4,
        fontFamily: '"Klee One",sans-serif',
        lineHeight: 1.25
      }
    }, next ? `${next.time} ${next.what}` : tripCountdownLabel()), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13.5,
        color: C.soft,
        marginTop: 6,
        lineHeight: 1.6
      }
    }, next ? next.note : '旅行前は下のチェックだけ潰しておけば大丈夫。')), /*#__PURE__*/React.createElement(Pill, {
      color: plan ? C.primaryD : C.warmD
    }, plan ? plan.day : '出発前'))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 12,
        marginTop: 14
      }
    }, /*#__PURE__*/React.createElement(InfoTile, {
      label: "\u8868\u793A\u4E2D",
      value: plan ? plan.title : '出発前チェック',
      color: C.primaryD
    }), /*#__PURE__*/React.createElement(InfoTile, {
      label: "\u5171\u6709",
      value: "URL\u3072\u3068\u3064\u3067\u53CB\u9054\u306B\u898B\u305B\u3089\u308C\u308B",
      color: C.blueD
    })), coming.length > 0 ? /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 14,
        display: 'grid',
        gap: 8
      }
    }, coming.map((it, i) => /*#__PURE__*/React.createElement(Card, {
      key: `${it.time}-${i}`,
      style: {
        display: 'grid',
        gridTemplateColumns: '48px 1fr',
        gap: 10,
        padding: '10px 12px',
        alignItems: 'center'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 900,
        color: i === 0 ? C.primaryD : C.soft,
        fontFamily: '"Klee One",monospace'
      }
    }, it.time), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 900,
        fontSize: 13.5
      }
    }, it.what), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12.2,
        color: C.soft,
        lineHeight: 1.45
      }
    }, it.note))))) : /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 14,
        display: 'grid',
        gap: 10
      }
    }, prep.map((x, i) => /*#__PURE__*/React.createElement(Card, {
      key: i,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 12px'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 24,
        height: 24,
        borderRadius: '50%',
        background: i === 1 ? C.warm : C.green,
        color: i === 1 ? C.warmD : C.greenD,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 900,
        flex: '0 0 auto'
      }
    }, i + 1), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13.5,
        fontWeight: 700
      }
    }, x)))), /*#__PURE__*/React.createElement(Card, {
      style: {
        marginTop: 14,
        padding: '11px 12px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 900,
        color: C.warmD,
        marginBottom: 8
      }
    }, "\u7D76\u5BFE\u306B\u5B88\u308B\u6642\u523B"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, minmax(0,1fr))',
        gap: 8
      }
    }, limits.map(([date, time, label]) => /*#__PURE__*/React.createElement("div", {
      key: `${date}-${time}`,
      style: {
        background: C.paperC,
        borderRadius: 10,
        padding: '8px 9px',
        boxShadow: `0 0 0 1px ${C.line}`
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: C.soft,
        fontWeight: 800
      }
    }, date), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 16,
        color: C.warmD,
        fontWeight: 900,
        fontFamily: '"Klee One",monospace'
      }
    }, time), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11.5,
        color: C.ink,
        fontWeight: 800,
        lineHeight: 1.35
      }
    }, label))))), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 14,
        display: 'flex',
        gap: 8,
        flexWrap: 'wrap'
      }
    }, /*#__PURE__*/React.createElement(LinkChip, {
      query: "\u6709\u660E\u30A2\u30EA\u30FC\u30CA",
      color: C.primaryD
    }, "\u6709\u660E"), /*#__PURE__*/React.createElement(LinkChip, {
      query: "\u30A2\u30D1\u30DB\u30C6\u30EB \u6771\u4EAC\u30D9\u30A4\u6F6E\u898B",
      color: C.coolD
    }, "\u30DB\u30C6\u30EB"), /*#__PURE__*/React.createElement(LinkChip, {
      query: "\u307F\u305D\u304D\u3093 \u6C60\u888B\u5E97",
      color: C.warmD
    }, "\u307F\u305D\u304D\u3093"), /*#__PURE__*/React.createElement("a", {
      href: routeUrl('アパホテル 東京ベイ潮見', '有明アリーナ'),
      target: "_blank",
      rel: "noreferrer",
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        textDecoration: 'none',
        background: '#fff',
        color: C.greenD,
        borderRadius: 99,
        padding: '5px 10px',
        fontSize: 12.5,
        fontWeight: 700,
        boxShadow: '0 0 0 1.5px ' + C.line,
        whiteSpace: 'nowrap'
      }
    }, /*#__PURE__*/React.createElement("span", null, "\u2197"), /*#__PURE__*/React.createElement("span", null, "\u30DB\u30C6\u30EB\u2192\u4F1A\u5834")))));
  }
  function Schedule() {
    const C = useC();
    const colors = dayColors(C);
    const bgs = dayBgs(C);
    const days = T.detailedSchedule || [];
    return /*#__PURE__*/React.createElement(Page, {
      bg: C.paperA
    }, /*#__PURE__*/React.createElement(PageHeader, {
      kicker: "day by day",
      title: "\u8A73\u7D30\u30B9\u30B1\u30B8\u30E5\u30FC\u30EB"
    }), /*#__PURE__*/React.createElement(ScrollArea, null, days.map((d, di) => /*#__PURE__*/React.createElement("div", {
      key: d.day,
      style: {
        background: bgs[di % bgs.length],
        border: `1.5px dashed ${colors[di % colors.length]}`,
        borderRadius: 14,
        padding: '13px 14px 15px',
        marginBottom: 12
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'baseline',
        gap: 8,
        marginBottom: 8,
        flexWrap: 'wrap'
      }
    }, /*#__PURE__*/React.createElement(Pill, {
      color: "#fff",
      bg: colors[di % colors.length]
    }, d.day), /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 800,
        color: colors[di % colors.length]
      }
    }, d.date), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12.5,
        color: C.soft
      }
    }, d.title)), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12.5,
        color: C.soft,
        margin: '0 0 9px'
      }
    }, d.tagline), /*#__PURE__*/React.createElement("ol", {
      style: {
        listStyle: 'none',
        margin: 0,
        padding: 0
      }
    }, d.items.map((it, i) => {
      const isLive = /ライブ|CUTIE STREET/.test(it.what);
      return /*#__PURE__*/React.createElement("li", {
        key: i,
        style: {
          display: 'grid',
          gridTemplateColumns: '52px 1fr',
          gap: 10,
          padding: '4px 0',
          borderTop: i ? `1px dotted ${C.line}` : 'none',
          fontSize: 13,
          lineHeight: 1.5
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          fontWeight: 900,
          color: colors[di % colors.length],
          fontFamily: '"Klee One",monospace'
        }
      }, it.time), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("strong", {
        style: {
          color: isLive ? C.primaryD : C.ink
        }
      }, it.what), it.note && /*#__PURE__*/React.createElement("span", {
        style: {
          color: C.soft
        }
      }, " \uFF0F ", it.note)));
    }))))));
  }
  function FlightCard({
    leg,
    fromOverride,
    toOverride
  }) {
    const C = useC();
    return /*#__PURE__*/React.createElement(Card, {
      style: {
        padding: '16px 18px',
        position: 'relative'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        top: -11,
        left: 16,
        background: C.primaryD,
        color: '#fff',
        fontWeight: 800,
        fontSize: 13,
        padding: '4px 14px',
        borderRadius: 99,
        letterSpacing: '.14em'
      }
    }, leg.label), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 8,
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: 'center',
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: C.soft,
        letterSpacing: '.18em'
      }
    }, "FROM"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 16,
        fontWeight: 800,
        marginTop: 3
      }
    }, /*#__PURE__*/React.createElement(Blank, {
      value: fromOverride || leg.from,
      w: 80
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        color: C.soft,
        marginTop: 2
      }
    }, /*#__PURE__*/React.createElement(Blank, {
      value: leg.depTime,
      w: 60,
      ph: "--:--"
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: '0 0 auto',
        color: C.primary,
        fontFamily: '"Caveat",cursive',
        textAlign: 'center'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 22
      }
    }, "flight"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: C.soft,
        marginTop: -2
      }
    }, leg.date)), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: 'center',
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: C.soft,
        letterSpacing: '.18em'
      }
    }, "TO"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 16,
        fontWeight: 800,
        marginTop: 3
      }
    }, /*#__PURE__*/React.createElement(Blank, {
      value: toOverride || leg.to,
      w: 80
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        color: C.soft,
        marginTop: 2
      }
    }, /*#__PURE__*/React.createElement(Blank, {
      value: leg.arrTime,
      w: 60,
      ph: "--:--"
    })))), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 12,
        paddingTop: 9,
        borderTop: `1.5px dashed ${C.line}`,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '4px 12px',
        fontSize: 12.5,
        color: C.soft
      }
    }, /*#__PURE__*/React.createElement("div", null, "\u822A\u7A7A\u4F1A\u793E: ", /*#__PURE__*/React.createElement(Blank, {
      value: leg.airline,
      w: 62
    })), /*#__PURE__*/React.createElement("div", null, "\u4FBF\u540D: ", /*#__PURE__*/React.createElement(Blank, {
      value: leg.flightNo,
      w: 62
    })), /*#__PURE__*/React.createElement("div", null, "\u5EA7\u5E2D: ", /*#__PURE__*/React.createElement(Blank, {
      value: leg.seat,
      w: 62
    })), /*#__PURE__*/React.createElement("div", null, "\u4E88\u7D04\u756A\u53F7: ", /*#__PURE__*/React.createElement(Blank, {
      value: leg.pnr,
      w: 62
    }))));
  }
  function Transport({
    tweaks
  }) {
    const C = useC();
    const from = (tweaks.fromCity || '').trim();
    return /*#__PURE__*/React.createElement(Page, {
      bg: C.paperC
    }, /*#__PURE__*/React.createElement(PageHeader, {
      kicker: "getting around",
      title: "\u4EA4\u901A\u30E1\u30E2",
      color: C.blueD,
      accent: C.blue
    }), /*#__PURE__*/React.createElement(ScrollArea, null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gap: 20
      }
    }, /*#__PURE__*/React.createElement(FlightCard, {
      leg: T.flights.outbound,
      fromOverride: from || null
    }), /*#__PURE__*/React.createElement(FlightCard, {
      leg: T.flights.inbound,
      toOverride: from || null
    })), /*#__PURE__*/React.createElement(Card, {
      style: {
        marginTop: 16,
        background: `color-mix(in srgb, ${C.blue} 15%, white)`
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        gap: 12,
        alignItems: 'center',
        marginBottom: 8
      }
    }, /*#__PURE__*/React.createElement("strong", {
      style: {
        color: C.blueD
      }
    }, "\u4E3B\u8981\u30EB\u30FC\u30C8"), /*#__PURE__*/React.createElement(LinkChip, {
      query: "\u7FBD\u7530\u7A7A\u6E2F \u30A2\u30D1\u30DB\u30C6\u30EB\u6771\u4EAC\u30D9\u30A4\u6F6E\u898B",
      color: C.blueD
    }, "\u5730\u56F3")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gap: 7
      }
    }, T.routes.map(r => /*#__PURE__*/React.createElement("div", {
      key: r.label,
      style: {
        display: 'grid',
        gridTemplateColumns: '86px 1fr auto',
        gap: 8,
        alignItems: 'center',
        background: '#fff',
        borderRadius: 10,
        padding: '8px 9px',
        fontSize: 12
      }
    }, /*#__PURE__*/React.createElement("strong", {
      style: {
        color: C.blueD
      }
    }, r.label), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("b", null, r.from), " \u2192 ", /*#__PURE__*/React.createElement("b", null, r.to), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
      style: {
        color: C.soft
      }
    }, r.memo)), /*#__PURE__*/React.createElement(Pill, {
      color: C.blueD
    }, r.time)))))));
  }
  function Hotel() {
    const C = useC();
    return /*#__PURE__*/React.createElement(Page, {
      bg: C.paperA
    }, /*#__PURE__*/React.createElement(PageHeader, {
      kicker: "our hotel",
      title: "\u304A\u5BBF\u306B\u3064\u3044\u3066",
      color: C.warmD,
      accent: C.warm
    }), /*#__PURE__*/React.createElement(ScrollArea, null, /*#__PURE__*/React.createElement(Card, {
      style: {
        padding: '20px 22px',
        position: 'relative'
      }
    }, /*#__PURE__*/React.createElement(Washi, {
      top: -10,
      left: "50%",
      rot: -3,
      w: 130,
      color: `${C.warm}cc`
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        letterSpacing: '.2em',
        color: C.soft,
        marginBottom: 4
      }
    }, "HOTEL / \u51682\u6CCA"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 23,
        fontWeight: 800,
        fontFamily: '"Klee One",sans-serif'
      }
    }, T.hotel.name), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 8,
        flexWrap: 'wrap',
        marginTop: 10
      }
    }, /*#__PURE__*/React.createElement(LinkChip, {
      query: `${T.hotel.name} ${T.hotel.address}`,
      color: C.warmD
    }, "\u30DB\u30C6\u30EB\u5730\u56F3"), /*#__PURE__*/React.createElement(LinkChip, {
      query: `${T.venue.name} ${T.venue.address}`,
      color: C.primaryD
    }, "\u4F1A\u5834\u5730\u56F3")), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 16,
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        rowGap: 9,
        columnGap: 16,
        fontSize: 14,
        alignItems: 'baseline'
      }
    }, /*#__PURE__*/React.createElement(Row, {
      k: "\u4F4F\u6240",
      v: T.hotel.address
    }), /*#__PURE__*/React.createElement(Row, {
      k: "TEL",
      v: /*#__PURE__*/React.createElement(Blank, {
        value: T.hotel.tel,
        w: 140,
        ph: "__ - ____ - ____"
      })
    }), /*#__PURE__*/React.createElement(Row, {
      k: "\u30A2\u30AF\u30BB\u30B9",
      v: T.hotel.access
    }), /*#__PURE__*/React.createElement(Row, {
      k: "\u30C1\u30A7\u30C3\u30AF\u30A4\u30F3",
      v: T.hotel.checkin
    }), /*#__PURE__*/React.createElement(Row, {
      k: "\u30C1\u30A7\u30C3\u30AF\u30A2\u30A6\u30C8",
      v: T.hotel.checkout
    }), /*#__PURE__*/React.createElement(Row, {
      k: "\u304A\u90E8\u5C4B",
      v: /*#__PURE__*/React.createElement(Blank, {
        value: T.hotel.rooms,
        w: 140,
        ph: "\u30C4\u30A4\u30F3 / \u672A\u5165\u529B"
      })
    }), /*#__PURE__*/React.createElement(Row, {
      k: "\u30D7\u30E9\u30F3",
      v: /*#__PURE__*/React.createElement(Blank, {
        value: T.hotel.plan,
        w: 170,
        ph: "\u671D\u98DF\u4ED8\u304D / \u672A\u5165\u529B"
      })
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 16,
        padding: '10px 12px',
        background: `color-mix(in srgb, ${C.warm} 35%, white)`,
        borderRadius: 10,
        fontSize: 13,
        color: C.warmD
      }
    }, /*#__PURE__*/React.createElement(Star, {
      size: 12,
      fill: C.warmD
    }), " ", T.hotel.notes)), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 14,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 12
      }
    }, /*#__PURE__*/React.createElement(Tip, {
      color: C.greenD,
      title: "\u6301\u3063\u3066\u884C\u304F"
    }, "\u30D1\u30B8\u30E3\u30DE / \u5145\u96FB\u5668 / \u7FCC\u671D\u306E\u8EFD\u98DF\u5019\u88DC"), /*#__PURE__*/React.createElement(Tip, {
      color: C.coolD,
      title: "\u7DCA\u6025\u30E1\u30E2"
    }, T.emergency.meeting, /*#__PURE__*/React.createElement("br", null), T.emergency.contact))));
  }
  function Misokin() {
    const C = useC();
    const [slot, setSlot] = useLocalValue('misokin-slot', '1100');
    const plans = T.misokinPlans || [];
    const selected = plans.find(p => p.id === slot) || plans[0];
    return /*#__PURE__*/React.createElement(Page, {
      bg: C.paperC
    }, /*#__PURE__*/React.createElement(PageHeader, {
      kicker: "misokin plan",
      title: "\u307F\u305D\u304D\u3093\u4E88\u7D04\u4F5C\u6226",
      color: C.warmD,
      accent: C.warm
    }), /*#__PURE__*/React.createElement(ScrollArea, null, T.misokinInfo && /*#__PURE__*/React.createElement(Card, {
      style: { marginBottom: 13 }
    }, /*#__PURE__*/React.createElement("div", { style: { fontWeight: 800, color: C.warmD, marginBottom: 8 } }, "みそきん 池袋店 詳細"), /*#__PURE__*/React.createElement("div", { style: { display: 'grid', gridTemplateColumns: 'auto 1fr', rowGap: 6, columnGap: 14, fontSize: 13 } }, /*#__PURE__*/React.createElement(Row, { k: "住所", v: T.misokinInfo.address }), /*#__PURE__*/React.createElement(Row, { k: "アクセス", v: T.misokinInfo.access }), /*#__PURE__*/React.createElement(Row, { k: "営業", v: T.misokinInfo.hours }), /*#__PURE__*/React.createElement(Row, { k: "予約", v: T.misokinInfo.reservation }), /*#__PURE__*/React.createElement(Row, { k: "料金", v: T.misokinInfo.price }), /*#__PURE__*/React.createElement(Row, { k: "枠公開", v: T.misokinInfo.release })), /*#__PURE__*/React.createElement("div", { style: { marginTop: 8, fontSize: 12.5, color: C.warmD, lineHeight: 1.6 } }, "⚠ " + T.misokinInfo.warning), (T.galaxyTraining && T.galaxyTraining.venueCandidates) && /*#__PURE__*/React.createElement("div", { style: { marginTop: 12 } }, /*#__PURE__*/React.createElement("div", { style: { fontWeight: 800, color: C.coolD, marginBottom: 6 } }, "研修のカフェ候補（WiFi・電源確認）"), /*#__PURE__*/React.createElement("div", { style: { display: 'grid', gap: 5, fontSize: 12.5, color: C.soft } }, T.galaxyTraining.venueCandidates.map(function (v, i) { return /*#__PURE__*/React.createElement("div", { key: i }, "・" + v.name + "（" + v.open + "開店" + (v.wifi ? " / WiFi" : "") + (v.power ? "・電源" : "") + "）" + (v.note ? " " + v.note : "")); })))), /*#__PURE__*/React.createElement(Card, {
      style: {
        background: `color-mix(in srgb, ${C.warm} 18%, white)`
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 800,
        color: C.warmD,
        marginBottom: 6
      }
    }, "6/17 \u663C\u306E\u6700\u512A\u5148"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13.5,
        color: C.soft
      }
    }, "\u4E88\u7D04\u67A0\u3067\u5348\u5F8C\u306E\u52D5\u304D\u304C\u5909\u308F\u308B\u306E\u3067\u3001\u53D6\u308C\u305F\u67A0\u3092\u62BC\u3057\u3066\u5F53\u65E5\u306E\u4F5C\u6226\u3092\u56FA\u5B9A\u3057\u307E\u3059\u3002")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 8,
        flexWrap: 'wrap',
        margin: '13px 0'
      }
    }, plans.map(p => /*#__PURE__*/React.createElement(FilterButton, {
      key: p.id,
      active: (selected && selected.id) === p.id,
      onClick: () => setSlot(p.id),
      color: C.warmD
    }, p.id === 'none' ? '予約なし' : p.id.replace(/^(\d{2})(\d{2})$/, '$1:$2')))), selected && /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 18,
        fontWeight: 800,
        fontFamily: '"Klee One",sans-serif',
        color: C.ink
      }
    }, selected.title), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13.5,
        color: C.soft,
        marginTop: 8,
        lineHeight: 1.75
      }
    }, selected.copy)), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 14,
        display: 'grid',
        gap: 9
      }
    }, ['14:15 表参道出発リミットは固定', '有明/豊洲エリア 14:45 着を目標', '混雑・雨・暑さなら原宿スポットを削る'].map((x, i) => /*#__PURE__*/React.createElement(Card, {
      key: i,
      style: {
        display: 'flex',
        gap: 10,
        alignItems: 'center',
        padding: '10px 12px'
      }
    }, /*#__PURE__*/React.createElement(Pill, {
      color: C.primaryD
    }, `RULE ${i + 1}`), /*#__PURE__*/React.createElement("strong", {
      style: {
        fontSize: 13.5
      }
    }, x)))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 8,
        flexWrap: 'wrap',
        marginTop: 14
      }
    }, /*#__PURE__*/React.createElement(LinkChip, {
      query: "\u307F\u305D\u304D\u3093 \u6C60\u888B\u5E97",
      color: C.warmD
    }, "\u307F\u305D\u304D\u3093"), /*#__PURE__*/React.createElement(LinkChip, {
      query: "Age.3\xD7Q HARAJUKU",
      color: C.primaryD
    }, "Age.3\xD7Q"), /*#__PURE__*/React.createElement(LinkChip, {
      query: "CHAVATY \u8868\u53C2\u9053",
      color: C.coolD
    }, "CHAVATY"))));
  }
  function Recommended() {
    const C = useC();
    const [focus, setFocus] = useState('all');
    const focusDefs = [['all', '全部'], ['day1', 'DAY1'], ['day2', 'DAY2'], ['day3', 'DAY3'], ['rest', '休憩']];
    const scoreRow = (row, source, index) => {
      let score = 1000 - index;
      if (source === '保存') score += 70;
      if (row.shiori) score += 150;
      if (row.buzz) score += 80;
      if (row.fit === '今回向き' || row.fit === '両方') score += 90;
      if (row.fit === '6月向き') score += 75;
      if (/東京駅|丸の内|池袋|原宿|表参道|有明|秋葉原|羽田/.test(row.area || '')) score += 80;
      if (/カフェ|スイーツ|甘味|喫茶|休憩/.test(`${row.type || ''} ${row.reason || ''}`)) score += 25;
      if (row.fit === '次回向き') score -= 220;
      return score;
    };
    const rows = [...(T.savedStores || []).map((row, index) => ({
      ...row,
      source: '保存',
      score: scoreRow(row, '保存', index)
    })), ...(T.snsSpots || []).map((row, index) => ({
      ...row,
      source: 'SNS',
      score: scoreRow(row, 'SNS', index)
    }))];
    const byKey = new Map();
    rows.forEach(row => {
      const key = rowKey(row);
      const existing = byKey.get(key);
      if (!existing || row.score > existing.score) byKey.set(key, row);
    });
    const matchesFocus = row => {
      const text = `${row.name || ''} ${row.area || ''} ${row.type || ''} ${row.reason || ''}`;
      if (focus === 'day1') return /東京駅|丸の内|有明|豊洲/.test(text);
      if (focus === 'day2') return /池袋|原宿|表参道|有明|豊洲|みそきん/.test(text);
      if (focus === 'day3') return /秋葉原|羽田|東京駅/.test(text);
      if (focus === 'rest') return /カフェ|スイーツ|甘味|喫茶|休憩|ドーナツ|クレープ|ヨーグルト/.test(text);
      return true;
    };
    const top = [...byKey.values()].filter(matchesFocus).sort((a, b) => b.score - a.score).slice(0, 20);
    return /*#__PURE__*/React.createElement(Page, {
      bg: C.paperC
    }, /*#__PURE__*/React.createElement(PageHeader, {
      kicker: "best picks",
      title: "\u4ECA\u56DE\u306E\u53B3\u9078 TOP20",
      color: C.primaryD,
      accent: C.primary
    }), /*#__PURE__*/React.createElement(ScrollArea, {
      top: 76
    }, /*#__PURE__*/React.createElement(Card, { style: { marginBottom: 10 } }, /*#__PURE__*/React.createElement("div", { style: { fontWeight: 800, color: C.primaryD, marginBottom: 8 } }, "🕐 今回行く店の営業情報"), (T.savedStores || []).filter(function (s) { return s.hours || s.reservation || s.priceRange; }).map(function (s, i) { return /*#__PURE__*/React.createElement("div", { key: i, style: { marginBottom: 8, paddingBottom: 8, borderBottom: '1px dashed rgba(0,0,0,0.08)' } }, /*#__PURE__*/React.createElement("div", { style: { fontWeight: 700, fontSize: 13 } }, s.name + (s.area ? "（" + s.area + "）" : "")), /*#__PURE__*/React.createElement("div", { style: { fontSize: 12, color: C.soft, lineHeight: 1.6 } }, (s.hours ? "🕐 " + s.hours : "") + (s.reservation ? " / 📝 " + s.reservation : "") + (s.priceRange ? " / 💰 " + s.priceRange : ""))); })), /*#__PURE__*/React.createElement(Card, {
      style: {
        background: `color-mix(in srgb, ${C.primary} 12%, white)`,
        marginBottom: 10
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 900,
        color: C.primaryD
      }
    }, "\u53CB\u9054\u306B\u898B\u305B\u308B\u306A\u3089\u3053\u3053\u304B\u3089"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12.6,
        color: C.soft,
        lineHeight: 1.6,
        marginTop: 4
      }
    }, "\u5019\u88DC200\u4EF6\u304B\u3089\u3001\u4ECA\u56DE\u306E\u52D5\u7DDA\u306B\u5408\u3046\u304A\u5E97\u30FB\u4F11\u61A9\u5834\u6240\u3092\u81EA\u52D5\u3067\u4E0A\u4F4D\u8868\u793A\u3057\u3066\u3044\u307E\u3059\u3002")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 7,
        flexWrap: 'wrap',
        marginBottom: 10
      }
    }, focusDefs.map(([key, label]) => /*#__PURE__*/React.createElement(FilterButton, {
      key: key,
      active: focus === key,
      onClick: () => setFocus(key),
      color: key === 'day2' ? C.coolD : key === 'day3' ? C.greenD : C.primaryD
    }, label))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 9
      }
    }, top.map((row, i) => /*#__PURE__*/React.createElement(Card, {
      key: `${row.name}-${i}`,
      style: {
        padding: '10px 11px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        gap: 8,
        alignItems: 'flex-start'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 8,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 27,
        height: 27,
        borderRadius: '50%',
        background: i < 3 ? C.primaryD : '#fff',
        color: i < 3 ? '#fff' : C.primaryD,
        boxShadow: '0 0 0 1.5px ' + C.line,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 12,
        fontWeight: 900,
        flex: '0 0 auto'
      }
    }, i + 1), row.image && /*#__PURE__*/React.createElement("img", {
      src: row.image,
      alt: row.imageAlt || row.name,
      loading: "lazy",
      decoding: "async",
      style: {
        width: 44,
        height: 44,
        borderRadius: 8,
        objectFit: 'cover',
        flex: '0 0 auto',
        boxShadow: '0 0 0 1.5px ' + C.line
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 900,
        fontSize: 13.5,
        lineHeight: 1.32,
        overflowWrap: 'anywhere'
      }
    }, row.name), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 5,
        flexWrap: 'wrap',
        marginTop: 5
      }
    }, /*#__PURE__*/React.createElement(Pill, {
      color: C.orangeD
    }, row.area), /*#__PURE__*/React.createElement(Pill, {
      color: C.coolD
    }, row.type)))), /*#__PURE__*/React.createElement(StoreLink, {
      name: `${row.name} ${row.area}`,
      official: row.official
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: C.soft,
        lineHeight: 1.5,
        marginTop: 7
      }
    }, row.reason || row.caution || `${row.source}候補。時間と混雑を見て選ぶ。`))))));
  }
  function Candidates() {
    const C = useC();
    const [mode, setMode] = useState('sns');
    const [query, setQuery] = useState('');
    const [filter, setFilter] = useState('shiori');
    const q = query.trim().toLowerCase();
    const filters = T.snsFilters || [];
    const rows = mode === 'saved' ? T.savedStores || [] : T.snsSpots || [];
    const visible = rows.filter(row => {
      const text = `${row.name} ${row.area} ${row.type} ${row.fit} ${(row.keys || []).join(' ')} ${row.reason || ''}`.toLowerCase();
      const queryOk = !q || text.includes(q);
      if (!queryOk) return false;
      if (mode === 'saved') {
        return filter === 'all' || row.fit === filter || (row.lists || []).includes(filter);
      }
      if (filter === 'all') return true;
      if (filter === 'shiori') return row.shiori || row.buzz || row.fit === '6月向き';
      return (row.keys || []).includes(filter);
    });
    return /*#__PURE__*/React.createElement(Page, {
      bg: C.paperA
    }, /*#__PURE__*/React.createElement(PageHeader, {
      kicker: "spots & food",
      title: "\u5019\u88DC\u30EA\u30B9\u30C8",
      color: C.orangeD,
      accent: C.orange
    }), /*#__PURE__*/React.createElement(ScrollArea, {
      top: 74
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: '1fr auto auto',
        gap: 8,
        marginBottom: 10
      }
    }, /*#__PURE__*/React.createElement(TextInput, {
      value: query,
      onChange: setQuery,
      placeholder: "\u5E97\u540D\u30FB\u30A8\u30EA\u30A2\u30FB\u30AB\u30C6\u30B4\u30EA\u3067\u691C\u7D22"
    }), /*#__PURE__*/React.createElement(FilterButton, {
      active: mode === 'sns',
      onClick: () => {
        setMode('sns');
        setFilter('shiori');
      },
      color: C.orangeD
    }, "\u5019\u88DC200"), /*#__PURE__*/React.createElement(FilterButton, {
      active: mode === 'saved',
      onClick: () => {
        setMode('saved');
        setFilter('今回向き');
      },
      color: C.greenD
    }, "\u4FDD\u5B5862")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 7,
        flexWrap: 'wrap',
        marginBottom: 10
      }
    }, mode === 'saved' ? [['今回向き', '今回向き'], ['時間があれば', '時間があれば'], ['次回向き', '次回向き'], ['sweets', 'スイーツ'], ['lunch', 'ランチ'], ['all', '全部']].map(([key, label]) => /*#__PURE__*/React.createElement(FilterButton, {
      key: key,
      active: filter === key,
      onClick: () => setFilter(key),
      color: C.greenD
    }, label)) : [{
      key: 'shiori',
      label: '今回優先'
    }, ...filters, {
      key: 'all',
      label: '全部'
    }].map(f => /*#__PURE__*/React.createElement(FilterButton, {
      key: f.key,
      active: filter === f.key,
      onClick: () => setFilter(f.key),
      color: C.orangeD
    }, f.label))), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: C.soft,
        marginBottom: 8
      }
    }, visible.length, " / ", rows.length, " \u4EF6\u8868\u793A"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gap: 9
      }
    }, visible.map((row, i) => /*#__PURE__*/React.createElement(Card, {
      key: `${mode}-${row.name}-${i}`,
      style: {
        padding: '11px 12px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        gap: 8,
        alignItems: 'flex-start'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 10,
        minWidth: 0,
        alignItems: 'flex-start'
      }
    }, row.image && /*#__PURE__*/React.createElement("img", {
      src: row.image,
      alt: row.imageAlt || row.name,
      loading: "lazy",
      decoding: "async",
      style: {
        width: 72,
        height: 72,
        borderRadius: 10,
        objectFit: 'cover',
        flex: '0 0 auto',
        boxShadow: '0 0 0 1.5px ' + C.line
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 900,
        fontSize: 14.5,
        lineHeight: 1.35,
        overflowWrap: 'anywhere'
      }
    }, row.name), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 6,
        flexWrap: 'wrap',
        marginTop: 5
      }
    }, /*#__PURE__*/React.createElement(Pill, {
      color: C.orangeD
    }, row.area), /*#__PURE__*/React.createElement(Pill, {
      color: C.coolD
    }, row.type), /*#__PURE__*/React.createElement(Pill, {
      color: C.greenD
    }, row.fit)))), /*#__PURE__*/React.createElement(StoreLink, {
      name: `${row.name} ${row.area}`,
      official: row.official
    })), (row.reason || row.caution) && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12.3,
        color: C.soft,
        marginTop: 7,
        lineHeight: 1.55
      }
    }, row.reason, row.caution ? ` ／ ${row.caution}` : ''))))));
  }
  function Packing() {
    const C = useC();
    const labels = T.packing || [];
    const half = Math.ceil(labels.length / 2);
    const [left, toggleLeft] = useChecklist('official-must-v2', labels.slice(0, half));
    const [right, toggleRight] = useChecklist('official-extra-v2', labels.slice(half));
    const doneCount = [...left, ...right].filter(x => x.done).length;
    const totalCount = left.length + right.length;
    return /*#__PURE__*/React.createElement(Page, {
      bg: C.paperA
    }, /*#__PURE__*/React.createElement(PageHeader, {
      kicker: "packing list",
      title: "\u6301\u3061\u7269\u30C1\u30A7\u30C3\u30AF",
      color: C.greenD,
      accent: C.green
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        top: 34,
        right: 32,
        background: '#fff',
        padding: '8px 14px',
        borderRadius: 99,
        fontFamily: '"Klee One",sans-serif',
        fontSize: 13,
        fontWeight: 800,
        color: C.greenD,
        boxShadow: '0 0 0 1.5px ' + C.line
      }
    }, /*#__PURE__*/React.createElement(Star, {
      size: 12,
      fill: C.greenD
    }), " ", doneCount, " / ", totalCount, " \u5B8C\u4E86"), /*#__PURE__*/React.createElement(ScrollArea, null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 14
      }
    }, /*#__PURE__*/React.createElement(ChecklistBox, {
      title: "\u30E9\u30A4\u30D6\u5FC5\u9808",
      color: C.primaryD,
      items: left,
      onToggle: toggleLeft
    }), /*#__PURE__*/React.createElement(ChecklistBox, {
      title: "\u65C5\u306E\u5B89\u5FC3",
      color: C.coolD,
      items: right,
      onToggle: toggleRight
    })), /*#__PURE__*/React.createElement(Card, {
      style: {
        marginTop: 14,
        background: `color-mix(in srgb, ${C.primary} 12%, white)`,
        fontSize: 12.8
      }
    }, "\u524D\u65E5\u591C\u3068\u51FA\u767A\u76F4\u524D\u306B\u3082\u3046\u4E00\u5EA6\u30C1\u30A7\u30C3\u30AF\u3002\u30C1\u30A7\u30C3\u30AF\u72B6\u614B\u306F\u3053\u306E\u30D6\u30E9\u30A6\u30B6\u306B\u4FDD\u5B58\u3055\u308C\u307E\u3059\u3002")));
  }
  function ChecklistBox({
    title,
    color,
    items,
    onToggle
  }) {
    const C = useC();
    return /*#__PURE__*/React.createElement(Card, {
      style: {
        padding: '14px 14px 16px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: '"Klee One",sans-serif',
        fontWeight: 800,
        fontSize: 15,
        color,
        marginBottom: 10,
        paddingBottom: 6,
        borderBottom: `1.5px dashed ${C.line}`
      }
    }, title), /*#__PURE__*/React.createElement("ul", {
      style: {
        listStyle: 'none',
        margin: 0,
        padding: 0
      }
    }, items.map((it, i) => /*#__PURE__*/React.createElement("li", {
      key: i
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => onToggle(i),
      style: {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        background: 'transparent',
        border: 'none',
        padding: '5px 2px',
        cursor: 'pointer',
        textAlign: 'left',
        fontFamily: 'inherit',
        fontSize: 13.2,
        color: C.ink,
        opacity: it.done ? .55 : 1,
        textDecoration: it.done ? 'line-through' : 'none',
        textDecorationColor: color
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 20,
        height: 20,
        borderRadius: 6,
        border: `2px solid ${color}`,
        background: it.done ? color : '#fff',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flex: '0 0 auto'
      }
    }, it.done && /*#__PURE__*/React.createElement("span", {
      style: {
        color: '#fff',
        fontWeight: 900,
        lineHeight: 1
      }
    }, "\u2713")), /*#__PURE__*/React.createElement("span", null, it.label))))));
  }
  function Goods() {
    const C = useC();
    const [goods, toggleGoods] = useChecklist('goods-v2', ['推しタオル DAY1', '推しタオル DAY2', 'ペンライト', 'アクスタ', 'トレカ', 'パンフレット']);
    const budgetRows = [['traffic', '交通費'], ['hotel', '宿泊費'], ['food', '食事代'], ['goods', 'グッズ・推し活'], ['souvenir', 'お土産'], ['other', 'その他']];
    const [budget, setBudget] = useLocalValue('budget', {
      traffic: '',
      hotel: '',
      food: '',
      goods: '',
      souvenir: '',
      other: ''
    });
    const setBudgetField = (key, value) => setBudget(prev => ({
      ...prev,
      [key]: value.replace(/[^\d]/g, '')
    }));
    const total = budgetRows.reduce((sum, [key]) => sum + Number(budget[key] || 0), 0);
    return /*#__PURE__*/React.createElement(Page, {
      bg: C.paperC
    }, /*#__PURE__*/React.createElement(PageHeader, {
      kicker: "goods & budget",
      title: "\u30B0\u30C3\u30BA \uFF06 \u304A\u5C0F\u9063\u3044",
      color: C.primaryD,
      accent: C.primary
    }), /*#__PURE__*/React.createElement(ScrollArea, null, (T.budget || T.goods) && /*#__PURE__*/React.createElement(Card, { style: { marginBottom: 14 } }, T.budget && /*#__PURE__*/React.createElement("div", { style: { fontWeight: 800, color: C.warmD, marginBottom: 8 } }, "予算の目安（" + T.budget.perPerson + "）"), T.budget && /*#__PURE__*/React.createElement("div", { style: { display: 'grid', gridTemplateColumns: 'auto 1fr', rowGap: 5, columnGap: 14, fontSize: 13, marginBottom: 8 } }, (T.budget.items || []).map(function (it, i) { return /*#__PURE__*/React.createElement(Row, { key: i, k: it.label, v: it.value }); })), T.budget && T.budget.note && /*#__PURE__*/React.createElement("div", { style: { fontSize: 12, color: C.soft, marginBottom: 10 } }, T.budget.note), T.goods && /*#__PURE__*/React.createElement("div", { style: { fontWeight: 800, color: C.primaryD, marginBottom: 6 } }, "物販メモ"), T.goods && /*#__PURE__*/React.createElement("div", { style: { fontSize: 12.5, color: C.soft, lineHeight: 1.7 } }, T.goods.advanceSale ? "通販先行: " + T.goods.advanceSale : "", /*#__PURE__*/React.createElement("br"), T.goods.venueSale ? "会場販売: " + T.goods.venueSale : "", /*#__PURE__*/React.createElement("br"), T.goods.tips || "")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 14,
        marginBottom: 14
      }
    }, /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 800,
        color: C.primaryD,
        marginBottom: 8
      }
    }, "\u8CB7\u3044\u305F\u3044\u30B0\u30C3\u30BA"), goods.map((g, i) => /*#__PURE__*/React.createElement("button", {
      key: i,
      onClick: () => toggleGoods(i),
      style: {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 9,
        border: 'none',
        background: 'transparent',
        padding: '5px 0',
        fontFamily: 'inherit',
        fontSize: 13,
        textAlign: 'left',
        textDecoration: g.done ? 'line-through' : 'none',
        opacity: g.done ? .55 : 1,
        cursor: 'pointer'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: C.primaryD
      }
    }, "\u25CB"), g.label))), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 800,
        color: C.coolD,
        marginBottom: 8
      }
    }, "\u304A\u571F\u7523\u30E1\u30E2"), ['家族へ', '会社へ', '自分用', '予備'].map(x => /*#__PURE__*/React.createElement("div", {
      key: x,
      style: {
        fontSize: 13,
        lineHeight: 1.9
      }
    }, x, " \uFF0F ", /*#__PURE__*/React.createElement(Blank, {
      value: "",
      w: 90
    }))))), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 800,
        color: C.warmD,
        marginBottom: 10
      }
    }, "\u4E88\u7B97"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: 'auto 1fr auto',
        rowGap: 7,
        columnGap: 14,
        fontSize: 14,
        alignItems: 'center'
      }
    }, budgetRows.map(([key, label]) => /*#__PURE__*/React.createElement(React.Fragment, {
      key: key
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: C.soft,
        fontSize: 13
      }
    }, label), /*#__PURE__*/React.createElement("input", {
      "aria-label": `${label} 金額`,
      type: "text",
      inputMode: "numeric",
      value: budget[key] || '',
      placeholder: "0",
      onChange: e => setBudgetField(key, e.target.value),
      style: {
        minWidth: 0,
        width: '100%',
        border: 'none',
        borderBottom: `1.5px dotted ${C.line}`,
        background: 'transparent',
        outline: 'none',
        textAlign: 'right',
        fontFamily: '"Klee One",sans-serif',
        fontWeight: 800,
        fontSize: 14,
        color: C.ink
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        color: C.warmD,
        fontWeight: 800
      }
    }, "\u5186"))), /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 900,
        paddingTop: 6,
        borderTop: `1.5px solid ${C.warm}`
      }
    }, "\u5408\u8A08"), /*#__PURE__*/React.createElement("div", {
      style: {
        borderBottom: `2px solid ${C.warmD}`,
        paddingTop: 6,
        textAlign: 'right',
        color: C.warmD,
        fontWeight: 900
      }
    }, yen(total)), /*#__PURE__*/React.createElement("div", null)))));
  }
  function MapPage() {
    const C = useC();
    const days = T.routeMapDays || [];
    const [dayId, setDayId] = useState(days[0] && days[0].id || 'day1');
    const selected = days.find(d => d.id === dayId) || days[0] || {};
    const pins = T.mapPins || [];
    const pinById = Object.fromEntries(pins.map(p => [p.id, p]));
    const routeColor = selected.color === 'cool' ? C.coolD : selected.color === 'green' ? C.greenD : C.primaryD;
    const routeBg = selected.color === 'cool' ? `${C.cool}26` : selected.color === 'green' ? `${C.green}30` : `${C.primary}24`;
    const pathPoints = (selected.path || []).map(id => pinById[id]).filter(Boolean);
    const pathD = pathPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const selectedPinIds = new Set((selected.steps || []).map(step => step.pin));
    const quickLinks = [['ホテル', `${T.hotel.name} ${T.hotel.address}`, C.coolD], ['会場', `${T.venue.name} ${T.venue.address}`, C.primaryD], ['羽田', '羽田空港', C.blueD], ['みそきん', 'みそきん 池袋店', C.orangeD], ['原宿', 'Age.3×Q HARAJUKU', C.greenD], ['秋葉原', 'ヨドバシカメラ マルチメディアAkiba', C.warmD]];
    const directionLinks = [['ホテル→会場', 'アパホテル 東京ベイ潮見', '有明アリーナ', C.primaryD], ['池袋→原宿', 'みそきん 池袋店', '原宿駅', C.coolD], ['ホテル→羽田', 'アパホテル 東京ベイ潮見', '羽田空港', C.blueD]];
    return /*#__PURE__*/React.createElement(Page, {
      bg: C.paperA
    }, /*#__PURE__*/React.createElement(PageHeader, {
      kicker: "route map",
      title: "3\u65E5\u9593\u30EB\u30FC\u30C8 MAP",
      color: C.greenD,
      accent: C.green
    }), /*#__PURE__*/React.createElement(ScrollArea, {
      top: 96
    }, /*#__PURE__*/React.createElement(Card, { style: { padding: 12, marginBottom: 10 } }, /*#__PURE__*/React.createElement("div", { style: { fontWeight: 800, color: C.greenD, marginBottom: 8 } }, "🗺 実際の地図（有明アリーナ周辺）"), /*#__PURE__*/React.createElement("iframe", { src: "https://maps.google.com/maps?q=" + encodeURIComponent(T.venue.name + " 東京") + "&z=15&output=embed", title: "有明アリーナ周辺の地図", loading: "lazy", referrerPolicy: "no-referrer-when-downgrade", allowFullScreen: true, style: { width: '100%', height: 280, border: 0, borderRadius: 12, display: 'block' } }), (T.savedMapLists && T.savedMapLists.length) && /*#__PURE__*/React.createElement("div", { style: { marginTop: 10 } }, /*#__PURE__*/React.createElement("div", { style: { fontSize: 12, color: C.soft, marginBottom: 6 } }, "Googleマップ保存リスト（グルメ）"), /*#__PURE__*/React.createElement("div", { style: { display: 'flex', gap: 8, flexWrap: 'wrap' } }, T.savedMapLists.map(function (l, i) { return /*#__PURE__*/React.createElement("a", { key: i, href: l.href, target: "_blank", rel: "noopener noreferrer", style: { fontSize: 12.5, color: C.greenD, textDecoration: 'none', border: '1.5px solid ' + C.greenD, borderRadius: 999, padding: '5px 12px', fontWeight: 600 } }, "📍 " + l.label); })))), /*#__PURE__*/React.createElement(Card, {
      style: {
        padding: 12,
        marginBottom: 10,
        background: `linear-gradient(135deg, #fff, ${routeBg})`
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        gap: 12,
        alignItems: 'flex-start'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: '"Klee One",sans-serif',
        fontWeight: 900,
        color: routeColor,
        fontSize: 17
      }
    }, selected.title || '東京ルート'), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12.4,
        color: C.soft,
        lineHeight: 1.55,
        marginTop: 3
      }
    }, selected.memo || 'その日の移動だけを太線で表示します。ピンを押すとGoogle Mapsが開きます。')), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 6,
        flexWrap: 'wrap',
        justifyContent: 'flex-end',
        flex: '0 0 210px'
      }
    }, days.map(d => /*#__PURE__*/React.createElement(FilterButton, {
      key: d.id,
      active: selected.id === d.id,
      onClick: () => setDayId(d.id),
      color: d.color === 'cool' ? C.coolD : d.color === 'green' ? C.greenD : C.primaryD
    }, d.label)))), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 9,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 8,
        fontSize: 12.2
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: '#fff',
        borderRadius: 10,
        padding: '7px 9px',
        boxShadow: `0 0 0 1.2px ${C.line}`
      }
    }, /*#__PURE__*/React.createElement("strong", {
      style: {
        color: C.blueD
      }
    }, "\u5F80\u8DEF"), " ", T.flights.outbound.flightNo, " \uFF0F ", T.flights.outbound.depTime, " \u90A3\u8987 \u2192 ", T.flights.outbound.arrTime, " \u7FBD\u7530"), /*#__PURE__*/React.createElement("div", {
      style: {
        background: '#fff',
        borderRadius: 10,
        padding: '7px 9px',
        boxShadow: `0 0 0 1.2px ${C.line}`
      }
    }, /*#__PURE__*/React.createElement("strong", {
      style: {
        color: C.blueD
      }
    }, "\u5FA9\u8DEF"), " ", T.flights.inbound.flightNo, " \uFF0F ", T.flights.inbound.depTime, " \u7FBD\u7530 \u2192 ", T.flights.inbound.arrTime, " \u90A3\u8987"))), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'relative',
        width: '100%',
        aspectRatio: '1 / 0.62',
        background: '#fffdfb',
        borderRadius: 18,
        overflow: 'hidden',
        border: `1.5px solid ${C.line}`,
        boxShadow: `0 0 0 5px ${routeBg}`
      }
    }, /*#__PURE__*/React.createElement("svg", {
      viewBox: "0 0 100 100",
      style: {
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%'
      }
    }, /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("marker", {
      id: "route-arrow",
      markerWidth: "4.8",
      markerHeight: "4.8",
      refX: "4.2",
      refY: "2.4",
      orient: "auto",
      markerUnits: "userSpaceOnUse"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M0,0 L4.8,2.4 L0,4.8 Z",
      fill: routeColor
    }))), /*#__PURE__*/React.createElement("rect", {
      x: "0",
      y: "0",
      width: "100",
      height: "100",
      fill: "#fffdfb"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M66 0 C 62 20 64 38 70 53 C 75 66 74 81 66 100 L100 100 L100 0 Z",
      fill: `${C.blue}33`
    }), /*#__PURE__*/React.createElement("path", {
      d: "M58 67 C 70 62 83 64 100 73 L100 100 L45 100 C54 89 53 75 58 67 Z",
      fill: `${C.green}34`
    }), /*#__PURE__*/React.createElement("path", {
      d: "M0 61 C19 57 33 62 47 58 C60 54 78 50 100 56",
      stroke: `${C.greenD}33`,
      strokeWidth: "7",
      fill: "none",
      strokeLinecap: "round"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M22 12 L37 30 L51 46 L65 58 L76 88",
      stroke: `${C.blueD}30`,
      strokeWidth: "2",
      fill: "none",
      strokeLinecap: "round"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M18 48 L37 42 L50 46 L66 58 L75 70",
      stroke: `${C.coolD}30`,
      strokeWidth: "2",
      fill: "none",
      strokeLinecap: "round"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M28 18 L43 27 L57 34 L66 58",
      stroke: `${C.primaryD}25`,
      strokeWidth: "2",
      fill: "none",
      strokeLinecap: "round"
    }), /*#__PURE__*/React.createElement("text", {
      x: "18",
      y: "16",
      fill: C.soft,
      opacity: ".38",
      fontSize: "5",
      fontWeight: "700"
    }, "IKEBUKURO"), /*#__PURE__*/React.createElement("text", {
      x: "45",
      y: "42",
      fill: C.soft,
      opacity: ".38",
      fontSize: "5",
      fontWeight: "700"
    }, "TOKYO"), /*#__PURE__*/React.createElement("text", {
      x: "72",
      y: "61",
      fill: C.blueD,
      opacity: ".42",
      fontSize: "5",
      fontWeight: "700"
    }, "BAY"), /*#__PURE__*/React.createElement("text", {
      x: "72",
      y: "91",
      fill: C.soft,
      opacity: ".42",
      fontSize: "5",
      fontWeight: "700"
    }, "HANEDA"), pins.map(p => /*#__PURE__*/React.createElement("g", {
      key: p.id,
      opacity: selectedPinIds.has(p.id) ? 1 : .35
    }, /*#__PURE__*/React.createElement("circle", {
      cx: p.x,
      cy: p.y,
      r: selectedPinIds.has(p.id) ? 2.4 : 1.7,
      fill: selectedPinIds.has(p.id) ? routeColor : '#fff',
      stroke: selectedPinIds.has(p.id) ? '#fff' : C.line,
      strokeWidth: selectedPinIds.has(p.id) ? 1.3 : .9
    }))), pathD && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: pathD,
      stroke: "#fff",
      strokeWidth: "6.2",
      fill: "none",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      opacity: ".92"
    }), /*#__PURE__*/React.createElement("path", {
      d: pathD,
      stroke: routeColor,
      strokeWidth: "3.2",
      fill: "none",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      markerEnd: "url(#route-arrow)"
    }))), (selected.steps || []).map((step, i) => {
      const p = pinById[step.pin];
      if (!p) return null;
      const left = p.x + (step.dx || 0);
      const top = p.y + (step.dy || 0);
      const href = mapsUrl(step.query || p.query || step.label || p.label);
      return /*#__PURE__*/React.createElement("a", {
        key: `${selected.id}-${i}-${step.pin}`,
        href: href,
        target: "_blank",
        rel: "noreferrer",
        style: {
          position: 'absolute',
          left: `${left}%`,
          top: `${top}%`,
          transform: 'translate(-50%, -50%)',
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          maxWidth: 145
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          width: 24,
          height: 24,
          borderRadius: '50%',
          background: routeColor,
          color: '#fff',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 12,
          fontWeight: 900,
          boxShadow: '0 2px 7px rgba(0,0,0,.18)',
          border: '2px solid #fff',
          flex: '0 0 auto'
        }
      }, i + 1), /*#__PURE__*/React.createElement("div", {
        style: {
          padding: '4px 7px',
          background: 'rgba(255,255,255,.95)',
          borderRadius: 8,
          color: C.ink,
          boxShadow: `0 0 0 1px ${C.line}`,
          lineHeight: 1.25,
          minWidth: 0
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 10.5,
          color: routeColor,
          fontWeight: 900,
          whiteSpace: 'nowrap'
        }
      }, step.time), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 11.2,
          fontWeight: 900,
          overflowWrap: 'anywhere'
        }
      }, step.label)));
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        top: 12,
        left: 14,
        fontFamily: '"Caveat",cursive',
        fontSize: 28,
        color: routeColor
      }
    }, "Tokyo route"), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        top: 15,
        right: 14,
        fontSize: 11,
        color: C.soft,
        background: 'rgba(255,255,255,.84)',
        padding: '3px 8px',
        borderRadius: 99,
        fontWeight: 800
      }
    }, "N \u2191  tap pins")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(5, minmax(0,1fr))',
        gap: 7,
        marginTop: 12
      }
    }, (selected.steps || []).map((step, i) => /*#__PURE__*/React.createElement(Card, {
      key: `${selected.id}-card-${i}`,
      style: {
        padding: '8px 8px',
        fontSize: 11.4,
        lineHeight: 1.45
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        marginBottom: 3
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 19,
        height: 19,
        borderRadius: '50%',
        background: routeColor,
        color: '#fff',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 10,
        fontWeight: 900,
        flex: '0 0 auto'
      }
    }, i + 1), /*#__PURE__*/React.createElement("strong", {
      style: {
        color: routeColor
      }
    }, step.time)), /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 900,
        color: C.ink,
        overflowWrap: 'anywhere'
      }
    }, step.label), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 2,
        color: C.soft
      }
    }, step.detail)))), /*#__PURE__*/React.createElement(Card, {
      style: {
        marginTop: 12,
        padding: '11px 12px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        gap: 10,
        alignItems: 'center',
        marginBottom: 8
      }
    }, /*#__PURE__*/React.createElement("strong", {
      style: {
        color: C.greenD
      }
    }, "\u3059\u3050\u958B\u304F\u5730\u56F3\u30EA\u30F3\u30AF"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11.5,
        color: C.soft
      }
    }, "\u8FF7\u3063\u305F\u3089\u3053\u3053\u304B\u3089")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 7,
        flexWrap: 'wrap'
      }
    }, quickLinks.map(([label, query, color]) => /*#__PURE__*/React.createElement(LinkChip, {
      key: label,
      query: query,
      color: color
    }, label))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 7,
        flexWrap: 'wrap',
        marginTop: 8
      }
    }, directionLinks.map(([label, origin, destination, color]) => /*#__PURE__*/React.createElement("a", {
      key: label,
      href: routeUrl(origin, destination),
      target: "_blank",
      rel: "noreferrer",
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        textDecoration: 'none',
        background: '#fff',
        color,
        borderRadius: 99,
        padding: '5px 10px',
        fontSize: 12.5,
        fontWeight: 700,
        boxShadow: '0 0 0 1.5px ' + C.line,
        whiteSpace: 'nowrap'
      }
    }, /*#__PURE__*/React.createElement("span", null, "\u2197"), /*#__PURE__*/React.createElement("span", null, label)))))));
  }
  window.KP.pages = {
    Cover,
    NowPage,
    Schedule,
    Transport,
    Hotel,
    Misokin,
    Recommended,
    Candidates,
    Packing,
    Goods,
    MapPage
  };
})();
