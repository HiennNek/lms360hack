// ==UserScript==
// @name         LMS360 Hack Next
// @namespace    https://github.com/HiennNek/lms360hack
// @version      1.0.0
// @description  Tìm kiếm nội dung và đáp án bài giảng LMS360.
// @author       HiennNek
// @license      https://raw.githubusercontent.com/HiennNek/lms360hack/refs/heads/front-end/LICENSE.md
// @match        *://lms360.vn/*
// @match        *://*.lms360.vn/*
// @run-at       document-start
// @grant        unsafeWindow
// ==/UserScript==

(function () {
    'use strict';

    const PAGE = (typeof unsafeWindow !== 'undefined' && unsafeWindow) || window;

    const PLAY_RE = /\/h5p\/([^/?#]+)\/play(?:[/?#]|$)/i;

    let payload = null;
    let panelHost = null;
    let dismissed = false;

    function playId(url) {
        try {
            const m = PLAY_RE.exec(new URL(url, location.href).pathname);
            return m ? m[1] : null;
        } catch (e) {
            return null;
        }
    }

    function onPayload(id, text) {
        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            return;
        }
        payload = { id: id, data: data };
        if (document.readyState === 'loading') return;
        if (panelHost) render();
        else if (!dismissed) { ensurePanel(); render(); }
    }

    function patchFetch() {
        const orig = PAGE.fetch;
        if (typeof orig !== 'function' || orig.__lmsPatched) return;

        const wrapped = function (input) {
            const p = orig.apply(this, arguments);
            try {
                const url = typeof input === 'string' ? input : (input && input.url) || '';
                const id = playId(url);
                if (id) {
                    p.then(function (res) {
                        try {
                            const copy = res.clone();
                            copy.text().then(function (t) { onPayload(id, t); }).catch(function () {});
                        } catch (e) {}
                    }).catch(function () {});
                }
            } catch (e) {}
            return p;
        };

        wrapped.__lmsPatched = true;
        try { PAGE.fetch = wrapped; } catch (e) {}
    }

    function patchXhr() {
        const XHR = PAGE.XMLHttpRequest;
        if (!XHR || XHR.prototype.open.__lmsPatched) return;

        const open = XHR.prototype.open;
        const send = XHR.prototype.send;

        const oOpen = function (method, url) {
            this.__lmsUrl = url;
            return open.apply(this, arguments);
        };
        const oSend = function () {
            try {
                const id = playId(this.__lmsUrl || '');
                if (id) {
                    this.addEventListener('load', function () {
                        try { onPayload(id, this.responseText); } catch (e) {}
                    });
                }
            } catch (e) {}
            return send.apply(this, arguments);
        };

        oOpen.__lmsPatched = true;
        XHR.prototype.open = oOpen;
        XHR.prototype.send = oSend;
    }

    function buildImageUrl(contentUrl, filePath) {
        if (!filePath) return null;

        let contentId = '';
        if (contentUrl) {
            const match = contentUrl.match(/\/([^\/]+)$/);
            if (match) {
                contentId = match[1];
            }
        }

        if (!contentId) return filePath;

        const path = filePath.startsWith('/') ? filePath.slice(1) : filePath;

        return `/image?path=${encodeURIComponent(path)}&contentId=${encodeURIComponent(contentId)}`;
    }

    function process_h5p_questions(json, options = {}) {
        const lib = (json.library || json.__containerLibrary || '').toString();
        const params = json.params || json;
        let results = [];

        const contentUrl = options.contentUrl || json.__contentUrl || params.__contentUrl || '';

        const addResult = (text, duration = options.duration) => {
            if (!text) return;
            const cleanText = text
                .replace(/<(img|iframe)[^>]*>/gi, 'MEDIA_PLACEHOLDER')
                .replace(/<[^>]+>/g, '')
                .replace(/&nbsp;/g, ' ')
                .trim();
            if (cleanText.length > 0) {
                results.push({ text, duration });
            }
        };

        const getMediaImage = (p) => {
            const file = p.media?.type?.params?.file || p.file;
            if (file?.path) {
                const url = buildImageUrl(contentUrl, file.path);
                const alt = p.media?.type?.params?.alt || p.alt || 'Hình ảnh';
                return `<div class="image-block"><img src="${url}" alt="${alt}" style="max-width:100%;border-radius:12px;box-shadow:0 2px 6px rgba(0,0,0,0.2);margin-bottom:10px;"></div>`;
            }
            return '';
        };

        if (lib.startsWith('H5P.MultiChoice') || lib.startsWith('H5P.SimpleMultiChoice')) {
            const qText = (params.question || 'Câu hỏi').replace(/<\/?p>/g, '').trim();
            const image = getMediaImage(params);
            const opts = (params.answers || params.alternatives || [])
                .map((ans) => `<li class="${ans.correct ? 'highlight' : ''}">${String(ans.text != null ? ans.text : typeof ans === 'string' ? ans : '').replace(/<\/?p>/g, '').trim()}</li>`)
                .join('');
            if (opts) addResult(`${image}${qText}<ul>${opts}</ul>`);
        } else if (lib.startsWith('H5P.SingleChoiceSet')) {
            (params.choices || []).forEach((c) => {
                const opts = (c.answers || [])
                    .map((a, i) => `<li class="${i === 0 ? 'highlight' : ''}">${a.replace(/<\/?p>/g, '').trim()}</li>`)
                    .join('');
                if (opts) addResult(`${(c.question || '').replace(/<\/?p>/g, '').trim()}<ul>${opts}</ul>`);
            });
        } else if (lib.startsWith('H5P.Blanks')) {
            const mediaImage = getMediaImage(params);
            const titleHtml = params.text ? `<strong>${params.text.replace(/<\/?p>/g, '').trim()}</strong><br><br>` : '';
            const title = mediaImage + titleHtml;
            (params.questions || json.questions || []).forEach((q) =>
                addResult(
                    title +
                    q
                        .replace(/<\/p>/gi, '<br>')
                        .replace(/<p>/gi, '')
                        .replace(/<(?!br\s*\/?>)[^>]+>/gi, '')
                        .replace(/\*(.*?)\*/g, (m, c) =>
                            c
                                .split('/')
                                .map((p) => `<span class="highlight">${p.trim()}</span>`)
                                .join(' / '),
                        )
                        .trim(),
                ),
            );
        } else if (lib.startsWith('H5P.TrueFalse')) {
            const qText = (params.question || 'Đúng/Sai').replace(/<\/?p>/g, '');
            const labels = [params.l10n?.trueText || 'Đúng', params.l10n?.falseText || 'Sai'];
            const correct = params.correct === 'true' ? labels[0] : labels[1];
            addResult(
                `${getMediaImage(params)}${qText}<ul><li class="${params.correct === 'true' ? 'highlight' : ''}">${labels[0]}</li><li class="${params.correct === 'false' ? 'highlight' : ''}">${labels[1]}</li></ul>`,
            );
        } else if (lib.startsWith('H5P.DragText')) {
            let t = (params.textField || '')
                .split(/\r?\n|\\n/)
                .map((l) =>
                    l
                        .replace(/‾\t/g, '')
                        .trim()
                        .replace(/<(?!br\s*\/?>)[^>]+>/gi, '')
                        .replace(/\*(.*?)\*/g, '<span class="highlight">$1</span>'),
                )
                .join('<br>');
            if (params.distractors)
                t += `<br><em>(Từ không có trong đáp án: ${params.distractors
                    .match(/\*(.*?)\*/g)
                    ?.map((d) => d.replace(/\*/g, ''))
                    .join(', ')})</em>`;
            addResult(t);
        } else if (lib.startsWith('H5P.MarkTheWords')) {
            addResult(
                `<p>${params.taskDescription?.replace(/<\/?p>/g, '').trim() || ''}</p><p>${(params.textField || '')
                    .replace(/<\/?p>/g, '')
                    .replace(/<(?!br\s*\/?>)[^>]+>/gi, '')
                    .replace(/\*(.+?)\*/g, '<span class="highlight">$1</span>')}</p>`,
            );
        } else if (lib.startsWith('H5P.Essay') || lib.startsWith('H5P.FreeTextQuestion')) {
            let t = (params.taskDescription || params.question || 'Tự luận').replace(/<\/?p>/g, '').trim();
            const ks = (params.keywords || []).map((k) => (k.keyword || '').replace(/•/g, '<br>•').trim()).filter((k) => k.length > 0);
            if (ks.length) t += `<br><br><em><strong>Gợi ý:</strong><em><div style="margin-left:20px;">${ks.join('<br><br>')}</div>`;
            addResult(`${t}<br><em>(Câu hỏi tự luận không có đáp án sẵn)</em>`);
        } else if (lib.startsWith('H5P.Summary')) {
            const groups = (params.summaries || [])
                .map((g) => {
                    const listItems = (g.summary || [])
                        .map((s, i) => `<li class="${i === 0 ? 'highlight' : ''}">${s.replace(/<\/?p>/g, '').trim()}</li>`)
                        .join('');
                    return listItems ? `<ul>${listItems}</ul>` : '';
                })
                .filter((html) => html !== '')
                .join('');
            if (groups) addResult(`<strong>${(params.intro || '').replace(/<\/?p>/g, '')}</strong><br>${groups}`);
        } else if (lib.startsWith('H5P.SortParagraphs')) {
            addResult(
                `<strong>${params.taskDescription?.replace(/<\/?p>/g, '') || 'Sắp xếp:'}</strong><ul>${(params.paragraphs || []).map((p) => `<li>${p.replace(/<\/?p>/g, '').trim()}</li>`).join('')}</ul>`,
            );
        } else if (lib.startsWith('H5P.Crossword')) {
            const build = (l, t) =>
                l.length ? `<h4>${t}:</h4><ul>${l.map((w) => `<li>${w.clue} <span class="highlight">${w.answer}</span></li>`).join('')}</ul>` : '';
            addResult(
                `<div class="crossword-container">${build(
                    params.words.filter((w) => w.orientation === 'across'),
                    'Ngang',
                )}${build(
                    params.words.filter((w) => w.orientation === 'down'),
                    'Dọc',
                )}</div>`,
            );
        } else if (lib.startsWith('H5P.FindTheWords')) {
            addResult(
                `<strong>${params.taskDescription?.replace(/<\/?p>/g, '').trim() || 'Tìm từ:'}</strong><ul>${(params.wordList || '')
                    .split(',')
                    .map((w) => `<li class="highlight">${w.trim()}</li>`)
                    .join('')}</ul>`,
            );
        } else if (lib.startsWith('H5P.DragQuestion')) {
            const qTask = params.question?.task || {};
            const elements = qTask.elements || [];
            const dropZones = qTask.dropZones || [];
            const mapping = dropZones
                .map((dz, idx) => {
                    const label = (dz.label || '').replace(/<\/?p>/g, '').trim() || `Vùng ${idx + 1}`;
                    const correctIndices = dz.correctElements || [];
                    const items = correctIndices
                        .map((i) => {
                            const el = elements[i];
                            if (!el) return '';
                            const type = el.type || {};
                            if (type.library?.startsWith('H5P.AdvancedText')) {
                                return type.params?.text?.replace(/<\/?p>/g, '').trim();
                            } else if (type.params?.file?.path) {
                                return `[Ảnh: ${type.params.alt || 'không có mô tả'}]`;
                            }
                            return '';
                        })
                        .filter(Boolean);
                    return items.length ? `<li><strong>${label}:</strong> ${items.join(', ')}</li>` : '';
                })
                .filter(Boolean)
                .join('');
            addResult(`<strong>Kéo các mục vào đúng vị trí:</strong><ul>${mapping}</ul>`);
        }

        const recurseOptions = { ...options, contentUrl };
        (params.interactiveVideo?.assets?.interactions || []).forEach(
            (i) => (results = results.concat(process_h5p_questions(i.action, { ...recurseOptions, duration: i.duration }))),
        );
        if (params.interactiveVideo?.summary?.task)
            results = results.concat(process_h5p_questions(params.interactiveVideo.summary.task, recurseOptions));
        const contents = params.content || params.questions || [];
        if (Array.isArray(contents)) contents.forEach((i) => (results = results.concat(process_h5p_questions(i.content || i, recurseOptions))));
        (params.presentation?.slides || []).forEach((s) =>
            (s.elements || []).forEach((e) => (results = results.concat(process_h5p_questions(e.action, recurseOptions)))),
        );
        (params.chapters || []).forEach((c) =>
            (c.params?.content || []).forEach((b) => (results = results.concat(process_h5p_questions(b.content, recurseOptions)))),
        );
        (params.questionnaireElements || []).forEach((e) => (results = results.concat(process_h5p_questions(e.library || e, recurseOptions))));

        if (results.length === 0 && params && typeof params === 'object') {
            Object.values(params).forEach((val) => {
                if (val && typeof val === 'object' && (val.library || val.params)) {
                    results = results.concat(process_h5p_questions(val, recurseOptions));
                } else if (Array.isArray(val)) {
                    val.forEach((item) => {
                        if (item && typeof item === 'object' && (item.library || item.params)) {
                            results = results.concat(process_h5p_questions(item, recurseOptions));
                        }
                    });
                }
            });
        }

        return results;
    }

    const IMG_LOCAL = /\/image\?path=([^&"]+)&contentId=([^&"]+)"/g;

    function cdnImages(text) {
        return String(text).replace(
            IMG_LOCAL,
            (m, p, c) => `https://h5p.lms360.vn/${c}/${decodeURIComponent(p)}"`,
        );
    }

    function safeHtml(html) {
        return String(html)
            .replace(/<\s*(script|style|iframe|object|embed|link|meta)\b[^>]*>[\s\S]*?<\/\s*\1\s*>/gi, '')
            .replace(/<\s*(script|style|iframe|object|embed|link|meta)\b[^>]*\/?\s*>/gi, '')
            .replace(/<[^>]*>/g, (tag) => tag.replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, ''))
            .replace(/javascript\s*:/gi, '');
    }

    function readable(data) {
        let jsonContent;
        let outerLib = '';
        let contentUrl = '';

        if (data.integration && data.integration.contents) {
            const contentId = Object.keys(data.integration.contents)[0];
            const contentObj = data.integration.contents[contentId];
            jsonContent = JSON.parse(contentObj.jsonContent);

            outerLib = contentObj.library || contentObj.metadata?.contentType || '';
            jsonContent.__containerLibrary = outerLib;
            contentUrl = contentObj.contentUrl || '';
        } else {
            jsonContent = data;
            outerLib = jsonContent.library || '';
            jsonContent.__containerLibrary = outerLib;
            contentUrl = data.contentUrl || '';
        }

        jsonContent.__contentUrl = contentUrl;

        const results = process_h5p_questions(jsonContent).map((r, i) => ({ ...r, index: i + 1 }));

        results.sort((a, b) => {
            const timeA = a.duration?.from ?? Infinity;
            const timeB = b.duration?.from ?? Infinity;
            return timeA - timeB;
        });

        let actualQuestionCount = 0;
        if (typeof jsonContent.poolSize === 'number' && !isNaN(jsonContent.poolSize)) {
            actualQuestionCount = jsonContent.poolSize;
        } else if (Array.isArray(jsonContent.questions)) {
            actualQuestionCount = jsonContent.questions.length;
        } else {
            actualQuestionCount = results.length;
        }

        return {
            success: results.length > 0,
            count: results.length,
            actualQuestionCount,
            questions: results.map((r) => ({ ...r, text: safeHtml(cdnImages(r.text)) })),
        };
    }

    const RID = () => Math.random().toString(36).slice(2, 10);
    const HOST_ID = 'x' + RID();
    const FAB_ID = 'y' + RID();
    const FONT_ID = 'lms-payload-reader-font';
    const THEME_ATTR = 'data-' + RID();
    const HUE_KEY = 'hue';
    const THEME_KEY = 'theme';

    const STORE_KEY =
        '_' +
        [...location.hostname].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7).toString(36);

    function readStore() {
        for (const store of [localStorage, sessionStorage]) {
            try {
                const raw = store.getItem(STORE_KEY);
                if (raw) return JSON.parse(raw);
            } catch (e) {
            }
        }
        return null;
    }

    function load(key) {
        const prefs = readStore();
        return prefs && key in prefs ? prefs[key] : null;
    }

    const esc = (v) =>
        String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
        }[c]));

    const SCHEME = {
        light: {
            'primary': [0.44, 0.155, 0],
            'on-primary': [1, 0, 0],
            'primary-container': [0.92, 0.055, 0],
            'on-primary-container': [0.30, 0.095, 0],
            'secondary-container': [0.93, 0.03, 0],
            'on-secondary-container': [0.33, 0.04, 0],
            'error': [0.50, 0.19, 27],
            'error-container': [0.92, 0.06, 27],
            'on-error-container': [0.35, 0.12, 27],
            'on-surface': [0.23, 0.012, 0],
            'on-surface-variant': [0.44, 0.02, 0],
            'surface-container-lowest': [1, 0, 0],
            'surface-container-low': [0.97, 0.008, 0],
            'surface-container': [0.955, 0.012, 0],
            'surface-container-high': [0.93, 0.015, 0],
            'surface-container-highest': [0.90, 0.018, 0],
            'outline': [0.55, 0.02, 0],
            'outline-variant': [0.83, 0.02, 0],
        },
        dark: {
            'primary': [0.80, 0.12, 0],
            'on-primary': [0.28, 0.08, 0],
            'primary-container': [0.36, 0.11, 0],
            'on-primary-container': [0.92, 0.05, 0],
            'secondary-container': [0.33, 0.03, 0],
            'on-secondary-container': [0.90, 0.03, 0],
            'error': [0.78, 0.14, 27],
            'error-container': [0.37, 0.12, 27],
            'on-error-container': [0.92, 0.06, 27],
            'on-surface': [0.91, 0.012, 0],
            'on-surface-variant': [0.78, 0.02, 0],
            'surface-container-lowest': [0.12, 0.01, 0],
            'surface-container-low': [0.185, 0.013, 0],
            'surface-container': [0.215, 0.015, 0],
            'surface-container-high': [0.255, 0.017, 0],
            'surface-container-highest': [0.30, 0.019, 0],
            'outline': [0.66, 0.02, 0],
            'outline-variant': [0.42, 0.02, 0],
        },
    };

    let hue = 265;
    let theme = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    try {
        const savedHue = load(HUE_KEY);
        const hueValue = savedHue === null ? NaN : Number(savedHue);
        if (Number.isFinite(hueValue) && hueValue >= 0 && hueValue < 360) hue = Math.round(hueValue);

        const savedTheme = load(THEME_KEY);
        if (savedTheme === 'light' || savedTheme === 'dark') theme = savedTheme;
    } catch (e) {

    }

    function themeCss() {
        const block = (mode) =>
            Object.entries(SCHEME[mode])
                .map(([role, [l, c, offset]]) => `--md-sys-color-${role}: oklch(${l} ${c} ${(hue + offset) % 360});`)
                .join(' ');

        return `:host([${THEME_ATTR}="light"]) { color-scheme: light; ${block('light')} }
      :host([${THEME_ATTR}="dark"]) { color-scheme: dark; ${block('dark')} }`;
    }

    function save(key, value) {
        const prefs = readStore() || {};
        prefs[key] = value;

        for (const store of [localStorage, sessionStorage]) {
            try {
                store.setItem(STORE_KEY, JSON.stringify(prefs));
            } catch (e) {

            }
        }
    }

    function paint() {
        const fabHost = document.getElementById(FAB_ID);
        if (fabHost) fabHost.setAttribute(THEME_ATTR, theme);

        const host = document.getElementById(HOST_ID);
        if (!host) return;

        host.setAttribute(THEME_ATTR, theme);
        const root = host.__shadowRoot;
        root.querySelector('#theme').textContent = themeCss();

        const wheel = root.querySelector('.wheel');
        wheel.style.setProperty('--hue', hue);
        wheel.setAttribute('aria-valuenow', String(hue));
    }

    function setHue(value, persist) {
        const next = Math.round((value + 360) % 360);
        if (next === hue) return;

        hue = next;
        paint();
        if (persist) save(HUE_KEY, hue);
    }

    function setTheme(next) {
        theme = next;
        paint();
        save(THEME_KEY, theme);
    }

    const TOKENS = `
    :host {
      --md-font: "Google Sans Flex", "Google Sans", Roboto, system-ui, -apple-system, "Segoe UI", Arial, sans-serif;
      --md-icon-font: "Material Symbols Rounded";
      font-variation-settings: 'ROND' 100;
      font-optical-sizing: auto;

      --sp-1: 4px;
      --sp-2: 8px;
      --sp-3: 12px;
      --sp-4: 16px;
      --sp-8: 32px;

      --md-sys-shape-corner-extra-small: 4px;
      --md-sys-shape-corner-small: 8px;
      --md-sys-shape-corner-medium: 12px;
      --md-sys-shape-corner-large: 16px;
      --md-sys-shape-corner-extra-large: 28px;
      --md-sys-shape-corner-full: 999px;

      --md-sys-elevation-2: 0 1px 2px rgba(0,0,0,.3), 0 2px 6px 2px rgba(0,0,0,.15);
      --md-sys-elevation-3: 0 1px 3px rgba(0,0,0,.3), 0 4px 8px 3px rgba(0,0,0,.15);
      --md-sys-elevation-4: 0 2px 3px rgba(0,0,0,.3), 0 6px 10px 4px rgba(0,0,0,.15);

      --md-sys-motion-standard: cubic-bezier(.2, 0, 0, 1);
      --md-sys-motion-decelerate: cubic-bezier(.05, .7, .1, 1);
      --md-sys-motion-spring: cubic-bezier(.34, 1.4, .64, 1);
      --md-sys-motion-short: 150ms;
      --md-sys-motion-medium: 220ms;
      --md-sys-motion-long: 400ms;

      --md-sys-typescale-label-small: 500 12px/18px var(--md-font);
      --md-sys-typescale-label-medium: 500 13px/18px var(--md-font);
      --md-sys-typescale-label-large: 500 15px/22px var(--md-font);
      --md-sys-typescale-body-small: 400 13px/18px var(--md-font);
      --md-sys-typescale-body-medium: 400 15px/22px var(--md-font);
      --md-sys-typescale-title-medium: 500 18px/26px var(--md-font);
      --md-sys-typescale-title-large: 400 24px/30px var(--md-font);
    }

    .md-icon {
      font-family: var(--md-icon-font) !important;
      font-weight: normal !important;
      font-style: normal !important;
      line-height: 1 !important;
      letter-spacing: normal !important;
      text-transform: none !important;
      white-space: nowrap;
      word-wrap: normal;
      direction: ltr;
      font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 20;
      -webkit-font-smoothing: antialiased;
      user-select: none;
    }
  `;

    const FAB_CSS = `
    * { box-sizing: border-box; }
    .fab {
      width: 56px; height: 56px; padding: 0;
      display: grid; place-items: center;
      border: none; border-radius: var(--md-sys-shape-corner-large);
      background: var(--md-sys-color-primary-container);
      color: var(--md-sys-color-on-primary-container);
      box-shadow: var(--md-sys-elevation-3);
      font: var(--md-sys-typescale-title-large); font-weight: 600;
      font-variation-settings: 'ROND' 100;
      cursor: pointer;
      animation: fab-in var(--md-sys-motion-medium) var(--md-sys-motion-spring) both;
      transition: box-shadow var(--md-sys-motion-short) var(--md-sys-motion-standard),
                  transform var(--md-sys-motion-short) var(--md-sys-motion-spring);
    }
    .fab:hover { box-shadow: var(--md-sys-elevation-4); }
    .fab:active { transform: scale(.94); }
    .fab:focus-visible { outline: 2px solid var(--md-sys-color-primary); outline-offset: 3px; }
    @keyframes fab-in { from { opacity: 0; transform: scale(.6); } }
    @media (prefers-reduced-motion: reduce) { .fab { transition: none; animation: none; } }
  `;

    const CSS = `
    * { box-sizing: border-box; }
    ::selection {
      background: var(--md-sys-color-primary-container);
      color: var(--md-sys-color-on-primary-container);
    }

    .panel {
      width: 456px; max-width: calc(100vw - var(--sp-8));
      padding: 6px 0 var(--sp-4);
      background: var(--md-sys-color-surface-container);
      color: var(--md-sys-color-on-surface);
      border-radius: var(--md-sys-shape-corner-extra-large);
      box-shadow: var(--md-sys-elevation-3);
      font: var(--md-sys-typescale-body-small);
      font-variation-settings: 'ROND' 100;
      animation: panel-in var(--md-sys-motion-long) var(--md-sys-motion-spring) both;
    }
    @keyframes panel-in {
      from { opacity: 0; transform: scale(.94) translateY(8px); }
    }
    .panel.min .body { display: none; }
    .panel.min { padding-bottom: 0; }
    .panel.min .actions { padding-bottom: var(--sp-4); }

    .bar {
      display: flex; align-items: center; gap: var(--sp-2);
      height: 64px; padding: 0 var(--sp-4);
      cursor: move; user-select: none;
    }
    .brand {
      flex: 0 0 auto; width: 44px; height: 44px;
      display: grid; place-items: center;
      border-radius: var(--md-sys-shape-corner-full);
      background: var(--md-sys-color-primary-container);
      color: var(--md-sys-color-on-primary-container);
      font: var(--md-sys-typescale-label-large); font-weight: 700;
    }
    .bar .title {
      flex: 1; min-width: 0;
      font: var(--md-sys-typescale-title-medium); letter-spacing: -.1px;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }

    .icon-btn {
      all: unset; flex: 0 0 auto;
      width: 44px; height: 44px; display: grid; place-items: center;
      border-radius: var(--md-sys-shape-corner-full);
      color: var(--md-sys-color-on-surface-variant);
      font: var(--md-sys-typescale-title-medium);
      cursor: pointer;
      transition: background-color var(--md-sys-motion-short) var(--md-sys-motion-standard);
    }
    .icon-btn:hover { background: color-mix(in srgb, var(--md-sys-color-on-surface) 8%, transparent); }
    .icon-btn:active { background: color-mix(in srgb, var(--md-sys-color-on-surface) 12%, transparent); }
    .icon-btn:focus-visible { outline: 2px solid var(--md-sys-color-primary); outline-offset: 2px; }

    .btn {
      flex: 0 0 auto; min-height: 44px; padding: 0 var(--sp-4);
      display: inline-flex; align-items: center; justify-content: center; gap: var(--sp-2);
      border: 1px solid transparent; border-radius: var(--md-sys-shape-corner-full);
      background: transparent; color: var(--md-sys-color-primary);
      font: var(--md-sys-typescale-label-large);
      cursor: pointer;
      transition: background-color var(--md-sys-motion-short) var(--md-sys-motion-standard),
                  transform var(--md-sys-motion-short) var(--md-sys-motion-spring);
    }
    .btn:hover { background: color-mix(in srgb, var(--md-sys-color-primary) 8%, transparent); }
    .btn:active { background: color-mix(in srgb, var(--md-sys-color-primary) 12%, transparent); transform: scale(.96); }
    .btn:focus-visible { outline: 2px solid var(--md-sys-color-primary); outline-offset: 2px; }
    .btn.tonal { background: var(--md-sys-color-secondary-container); color: var(--md-sys-color-on-secondary-container); }
    .btn.tonal:hover { background: color-mix(in srgb, var(--md-sys-color-on-secondary-container) 8%, var(--md-sys-color-secondary-container)); }
    .btn.outlined { border-color: var(--md-sys-color-outline); }
    .btn.filled { background: var(--md-sys-color-primary); color: var(--md-sys-color-on-primary); }
    .btn.filled:hover { background: color-mix(in srgb, var(--md-sys-color-on-primary) 8%, var(--md-sys-color-primary)); }

    .actions {
      display: flex; align-items: center; gap: var(--sp-2);
      padding: 0 var(--sp-4) var(--sp-2);
    }

    .menu-wrap { position: relative; flex: 0 0 auto; }
    .menu {
      position: absolute; top: calc(100% + var(--sp-2)); left: 0; z-index: 5;
      width: 248px; max-width: calc(100vw - var(--sp-8));
      padding: var(--sp-2);
      border: 1px solid var(--md-sys-color-outline-variant);
      border-radius: var(--md-sys-shape-corner-medium);
      background: var(--md-sys-color-surface-container-high);
      box-shadow: var(--md-sys-elevation-2);
      transform-origin: top left;
      animation: menu-in var(--md-sys-motion-medium) var(--md-sys-motion-spring);
    }
    @keyframes menu-in {
      from { opacity: 0; transform: scale(.9); }
    }
    .menu-block { position: relative; padding: var(--sp-1) var(--sp-3) var(--sp-2); }
    .menu-label {
      display: block;
      font: var(--md-sys-typescale-label-small);
      color: var(--md-sys-color-on-surface-variant);
    }

    .wheel {
      --hue: 265;
      position: relative; width: 112px; height: 112px;
      margin: var(--sp-2) auto var(--sp-1);
      border-radius: var(--md-sys-shape-corner-full);
      background:
        radial-gradient(circle, var(--md-sys-color-surface-container-high) 0 23px, transparent 24px),
        conic-gradient(from 0deg,
          oklch(.70 .16 0), oklch(.70 .16 60), oklch(.70 .16 120),
          oklch(.70 .16 180), oklch(.70 .16 240), oklch(.70 .16 300), oklch(.70 .16 360));
      box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--md-sys-color-on-surface) 12%, transparent);
      cursor: crosshair;
      touch-action: none;
    }
    .wheel:focus-visible { outline: 2px solid var(--md-sys-color-primary); outline-offset: 3px; }
    .wheel-thumb {
      position: absolute; left: 50%; top: 50%;
      width: 18px; height: 18px; margin: -9px;
      border-radius: var(--md-sys-shape-corner-full);
      background: oklch(.66 .16 calc(var(--hue) * 1deg));
      box-shadow: 0 0 0 2px var(--md-sys-color-surface-container-high),
                  0 0 0 3px var(--md-sys-color-outline);
      transform: rotate(calc(var(--hue) * 1deg)) translateY(-41px);
      pointer-events: none;
    }

    .theme-btn {
      position: absolute; right: var(--sp-3); bottom: var(--sp-3);
      width: 34px; height: 34px; padding: 0;
      display: grid; place-items: center;
      border: 1px solid var(--md-sys-color-outline-variant);
      border-radius: var(--md-sys-shape-corner-full);
      background: var(--md-sys-color-surface-container-highest);
      color: var(--md-sys-color-on-surface-variant);
      cursor: pointer;
      transition: background-color var(--md-sys-motion-short) var(--md-sys-motion-standard),
                  transform var(--md-sys-motion-short) var(--md-sys-motion-spring);
    }
    .theme-btn:hover { background: var(--md-sys-color-surface-container-high); }
    .theme-btn:active { transform: scale(.92); }
    .theme-btn:focus-visible { outline: 2px solid var(--md-sys-color-primary); outline-offset: 2px; }
    .theme-btn .md-icon { font-size: 18px; }
    .theme-btn .i-sun { display: none !important; }
    :host([${THEME_ATTR}="dark"]) .theme-btn .i-sun { display: inline-block !important; }
    :host([${THEME_ATTR}="dark"]) .theme-btn .i-moon { display: none !important; }

    .body {
      max-height: min(72vh, 720px);
      overflow: auto;
      padding: 0 var(--sp-4);
      scrollbar-width: thin;
      scrollbar-color: var(--md-sys-color-outline-variant) transparent;
    }

    .part { margin-top: var(--sp-4); }
    .part-head {
      display: flex; align-items: center; gap: var(--sp-2);
      padding: 0 0 var(--sp-2);
      border-bottom: 1px solid var(--md-sys-color-outline-variant);
      font: var(--md-sys-typescale-label-large);
      color: var(--md-sys-color-on-surface-variant);
    }
    .part-head em {
      margin-left: auto; min-height: 28px; padding: 0 var(--sp-2);
      display: inline-flex; align-items: center;
      border-radius: var(--md-sys-shape-corner-small);
      background: var(--md-sys-color-surface-container-high);
      color: var(--md-sys-color-on-surface-variant);
      font: var(--md-sys-typescale-label-medium); font-style: normal;
    }

    .q {
      margin-top: var(--sp-1);
      padding: var(--sp-3);
      border-radius: var(--md-sys-shape-corner-medium);
      animation: q-in var(--md-sys-motion-medium) var(--md-sys-motion-decelerate) both;
      animation-delay: calc(var(--i, 0) * 18ms);
    }
    @keyframes q-in {
      from { opacity: 0; transform: translateY(6px); }
    }
    .q:nth-child(even) { background: var(--md-sys-color-surface-container-low); }
    .q-top { display: flex; align-items: center; gap: var(--sp-2); }
    .num {
      flex: 0 0 auto; min-width: 28px; height: 28px; padding: 0 var(--sp-2);
      display: grid; place-items: center;
      border-radius: var(--md-sys-shape-corner-small);
      background: var(--md-sys-color-surface-container-highest);
      color: var(--md-sys-color-on-surface-variant);
      font: var(--md-sys-typescale-label-medium); font-weight: 700;
    }

    .qhtml { margin-top: var(--sp-2); }
    .qhtml h3 {
      margin: 0 0 var(--sp-2) 0;
      font: var(--md-sys-typescale-body-medium); font-weight: 700;
      color: var(--md-sys-color-on-surface);
      overflow-wrap: anywhere;
    }
    .qhtml h4 { margin: var(--sp-2) 0 var(--sp-1) 0; font: var(--md-sys-typescale-label-large); }
    .qhtml p { margin: var(--sp-1) 0; font: var(--md-sys-typescale-body-medium); color: var(--md-sys-color-on-surface); }
    .qhtml strong { font-weight: 700; }
    .qhtml ul {
      list-style: none; margin: var(--sp-2) 0 0; padding: 0;
      display: flex; flex-direction: column; gap: var(--sp-2);
    }
    .qhtml li {
      margin: 0; padding: var(--sp-2) var(--sp-3);
      border: 1px solid var(--md-sys-color-outline-variant);
      border-radius: var(--md-sys-shape-corner-small);
      background: var(--md-sys-color-surface-container-lowest);
      color: var(--md-sys-color-on-surface-variant);
      font: var(--md-sys-typescale-label-large);
      overflow-wrap: anywhere;
    }
    .qhtml li.highlight {
      border-color: transparent;
      background: var(--md-sys-color-primary-container);
      color: var(--md-sys-color-on-primary-container);
      font-weight: 700;
    }
    .qhtml span.highlight {
      background: var(--md-sys-color-primary-container);
      color: var(--md-sys-color-on-primary-container);
      border-radius: var(--md-sys-shape-corner-small);
      padding: 0 var(--sp-1);
      font-weight: 700;
    }
    .qhtml img { max-width: 100%; border-radius: var(--md-sys-shape-corner-small); margin-bottom: var(--sp-2); }
    .qhtml .image-block { margin-bottom: var(--sp-2); }

    .empty {
      padding: var(--sp-4);
      text-align: center;
      color: var(--md-sys-color-on-surface-variant);
      font: var(--md-sys-typescale-body-medium);
    }
    .empty b { color: var(--md-sys-color-on-surface); font-weight: 600; }

    .status {
      margin-top: var(--sp-2);
      font: var(--md-sys-typescale-body-small);
      color: var(--md-sys-color-on-surface-variant);
      word-break: break-word;
    }
    .status.err { color: var(--md-sys-color-error); }
    .status:empty { margin-top: 0; }

    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after { transition: none !important; animation: none !important; }
    }
  `;

    function ensureFont() {
        if (document.getElementById(FONT_ID)) return;

        const head = document.head || document.documentElement;
        const links = [
            { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
            { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: '' },
            {
                rel: 'stylesheet',
                id: FONT_ID,
                href: 'https://fonts.googleapis.com/css2?family=Google+Sans+Flex:wght,ROND@100..1000,100&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap',
            },
        ];

        for (const attrs of links) {
            const link = document.createElement('link');
            Object.assign(link, attrs);
            head.appendChild(link);
        }
    }

    let booted = false;

    function ensurePanel() {
        let host = document.getElementById(HOST_ID);
        if (host) return host.__shadowRoot;

        document.getElementById(FAB_ID)?.remove();
        ensureFont();

        host = document.createElement('div');
        host.id = HOST_ID;
        host.setAttribute(THEME_ATTR, theme);
        host.style.cssText = 'position:fixed;top:72px;right:24px;z-index:2147483647;';

        const root = host.attachShadow({ mode: 'open' });
        root.innerHTML = `
      <style>${TOKENS}${CSS}</style>
      <style id="theme">${themeCss()}</style>
      <div class="panel">
        <header class="bar">
          <span class="brand" aria-hidden="true">LMS</span>
          <span class="title">LMS360 Hack Next</span>
          <button class="icon-btn" type="button" data-act="min" title="Thu nhỏ" aria-label="Thu nhỏ"><span class="md-icon">remove</span></button>
          <button class="icon-btn" type="button" data-act="close" title="Đóng" aria-label="Đóng"><span class="md-icon">close</span></button>
        </header>
        <div class="actions">
          <button class="btn tonal" type="button" data-act="scan" title="Tải lại danh sách"><span class="md-icon" style="font-size:16px">refresh</span> Tải lại</button>
          <div class="menu-wrap">
            <button class="icon-btn" type="button" data-act="menu" title="Tùy chọn" aria-label="Tùy chọn" aria-haspopup="true" aria-expanded="false"><span class="md-icon">more_horiz</span></button>
            <div class="menu" hidden>
              <div class="menu-block">
                <span class="menu-label">Giao diện</span>
                <div class="wheel" role="slider" tabindex="0" aria-label="Giao diện" aria-valuemin="0" aria-valuemax="360" aria-valuenow="${hue}" style="--hue:${hue}">
                  <span class="wheel-thumb"></span>
                </div>
                <button class="theme-btn" type="button" data-act="theme" title="Chuyển chế độ sáng/tối" aria-label="Chuyển chế độ sáng/tối">
                  <span class="md-icon i-sun">light_mode</span>
                  <span class="md-icon i-moon">dark_mode</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="body" role="region" aria-label="Nội dung"></div>
      </div>`;

        (document.body || document.documentElement).appendChild(host);

        host.__shadowRoot = root;
        panelHost = host;
        wirePanel(host, root);
        makeDraggable(host, root);
        return root;
    }

    function makeDraggable(host, root) {
        const bar = root.querySelector('.bar');
        const panel = root.querySelector('.panel');

        let dragging = false;
        let startX = 0;
        let startY = 0;
        let originX = 0;
        let originY = 0;

        bar.addEventListener('pointerdown', (e) => {
            if (e.target.closest('button')) return;

            const rect = panel.getBoundingClientRect();
            dragging = true;
            startX = e.clientX;
            startY = e.clientY;
            originX = rect.left;
            originY = rect.top;

            host.style.left = `${rect.left}px`;
            host.style.top = `${rect.top}px`;
            host.style.right = 'auto';

            bar.setPointerCapture(e.pointerId);
        });

        bar.addEventListener('pointermove', (e) => {
            if (!dragging) return;

            const x = Math.min(Math.max(0, originX + e.clientX - startX), window.innerWidth - 90);
            const y = Math.min(Math.max(0, originY + e.clientY - startY), window.innerHeight - 40);
            host.style.left = `${x}px`;
            host.style.top = `${y}px`;
        });

        const stop = () => { dragging = false; };
        bar.addEventListener('pointerup', stop);
        bar.addEventListener('pointercancel', stop);
    }

    function wirePanel(host, root) {
        const menu = root.querySelector('.menu');
        const trigger = root.querySelector('[data-act="menu"]');

        let outside = null;

        const closeMenu = () => {
            if (menu.hidden) return;

            menu.hidden = true;
            trigger.setAttribute('aria-expanded', 'false');
            document.removeEventListener('pointerdown', outside, true);
            outside = null;
        };

        const openMenu = () => {
            menu.hidden = false;
            trigger.setAttribute('aria-expanded', 'true');
            outside = (e) => {
                if (!e.composedPath().includes(host)) closeMenu();
            };
            document.addEventListener('pointerdown', outside, true);
        };

        const setMenu = (open) => (open ? openMenu() : closeMenu());

        root.addEventListener('click', async (e) => {
            const actBtn = e.target.closest('button[data-act]');
            if (!actBtn) return;

            const act = actBtn.dataset.act;

            if (act === 'menu') setMenu(menu.hidden);
            else if (act === 'scan') { closeMenu(); render(); }
            else if (act === 'theme') setTheme(theme === 'light' ? 'dark' : 'light');
            else if (act === 'min') root.querySelector('.panel').classList.toggle('min');
            else if (act === 'close') {
                closeMenu();
                host.remove();
                panelHost = null;
                dismissed = true;
                showFab();
            }
        });

        root.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeMenu();
        });

        const wheel = root.querySelector('.wheel');
        let dragging = false;

        const pick = (e) => {
            const rect = wheel.getBoundingClientRect();
            const x = e.clientX - (rect.left + rect.width / 2);
            const y = e.clientY - (rect.top + rect.height / 2);
            setHue((Math.atan2(y, x) * 180) / Math.PI + 90, false);
        };

        wheel.addEventListener('pointerdown', (e) => {
            dragging = true;
            wheel.setPointerCapture(e.pointerId);
            pick(e);
            e.preventDefault();
        });
        wheel.addEventListener('pointermove', (e) => { if (dragging) pick(e); });
        wheel.addEventListener('pointerup', () => { dragging = false; save(HUE_KEY, hue); });
        wheel.addEventListener('pointercancel', () => { dragging = false; save(HUE_KEY, hue); });

        wheel.addEventListener('keydown', (e) => {
            const step = e.shiftKey ? 15 : 5;

            if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') setHue(hue - step, true);
            else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') setHue(hue + step, true);
            else return;

            e.preventDefault();
        });
    }

    function showFab() {
        if (document.getElementById(FAB_ID)) return;

        ensureFont();

        const host = document.createElement('div');
        host.id = FAB_ID;
        host.setAttribute(THEME_ATTR, theme);
        host.style.cssText = 'position:fixed;right:24px;bottom:24px;z-index:2147483647;';

        const root = host.attachShadow({ mode: 'open' });
        root.innerHTML = `<style>${TOKENS}${themeCss()}${FAB_CSS}</style>
      <button class="fab" type="button" title="Mở LMS360 Hack" aria-label="Mở LMS360 Hack">LMS</button>`;

        root.querySelector('.fab').addEventListener('click', () => {
            host.remove();
            dismissed = false;
            ensurePanel();
            render();
        });

        (document.body || document.documentElement).appendChild(host);
    }

    function questionHtml(q, i) {
        return `<div class="q" style="--i:${Math.min(i || 0, 12)}">
      <div class="q-top">
        <span class="num">${esc(String(q.index ?? i + 1))}</span>
      </div>
      <div class="qhtml">${q.text}</div>
    </div>`;
    }

    function render() {
        const root = ensurePanel();
        const body = root.querySelector('.body');

        if (!payload) {
            body.innerHTML =
                `<div class="empty"><b>Không tìm thấy nội dung được hỗ trợ trong trang này!</b><br>`
            return;
        }

        let out;
        try {
            out = readable(payload.data);
        } catch (e) {
            body.innerHTML = `<div class="status err">Lỗi khi đọc dữ liệu: ${esc(e.message)}</div>`;
            return;
        }

        if (!out.questions.length) {
            body.innerHTML =
                `<div class="status err">Dạng nội dung này chưa được hỗ trợ (${esc(payload.id)}).</div>`;
            return;
        }

        let status = `Đã bắt response <b>/h5p/${esc(payload.id)}/play</b> · ${out.count} câu hỏi`;
        if (out.actualQuestionCount && out.actualQuestionCount !== out.count) {
            status += ` (số câu thực tế trong bài: ${out.actualQuestionCount})`;
        }

        body.innerHTML =
            `<div class="status">${status}</div>` +
            `<section class="part">
        <div class="part-head">Đáp án <em>${out.count}</em></div>
        ${out.questions.map((q, i) => questionHtml(q, i)).join('')}
      </section>`;
    }

    function boot() {
        if (booted) return;
        booted = true;

        ensureFont();

        if (payload) {
            ensurePanel();
            render();
        } else {
            showFab();
        }
    }

    patchFetch();
    patchXhr();

    window.addEventListener(
        'keydown',
        (e) => {
            if (!e.ctrlKey || !e.shiftKey) return;
            if (String(e.key).toLowerCase() !== 'u') return;

            e.preventDefault();
            e.stopPropagation();
            dismissed = false;
            ensurePanel();
            render();
        },
        true,
    );

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => setTimeout(boot, 500), { once: true });
    } else {
        setTimeout(boot, 500);
    }
})();
