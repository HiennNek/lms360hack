// Typescript thật khó hiểu -_-

import JSZip from 'jszip';
import hljs from 'highlight.js/lib/core';
import json from 'highlight.js/lib/languages/json';

hljs.registerLanguage('json', json);

import h5pMainBundleUrl from '../h5p-preview-lib/main.bundle.js?url';
import h5pFrameBundleUrl from '../h5p-preview-lib/frame.bundle.js?url';
import h5pCssUrl from '../h5p-preview-lib/h5p.css?url';

declare global {
    interface Window {
        H5PStandalone?: {
            H5P: new (element: HTMLElement, options: Record<string, string>) => void;
        };
        H5P_PREVIEW_FILES?: Record<string, string>;
    }
}

interface H5PData {
    json: Record<string, unknown> | null;
    content: Record<string, unknown> | null;
    files: Record<string, JSZip.JSZipObject>;
}

let h5pZip: JSZip | null = null;
let h5pData: H5PData = { json: null, content: null, files: {} };
let autoSaveTimeout: ReturnType<typeof setTimeout> | null = null;
const AUTO_SAVE_DELAY = 1000;

let uploadSection: HTMLElement;
let fileInput: HTMLInputElement;
let viewerSection: HTMLElement;
let alertContainer: HTMLElement;
let h5pJsonEditor: HTMLElement;
let contentJsonEditor: HTMLElement;
let contentUrlInput: HTMLInputElement;
let urlLoadingIndicator: HTMLElement;
let h5pContainer: HTMLElement;

function getMimeType(path: string): string {
    const ext = path.split('.').pop()?.toLowerCase() || '';
    const types: Record<string, string> = {
        json: 'application/json',
        js: 'application/javascript',
        css: 'text/css',
        png: 'image/png',
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        gif: 'image/gif',
        svg: 'image/svg+xml',
        mp4: 'video/mp4',
        mp3: 'audio/mpeg',
        wav: 'audio/wav',
        woff: 'font/woff',
        woff2: 'font/woff2',
        ttf: 'font/ttf',
        otf: 'font/otf',
        html: 'text/html',
    };
    return types[ext] || 'application/octet-stream';
}

function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

function resolvePath(currentPath: string, relativePath: string): string {
    const stack = currentPath.split('/');
    stack.pop();
    const parts = relativePath.split('/');
    for (const part of parts) {
        if (part === '.') continue;
        if (part === '..') stack.pop();
        else stack.push(part);
    }
    return stack.join('/');
}


function showAlert(message: string, type: 'success' | 'error' = 'success'): void {
    const alert = document.createElement('div');
    alert.className = `h5p-alert h5p-alert-${type}`;

    const iconName = type === 'success' ? 'check_circle' : 'error';
    alert.innerHTML = `
    <span class="material-symbols-outlined">${iconName}</span>
    <span>${message}</span>
  `;
    alertContainer.appendChild(alert);
    setTimeout(() => {
        alert.classList.add('opacity-0', 'translate-y-2');
        setTimeout(() => alert.remove(), 300);
    }, 5000);
}

function extractContentId(url: string): string | null {
    try {
        const urlObj = new URL(url);
        const contentId = urlObj.searchParams.get('c');
        if (contentId && /^[0-9a-f]{24}$/i.test(contentId)) {
            return contentId;
        }
        showAlert('URL không hợp lệ!', 'error');
        return null;
    } catch {
        showAlert('URL không đúng định dạng!', 'error');
        return null;
    }
}

