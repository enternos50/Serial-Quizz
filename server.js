const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { OpenAI } = require('openai');

const app = express();
app.use(cors());

if (!process.env.OPENAI_API_KEY) {
  console.error("❌ OPENAI_API_KEY manquante");
  process.exit(1);
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.get('/api/quiz', async (req, res) => {
  try {
    console.log("Requête API reçue");

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // ou 'gpt-3.5-turbo' si tu n'as pas accès à GPT-4
      messages: [
        {
          role: 'user',
          content: `Génère une question QCM sur l'intelligence artificielle, au format :
{
  "text": "question",
  "options": ["option1", "option2", "option3", "option4"],
  "correct": "bonne réponse"
}`
        },
      ],
    });

    console.log("Réponse OpenAI reçue:", completion);

    const content = completion.choices[0].message.content;
    let question;

    try {
      question = JSON.parse(content);
    } catch (err) {
      console.error("Erreur de parsing JSON :", err);
      return res.status(500).json({ error: "Réponse invalide de l'API", raw: content });
    }

    res.json(question);
  } catch (error) {
    console.error("❌ Erreur OpenAI:", error.response?.data || error.message || error);
    res.status(500).json({ error: "Erreur lors de la génération de la question." });
  }
});

// Render impose d'écouter sur process.env.PORT
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Serveur en ligne sur le port ${PORT}`);
});
