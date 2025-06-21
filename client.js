const socket = io();
let myScore = 0;
let myPseudo = prompt("Entrez votre pseudo :") || "Anonyme";

// Envoyer le pseudo au serveur
socket.emit("setPseudo", myPseudo);

console.log("Client chargé");


console.log("Client chargé");

socket.on('connect', () => {
  console.log('Connecté au serveur avec ID :', socket.id);
});

document.getElementById('player-pseudo').textContent = `Pseudo : ${myPseudo}`;


socket.on('quizData', data => {
  console.log('Question reçue :', data);  // Ajoutez ce log
  showQuestion(data);
  myScore = 0;
  updateScore(myScore);
  document.getElementById('leaderboard').classList.add('hidden');
});

socket.on('nextQuestion', ({ question, scores }) => {
  showQuestion(question);
  if (scores[socket.id] !== undefined) {
  myScore = scores[socket.id].score;
  updateScore(myScore);
}
document.getElementById('leaderboard').classList.add('hidden');
});

socket.on('quizEnd', scores => {
  document.getElementById('question-text').textContent = "Fin du quiz 🎉";
  document.getElementById('options-container').innerHTML = "";

  if (scores[socket.id]) {
    myScore = scores[socket.id].score;
  }

  updateScore(myScore);

  // Trier les scores
  const sorted = Object.values(scores).sort((a, b) => b.score - a.score);

  // Cibler les éléments HTML
  const leaderboard = document.getElementById('leaderboard');
  const list = document.getElementById('leaderboard-list');
  list.innerHTML = '';

  // Remplir le classement
  sorted.forEach((p, i) => {
    const li = document.createElement('li');
    li.textContent = `${i + 1}. ${p.pseudo} : ${p.score} point${p.score > 1 ? 's' : ''}`;
    list.appendChild(li);
  });

  leaderboard.classList.remove('hidden');



  // Afficher le bouton rejouer
  replayBtn.style.display = 'inline-block';
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

document.getElementById('question-text').classList.add('quiz-end');

const replayBtn = document.getElementById('replay-btn');

replayBtn.addEventListener('click', () => {
  socket.emit('replay'); // demande au serveur de redémarrer le quiz pour ce client
  replayBtn.style.display = 'none';
});
