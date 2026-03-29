function createQCMModal() {
    const modal = document.createElement("div");
    modal.id = "qcm-modal";
  
    modal.innerHTML = `
      <div class="qcm-content">
        <button class="qcm-close">✖</button>
        <div id="qcm-container"></div>
      </div>
    `;
  
    document.body.appendChild(modal);
  }

function openQCM(nodeData) {
  const nodeId = nodeData.id;
  const qcms = nodeData.quizz;

  if (!qcms || qcms.length === 0) {updateProgress(nodeId); return;};

  createQCMModal();

  const modal = document.getElementById("qcm-modal");
  const container = document.getElementById("qcm-container");

  // ====== RECORD ======

  let bestScore = questionProgress[nodeId].bestScore || 0;

  // ====== CONFIRMATION ======
  container.innerHTML = `
  <div class="qcm-start-screen">
    <h2>🎯 Record actuel : ${bestScore}/${qcms.length}</h2>
    <button id="start-btn">Rejouer</button>
  </div>
`;

  document.getElementById("start-btn").onclick = startSession;

  // ====== SESSION ======
  let currentIndex = 0;
  let sessionScore = 0;
  let selectedAnswers = new Set();

  function startSession() {
    currentIndex = 0;
    sessionScore = 0;
    renderQuestion();
  }

  function renderQuestion() {
    selectedAnswers.clear();
    const progressPercent = Math.round((currentIndex / qcms.length) * 100);
    const q = qcms[currentIndex];

    container.innerHTML = `
  <div class="progress-bar">
    <div class="progress-fill" style="width: ${progressPercent}%"></div>
  </div>

  <h2>${q.question}</h2>

      <div class="choices">
        ${q.choices.map((c, i) => `
          <div class="choice" data-index="${i}">
          <div class="choice-question">
          <strong>
            ${c.text}
          </strong>
          </div>
          <div class="choice-feedback">
          ${c.feedback}
          </div>
          </div>
        `).join("")}
      </div>

      <button id="validate-btn">Valider</button>
      <div id="feedback"></div>
    `;

    // ====== SELECTION ======
    const choiceElements = container.querySelectorAll(".choice");

    choiceElements.forEach(el => {
      el.onclick = () => {
        const index = parseInt(el.dataset.index);

        if (selectedAnswers.has(index)) {
          selectedAnswers.delete(index);
          el.classList.remove("selected");
        } else {
          selectedAnswers.add(index);
          el.classList.add("selected");
        }
      };
    });

    document.getElementById("validate-btn").onclick = (e) => {
      handleValidation(q);
      e.target.remove();
    };
  }

  function handleValidation(q) {
    const feedbackDiv = document.getElementById("feedback");
    const choiceElements = container.querySelectorAll(".choice");
    const choiceFeedbacks = container.querySelectorAll(".choice-feedback");

    let correct = true;

    choiceElements.forEach((el, i) => {
      const isSelected = selectedAnswers.has(i);
      const isCorrect = q.choices[i].correct;

      // Couleurs
      if (isCorrect) {
        el.classList.add("correct");
      } else if (!isCorrect) {
        el.classList.add("wrong");
      }

      // Vérification
      if (isSelected !== isCorrect) {
        correct = false;
      }
    });

    if (correct) sessionScore++;

    // ====== FEEDBACK DETAILLE ======
    choiceFeedbacks.forEach(e=>{e.classList.toggle("visible")})

    feedbackDiv.innerHTML = `
      <p>${correct ? "✅ Bonne réponse" : "❌ Mauvaise réponse"}</p>
  

      <p><strong>${q.explication || ""}</strong></p>

      <button id="next-btn">Suivant</button>
    `;
    

    document.getElementById("next-btn").onclick = () => {
      currentIndex++;

      if (currentIndex >= qcms.length) {
        endSession();
      } else {
        renderQuestion();
      }
    };
  }

  function endSession() {
    // Mise à jour record
    if (sessionScore > bestScore) {
      bestScore = sessionScore;
      questionProgress[nodeId].bestScore =  sessionScore
      updateProgress(nodeId)
      };
    modal.remove()
  }
  modal.addEventListener("click", (e) => {
  if (e.target.id === "qcm-modal") {
    attemptClose();
  }
});

  modal.querySelector(".qcm-close").onclick = () => {
    attemptClose();
  };

  let sessionStarted = false;

function startSession() {
  sessionStarted = true;
  currentIndex = 0;
  sessionScore = 0;
  renderQuestion();
}

function attemptClose() {
  if (sessionStarted && currentIndex < qcms.length) {
    const confirmLeave = confirm("⚠️ Quitter le QCM en cours ?");
    if (!confirmLeave) return;
  }
  modal.remove();
}
}

function updateProgress(n){
  progress[n] = (questionProgress[n].bestScore === questionProgress[n].qcmlength) && isAccessible(n)
  updateColors(n)
}