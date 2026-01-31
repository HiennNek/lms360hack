(function () {
  const themeToggle = document.getElementById('theme-toggle');
  const html = document.documentElement;

  function getSavedTheme() {
    const saved = localStorage.getItem('theme');
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function saveTheme(theme) {
    localStorage.setItem('theme', theme);
  }

  function applyTheme(theme) {
    if (theme === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }

    const hljsDark = document.getElementById('hljs-dark-theme');
    const hljsLight = document.getElementById('hljs-light-theme');
    if (hljsDark && hljsLight) {
      hljsDark.disabled = theme !== 'dark';
      hljsLight.disabled = theme === 'dark';
    }

    saveTheme(theme);
  }

  function toggleTheme() {
    const isDark = html.classList.contains('dark');
    applyTheme(isDark ? 'light' : 'dark');
  }

  function initTheme() {
    const savedTheme = getSavedTheme();
    applyTheme(savedTheme);
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTheme);
  } else {
    initTheme();
  }

  if (window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  }
})();
