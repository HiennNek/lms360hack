const link_lms360 = document.getElementById("link_lms360");
const hecker_button = document.getElementById("hecker_button");
const container = document.getElementById("questions");

// Update v4.2: Đã sử dụng backend mới

////////////////////////////////////////////////////////////////////////////////
// Thuật toán chuyển đổi JSON sang ngôn ngữ mà loài người có thể hiểu được :) //
////////////////////////////////////////////////////////////////////////////////

function real_not_fake(results) {
  if (!results || results.length === 0) return false;
  
  return results.some(result => {
    const text = result.text || "";
    return text.trim() !== "" && 
           !text.includes("Câu hỏi trống") && 
           !text.includes("không có nội dung") &&
           !text.includes("không có đáp án");
  });
}

// Loại câu hỏi #1: Viết vào chỗ trống
function question_type_1(jsonContent) {
  const lib = (jsonContent.library || jsonContent.__containerLibrary || "").toString();
  let results = [];

  const interactions = jsonContent.interactiveVideo?.assets?.interactions || [];
  interactions.forEach(interaction => {
    if ((interaction.action?.library || "").startsWith("H5P.Blanks")) {
      const questions = interaction.action.params?.questions || [];
      questions.forEach(q => {
        const clean = q
          .replace(/<\/p>/gi, '<br>')
          .replace(/<p>/gi, '')
          .replace(/\*(.*?)\*/g, '<span class="highlight">$1</span>')
          .trim();
        results.push({ index: results.length + 1, text: clean, duration: interaction.duration });
      });
    }
  });

  if (lib.startsWith("H5P.Blanks") && Array.isArray(jsonContent.questions)) {
    jsonContent.questions.forEach(q => {
      const clean = q
        .replace(/<\/p>/gi, '<br>')
        .replace(/<p>/gi, '')
        .replace(/\*(.*?)\*/g, '<span class="highlight">$1</span>')
        .trim();
      results.push({ index: results.length + 1, text: clean });
    });
  }

  return real_not_fake(results) ? results : null;
}

// Loại câu hỏi #2: Trắc nghiệm có nút submit
function question_type_2(jsonContent) {
  const mcqList = jsonContent.questions || [];
  let results = [];

  mcqList.forEach((q, idx) => {
    if (q.library && q.library.startsWith("H5P.MultiChoice")) {
      const questionText = q.params?.question || `Câu hỏi ${idx + 1}`;
      const answers = q.params?.answers || [];

      let hasCorrect = false;
      const optionsHtml = answers.map((ans, i) => {
        if (ans.correct) hasCorrect = true;
        const correctClass = ans.correct ? "highlight" : "";
        return `<li class="${correctClass}">${ans.text}</li>`;
      }).join("");

      const finalHtml = hasCorrect 
        ? `${questionText}<ul>${optionsHtml}</ul>` 
        : `${questionText}<ul>${optionsHtml}</ul>`;

      results.push({
        index: idx + 1,
        text: finalHtml
      });
    }
  });

  return real_not_fake(results) ? results : null;
}

// Loại câu hỏi #3: Trắc nghiệm không có nút submit (InteractiveVideo)
function question_type_3(jsonContent) {
  const interactions = jsonContent.interactiveVideo?.assets?.interactions || [];
  let results = [];

  interactions.forEach(interaction => {
    if (interaction.action?.library?.startsWith("H5P.SingleChoiceSet")) {
      const choices = interaction.action.params?.choices || [];

      choices.forEach((choice, idx) => {
        const questionText = choice.question?.replace(/<\/?p>/g, "").trim();
        const answers = choice.answers || [];

        if (!questionText || answers.length === 0) {
          return;
        }

        const optionsHtml = answers.map((a, i) => {
          const cleanText = a.replace(/<\/?p>/g, "").trim();
          const correctClass = i === 0 ? "highlight" : "";
          return `<li class="${correctClass}">${cleanText}</li>`;
        }).join("");

        results.push({
          index: idx + 1,
          text: `${questionText}<ul>${optionsHtml}</ul>`,
          duration: interaction.duration
        });
      });
    }
  });

  return real_not_fake(results) ? results : null;
}

