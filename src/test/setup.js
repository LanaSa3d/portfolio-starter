import '@testing-library/jest-dom/vitest';

// jsdom has no media playback; the gallery autoplays videos when visible.
window.HTMLMediaElement.prototype.play = () => Promise.resolve();
window.HTMLMediaElement.prototype.pause = () => {};
