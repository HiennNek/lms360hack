(function() {
  const themeToggle = document.getElementById('theme-toggle');
  const darkThemeLink = document.getElementById('dark-theme');
  const html = document.documentElement;
  
  const LIGHT_ICON = '☀️';
  const DARK_ICON = '🌙';
  
  function getSavedTheme() {
    return localStorage.getItem('theme') || 'light';
  }
  
  function saveTheme(theme) {
    localStorage.setItem('theme', theme);
  }
  
  function applyTheme(theme) {
    html.classList.remove('light', 'dark');
    html.classList.add(theme);
    
    darkThemeLink.disabled = theme !== 'dark';
    
    const hljsDarkTheme = document.getElementById('hljs-dark-theme');
    if (hljsDarkTheme) {
      hljsDarkTheme.disabled = theme !== 'dark';
    }
    
    themeToggle.textContent = theme === 'light' ? DARK_ICON : LIGHT_ICON;
    themeToggle.title = theme === 'light' ? 'Switch to Dark Theme' : 'Switch to Light Theme';
    
    saveTheme(theme);
  }
  
  function toggleTheme() {
    const currentTheme = html.classList.contains('dark') ? 'dark' : 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme(newTheme);
  }
  
  function initTheme() {
    const savedTheme = getSavedTheme();
    applyTheme(savedTheme);
  }
  
  themeToggle.addEventListener('click', toggleTheme);
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTheme);
  } else {
    initTheme();
  }
  
  if (window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    if (!localStorage.getItem('theme')) {
      function handleSystemTheme(e) {
        const systemTheme = e.matches ? 'dark' : 'light';
        applyTheme(systemTheme);
      }
      
      mediaQuery.addEventListener('change', handleSystemTheme);
      
      if (!localStorage.getItem('theme')) {
        handleSystemTheme(mediaQuery);
      }
    }
  }
})();
