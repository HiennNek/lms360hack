import { updateQuestionSearch, registerSearchItems } from './func';
import { BACKEND_BASE, authHeaders, getAccessToken, requestLogin } from './lms-auth';

interface BackendQuestion {
    text: string;
}

interface BackendResponse {
    success?: boolean;
    error?: string;
    needsAuth?: boolean;
    questions?: BackendQuestion[];
    actualQuestionCount?: number;
    count?: number;
}

let lastH5PId: string | null = null;

function updateVisibility(): void {
    const isDetailedMode = (document.getElementById('mode-toggle') as HTMLInputElement)?.checked;
    const playerSection = document.getElementById('player-section');
    const basicSection = document.getElementById('basic-section');

    if (isDetailedMode) {
        playerSection?.classList.remove('hidden');
        basicSection?.classList.add('hidden');
    } else {
        playerSection?.classList.add('hidden');
        basicSection?.classList.remove('hidden');
    }
}

function renderQuestions(backendResponse: BackendResponse): void {
    const container = document.getElementById('questions')!;
    const statusMessage = document.getElementById('status-message');

    container.innerHTML = '';
    if (statusMessage) statusMessage.innerHTML = '';

    const questions = backendResponse.questions || [];
    const actualQuestionCount =
        backendResponse.actualQuestionCount || backendResponse.count || questions.length;

    if (questions.length === 0) {
        const errorHTML =
            "<div class='error-message'>❌ Kiểu nội dung này chưa được hỗ trợ. Bạn có thể yêu cầu thêm dạng câu hỏi này qua phần \"Report Bug\"</div>";
        if (statusMessage) {
            statusMessage.innerHTML = errorHTML;
        } else {
            container.innerHTML = errorHTML;
        }
        return;
    }

    if (!backendResponse.success) {
        const errorMsg = backendResponse.error || 'Không thể xử lý câu hỏi.';
        const errorHTML = `<div class='error-message'>❌ ${errorMsg}</div>`;
        if (statusMessage) {
            statusMessage.innerHTML = errorHTML;
        } else {
            container.innerHTML = errorHTML;
        }
        return;
    }

    let message = `Đã tìm thấy tổng cộng ${questions.length} câu hỏi!`;
    if (actualQuestionCount && actualQuestionCount !== questions.length) {
        message += ` ( Số câu hỏi thực tế trong bài: ${actualQuestionCount} )`;
    }

    const successHTML = `<div class="success-message">${message}</div>`;
    if (statusMessage) {
        statusMessage.innerHTML = successHTML;
    } else {
        container.innerHTML = successHTML + '<br>';
    }

    let currentIndex = 0;
    const INITIAL_CHUNK = 20;
    const CHUNK_SIZE = 50;

    const renderChunk = () => {
        const remaining = questions.length - currentIndex;
        if (remaining <= 0) {
            updateQuestionSearch(actualQuestionCount);
            const allElements = container.querySelectorAll('.question');
            registerSearchItems(allElements);
            return;
        }

        const limit = currentIndex === 0 ? INITIAL_CHUNK : CHUNK_SIZE;
        const chunk = questions.slice(currentIndex, currentIndex + limit);
        const fragment = document.createDocumentFragment();

        chunk.forEach((q, idx) => {
            const absoluteIndex = currentIndex + idx;
            const div = document.createElement('div');
            div.className = 'question';

            if (absoluteIndex < 15) {
                const delay = absoluteIndex * 50;
                div.style.animationDelay = `${delay}ms`;
            } else {
                div.style.animation = 'none';
                div.style.opacity = '1';
                div.style.transform = 'translateY(0)';
            }

            div.innerHTML = `<h3>Câu hỏi ${absoluteIndex + 1}:</h3><div class="question-content"><p>${q.text}</p></div>`;
            fragment.appendChild(div);
        });

        container.appendChild(fragment);
        currentIndex += limit;

        setTimeout(renderChunk, 0);
    };

    renderChunk();
}

function renderPlayer(questionId: string): void {
    const playerContainer = document.getElementById('player-container');
    if (!playerContainer) return;

    const params = new URLSearchParams({ h5p_id: questionId });
    const token = getAccessToken();
    if (token) params.set('access_token', token);

    playerContainer.innerHTML = `<iframe src="${BACKEND_BASE}/player?${params.toString()}" style="width:100%;height:100%;border:none;" allowfullscreen></iframe>`;
}

// Gọi backend, nếu bài cần đăng nhập (403) thì hỏi tài khoản rồi thử lại.
async function fetchLesson(questionId: string, token?: string): Promise<BackendResponse> {
    const backendUrl = `${BACKEND_BASE}?id=${encodeURIComponent(questionId)}`;
    const headers = token ? { 'X-Access-Token': token } : authHeaders();
    const res = await fetch(backendUrl, { headers });

    if (res.status === 403) {
        const data = (await res.json().catch(() => null)) as BackendResponse | null;
        if (!data?.needsAuth) {
            throw new Error(data?.error || `HTTP ${res.status}: ${res.statusText}`);
        }
        const newToken = await requestLogin();
        renderPlayer(questionId);
        return fetchLesson(questionId, newToken);
    }

    if (res.status === 429) throw new Error('Từ từ, không sập server!');
    if (!res.ok) {
        const data = (await res.json().catch(() => null)) as BackendResponse | null;
        throw new Error(data?.error || `HTTP ${res.status}: ${res.statusText}`);
    }

    return (await res.json()) as BackendResponse;
}

