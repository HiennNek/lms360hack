//=============================
// >> TIN 9 HTP HACK
//
// Config: Chọn mode hoạt động:
//
//    MODEhtp = 1   Hiện gợi ý
//    MODEhtp = 2   Heck điểm :) - Tự động cho điểm 10
//
const MODEhtp = 1;
//    ^^^^^^^  ^^^ Chỉnh cái này nè
//
//=============================

//=============================
// >> LMS360 HACK
//
// Config: Chọn mode hoạt động:
//
//    MODElms = 1   Xóa đáp án sai và chỉ hiện đáp án đúng
//    MODElms = 2   Dấu chấm nhỏ "." ở cuối câu đúng (this could be used for cheating, super hard to detect)
//    MODElms = 3   Bấm nút hiện đáp án để highlight câu đúng (nếu bạn muốn học nhưng sợ sai)
//
const MODElms = 1;
//    ^^^^^^^  ^^^ Chỉnh cái này nè
//
//=============================


// Code chính

(function () {

  // Tôi quá lười để mà viết code 🥀

  'use strict';

  //Đoạn này được bú từ google (quên nguồn r)
  //Cho phép chuột phải, copy và F12 trong lúc làm bài
  ///////////////////////////////////////////////
    window.addEventListener('contextmenu', function (e) {
        e.stopImmediatePropagation();
    }, { capture: true });

    window.addEventListener('keydown', function (e) {
        const key = e.key || e.keyCode;
        const isF12 = key === 'F12' || key === 123;
        const isCtrlShiftI = (e.ctrlKey || e.metaKey) && e.shiftKey && (key === 'I' || key === 'i' || key === 73);
        if (isF12 || isCtrlShiftI) {
            e.stopImmediatePropagation();
        }
    }, { capture: true });

    document.addEventListener('DOMContentLoaded', () => {
        ['oncontextmenu', 'oncopy', 'onselectstart'].forEach(name => {
            try { document.body.removeAttribute(name); } catch {}
            try { document.body[name] = null; } catch {}
        });
    });
  ///////////////////////////////////////////////

  if (MODEhtp === 1) {
    function show_da_answer(span, text) {
      if (!text) return null;
      let hint = span.querySelector('p.answer-hint');
      if (!hint) {
        hint = document.createElement('p');
        hint.className = 'answer-hint';
        hint.textContent = text;
        hint.style.opacity = '0.5';
        hint.style.margin = '0';
        hint.style.pointerEvents = 'none';
        hint.style.userSelect = 'none';
        span.appendChild(hint);
      } else {
        if (hint.textContent !== String(text)) hint.textContent = text;
      }
      // Kiểm tra cái ô đáp án
      const occupied = String(span.getAttribute('data-occupied') || '').toLowerCase() === 'true';
      const dropped = span.classList.contains('word-dropped') || span.hasAttribute('data-dropped-word');
      hint.style.display = (occupied || dropped) ? 'none' : '';
      return hint;
    }

    function looking_for_drop_box(span, text) {
      if (span._hintObserver) return;
      const obs = new MutationObserver(muts => {
        muts.forEach(m => {
          if (m.type === 'attributes') {
            const hint = span.querySelector('p.answer-hint');
            if (!hint) return;
            const occupied = String(span.getAttribute('data-occupied') || '').toLowerCase() === 'true';
            const dropped = span.classList.contains('word-dropped') || span.hasAttribute('data-dropped-word');
            hint.style.display = (occupied || dropped) ? 'none' : '';
          }
          if (m.type === 'childList') {
            // nếu một cách thần kì nào đó nó ko hiện đáp án thì sẽ chạy lại ;)
            if (!span.querySelector('p.answer-hint')) {
              show_da_answer(span, text);
            }
          }
        });
      });
      obs.observe(span, {
        attributes: true,
        attributeFilter: ['data-occupied', 'class', 'data-dropped-word'],
        childList: true,
        subtree: false
      });
      span._hintObserver = obs;
    }

    function heck_all_answers() {
      const blanks = document.querySelectorAll('.blank-placeholder');
      blanks.forEach((b, i) => {
        let text = null;
        if (Array.isArray(window.answer) && i < window.answer.length) text = window.answer[i];
        else if (typeof window.answer === 'string' && window.answer.trim()) text = window.answer;
        else text = b.getAttribute('data-correct-answer');

        if (!text) return;
        show_da_answer(b, text);
        looking_for_drop_box(b, text);
      });
    }

    // khởi chạy + check thay đổi trên trang (this shit is important)
    heck_all_answers();
    const bodyObserver = new MutationObserver(() => heck_all_answers());
    bodyObserver.observe(document.body, { childList: true, subtree: true });

    // để cho an toàn: chạy lại sau khi load
    window.addEventListener('load', () => setTimeout(heck_all_answers, 250));

  } else if (MODEhtp === 2) {
    const ur_score = "10.0";

    function heck_da_score(el) {
      if (el) {
        const match = el.textContent.match(/^(.*) đã đạt được/);
          if (match) {
            const nameAndClass = match[1].trim();
            const newText = `${nameAndClass} đã đạt được ${ur_score} điểm.`;
            if (el.textContent !== newText) {
              el.textContent = newText;
            }
          }
      }
    }

    function spying_the_score(el) {
      heck_da_score(el);

      // Ngó thay đổi trên ưeb:) <- cố tình xai trính tả
      const elObserver = new MutationObserver(() => {
        heck_da_score(el);
      });

      elObserver.observe(el, {
        childList: true,
        characterData: true,
        subtree: true,
      });
    }

    function init() {
      const el = document.querySelector('#score-display');
      if (el) {
        spying_the_score(el);
      }
    }

    // Khởi chạy
    init();

    const globalObserver = new MutationObserver(() => {
      init();
    });

    globalObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

    function show_da_hecker_button(questionDiv) {
        if (questionDiv.querySelector('.a_sussy_baka_button')) return;

        const btn = document.createElement('button');
        btn.textContent = "Hiện đáp án";
        btn.type = "button";
        btn.className = "a_sussy_baka_button";
        btn.style.marginLeft = "10px";

        btn.addEventListener('click', () => {
            const correct_answer_lms = questionDiv.parentElement.querySelectorAll('li.h5p-sc-alternative.h5p-sc-is-correct');
            correct_answer_lms.forEach(li => {
                li.style.backgroundColor = '#c3e09cff';// màu này đẹp nè :)
            });
        });

        const title = questionDiv.querySelector('p');
        if (title) {
            title.insertAdjacentElement('afterend', btn);
        }
    }

  function heck_da_lms_answer() {
    const correct_lms_answer = document.querySelectorAll('li.h5p-sc-alternative.h5p-sc-is-correct');
    correct_lms_answer.forEach(li => {
      if (MODElms === 3) {
        const questions = document.querySelectorAll('.h5p-sc-question');
        questions.forEach(q => show_da_hecker_button(q));
      }

      if (MODElms === 2) {
        const label = li.querySelector('.h5p-sc-label p:last-child');
        if (label && !label.querySelector('.ur-sussy-baka-dot')) {
          const dot = document.createElement('span');
          dot.textContent = ' .';
          dot.className = 'ur-sussy-baka-dot';
          label.appendChild(dot);
        }
      }
      if (MODElms === 1) {
        const wrong_answer = document.querySelectorAll('li.h5p-sc-alternative.h5p-sc-is-wrong');
        wrong_answer.forEach(li => li.remove());
      }
    });
  }

  const observer = new MutationObserver(() => {
    heck_da_lms_answer();
  });

  observer.observe(document.body, { childList: true, subtree: true });

  heck_da_lms_answer();

  console.log("Guess what, a sussy baka script is running on this browser!");

  console.log("This is an easter egg, isnt it?");

})();

// You have reached the end of this spaghetti code.
// Good luck using it your self
// Dont be a skid!

//Tampermonkey config
//It looked cleaner if you put that config bellow here, right?

// ==UserScript==
// @name         LMS360 Hack + Tin 9 HTP Hack
// @namespace    HiennNek/lms360hack
// @version      3.0
// @description  Hack multiple choise answer on LMS360 and HTP school.
// @match        file:///*
// @match        *://192.168.*/*
// @include      http://192.168.*/*
// @include      https://192.168.*/*
// @match        https://lms360.vn/*
// @match        https://lms360.edu.vn/*
// @grant        none
// ==/UserScript==
