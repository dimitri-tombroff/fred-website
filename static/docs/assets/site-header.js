// <fred-site-header>: reproduces the real Hugo/Doks navbar on a standalone
// static/docs/*.html page, inside a Shadow DOM so its markup and the
// Bootstrap CSS it needs cannot collide with the page's own hand-rolled
// styles (e.g. both define a `.badge` class).
//
// The header is never hand-duplicated here: it fetches /partials/site-header.html,
// a bare fragment Hugo renders from the SAME partial the real navbar uses
// (see content/site-header-fragment.md + layouts/_default/site-header-fragment.html),
// so nav labels/links/branding can never drift from the real site.
//
// Scope, deliberately: only the brand link, the primary nav links, the GitHub
// link and the theme toggle are reproduced. The mobile hamburger/offcanvas
// drawer and the search button/modal are Bootstrap-JS-driven widgets that
// resolve their targets by id via `document.querySelector` — a lookup that
// cannot see into a Shadow DOM at all — so they are left out rather than
// shipped half-working. On narrow screens the nav links simply wrap.
//
// Theme: Bootstrap's dark-mode values are CSS custom properties (--bs-*) set
// on [data-bs-theme] at the document root. Custom properties inherit across
// a Shadow DOM boundary even though ordinary CSS rules do not, so this
// header's own CSS below just reads var(--bs-body-bg) etc. and it repaints
// correctly with no extra plumbing. Only the toggle's own click handling is
// re-implemented here (see _wireThemeToggle) — color-mode.js queries
// document.querySelectorAll('[data-bs-theme-value]') once on
// DOMContentLoaded, which cannot find elements sitting inside this shadow
// root either.