async function fetchH5P(contentId: string): Promise<Blob | null> {
    urlLoadingIndicator.textContent = 'Chờ xíu...';
    urlLoadingIndicator.style.display = 'flex';

    const controller = new AbortController();
    const { signal: _signal } = controller;

    let loadedBytes = 0;
    let showProgress = false;

    const loadingTimeout = setTimeout(() => {
        showProgress = true;
        urlLoadingIndicator.textContent = `File hơi bự, đợi tý... (${formatBytes(loadedBytes)})`;
    }, 5000);

    const timeout20s = setTimeout(() => {
        if (loadedBytes === 0) {
            controller.abort();
            showAlert('Kết nối quá chậm, vui lòng thử lại sau', 'error');
        }
    }, 20000);

    try {
        const response = await fetch(
            `https://lms360hack-backend.hiennek1.workers.dev?h5p_id=${contentId}`
        );

        if (!response.ok) {
            showAlert(`Không thể tải file: ${response.status} ${response.statusText}`, 'error');
            return null;
        }

        const reader = response.body!.getReader();
        const chunks: Uint8Array[] = [];

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            chunks.push(value);
            loadedBytes += value.length;

            if (showProgress) {
                urlLoadingIndicator.textContent = `File hơi bự, đợi tý... (${formatBytes(loadedBytes)})`;
            }
        }

        return new Blob(chunks as unknown as BlobPart[], { type: 'application/zip' });
    } catch (error: unknown) {
        if (error instanceof DOMException && error.name === 'AbortError') {
            return null;
        }
        const msg = error instanceof Error ? error.message : String(error);
        showAlert(`Có lỗi trong quá trình tải file: ${msg}`, 'error');
        console.error('Lỗi:', error);
        return null;
    } finally {
        clearTimeout(loadingTimeout);
        clearTimeout(timeout20s);
        urlLoadingIndicator.style.display = 'none';
    }
}

async function downloadFromUrl(): Promise<void> {
    const url = contentUrlInput.value.trim();

    if (!url) {
        showAlert('Vui lòng điền URL!', 'error');
        return;
    }

    const contentId = extractContentId(url);
    if (!contentId) return;

    const blob = await fetchH5P(contentId);
    if (!blob) return;

    const tempFile = new File([blob], `h5p-content-${contentId}.h5p`, {
        type: 'application/zip',
    });
    await handleFile(tempFile);
}

async function downloadOnlyFromUrl(): Promise<void> {
    const url = contentUrlInput.value.trim();

    if (!url) {
        showAlert('Vui lòng điền URL!', 'error');
        return;
    }

    const contentId = extractContentId(url);
    if (!contentId) return;

    const blob = await fetchH5P(contentId);
    if (!blob) return;

    const downloadUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `h5p-content-${contentId}.h5p`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(downloadUrl);
    showAlert('Bắt đầu tải xuống...', 'success');
}


function updateSyntaxHighlight(): void {
    const h5pCode = h5pJsonEditor.textContent || '';
    if (h5pCode.trim()) {
        try {
            const highlighted = hljs.highlight(h5pCode, { language: 'json' }).value;
            h5pJsonEditor.innerHTML = highlighted;
        } catch (e) {
            console.error('Lỗi format:', e);
        }
    }

    const contentCode = contentJsonEditor.textContent || '';
    if (contentCode.trim()) {
        try {
            const highlighted = hljs.highlight(contentCode, { language: 'json' }).value;
            contentJsonEditor.innerHTML = highlighted;
        } catch (e) {
            console.error('Lỗi format:', e);
        }
    }
}

function triggerAutoSave(): void {
    if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
    }
    autoSaveTimeout = setTimeout(() => {
        silentUpdateContent();
    }, AUTO_SAVE_DELAY);
}

function silentUpdateContent(): void {
    try {
        const h5pText = h5pJsonEditor.textContent || '';
        if (h5pText.trim()) {
            h5pData.json = JSON.parse(h5pText);
        }

        const contentText = contentJsonEditor.textContent || '';
        if (contentText.trim()) {
            h5pData.content = JSON.parse(contentText);
        }

        const infoGrid = document.getElementById('infoGrid');
        if (infoGrid && h5pData.json) {
            const json = h5pData.json as Record<string, unknown>;
            infoGrid.innerHTML = `
        <div class="info-card">
          <h3 class="text-xs font-bold uppercase tracking-wider text-primary mb-2">Tiêu đề</h3>
          <p class="text-slate-900 dark:text-white font-semibold break-words">${(json.title as string) || 'N/A'}</p>
        </div>
        <div class="info-card">
          <h3 class="text-xs font-bold uppercase tracking-wider text-primary mb-2">Thư viện chính</h3>
          <p class="text-slate-900 dark:text-white font-semibold break-words">${(json.mainLibrary as string) || 'N/A'}</p>
        </div>
        <div class="info-card">
          <h3 class="text-xs font-bold uppercase tracking-wider text-primary mb-2">Ngôn ngữ</h3>
          <p class="text-slate-900 dark:text-white font-semibold break-words">${(json.language as string) || 'N/A'}</p>
        </div>
        <div class="info-card">
          <h3 class="text-xs font-bold uppercase tracking-wider text-primary mb-2">Kiểu hiển thị</h3>
          <p class="text-slate-900 dark:text-white font-semibold break-words">${json.embedTypes ? (json.embedTypes as string[]).join(', ') : 'N/A'}</p>
        </div>
      `;
        }
    } catch {
        console.log('Có lỗi xảy ra khi hiển thị H5P data');
    }
}

