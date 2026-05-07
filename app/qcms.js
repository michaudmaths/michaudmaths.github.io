// =========================
// MODAL
// =========================

const starApparitionDelay = 300; // en ms
const starFlyDelay = 150 // en ms
const starFlyDuration = 800 // en ms
const waitDurationAfterStarsFly = 2000 // en ms

function createQCMModal(){
  if (document.getElementById("qcm-modal")) return;
  const gearBtn = document.getElementById("gear-btn"); 
  const modal = document.createElement("div");
  modal.id = "qcm-modal";

  modal.innerHTML = `
    <div class="qcm-content">
      <div id="qcm-header">
        <h2></h2>
      </div>
      <button class="qcm-close">✖</button>
      <div id="qcm-container"></div>
    </div>
  `;

  document.body.appendChild(modal);
  gearBtn.classList.add("hidden");
  

  cy.autoungrabify(true);
  cy.autounselectify(true);
  cy.userZoomingEnabled(false);
  cy.userPanningEnabled(false);

  modal.querySelector(".qcm-close").onclick = () => {
    modal.remove();
    cy.autoungrabify(false);
    cy.autounselectify(false);
    cy.userZoomingEnabled(true);
    cy.userPanningEnabled(true);
    gearBtn.classList.remove("hidden");
  };
}

// =========================
// RUN QUIZ (MODAL)
// =========================

function runQuiz(nodeData) {
  const nodeId = nodeData.id;
  const progressData = questionProgress[nodeId];

  const bestScore = progressData?.bestScore || 0;
  const total = progressData?.quizlength || nodeData.quiz.length;
  questionProgress[nodeId].quizlength = nodeData.quiz.length;


  const quiz = nodeData.quiz;
  if (quiz.length === 0) {
    progress[nodeId] = true;
    updateColors(nodeId);
    return;
  }
  createQCMModal();
  const modalHeader = document.querySelector("#qcm-header h2");
  modalHeader.textContent = nodeData.label;
  const container = document.getElementById("qcm-container");
  

  container.innerHTML = `
    <div class="quiz-intro">

      <p>🏆 Meilleur score : <strong>${bestScore} / ${total}</strong></p>

      <button class="start-btn">Commencer</button>
    </div>
  `;

  container.querySelector(".start-btn").onclick = () => {
    startQuiz();
  };


  let score = 0;
  function handleAnswer(isCorrect) {
    if (isCorrect) {
      score++;
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, zIndex: 1001 });
      setTimeout(() => {
        confetti.reset();
      }, 2000);
      const modalContent = document.querySelector(".qcm-content");
      modalContent.classList.remove("jump");
      void modalContent.offsetHeight;
      modalContent.classList.add("jump");
    }
    else {
      const modalContent = document.querySelector(".qcm-content");
      modalContent.classList.remove("shake");
      void modalContent.offsetWidth;
      modalContent.classList.add("shake");
    }
  }

  let index = 0;
  function startQuiz() {
    index = 0;
    renderCurrent();
  }

  function renderCurrent() {
    const q = quiz[index];

    if (q.type === "qcm") {
      container.innerHTML = renderQCM(q);
      initQCM(container, q, next, handleAnswer);
    }

    if (q.type === "puzzle") {
      container.innerHTML = renderPuzzle(q);
      initPuzzle(container, q, next, handleAnswer);
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

      const total = quiz.length;
      const nodeId = nodeData.id;
      // const threshold = nodeData.validationThreshold || 0.7;

      const previousBest = questionProgress[nodeId].bestScore || 0;
      const newBest = Math.max(previousBest, score);

      const prevStars = Math.max(3 - total + previousBest, 0);
      const newStars = Math.max(3 - total + newBest, 0);

      const gainedStars = newStars - prevStars;

      if (gainedStars > 0) {
        showStarsAnimation(prevStars, newStars, nodeId);
      }

      questionProgress[nodeId].bestScore = newBest;

      // const ratio = newBest / total;

      if (newBest >= quiz.length-3) {
        questionProgress[nodeId].validated = true;
        progress[nodeId] = true; // 🔥 débloque le noeud
      }

      saveProgress();
      document.getElementById('qcm-modal').remove();
      document.getElementById('gear-btn').classList.remove("hidden");
    } else {
      renderCurrent();
    }
  }
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
          <span class = choice-text>${c.text}</span>
          <span class="choice-feedback">${c.feedback}</span>
        </label>
      `).join("")}
    </div>

    <div class="qcm-buttons">
      <div class="left">
        <button class="triche-btn">Tricher</button>
      </div>
      <div class="center">
        <button class="validate-btn">Valider</button>
      </div>
      <div class="right"></div>
    </div>
  </div>
  `;
}

