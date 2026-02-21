import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource-variable/fira-code';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import '@fontsource-variable/material-symbols-outlined';
import './styles/main.css';

import lightThemeUrl from './styles/stackoverflow-light.css?url';
import darkThemeUrl from './styles/stackoverflow-dark.css?url';

const lightLink = document.getElementById('hljs-light-theme') as HTMLLinkElement;
if (lightLink) lightLink.href = lightThemeUrl;

const darkLink = document.getElementById('hljs-dark-theme') as HTMLLinkElement;
if (darkLink) darkLink.href = darkThemeUrl;

import { initThemeToggle } from './modules/theme-toggle';
import { initH5PEditor } from './modules/h5p-editor';

initThemeToggle();
initH5PEditor();
