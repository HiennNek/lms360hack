const link_lms360 = document.getElementById("link_lms360");
const hecker_button = document.getElementById("hecker_button");
const container = document.getElementById("questions");

// Update v4.2: Đã sử dụng backend mới 
// Update v4.3: đã chuyển toàn bộ thuật toán xử lý câu hỏi sang backend
function render_questions(backendResponse) {
  container.innerHTML = "";

  if (!backendResponse.success) {
    const errorMsg = backendResponse.error || "Không thể xử lý câu hỏi.";
    container.innerHTML = `<div class='error-message'>❌ ${errorMsg}</div>`;
    return;
  }

  const questions = backendResponse.questions || [];
  const actualQuestionCount = backendResponse.actualQuestionCount || backendResponse.count || questions.length;
  
  if (questions.length === 0) {
    container.innerHTML = "<div class='error-message'>❌ Kiểu nội dung này chưa được hỗ trợ. Bạn có thể yêu cầu thêm dạng câu hỏi này qua phần \"Report Bug\"</div>";
    return;
  }

  let message = `Đã tìm thấy tổng cộng ${questions.length} câu hỏi!`;
  if (actualQuestionCount && actualQuestionCount !== questions.length) {
    message += ` ( Số câu hỏi thực tế trong bài: ${actualQuestionCount} )`;
  }
  container.innerHTML = `<div class="success-message">${message}</div><br>`;
  
  const skipAnimation = questions.length >= 20;
  if (skipAnimation) {
    container.classList.add("no-question-animation");
  } else {
    container.classList.remove("no-question-animation");
  }

  questions.forEach((q, index) => {
    const renderOne = () => {
      const div = document.createElement("div");
      div.className = "question";
      div.style.setProperty('--index', index);

      div.innerHTML = `<h3>Câu hỏi ${index + 1}:</h3><p>${q.text}</p>`;
      container.appendChild(div);
    };

    if (skipAnimation) {
      renderOne();
    } else {
      setTimeout(renderOne, index * 100);
    }
  });

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
        container.innerHTML = `<div class='error-message'>❌ Lỗi: ${err.message}</div>`;
        hecker_button.disabled = false;
        hecker_button.textContent = "Lấy đáp án";
      });
  } catch (err) {
    alert("Cái link gì đây? (URL không hợp lệ - có thể do thiếu https:// hoặc http://)");
    hecker_button.disabled = false;
    hecker_button.textContent = "Lấy đáp án";
  }
}

hecker_button.addEventListener("click", hack_da_answer);

link_lms360.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    hack_da_answer();
  }
});

// Sorry mọi người vì cái EULA này:)
(function(){
  const modal = document.getElementById('eula-modal');
  const showEula = document.getElementById('show-eula');
  const closeEula = document.getElementById('close-eula');
  
  const bro_da_accept_chua_cham_hoi = localStorage.getItem('bro_da_accept_chua_cham_hoi');
  console.log('eula?:', bro_da_accept_chua_cham_hoi);
  
  if (!bro_da_accept_chua_cham_hoi) {
    modal.classList.add('show');
  }
  
  showEula.addEventListener('click', function(e) {
    e.preventDefault();
    modal.classList.add('show');
  });
  
  closeEula.addEventListener('click', function() {
    modal.classList.remove('show');
    localStorage.setItem('bro_da_accept_chua_cham_hoi', 'true');
  });
})();

(function(){
  const form = document.getElementById('url-form');
  
  if (form) {
    form.addEventListener('submit', function(e){
      e.preventDefault();
      hack_da_answer();
    });
  }
})();
