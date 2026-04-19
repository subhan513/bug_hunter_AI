import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import analyzeRoutes from './routes/analyze.js';
import generateQuestionRoutes from './routes/generateQuestion.js';
import statsRoutes from './routes/stats.js';

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

app.use('/api', analyzeRoutes);
app.use('/api/interview', generateQuestionRoutes);
app.use('/api/stats', statsRoutes);

app.get('/health', (req, res) => {
    res.send({ message: "Api is Working" });
});

app.listen(PORT, () => {
    console.log(`Server is running on the port ${PORT}`);
});

export default app;