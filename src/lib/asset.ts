/**
 * Public-folder URLs must respect the Vite base path, otherwise the site works
 * on a domain root but 404s on GitHub Pages project paths.
 */
const BASE = import.meta.env.BASE_URL || '/'

export function asset(path: string) {
  return `${BASE}${path.replace(/^\/+/, '')}`
}