// Loại câu hỏi #4: Câu hỏi trắc nghiệm trong InteractiveVideo
function question_type_4(jsonContent) {
  const interactions = jsonContent.interactiveVideo?.assets?.interactions || [];
  let results = [];

  interactions.forEach(interaction => {
    if (interaction.action?.library?.startsWith("H5P.MultiChoice")) {
      const params = interaction.action.params || {};
      const questionText = params.question?.replace(/<\/?p>/g, "") || "Câu hỏi trắc nghiệm";
      const answers = params.answers || [];

      let hasCorrect = false;
      const optionsHtml = answers.map((ans, i) => {
        const cleanText = ans.text.replace(/<\/?p>/g, "");
        if (ans.correct) hasCorrect = true;
        const correctClass = ans.correct ? "highlight" : "";
        return `<li class="${correctClass}">${cleanText}</li>`;
      }).join("");

      const finalHtml = hasCorrect 
        ? `${questionText}<ul>${optionsHtml}</ul>` 
        : `${questionText}<ul>${optionsHtml}</ul>`;

      results.push({
        index: results.length + 1,
        text: finalHtml,
        duration: interaction.duration
      });
    }
  });

  return real_not_fake(results) ? results : null;
}

// Loại câu hỏi #5: Kéo thả văn bản
function question_type_5(jsonContent) {
  if (jsonContent.library?.startsWith("H5P.DragText") || jsonContent.textField) {
    const lines = (jsonContent.textField || "").split("\\n");
    let text = lines.map(line => {
      let clean = line.replace(/‾\t/g, "").trim();
      return clean.replace(/\*(.*?)\*/g, '<span class="highlight">$1</span>' + '<br>');
    }).join("<br>");

    if (jsonContent.distractors) {
      const distractors = jsonContent.distractors
        .match(/\*(.*?)\*/g)
        ?.map(d => d.replace(/\*/g, ""))
        .join(", ");
      if (distractors) {
        text += `<br><br><strong>Từ không có trong đáp án:</strong> ${distractors}`;
      }
    }

    return real_not_fake([{ index: 1, text }]) ? [{ index: 1, text }] : null;
  }
  return null;
}

// Loại câu hỏi #6: Đúng/Sai trong InteractiveVideo
function question_type_6(jsonContent) {
  const interactions = jsonContent.interactiveVideo?.assets?.interactions || [];
  let results = [];

  interactions.forEach(interaction => {
    if (interaction.action?.library?.startsWith("H5P.TrueFalse")) {
      const params = interaction.action.params || {};
      const questionText = params.question?.replace(/<\/?p>/g, "") || "Câu hỏi Đúng/Sai";

      const trueLabel = params.l10n?.trueText || "Đúng";
      const falseLabel = params.l10n?.falseText || "Sai";

      const correctAnswer = params.correct === "true" ? trueLabel : falseLabel;

      const optionsHtml = `
        <ul>
          <li class="${params.correct === "true" ? "highlight" : ""}">${trueLabel}</li>
          <li class="${params.correct === "false" ? "highlight" : ""}">${falseLabel}</li>
        </ul>
      `;

      results.push({
        index: results.length + 1,
        text: `${questionText}${optionsHtml}<p><em>Đáp án đúng: ${correctAnswer}</em></p>`,
        duration: interaction.duration
      });
    }
  });

  return real_not_fake(results) ? results : null;
}

// Loại câu hỏi #7: Kéo thả văn bản trong InteractiveVideo
function question_type_7(jsonContent) {
  const interactions = jsonContent.interactiveVideo?.assets?.interactions || [];
  let results = [];

  interactions.forEach(interaction => {
    if (interaction.action?.library?.startsWith("H5P.DragText")) {
      const params = interaction.action.params || {};
      const lines = (params.textField || "").split("\\n");

      let text = lines.map(line => {
        let clean = line.replace(/‾\t/g, "").trim();
        return clean.replace(/\*(.*?)\*/g, '<span class="highlight">$1</span>' + '<br>');
      }).join("<br>");

      if (params.distractors) {
        const distractors = params.distractors
          .match(/\*(.*?)\*/g)
          ?.map(d => d.replace(/\*/g, ""))
          .join(", ");
        if (distractors) {
          text += `<br><strong>Từ không có trong đáp án:</strong> ${distractors}`;
        }
      }

      results.push({
        index: results.length + 1,
        text,
        duration: interaction.duration
      });
    }
  });

  return real_not_fake(results) ? results : null;
}

// Loại câu hỏi #8: Câu hỏi tự luận không có đáp án sẵn
function question_type_8(jsonContent) {
  const interactions = jsonContent.interactiveVideo?.assets?.interactions || [];
  let results = [];

  interactions.forEach(interaction => {
    if (interaction.action?.library?.startsWith("H5P.FreeTextQuestion")) {
      const params = interaction.action.params || {};
      const questionText = params.question?.replace(/<\/?p>/g, "") || "Câu hỏi tự luận";
      const placeholder = params.placeholder || "";

      let text = `${questionText}<br><em>(Đây là dạng câu hỏi tự luận không có đáp án sẵn)</em>`;
      if (placeholder) {
        text += `<br><small>Gợi ý: ${placeholder}</small>`;
      }

      results.push({
        index: results.length + 1,
        text,
        duration: interaction.duration
      });
    }
  });

  return real_not_fake(results) ? results : null;
}

