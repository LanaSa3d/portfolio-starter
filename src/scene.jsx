import React from 'react'
import { LaptopScreen } from './laptop-screens.jsx'
import { PhoneScreen } from './phone-screens.jsx'

const FALLBACK_CARD_DATA = {
  identity: { name: "Your Name", title: "Your Title", status: "available", location: "Location" },
  about: { lines: ["About line 1", "About line 2", "Highlight", "Description 1", "Description 2"] },
  currently: { heading: "Current Work", detail: "details", extra: "extra" },
  stack: { items: ["tech · stack", "python · java", "next.js · flutter", "rag · ai", "tools", "databases"] },
  contact: { lines: ["email", "@domain.com", "phone", "social", "click for links →"] },
  honors: { lines: ["Achievement 1", "Achievement 2", "Achievement 3", "Date"] },
  certs: { entries: [] },
  latest: { eyebrow: "latest", heading: "Field Note", action: "new post ->" },
  work: { heading: "work", action: "click to open →" },
  tweaks: { heading: "tweaks", action: "palette · screens →" },
};

const DEFAULT_POSITIONS = {
  // Row 1 (top of the cork board)
  contact:  { x: 46,   y: -14, rot: 1.5 },
  resume:   { x: 394,  y: -22, rot: 1 },
  identity: { x: 772,  y: -12, rot: -1.2 },
  honors:   { x: 1196, y: -24, rot: -1 },
  certs:    { x: 1600, y: -6,  rot: -0.5 },
  // Row 2 — every card ends above the laptop lid (y ≈ 380) on the right half
  stack:     { x: 44,   y: 248, rot: -0.8 },
  about:     { x: 336,  y: 256, rot: 0.7 },
  currently: { x: 748,  y: 262, rot: 2 },
  work:      { x: 1038, y: 220, rot: 1 },
  latest:    { x: 1338, y: 222, rot: -1 },
  tweaks:    { x: 1786, y: 318, rot: 0.5 },
  social:    { x: 0, y: 0, rot: 0 },
  // Desk objects (offsets from their drawn position)
  laptop:   { x: 223.8, y: -7.1,  rot: 0 },
  phone:    { x: -160, y: -144.8, rot: 0 },
  camera:   { x: 120, y: -36.4, rot: 0 },
  inkpot:   { x: 20, y: 0, rot: 0 },
  medal:    { x: 0, y: -26, rot: 0 },
  chess:    { x: 98, y: 0, rot: 0 },
  notebook: { x: -920, y: -60.4, rot: 0 },
  mug:      { x: -670.1, y: -42.6, rot: 0 },
  desk:     { x: 22.2,  y: 76.4,  rot: 0 },
};

const DESK_INTRO_STORAGE_KEY = 'yara_desk_intro_seen';

// Card text that mirrors for right-to-left pages: x is measured from the card's
// right edge. In SVG, `start` follows the writing direction, so RTL text grows
// leftward from that point and stays inside the note.
const CardCtx = React.createContext({ w: 0, rtl: false });
const AR_SERIF = "'Thmanyah Display', 'Fraunces', serif";
const AR_SANS = "'Thmanyah Sans', 'IBM Plex Mono', monospace";

function CT({ x = 0, textAnchor, fontFamily = '', children, ...rest }) {
  const { w, rtl } = React.useContext(CardCtx);
  if (!rtl) return <text x={x} textAnchor={textAnchor} fontFamily={fontFamily} {...rest}>{children}</text>;
  const anchor = textAnchor === 'middle' ? 'middle' : 'start';
  const ff = /Mono|mono/.test(fontFamily) ? AR_SANS : AR_SERIF;
  return (
    <text x={anchor === 'middle' ? x : w - x} textAnchor={anchor} direction="rtl" fontFamily={ff} {...rest}>
      {children}
    </text>
  );
}

