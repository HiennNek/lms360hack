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

    try {
        const parsed = new URL(inputUrl);
        const questionId = parsed.searchParams.get('c');

        if (!questionId) {
            alert('Đây không phải URL hợp lệ!');
            hackerButton.disabled = false;
            hackerButton.textContent = 'Lấy đáp án';
            return;
        }

        const backendUrl = `https://lms360hack-backend.hiennek1.workers.dev?id=${encodeURIComponent(questionId)}`;

        fetch(backendUrl)
            .then((res) => {
                if (res.status === 429) {
                    throw new Error('Từ từ, không sập server!');
                }
                if (!res.ok) {
                    return res
                        .json()
                        .then((data: { error?: string }) => {
                            throw new Error(data.error || `HTTP ${res.status}: ${res.statusText}`);
                        })
                        .catch(() => {
                            throw new Error(`HTTP ${res.status}: ${res.statusText}`);
                        });
                }
                return res.json();
            })
            .then((data: BackendResponse) => {
                renderQuestions(data);
                hackerButton.disabled = false;
                hackerButton.textContent = 'Lấy đáp án';
            })
            .catch((err: Error) => {
                console.error(err);
                const errorHTML = `<div class='error-message'>❌ Lỗi: ${err.message}</div>`;
                if (statusMessage) {
                    statusMessage.innerHTML = errorHTML;
                } else {
                    container.innerHTML = errorHTML;
                }
                hackerButton.disabled = false;
                hackerButton.textContent = 'Lấy đáp án';
            });
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

export function initProcessQuestionType(): void {
    initEula();
    initForm();
}
