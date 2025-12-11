(function () {
  const MIN_SEARCH_QUESTION_COUNT = 10;

  let searchInitialized = false;
  let searchTimeout;

  function initSearch() {
    if (searchInitialized) return;
    searchInitialized = true;

    const searchInput = document.getElementById("question-search");
    const questionsContainer = document.getElementById("questions");

    if (!searchInput || !questionsContainer) {
      return;
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
    const searchContainer = document.getElementById("search-container");
    const searchInput = document.getElementById("question-search");
    const questionsContainer = document.getElementById("questions");

    if (!searchContainer || !searchInput || !questionsContainer) {
      return;
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


