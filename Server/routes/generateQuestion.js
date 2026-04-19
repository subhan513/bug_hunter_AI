import express from 'express';
import { 
  generateInterviewQuestion, 
  generateMultipleQuestions,
  generateQuestionsByDifficulty,
  generateQuestionsByCompany,
  getAvailableTopics 
} from '../services/questionGenerator.js';

const router = express.Router();

// ============ SINGLE QUESTION ============
router.post('/generate-question', async (req, res) => {
  try {
    const { topic, difficulty = 'Medium', company = null } = req.body;
    
    if (!topic || typeof topic !== 'string') {
      return res.status(400).json({ 
        error: 'Topic is required',
        hint: 'e.g., "closures", "async/await", "race conditions"'
      });
    }
    
    const result = await generateInterviewQuestion(topic, difficulty, company);
    res.json(result);
    
  } catch (error) {
    console.error('Generation error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============ MULTIPLE QUESTIONS (BATCH) ============
router.post('/generate-multiple', async (req, res) => {
  try {
    const { topics, count = 5, difficulty = null, company = null } = req.body;
    
    if (!topics || (Array.isArray(topics) && topics.length === 0)) {
      return res.status(400).json({ 
        error: 'Topics array is required',
        hint: 'e.g., ["closures", "async/await", "race conditions"]'
      });
    }
    
    const result = await generateMultipleQuestions(topics, count, difficulty, company);
    res.json(result);
    
  } catch (error) {
    console.error('Batch generation error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============ BY DIFFICULTY ============
router.post('/generate-by-difficulty', async (req, res) => {
  try {
    const { difficulty, count = 3 } = req.body;
    
    if (!difficulty) {
      return res.status(400).json({ 
        error: 'Difficulty is required',
        hint: 'Easy, Medium, or Hard'
      });
    }
    
    const result = await generateQuestionsByDifficulty(difficulty, count);
    res.json(result);
    
  } catch (error) {
    console.error('Difficulty generation error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============ BY COMPANY ============
router.post('/generate-by-company', async (req, res) => {
  try {
    const { company, count = 3 } = req.body;
    
    if (!company) {
      return res.status(400).json({ 
        error: 'Company is required',
        hint: 'Google, Meta, Amazon, Microsoft, Netflix'
      });
    }
    
    const result = await generateQuestionsByCompany(company, count);
    res.json(result);
    
  } catch (error) {
    console.error('Company generation error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============ GET AVAILABLE TOPICS ============
router.get('/available-topics', (req, res) => {
  res.json({
    success: true,
    topics: getAvailableTopics(),
    difficulties: ['Easy', 'Medium', 'Hard'],
    companies: ['Google', 'Meta', 'Amazon', 'Microsoft', 'Netflix']
  });
});

export default router;