// Loại câu hỏi #9: Trắc nghiệm không có nút submit
function question_type_9(jsonContent) {
  const choices = jsonContent.choices || [];
  let results = [];

  choices.forEach((choice, idx) => {
    const questionText = choice.question?.replace(/<\/?p>/g, "").trim();
    const answers = choice.answers || [];

    if (!questionText || answers.length === 0) {
      return;
    }

    const optionsHtml = answers.map((a, i) => {
      const cleanText = a.replace(/<\/?p>/g, "").trim();
      const correctClass = i === 0 ? "highlight" : "";
      return `<li class="${correctClass}">${cleanText}</li>`;
    }).join("");

    results.push({
      index: idx + 1,
      text: `${questionText}<ul>${optionsHtml}</ul>`
    });
  });

  return real_not_fake(results) ? results : null;
}

//#10: Sắp xếp câu
function question_type_10(jsonContent) {
  const lib = (jsonContent.library || jsonContent.__containerLibrary || "").toString();

  if (lib.startsWith("H5P.SortParagraphs") && Array.isArray(jsonContent.paragraphs)) {
    const taskDesc = jsonContent.taskDescription?.replace(/<\/?p>/g, "") || "Sắp xếp các đoạn sau:";
    const itemsHtml = jsonContent.paragraphs
      .map((p, i) => `<li>${p.replace(/<\/?p>/g, "").trim()}</li>`)
      .join("");

    return real_not_fake([{
      index: 1,
      text: `<strong>${taskDesc}</strong><ul>${itemsHtml}</ul><p><em>(Sắp xếp theo đúng thứ tự)</em></p>`
    }]) ? [{
      index: 1,
      text: `<strong>${taskDesc}</strong><ul>${itemsHtml}</ul><p><em>(Sắp xếp theo đúng thứ tự)</em></p>`
    }] : null;
  }

  return null;
}

//#11: Some fucking random multiple choice question
function question_type_11(jsonContent) {
    const lib = (jsonContent.library || jsonContent.__containerLibrary || "").toString();
    if (lib.startsWith("H5P.Summary") && jsonContent.intro) {
      const intro = jsonContent.intro.replace(/<\/?p>/g, "");
      const groups = jsonContent.summaries || [];
  
      const hasValidGroups = groups.some(g => {
        const summaryItems = g.summary || [];
        return summaryItems.some(item => {
          const clean = item.replace(/<\/?p>/g, "").trim();
          return clean.length > 0;
        });
      });
      
      if (!hasValidGroups) return null;
  
      const groupHtml = groups.map((g) => {
        const items = (g.summary || [])
          .map((i, idx) => {
            const clean = i.replace(/<\/?p>/g, "").trim();
            const correctClass = idx === 0 ? "highlight" : "";
            return `<li class="${correctClass}">${clean}</li>`;
          })
          .join("");
        return `<ul>${items}</ul>`;
      }).join("");
  
      return real_not_fake([{
        index: 1,
        text: `<strong>${intro}</strong><br>${groupHtml}<p><em></em></p>`
      }]) ? [{
        index: 1,
        text: `<strong>${intro}</strong><br>${groupHtml}<p><em></em></p>`
      }] : null;
    }
  
    const summary = jsonContent.interactiveVideo?.summary?.task;
    if (summary && summary.library?.startsWith("H5P.Summary")) {
      const intro = summary.params?.intro?.replace(/<\/?p>/g, "") || "Chọn câu đúng:";
      const groups = summary.params?.summaries || [];
  
      const hasValidGroups = groups.some(g => {
        const summaryItems = g.summary || [];
        return summaryItems.some(item => {
          const clean = item.replace(/<\/?p>/g, "").trim();
          return clean.length > 0;
        });
      });
      
      if (!hasValidGroups) return null;
  
      const groupHtml = groups.map((g) => {
        const items = (g.summary || [])
          .map((i, idx) => {
            const clean = i.replace(/<\/?p>/g, "").trim();
            const correctClass = idx === 0 ? "highlight" : "";
            return `<li class="${correctClass}">${clean}</li>`;
          })
          .join("");
        return `<ul>${items}</ul>`;
      }).join("");
  
      return real_not_fake([{
        index: 1,
        text: `<strong>${intro}</strong><br>${groupHtml}<p><em></em></p>`
      }]) ? [{
        index: 1,
        text: `<strong>${intro}</strong><br>${groupHtml}<p><em></em></p>`
      }] : null;
    }
  
    return null;
}

