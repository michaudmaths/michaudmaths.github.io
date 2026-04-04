// =========================
// MODAL
// =========================

function createQCMModal() {
  if (document.getElementById("qcm-modal")) return;

  const modal = document.createElement("div");
  modal.id = "qcm-modal";

  modal.innerHTML = `
    <div class="qcm-content">
      <button class="qcm-close">✖</button>
      <div id="qcm-container"></div>
    </div>
  `;

  document.body.appendChild(modal);

  modal.querySelector(".qcm-close").onclick = () => {
    modal.remove();
  };
}

// =========================
// RUN QUIZ (MODAL)
// =========================

function runQuiz(nodeData) {
  const quiz = nodeData.quiz;
  if (!quiz || quiz.length === 0) return;

  createQCMModal();

  const container = document.getElementById("qcm-container");

  let index = 0;

  function renderCurrent() {
    const q = quiz[index];

    if (q.type === "qcm") {
      container.innerHTML = renderQCM(q);
      initQCM(container, q, next);
    }

    if (q.type === "puzzle") {
      container.innerHTML = renderPuzzle(q);
      initPuzzle(container, q, next);
    }


    if (window.renderMathInElement) {
      renderMathInElement(container, {
          // customised options
          // • auto-render specific keys, e.g.:
          delimiters: [
              {left: '$$', right: '$$', display: true},
              {left: '$', right: '$', display: false},
              {left: '\\(', right: '\\)', display: false},
              {left: '\\[', right: '\\]', display: true}
          ],
          // • rendering keys, e.g.:
          throwOnError : false,
          macros: {"\\R": "\\mathbb{R}", "\\ee": "\\operatorname{e}"}
        });
    }
    // if (window.MathJax) {
    //  MathJax.typesetPromise([container]);
    //}
  }

  function next() {
    index++;

    if (index >= quiz.length) {
      container.innerHTML = `
        <div class="quiz-end">
          <h2>🎉 Terminé !</h2>
          <button onclick="document.getElementById('qcm-modal').remove()">
            Fermer
          </button>
        </div>
      `;
    } else {
      renderCurrent();
    }
  }

  renderCurrent();
}

// =========================
// QCM
// =========================

function renderQCM(q) {
  const inputType = "checkbox";

  return `
  <div class="qcm">
    <h2>${q.question}</h2>

    <div class="choices">
      ${shuffle(q.choices).map((c, i) => `
        <label class="choice">
          <input type="${inputType}" name="qcm" data-id="${c.id}">
          <span>${c.text}</span>
        </label>
      `).join("")}
    </div>

    <div class="qcm-buttons">
      <div class="left"></div>
      <div class="center">
        <button class="validate-btn">Valider</button>
      </div>
      <div class="right"></div>
    </div>
  </div>
  `;
}

function initQCM(container, q, next) {
  const btn = container.querySelector(".validate-btn");
  const feedback = container.querySelector(".feedback");

  btn.onclick = () => {
    const inputs = container.querySelectorAll("input");
    let correct = true;

    // ... (votre logique de vérification existante) ...
    inputs.forEach((input) => {
      const isChecked = input.checked;
      const isCorrect = q.choices[input.dataset.id].correct;
      const label = input.closest(".choice");
      if (isCorrect) label.classList.add("correct");
      if (isChecked && !isCorrect) label.classList.add("wrong");
      if (isChecked !== isCorrect) correct = false;
    });

    // Effet Confetti si correct
    if (correct && typeof confetti === 'function') {
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, zIndex: 1001 });
      const modalContent = document.querySelector(".qcm-content");
      modalContent.classList.remove("jump");
      void modalContent.offsetHeight;
      modalContent.classList.add("jump");
    }

    if (!correct) {
    const modalContent = document.querySelector(".qcm-content");
      modalContent.classList.remove("shake");
      void modalContent.offsetWidth;
      modalContent.classList.add("shake");
  }

    // Mise à jour de l'interface
    const centerZone = container.querySelector(".qcm-buttons .center");

    centerZone.innerHTML = `
      <div class="result-block">
        <span class="result-text ${correct ? "ok" : "ko"}">
          ${correct ? "✅ Bonne réponse !" : "❌ Mauvaise réponse"}
        </span>
      </div>
    `;

    const rightZone = container.querySelector(".qcm-buttons .right");
    rightZone.innerHTML = `<button class="next-btn">Suivant ➔</button>`;

    // Cacher le bouton valider (au lieu de juste le désactiver)
    btn.classList.add("hidden-btn");

    container.querySelector(".next-btn").onclick = next;
  };
}

// =========================
// PUZZLE
// =========================

function renderPuzzle(p) {
  return `
  <div class="puzzle">
    <h2>${p.question}</h2>

    <div class="pieces-pool">
      ${shuffle(p.pieces).map(piece => `
        <button class="piece" data-id="${piece.id}">
          ${escapeHTML(piece.text)}
        </button>
      `).join("")}
    </div>

    <div class="answer-zone"></div>

    <div class="qcm-buttons">
      <div class="left">
        <button class="reset-btn">Reset</button>
      </div>
      <div class="center">
        <button class="validate-btn">Valider</button>
      </div>
      <div class="right"></div>
    </div>

    <div class="feedback"></div>
  </div>
  `;
}

function initPuzzle(container, puzzle, next) {
  const pool = container.querySelector(".pieces-pool");
  const answer = container.querySelector(".answer-zone");
  const feedback = container.querySelector(".feedback");

  // Ajouter pièce
  pool.addEventListener("click", e => {
    console.log(e.target.classList);
    const piece = e.target.closest(".piece");
    if (!piece) return;
    const clone = e.target.cloneNode(true);
    console.log(clone)
    answer.appendChild(clone);
  });

  // Retirer pièce
  answer.addEventListener("click", e => {
    const piece = e.target.closest(".piece");
    if (!piece) return;
    piece.remove();
  });

  // Reset
  container.querySelector(".reset-btn").onclick = () => {
    answer.innerHTML = "";
    feedback.innerHTML = "";
  };

  // Validation
  container.querySelector(".validate-btn").onclick = (e) => {
    const userIds = [...answer.children].map(el => Number(el.dataset.id));
    const correct = puzzle.solutionIdsList.some(sol => arraysEqual(sol, userIds));
    const valBtn = e.target;
    const resetBtn = container.querySelector(".reset-btn");

    if (correct && typeof confetti === 'function') {
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, zIndex: 1001 });
      const modalContent = document.querySelector(".qcm-content");
      modalContent.classList.remove("jump");
      void modalContent.offsetHeight;
      modalContent.classList.add("jump");
    }
    if (!correct) {
      const modalContent = document.querySelector(".qcm-content");
      modalContent.classList.remove("shake");
      void modalContent.offsetWidth;
      modalContent.classList.add("shake");
    }

    const centerZone = container.querySelector(".qcm-buttons .center");

    centerZone.innerHTML = `
      <div class="result-block">
        <span class="result-text ${correct ? "ok" : "ko"}">
          ${correct ? "✅ Bonne réponse !" : "❌ Mauvaise réponse"}
        </span>
      </div>
    `;

    const rightZone = container.querySelector(".qcm-buttons .right");
    rightZone.innerHTML = `<button class="next-btn">Suivant ➔</button>`;

    // Cache les boutons d'action
    valBtn.classList.add("hidden-btn");
    resetBtn.classList.add("hidden-btn");

    container.querySelector(".next-btn").onclick = next;
  };
}

// =========================
// UTILS
// =========================

function arraysEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function escapeHTML(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}