import React from 'react'

function LaptopScreen({ hovered, kind = 'code' }) {
  const [tick, setTick] = React.useState(0);
  React.useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 180);
    return () => clearInterval(id);
  }, []);

  const x = 1098, y = 322, w = 404, h = 272;
  return (
    <g>
      <defs>
        <clipPath id="laptop-clip">
          <rect x={x} y={y} width={w} height={h} rx="5" />
        </clipPath>
      </defs>
      <g clipPath="url(#laptop-clip)">
        {kind === 'code' && <CodeScreen x={x} y={y} w={w} h={h} tick={tick} typing={true} />}
        {kind === 'design' && <DesignScreen x={x} y={y} w={w} h={h} tick={tick} typing={true} />}
        {kind === 'terminal' && <TerminalScreen x={x} y={y} w={w} h={h} tick={tick} typing={true} />}
      </g>
      {/* screen gloss */}
      <path d={`M ${x+6} ${y+6} L ${x+w*0.28} ${y+6} L ${x+6} ${y+h*0.4} Z`} fill="rgba(255,255,255,0.03)" />
    </g>
  );
}

function CodeScreen({ x, y, w, h, tick, typing }) {
  const lines = [
    { indent: 0, tokens: [['kw','import '],['br','{ '],['fn','Button'],['br',' }'],['kw',' from '],['str','"hirfa-ui"']] },
    { indent: 0, tokens: [] },
    { indent: 0, tokens: [['kw','export const '],['fn','Save'],['op',' = () => (']] },
    { indent: 1, tokens: [['op','<'],['fn','Button'],['k',' dir'],['op','='],['str','"rtl"']] },
    { indent: 2, tokens: [['k','tone'],['op','='],['str','"green.600"'],['op','>']] },
    { indent: 2, tokens: [['str','Save now']] },
    { indent: 1, tokens: [['op','</'],['fn','Button'],['op','>']] },
    { indent: 0, tokens: [['op',');']] },
  ];
  const colors = { kw:'#e8a57a', fn:'#f4dcc0', str:'#b8c28a', k:'#d8cab0', op:'#8a7f70', num:'#c2b48a', br:'#d8cab0' };
  const lineH = 22;
  const startY = y + 52;

  const totalChars = lines.reduce((a,l) => a + l.tokens.reduce((b,t)=>b+t[1].length,0) + 1, 0);
  const typedChars = typing ? Math.min(totalChars, (tick * 5) % (totalChars + 12)) : totalChars;

  let cursorPos = { line: lines.length - 1, col: 0 };
  let running = 0;
  for (let i = 0; i < lines.length; i++) {
    const lineLen = lines[i].tokens.reduce((b,t)=>b+t[1].length,0) + 1;
    if (typedChars < running + lineLen) { cursorPos = { line: i, col: typedChars - running }; break; }
    running += lineLen;
  }

  return (
    <g fontFamily="IBM Plex Mono, monospace" fontSize="14">
      <rect x={x} y={y} width={w} height="28" fill="#201c18" />
      <circle cx={x+14} cy={y+14} r="3.5" fill="#3a342e" />
      <circle cx={x+26} cy={y+14} r="3.5" fill="#3a342e" />
      <circle cx={x+38} cy={y+14} r="3.5" fill="#3a342e" />
      <text x={x+w/2} y={y+18} textAnchor="middle" fill="#5a5045" fontSize="11">save-button.tsx</text>
      {lines.map((_, i) => (
        <text key={i} x={x+16} y={startY + i*lineH} fill="#3a342e" fontSize="12">{i+1}</text>
      ))}
      {lines.map((line, i) => {
        const shown = typing ? i <= cursorPos.line : true;
        if (!shown) return null;
        let col = 0;
        const lineMax = i === cursorPos.line && typing ? cursorPos.col : Infinity;
        const parts = [];
        for (const [type, text] of line.tokens) {
          const end = Math.min(col + text.length, lineMax);
          const visible = text.slice(0, Math.max(0, end - col));
          if (visible) parts.push([type, visible]);
          col += text.length;
          if (col >= lineMax) break;
        }
        return (
          <text key={i} x={x+44 + line.indent*18} y={startY + i*lineH} fill="#d8cab0">
            {parts.map(([type, text], j) => (
              <tspan key={j} fill={colors[type]}>{text}</tspan>
            ))}
          </text>
        );
      })}
      {typing && (
        <rect
          x={x + 44 + (lines[cursorPos.line]?.indent || 0)*18 + cursorPos.col * 8.2}
          y={startY + cursorPos.line * lineH - 13}
          width="2.5" height="16" fill="#e8a57a"
          opacity={tick % 2 === 0 ? 0.9 : 0.2}
        />
      )}
    </g>
  );
}