function DeskScene({
  onLaptopEnter, onLaptopLeave, onPhoneEnter, onPhoneLeave,
  onItemClick, onBoardClick, onMugClick,
  laptopHovered, phoneHovered,
  laptopKind, phoneKind,
  cardData, whiteboardText,
  rtl = false,
  mugHidden = false,
  isAdmin = false,
}) {
  const stroke = 'var(--line)';
  const svgRef = React.useRef(null);
  const cd = cardData || FALLBACK_CARD_DATA;

  const DESK_ITEMS = React.useMemo(() => new Set(['laptop','phone','camera','notebook','mug','inkpot','medal','chess']), []);

  const [pos, setPos] = React.useState(() => {
    try {
      const saved = localStorage.getItem('yara_layout');
      if (saved) return { ...DEFAULT_POSITIONS, ...JSON.parse(saved) };
    } catch (e) {}
    return { ...DEFAULT_POSITIONS };
  });

  React.useEffect(() => {
    if (isAdmin) localStorage.setItem('yara_layout', JSON.stringify(pos));
  }, [pos, isAdmin]);

  React.useEffect(() => {
    if (isAdmin) return;
    const h = (e) => {
      if (e.key === 'yara_layout' && e.newValue) {
        try { setPos(prev => ({ ...prev, ...JSON.parse(e.newValue) })); } catch (_) {}
      }
    };
    window.addEventListener('storage', h);
    return () => window.removeEventListener('storage', h);
  }, [isAdmin]);

  const [drag, setDrag] = React.useState(null);
  const [hoverItem, setHoverItem] = React.useState(null);
  const [entered, setEntered] = React.useState(false);
  const [introVisible, setIntroVisible] = React.useState(() => {
    if (isAdmin) return false;
    try {
      return localStorage.getItem(DESK_INTRO_STORAGE_KEY) !== '1';
    } catch (_) {
      return true;
    }
  });

  React.useEffect(() => { requestAnimationFrame(() => setEntered(true)); }, []);

  React.useEffect(() => {
    if (isAdmin || !introVisible) return undefined;
    const timer = window.setTimeout(() => {
      setIntroVisible(false);
      try { localStorage.setItem(DESK_INTRO_STORAGE_KEY, '1'); } catch (_) {}
    }, 5200);
    return () => window.clearTimeout(timer);
  }, [introVisible, isAdmin]);

  const toSVG = (e) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    if (typeof svg.createSVGPoint !== 'function' || typeof svg.getScreenCTM !== 'function') {
      return { x: e.clientX || 0, y: e.clientY || 0 };
    }
    const pt = svg.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return { x: e.clientX || 0, y: e.clientY || 0 };
    return pt.matrixTransform(ctm.inverse());
  };

  const startDrag = (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    const p = toSVG(e);
    setDrag({ id, ox: pos[id]?.x || 0, oy: pos[id]?.y || 0, sx: p.x, sy: p.y, moved: false });
  };

  const onMove = (e) => {
    if (!drag) return;
    if (!isAdmin) return; // viewer: no dragging, but clicks still work via onUp
    const p = toSVG(e);
    const dx = p.x - drag.sx, dy = p.y - drag.sy;
    if (!drag.moved && Math.hypot(dx, dy) > 5) setDrag(d => ({ ...d, moved: true }));
    setPos(ps => ({ ...ps, [drag.id]: { ...ps[drag.id], x: drag.ox + dx, y: drag.oy + dy } }));
  };

  const onUp = () => {
    if (drag && !drag.moved) {
      if (DESK_ITEMS.has(drag.id)) {
        onItemClick?.(drag.id);
      } else if (drag.id !== 'desk') {
        onBoardClick?.(drag.id);
      }
    }
    setDrag(null);
  };

  const deskItemStyle = (id, cursor = 'pointer') => ({
    cursor: (drag?.id === id && isAdmin) ? 'grabbing' : cursor,
    opacity: (drag?.id === id && isAdmin) ? 0.88 : 1,
  });

  // Keyboard + screen-reader access for every clickable desk object.
  const itemA11y = (id, label) => ({
    role: 'button',
    tabIndex: 0,
    'aria-label': label,
    onKeyDown: (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onItemClick?.(id); }
    },
    onFocus: () => setHoverItem(id),
    onBlur: () => setHoverItem(null),
  });

  const cueMode = (item) => {
    if (isAdmin) return 'none';
    if (hoverItem === item) return 'hover';
    if (introVisible) return 'intro';
    if (item === 'laptop' || item === 'phone' || item === 'notebook') return 'ambient';
    return 'none';
  };

  return (
    <svg
      ref={svgRef}
      viewBox="0 -140 2100 1200"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
      style={{ width:'100%', height:'100%', display:'block',
               cursor: (drag && isAdmin) ? 'grabbing' : 'default',
               opacity: entered ? 1 : 0, transition: 'opacity 0.6s ease' }}
      onMouseMove={onMove}
      onMouseUp={onUp}
      onMouseLeave={onUp}
    >
      <defs>
        <pattern id="wall-texture" width="4" height="4" patternUnits="userSpaceOnUse">
          <rect width="4" height="4" fill="transparent" />
          <circle cx="1" cy="1" r="0.35" fill="rgba(58,47,38,0.05)" />
        </pattern>
        <pattern id="cork" width="8" height="8" patternUnits="userSpaceOnUse">
          <rect width="8" height="8" fill="var(--scene-cork)" />
          <circle cx="2" cy="3" r="0.65" fill="var(--scene-cork-grain)" opacity="0.32" />
          <circle cx="5.5" cy="6.5" r="0.5" fill="var(--scene-cork-grain)" opacity="0.28" />
        </pattern>
        <linearGradient id="desk-top-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--scene-desk-top)" />
          <stop offset="100%" stopColor="var(--scene-desk-edge)" />
        </linearGradient>
        <linearGradient id="desk-front-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--scene-desk-edge)" />
          <stop offset="50%" stopColor="var(--scene-desk-front)" />
          <stop offset="100%" stopColor="var(--scene-desk-front)" />
        </linearGradient>
      </defs>

      {/* WALL */}
      <rect x="-50" y="-160" width="2200" height="760" fill="url(#wall-texture)" />

      {/* PIN BOARD */}
      <PinBoard stroke={stroke} pos={pos} onDragStart={startDrag} draggingId={isAdmin ? drag?.id : null} cardData={cd}
                onActivate={(id) => onBoardClick?.(id)} rtl={rtl}
                isAdmin={isAdmin} introVisible={introVisible} />

      {/* ── DESK GROUP ── */}
      <g
        transform={`translate(${pos.desk.x}, ${pos.desk.y})`}
        onMouseDown={isAdmin ? (e) => startDrag('desk', e) : undefined}
        style={{ cursor: isAdmin ? (drag?.id === 'desk' ? 'grabbing' : 'default') : 'default' }}
      >
        <ellipse cx="1050" cy="965" rx="830" ry="10" fill="rgba(58,47,38,0.05)" />

        {/* EMPTY CHAIR — pushed back, slightly turned; lower half hidden
            behind the desk ("just stepped away") */}
        <EmptyChair stroke={stroke} />

        <path d="M 310 580 L 1790 580 L 1880 700 L 220 700 Z"
              fill="url(#desk-top-grad)" stroke={stroke} strokeWidth="2.5" strokeLinejoin="round" />
        <ellipse cx="1300" cy="615" rx="300" ry="52" fill="var(--accent)" opacity=".07" pointerEvents="none">
          {!isAdmin && <animate attributeName="opacity" values=".04;.13;.04" dur="5s" repeatCount="indefinite" />}
        </ellipse>
        <line x1="312" y1="582" x2="1788" y2="582" stroke="var(--scene-light)" strokeWidth="1.5" opacity="0.4" />
        <g opacity="0.05" stroke={stroke} strokeWidth="0.8">
          <path d="M 320 605 Q 1050 609 1780 605" fill="none" />
          <path d="M 290 640 Q 1050 644 1810 640" fill="none" />
          <path d="M 250 675 Q 1050 679 1850 675" fill="none" />
        </g>

        <path d="M 220 700 L 1880 700 L 1880 960 L 220 960 Z"
              fill="url(#desk-front-grad)" stroke={stroke} strokeWidth="2.5" strokeLinejoin="round" />
        <rect x="226" y="706" width="1648" height="7" fill="var(--scene-light)" opacity=".22" />
        <line x1="222" y1="702" x2="1878" y2="702" stroke="#d4b888" strokeWidth="1.5" opacity="0.3" />
        <line x1="222" y1="958" x2="1878" y2="958" stroke="#8a7038" strokeWidth="1.5" opacity="0.15" />

        {/* WHITEBOARD on desk front */}
        <Whiteboard
          x={340} y={718} w={1420} h={224}
          text={whiteboardText}
          rtl={rtl}
          stroke={stroke}
          isAdmin={isAdmin}
        />

        {/* FILM CAMERA — she restores old film cameras */}
        <g transform={`translate(${pos.camera.x}, ${pos.camera.y})`}
           onMouseDown={(e) => startDrag('camera', e)}
           onMouseEnter={() => setHoverItem('camera')}
           onMouseLeave={() => setHoverItem(null)}
           style={deskItemStyle('camera')}
           {...itemA11y('camera', cd.itemLabels?.camera || 'camera')}>
          {cueMode('camera') === 'intro' && <DeskItemFloat begin="0s" amount={6} duration="2.1s" />}
          <FilmCamera x={350} y={640} stroke={stroke} cue={cueMode('camera')} />
        </g>

        {/* CHESS KNIGHT */}
        <g transform={`translate(${pos.chess.x}, ${pos.chess.y})`}
           onMouseDown={(e) => startDrag('chess', e)}
           onMouseEnter={() => setHoverItem('chess')}
           onMouseLeave={() => setHoverItem(null)}
           style={deskItemStyle('chess')}
           {...itemA11y('chess', cd.itemLabels?.chess || 'chess')}>
          <ChessKnight x={262} y={668} stroke={stroke} cue={cueMode('chess')} />
        </g>

        {/* INK POT + REED PEN — Arabic calligraphy, and the PhD on Arabic type */}
        <g transform={`translate(${pos.inkpot.x}, ${pos.inkpot.y})`}
           onMouseDown={(e) => startDrag('inkpot', e)}
           onMouseEnter={() => setHoverItem('inkpot')}
           onMouseLeave={() => setHoverItem(null)}
           style={deskItemStyle('inkpot')}
           {...itemA11y('inkpot', cd.itemLabels?.inkpot || 'inkpot')}>
          {cueMode('inkpot') === 'intro' && <DeskItemFloat begin="0.4s" amount={5} duration="2.3s" />}
          <InkPot x={1010} y={652} stroke={stroke} cue={cueMode('inkpot')} />
        </g>

        {/* HALF-MARATHON MEDAL */}
        <g transform={`translate(${pos.medal.x}, ${pos.medal.y})`}
           onMouseDown={(e) => startDrag('medal', e)}
           onMouseEnter={() => setHoverItem('medal')}
           onMouseLeave={() => setHoverItem(null)}
           style={deskItemStyle('medal')}
           {...itemA11y('medal', cd.itemLabels?.medal || 'medal')}>
          <Medal x={1808} y={676} stroke={stroke} cue={cueMode('medal')} />
        </g>

        {/* iPHONE */}
        <g transform={`translate(${pos.phone.x}, ${pos.phone.y})`}
           onMouseDown={(e) => startDrag('phone', e)}
           onMouseEnter={() => { setHoverItem('phone'); if (!drag) onPhoneEnter?.(); }}
           onMouseLeave={() => { setHoverItem(null); onPhoneLeave?.(); }}
           style={deskItemStyle('phone')}
           {...itemA11y('phone', cd.itemLabels?.phone || 'phone')}>
          {(cueMode('phone') === 'intro' || cueMode('phone') === 'hover') && <DeskItemFloat begin="0.18s" amount={9} duration="2.3s" />}
          <IPhone hovered={!drag && phoneHovered} kind={phoneKind} cue={cueMode('phone')} />
        </g>

        {/* LAPTOP */}
        <g transform={`translate(${pos.laptop.x}, ${pos.laptop.y})`}
           onMouseDown={(e) => startDrag('laptop', e)}
           onMouseEnter={() => { setHoverItem('laptop'); if (!drag) onLaptopEnter?.(); }}
           onMouseLeave={() => { setHoverItem(null); onLaptopLeave?.(); }}
           style={deskItemStyle('laptop')}
           {...itemA11y('laptop', cd.itemLabels?.laptop || 'laptop')}>
          {(cueMode('laptop') === 'intro' || cueMode('laptop') === 'hover') && <DeskItemFloat begin="0.32s" amount={8} duration="2.4s" />}
          <Laptop hovered={!drag && laptopHovered} kind={laptopKind} cue={cueMode('laptop')} />
        </g>

        {/* NOTEBOOK */}
        <g transform={`translate(${pos.notebook.x}, ${pos.notebook.y})`}
           onMouseDown={(e) => startDrag('notebook', e)}
           onMouseEnter={() => setHoverItem('notebook')}
           onMouseLeave={() => setHoverItem(null)}
           style={deskItemStyle('notebook', 'pointer')}
           {...itemA11y('notebook', cd.itemLabels?.notebook || 'notebook')}>
          {(cueMode('notebook') === 'intro' || cueMode('notebook') === 'hover') && <DeskItemFloat begin="0.5s" amount={6} duration="2.2s" />}
          <Notebook x={1700} y={690} stroke={stroke} cue={cueMode('notebook')} />
        </g>

        {/* MUG */}
        {!mugHidden && (
          <g
            transform={`translate(${pos.mug.x}, ${pos.mug.y})`}
            onMouseDown={isAdmin ? (e) => startDrag('mug', e) : undefined}
            onClick={!isAdmin ? () => onMugClick?.() : undefined}
            onMouseEnter={() => setHoverItem('mug')}
            onMouseLeave={() => setHoverItem(null)}
            style={deskItemStyle('mug', isAdmin ? 'grab' : 'pointer')}
            {...itemA11y('mug', cd.itemLabels?.mug || 'mug')}
          >
            {cueMode('mug') === 'intro' && <DeskItemFloat begin="0.68s" amount={5} duration="2.5s" />}
            <CoffeeMug x={1820} y={620} stroke={stroke} cue={cueMode('mug')} />
          </g>
        )}
      </g>

      {!isAdmin && <DeskIntroOverlay visible={introVisible} label={cd.intro?.label} text={cd.intro?.text} rtl={rtl} />}

    </svg>
  );
}