//#12: Chọn từ
function question_type_12(jsonContent) {
  let results = [];

  const interactions = jsonContent.interactiveVideo?.assets?.interactions || [];
  interactions.forEach(interaction => {
    if ((interaction.action?.library || "").startsWith("H5P.MarkTheWords")) {
      const params = interaction.action.params || {};
      const taskDescription =
        params.taskDescription?.replace(/<\/?p>/g, "").trim() || "(Không có mô tả)";
      const textField = params.textField || "";

      const formattedText = textField
        .replace(/<\/?p>/g, "")
        .replace(/\*(.+?)\*/g, '<span class="highlight">$1</span>');

      results.push({
        index: results.length + 1,
        text: `<p>${taskDescription}</p><p>${formattedText}</p>`
      });
    }
  });

  const lib = (jsonContent.library || jsonContent.__containerLibrary || "").toString();
  if (lib.startsWith("H5P.MarkTheWords")) {
    const params = jsonContent || {};
    const taskDescription =
      params.taskDescription?.replace(/<\/?p>/g, "").trim() || "(Không có mô tả)";
    const textField = params.textField || "";

    const formattedText = textField
      .replace(/<\/?p>/g, "")
      .replace(/\*(.+?)\*/g, '<span class="highlight">$1</span>');

    results.push({
      index: results.length + 1,
      text: `<p>${taskDescription}</p><p>${formattedText}</p>`,
      duration: interaction.duration
    });
  }

  return results.length > 0 ? results : null;
}

// #13: Column + hình ảnh
function question_type_13(jsonContent) {
  let results = [];

  const interactions = jsonContent.interactiveVideo?.assets?.interactions || [];
  interactions.forEach((interaction) => {
    if ((interaction.action?.library || "").startsWith("H5P.Column")) {
      const params = interaction.action.params || {};
      const contentArray = params.content || [];

      contentArray.forEach((block) => {
        const inner = block.content || {};
        const innerLib = inner.library || "";
        const innerParams = inner.params || {};

        if (innerLib.startsWith("H5P.Image")) {
          const imagePath = innerParams.file?.path;
          if (imagePath) {
            const altText = innerParams.alt || "Hình ảnh minh họa";
            results.push({
              index: results.length + 1,
              text: `<div class="image-block"><img src="${imagePath}" alt="${altText}" style="max-width:100%;border-radius:12px;box-shadow:0 2px 6px rgba(0,0,0,0.2);"></div>`
            });
          }
        }

        else if (innerLib.startsWith("H5P.SingleChoiceSet")) {
          const choices = innerParams.choices || [];
          choices.forEach((choice, idx) => {
            const questionText = choice.question?.replace(/<\/?p>/g, "") || `Câu hỏi ${idx + 1}`;
            const answers = choice.answers || [];
            const optionsHtml = answers.map((a, i) => {
              const clean = a.replace(/<\/?p>/g, "");
              const correctClass = i === 0 ? "highlight" : "";
              return `<li class="${correctClass}">${clean}</li>`;
            }).join("");
            results.push({
              index: results.length + 1,
              text: `${questionText}<ul>${optionsHtml}</ul>`
            });
          });
        }

        else if (innerLib.startsWith("H5P.MultiChoice")) {
          const question = innerParams.question?.replace(/<\/?p>/g, "").trim() || "Câu hỏi trắc nghiệm";
          const answers = innerParams.answers || [];
          const optionsHtml = answers.map((ans) => {
            const clean = ans.text.replace(/<\/?p>/g, "");
            const correctClass = ans.correct ? "highlight" : "";
            return `<li class="${correctClass}">${clean}</li>`;
          }).join("");
          results.push({
            index: results.length + 1,
            text: `${question}<ul>${optionsHtml}</ul>`
          });
        }

        else if (innerLib.startsWith("H5P.Blanks")) {
          const questions = innerParams.questions || [];
          questions.forEach((q, idx) => {
            const cleanQ = q.replace(/<\/?p>/g, "");
            const highlighted = cleanQ.replace(/\*(.+?)\*/g, '<span class="highlight">$1</span>');
            results.push({
              index: results.length + 1,
              text: `<p>${highlighted}</p>`
            });
          });
        }
      });
    }
  });

  const lib = (jsonContent.library || jsonContent.__containerLibrary || "").toString();
  if (lib.startsWith("H5P.Column")) {
    const contentArray = jsonContent.content || [];

    contentArray.forEach((block) => {
      const inner = block.content || {};
      const innerLib = inner.library || "";
      const innerParams = inner.params || {};

      if (innerLib.startsWith("H5P.Image")) {
        const imagePath = innerParams.file?.path;
        if (imagePath) {
          const altText = innerParams.alt || "Hình ảnh minh họa";
          results.push({
            index: results.length + 1,
            text: `<div class="image-block"><img src="${imagePath}" alt="${altText}" style="max-width:100%;border-radius:12px;box-shadow:0 2px 6px rgba(0,0,0,0.2);"></div>`
          });
        }
      }

      else if (innerLib.startsWith("H5P.SingleChoiceSet")) {
        const choices = innerParams.choices || [];
        choices.forEach((choice, idx) => {
          const questionText = choice.question?.replace(/<\/?p>/g, "") || `Câu hỏi ${idx + 1}`;
          const answers = choice.answers || [];
          const optionsHtml = answers.map((a, i) => {
            const clean = a.replace(/<\/?p>/g, "");
            const correctClass = i === 0 ? "highlight" : "";
            return `<li class="${correctClass}">${clean}</li>`;
          }).join("");
          results.push({
            index: results.length + 1,
            text: `${questionText}<ul>${optionsHtml}</ul>`
          });
        });
      }

      else if (innerLib.startsWith("H5P.MultiChoice")) {
        const question = innerParams.question?.replace(/<\/?p>/g, "").trim() || "Câu hỏi trắc nghiệm";
        const answers = innerParams.answers || [];
        const optionsHtml = answers.map((ans) => {
          const clean = ans.text.replace(/<\/?p>/g, "");
          const correctClass = ans.correct ? "highlight" : "";
          return `<li class="${correctClass}">${clean}</li>`;
        }).join("");
        results.push({
          index: results.length + 1,
          text: `${question}<ul>${optionsHtml}</ul>`
        });
      }
    });
  }

  return results.length > 0 ? results : null;
}


