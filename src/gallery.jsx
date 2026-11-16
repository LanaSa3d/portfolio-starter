// Project gallery UI: fanned previews, stacked previews and a full-screen viewer.
import React from 'react'
import {
  getMediaOrientation,
  getGalleryOverflowCount,
  getNextGalleryIndex,
  getPreviousGalleryIndex,
  getSwipeDirection,
  getVisibleGalleryItems,
  normalizeGalleryItems,
} from './project-gallery';

// Play the video only while it is on screen — keeps phones from
// downloading and decoding several multi-MB clips at once.
function useViewportVideo(videoRef, srcKey) {
  React.useEffect(function() {
    var el = videoRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      var p = el.play(); if (p && p.catch) p.catch(function(){});
      return;
    }
    var io = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        var v = entry.target;
        if (entry.isIntersecting) {
          var p = v.play(); if (p && p.catch) p.catch(function(){});
        } else {
          v.pause();
        }
      });
    }, { threshold: 0.2 });
    io.observe(el);
    return function() { io.disconnect(); };
  }, [videoRef, srcKey]);
}

function GalleryMedia(props) {
  var item = props.item || {};
  var alt = props.alt;
  var className = props.className;
  var loading = props.loading;
  var orientation = props.orientation;
  var onOrientation = props.onOrientation;
  var [failed, setFailed] = React.useState(false);
  var videoRef = React.useRef(null);
  useViewportVideo(videoRef, item.kind === 'video' ? item.url : null);

  React.useEffect(function() {
    setFailed(false);
  }, [item.url]);

  if (failed || !item.url) {
    return <div className={'project-gallery-fallback' + (className ? ' ' + className : '')}>{alt}</div>;
  }

  if (item.kind === 'video') {
    return (
      <video
        ref={videoRef}
        src={item.url}
        className={(className ? className + ' ' : '') + 'project-gallery-media-' + (orientation || 'landscape')}
        loop
        muted
        playsInline
        preload="metadata"
        onError={function(){ setFailed(true); }}
        onLoadedMetadata={function(e) {
          var target = e.currentTarget;
          onOrientation && onOrientation(getMediaOrientation(target.videoWidth, target.videoHeight));
        }}
      />
    );
  }

  return (
    <img
      src={item.url}
      alt={alt}
      className={(className ? className + ' ' : '') + 'project-gallery-media-' + (orientation || 'landscape')}
      loading={loading || 'lazy'}
      onError={function(){ setFailed(true); }}
      onLoad={function(e) {
        var target = e.currentTarget;
        onOrientation && onOrientation(getMediaOrientation(target.naturalWidth, target.naturalHeight));
      }}
    />
  );
}

function ProjectGalleryStack(props) {
  var normalizedItems = normalizeGalleryItems(props.items);
  var projectName = props.projectName || 'Project';
  var onOpen = props.onOpen;
  var isMobile = props.isMobile;
  var side = props.side || 'right';
  var featured = props.featured === true;
  var visible = getVisibleGalleryItems(normalizedItems);
  var overflow = getGalleryOverflowCount(normalizedItems);

  if (!visible.length) return null;

  return (
    <div className={'project-gallery-stack project-gallery-stack-' + side + (isMobile ? ' project-gallery-stack-mobile' : '') + (featured ? ' project-gallery-stack-featured' : '')} aria-label={projectName + ' gallery previews'}>
      {visible.map(function(item, idx) {
        var isLastVisible = idx === visible.length - 1;
        var showOverflow = isLastVisible && overflow > 0;
        return (
          <button
            key={item.url + '_' + idx}
            type="button"
            className={'project-gallery-card project-gallery-card-' + idx}
            onClick={function() { onOpen && onOpen(idx); }}
            aria-label={'Open ' + projectName + ' gallery image ' + (idx + 1)}>
            <GalleryMedia item={item} alt={item.alt || item.caption || (projectName + ' gallery item ' + (idx + 1))} />
            {showOverflow && <span className="project-gallery-count">+{overflow}</span>}
          </button>
        );
      })}
    </div>
  );
}