/* ── EMPTY CHAIR ───────────────────────────────────────────
   Rendered behind the desk surfaces; only the headrest, backrest
   and armrest tops peek above the desk edge. Slightly rotated so
   it reads as pushed back — the engineer just stepped away. */
function EmptyChair({ stroke }) {
  return (
    <g transform="rotate(-2.5 985 600)">
      {/* armrest tops */}
      <rect x="795" y="545" width="56" height="120" rx="16" fill="#3a332b" stroke={stroke} strokeWidth="2.5" />
      <rect x="1119" y="545" width="56" height="120" rx="16" fill="#3a332b" stroke={stroke} strokeWidth="2.5" />

      {/* backrest */}
      <path
        d="M 858 500 Q 858 450 908 448 L 1062 448 Q 1112 450 1112 500 L 1112 660 L 858 660 Z"
        fill="#463e33" stroke={stroke} strokeWidth="3" strokeLinejoin="round"
      />
      {/* backrest center panel + stitching */}
      <path
        d="M 884 506 Q 884 472 920 470 L 1050 470 Q 1086 472 1086 506 L 1086 648 L 884 648 Z"
        fill="#4f463a" opacity="0.85"
      />
      <g stroke="#5f5546" strokeWidth="1.5" opacity="0.55" fill="none">
        <path d="M 884 560 Q 985 552 1086 560" />
        <path d="M 884 606 Q 985 598 1086 606" />
      </g>
      {/* lumbar shadow under desk line */}
      <path d="M 870 575 Q 985 567 1100 575" fill="none" stroke="#2e2820" strokeWidth="2" opacity="0.3" />

      {/* headrest posts */}
      <rect x="938" y="424" width="14" height="32" rx="4" fill="#2f2922" stroke={stroke} strokeWidth="2" />
      <rect x="1018" y="424" width="14" height="32" rx="4" fill="#2f2922" stroke={stroke} strokeWidth="2" />

      {/* headrest */}
      <rect x="896" y="372" width="178" height="58" rx="20" fill="#3a332b" stroke={stroke} strokeWidth="3" />
      <path d="M 914 390 Q 985 382 1056 390" fill="none" stroke="#5f5546" strokeWidth="1.5" opacity="0.5" />
    </g>
  );
}

function DeskItemFloat({ begin, amount, duration }) {
  return (
    <animateTransform
      attributeName="transform"
      additive="sum"
      type="translate"
      values={`0 0; 0 -${amount}; 0 0`}
      dur={duration}
      begin={begin}
      repeatCount="indefinite"
    />
  );
}

function DeskIntroOverlay({ visible, label = 'INTERACTIVE SCENE', text = 'Click the pinned notes or anything on the desk.', rtl = false }) {
  if (!visible) return null;

  return (
      <g aria-label="desk intro prompt" pointerEvents="none">
        <rect
          x="74"
          y="-128"
          width="540"
          height="88"
          rx="18"
          fill="rgba(253,246,232,0.94)"
          stroke="rgba(58,47,38,0.16)"
          strokeWidth="1.4"
        />
        <circle cx="106" cy="-77" r="5" fill="var(--accent)">
          <animate attributeName="opacity" values="0.35;1;0.35" dur="1.4s" repeatCount="indefinite" />
        </circle>
        <text x={rtl ? 590 : 126} y="-84" textAnchor={rtl ? 'end' : 'start'} direction={rtl ? 'rtl' : 'ltr'} fontFamily={rtl ? AR_SANS : 'IBM Plex Mono,monospace'} fontSize="12" fill="#8a6f58" letterSpacing={rtl ? 0 : '0.08em'}>
          {label}
        </text>
        <text x={rtl ? 590 : 106} y="-58" textAnchor={rtl ? 'end' : 'start'} direction={rtl ? 'rtl' : 'ltr'} fontFamily={rtl ? AR_SERIF : 'Fraunces,serif'} fontSize="22" fill="#2a2520">
          {text}
        </text>
      </g>
  );
}

/* ── WHITEBOARD ─────────────────────────────────────────── */
const WB_FONTS = [
  { label: 'Serif',  val: '"Fraunces", serif' },
  { label: 'Mono',   val: '"IBM Plex Mono", monospace' },
  { label: 'Sans',   val: 'ui-sans-serif, system-ui, sans-serif' },
];
const WB_SIZES = ['12','14','16','18','22'];
const WB_COLORS = ['#3a3530','#c0463c','#2a5a2a','#2a3a8a','#7a4a9a'];