const question_type = [
  question_type_1,
  question_type_2,
  question_type_3,
  question_type_4,
  question_type_5,
  question_type_6,
  question_type_7,
  question_type_8,
  question_type_9,
  question_type_10,
  question_type_11,
  question_type_12,
  question_type_13
];

///////////////////////////////////////////////////////////////////////////////////////////////////////////////

function render_quest(data) {
  try {
    let jsonContent;
    let outerLib = "";

    if (data.integration && data.integration.contents) {
      const contentId = Object.keys(data.integration.contents)[0];
      const contentObj = data.integration.contents[contentId];
      jsonContent = JSON.parse(contentObj.jsonContent);

      outerLib = contentObj.library || contentObj.metadata?.contentType || "";
      jsonContent.__containerLibrary = outerLib;
    } else {
      jsonContent = data;
      outerLib = jsonContent.library || "";
      jsonContent.__containerLibrary = outerLib;
    }

    let results = [];
    for (let handler of question_type) {
      const output = handler(jsonContent);
      if (output) results = results.concat(output);
    }

    results.sort((a, b) => {
      const timeA = a.duration?.from ?? Infinity;
      const timeB = b.duration?.from ?? Infinity;
      return timeA - timeB;
    });

    container.innerHTML = "";

    if (results.length > 0) {
      container.innerHTML = `<div class="success-message">Đã tìm thấy ${results.length} câu hỏi!</div><br>`;
      results.forEach((q, index) => {
        setTimeout(() => {
          const div = document.createElement("div");
          div.className = "question";
          div.style.setProperty('--index', index);

          div.innerHTML = `<h3>Câu hỏi ${index + 1}:</h3><p>${q.text}</p>`;
          container.appendChild(div);
        }, index * 100);
      });
    } else {
      container.innerHTML = "<div class='error-message'>❌ Kiểu nội dung này chưa được hỗ trợ. Bạn có thể yêu cầu thêm dạng câu hỏi này qua phần “Report Bug”</div>";
    }
  } catch (err) {
    console.error("Lỗi khi phân tích nội dung:", err);
    container.innerHTML = "<div class='error-message'>❌ Link không hợp lệ hoặc không đúng định dạng.</div>";
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
      alert("Đây không phải URL bài tập!");
      hecker_button.disabled = false;
      hecker_button.textContent = "Lấy đáp án";
      return;
    }

  // New secure backend :D
  const fuck_you_cors = `https://lms360hack-backend.hiennek1.workers.dev?id=${encodeURIComponent(questionId)}`;

    fetch(fuck_you_cors)
      .then(res => {
        if (res.status === 429) {
          throw new Error("Từ từ, không sập server!");
        }
        if (!res.ok) throw new Error("Không thể load backend.");
        return res.json();
      })
      .then(data => {
        render_quest(data);
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
