let h5pZip = null;
let h5pData = {
    json: null,
    content: null,
    files: {}
};

const uploadSection = document.getElementById('uploadSection');
const fileInput = document.getElementById('fileInput');
const viewerSection = document.getElementById('viewerSection');
const alertContainer = document.getElementById('alertContainer');
const h5pJsonEditor = document.getElementById('h5pJsonEditor');
const contentJsonEditor = document.getElementById('contentJsonEditor');
const contentUrlInput = document.getElementById('contentUrl');
const urlLoadingIndicator = document.getElementById('urlLoadingIndicator');
const h5pContainer = document.getElementById('h5p-container');


function getMimeType(path) {
    const ext = path.split('.').pop().toLowerCase();
    const types = {
        'json': 'application/json',
        'js': 'application/javascript',
        'css': 'text/css',
        'png': 'image/png',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'gif': 'image/gif',
        'svg': 'image/svg+xml',
        'mp4': 'video/mp4',
        'mp3': 'audio/mpeg',
        'wav': 'audio/wav',
        'woff': 'font/woff',
        'woff2': 'font/woff2',
        'ttf': 'font/ttf',
        'otf': 'font/otf',
        'html': 'text/html'
    };
    return types[ext] || 'application/octet-stream';
}


let autoSaveTimeout = null;
const AUTO_SAVE_DELAY = 1000;

contentUrlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        downloadFromUrl();
    }
});

function extractContentId(url) {
    try {
        const urlObj = new URL(url);
        const contentId = urlObj.searchParams.get('c');
        if (contentId && /^[0-9a-f]{24}$/i.test(contentId)) {
            return contentId;
        }
        showAlert('URL không hợp lệ!', 'error');
        return null;
    } catch (error) {
        showAlert('URL không đúng định dạng!', 'error');
        return null;
    }
}

async function downloadFromUrl() {
    const url = contentUrlInput.value.trim();

    if (!url) {
        showAlert('Vui lòng điền URL!', 'error');
        return;
    }

    const contentId = extractContentId(url);
    if (!contentId) return;

    urlLoadingIndicator.textContent = "Chờ xíu...";
    urlLoadingIndicator.style.display = 'flex';

    const controller = new AbortController();
    const { signal } = controller;

    let loadedBytes = 0;
    let showProgress = false;

    const loadingTimeout = setTimeout(() => {
        showProgress = true;
        urlLoadingIndicator.textContent = `File hơi bự, đợi tý... (${formatBytes(loadedBytes)})`;
    }, 5000);

    const timeout20s = setTimeout(() => {
        if (loadedBytes === 0) {
            controller.abort();
            showAlert("Kết nối quá chậm, vui lòng thử lại sau", "error");
        }
    }, 20000);

    try {
        // Genius way to get the file
        // My backend is very secure :)
        const response = await fetch(`https://lms360hack-backend.hiennek1.workers.dev?h5p_id=${contentId}`, { signal });

        if (!response.ok) {
            showAlert(`Không thể tải file: ${response.status} ${response.statusText}`, 'error');
            urlLoadingIndicator.style.display = 'none';
            return;
        }

        const reader = response.body.getReader();
        const chunks = [];

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            chunks.push(value);
            loadedBytes += value.length;

            if (showProgress) {
                urlLoadingIndicator.textContent = `File hơi bự, đợi tý... (${formatBytes(loadedBytes)})`;
            }
        }

        const blob = new Blob(chunks, { type: 'application/zip' });

        const tempFile = new File([blob], `h5p-content-${contentId}.h5p`, { type: 'application/zip' });
        await handleFile(tempFile);
    } catch (error) {
        if (error.name === 'AbortError') {
            return;
        }
        showAlert(`Có lỗi trong quá trình tải file: ${error.message}`, 'error');
        console.error('Lỗi:', error);
    } finally {
        clearTimeout(loadingTimeout);
        clearTimeout(timeout20s);
        urlLoadingIndicator.style.display = 'none';
    }
}

function updateSyntaxHighlight() {
    const h5pCode = h5pJsonEditor.textContent;
    if (window.hljs && h5pCode.trim()) {
        try {
            const highlighted = window.hljs.highlight(h5pCode, { language: 'json' }).value;
            h5pJsonEditor.innerHTML = highlighted;
        } catch (e) {
            console.error('Lỗi format:', e);
        }
    }

    const contentCode = contentJsonEditor.textContent;
    if (window.hljs && contentCode.trim()) {
        try {
            const highlighted = window.hljs.highlight(contentCode, { language: 'json' }).value;
            contentJsonEditor.innerHTML = highlighted;
        } catch (e) {
            console.error('Lỗi format:', e);
        }
    }
}

contentJsonEditor.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
        e.preventDefault();
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        const tabNode = document.createTextNode('\t');
        range.insertNode(tabNode);
        range.setStartAfter(tabNode);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
    }
});

h5pJsonEditor.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
        e.preventDefault();
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        const tabNode = document.createTextNode('\t');
        range.insertNode(tabNode);
        range.setStartAfter(tabNode);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
    }
});

