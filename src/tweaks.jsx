// Tweaks UI — builds the DOM controls inside #tweaks panel and wires changes back.

(function () {
  const panel = document.getElementById('tweaks');
  if (!panel) return;

  const setTweak = (k, v) => {
    window.__tweaks[k] = v;
    try { localStorage.setItem('yara_tweaks', JSON.stringify(window.__tweaks)); } catch (_) {}
    // re-render app
    window.postMessage({ type: '__tweaks_updated' }, '*');
    buildAll();
  };

  const chip = (label, active, onClick) => {
    const b = document.createElement('button');
    b.className = 'chip' + (active ? ' active' : '');
    b.textContent = label;
    b.onclick = onClick;
    return b;
  };

  function buildAll() {
    const t = window.__tweaks;

    const pal = document.getElementById('tw-palette'); pal.innerHTML = '';
    [['mizan','mizan'],['night','night'],['sand','sand']].forEach(([k,l]) => {
      pal.appendChild(chip(l, t.palette === k, () => setTweak('palette', k)));
    });

    const lap = document.getElementById('tw-laptop'); lap.innerHTML = '';
    [['code','code'],['design','design'],['terminal','terminal']].forEach(([k,l]) => {
      lap.appendChild(chip(l, t.laptop === k, () => setTweak('laptop', k)));
    });

    const ph = document.getElementById('tw-phone'); ph.innerHTML = '';
    [['apps','apps'],['savings','savings'],['telemed','telemed']].forEach(([k,l]) => {
      ph.appendChild(chip(l, t.phone === k, () => setTweak('phone', k)));
    });

  }

  buildAll();
  window.__rebuildTweaks = buildAll;

  // Close button + Escape for keyboard users.
  const close = document.getElementById('tw-close');
  if (close) close.onclick = () => panel.classList.remove('on');
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') panel.classList.remove('on'); });
})();

export {}