function Whiteboard({ x, y, w, h, text, onChange, stroke, isAdmin = false, rtl = false }) {
  const ref = React.useRef(null);
  const [focused, setFocused] = React.useState(false);

  const [wbSettings, setWbSettings] = React.useState(() => {
    try {
      const s = localStorage.getItem('yara_wb_settings');
      if (s) return JSON.parse(s);
    } catch (_) {}
    return { font: "\"IBM Plex Mono\", monospace", size: "22", color: "#2a5a2a" };
  });
  const { font, size, color } = wbSettings;

  const saveSettings = (update) => {
    setWbSettings(prev => {
      const next = { ...prev, ...update };
      localStorage.setItem('yara_wb_settings', JSON.stringify(next));
      return next;
    });
  };

  React.useEffect(() => {
    if (isAdmin) return;
    const h = (e) => {
      if (e.key === 'yara_wb_settings' && e.newValue) {
        try { setWbSettings(JSON.parse(e.newValue)); } catch (_) {}
      }
    };
    window.addEventListener('storage', h);
    return () => window.removeEventListener('storage', h);
  }, [isAdmin]);

  // Restore saved content as innerHTML (preserves formatting)
  React.useEffect(() => {
    if (ref.current) {
      ref.current.innerHTML = text || '';
    }
  }, []);

  // Viewer: update content when backend state loads after mount
  React.useEffect(() => {
    if (!isAdmin && ref.current) {
      ref.current.innerHTML = text || '';
    }
  }, [text, isAdmin]);

  const fmt = (cmd, val) => { document.execCommand(cmd, false, val); ref.current?.focus(); };

  const toolbarH = 34;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="6"
            fill="rgba(255,252,245,0.94)" stroke={stroke} strokeWidth="1.5" />
      <rect x={x+7} y={y+7} width="7" height={h-14} rx="3" fill="var(--accent)" opacity=".55" />
      {Array.from({ length: 7 }).map((_, i) => (
        <line key={i} x1={x+14} y1={y+toolbarH+10+i*26} x2={x+w-14} y2={y+toolbarH+10+i*26}
              stroke="var(--ink-soft)" strokeWidth="0.4" opacity="0.12" />
      ))}
      <line x1={x+50} y1={y+toolbarH} x2={x+50} y2={y+h-6}
            stroke="#d88" strokeWidth="0.8" opacity="0.25" />

      {/* TOOLBAR — admin only */}
      {isAdmin && (
        <foreignObject x={x+4} y={y+4} width={w-8} height={toolbarH-4}
          onMouseDown={e => e.stopPropagation()}>
          <div xmlns="http://www.w3.org/1999/xhtml"
            style={{ display:'flex', gap:4, alignItems:'center', height:'100%', flexWrap:'nowrap', overflow:'hidden' }}>
            {/* font family */}
            <select value={font} onChange={e => { saveSettings({ font: e.target.value }); ref.current.style.fontFamily = e.target.value; }}
              style={{ padding:'2px 4px', border:'1px solid #c8b88a', borderRadius:4, fontSize:10, fontFamily:'IBM Plex Mono,monospace', background:'#fdf6ec', color:'#3a3530', cursor:'pointer' }}>
              {WB_FONTS.map(f => <option key={f.label} value={f.val}>{f.label}</option>)}
            </select>
            {/* font size */}
            <select value={size} onChange={e => { saveSettings({ size: e.target.value }); fmt('fontSize', e.target.value === '12' ? '1' : e.target.value === '14' ? '2' : e.target.value === '16' ? '3' : e.target.value === '18' ? '4' : '5'); }}
              style={{ padding:'2px 4px', border:'1px solid #c8b88a', borderRadius:4, fontSize:10, fontFamily:'IBM Plex Mono,monospace', background:'#fdf6ec', color:'#3a3530', width:44, cursor:'pointer' }}>
              {WB_SIZES.map(s => <option key={s} value={s}>{s}px</option>)}
            </select>
            {/* bold / italic / underline */}
            {[['B','bold'],['I','italic'],['U','underline']].map(([lbl, cmd]) => (
              <button key={lbl} onMouseDown={e => { e.preventDefault(); fmt(cmd); }}
                style={{ padding:'2px 6px', border:'1px solid #c8b88a', borderRadius:4, fontSize:11, fontFamily:'IBM Plex Mono,monospace', background:'#fdf6ec', color:'#3a3530', cursor:'pointer', fontWeight: lbl === 'B' ? 700 : 400, fontStyle: lbl === 'I' ? 'italic' : 'normal', textDecoration: lbl === 'U' ? 'underline' : 'none' }}>
                {lbl}
              </button>
            ))}
            {/* alignment */}
            {[['⬅','justifyLeft'],['⬛','justifyCenter'],['➡','justifyRight']].map(([lbl, cmd]) => (
              <button key={cmd} onMouseDown={e => { e.preventDefault(); fmt(cmd); }}
                style={{ padding:'2px 6px', border:'1px solid #c8b88a', borderRadius:4, fontSize:10, fontFamily:'IBM Plex Mono,monospace', background:'#fdf6ec', color:'#3a3530', cursor:'pointer' }}
                title={cmd.replace('justify','Align ')}>
                {lbl}
              </button>
            ))}
            {/* color swatches */}
            {WB_COLORS.map(c => (
              <button key={c} onMouseDown={e => { e.preventDefault(); saveSettings({ color: c }); fmt('foreColor', c); }}
                style={{ width:14, height:14, borderRadius:'50%', background:c, border: c === color ? '2px solid #2a2520' : '1.5px solid #c8b88a', cursor:'pointer', padding:0, flexShrink:0 }} />
            ))}
            {/* clear */}
            <button onMouseDown={e => { e.preventDefault(); if(ref.current){ ref.current.innerHTML=''; onChange?.(''); } }}
              style={{ marginLeft:'auto', padding:'2px 8px', border:'1px solid #c8b88a', borderRadius:4, fontSize:10, fontFamily:'IBM Plex Mono,monospace', background:'transparent', color:'#8a7a6a', cursor:'pointer' }}>
              clr
            </button>
          </div>
        </foreignObject>
      )}

      {/* separator */}
      <line x1={x+4} y1={y+toolbarH} x2={x+w-4} y2={y+toolbarH} stroke="#c8b88a" strokeWidth="0.6" opacity="0.5" />

      {/* editable / readonly area */}
      <foreignObject x={x+56} y={y+toolbarH+4} width={w-70} height={h-toolbarH-12}
        onMouseDown={(e) => e.stopPropagation()}>
        <div xmlns="http://www.w3.org/1999/xhtml"
          ref={ref}
          dir={rtl ? 'rtl' : 'ltr'}
          contentEditable={isAdmin ? "true" : "false"}
          suppressContentEditableWarning={true}
          spellCheck="false"
          style={{
            width:'100%', height:'100%', background:'transparent',
            color, fontFamily: rtl ? AR_SANS : font, fontSize: size + 'px',
            lineHeight:'1.7', outline:'none', padding:'2px 8px',
            overflow:'hidden', wordBreak:'break-word',
            cursor: isAdmin ? 'text' : 'default',
          }}
          onFocus={() => setFocused(true)}
          onBlur={(e) => { setFocused(false); if (isAdmin) onChange?.(e.target.innerHTML); }}
        />
      </foreignObject>
    </g>
  );
}

/* ── PIN BOARD ─────────────────────────────────────────── */
const CARD_LABELS = {
  identity: 'About Yara', about: 'Education', currently: 'Current role', stack: 'Core skills',
  contact: 'Contact', social: 'Profiles', honors: 'Awards', certs: 'Certifications',
  latest: 'Speaking and media', work: 'Projects', tweaks: 'Customize the desk', resume: 'Download CV',
};

