(function () {
  const MIN_SEARCH_QUESTION_COUNT = 10;

  let searchInitialized = false;

  function initSearch() {
    if (searchInitialized) return;
    searchInitialized = true;

    const searchInput = document.getElementById("question-search");
    const questionsContainer = document.getElementById("questions");

    if (!searchInput || !questionsContainer) {
      return;
    }

    searchInput.addEventListener("input", function () {
      const query = searchInput.value.toLowerCase().trim();
      const questionElements = questionsContainer.querySelectorAll(".question");

      questionElements.forEach((el) => {
        const text = el.innerText.toLowerCase();
        if (!query || text.includes(query)) {
          el.style.display = "";
        } else {
          el.style.display = "none";
        }
      });
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
      questionElements.forEach((el) => {
        el.style.display = "";
      });
    }
  };
})();


