/* Small progressive enhancements; all page content works without JavaScript. */
(() => {
  'use strict';

  const initialize = () => {
    const root = document.documentElement;
    const themeToggle = document.getElementById('theme-toggle');
    const menuToggle = document.getElementById('menu-toggle');
    const navigation = document.getElementById('primary-nav');
    const systemTheme = typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-color-scheme: dark)') : null;
    const desktop = typeof window.matchMedia === 'function'
      ? window.matchMedia('(min-width: 800px)') : null;
    const validTheme = value => value === 'light' || value === 'dark';
    let preference = null;

    // Storage may be unavailable in private browsing or restricted contexts.
    try {
      const stored = window.localStorage.getItem('theme');
      if (validTheme(stored)) preference = stored;
    } catch (_) {
      // A preference still works for this page visit.
    }

    const applyTheme = () => {
      const theme = preference || (systemTheme && systemTheme.matches ? 'dark' : 'light');
      root.dataset.theme = theme;
      if (themeToggle) {
        themeToggle.setAttribute('aria-pressed', String(theme === 'dark'));
        themeToggle.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`);
        const label = themeToggle.querySelector('[data-theme-label]');
        if (label) label.textContent = theme === 'dark' ? 'Dark' : 'Light';
      }
    };

    applyTheme();
    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        preference = root.dataset.theme === 'dark' ? 'light' : 'dark';
        applyTheme();
        try {
          window.localStorage.setItem('theme', preference);
        } catch (_) {
          // Do not let a storage error interrupt the menu or theme control.
        }
      });
      themeToggle.hidden = false;
    }

    // Older Safari uses addListener on MediaQueryList.
    const observeMedia = (query, callback) => {
      if (!query) return;
      if (typeof query.addEventListener === 'function') query.addEventListener('change', callback);
      else if (typeof query.addListener === 'function') query.addListener(callback);
    };
    observeMedia(systemTheme, () => {
      if (!preference) applyTheme();
    });
    window.addEventListener('storage', event => {
      if (event.key !== 'theme' && event.key !== null) return;
      preference = validTheme(event.newValue) ? event.newValue : null;
      applyTheme();
    });

    if (menuToggle && navigation) {
      const isDesktop = () => desktop ? desktop.matches : window.innerWidth >= 800;
      const isOpen = () => menuToggle.getAttribute('aria-expanded') === 'true';
      const setMenu = open => {
        const expanded = Boolean(open && !isDesktop());
        menuToggle.setAttribute('aria-expanded', String(expanded));
        menuToggle.setAttribute('aria-label', expanded ? 'Close navigation' : 'Open navigation');
        menuToggle.dataset.open = String(expanded);
        navigation.dataset.open = String(expanded);
      };

      menuToggle.setAttribute('aria-controls', 'primary-nav');
      setMenu(false);
      menuToggle.addEventListener('click', () => setMenu(!isOpen()));
      navigation.addEventListener('click', event => {
        if (event.target instanceof Element && event.target.closest('a[href]')) setMenu(false);
      });
      document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && isOpen()) {
          setMenu(false);
          menuToggle.focus();
        }
      });
      document.addEventListener('click', event => {
        if (isOpen() && !navigation.contains(event.target) && !menuToggle.contains(event.target)) {
          setMenu(false);
        }
      });
      observeMedia(desktop, () => {
        if (isDesktop()) setMenu(false);
      });
      if (!desktop) window.addEventListener('resize', () => {
        if (isDesktop()) setMenu(false);
      }, { passive: true });

      // CSS may collapse mobile navigation only after its controls work.
      menuToggle.hidden = false;
      root.classList.add('js');
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
  } else {
    initialize();
  }
})();