function PinBoard({ stroke, pos, onDragStart, onActivate, draggingId, cardData, isAdmin, introVisible = false, rtl = false }) {
  const cd = cardData || FALLBACK_CARD_DATA;
  const bx = 22, by = -40, bw = 2056, bh = 600;
  const cardCue = isAdmin ? 'none' : (introVisible ? 'intro' : 'idle');
  return (
    <g>
      <rect x={bx-20} y={by-18} width={bw+40} height={bh+36} fill="var(--scene-board-frame)" rx="12" />
      <rect x={bx-10} y={by-9}  width={bw+20} height={bh+18} fill="var(--scene-board-rim)" rx="7" />
      <rect x={bx}    y={by}     width={bw}    height={bh}    fill="url(#cork)" />
      <rect x={bx}    y={by}     width={bw}    height={bh}    fill="none" stroke="rgba(0,0,0,0.18)" strokeWidth="1.5" />

      <Card id="identity" p={pos.identity} w={386} h={224} color="#f6efe2" draggingId={draggingId} onDragStart={onDragStart} onActivate={onActivate} rtl={rtl} label={cd.cardLabels} action isAdmin={isAdmin} viewerCue={cardCue}>
        <CT x="16" y="30" fontFamily="IBM Plex Mono,monospace" fontSize="13" fill="#8a7a6a">// {cd.labels?.hello || 'hello'}</CT>
        <CT x="16" y="74" fontFamily="Fraunces,serif" fontSize="30" fontWeight="500" fill="#2a2520">{cd.identity.name}</CT>
        <CT x="16" y="107" fontFamily="Fraunces,serif" fontSize="18" fill="#5a4f44">{cd.identity.title}</CT>
        <circle cx="25" cy="136" r="5.5" fill="#6aa36a"/>
        <CT x="38" y="141" fontFamily="IBM Plex Mono,monospace" fontSize="13" fill="#4a7a4a">{cd.identity.status}</CT>
        <CT x="16" y="186" fontFamily="IBM Plex Mono,monospace" fontSize="12" fill="#9a8a7a">{cd.identity.location}</CT>
      </Card>

      <Card id="about" p={pos.about} w={386} h={214} color="#f0ece4" draggingId={draggingId} onDragStart={onDragStart} onActivate={onActivate} rtl={rtl} label={cd.cardLabels} action isAdmin={isAdmin} viewerCue={cardCue}>
        <CT x="16" y="30" fontFamily="IBM Plex Mono,monospace" fontSize="13" fill="#8a7a6a">// {cd.labels?.education || 'education'}</CT>
        {(cd.about.lines || []).map((t, i) => {
          const c = [{y:64,s:17,f:"#2a2520",ff:"Fraunces,serif"},{y:90,s:16,f:"#2a2520",ff:"Fraunces,serif"},{y:116,s:13,f:"#a85a3c",ff:"IBM Plex Mono,monospace",w:"500"},{y:154,s:15,f:"#5a4f44",ff:"Fraunces,serif"},{y:178,s:15,f:"#5a4f44",ff:"Fraunces,serif"}][i];
          return c ? <CT key={i} x="16" y={c.y} fontFamily={c.ff} fontSize={c.s} fill={c.f} fontWeight={c.w}>{t}</CT> : null;
        })}
      </Card>

      <Card id="currently" p={pos.currently} w={270} h={180} color="#c7d8bb" draggingId={draggingId} onDragStart={onDragStart} onActivate={onActivate} rtl={rtl} label={cd.cardLabels} action isAdmin={isAdmin} viewerCue={cardCue}>
        <CT x="14" y="30" fontFamily="IBM Plex Mono,monospace" fontSize="13" fill="#3a4a22">// {cd.labels?.currently || 'currently'}</CT>
        <CT x="14" y="72" fontFamily="Fraunces,serif" fontSize="22" fontWeight="500" fill="#1e2a10">{cd.currently.heading}</CT>
        <CT x="14" y="102" fontFamily="Fraunces,serif" fontSize="15" fill="#3a4a22">{cd.currently.detail}</CT>
        <CT x="14" y="148" fontFamily="Fraunces,serif" fontSize="14" fill="#4a5a32">{cd.currently.extra}</CT>
      </Card>

      <Card id="stack" p={pos.stack} w={270} h={252} color="#e8e0d0" draggingId={draggingId} onDragStart={onDragStart} onActivate={onActivate} rtl={rtl} label={cd.cardLabels} action isAdmin={isAdmin} viewerCue={cardCue}>
        <CT x="14" y="30" fontFamily="IBM Plex Mono,monospace" fontSize="13" fill="#6a5a4a">// {cd.labels?.stack || 'stack'}</CT>
        {(cd.stack.items || []).map((t, i) => {
          const c = [{y:66,f:"#2a2520"},{y:94,f:"#2a2520"},{y:122,f:"#2a2520"},{y:150,f:"#a85a3c"},{y:178,f:"#a85a3c"},{y:224,f:"#8a7a6a",s:12}][i];
          return c ? <CT key={i} x="14" y={c.y} fontFamily="IBM Plex Mono,monospace" fontSize={c.s||14} fill={c.f}>{t}</CT> : null;
        })}
      </Card>

      <Card id="contact" p={pos.contact} w={310} h={224} color="#e9b494" draggingId={draggingId} onDragStart={onDragStart} onActivate={onActivate} rtl={rtl} label={cd.cardLabels} action isAdmin={isAdmin} viewerCue={cardCue}>
        <CT x="16" y="30" fontFamily="IBM Plex Mono,monospace" fontSize="13" fill="#6a2a0a">// {cd.labels?.contact || 'contact'}</CT>
        {(cd.contact.lines || []).map((t, i) => {
          const c = [{y:66,f:"#2a1208"},{y:86,f:"#2a1208"},{y:120,f:"#2a1208"},{y:156,f:"#2a1208"},{y:200,f:"#6a2a0a",s:12}][i];
          return c ? <CT key={i} x="16" y={c.y} fontFamily="IBM Plex Mono,monospace" fontSize={c.s||13} fill={c.f}>{t}</CT> : null;
        })}
      </Card>

{(cd.social || []).length > 0 && (
      <Card id="social" p={pos.social} w={272} h={210} color="#ede8f5" draggingId={draggingId} onDragStart={onDragStart} onActivate={onActivate} rtl={rtl} label={cd.cardLabels} isAdmin={isAdmin} viewerCue={cardCue}>
        <CT x="16" y="30" fontFamily="IBM Plex Mono,monospace" fontSize="13" fill="#6a4a8a">// {cd.labels?.social || 'social'}</CT>
        {(cd.social || []).slice(0, 3).map(({ label, handle, href }, i) => {
          const y = 92 + i * 46;
          return (
            <g key={label}>
              <CT x="16" y={y - 18} fontFamily="IBM Plex Mono,monospace" fontSize="10" fill="#9a8aaa">{label.toLowerCase()}</CT>
              <a href={href} target="_blank" rel="noreferrer" onMouseDown={e => e.stopPropagation()}>
                <CT x="16" y={y} fontFamily="IBM Plex Mono,monospace" fontSize="13" fill="#4a2a6a" style={{ cursor: 'pointer' }}>{handle}</CT>
              </a>
            </g>
          );
        })}
      </Card>
      )}

      <Card id="honors" p={pos.honors} w={310} h={208} color="#d4dcb5" draggingId={draggingId} onDragStart={onDragStart} onActivate={onActivate} rtl={rtl} label={cd.cardLabels} action isAdmin={isAdmin} viewerCue={cardCue}>
        <CT x="16" y="30" fontFamily="IBM Plex Mono,monospace" fontSize="13" fill="#2a4a1a">// {cd.labels?.honors || 'honors'}</CT>
        {(cd.honors.lines || []).map((t, i) => {
          const c = [{y:70,s:20,f:"#1a2a10",ff:"Fraunces,serif"},{y:100,s:18,f:"#1a2a10",ff:"Fraunces,serif"},{y:138,s:16,f:"#3a5a2a",ff:"Fraunces,serif"},{y:170,s:12,f:"#4a6a3a",ff:"IBM Plex Mono,monospace"}][i];
          return c ? <CT key={i} x="16" y={c.y} fontFamily={c.ff||"Fraunces,serif"} fontSize={c.s} fill={c.f}>{t}</CT> : null;
        })}
      </Card>

      <Card id="certs" p={pos.certs} w={400} h={290} color="#f6efe2" draggingId={draggingId} onDragStart={onDragStart} onActivate={onActivate} rtl={rtl} label={cd.cardLabels} action isAdmin={isAdmin} viewerCue={cardCue}>
        <CT x="16" y="28" fontFamily="IBM Plex Mono,monospace" fontSize="13" fill="#6a5a4a">// {cd.labels?.certs || 'certifications'}</CT>
        {(cd.certs.entries || []).slice(0, 4).map((e, i) => (
          <g key={i} transform={`translate(${rtl ? 400 - 14 - 72 : 14}, ${50 + i * 58})`}>
            <rect x="0" y="0" width="72" height="32" rx="4"
                  fill={e.color} opacity="0.16" stroke={e.color} strokeWidth="1" />
            <text x="36" y="21" textAnchor="middle"
                  fontFamily="IBM Plex Mono,monospace" fontSize="11" fontWeight="700" fill={e.color}>{e.org}</text>
            <text x={rtl ? -10 : 82} y="16" textAnchor="start" direction={rtl ? 'rtl' : 'ltr'} fontFamily={rtl ? AR_SERIF : 'Fraunces,serif'} fontSize="15" fill="#2a2520">{e.name}</text>
            <text x={rtl ? -10 : 82} y="34" textAnchor="start" direction={rtl ? 'rtl' : 'ltr'} fontFamily={rtl ? AR_SANS : 'IBM Plex Mono,monospace'} fontSize="10" fill="#8a7a6a">{e.dur}</text>
          </g>
        ))}
        {(cd.certs.entries || []).length > 4 && (
          <CT x="16" y="278" fontFamily="IBM Plex Mono,monospace" fontSize="11" fill="#6a5a4a">
            {cd.certs.more || `+ ${(cd.certs.entries || []).length - 4} more · view all →`}
          </CT>
        )}
      </Card>

      <Card id="latest" p={pos.latest} w={236} h={152} color="#e8f0dc" draggingId={draggingId} onDragStart={onDragStart} onActivate={onActivate} rtl={rtl} label={cd.cardLabels} action isAdmin={isAdmin} viewerCue={cardCue}>
        <CT x="16" y="30" fontFamily="IBM Plex Mono,monospace" fontSize="13" fill="#3e6032">// {cd.latest?.eyebrow || 'latest'}</CT>
        <CT x="16" y="76" fontFamily="Fraunces,serif" fontSize="27" fontWeight="500" fill="#1e2a10">{cd.latest?.heading || 'Field Note'}</CT>
        <CT x="16" y="116" fontFamily="IBM Plex Mono,monospace" fontSize="12" fill="#4a6a3a">{cd.latest?.action || 'new post ->'}</CT>
      </Card>

      <Card id="work" p={pos.work} w={282} h={162} color="oklch(0.78 0.08 35)" draggingId={draggingId} onDragStart={onDragStart} onActivate={onActivate} rtl={rtl} label={cd.cardLabels} action isAdmin={isAdmin} viewerCue={cardCue}>
        <CT x="16" y="30" fontFamily="IBM Plex Mono,monospace" fontSize="13" fill="#6a3a22">// {cd.labels?.projects || 'projects'}</CT>
        <CT x="16" y="76" fontFamily="Fraunces,serif" fontSize="30" fontWeight="500" fill="#2a1208">{cd.work.heading}</CT>
        <CT x="16" y="118" fontFamily="IBM Plex Mono,monospace" fontSize="13" fill="#6a3a22">{cd.work.action}</CT>
      </Card>

      <Card id="tweaks" p={pos.tweaks} w={282} h={138} color="#2a2520" draggingId={draggingId} onDragStart={onDragStart} onActivate={onActivate} rtl={rtl} label={cd.cardLabels} action isAdmin={isAdmin} viewerCue={cardCue}>
        <CT x="16" y="30" fontFamily="IBM Plex Mono,monospace" fontSize="13" fill="#a09080">// {cd.labels?.customize || 'customize'}</CT>
        <CT x="16" y="72" fontFamily="Fraunces,serif" fontSize="26" fontWeight="500" fill="#f0e6d4">{cd.tweaks.heading}</CT>
        <CT x="16" y="104" fontFamily="IBM Plex Mono,monospace" fontSize="12" fill="#a09080">{cd.tweaks.action}</CT>
      </Card>

      <ResumeNote p={pos.resume} resume={cd.resume} rtl={rtl} draggingId={isAdmin ? draggingId : null} onDragStart={isAdmin ? onDragStart : () => {}} />

    </g>
  );
}