function FeaturedGalleryFan(props) {
  var items = normalizeGalleryItems(props.items || []);
  var projectName = props.projectName || 'Project';
  var onOpen = props.onOpen;
  var isMobile = props.isMobile === true;
  var maxVisible = Math.min(items.length, 5);
  var visible = items.slice(0, maxVisible);
  var overflow = Math.max(0, items.length - maxVisible);

  if (!visible.length) return null;

  var count = visible.length;
  var maxRotation = 8;
  var maxTranslateX = 24;

  return (
    <div className={'gallery-fan' + (isMobile ? ' gallery-fan-mobile' : '')} aria-label={projectName + ' gallery previews'}>
      <div className={'gallery-fan-track' + (isMobile ? ' gallery-fan-track-mobile' : '')}>
        {visible.map(function(item, idx) {
          var center = (count - 1) / 2;
          var t = count > 1 ? (idx - center) / center : 0;
          var rotation = isMobile ? 0 : (t * maxRotation);
          var translateX = isMobile ? 0 : (t * maxTranslateX);
          var translateY = isMobile ? 0 : (Math.abs(t) * 10);
          var zIndex = isMobile ? 1 : (count - Math.abs(Math.round(t * count)));
          var isLast = idx === visible.length - 1;

          return (
            <button
              key={item.url + '_' + idx}
              type="button"
              className={'gallery-fan-card' + (isMobile ? ' gallery-fan-card-mobile' : '')}
              style={{
                transform: 'translateX(' + translateX + 'px) translateY(' + translateY + 'px) rotate(' + rotation + 'deg)',
                zIndex: zIndex,
              }}
              onClick={function() { onOpen && onOpen(idx); }}
              aria-label={'Open ' + projectName + ' gallery image ' + (idx + 1)}
            >
              <GalleryMedia item={item} alt={item.alt || item.caption || (projectName + ' gallery ' + (idx + 1))} />
              {item.kind === 'video' && (
                <span className="gallery-fan-video-badge">▶</span>
              )}
              {isLast && overflow > 0 && (
                <span className="gallery-fan-overflow">+{overflow}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ProjectGalleryOverlayEnhanced(props) {
  var items = normalizeGalleryItems(props.items);
  var activeIndex = props.activeIndex || 0;
  var onChangeIndex = props.onChangeIndex;
  var onClose = props.onClose;
  var projectName = props.projectName || 'Project';
  var visibleThumbs = items.slice(0, 6);
  var activeItem = items[activeIndex] || null;
  var _React$useState2 = React.useState('landscape');
  var orientation = _React$useState2[0];
  var setOrientation = _React$useState2[1];
  var touchStartRef = React.useRef(null);

  React.useEffect(function() {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose && onClose();
      if (e.key === 'ArrowRight') onChangeIndex && onChangeIndex(getNextGalleryIndex(activeIndex, items.length));
      if (e.key === 'ArrowLeft') onChangeIndex && onChangeIndex(getPreviousGalleryIndex(activeIndex, items.length));
    }

    window.addEventListener('keydown', handleKeyDown);
    return function() { window.removeEventListener('keydown', handleKeyDown); };
  }, [activeIndex, items.length, onChangeIndex, onClose]);

  React.useEffect(function() {
    setOrientation('landscape');
  }, [activeIndex]);

  if (!items.length || !activeItem) return null;

  var handleSwipeStart = function(e) {
    if (!e.touches || !e.touches.length) return;
    touchStartRef.current = {
      startX: e.touches[0].clientX,
      startY: e.touches[0].clientY,
    };
  };

  var handleSwipeEnd = function(e) {
    if (!touchStartRef.current || !e.changedTouches || !e.changedTouches.length) return;
    var direction = getSwipeDirection({
      startX: touchStartRef.current.startX,
      startY: touchStartRef.current.startY,
      endX: e.changedTouches[0].clientX,
      endY: e.changedTouches[0].clientY,
    });
    touchStartRef.current = null;

    if (direction === 'left' && onChangeIndex) {
      onChangeIndex(getNextGalleryIndex(activeIndex, items.length));
    }
    if (direction === 'right' && onChangeIndex) {
      onChangeIndex(getPreviousGalleryIndex(activeIndex, items.length));
    }
  };

  return (
    <div className="project-gallery-overlay anim-fadeIn" onClick={onClose} role="dialog" aria-modal="true" aria-label={projectName + ' gallery'}>
      <div className="project-gallery-viewer anim-slideUp" onClick={function(e){ e.stopPropagation(); }}>
        <button type="button" className="project-gallery-close" onClick={onClose} aria-label="Close gallery">close</button>
        <div className="project-gallery-layout">
          <div className={'project-gallery-frame project-gallery-frame-' + orientation}>
            <button
              type="button"
              className="project-gallery-nav project-gallery-nav-prev"
              onClick={function() { onChangeIndex && onChangeIndex(getPreviousGalleryIndex(activeIndex, items.length)); }}
              aria-label="Previous gallery item">
              ‹
            </button>
            <div
              key={activeItem.url + '_' + activeIndex}
              className="project-gallery-active-stage"
              onTouchStart={handleSwipeStart}
              onTouchEnd={handleSwipeEnd}>
              <GalleryMedia
                item={activeItem}
                alt={activeItem.alt || activeItem.caption || (projectName + ' gallery item ' + (activeIndex + 1))}
                className="project-gallery-active-media"
                loading="eager"
                orientation={orientation}
                onOrientation={setOrientation}
              />
            </div>
            <div className="project-gallery-meta">
              <span>{activeIndex + 1} / {items.length}</span>
            </div>
            <button
              type="button"
              className="project-gallery-nav project-gallery-nav-next"
              onClick={function() { onChangeIndex && onChangeIndex(getNextGalleryIndex(activeIndex, items.length)); }}
              aria-label="Next gallery item">
              ›
            </button>
          </div>
          <div className="project-gallery-sidebar" aria-label={projectName + ' gallery thumbnails'}>
            {visibleThumbs.map(function(item, idx) {
              var isActive = idx === activeIndex;
              return (
                <button
                  key={item.url + '_' + idx}
                  type="button"
                  className={'project-gallery-thumb' + (isActive ? ' is-active' : '')}
                  onClick={function() { onChangeIndex && onChangeIndex(idx); }}
                  aria-label={'Open ' + projectName + ' gallery thumbnail ' + (idx + 1)}>
                  <GalleryMedia item={item} alt={projectName + ' thumbnail ' + (idx + 1)} />
                  {item.caption && <span className="project-gallery-thumb-caption">{item.caption}</span>}
                </button>
              );
            })}
          </div>
        </div>
        {activeItem.caption && <div className="project-gallery-caption">{activeItem.caption}</div>}
      </div>
    </div>
  );
}

export { GalleryMedia, ProjectGalleryStack, FeaturedGalleryFan, ProjectGalleryOverlayEnhanced };