function initQCM(container, q, next, handleAnswer) {
  const btn = container.querySelector(".validate-btn");
  const feedback = container.querySelector(".feedback");

  container.querySelector(".triche-btn").onclick = (e) => {
    handleAnswer(true);
    const rightZone = container.querySelector(".qcm-buttons .right");
    rightZone.innerHTML = `<button class="next-btn">Suivant ➔</button>`;
    container.querySelector(".next-btn").onclick = next;
  }
  
  btn.onclick = () => {
    const inputs = container.querySelectorAll("input");
    let correct = true;

    container.querySelectorAll(".choice-text").forEach(el => {
      el.style.fontWeight = "bold";
    })
    // afficher feedbacks
    container.querySelectorAll(".choice-feedback").forEach(el => {
      el.classList.add("visible");
    });

    inputs.forEach((input) => {
      const isChecked = input.checked;
      const isCorrect = q.choices[input.dataset.id].correct;
      const label = input.closest(".choice");
      if (isCorrect) label.classList.add("correct");
      if (isChecked && !isCorrect) label.classList.add("wrong");
      if (isChecked !== isCorrect) correct = false;
    });

    handleAnswer(correct);

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
        <button class="triche-btn">Tricher</button>
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

function initPuzzle(container, puzzle, next, handleAnswer) {
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

  container.querySelector(".triche-btn").onclick = (e) => {
    handleAnswer(true);
    const rightZone = container.querySelector(".qcm-buttons .right");
    rightZone.innerHTML = `<button class="next-btn">Suivant ➔</button>`;
    container.querySelector(".next-btn").onclick = next;
  }

  // Validation
  container.querySelector(".validate-btn").onclick = (e) => {
    const userIds = [...answer.children].map(el => Number(el.dataset.id));
    const correct = puzzle.solutionIdsList.some(sol => arraysEqual(sol, userIds));
    const valBtn = e.target;
    const resetBtn = container.querySelector(".reset-btn");

    handleAnswer(correct);

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

function showStarsAnimation(prevStars, newStars, nodeId) {

  const overlay = document.createElement("div");
  overlay.className = "stars-overlay";

  const container = document.createElement("div");
  container.className = "stars-line";

  overlay.appendChild(container);
  document.body.appendChild(overlay);

  const stars = [];

  // créer toutes les étoiles
  for (let i = 0; i < newStars; i++) {
    const star = document.createElement("span");
    star.style.pointerEvents = "none";
    star.textContent = "⭐";

    if (i < prevStars) {
      star.classList.add("visible");
    } else {
      star.classList.add("hidden-star");
    }

    container.appendChild(star);
    stars.push(star);
  }

  // animation apparition
  let i = prevStars;

  function animateNext() {
    if (i >= newStars) {
      setTimeout(flyToNode, 800);
      return;
    }

    const star = stars[i];

    star.classList.remove("hidden-star");
    star.classList.add("star-pop");

    void star.offsetWidth;
    star.classList.add("animate");

    i++;
    setTimeout(animateNext, starApparitionDelay);
  }
  setTimeout(animateNext, 300);

  // ✨ phase de vol
  function flyToNode() {
  const target = getNodeScreenPosition(nodeId);

  // 1. D'abord, on capture toutes les positions réelles actuelles
  const positions = stars.map(star => star.getBoundingClientRect());

  // 2. Ensuite, on applique le style fixed sans perturber les autres
  stars.forEach((star, index) => {
    const rect = positions[index];

    star.style.position = "fixed";
    star.style.left = rect.left + "px";
    star.style.top = rect.top + "px";
    star.style.margin = "0";
    
    // On retire les classes d'animation précédentes
    star.classList.remove("animate", "star-pop");
  });

  // 3. Forcer le layout
  void document.body.offsetWidth;

  // 4. Lancer l'animation de vol
  stars.forEach((star, index) => {
    const rect = positions[index];

    // Calcul de la distance relative
    const dx = target.x - (rect.left + rect.width / 2);
    const dy = target.y - (rect.top + rect.height / 2);

    star.style.transition = `transform ${starFlyDuration}ms cubic-bezier(0.3,1.5,0.5,1), opacity ${starFlyDuration}ms`;
    star.style.transitionDelay = `${index * starFlyDelay}ms`;

    // Utiliser translate pour le mouvement
    star.style.transform = `translate(${dx}px, ${dy}px) scale(0.2)`;
    star.style.opacity = "0";
  });
  setTimeout(()=> updateColors(nodeId), starFlyDelay*stars.length); // Met à jour les couleurs une fois que les étoiles ont atteint le noeud
  setTimeout(() => {
    overlay.remove();
    cy.autoungrabify(false);
    cy.autounselectify(false);
    cy.userZoomingEnabled(true);
    cy.userPanningEnabled(true);
  }, waitDurationAfterStarsFly); // Délai un peu plus long pour laisser finir
}

}

function getNodeScreenPosition(nodeId) {
  const node = cy.getElementById(nodeId);
  const pos = node.renderedPosition();

  const rect = cy.container().getBoundingClientRect();

  return {
    x: rect.left + pos.x,
    y: rect.top + pos.y
  };
}