/* ── CARD ──────────────────────────────────────────────── */
function Card({ id, p, w, h, color, draggingId, onDragStart, onActivate, action, children, isAdmin, viewerCue = 'none', rtl = false, label }) {
  const [hovered, setHovered] = React.useState(false);
  const isActive = draggingId === id;
  const showIntroCue = !isAdmin && viewerCue === 'intro';
  const showIdleCue = !isAdmin && viewerCue === 'idle';
  const showHoverCue = !isAdmin && hovered;
  return (
    <g
      transform={`translate(${p.x}, ${p.y}) rotate(${p.rot}, ${w/2}, ${h/2})`}
      style={{
        cursor: isActive ? 'grabbing' : 'pointer',
        opacity: isActive ? 0.9 : 1,
      }}
      onMouseDown={(e) => onDragStart(id, e)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      role="button"
      tabIndex={0}
      aria-label={(label && label[id]) || CARD_LABELS[id] || id}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onActivate?.(id); }
      }}
    >
      {showIntroCue && (
        <animateTransform
          attributeName="transform"
          additive="sum"
          type="translate"
          values="0 0; 0 -5; 0 0"
          dur="2.2s"
          repeatCount="indefinite"
        />
      )}
      {showHoverCue && <animateTransform attributeName="transform" additive="sum" type="translate" values="0 0; 0 -8; 0 -6" dur=".45s" fill="freeze" />}
      <rect x="4" y="8" width={w} height={h} fill="rgba(7,21,15,0.19)" rx="3"
            style={{ opacity: isActive ? 0.3 : hovered ? 0.22 : 0.12 }} />
      <rect x="0" y="0" width={w} height={h} fill={color} stroke="var(--scene-board-rim)" strokeWidth="1.8" rx="3" />
      {(showIntroCue || showHoverCue) && (
        <rect x="-6" y="-6" width={w+12} height={h+12} rx="14" fill="none" stroke="var(--accent)" strokeWidth="2.2" opacity={showHoverCue ? 0.62 : 0.34}>
          <animate attributeName="opacity" values={showHoverCue ? '0.32;0.68;0.32' : '0.16;0.38;0.16'} dur="2s" repeatCount="indefinite" />
        </rect>
      )}
      <circle cx={w/2} cy="0" r="7" fill="var(--scene-pin)" stroke="var(--scene-board-frame)" strokeWidth="1.2" />
      <circle cx={w/2} cy="0" r="3.5" fill="var(--scene-light)" />
      {!isAdmin && (
        <g aria-hidden="true">
          <path d={`M ${w-38} 0 L ${w} 0 L ${w} 38 Z`} fill="rgba(255,255,255,0.32)" stroke="rgba(58,47,38,0.2)" strokeWidth="1" />
          <path d={`M ${w-31} 10 L ${w-12} 10 L ${w-12} 29`} fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity={showHoverCue ? 0.95 : showIntroCue ? 0.78 : showIdleCue ? 0.46 : 0.38} />
          <path d={`M ${w-20} 10 L ${w-12} 18`} fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" opacity={showHoverCue ? 0.95 : showIntroCue ? 0.78 : showIdleCue ? 0.46 : 0.38} />
        </g>
      )}
      <CardCtx.Provider value={{ w, rtl }}>{children}</CardCtx.Provider>
    </g>
  );
}