function hackDaAnswer(): void {
    const linkInput = document.getElementById('link_lms360') as HTMLInputElement;
    const hackerButton = document.getElementById('hecker_button') as HTMLButtonElement;
    const container = document.getElementById('questions')!;
    const statusMessage = document.getElementById('status-message');

    const inputUrl = linkInput.value.trim();
    if (!inputUrl) {
        alert('Tôi không thấy gì trong URL!.');
        return;
    }

    hackerButton.disabled = true;
    hackerButton.textContent = 'Loading...';

    document.getElementById('mode-toggle-container')?.classList.remove('hidden');

    const isDetailedMode = (document.getElementById('mode-toggle') as HTMLInputElement)?.checked;
    const playerSection = document.getElementById('player-section');
    const basicSection = document.getElementById('basic-section');

    try {
        const parsed = new URL(inputUrl);
        const questionId = parsed.searchParams.get('c');

        if (!questionId) {
            alert('Đây không phải URL hợp lệ!');
            hackerButton.disabled = false;
            hackerButton.textContent = 'Lấy đáp án';
            return;
        }

        if (questionId !== lastH5PId) {
            lastH5PId = questionId;

            renderPlayer(questionId);

            if (container) container.innerHTML = '';
            if (statusMessage) statusMessage.innerHTML = '';

            fetchLesson(questionId)
                .then((data: BackendResponse) => {
                    renderQuestions(data);
                })
                .catch((err: Error) => {
                    console.error(err);
                    lastH5PId = null; // cho phep thu lai
                    const errorHTML = `<div class='error-message'>❌ Lỗi: ${err.message}</div>`;
                    if (statusMessage) statusMessage.innerHTML = errorHTML;
                    else container.innerHTML = errorHTML;
                })
                .finally(() => {
                    hackerButton.disabled = false;
                    hackerButton.textContent = 'Lấy đáp án';
                });
        } else {
            hackerButton.disabled = false;
            hackerButton.textContent = 'Lấy đáp án';
        }

        updateVisibility();

        if (isDetailedMode && playerSection) {
            playerSection.classList.remove('hidden');
            playerSection.scrollIntoView({ behavior: 'smooth' });
        } else if (basicSection) {
            basicSection.scrollIntoView({ behavior: 'smooth' });
        }

    } catch {
        alert('Cái link gì đây? (URL không hợp lệ - có thể do thiếu https:// hoặc http://)');
        hackerButton.disabled = false;
        hackerButton.textContent = 'Lấy đáp án';
    }
}

function initEula(): void {
    const modal = document.getElementById('eula-modal');
    const showEula = document.getElementById('show-eula');
    const closeEula = document.getElementById('close-eula');

    const accepted = localStorage.getItem('bro_da_accept_chua_cham_hoi');

    if (!accepted) {
        if (modal) modal.classList.add('show');
    }

    if (showEula && modal) {
        showEula.addEventListener('click', (e) => {
            e.preventDefault();
            modal.classList.add('show');
        });
    }

    if (closeEula && modal) {
        closeEula.addEventListener('click', () => {
            modal.classList.remove('show');
            localStorage.setItem('bro_da_accept_chua_cham_hoi', 'true');
        });
    }
}

function initForm(): void {
    const form = document.getElementById('url-form');

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            hackDaAnswer();
        });
    }

    const linkInput = document.getElementById('link_lms360');
    if (linkInput) {
        linkInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                hackDaAnswer();
            }
        });
    }
}

function initPlayerControls(): void {
    const closeButton = document.getElementById('close-player');
    const playerSection = document.getElementById('player-section');
    const playerContainer = document.getElementById('player-container');
    const refreshButton = document.getElementById('refresh-player');

    if (closeButton && playerSection && playerContainer) {
        closeButton.addEventListener('click', () => {
            playerSection.classList.add('hidden');
            playerContainer.innerHTML = '';
        });
    }

    if (refreshButton && playerContainer) {
        refreshButton.addEventListener('click', () => {
            const iframe = playerContainer.querySelector('iframe');
            if (iframe) {
                iframe.src = iframe.src;
            }
        });
    }

    const modeToggle = document.getElementById('mode-toggle') as HTMLInputElement;
    if (modeToggle) {
        modeToggle.addEventListener('change', () => {
            updateVisibility();
        });
    }

    window.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'h5p-resize' && event.data.height) {
            const iframe = document.querySelector('#player-container iframe') as HTMLIFrameElement;
            if (iframe) {
                iframe.style.height = `${event.data.height}px`;
            }
        }
    });
}

export function initProcessQuestionType(): void {
    initEula();
    initForm();
    initPlayerControls();
}
