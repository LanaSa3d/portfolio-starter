import React from 'react';
import { useLang } from './i18n.jsx';

const AR_LABELS = { about: 'نبذة', highlights: 'المحطات', work: 'الأعمال', experience: 'الخبرات', research: 'البحث', speaking: 'المحاضرات', teaching: 'التدريس', awards: 'الجوائز', skills: 'المهارات', contact: 'التواصل' };

// Sections the ink line travels through, in page order.
var SECTIONS = [
  { id: 'about',       label: 'about' },
  { id: 'highlights',  label: 'highlights' },
  { id: 'projects',    label: 'work' },
  { id: 'experience',  label: 'experience' },
  { id: 'research',    label: 'research' },
  { id: 'speaking',    label: 'speaking' },
  { id: 'leadership',  label: 'teaching' },
  { id: 'recognition', label: 'awards' },
  { id: 'skills',      label: 'skills' },
  { id: 'contact',     label: 'contact' },
];

var SAMPLES = 360; // y → length lookup resolution

// Catmull-Rom spline → cubic bezier path through the waypoints.
// Gives one smooth continuous stroke instead of stitched segments.
function splinePath(pts) {
  if (pts.length < 2) return '';
  var d = 'M ' + pts[0].x.toFixed(1) + ' ' + pts[0].y.toFixed(1);
  for (var i = 0; i < pts.length - 1; i++) {
    var p0 = pts[i - 1] || pts[i];
    var p1 = pts[i];
    var p2 = pts[i + 1];
    var p3 = pts[i + 2] || p2;
    var c1x = p1.x + (p2.x - p0.x) / 6;
    var c1y = p1.y + (p2.y - p0.y) / 6;
    var c2x = p2.x - (p3.x - p1.x) / 6;
    var c2y = p2.y - (p3.y - p1.y) / 6;
    d += ' C ' + c1x.toFixed(1) + ' ' + c1y.toFixed(1)
       + ', ' + c2x.toFixed(1) + ' ' + c2y.toFixed(1)
       + ', ' + p2.x.toFixed(1) + ' ' + p2.y.toFixed(1);
  }
  return d;
}