async function handleFile(file: File): Promise<void> {
    h5pData = { json: null, content: null, files: {} };

    if (!file.name.endsWith('.h5p')) {
        showAlert('File không đúng định dạng', 'error');
        return;
    }

    try {
        const zip = new JSZip();
        h5pZip = await zip.loadAsync(file);

        const h5pJsonFile = h5pZip.file('h5p.json');
        if (!h5pJsonFile) {
            showAlert('Không tìm thấy h5p.json', 'error');
            return;
        }
        h5pData.json = JSON.parse(await h5pJsonFile.async('text'));

        const contentJsonFile = h5pZip.file('content/content.json');
        if (contentJsonFile) {
            h5pData.content = JSON.parse(await contentJsonFile.async('text'));
        }

        h5pZip.forEach((path, zipFile) => {
            h5pData.files[path] = zipFile;
        });

        displayH5pData();
        viewerSection.classList.remove('hidden');
        showAlert('File đã load thành công!', 'success');

        h5pContainer.innerHTML = '';
        if (document.querySelector('.advanced-tab[onclick*="preview"]')?.classList.contains('active')) {
            renderH5P();
        }
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error);
        showAlert(`Có lỗi trong quá trình load file: ${msg}`, 'error');
    }
}

function displayH5pData(): void {
    const json = h5pData.json as Record<string, unknown>;
    const infoGrid = document.getElementById('infoGrid')!;
    infoGrid.innerHTML = `
    <div class="info-card">
      <h3 class="text-xs font-bold uppercase tracking-wider text-primary mb-2">Tiêu đề</h3>
      <p class="text-slate-900 dark:text-white font-semibold break-words">${(json.title as string) || 'N/A'}</p>
    </div>
    <div class="info-card">
      <h3 class="text-xs font-bold uppercase tracking-wider text-primary mb-2">Thư viện chính</h3>
      <p class="text-slate-900 dark:text-white font-semibold break-words">${(json.mainLibrary as string) || 'N/A'}</p>
    </div>
    <div class="info-card">
      <h3 class="text-xs font-bold uppercase tracking-wider text-primary mb-2">Ngôn ngữ</h3>
      <p class="text-slate-900 dark:text-white font-semibold break-words">${(json.language as string) || 'N/A'}</p>
    </div>
    <div class="info-card">
      <h3 class="text-xs font-bold uppercase tracking-wider text-primary mb-2">Kiểu hiển thị</h3>
      <p class="text-slate-900 dark:text-white font-semibold break-words">${json.embedTypes ? (json.embedTypes as string[]).join(', ') : 'N/A'}</p>
    </div>
  `;

    h5pJsonEditor.textContent = JSON.stringify(h5pData.json, null, 2);
    contentJsonEditor.textContent = h5pData.content ? JSON.stringify(h5pData.content, null, 2) : '';

    updateSyntaxHighlight();

    const fileList = document.getElementById('fileList')!;
    fileList.innerHTML = '';

    const priorityFiles: { path: string; file: JSZip.JSZipObject }[] = [];
    const regularFiles: { path: string; file: JSZip.JSZipObject }[] = [];

    Object.keys(h5pData.files).forEach((path) => {
        const file = h5pData.files[path];
        if (!file.dir) {
            if (path === 'h5p.json' || path === 'content/content.json') {
                priorityFiles.push({ path, file });
            } else {
                regularFiles.push({ path, file });
            }
        }
    });

    regularFiles.sort((a, b) => a.path.localeCompare(b.path));

    const sortedFiles = [...priorityFiles, ...regularFiles];

    sortedFiles.forEach(({ path, file }) => {
        const item = document.createElement('div');
        item.className =
            'flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-all group';

        const fileData = file as unknown as { _data?: { uncompressedSize?: number } };
        const size = fileData._data?.uncompressedSize ?? 0;

        item.innerHTML = `
      <span class="font-mono text-sm text-slate-700 dark:text-slate-300 group-hover:text-primary transition-colors">${path}</span>
      <span class="text-xs font-medium text-slate-400 dark:text-white/20">${formatBytes(size)}</span>
    `;
        fileList.appendChild(item);
    });
}

