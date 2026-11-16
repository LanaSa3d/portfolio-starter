// Resolves project gallery files (src/assets/projects/<slug>/<file>) to built URLs.
// Vite fingerprints each image and prefixes the GitHub Pages base path for us.
const files = import.meta.glob('./assets/projects/*/*.{webp,png,jpg,svg}', {
  eager: true,
  import: 'default',
});

export function assetUrl(path) {
  return files['./assets/projects/' + path] || null;
}

// Returns the project's gallery as [{ url, caption, alt }], skipping missing files.
export function resolveGallery(project) {
  return (project?.gallery || [])
    .map((item) => {
      const url = assetUrl(item.file);
      return url ? { url, caption: item.caption || '', alt: item.alt || item.caption || '' } : null;
    })
    .filter(Boolean);
}

export function resolveCover(project) {
  return resolveGallery(project)[0] || null;
}

export function resolveLogo(project) {
  return project?.logo ? assetUrl(project.logo) : null;
}
