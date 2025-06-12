const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { OpenAI } = require('openai');

const app = express();
app.use(cors());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
    let question;

    try {
      question = JSON.parse(content);
    } catch (err) {
      console.error("JSON parsing failed:", err);
      return res.status(500).json({ error: "Invalid JSON format", raw: content });
    }

    res.json(question);
  } catch (error) {
    console.error("OpenAI error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Serveur en ligne sur le port ${PORT}`);
});