/* ── LAPTOP ────────────────────────────────────────────── */
function Laptop({ hovered, kind, cue = 'none' }) {
  const stroke = 'var(--line)';
  const showCue = cue === 'intro' || cue === 'hover';
  const showAmbient = cue === 'ambient';
  return (
    <g>
      <ellipse cx="1300" cy="694" rx="240" ry="6" fill="rgba(58,47,38,0.1)" />
      <path d="M 1080 600 L 1520 600 L 1558 692 L 1042 692 Z"
            fill="#d0cbc4" stroke={stroke} strokeWidth="2.5" strokeLinejoin="round" />
      <rect x="1104" y="610" width="390" height="52" rx="3" fill="#e6e0d8" stroke={stroke} strokeWidth="1" />
      <g opacity="0.35" stroke={stroke} strokeWidth="0.6">
        {Array.from({length:13}).map((_,i)=>(
          <line key={i} x1={1112+i*29} y1="612" x2={1112+i*29} y2="660" />
        ))}
        <line x1="1104" y1="628" x2="1494" y2="628"/>
        <line x1="1104" y1="644" x2="1494" y2="644"/>
      </g>
      <rect x="1204" y="668" width="180" height="18" rx="3" fill="#b4ada4" stroke={stroke} strokeWidth="1" />
      <path d="M 1080 600 L 1080 318 Q 1080 306 1092 306 L 1508 306 Q 1520 306 1520 318 L 1520 600 Z"
            fill="#bab4ac" stroke={stroke} strokeWidth="2.5" strokeLinejoin="round" />
      <rect x="1098" y="322" width="404" height="272" rx="5" fill="#1a1714" stroke={stroke} strokeWidth="2" />
      <circle cx="1300" cy="314" r="3" fill="#2a2520" />
      <LaptopScreen hovered={hovered} kind={kind} />
      {showAmbient && (
        <rect x="1094" y="318" width="412" height="280" rx="11" fill="none"
              stroke="var(--accent)" strokeWidth="2" opacity="0.2">
          <animate attributeName="opacity" values="0.12;0.24;0.12" dur="2.8s" repeatCount="indefinite" />
        </rect>
      )}
      {(hovered || showCue) && (
        <rect x="1090" y="314" width="420" height="288" rx="10" fill="none"
              stroke="var(--accent)" strokeWidth="2.5" strokeDasharray="7 5" opacity={hovered ? 0.85 : 0.58}>
          <animate attributeName="stroke-dashoffset" from="0" to="24" dur="1.2s" repeatCount="indefinite"/>
        </rect>
      )}
    </g>
  );
}

/* ── IPHONE ────────────────────────────────────────────── */
function IPhone({ hovered, kind, cue = 'none' }) {
  const stroke = 'var(--line)';
  const showCue = cue === 'intro' || cue === 'hover';
  const showAmbient = cue === 'ambient';
  return (
    <g>
      <ellipse cx="832" cy="694" rx="65" ry="5" fill="rgba(58,47,38,0.08)" />
      <rect x="760" y="570" width="144" height="240" rx="22"
            fill="#1a1714" stroke={stroke} strokeWidth="2.5" />
      <rect x="756" y="614" width="4" height="34" fill="#3a342e" />
      <rect x="756" y="656" width="4" height="22" fill="#3a342e" />
      <rect x="904" y="618" width="4" height="40" fill="#3a342e" />
      <rect x="768" y="578" width="128" height="224" rx="16" fill="#0e0d0b" />
      <rect x="800" y="586" width="64" height="8" rx="4" fill="#000" />
      <PhoneScreen hovered={hovered} kind={kind} scrollY={0} />
      <rect x="800" y="796" width="64" height="4" rx="2" fill="#3a342e" />
      {showAmbient && (
        <rect x="758" y="568" width="148" height="244" rx="24" fill="none"
              stroke="var(--accent)" strokeWidth="2" opacity="0.22">
          <animate attributeName="opacity" values="0.1;0.24;0.1" dur="2.6s" repeatCount="indefinite" />
        </rect>
      )}
      {(hovered || showCue) && (
        <rect x="752" y="562" width="160" height="256" rx="24" fill="none"
              stroke="var(--accent)" strokeWidth="2.5" strokeDasharray="7 5" opacity={hovered ? 0.85 : 0.58}>
          <animate attributeName="stroke-dashoffset" from="0" to="24" dur="1.2s" repeatCount="indefinite"/>
        </rect>
      )}
    </g>
  );
}

/* ── FILM CAMERA ───────────────────────────────────────── */
function FilmCamera({ x, y, stroke, cue = 'none' }) {
  const showCue = cue === 'intro' || cue === 'hover';
  return (
    <g transform={`translate(${x},${y}) rotate(-6)`}>
      <ellipse cx="0" cy="44" rx="80" ry="9" fill="rgba(58,47,38,0.12)" />
      <rect x="-72" y="-14" width="144" height="58" rx="8" fill="#2a2520" stroke={stroke} strokeWidth="2.5" />
      <rect x="-72" y="-2" width="144" height="34" fill="#8a6a48" opacity="0.9" />
      <g opacity="0.25" stroke="#2a2520" strokeWidth="0.8">
        {Array.from({ length: 12 }).map((_, i) => <line key={i} x1={-70 + i * 12} y1="-2" x2={-64 + i * 12} y2="32" />)}
      </g>
      <rect x="-46" y="-26" width="34" height="14" rx="3" fill="#3a342e" stroke={stroke} strokeWidth="2" />
      <rect x="30" y="-22" width="22" height="10" rx="2" fill="#c8c2b8" stroke={stroke} strokeWidth="1.5" />
      <circle cx="4" cy="15" r="27" fill="#3a342e" stroke={stroke} strokeWidth="2.5" />
      <circle cx="4" cy="15" r="19" fill="#1a1714" stroke="#5a5045" strokeWidth="2" />
      <circle cx="4" cy="15" r="10" fill="#2a3a4a" />
      <circle cx="-1" cy="10" r="3.5" fill="rgba(255,255,255,0.45)" />
      <circle cx="54" cy="4" r="5" fill="#c8c2b8" stroke={stroke} strokeWidth="1.2" />
      {showCue && (
        <ellipse cx="0" cy="44" rx="94" ry="14" fill="none" stroke="var(--accent)" strokeWidth="2" opacity="0.26">
          <animate attributeName="opacity" values="0.12;0.3;0.12" dur="1.8s" repeatCount="indefinite" />
        </ellipse>
      )}
    </g>
  );
}

/* ── CHESS KNIGHT ──────────────────────────────────────── */
function ChessKnight({ x, y, stroke, cue = 'none' }) {
  const showCue = cue === 'hover';
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx="0" cy="22" rx="26" ry="6" fill="rgba(58,47,38,0.14)" />
      <path d="M -18 20 L 18 20 L 15 10 L -15 10 Z" fill="#2a2520" stroke={stroke} strokeWidth="2" strokeLinejoin="round" />
      <path d="M -12 10 L -10 -10 Q -16 -18 -10 -30 Q -2 -44 12 -40 L 16 -30 Q 8 -30 6 -22 L 14 -14 Q 16 -6 8 -6 L 10 10 Z"
            fill="#2a2520" stroke={stroke} strokeWidth="2" strokeLinejoin="round" />
      <circle cx="2" cy="-30" r="2" fill="#f6efe2" />
      {showCue && (
        <ellipse cx="0" cy="22" rx="36" ry="10" fill="none" stroke="var(--accent)" strokeWidth="2" opacity="0.4" />
      )}
    </g>
  );
}

/* ── INK POT + REED PEN (qalam) ────────────────────────── */
function InkPot({ x, y, stroke, cue = 'none' }) {
  const showCue = cue === 'intro' || cue === 'hover';
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx="0" cy="26" rx="34" ry="7" fill="rgba(58,47,38,0.14)" />
      <path d="M -22 24 Q -26 4 -14 -4 L 14 -4 Q 26 4 22 24 Z" fill="#1f2a3a" stroke={stroke} strokeWidth="2.2" strokeLinejoin="round" />
      <rect x="-11" y="-12" width="22" height="9" rx="2" fill="#2a3446" stroke={stroke} strokeWidth="1.8" />
      <ellipse cx="0" cy="-12" rx="11" ry="3" fill="#0e1218" />
      <path d="M -10 6 Q 0 2 10 6" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2" strokeLinecap="round" />
      <path d="M 4 -10 L 46 -62" stroke="#b8925a" strokeWidth="6" strokeLinecap="round" />
      <path d="M 4 -10 L 46 -62" stroke={stroke} strokeWidth="1" opacity="0.4" />
      <path d="M 43 -58 L 50 -67 L 47 -58 Z" fill="#2a2520" />
      {showCue && (
        <ellipse cx="0" cy="26" rx="46" ry="11" fill="none" stroke="var(--accent)" strokeWidth="2" opacity="0.28">
          <animate attributeName="opacity" values="0.12;0.32;0.12" dur="2s" repeatCount="indefinite" />
        </ellipse>
      )}
    </g>
  );
}

