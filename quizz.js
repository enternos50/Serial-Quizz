let currentQuestion = 0;
let score = 0;

function displayLoadingMessage() {
    document.getElementById('question-text').textContent = '🤖 Génération de la question IA en cours...';
    document.getElementById('options-container').innerHTML = '';
}


async function getQuestion() {
    try {
        displayLoadingMessage();

        const response = await fetch('http://localhost:3000/api/quiz');
        if (!response.ok) throw new Error("Erreur réseau");

        const question = await response.json();
        return question;
    } catch (error) {
        console.error('Erreur lors de la génération de la question IA :', error);
        document.getElementById('question-text').textContent = "Impossible de générer une question pour le moment.";
        return null;
    }
}


function displayQuestion(question) {
    const questionText = document.getElementById('question-text');
    const optionsContainer = document.getElementById('options-container');
    
    questionText.textContent = question.text;
    optionsContainer.innerHTML = '';
    
    question.options.forEach(option => {
        const button = document.createElement('button');
        button.textContent = option;
        button.addEventListener('click', () => checkAnswer(option, question.correct));
        optionsContainer.appendChild(button);
    });
}

function checkAnswer(selected, correct) {
    if (selected === correct) {
        score++;
        document.getElementById('score').textContent = `Score: ${score}`;
    }
}

document.getElementById('next-btn').addEventListener('click', async () => {
    const question = await getQuestion();
    displayQuestion(question);
});

// Initialisation
window.addEventListener('load', async () => {
    const question = await getQuestion();
    displayQuestion(question);
});