function DesignScreen({ x, y, w, h, tick, typing }) {
  // Mizan tokens: one green scale instead of "11 shades of green".
  const greens = ['#e3efe6','#c3dfca','#97c6a4','#6aa87c','#3f7d4e','#2f6b4f','#1f4a36'];
  return (
    <g fontFamily="IBM Plex Mono, monospace">
      <rect x={x} y={y} width={w} height={h} fill="#1a1714" />
      <rect x={x} y={y} width="50" height={h} fill="#201c18" />
      {[0,1,2,3,4,5].map(i => (
        <rect key={i} x={x+12} y={y+18+i*26} width="26" height="3" rx="1" fill={i === 1 ? '#6aa87c' : '#3a342e'} />
      ))}
      <rect x={x+62} y={y+14} width={w-78} height={h-28} rx="5" fill="#252118" stroke="#3a342e" />
      <text x={x+80} y={y+38} fill="#d8cab0" fontSize="11">mizan / color / green</text>
      {greens.map((c, i) => (
        <g key={c}>
          <rect x={x+80+i*42} y={y+50} width="36" height="36" rx="5" fill={c} />
          <text x={x+98+i*42} y={y+100} textAnchor="middle" fill="#8a7f70" fontSize="8">{(i+1)*100}</text>
        </g>
      ))}
      <rect x={x+80} y={y+122} width="120" height="34" rx="8" fill="#2f6b4f" />
      <text x={x+140} y={y+144} textAnchor="middle" fill="#f6efe2" fontSize="11">Continue</text>
      <rect x={x+214} y={y+122} width="120" height="34" rx="8" fill="none" stroke="#6aa87c" />
      <text x={x+274} y={y+144} textAnchor="middle" fill="#c3dfca" fontSize="12" fontFamily="Noto Sans Arabic, sans-serif">متابعة</text>
      <text x={x+80} y={y+186} fill="#8a7f70" fontSize="10">180 components · WCAG 2.2 AA</text>
      <rect x={x+80} y={y+198} width={Math.min(260, 40 + (tick*6) % 240)} height="6" rx="3" fill="#3f7d4e" />
      {typing && (
        <g transform={`translate(${x + 100 + (tick*16)%240}, ${y + 60 + Math.sin(tick*0.4)*30})`}>
          <path d="M 0 0 L 0 14 L 4 11 L 8 18 L 10 17 L 6 10 L 12 10 Z" fill="#fff" stroke="#000" strokeWidth="0.8" />
        </g>
      )}
    </g>
  );
}

function TerminalScreen({ x, y, w, h, tick, typing }) {
  const lines = ['$ npm run storybook','› hirfa-ui · 95 components','› rtl + ltr mirrored ✓','','$ npx axe --locale ar','› 0 violations · WCAG 2.2 AA','','$ npm publish','› shipped ✓','$ _'];
  const shown = typing ? Math.min(lines.length, Math.floor(tick/2) % (lines.length + 3)) : lines.length;
  return (
    <g fontFamily="IBM Plex Mono, monospace" fontSize="14">
      <rect x={x} y={y} width={w} height={h} fill="#0e0d0b" />
      <rect x={x} y={y} width={w} height="26" fill="#201c18" />
      <text x={x+w/2} y={y+18} textAnchor="middle" fill="#5a5045" fontSize="11">~/hirfa-ui</text>
      {lines.slice(0, shown).map((l, i) => (
        <text key={i} x={x+16} y={y+50 + i*20} fill={l.startsWith('$') ? '#e8a57a' : l.startsWith('›') ? '#b8c28a' : '#d8cab0'}>
          {l}
        </text>
      ))}
    </g>
  );
}

export { LaptopScreen }
