const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { OpenAI } = require('openai');

const app = express();
app.use(cors());

// 🔐 Vérifie que la clé est bien chargée
if (!process.env.OPENAI_API_KEY) {
  console.error("❌ OPENAI_API_KEY manquante dans le fichier .env");
  process.exit(1);
} else {
  console.log("🔐 OPENAI_API_KEY: OK");
}

// ⚙️ Configuration OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ✅ Route d'accueil
app.get('/', (req, res) => {
  res.send('✅ API Quiz IA en ligne. Utilise /api/quiz pour obtenir une question.');
});

// 🔍 Route pour générer un quiz
app.get('/api/quiz', async (req, res) => {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'user',
          content: `Génère une question QCM sur l'intelligence artificielle, au format :
{
  "text": "question",
  "options": ["option1", "option2", "option3", "option4"],
  "correct": "bonne réponse"
}`,
        },
      ],
    });

    const content = completion.choices[0].message.content;

    try {
      const question = JSON.parse(content);
      res.json(question);
    } catch (err) {
      console.error("❌ Erreur de parsing JSON :", err);
      res.status(500).json({ error: "Le format JSON retourné est invalide", raw: content });
    }

  } catch (error) {
    console.error("❌ Erreur OpenAI :", error);
    res.status(500).json({ error: "Erreur lors de la génération de la question" });
  }
});

// 🟢 Port dynamique (obligatoire sur Render)
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`✅ Serveur en ligne sur le port ${PORT}`);
});
