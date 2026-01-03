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

if ('serviceWorker' in navigator) {
    if (window.location.protocol === 'file:') {
        console.error('Service Worker không hoạt động với file:// . Vui lòng deploy server.');
    } else {
        navigator.serviceWorker.register('sw.js')
            .then(registration => console.log('Service Worker đã được đăng ký!'))
            .catch(err => console.error('Service Worker không hoạt động:', err));
    }
} else {
    console.error('Service Worker không thể hoạt động trên trình duyệt này.');
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
                <div class="h5p-info-card">
                    <h3>Tiêu đề</h3>
                    <p>${h5pData.json.title || 'N/A'}</p>
                </div>
                <div class="h5p-info-card">
                    <h3>Thư viện chính</h3>
                    <p>${h5pData.json.mainLibrary || 'N/A'}</p>
                </div>
                <div class="h5p-info-card">
                    <h3>Ngôn ngữ</h3>
                    <p>${h5pData.json.language || 'N/A'}</p>
                </div>
                <div class="h5p-info-card">
                    <h3>Kiểu hiển thị</h3>
                    <p>${h5pData.json.embedTypes ? h5pData.json.embedTypes.join(', ') : 'N/A'}</p>
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
    alert.textContent = message;
    alertContainer.appendChild(alert);
    setTimeout(() => alert.remove(), 5000);
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
        viewerSection.classList.add('active');
        showAlert('File đã load thành công!', 'success');

        h5pContainer.innerHTML = '';
        if (document.querySelector('.h5p-tab[onclick*="preview"]').classList.contains('active')) {
            renderH5P();
        }
    } catch (error) {
        showAlert(`Có lỗi trong quá trình load file: ${error.message}`, 'error');
    }
}

function displayH5pData() {
    const infoGrid = document.getElementById('infoGrid');
    infoGrid.innerHTML = `
        <div class="h5p-info-card">
            <h3>Tiêu đề</h3>
            <p>${h5pData.json.title || 'N/A'}</p>
        </div>
        <div class="h5p-info-card">
            <h3>Thư viện chính</h3>
            <p>${h5pData.json.mainLibrary || 'N/A'}</p>
        </div>
        <div class="h5p-info-card">
            <h3>Ngôn ngữ</h3>
            <p>${h5pData.json.language || 'N/A'}</p>
        </div>
        <div class="h5p-info-card">
            <h3>Kiểu hiển thị</h3>
            <p>${h5pData.json.embedTypes ? h5pData.json.embedTypes.join(', ') : 'N/A'}</p>
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
        item.className = 'h5p-file-item';
        item.innerHTML = `
            <span class="h5p-file-name">${path}</span>
            <span class="h5p-file-size">${formatBytes(file._data.uncompressedSize)}</span>
        `;
        fileList.appendChild(item);
    });
}

function switchTab(e, tabName) {
    document.querySelectorAll('.h5p-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.h5p-tab-content').forEach(content => content.classList.remove('active'));

    e.target.classList.add('active');
    document.getElementById(`${tabName}Tab`).classList.add('active');

    if (tabName === 'preview') {
        renderH5P();
    }
}

async function renderH5P() {
    if (!h5pData.json) return;

    h5pContainer.innerHTML = '<div style="padding: 20px; text-align: center;">Đang chuẩn bị preview...</div>';

    try {
        const filesToContent = {};
        for (const [path, file] of Object.entries(h5pData.files)) {
            if (!file.dir) {
                filesToContent[path] = await file.async('uint8array');
            }
        }

        filesToContent['h5p.json'] = new TextEncoder().encode(JSON.stringify(h5pData.json));
        if (h5pData.content) {
            filesToContent['content/content.json'] = new TextEncoder().encode(JSON.stringify(h5pData.content));
        }

        await new Promise((resolve, reject) => {
            const channel = new MessageChannel();
            channel.port1.onmessage = (event) => {
                if (event.data.status === 'ok') resolve();
                else reject(new Error('Không thể set H5P data trong SW'));
            };
            if (!navigator.serviceWorker.controller) {
                reject(new Error('Service Worker không hoạt động. Vui lòng refresh.'));
                return;
            }
            navigator.serviceWorker.controller.postMessage({
                type: 'SET_H5P_DATA',
                files: filesToContent
            }, [channel.port2]);
        });

        h5pContainer.innerHTML = '';
        const iframe = document.createElement('iframe');
        iframe.style.width = '100%';
        iframe.style.boxSizing = 'border-box';
        iframe.style.display = 'block';
        iframe.style.margin = '20px auto';
        iframe.style.height = 'auto';
        iframe.style.border = '3px solid rgba(6, 181, 212, 0.2)';
        iframe.style.borderRadius = '16px';
        iframe.style.background = 'white';
        h5pContainer.appendChild(iframe);

        const doc = iframe.contentDocument || iframe.contentWindow.document;
        doc.open();
        doc.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <script src="https://cdn.jsdelivr.net/npm/h5p-standalone@latest/dist/main.bundle.js"></script>
                <style>
                    body { margin: 0; padding: 15px; background: white; overflow: hidden; font-family: sans-serif; }
                    #h5p-iframe-wrapper { width: 100%; height: auto; min-height: 100px; box-sizing: border-box; }
                    .h5p-container { border: none !important; box-shadow: none !important; }
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
                frameJs: 'https://cdn.jsdelivr.net/npm/h5p-standalone@latest/dist/frame.bundle.js',
                frameCss: 'https://cdn.jsdelivr.net/npm/h5p-standalone@latest/dist/styles/h5p.css'
            };
            new iframe.contentWindow.H5PStandalone.H5P(doc.getElementById('h5p-iframe-wrapper'), options);
        };

    } catch (error) {
        console.error('H5P Render Error:', error);
        let errorMsg = error.message;
        if (window.location.protocol === 'file:') {
            errorMsg = 'H5P Viewer yêu cầu chạy qua HTTP/HTTPS server (ví dụ: Live Server). Không thể chạy trực tiếp từ file (file://).';
        }
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
    document.querySelectorAll('.h5p-sub-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.h5p-sub-tab-content').forEach(content => content.classList.remove('active'));

    e.target.classList.add('active');
    document.getElementById(`${tabName}Tab`).classList.add('active');
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
