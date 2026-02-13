const MIN_SEARCH_QUESTION_COUNT = 2;

let searchInitialized = false;
let searchTimeout: ReturnType<typeof setTimeout>;

function getElements() {
    const searchInput = document.getElementById('question-search') as HTMLInputElement | null;
    const questionsContainer = document.getElementById('questions') as HTMLElement | null;
    const layoutToggle = document.getElementById('layout-toggle') as HTMLButtonElement | null;
    const layoutIcon = document.getElementById('layout-icon') as HTMLElement | null;
    const searchContainer = document.getElementById('search-container') as HTMLElement | null;
    return { searchInput, questionsContainer, layoutToggle, layoutIcon, searchContainer };
}

function applyLayout(layout: string, save = true): void {
    const { questionsContainer, layoutToggle, layoutIcon } = getElements();
    if (!questionsContainer) return;

    if (layout === 'list') {
        questionsContainer.classList.remove('md:grid-cols-2');
        if (layoutIcon) layoutIcon.textContent = 'view_module';
        if (layoutToggle) layoutToggle.title = 'Chuyển sang dạng lưới (2 cột)';
        questionsContainer.setAttribute('data-layout', 'list');
    } else {
        questionsContainer.classList.add('md:grid-cols-2');
        if (layoutIcon) layoutIcon.textContent = 'view_stream';
        if (layoutToggle) layoutToggle.title = 'Chuyển sang dạng danh sách (1 cột)';
        questionsContainer.setAttribute('data-layout', 'grid');
    }
    if (save) {
        localStorage.setItem('questions-layout', layout);
    }
}

function initLayout(): void {
    const savedLayout = localStorage.getItem('questions-layout') || 'grid';
    applyLayout(savedLayout, false);
}

interface SearchItem {
    el: HTMLElement;
    text: string;
}

let searchCache: SearchItem[] = [];

export function registerSearchItems(elements: NodeListOf<Element> | HTMLElement[]): void {
    searchCache = Array.from(elements).map((el) => ({
        el: el as HTMLElement,
        text: el.textContent?.toLowerCase() || '',
    }));
}

function initSearch(): void {
    if (searchInitialized) return;
    searchInitialized = true;

    const { searchInput, questionsContainer, layoutToggle } = getElements();

    if (!searchInput || !questionsContainer) {
        console.warn('Không tìm thấy phần tử tìm kiếm');
        return;
    }

    if (layoutToggle) {
        layoutToggle.addEventListener('click', (e) => {
            e.preventDefault();
            const currentLayout = questionsContainer.getAttribute('data-layout') || 'grid';
            const newLayout = currentLayout === 'grid' ? 'list' : 'grid';
            applyLayout(newLayout);
        });
    }

    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            const query = searchInput.value.toLowerCase().trim();

            requestAnimationFrame(() => {
                searchCache.forEach((item) => {
                    const shouldShow = !query || item.text.includes(query);
                    item.el.style.display = shouldShow ? '' : 'none';
                });
            });
        }, 300);
    });
}

export function updateQuestionSearch(questionCount: number): void {
    const { searchContainer, searchInput, questionsContainer } = getElements();

    if (!searchContainer || !searchInput || !questionsContainer) {
        return;
    }

    if (questionCount === 1) {
        applyLayout('list', false);
    } else {
        initLayout();
    }

    if (questionCount >= MIN_SEARCH_QUESTION_COUNT) {
        searchContainer.style.display = '';
        initSearch();
    } else {
        searchContainer.style.display = 'none';
        searchInput.value = '';

        const questionElements = questionsContainer.querySelectorAll('.question');
        requestAnimationFrame(() => {
            questionElements.forEach((el) => {
                (el as HTMLElement).style.display = '';
            });
        });
    }
}
