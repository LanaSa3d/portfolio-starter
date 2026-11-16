function toEntries(modules) {
  return Object.entries(modules).map(([path, url]) => ({
    path,
    url,
    file: path.split('/').pop() || path,
  }));
}

function frameIndex(file) {
  const match = file.match(/\((\d+)\)/);
  return match ? Number(match[1]) : 0;
}

function sortFrames(a, b) {
  return frameIndex(a.file) - frameIndex(b.file);
}

function buildCharacterManifest(modules) {
  const manifest = {
    idle: {},
    jump: {},
  };

  toEntries(modules)
    .sort(sortFrames)
    .forEach((entry) => {
      const match = entry.file.match(/^(idle|jump)_([a-z_]+) \(\d+\)\.png$/i);
      if (!match) return;
      const [, action, direction] = match;
      manifest[action][direction] = [...(manifest[action][direction] || []), entry.url];
    });

  return manifest;
}

function buildFxFrames(modules) {
  return toEntries(modules).sort(sortFrames).map((entry) => entry.url);
}

const directionAliases = {
  up: { source: 'up', flip: false },
  upRight: { source: 'up_right', flip: false },
  right: { source: 'right', flip: false },
  downRight: { source: 'down_right', flip: false },
  down: { source: 'down', flip: false },
  downLeft: { source: 'down_right', flip: true },
  left: { source: 'right', flip: true },
  upLeft: { source: 'up_right', flip: true },
};

const companionSprites = {
  base: buildCharacterManifest(import.meta.glob('./mug-companion-assets/base/*.png', { eager: true, import: 'default' })),
  hero: buildCharacterManifest(import.meta.glob('./mug-companion-assets/hero/*.png', { eager: true, import: 'default' })),
  monster: buildCharacterManifest(import.meta.glob('./mug-companion-assets/monster/*.png', { eager: true, import: 'default' })),
  skeleton: buildCharacterManifest(import.meta.glob('./mug-companion-assets/skeleton/*.png', { eager: true, import: 'default' })),
};

const companionFx = {
  death: buildFxFrames(import.meta.glob('./mug-companion-assets/death/*.png', { eager: true, import: 'default' })),
  jump: buildFxFrames(import.meta.glob('./mug-companion-assets/jumpfx/*.png', { eager: true, import: 'default' })),
};

export { companionFx, companionSprites, directionAliases };
