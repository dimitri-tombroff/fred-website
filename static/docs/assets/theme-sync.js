// Applies the site's own light/dark choice (set by the Doks header toggle,
// stored in localStorage['theme']) to this standalone page, the same way
// node_modules/@thulite/doks-core/assets/js/color-mode.js does for every
// Hugo-templated page. Without this, a standalone static/docs/*.html page
// only ever follows the OS-level prefers-color-scheme, ignoring whatever the
// visitor explicitly picked on the rest of the site.
//
// Load this as the very first thing in <head>, before any <style>, so the
// data-bs-theme attribute is set before first paint (no flash).
(() => {
  const stored = localStorage.getItem('theme');
  const theme = stored === 'light' || stored === 'dark' ? stored : 'auto';
  if (theme === 'auto') {
    document.documentElement.removeAttribute('data-bs-theme');
  } else {
    document.documentElement.setAttribute('data-bs-theme', theme);
  }
})();
