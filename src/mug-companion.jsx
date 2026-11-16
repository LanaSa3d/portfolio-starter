import React from 'react';
import { companionFx, companionSprites, directionAliases } from './mug-companion-assets.js';

const FRAME_MS = 120;
const DEATH_MS = companionFx.death.length * FRAME_MS;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function resolveDirection(vector) {
  if (Math.abs(vector.x) < 1 && Math.abs(vector.y) < 1) return 'down';

  const angle = Math.atan2(vector.y, vector.x);
  const slice = Math.PI / 8;

  if (angle >= -slice && angle < slice) return 'right';
  if (angle >= slice && angle < slice * 3) return 'downRight';
  if (angle >= slice * 3 && angle < slice * 5) return 'down';
  if (angle >= slice * 5 && angle < slice * 7) return 'downLeft';
  if (angle >= slice * 7 || angle < -slice * 7) return 'left';
  if (angle >= -slice * 7 && angle < -slice * 5) return 'upLeft';
  if (angle >= -slice * 5 && angle < -slice * 3) return 'up';
  return 'upRight';
}

function useFrameClock(enabled, fpsMs = FRAME_MS) {
  const [frame, setFrame] = React.useState(0);

  React.useEffect(() => {
    if (!enabled) {
      setFrame(0);
      return undefined;
    }

    const id = window.setInterval(() => {
      setFrame((value) => value + 1);
    }, fpsMs);

    return () => window.clearInterval(id);
  }, [enabled, fpsMs]);

  return frame;
}

function pickFrame(frames, frame) {
  if (!frames.length) return '';
  return frames[frame % frames.length];
}

function MugCompanion({ companion, pointer, bounds, onDeathComplete, onDismiss, onSpawned }) {
  const [renderState, setRenderState] = React.useState(() => ({
    x: bounds.width * 0.84,
    y: bounds.height * 0.72,
    direction: 'down',
    moving: false,
    hopOffset: 0,
  }));
  const frame = useFrameClock(Boolean(companion));
  const deathTimerRef = React.useRef(null);
  const onSpawnedRef = React.useRef(onSpawned);
  const pointerRef = React.useRef(pointer);
  const boundsRef = React.useRef(bounds);

  React.useEffect(() => {
    onSpawnedRef.current = onSpawned;
  }, [onSpawned]);

  React.useEffect(() => {
    pointerRef.current = pointer;
  }, [pointer]);

  React.useEffect(() => {
    boundsRef.current = bounds;
  }, [bounds]);

  React.useEffect(() => {
    if (!companion) return undefined;

    setRenderState((current) => ({
      ...current,
      x: companion.mode === 'desk' ? bounds.width * 0.84 : bounds.width * 0.5,
      y: companion.mode === 'desk' ? bounds.height * 0.72 : bounds.height * 0.62,
      direction: 'down',
      moving: companion.mode === 'desk',
      hopOffset: 0,
    }));

    if (companion.phase === 'spawning') {
      onSpawnedRef.current?.();
    }
    return undefined;
  }, [bounds.height, bounds.width, companion?.family, companion?.mode, companion?.phase]);

  React.useEffect(() => {
    if (!companion || companion.phase === 'dying') return undefined;

    let animationId = 0;

    const tick = () => {
      setRenderState((current) => {
        const b = boundsRef.current;
        const p = pointerRef.current;

        if (companion.mode === 'desk') {
          const hop = Math.sin(performance.now() / 180) * 10;
          return {
            ...current,
            x: b.width * 0.84,
            y: b.height * 0.72,
            direction: 'downLeft',
            moving: true,
            hopOffset: Math.max(0, hop),
          };
        }

        const rawTargetX = clamp(p.x || b.width * 0.5, 48, Math.max(48, b.width - 48));
        const rawTargetY = clamp(p.y || b.height * 0.62, 48, Math.max(48, b.height - 48));

        // Keep a follow distance — companion hangs back ~60px behind the cursor
        const followDist = 60;
        const toDx = rawTargetX - current.x;
        const toDy = rawTargetY - current.y;
        const dist = Math.sqrt(toDx * toDx + toDy * toDy);

        // Only start moving when far enough from the cursor
        if (dist < followDist) {
          return {
            ...current,
            moving: false,
            hopOffset: 0,
            direction: dist > 4 ? resolveDirection({ x: toDx, y: toDy }) : current.direction,
          };
        }

        // Move toward cursor but stop at followDist
        const targetX = rawTargetX - (toDx / dist) * followDist;
        const targetY = rawTargetY - (toDy / dist) * followDist;
        const dx = targetX - current.x;
        const dy = targetY - current.y;

        // Slow lerp + speed cap for a lazy trailing feel
        let stepX = dx * 0.035;
        let stepY = dy * 0.035;
        const maxSpeed = 3.5;
        const stepDist = Math.sqrt(stepX * stepX + stepY * stepY);
        if (stepDist > maxSpeed) {
          stepX = (stepX / stepDist) * maxSpeed;
          stepY = (stepY / stepDist) * maxSpeed;
        }

        const moving = Math.abs(dx) > 2 || Math.abs(dy) > 2;

        return {
          ...current,
          x: current.x + stepX,
          y: current.y + stepY,
          direction: moving ? resolveDirection({ x: dx, y: dy }) : current.direction,
          moving,
          hopOffset: moving ? 6 : 0,
        };
      });

      animationId = window.requestAnimationFrame(tick);
    };

    animationId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(animationId);
  }, [companion]);

  React.useEffect(() => {
    if (!companion || companion.phase !== 'dying') return undefined;
    deathTimerRef.current = window.setTimeout(() => {
      onDeathComplete?.();
    }, DEATH_MS);

    return () => {
      if (deathTimerRef.current) window.clearTimeout(deathTimerRef.current);
    };
  }, [companion, onDeathComplete]);

  if (!companion) return null;

  const manifest = companionSprites[companion.family];
  const alias = directionAliases[renderState.direction] || directionAliases.down;
  const action = companion.phase === 'spawning' || renderState.moving ? 'jump' : 'idle';
  const characterFrames = manifest?.[action]?.[alias.source] || manifest?.idle?.down || [];
  const fxFrames = companion.phase === 'dying'
    ? companionFx.death
    : (companion.phase === 'spawning' || renderState.moving ? companionFx.jump : []);
  const spriteUrl = pickFrame(characterFrames, frame);
  const fxUrl = pickFrame(fxFrames, frame);

  return (
    <div className="mug-companion-layer" aria-hidden="true">
      <button
        type="button"
        aria-label="desk companion"
        data-mode={companion.mode}
        data-phase={companion.phase}
        className={`mug-companion mug-companion--${companion.phase}`}
        style={{
          left: `${renderState.x}px`,
          top: `${renderState.y - renderState.hopOffset}px`,
        }}
        onClick={companion.phase === 'dying' ? undefined : onDismiss}
      >
        {fxUrl && <img src={fxUrl} alt="" className="mug-companion__fx" />}
        {spriteUrl && (
          <img
            src={spriteUrl}
            alt=""
            className="mug-companion__sprite"
            style={{ transform: alias.flip ? 'scaleX(-1)' : 'none' }}
          />
        )}
      </button>
    </div>
  );
}

export { DEATH_MS, MugCompanion, resolveDirection };