function triggerAutoSave() {
    if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
    }
    autoSaveTimeout = setTimeout(() => {
        silentUpdateContent();
    }, AUTO_SAVE_DELAY);
}

function silentUpdateContent() {
    try {
        const h5pText = h5pJsonEditor.textContent;
        if (h5pText.trim()) {
            h5pData.json = JSON.parse(h5pText);
        }

        const contentText = contentJsonEditor.textContent;
        if (contentText.trim()) {
            h5pData.content = JSON.parse(contentText);
        }
        const infoGrid = document.getElementById('infoGrid');
        if (infoGrid && h5pData.json) {
            infoGrid.innerHTML = `
                <div class="info-card">
                    <h3 class="text-xs font-bold uppercase tracking-wider text-primary mb-2">Tiêu đề</h3>
                    <p class="text-slate-900 dark:text-white font-semibold break-words">${h5pData.json.title || 'N/A'}</p>
                </div>
                <div class="info-card">
                    <h3 class="text-xs font-bold uppercase tracking-wider text-primary mb-2">Thư viện chính</h3>
                    <p class="text-slate-900 dark:text-white font-semibold break-words">${h5pData.json.mainLibrary || 'N/A'}</p>
                </div>
                <div class="info-card">
                    <h3 class="text-xs font-bold uppercase tracking-wider text-primary mb-2">Ngôn ngữ</h3>
                    <p class="text-slate-900 dark:text-white font-semibold break-words">${h5pData.json.language || 'N/A'}</p>
                </div>
                <div class="info-card">
                    <h3 class="text-xs font-bold uppercase tracking-wider text-primary mb-2">Kiểu hiển thị</h3>
                    <p class="text-slate-900 dark:text-white font-semibold break-words">${h5pData.json.embedTypes ? h5pData.json.embedTypes.join(', ') : 'N/A'}</p>
                </div>
            `;
        }
    } catch (error) {
        console.log('Json fucked, waiting for input...');
    }
}

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
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
});

uploadSection.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFile(e.target.files[0]);
    }
});

function showAlert(message, type = 'success') {
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

async function handleFile(file) {
    h5pData = {
        json: null,
        content: null,
        files: {}
    };

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

        h5pZip.forEach((path, file) => {
            h5pData.files[path] = file;
        });

        displayH5pData();
        viewerSection.classList.remove('hidden');
        showAlert('File đã load thành công!', 'success');

        h5pContainer.innerHTML = '';
        if (document.querySelector('.advanced-tab[onclick*="preview"]').classList.contains('active')) {
            renderH5P();
        }
    } catch (error) {
        showAlert(`Có lỗi trong quá trình load file: ${error.message}`, 'error');
    }
}

function displayH5pData() {
    const infoGrid = document.getElementById('infoGrid');
    infoGrid.innerHTML = `
        <div class="info-card">
            <h3 class="text-xs font-bold uppercase tracking-wider text-primary mb-2">Tiêu đề</h3>
            <p class="text-slate-900 dark:text-white font-semibold break-words">${h5pData.json.title || 'N/A'}</p>
        </div>
        <div class="info-card">
            <h3 class="text-xs font-bold uppercase tracking-wider text-primary mb-2">Thư viện chính</h3>
            <p class="text-slate-900 dark:text-white font-semibold break-words">${h5pData.json.mainLibrary || 'N/A'}</p>
        </div>
        <div class="info-card">
            <h3 class="text-xs font-bold uppercase tracking-wider text-primary mb-2">Ngôn ngữ</h3>
            <p class="text-slate-900 dark:text-white font-semibold break-words">${h5pData.json.language || 'N/A'}</p>
        </div>
        <div class="info-card">
            <h3 class="text-xs font-bold uppercase tracking-wider text-primary mb-2">Kiểu hiển thị</h3>
            <p class="text-slate-900 dark:text-white font-semibold break-words">${h5pData.json.embedTypes ? h5pData.json.embedTypes.join(', ') : 'N/A'}</p>
        </div>
    `;

    h5pJsonEditor.textContent = JSON.stringify(h5pData.json, null, 2);

    contentJsonEditor.textContent = h5pData.content ?
        JSON.stringify(h5pData.content, null, 2) : '';

    updateSyntaxHighlight();

    const fileList = document.getElementById('fileList');
    fileList.innerHTML = '';

    const priorityFiles = [];
    const regularFiles = [];

    Object.keys(h5pData.files).forEach(path => {
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
        item.className = 'flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-all group';
        item.innerHTML = `
            <span class="font-mono text-sm text-slate-700 dark:text-slate-300 group-hover:text-primary transition-colors">${path}</span>
            <span class="text-xs font-medium text-slate-400 dark:text-white/20">${formatBytes(file._data.uncompressedSize)}</span>
        `;
        fileList.appendChild(item);
    });
}

function switchTab(e, tabName) {
    document.querySelectorAll('.advanced-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.advanced-tab-content').forEach(content => {
        content.classList.remove('block');
        content.classList.add('hidden');
    });

    e.currentTarget.classList.add('active');
    const targetTab = document.getElementById(`${tabName}Tab`);
    targetTab.classList.remove('hidden');
    targetTab.classList.add('block');

    if (tabName === 'preview') {
        renderH5P();
    }
}


