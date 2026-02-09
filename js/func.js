(function () {
  const MIN_SEARCH_QUESTION_COUNT = 2;

  let searchInitialized = false;
  let searchTimeout;

  function getElements() {
    const searchInput = document.getElementById("question-search");
    const questionsContainer = document.getElementById("questions");
    const layoutToggle = document.getElementById("layout-toggle");
    const layoutIcon = document.getElementById("layout-icon");
    const searchContainer = document.getElementById("search-container");
    return { searchInput, questionsContainer, layoutToggle, layoutIcon, searchContainer };
  }

  const applyLayout = (layout, save = true) => {
    const { questionsContainer, layoutToggle, layoutIcon } = getElements();
    if (!questionsContainer) return;

    console.log("Applying layout:", layout);
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
  };

  const initLayout = () => {
    const savedLayout = localStorage.getItem('questions-layout') || 'grid';
    console.log("Initializing layout to:", savedLayout);
    applyLayout(savedLayout, false);
  };

  function initSearch() {
    if (searchInitialized) return;
    searchInitialized = true;

    const { searchInput, questionsContainer, layoutToggle } = getElements();

    if (!searchInput || !questionsContainer) {
      console.warn("Search elements not found");
      return;
    }

    if (layoutToggle) {
      layoutToggle.addEventListener('click', (e) => {
        e.preventDefault();
        const currentLayout = questionsContainer.getAttribute('data-layout') || 'grid';
        const newLayout = currentLayout === 'grid' ? 'list' : 'grid';
        console.log("Toggling layout from", currentLayout, "to", newLayout);
        applyLayout(newLayout);
      });
    }

    searchInput.addEventListener("input", function () {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        const query = searchInput.value.toLowerCase().trim();
        const questionElements = questionsContainer.querySelectorAll(".question");

        requestAnimationFrame(() => {
          questionElements.forEach((el) => {
            const text = el.textContent.toLowerCase();
            el.style.display = !query || text.includes(query) ? "" : "none";
          });
        });
      }, 150);
    });
  }

  window.updateQuestionSearch = function (questionCount) {
    const { searchContainer, searchInput, questionsContainer } = getElements();

    if (!searchContainer || !searchInput || !questionsContainer) {
      return;
    }

    // Sử dụng layout là list nếu như chỉ có 1 quest
    if (questionCount === 1) {
      applyLayout('list', false);
    } else {
      initLayout();
    }

    if (questionCount >= MIN_SEARCH_QUESTION_COUNT) {
      searchContainer.style.display = "";
      initSearch();
    } else {
      searchContainer.style.display = "none";
      searchInput.value = "";

      const questionElements = questionsContainer.querySelectorAll(".question");
      requestAnimationFrame(() => {
        questionElements.forEach((el) => {
          el.style.display = "";
        });
      });
    }
  };
})();
