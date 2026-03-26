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

  if (!qcms || qcms.length === 0) return;

  createQCMModal();

  const modal = document.getElementById("qcm-modal");
  const container = document.getElementById("qcm-container");

  let currentIndex = questionProgress[nodeId] || 0;


  function renderQuestion() {
    if (currentIndex >= qcms.length) return ;
    const q = qcms[currentIndex];
    console.log(currentIndex)
    console.log(qcms[0])
    container.innerHTML = `
      <h2>${q.question}</h2>

      ${q.choices.map((c, i) => `
        <label>
          <input type="checkbox" data-index="${i}">
          ${c.text}
        </label><br>
      `).join("")}

      <button id="validate-btn">Valider</button>

      <div id="feedback"></div>
    `;

    document.getElementById("validate-btn").onclick = () => {
      handleValidation(q);
    };
  }

  function handleValidation(q) {
    const inputs = container.querySelectorAll("input");
    let correct = true;

    inputs.forEach((input, i) => {
      const isChecked = input.checked;
      const isCorrect = q.choices[i].correct;

      if (isChecked !== isCorrect) {
        correct = false;
      }
    });

    const feedbackDiv = document.getElementById("feedback");

    feedbackDiv.innerHTML = `
      <p>${correct ? "✅ Bonne réponse" : "❌ Mauvaise réponse"}</p>
      <p>${q.explication || ""}</p>
      <button id="next-btn">Suivant</button>
    `;

    document.getElementById("next-btn").onclick = () => {
      currentIndex++;
      questionProgress[nodeId] = currentIndex
      saveProgress();

      if (currentIndex >= qcms.length) {
        container.innerHTML = `<h2>🎉 Terminé !</h2>`;
      } else {
        renderQuestion();
      }
    };
  }
  // bouton fermeture
  modal.querySelector(".qcm-close").onclick = () => {
    saveProgress();
    modal.remove();
  };

  renderQuestion();
}