function resolvePath(currentPath, relativePath) {
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

async function renderH5P() {
    if (!h5pData.json) return;

    h5pContainer.innerHTML = '<div class="h5p-loading-indicator" style="justify-content: center; margin: 20px;">Đang chuẩn bị preview...</div>';

    try {
        const filesToBlobUrl = {};

        for (const [path, file] of Object.entries(h5pData.files)) {
            if (!file.dir) {
                const data = await file.async('uint8array');
                const blob = new Blob([data], { type: getMimeType(path) });
                filesToBlobUrl[path] = URL.createObjectURL(blob);
            }
        }
        console.log("H5P Asset Keys mapped:", Object.keys(filesToBlobUrl));

        for (const [path, file] of Object.entries(h5pData.files)) {
            if (!file.dir && path.endsWith('.css')) {
                const text = await file.async('string');
                const newText = text.replace(/url\(['"]?([^'"\)]+)['"]?\)/g, (match, url) => {
                    if (url.startsWith('data:') || url.startsWith('http') || url.startsWith('https')) return match;

                    const cleanUrl = url.split('?')[0].split('#')[0];
                    const resolved = resolvePath(path, cleanUrl);

                    if (filesToBlobUrl[resolved]) {
                        return `url('${filesToBlobUrl[resolved]}')`;
                    }
                    return match;
                });

                URL.revokeObjectURL(filesToBlobUrl[path]);
                const newBlob = new Blob([newText], { type: 'text/css' });
                filesToBlobUrl[path] = URL.createObjectURL(newBlob);
            }
        }

        const h5pJsonBlob = new Blob([JSON.stringify(h5pData.json)], { type: 'application/json' });
        filesToBlobUrl['h5p.json'] = URL.createObjectURL(h5pJsonBlob);

        if (h5pData.content) {
            const contentJsonBlob = new Blob([JSON.stringify(h5pData.content)], { type: 'application/json' });
            filesToBlobUrl['content/content.json'] = URL.createObjectURL(contentJsonBlob);
        }

        h5pContainer.innerHTML = '';
        const iframe = document.createElement('iframe');
        iframe.style.width = '100%';
        iframe.style.boxSizing = 'border-box';
        iframe.style.display = 'block';
        iframe.style.height = 'auto';
        h5pContainer.appendChild(iframe);

        const doc = iframe.contentDocument || iframe.contentWindow.document;
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
                <script src="h5p-preview-lib/main.bundle.js"></script>
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

        window.onmessage = (event) => {
            if (event.data.type === 'H5P_RESIZE' && event.source === iframe.contentWindow) {
                iframe.style.height = event.data.height + 'px';
            }
        };

        iframe.onload = () => {
            const options = {
                h5pJsonPath: '/h5p-preview',
                frameJs: 'h5p-preview-lib/frame.bundle.js',
                frameCss: 'h5p-preview-lib/h5p.css',
                embedType: 'div'
            };
            new iframe.contentWindow.H5PStandalone.H5P(doc.getElementById('h5p-iframe-wrapper'), options);
        };

    } catch (error) {
        console.error('H5P Render Error:', error);
        let errorMsg = error.message;
        h5pContainer.innerHTML = 'Lỗi khi hiển thị: ' + errorMsg;
    }
}

function toggleFullscreen() {
    const wrapper = document.getElementById('h5p-preview-wrapper');
    if (!document.fullscreenElement) {
        wrapper.requestFullscreen().catch(err => {
            showAlert(`Không thể bật toàn màn hình: ${err.message}`, 'error');
        });
    } else {
        document.exitFullscreen();
    }
}

function switchSubTab(e, tabName) {
    document.querySelectorAll('.advanced-sub-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.advanced-sub-tab-content').forEach(content => {
        content.classList.remove('block');
        content.classList.add('hidden');
    });

    e.currentTarget.classList.add('active');
    const targetTab = document.getElementById(`${tabName}Tab`);
    targetTab.classList.remove('hidden');
    targetTab.classList.add('block');
}

function updateContent() {
    try {
        const h5pText = h5pJsonEditor.textContent;
        if (h5pText.trim()) {
            h5pData.json = JSON.parse(h5pText);
        }

        const contentText = contentJsonEditor.textContent;
        if (contentText.trim()) {
            h5pData.content = JSON.parse(contentText);
        }

        displayH5pData();
        showAlert('Nội dung đã được lưu (update)!', 'success');
    } catch (error) {
        showAlert(`Có lỗi trong quá trình lưu (update) nội dung: ${error.message}`, 'error');
    }
}

async function downloadModified() {
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
        a.download = `${h5pData.json.title || 'modified'}.h5p`;
        a.click();
        URL.revokeObjectURL(url);

        showAlert('Tải file thành công!', 'success');
    } catch (error) {
        showAlert(`Không thể tải file: ${error.message}`, 'error');
    }
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