function switchTab(e: Event, tabName: string): void {
    document.querySelectorAll('.advanced-tab').forEach((tab) => tab.classList.remove('active'));
    document.querySelectorAll('.advanced-tab-content').forEach((content) => {
        content.classList.remove('block');
        content.classList.add('hidden');
    });

    (e.currentTarget as HTMLElement).classList.add('active');
    const targetTab = document.getElementById(`${tabName}Tab`)!;
    targetTab.classList.remove('hidden');
    targetTab.classList.add('block');

    if (tabName === 'preview') {
        renderH5P();
    }
}

function switchSubTab(e: Event, tabName: string): void {
    document.querySelectorAll('.advanced-sub-tab').forEach((tab) => tab.classList.remove('active'));
    document.querySelectorAll('.advanced-sub-tab-content').forEach((content) => {
        content.classList.remove('block');
        content.classList.add('hidden');
    });

    (e.currentTarget as HTMLElement).classList.add('active');
    const targetTab = document.getElementById(`${tabName}Tab`)!;
    targetTab.classList.remove('hidden');
    targetTab.classList.add('block');
}

async function renderH5P(): Promise<void> {
    if (!h5pData.json) return;

    h5pContainer.innerHTML =
        '<div class="h5p-loading-indicator" style="justify-content: center; margin: 20px;">Đang chuẩn bị preview...</div>';

    try {
        const filesToBlobUrl: Record<string, string> = {};

        for (const [path, file] of Object.entries(h5pData.files)) {
            if (!file.dir) {
                const data = await file.async('uint8array');
                const blob = new Blob([data as unknown as BlobPart], { type: getMimeType(path) });
                filesToBlobUrl[path] = URL.createObjectURL(blob);
            }
        }

        for (const [path, file] of Object.entries(h5pData.files)) {
            if (!file.dir && path.endsWith('.css')) {
                const text = await file.async('string');
                const newText = text.replace(
                    /url\(['"]?([^'")\s]+)['"]?\)/g,
                    (match: string, url: string) => {
                        if (url.startsWith('data:') || url.startsWith('http') || url.startsWith('https'))
                            return match;

                        const cleanUrl = url.split('?')[0].split('#')[0];
                        const resolved = resolvePath(path, cleanUrl);

                        if (filesToBlobUrl[resolved]) {
                            return `url('${filesToBlobUrl[resolved]}')`;
                        }
                        return match;
                    }
                );

                URL.revokeObjectURL(filesToBlobUrl[path]);
                const newBlob = new Blob([newText], { type: 'text/css' });
                filesToBlobUrl[path] = URL.createObjectURL(newBlob);
            }
        }

        const h5pJsonBlob = new Blob([JSON.stringify(h5pData.json)], { type: 'application/json' });
        filesToBlobUrl['h5p.json'] = URL.createObjectURL(h5pJsonBlob);

        if (h5pData.content) {
            const contentJsonBlob = new Blob([JSON.stringify(h5pData.content)], {
                type: 'application/json',
            });
            filesToBlobUrl['content/content.json'] = URL.createObjectURL(contentJsonBlob);
        }

        h5pContainer.innerHTML = '';
        const iframe = document.createElement('iframe');
        iframe.style.width = '100%';
        iframe.style.boxSizing = 'border-box';
        iframe.style.display = 'block';
        iframe.style.height = 'auto';
        h5pContainer.appendChild(iframe);

        const doc = iframe.contentDocument || iframe.contentWindow!.document;
        doc.open();
        doc.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script>
          window.H5P_PREVIEW_FILES = ${JSON.stringify(filesToBlobUrl)};
        </script>
        <script src="${h5pMainBundleUrl}"></script>
        <style>
          body { margin: 0; padding: 0; background: transparent; overflow: hidden; font-family: sans-serif; }
          #h5p-iframe-wrapper { width: 100%; height: auto; min-height: 100px; box-sizing: border-box; }
          .h5p-container { border: none !important; box-shadow: none !important; border-radius: 0 !important; }
        </style>
      </head>
      <body>
        <div id="h5p-iframe-wrapper"></div>
        <script>
          const resizeObserver = new ResizeObserver(entries => {
            window.parent.postMessage({
              type: 'H5P_RESIZE',
              height: document.body.scrollHeight
            }, '*');
          });
          resizeObserver.observe(document.body);
        </script>
      </body>
      </html>
    `);
        doc.close();

        window.onmessage = (event: MessageEvent) => {
            if (
                event.data.type === 'H5P_RESIZE' &&
                event.source === iframe.contentWindow
            ) {
                iframe.style.height = event.data.height + 'px';
            }
        };

        iframe.onload = () => {
            const iframeWindow = iframe.contentWindow as Window;
            const options = {
                h5pJsonPath: '/h5p-preview',
                frameJs: h5pFrameBundleUrl,
                frameCss: h5pCssUrl,
                embedType: 'div',
            };
            new iframeWindow.H5PStandalone!.H5P(doc.getElementById('h5p-iframe-wrapper')!, options);
        };
    } catch (error) {
        console.error('H5P Render Error:', error);
        const errorMsg = error instanceof Error ? error.message : String(error);
        h5pContainer.innerHTML = 'Lỗi khi hiển thị: ' + errorMsg;
    }
}

function toggleFullscreen(): void {
    const wrapper = document.getElementById('h5p-preview-wrapper')!;
    if (!document.fullscreenElement) {
        wrapper.requestFullscreen().catch((err) => {
            showAlert(`Không thể bật toàn màn hình: ${err.message}`, 'error');
        });
    } else {
        document.exitFullscreen();
    }
}

async function downloadModified(): Promise<void> {
    try {
        const zip = new JSZip();

        zip.file('h5p.json', JSON.stringify(h5pData.json, null, 2));

        if (h5pData.content) {
            zip.file('content/content.json', JSON.stringify(h5pData.content, null, 2));
        }

        for (const [path, file] of Object.entries(h5pData.files)) {
            if (path !== 'h5p.json' && path !== 'content/content.json') {
                const data = await file.async('uint8array');
                zip.file(path, data);
            }
        }

        const blob = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const json = h5pData.json as Record<string, unknown>;
        a.download = `${(json.title as string) || 'modified'}.h5p`;
        a.click();
        URL.revokeObjectURL(url);

        showAlert('Tải file thành công!', 'success');
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error);
        showAlert(`Không thể tải file: ${msg}`, 'error');
    }
}

function handleTabKey(e: KeyboardEvent): void {
    if (e.key === 'Tab') {
        e.preventDefault();
        const selection = window.getSelection()!;
        const range = selection.getRangeAt(0);
        const tabNode = document.createTextNode('\t');
        range.insertNode(tabNode);
        range.setStartAfter(tabNode);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
    }
}

export function initH5PEditor(): void {
    uploadSection = document.getElementById('uploadSection')!;
    fileInput = document.getElementById('fileInput') as HTMLInputElement;
    viewerSection = document.getElementById('viewerSection')!;
    alertContainer = document.getElementById('alertContainer')!;
    h5pJsonEditor = document.getElementById('h5pJsonEditor')!;
    contentJsonEditor = document.getElementById('contentJsonEditor')!;
    contentUrlInput = document.getElementById('contentUrl') as HTMLInputElement;
    urlLoadingIndicator = document.getElementById('urlLoadingIndicator')!;
    h5pContainer = document.getElementById('h5p-container')!;

    contentUrlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            downloadFromUrl();
        }
    });

    contentJsonEditor.addEventListener('keydown', handleTabKey);
    h5pJsonEditor.addEventListener('keydown', handleTabKey);

    contentJsonEditor.addEventListener('input', triggerAutoSave);
    h5pJsonEditor.addEventListener('input', triggerAutoSave);

    uploadSection.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadSection.classList.add('dragover');
    });

    uploadSection.addEventListener('dragleave', () => {
        uploadSection.classList.remove('dragover');
    });

    uploadSection.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadSection.classList.remove('dragover');
        const files = e.dataTransfer?.files;
        if (files && files.length > 0) {
            handleFile(files[0]);
        }
    });

    uploadSection.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        const target = e.target as HTMLInputElement;
        if (target.files && target.files.length > 0) {
            handleFile(target.files[0]);
        }
    });

    (window as unknown as Record<string, unknown>).downloadFromUrl = downloadFromUrl;
    (window as unknown as Record<string, unknown>).downloadOnlyFromUrl = downloadOnlyFromUrl;
    (window as unknown as Record<string, unknown>).switchTab = switchTab;

    (window as unknown as Record<string, unknown>).switchSubTab = switchSubTab;
    (window as unknown as Record<string, unknown>).downloadModified = downloadModified;
    (window as unknown as Record<string, unknown>).toggleFullscreen = toggleFullscreen;
}
