(function() {
  const themeToggle = document.getElementById('theme-toggle');
  const darkThemeLink = document.getElementById('dark-theme');
  const body = document.body;
  
  const LIGHT_ICON = '☀️';
  const DARK_ICON = '🌙';
  
  function getSavedTheme() {
    return localStorage.getItem('theme') || 'light';
  }
  
  function saveTheme(theme) {
    localStorage.setItem('theme', theme);
  }
  
  function applyTheme(theme) {
    body.classList.remove('light', 'dark');
    
    body.classList.add(theme);
    
    if (theme === 'dark') {
      darkThemeLink.disabled = false;
    } else {
      darkThemeLink.disabled = true;
    }
    
    if (theme === 'light') {
      themeToggle.textContent = DARK_ICON;
      themeToggle.title = 'Switch to Dark Theme';
    } else {
      themeToggle.textContent = LIGHT_ICON;
      themeToggle.title = 'Switch to Light Theme';
    }
    
    saveTheme(theme);
  }
  
  function toggleTheme() {
    const currentTheme = body.classList.contains('dark') ? 'dark' : 'light';
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
