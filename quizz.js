async function loadQuestion() {
  const questionEl = document.getElementById('question');
  const answersEl = document.getElementById('answers');
  const statusEl = document.getElementById('status');
  questionEl.textContent = 'Chargement...';
  answersEl.innerHTML = '';
  statusEl.textContent = '';

  try {
    const res = await fetch('https://quizz-ia.onrender.com/api/quiz');
    const data = await res.json();

    if (!data.text || !data.options || !data.correct) {
      throw new Error("Données incomplètes");
    }

    questionEl.textContent = data.text;
    data.options.forEach(option => {
      const btn = document.createElement('button');
      btn.textContent = option;
      btn.onclick = () => {
        if (option === data.correct) {
          statusEl.textContent = "✅ Bonne réponse !";
          statusEl.style.color = "green";
        } else {
          statusEl.textContent = `❌ Mauvaise réponse ! La bonne réponse était : ${data.correct}`;
          statusEl.style.color = "red";
        }
      };
      answersEl.appendChild(btn);
    });
  } catch (err) {
    questionEl.textContent = "Erreur lors du chargement 😓";
    statusEl.textContent = err.message;
    statusEl.style.color = "red";
  }
}

window.onload = loadQuestion;
