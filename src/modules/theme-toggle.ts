function getSavedTheme(): string {
    const saved = localStorage.getItem('theme');
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function saveTheme(theme: string): void {
    localStorage.setItem('theme', theme);
}

function applyTheme(theme: string): void {
    const html = document.documentElement;

    if (theme === 'dark') {
        html.classList.add('dark');
    } else {
        html.classList.remove('dark');
    }

    const hljsDark = document.getElementById('hljs-dark-theme') as HTMLLinkElement | null;
    const hljsLight = document.getElementById('hljs-light-theme') as HTMLLinkElement | null;
    if (hljsDark && hljsLight) {
        hljsDark.disabled = theme !== 'dark';
        hljsLight.disabled = theme === 'dark';
    }

    saveTheme(theme);
}

function toggleTheme(): void {
    const isDark = document.documentElement.classList.contains('dark');
    applyTheme(isDark ? 'light' : 'dark');
}

export function initThemeToggle(): void {
    const themeToggle = document.getElementById('theme-toggle');

    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    const savedTheme = getSavedTheme();
    applyTheme(savedTheme);

    if (window.matchMedia) {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                applyTheme(e.matches ? 'dark' : 'light');
            }
        });
    }
}
