const socket = io();

let myScore = 0;

console.log("Client chargé");

socket.on('connect', () => {
  console.log('Connecté au serveur avec ID :', socket.id);
});

socket.on('quizData', data => {
  console.log('Question reçue :', data);  // Ajoutez ce log
  showQuestion(data);
  myScore = 0;
  updateScore(myScore);
});

socket.on('nextQuestion', ({ question, scores }) => {
  showQuestion(question);
  if (scores[socket.id] !== undefined) {
    myScore = scores[socket.id];
    updateScore(myScore);
  }
});

socket.on('quizEnd', scores => {
  document.getElementById('question-text').textContent = "Fin du quiz 🎉";
  document.getElementById('options-container').innerHTML = "";
  if (scores[socket.id] !== undefined) {
    myScore = scores[socket.id];
  }
  updateScore(myScore);
});

function showQuestion(data) {
  console.log('Affichage de la question :', data);  // Ajoutez ce log
  const questionEl = document.getElementById('question-text');
  const optionsContainer = document.getElementById('options-container');

  questionEl.textContent = data.question;
  optionsContainer.innerHTML = "";

  data.answers.forEach(answer => {
    const btn = document.createElement('button');
    btn.textContent = answer;
    btn.addEventListener('click', () => {
      socket.emit('answer', answer);
      // désactive tous les boutons après réponse
      document.querySelectorAll('#options-container button').forEach(b => b.disabled = true);
    });
    optionsContainer.appendChild(btn);
  });
}

function updateScore(score) {
  document.getElementById('score').textContent = `Score: ${score}`;
}