/* ── HALF-MARATHON MEDAL ───────────────────────────────── */
function Medal({ x, y, stroke, cue = 'none' }) {
  const showCue = cue === 'hover';
  return (
    <g transform={`translate(${x},${y}) rotate(8)`}>
      <path d="M -16 -34 L -4 -2 L 4 -2 L 16 -34 L 8 -34 L 0 -14 L -8 -34 Z" fill="#2f6b4f" stroke={stroke} strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="0" cy="12" r="17" fill="#d4a94a" stroke={stroke} strokeWidth="2.2" />
      <circle cx="0" cy="12" r="11" fill="none" stroke="#9a7428" strokeWidth="1.5" />
      <text x="0" y="16" textAnchor="middle" fontFamily="IBM Plex Mono,monospace" fontSize="9" fontWeight="700" fill="#6a4a10">21K</text>
      {showCue && (
        <circle cx="0" cy="6" r="30" fill="none" stroke="var(--accent)" strokeWidth="2" opacity="0.4" />
      )}
    </g>
  );
}

/* ── COFFEE MUG ────────────────────────────────────────── */
function CoffeeMug({ x, y, stroke, cue = 'none' }) {
  const showCue = cue === 'intro' || cue === 'hover';
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx="0" cy="72" rx="48" ry="11" fill="rgba(58,47,38,0.12)" />
      <path d="M -40 0 L -38 64 Q -36 74 0 74 Q 36 74 38 64 L 40 0 Z"
            fill="#e8a57a" stroke={stroke} strokeWidth="2.5" strokeLinejoin="round" />
      <ellipse cx="0" cy="0" rx="40" ry="13" fill="#3a2a20" stroke={stroke} strokeWidth="2" />
      <ellipse cx="0" cy="-1" rx="36" ry="10" fill="#5a3a28" />
      <path d="M 38 22 Q 62 24 62 44 Q 62 64 38 60" fill="none" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
      <g opacity="0.5">
        <path d="M -10 -16 Q -4 -28 -10 -42" fill="none" stroke="#5a4f44" strokeWidth="2" strokeLinecap="round">
          <animate attributeName="opacity" values="0.1;0.6;0.1" dur="2.4s" repeatCount="indefinite"/>
        </path>
        <path d="M 8 -14 Q 14 -26 8 -40" fill="none" stroke="#5a4f44" strokeWidth="2" strokeLinecap="round">
          <animate attributeName="opacity" values="0.5;0.1;0.5" dur="2.8s" repeatCount="indefinite"/>
        </path>
      </g>
      {showCue && (
        <ellipse cx="0" cy="72" rx="60" ry="16" fill="none" stroke="var(--accent)" strokeWidth="2" opacity="0.24">
          <animate attributeName="opacity" values="0.12;0.28;0.12" dur="2s" repeatCount="indefinite" />
        </ellipse>
      )}
    </g>
  );
}

/* ── NOTEBOOK ──────────────────────────────────────────── */
function Notebook({ x, y, stroke, cue = 'none' }) {
  const showCue = cue === 'intro' || cue === 'hover' || cue === 'ambient';
  return (
    <g transform={`translate(${x},${y}) rotate(-5)`}>
      <rect x="0" y="0" width="190" height="32" fill="#b8c28a" stroke={stroke} strokeWidth="2" />
      <rect x="0" y="2" width="190" height="5" fill="#2a2520" opacity="0.28" />
      <line x1="10" y1="18" x2="180" y2="18" stroke={stroke} strokeWidth="0.8" opacity="0.4" />
      <rect x="44" y="-5" width="104" height="7" rx="3" fill="#2a2520" stroke={stroke} strokeWidth="1.2" />
      <path d="M 148 -1.5 L 158 -1.5 L 154 4 Z" fill="#e8a57a" stroke={stroke} strokeWidth="1" />
      {showCue && (
        <rect x="-8" y="-8" width="206" height="48" rx="12" fill="none" stroke="var(--accent)" strokeWidth="2" opacity={cue === 'ambient' ? 0.18 : 0.34}>
          <animate attributeName="opacity" values={cue === 'ambient' ? '0.1;0.2;0.1' : '0.16;0.34;0.16'} dur="2.4s" repeatCount="indefinite" />
        </rect>
      )}
    </g>
  );
}

/* ── RESUME NOTE ───────────────────────────────────────── */
function ResumeNote({ p, resume = {}, draggingId, onDragStart, rtl = false }) {
  const id = 'resume';
  const [hov, setHov] = React.useState(false);
  const isActive = draggingId === id;

  return (
    <g transform={`translate(${p.x}, ${p.y}) rotate(${p.rot}, 170, 115)`}
       style={{ cursor: isActive ? 'grabbing' : 'default', opacity: isActive ? 0.9 : 1 }}
       onMouseDown={(e) => onDragStart(id, e)}
       onMouseEnter={() => setHov(true)}
       onMouseLeave={() => setHov(false)}>
      <rect x="2" y="3" width="340" height="230" fill="rgba(40,20,0,0.12)" rx="2"
            style={{ opacity: isActive ? 0.3 : hov ? 0.22 : 0.12 }} />
      <rect x="0" y="0" width="340" height="230" fill="#fdf6e8" stroke="var(--line)" strokeWidth="1.8" rx="1" />
      <line x1="48" y1="8" x2="48" y2="222" stroke="#d88" strokeWidth="0.8" opacity="0.3" />
      {[36,64,92,120,148,176].map(ly => (
        <line key={ly} x1="12" y1={ly} x2="328" y2={ly} stroke="#c8b88a" strokeWidth="0.5" opacity="0.25" />
      ))}
      <circle cx="170" cy="0" r="7" fill="#c0463c" stroke="#8a2018" strokeWidth="1.2" />
      <circle cx="170" cy="0" r="3.5" fill="#e86858" />
      <CardCtx.Provider value={{ w: 340, rtl }}>
      <CT x="56" y="28" fontFamily="IBM Plex Mono,monospace" fontSize="11" fill="#8a7a6a">// {resume.eyebrow || 'download'}</CT>
      <CT x="56" y="62" fontFamily="Fraunces,serif" fontSize="26" fontWeight="600" fill="#2a2520">{resume.title}</CT>
      <CT x="56" y="90" fontFamily="Fraunces,serif" fontSize="14" fill="#5a4f44">{resume.name}</CT>
      <CT x="56" y="112" fontFamily="IBM Plex Mono,monospace" fontSize="11" fill="#8a7a6a">{resume.line1}</CT>
      <CT x="56" y="136" fontFamily="IBM Plex Mono,monospace" fontSize="11" fill="#8a7a6a">{resume.line2}</CT>
      </CardCtx.Provider>
      <foreignObject x={rtl ? 88 : 52} y="152" width="200" height="42" onMouseDown={e => e.stopPropagation()}>
        <div xmlns="http://www.w3.org/1999/xhtml" style={{ textAlign: rtl ? 'right' : 'left', direction: rtl ? 'rtl' : 'ltr' }}>
          <a href={resume.href} download={resume.filename}
            style={{ display:'inline-block', padding:'8px 20px', background:'#2a2520', color:'#f0e6d4', border:'none', borderRadius:8, fontFamily:'IBM Plex Mono,monospace', fontSize:12, cursor:'pointer', letterSpacing:'.04em', textDecoration:'none' }}>
            {resume.button || '↓ Download PDF'}
          </a>
        </div>
      </foreignObject>
    </g>
  );
}

export { DeskScene }
