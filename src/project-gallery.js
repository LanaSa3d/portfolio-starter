export function getGalleryMediaKind(url) {
  var value = String(url || '').trim().toLowerCase();
  if (!value) return 'image';
  if (/\.(mp4|webm|mov|m4v|ogg)(\?|#|$)/.test(value)) return 'video';
  if (value.indexOf('/video/upload/') !== -1) return 'video';
  return 'image';
}

export function parseGalleryUrls(value) {
  return String(value || '')
    .split('\n')
    .map(function(line) { return line.trim(); })
    .filter(Boolean);
}

export function normalizeGalleryItems(items) {
  return (items || [])
    .map(function(item) {
      if (typeof item === 'string') {
        var legacyUrl = item.trim();
        return legacyUrl ? { url: legacyUrl, caption: '', kind: getGalleryMediaKind(legacyUrl) } : null;
      }

      if (!item || !item.url) {
        return null;
      }

      var url = String(item.url || '').trim();
      if (!url) return null;

      var normalized = {
        url: url,
        caption: String(item.caption || '').trim(),
        kind: getGalleryMediaKind(url),
      };
      if (item.alt) normalized.alt = String(item.alt).trim();
      return normalized;
    })
    .filter(Boolean);
}

export function normalizeProjectItem(project) {
  var value = project || {};
  return {
    ...value,
    featured: value.featured === true,
    gallery: normalizeGalleryItems(value.gallery),
  };
}

export function getVisibleGalleryItems(items) {
  return (items || []).slice(0, 3);
}

export function getGalleryOverflowCount(items) {
  return Math.max(0, (items || []).length - 3);
}

export function getNextGalleryIndex(index, length) {
  if (!length) return 0;
  return (index + 1) % length;
}

export function getPreviousGalleryIndex(index, length) {
  if (!length) return 0;
  return (index - 1 + length) % length;
}

export function getMediaOrientation(width, height) {
  if (!width || !height) return 'landscape';
  if (width === height) return 'square';
  return width > height ? 'landscape' : 'portrait';
}

export function getSwipeDirection(input) {
  var dx = input.endX - input.startX;
  var dy = input.endY - input.startY;
  if (Math.abs(dx) < 45) return null;
  if (Math.abs(dx) <= Math.abs(dy)) return null;
  return dx < 0 ? 'left' : 'right';
}
