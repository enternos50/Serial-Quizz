import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { Configuration, OpenAIApi } from 'openai';

const app = express();
app.use(cors());

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

app.get('/api/quiz', async (req, res) => {
  try {
    const prompt = `Génère une question à choix multiples sur l'intelligence artificielle. 
    Formate strictement la réponse en JSON ainsi :
    {
      "text": "question",
      "options": ["réponse1", "réponse2", "réponse3", "réponse4"],
      "correct": "la bonne réponse"
    }`;

    const completion = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    });

    const raw = completion.data.choices[0].message.content;
    const question = JSON.parse(raw);
    res.json(question);
  } catch (error) {
    console.error('Erreur IA:', error);
    res.status(500).json({ error: 'Erreur IA ou parsing' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Serveur démarré sur http://localhost:${PORT}`));
