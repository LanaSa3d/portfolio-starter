import React from 'react'

// Phone on the desk — three looping screens themed on Yara's mobile work.
// kind: 'apps' (home screen) | 'savings' (Savings Goals) | 'telemed' (patient queue)
function PhoneScreen({ kind = 'apps' }) {
  const x = 768, y = 578, w = 128, h = 224;
  return (
    <g>
      <defs>
        <clipPath id="phone-clip">
          <rect x={x} y={y} width={w} height={h} rx="16" />
        </clipPath>
      </defs>
      <g clipPath="url(#phone-clip)">
        {kind === 'apps' && <PhoneApps x={x} y={y} w={w} h={h} />}
        {kind === 'savings' && <PhoneSavings x={x} y={y} w={w} h={h} />}
        {kind === 'telemed' && <PhoneTelemed x={x} y={y} w={w} h={h} />}
      </g>
    </g>
  );
}

const mono = 'IBM Plex Mono, monospace';

function StatusBar({ x, y }) {
  return <text x={x + 10} y={y + 24} fill="#d8cab0" fontSize="8" fontFamily={mono}>9:41</text>;
}

function PhoneApps({ x, y, w, h }) {
  const apps = [
    ['Savings', '#3f7d4e'], ['Telemed', '#2d5f8a'], ['Rafeeq', '#9a4a2a'],
    ['Mizan', '#2f6b4f'], ['Hirfa', '#7a4a2a'], ['Dalil', '#2a6a6a'],
    ['Khatt', '#5a3a7a'], ['Qalam', '#8a5a1a'], ['Notes', '#b8a07a'],
  ];
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill="#0e0d0b" />
      <StatusBar x={x} y={y} />
      <text x={x + w / 2} y={y + 46} textAnchor="middle" fill="#f6efe2" fontSize="12" fontFamily="Fraunces, serif" fontWeight="500">Yara's apps</text>
      <line x1={x + 10} y1={y + 54} x2={x + w - 10} y2={y + 54} stroke="#2a2520" strokeWidth="0.5" />
      {apps.map(([label, color], i) => {
        const col = i % 3, row = Math.floor(i / 3);
        const tx = x + 12 + col * 36, ty = y + 64 + row * 48;
        return (
          <g key={label}>
            <rect x={tx} y={ty} width="30" height="30" rx="8" fill={color} />
            <text x={tx + 15} y={ty + 20} textAnchor="middle" fill="#f6efe2" fontSize="11" fontFamily="Fraunces, serif" fontWeight="600">{label[0]}</text>
            <text x={tx + 15} y={ty + 40} textAnchor="middle" fill="#a69c8a" fontSize="6" fontFamily={mono}>{label}</text>
          </g>
        );
      })}
      <rect x={x + w / 2 - 16} y={y + h - 8} width="32" height="3" rx="1.5" fill="#3a342e" />
    </g>
  );
}

function PhoneSavings({ x, y, w, h }) {
  const goals = [['Hajj trip', 0.72], ['New laptop', 0.45], ['Emergency', 0.9], ['Wedding', 0.3]];
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill="#f3f0e6" />
      <text x={x + 10} y={y + 24} fill="#3a342e" fontSize="8" fontFamily={mono}>9:41</text>
      <text x={x + 10} y={y + 44} fill="#1f4a36" fontSize="11" fontFamily="Fraunces, serif" fontWeight="600">Savings Goals</text>
      <rect x={x + 8} y={y + 52} width={w - 16} height="40" rx="8" fill="#2f6b4f" />
      <text x={x + 16} y={y + 67} fill="#c3dfca" fontSize="6" fontFamily={mono}>TOTAL SAVED</text>
      <text x={x + 16} y={y + 83} fill="#ffffff" fontSize="12" fontFamily="Fraunces, serif" fontWeight="600">SAR 9,200</text>
      <g style={{ animation: 'phoneScroll 7s ease-in-out infinite' }}>
        {goals.map(([label, pct], i) => {
          const ty = y + 102 + i * 30;
          return (
            <g key={label}>
              <text x={x + 10} y={ty + 8} fill="#2a2520" fontSize="7" fontFamily={mono}>{label}</text>
              <rect x={x + 10} y={ty + 13} width={w - 20} height="5" rx="2.5" fill="#dfe8df" />
              <rect x={x + 10} y={ty + 13} width={(w - 20) * pct} height="5" rx="2.5" fill="#3f7d4e" />
            </g>
          );
        })}
      </g>
    </g>
  );
}

function PhoneTelemed({ x, y, w, h }) {
  const queue = [['Next', 'Dr. Noura', '2 min'], ['2nd', 'Dr. Faisal', '4 min'], ['3rd', 'Dr. Huda', '6 min']];
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill="#0e1620" />
      <StatusBar x={x} y={y} />
      <text x={x + 10} y={y + 44} fill="#e6eef6" fontSize="11" fontFamily="Fraunces, serif" fontWeight="600">Your consultation</text>
      <rect x={x + 8} y={y + 52} width={w - 16} height="64" rx="8" fill="#1d3550" />
      <circle cx={x + w / 2} cy={y + 78} r="14" fill="#2d5f8a" />
      <text x={x + w / 2} y={y + 82} textAnchor="middle" fill="#e6eef6" fontSize="9" fontFamily={mono}>▶</text>
      <text x={x + w / 2} y={y + 108} textAnchor="middle" fill="#9cc0e0" fontSize="6" fontFamily={mono}>VIDEO READY</text>
      {queue.map(([pos, doc, wait], i) => {
        const ty = y + 126 + i * 26;
        return (
          <g key={doc}>
            <rect x={x + 8} y={ty} width={w - 16} height="20" rx="5" fill={i === 0 ? '#2d5f8a' : '#16263a'} />
            <text x={x + 14} y={ty + 13} fill="#e6eef6" fontSize="6.5" fontFamily={mono}>{pos} · {doc}</text>
            <text x={x + w - 14} y={ty + 13} textAnchor="end" fill="#9cc0e0" fontSize="6.5" fontFamily={mono}>{wait}</text>
          </g>
        );
      })}
    </g>
  );
}

export { PhoneScreen }
