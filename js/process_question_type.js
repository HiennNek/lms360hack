const link_lms360 = document.getElementById("link_lms360");
const hecker_button = document.getElementById("hecker_button");
const container = document.getElementById("questions");
const status_message = document.getElementById("status-message");

// Update v4.2: Đã sử dụng backend mới 
// Update v4.3: đã chuyển toàn bộ thuật toán xử lý câu hỏi sang backend
function render_questions(backendResponse) {
  container.innerHTML = "";
  if (status_message) status_message.innerHTML = "";

  const questions = backendResponse.questions || [];
  const actualQuestionCount = backendResponse.actualQuestionCount || backendResponse.count || questions.length;

  if (questions.length === 0) {
    const errorHTML = "<div class='error-message'>❌ Kiểu nội dung này chưa được hỗ trợ. Bạn có thể yêu cầu thêm dạng câu hỏi này qua phần \"Report Bug\"</div>";
    if (status_message) {
      status_message.innerHTML = errorHTML;
    } else {
      container.innerHTML = errorHTML;
    }
    return;
  }

  if (!backendResponse.success) {
    const errorMsg = backendResponse.error || "Không thể xử lý câu hỏi.";
    const errorHTML = `<div class='error-message'>❌ ${errorMsg}</div>`;
    if (status_message) {
      status_message.innerHTML = errorHTML;
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
  if (status_message) {
    status_message.innerHTML = successHTML;
  } else {
    container.innerHTML = successHTML + "<br>";
  }

  const fragment = document.createDocumentFragment();
  questions.forEach((q, index) => {
    const div = document.createElement("div");
    div.className = "question";
    const delay = Math.min(index, 15) * 50;
    div.style.animationDelay = `${delay}ms`;
    div.innerHTML = `<h3>Câu hỏi ${index + 1}:</h3><div class="question-content"><p>${q.text}</p></div>`;
    fragment.appendChild(div);
  });
  container.appendChild(fragment);

  if (window.updateQuestionSearch) {
    window.updateQuestionSearch(actualQuestionCount);
  }
}

function hack_da_answer() {
  const inputUrl = link_lms360.value.trim();
  if (!inputUrl) {
    alert("Tôi không thấy gì trong URL!.");
    return;
  }

  hecker_button.disabled = true;
  hecker_button.textContent = "Loading...";

  try {
    const parsed = new URL(inputUrl);
    const questionId = parsed.searchParams.get("c");

    if (!questionId) {
      alert("Đây không phải URL hợp lệ!");
      hecker_button.disabled = false;
      hecker_button.textContent = "Lấy đáp án";
      return;
    }

    const backendUrl = `https://lms360hack-backend.hiennek1.workers.dev?id=${encodeURIComponent(questionId)}`;

    fetch(backendUrl)
      .then(res => {
        if (res.status === 429) {
          throw new Error("Từ từ, không sập server!");
        }
        if (!res.ok) {
          return res.json().then(data => {
            throw new Error(data.error || `HTTP ${res.status}: ${res.statusText}`);
          }).catch(() => {
            throw new Error(`HTTP ${res.status}: ${res.statusText}`);
          });
        }
        return res.json();
      })
      .then(data => {
        render_questions(data);
        hecker_button.disabled = false;
        hecker_button.textContent = "Lấy đáp án";
      })
      .catch(err => {
        console.error(err);
        const errorHTML = `<div class='error-message'>❌ Lỗi: ${err.message}</div>`;
        if (status_message) {
          status_message.innerHTML = errorHTML;
        } else {
          container.innerHTML = errorHTML;
        }
        hecker_button.disabled = false;
        hecker_button.textContent = "Lấy đáp án";
      });
  } catch (err) {
    alert("Cái link gì đây? (URL không hợp lệ - có thể do thiếu https:// hoặc http://)");
    hecker_button.disabled = false;
    hecker_button.textContent = "Lấy đáp án";
  }
}

link_lms360.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    hack_da_answer();
  }
});

// Sorry mọi người vì cái EULA này:)
(function () {
  const modal = document.getElementById('eula-modal');
  const showEula = document.getElementById('show-eula');
  const closeEula = document.getElementById('close-eula');

  const bro_da_accept_chua_cham_hoi = localStorage.getItem('bro_da_accept_chua_cham_hoi');
  console.log('eula?:', bro_da_accept_chua_cham_hoi);

  if (!bro_da_accept_chua_cham_hoi) {
    if (modal) modal.classList.add('show');
  }

  if (showEula && modal) {
    showEula.addEventListener('click', function (e) {
      e.preventDefault();
      modal.classList.add('show');
    });
  }

  if (closeEula && modal) {
    closeEula.addEventListener('click', function () {
      modal.classList.remove('show');
      localStorage.setItem('bro_da_accept_chua_cham_hoi', 'true');
    });
  }
})();

(function () {
  const form = document.getElementById('url-form');

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      hack_da_answer();
    });
  }
})();