(() => {
  const FRAGMENT_URL = "/partials/site-header.html";

  // The real .nav-link.active color, per theme — a literal color, not a
  // --bs-* custom property, so it cannot just inherit across the Shadow DOM
  // boundary the way the rest of this header's palette does.
  const ACTIVE_COLOR = { light: "#5d2f86", dark: "#b3c7ff" };

  const effectiveTheme = () => {
    const stored = localStorage.getItem("theme");
    if (stored === "light" || stored === "dark") return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  };

  const STYLE = `
    :host {
      all: initial;
      display: block;
      font-family: var(--bs-body-font-family, system-ui, -apple-system, "Segoe UI", sans-serif);
      -webkit-font-smoothing: antialiased;
    }
    * { box-sizing: border-box; }
    /* Spacing below mirrors the real navbar's own Bootstrap variables
       (--bs-navbar-padding-y, --bs-navbar-brand-font-size, etc., see
       .navbar/.navbar-brand/.nav-link in the loaded stylesheet) rather than
       an eyeballed size, so the two headers read as the same component. */
    .bar {
      background: var(--bs-body-bg, #fff);
      border-bottom: 1px solid var(--bs-border-color, #dee2e6);
      font-size: 1rem;
      line-height: 1.5;
    }
    .inner {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.5rem 1.5rem;
      max-width: 1240px;
      margin: 0 auto;
      padding: 0.5rem 1.5rem;
      /* Same rgba(emphasis, .65) the real .nav-link/.btn-link icons use —
         not --bs-body-color, which is a different, slightly lighter value. */
      color: rgba(var(--bs-emphasis-color-rgb, 0, 0, 0), 0.65);
    }
    .brand {
      font-weight: 700;
      font-size: 1.25rem;
      padding: 0.3125rem 0;
      text-decoration: none;
      color: var(--bs-emphasis-color, #000);
      margin-right: 1rem;
    }
    nav { flex: 1 1 auto; min-width: 0; }
    nav ul {
      list-style: none;
      display: flex;
      flex-wrap: wrap;
      margin: 0;
      padding: 0;
    }
    nav a {
      display: inline-block;
      padding: 0.5rem;
      text-decoration: none;
      color: inherit;
      white-space: nowrap;
    }
    nav a:hover, nav a:focus-visible {
      color: rgba(var(--bs-emphasis-color-rgb, 0, 0, 0), 0.8);
      text-decoration: underline;
    }
    /* Colors are the real .nav-link.active ones (not a --bs-* variable, so
       not theme-adaptive on their own) — see _paintActiveLink, which picks
       light/dark and repaints on every theme toggle. */
    nav a.active { text-decoration: none; }
    .actions {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      margin-left: auto;
    }
    .icon-link, .toggle {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 2.5rem;
      height: 2.5rem;
      color: inherit;
      background: none;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      padding: 0;
    }
    .icon-link:hover, .toggle:hover { background: var(--bs-tertiary-bg, rgba(127,127,127,0.15)); }
    .icon-link svg, .toggle svg { width: 24px; height: 24px; }
    .toggle svg + svg { display: none; }
  `;

  class FredSiteHeader extends HTMLElement {
    connectedCallback() {
      if (this._initialized) return;
      this._initialized = true;

      // The page's own <body> is a flex row (nav + main): left in normal
      // flow, this element becomes a third flex item, sized to its content
      // instead of spanning the page. Fixed positioning takes it out of
      // that layout entirely — a flex container never applies flex layout
      // to an out-of-flow child — so it spans full width regardless of
      // whatever layout each of the 16 static pages happens to use.
      this.style.position = "fixed";
      this.style.top = "0";
      this.style.left = "0";
      this.style.right = "0";
      this.style.zIndex = "1000";

      const root = this.attachShadow({ mode: "open" });
      fetch(FRAGMENT_URL)
        .then((res) => (res.ok ? res.text() : Promise.reject(new Error(res.status))))
        .then((html) => this._render(root, html))
        .catch(() => {
          // Fails closed: the page still has its own "← Home" link. A
          // missing/broken fragment must never leave the page unusable.
        });
    }

    _render(root, html) {
      const doc = new DOMParser().parseFromString(html, "text/html");
      const brand = doc.querySelector(".navbar-brand");
      const navLinks = Array.from(doc.querySelectorAll(".navbar-nav.flex-grow-1 > li > a"));
      const search = doc.querySelector("#searchToggleDesktop");
      const github = doc.querySelector(".social-link");
      const themeButton = doc.querySelector("#buttonColorMode");

      const style = document.createElement("style");
      style.textContent = STYLE;

      const bar = document.createElement("div");
      bar.className = "bar";
      // .container-lg on the real navbar caps at the same width and centers
      // past it — without this, this element (spanning the full viewport by
      // design, see connectedCallback) reads as visibly wider on a wide
      // screen than the real header's own content ever does.
      const inner = document.createElement("div");
      inner.className = "inner";

      const brandLink = document.createElement("a");
      brandLink.className = "brand";
      brandLink.href = brand ? brand.getAttribute("href") : "/";
      brandLink.textContent = brand ? brand.textContent.trim() : "Fred";
      inner.appendChild(brandLink);

      const nav = document.createElement("nav");
      nav.setAttribute("aria-label", "Primary");
      const ul = document.createElement("ul");
      const linkEls = navLinks.map((a) => {
        const li = document.createElement("li");
        const link = document.createElement("a");
        link.href = a.getAttribute("href");
        link.textContent = a.textContent.trim();
        li.appendChild(link);
        ul.appendChild(li);
        return link;
      });
      nav.appendChild(ul);
      inner.appendChild(nav);
      this._markActiveLink(linkEls);

      const actions = document.createElement("div");
      actions.className = "actions";

      // Same position as the real header (search, theme, GitHub) for visual
      // parity, but not wired to FlexSearch: the search modal is a
      // Bootstrap-JS-driven widget resolved by id from the light document,
      // which cannot reach into this Shadow DOM (see the module docstring).
      // Sends the visitor to the homepage, where real search works, rather
      // than a button that looks live and does nothing.
      if (search) {
        const searchLink = document.createElement("a");
        searchLink.className = "icon-link";
        searchLink.href = "/";
        searchLink.setAttribute("aria-label", "Search (from the homepage)");
        const svg = search.querySelector("svg");
        if (svg) searchLink.appendChild(svg.cloneNode(true));
        actions.appendChild(searchLink);
      }

      const toggle = document.createElement("button");
      toggle.type = "button";
      toggle.className = "toggle";
      toggle.setAttribute("aria-label", "Toggle theme");
      if (themeButton) {
        Array.from(themeButton.querySelectorAll("svg")).forEach((svg) =>
          toggle.appendChild(svg.cloneNode(true))
        );
      }
      actions.appendChild(toggle);

      if (github) {
        const ghLink = document.createElement("a");
        ghLink.className = "icon-link";
        ghLink.href = github.getAttribute("href");
        ghLink.setAttribute("aria-label", "GitHub");
        const svg = github.querySelector("svg");
        if (svg) ghLink.appendChild(svg.cloneNode(true));
        actions.appendChild(ghLink);
      }

      inner.appendChild(actions);
      bar.appendChild(inner);

      root.replaceChildren(style, bar);
      this._wireThemeToggle(toggle);
      this._reserveSpace(bar);
    }

    // Matches Hugo's own active-menu logic (header.html: exact page match,
    // else the item named after the page's section) using only the URL —
    // every static/docs/*.html page maps either to one specific nav item
    // (e.g. architecture.html -> "Architecture") or, failing that, falls
    // under "Docs". Re-run on every theme toggle: the active color below is
    // a literal per-theme hex, not a --bs-* variable, so it does not
    // repaint itself the way the rest of this header's palette does.
    _markActiveLink(linkEls) {
      this._linkEls = linkEls;
      const here = window.location.pathname.replace(/\/index\.html$/, "/");
      let match = linkEls.find((el) => new URL(el.href).pathname === here);
      if (!match && here.startsWith("/docs/")) {
        match = linkEls.find((el) => el.textContent.trim() === "Docs");
      }
      linkEls.forEach((el) => {
        const isActive = el === match;
        el.classList.toggle("active", isActive);
        el.style.color = isActive ? ACTIVE_COLOR[effectiveTheme()] : "";
        el.style.fontWeight = isActive ? "500" : "";
      });
    }

    // Now that it's fixed, this element no longer pushes the page's own
    // content down on its own — push it down by hand, and keep it correct
    // if the bar wraps to a second line on a narrow viewport. Also exposed
    // as --fred-header-h so each page's own sticky, 100vh-tall sidebar can
    // stop its top edge below this bar instead of underneath it — see the
    // `nav` rule in static/docs/*.html.
    _reserveSpace(bar) {
      const apply = () => {
        const height = `${bar.getBoundingClientRect().height}px`;
        document.body.style.paddingTop = height;
        document.documentElement.style.setProperty("--fred-header-h", height);
      };
      apply();
      new ResizeObserver(apply).observe(bar);
    }

    // Mirrors color-mode.js + assets/theme-sync.js, the two mechanisms
    // already keeping a standalone page's *display* in sync with the site's
    // theme choice — this is the missing third piece, the write side, for a
    // toggle that lives where document-level listeners can't reach it.
    _wireThemeToggle(toggle) {
      const svgs = Array.from(toggle.querySelectorAll("svg"));
      const paint = () => {
        const current = effectiveTheme();
        svgs.forEach((svg) => {
          const value = svg.getAttribute("data-bs-theme-value");
          svg.style.display = value === current ? "none" : "inline-block";
        });
        if (this._linkEls) this._markActiveLink(this._linkEls);
      };
      toggle.addEventListener("click", () => {
        const next = effectiveTheme() === "dark" ? "light" : "dark";
        localStorage.setItem("theme", next);
        document.documentElement.setAttribute("data-bs-theme", next);
        paint();
      });
      paint();
    }
  }

  customElements.define("fred-site-header", FredSiteHeader);
})();
