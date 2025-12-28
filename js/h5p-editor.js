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
        showAlert('Hãy điền URL!', 'error');
        return;
    }

    const contentId = extractContentId(url);
    if (!contentId) return;

    urlLoadingIndicator.style.display = 'flex';

    try {
        // Genius way to get the file
        // My backend is very secure :)
        const response = await fetch(`https://lms360hack-backend.hiennek1.workers.dev?h5p_id=${contentId}`);

        if (!response.ok) {
            showAlert(`Không thể tải file: ${response.status} ${response.statusText}`, 'error');
            urlLoadingIndicator.style.display = 'none';
            return;
        }

        const blob = await response.blob();

        const tempFile = new File([blob], `h5p-content-${contentId}.h5p`, { type: 'application/zip' });
        await handleFile(tempFile);
    } catch (error) {
        showAlert(`Có lỗi trong quá trình tải file: ${error.message}`, 'error');
        console.error('Lỗi:', error);
    } finally {
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
            console.error('Highlighting error:', e);
        }
    }

    const contentCode = contentJsonEditor.textContent;
    if (window.hljs && contentCode.trim()) {
        try {
            const highlighted = window.hljs.highlight(contentCode, { language: 'json' }).value;
            contentJsonEditor.innerHTML = highlighted;
        } catch (e) {
            console.error('Highlighting error:', e);
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

    document.getElementById('titleInput').value = h5pData.json.title || '';
    document.getElementById('languageInput').value = h5pData.json.language || '';

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
