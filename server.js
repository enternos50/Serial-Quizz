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
  console.log('Nouveau joueur connecté :', socket.id);
  players[socket.id] = { score: 0, answered: false, pseudo: null };
  
  socket.on('replay', () => {
  if (quizData[0]) {
    players[socket.id].score = 0;
    players[socket.id].answered = false;
    socket.emit('quizData', quizData[0]);
  }
});

  socket.on('setPseudo', pseudo => {
    if (players[socket.id]) {
      players[socket.id].pseudo = pseudo;
      console.log(`👤 Joueur "${pseudo}" connecté (ID: ${socket.id})`);

      // Envoyer la première question
      if (quizData[currentQuestion]) {
        socket.emit('quizData', quizData[currentQuestion]);
      }
    }
  });

  socket.on('answer', answer => {
    const player = players[socket.id];
    if (!player || player.answered) return;

    const correctAnswer = quizData[currentQuestion].correct;
    if (answer === correctAnswer) {
      player.score++;
    }

    player.answered = true;

    const allAnswered = Object.values(players).every(p => p.answered);
    if (allAnswered) {
      const scores = {};
      for (let id in players) {
        scores[id] = {
          score: players[id].score,
          pseudo: players[id].pseudo || "Anonyme"
        };
        players[id].answered = false;
      }

      currentQuestion++;

      if (currentQuestion < quizData.length) {
        io.emit('nextQuestion', {
          question: quizData[currentQuestion],
          scores
        });
      } else {
        io.emit('quizEnd', scores);
        currentQuestion = 0;
        for (let id in players) {
          players[id].score = 0;
          players[id].answered = false;
        }
      }
    }
  });

  socket.on('disconnect', () => {
    console.log('Joueur déconnecté :', socket.id);
    delete players[socket.id];
  });
});




server.listen(3000, () => {
  console.log('✅ Serveur démarré sur http://localhost:3000');
});