export default function ScrollPath() {
  const { lang } = useLang();
  var [geom, setGeom] = React.useState(null); // { w, h, d, nodes:[{id,label,x,y,len}], total }
  var inkRef = React.useRef(null);
  var tipRef = React.useRef(null);
  var measureRef = React.useRef(null);
  var lookupRef = React.useRef(null);   // sampled { y, len } table
  var currentLenRef = React.useRef(0);
  var [activeCount, setActiveCount] = React.useState(0);

  var measure = React.useCallback(function() {
    if (typeof window === 'undefined' || window.innerWidth < 1350) { setGeom(null); return; }

    var els = SECTIONS.map(function(s) {
      var el = document.getElementById(s.id);
      return el ? { s: s, el: el } : null;
    }).filter(Boolean);
    if (els.length < 2) return;

    var docW = document.documentElement.clientWidth;
    var mainEl = document.querySelector('main#main');
    var docH = mainEl?.offsetHeight || document.documentElement.scrollHeight;

    // Content column is centered, max ~1160px — the side gutters are where
    // the line rests; the sweeps across happen in the padded gaps between
    // sections so the stroke rarely sits on top of text.
    var gutter = Math.max(124, (docW - 1160) / 2 * 0.5);
    var lineX = gutter;

    var pts = [];
    var nodeMeta = [];

    var firstTop = els[0].el.offsetTop;
    // A single quiet vertical guide in the outer gutter.
    pts.push({ x: lineX, y: Math.max(0, firstTop - 40) });

    els.forEach(function(entry, i) {
      var el = entry.el;
      var top = el.offsetTop;
      var h = el.offsetHeight;
      var onRight = false;
      var x = lineX;
      // Anchor in the vertical middle of the section, hugging the gutter.
      var anchor = { x: x, y: top + h * 0.5 };
      // Entry / exit points bend the line into the gutter early and hold it
      // there through the section, so the cross-page sweep lands in the gap.
      pts.push({ x: x, y: top + h * 0.18 });
      pts.push(anchor);
      pts.push({ x: x, y: top + h * 0.82 });
      nodeMeta.push({ id: entry.s.id, label: entry.s.label, x: anchor.x, y: anchor.y, onRight: onRight });
    });

    // Continue the same straight guide to the bottom.
    var last = els[els.length - 1].el;
    pts.push({ x: lineX, y: Math.min(docH - 20, last.offsetTop + last.offsetHeight + 30) });

    var d = splinePath(pts);
    setGeom({ w: docW, h: docH, d: d, nodes: nodeMeta, total: 0 });
  }, []);

  // After the path renders, read its real length, build the y→length table,
  // and pin each node to its exact arc length.
  React.useLayoutEffect(function() {
    var path = measureRef.current;
    if (!geom || geom.total || !path || typeof path.getTotalLength !== 'function') return;
    var total = path.getTotalLength();
    // Pre-sample the whole path once — the rAF loop then works purely from
    // this table (no per-frame getPointAtLength calls, which are expensive).
    var table = new Array(SAMPLES + 1);
    for (var i = 0; i <= SAMPLES; i++) {
      var len = (i / SAMPLES) * total;
      var pt = path.getPointAtLength(len);
      table[i] = { x: pt.x, y: pt.y, len: len };
    }
    lookupRef.current = { table: table, total: total };

    // node arc lengths: nearest sample to each node's y on its own side
    var nodes = geom.nodes.map(function(n) {
      var best = 0, bestDist = Infinity;
      for (var j = 0; j <= SAMPLES; j++) {
        var p = path.getPointAtLength(table[j].len);
        var dx = p.x - n.x, dy = p.y - n.y;
        var dist = dx * dx + dy * dy;
        if (dist < bestDist) { bestDist = dist; best = table[j].len; }
      }
      return { ...n, len: best };
    });

    setGeom(function(g) { return { ...g, nodes: nodes, total: total }; });

    if (inkRef.current) {
      inkRef.current.style.strokeDasharray = String(total);
      inkRef.current.style.strokeDashoffset = String(total - currentLenRef.current);
    }
  }, [geom]); // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(function() {
    measure();
    var t1 = setTimeout(measure, 700);
    var t2 = setTimeout(measure, 2200);
    var onResize = function() { measure(); };
    window.addEventListener('resize', onResize);
    window.addEventListener('load', onResize);
    var ro = null;
    if (typeof ResizeObserver !== 'undefined') {
      var pending = null;
      ro = new ResizeObserver(function() {
        clearTimeout(pending);
        pending = setTimeout(measure, 250);
      });
      var mainEl = document.querySelector('main#main');
      if (mainEl) ro.observe(mainEl);
    }
    return function() {
      clearTimeout(t1); clearTimeout(t2);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('load', onResize);
      if (ro) ro.disconnect();
    };
  }, [measure]);

  // Pen target = the point of the path currently at 60% of the viewport;
  // lerp the drawn length toward it (forward on scroll down, backward on
  // scroll up). The rAF loop only runs while the line is actually moving —
  // it goes fully idle once settled and is woken by scroll/resize events,
  // so the page costs nothing when the visitor isn't scrolling.
  React.useEffect(function() {
    if (!geom || !geom.total) return;
    var raf = 0;
    var running = false;
    var nodes = geom.nodes;

    function lenForY(y) {
      var lookup = lookupRef.current;
      if (!lookup) return 0;
      var table = lookup.table;
      // path y is not strictly monotonic (gentle bends), walk for the last
      // sample whose y is below the pen — good enough at this resolution.
      var len = 0;
      for (var i = 0; i <= SAMPLES; i++) {
        if (table[i].y <= y) len = table[i].len;
      }
      return len;
    }

    function pointAt(len) {
      // Interpolate from the pre-sampled table instead of calling
      // getPointAtLength every frame.
      var lookup = lookupRef.current;
      if (!lookup) return null;
      var table = lookup.table;
      var f = (len / lookup.total) * SAMPLES;
      var i = Math.max(0, Math.min(SAMPLES - 1, Math.floor(f)));
      var t = f - i;
      var a = table[i], b = table[i + 1];
      return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
    }

    function tick() {
      var penY = window.scrollY + window.innerHeight * 0.6;
      var target = lenForY(penY);
      var current = currentLenRef.current;
      var next = current + (target - current) * 0.09;
      var settled = Math.abs(next - target) < 0.5;
      if (settled) next = target;
      currentLenRef.current = next;

      if (inkRef.current) {
        inkRef.current.style.strokeDashoffset = String(Math.max(0, geom.total - next));
      }
      var pt = pointAt(Math.min(next, geom.total));
      if (tipRef.current && pt) {
        tipRef.current.setAttribute('cx', pt.x);
        tipRef.current.setAttribute('cy', pt.y);
        tipRef.current.style.opacity = next > 4 && next < geom.total - 4 ? '1' : '0';
      }

      var count = 0;
      for (var i = 0; i < nodes.length; i++) {
        if (next >= nodes[i].len - 2) count = i + 1;
      }
      setActiveCount(function(prev) { return prev === count ? prev : count; });

      if (settled) {
        running = false; // go idle — wake() restarts on the next scroll
        return;
      }
      raf = requestAnimationFrame(tick);
    }

    function wake() {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(tick);
    }

    wake();
    window.addEventListener('scroll', wake, { passive: true });
    window.addEventListener('resize', wake);
    return function() {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', wake);
      window.removeEventListener('resize', wake);
    };
  }, [geom]);

  if (!geom) return null;

  return (
    <div className="scroll-ink" style={{ height: geom.h }} aria-hidden="true">
      <svg
        width={geom.w}
        height={geom.h}
        viewBox={'0 0 ' + geom.w + ' ' + geom.h}
        style={{ display: 'block', overflow: 'visible' }}
      >
        {/* hidden measuring path */}
        <path ref={measureRef} d={geom.d} fill="none" stroke="none" />
        {/* the ink stroke that follows the scroll */}
        <path
          ref={inkRef}
          d={geom.d}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeOpacity="0.55"
          strokeDasharray={geom.total || 1}
          strokeDashoffset={geom.total || 1}
        />
        {/* pen tip */}
        <circle ref={tipRef} r="7" fill="var(--accent)" fillOpacity="0.9" style={{ opacity: 0, transition: 'opacity 0.25s ease' }} />

        {geom.nodes.map(function(n, i) {
          var active = i < activeCount;
          var isCurrent = i === activeCount - 1;
          return (
            <g
              key={n.id}
              className="scroll-ink-node"
              transform={'translate(' + n.x + ',' + n.y + ')'}
              onClick={function() {
                var el = document.getElementById(n.id);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            >
              <circle className={isCurrent ? 'scroll-node-halo is-current' : 'scroll-node-halo'} r="16" fill="var(--accent)" opacity={isCurrent ? 0.13 : 0} />
              <circle
                r="7"
                fill={active ? 'var(--accent)' : 'var(--paper)'}
                stroke={active ? 'var(--accent)' : 'var(--line)'}
                strokeOpacity={active ? 0.9 : 0.35}
                strokeWidth="2"
                style={{ transition: 'fill 0.35s ease, stroke 0.35s ease' }}
              />
              <rect x="-116" y="-16" width="102" height="31" rx="15" fill="var(--paper)" stroke="var(--accent)" strokeOpacity={isCurrent ? .4 : 0} opacity={isCurrent ? .97 : 0} style={{ transition: 'opacity .35s ease' }} />
              <foreignObject x="-116" y="-16" width="102" height="31" style={{ opacity: isCurrent ? 1 : 0, transition: 'opacity .35s ease', pointerEvents: 'none' }}>
                <div xmlns="http://www.w3.org/1999/xhtml" dir={lang === 'ar' ? 'rtl' : 'ltr'} style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', color: 'var(--accent)', fontFamily: lang === 'ar' ? 'Thmanyah Sans, sans-serif' : 'IBM Plex Mono, monospace', fontSize: lang === 'ar' ? 15 : 11, whiteSpace: 'nowrap' }}>
                  {lang === 'ar' ? AR_LABELS[n.label] : n.label}
                </div>
              </foreignObject>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
