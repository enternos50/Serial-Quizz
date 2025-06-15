// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

const quizData = [
  {
    question: "Quelle est la capitale de la France ?",
    answers: ["Paris", "Londres", "Berlin", "Madrid"],
    correct: "Paris"
  },
  {
    question: "Combien font 7 x 6 ?",
    answers: ["42", "36", "49", "56"],
    correct: "42"
  },
  {
    question: "Quel est l'océan le plus grand du monde ?",
    answers: ["Atlantique", "Arctique", "Indien", "Pacifique"],
    correct: "Pacifique"
  },
  {
    question: "Qui a écrit 'Les Misérables' ?",
    answers: ["Victor Hugo", "Émile Zola", "Molière", "Balzac"],
    correct: "Victor Hugo"
  }
];

let players = {};
let currentQuestion = 0;

io.on('connection', socket => {
  console.log('Nouveau joueur : ' + socket.id);
  players[socket.id] = { score: 0, answered: false };

  // Envoie la question courante au nouveau joueur
  socket.emit('quizData', quizData[currentQuestion]);

  socket.on('answer', answer => {
    if (players[socket.id].answered) return; // joueur a déjà répondu

    const correct = quizData[currentQuestion].correct;
    if (answer === correct) {
      players[socket.id].score++;
    }
    players[socket.id].answered = true;

    // Vérifie si tous les joueurs ont répondu
    const allAnswered = Object.values(players).every(p => p.answered);
    if (allAnswered) {
      // Prépare les scores à envoyer
      const scores = {};
      for (let id in players) {
        scores[id] = players[id].score;
        players[id].answered = false; // reset pour prochaine question
      }
      currentQuestion++;

      if (currentQuestion < quizData.length) {
        io.emit('nextQuestion', {
          question: quizData[currentQuestion],
          scores
        });
      } else {
        io.emit('quizEnd', scores);
      }
    }
  });

  socket.on('disconnect', () => {
    console.log('Joueur déconnecté : ' + socket.id);
    delete players[socket.id];
  });
});

server.listen(3000, () => {
  console.log('Serveur démarré sur http://localhost:3000');
});

if (currentQuestion < quizData.length) {
  io.emit('nextQuestion', {
    question: quizData[currentQuestion],
    scores
  });
} else {
  io.emit('quizEnd', scores);
  currentQuestion = 0;   // <- Réinitialiser le quiz ici
  // Optionnel: remettre à zéro les scores aussi
  for (let id in players) {
    players[id].score = 0;
    players[id].answered = false;
  }
}
