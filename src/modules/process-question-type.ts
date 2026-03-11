import { updateQuestionSearch, registerSearchItems } from './func';

interface BackendQuestion {
    text: string;
}

interface BackendResponse {
    success?: boolean;
    error?: string;
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
    const playerContainer = document.getElementById('player-container');
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

        const backendBase = `https://lms360hack-backend.hiennek1.workers.dev`;

        if (questionId !== lastH5PId) {
            lastH5PId = questionId;

            if (playerContainer) {
                const playerUrl = `${backendBase}/player?h5p_id=${encodeURIComponent(questionId)}`;
                playerContainer.innerHTML = `<iframe src="${playerUrl}" style="width:100%;height:100%;border:none;" allowfullscreen></iframe>`;
            }

            if (container) container.innerHTML = '<div class="text-center p-8"><span class="material-symbols-outlined text-4xl text-primary animate-spin">sync</span></div>';
            if (statusMessage) statusMessage.innerHTML = '';

            const backendUrl = `${backendBase}?id=${encodeURIComponent(questionId)}`;
            fetch(backendUrl)
                .then((res) => {
                    if (res.status === 429) throw new Error('Từ từ, không sập server!');
                    if (!res.ok) {
                        return res.json().then((data: { error?: string }) => {
                            throw new Error(data.error || `HTTP ${res.status}: ${res.statusText}`);
                        }).catch(() => {
                            throw new Error(`HTTP ${res.status}: ${res.statusText}`);
                        });
                    }
                    return res.json();
                })
                .then((data: BackendResponse) => {
                    renderQuestions(data);
                })
                .catch((err: Error) => {
                    console.error(err);
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
