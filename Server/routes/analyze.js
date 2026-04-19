import express from 'express';
import { detectBugsDynamic } from '../services/geminiService.js';

const router = express.Router();

// Main analyze endpoint
router.post('/analyze', async (req, res, next) => {
  const startTime = Date.now();
  
  try {
    const { code, language = 'auto' } = req.body;
    
    // Validation
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ 
        error: 'No code provided',
        hint: 'Please paste your Python or JavaScript code',
        timestamp: new Date().toISOString()
      });
    }
    
    if (code.trim() === '') {
      return res.status(400).json({ 
        error: 'Empty code',
        hint: 'Please paste some code to analyze',
        timestamp: new Date().toISOString()
      });
    }
    
    if (code.length > 50000) {
      return res.status(400).json({ 
        error: 'Code too long',
        hint: 'Please paste code less than 50000 characters',
        timestamp: new Date().toISOString()
      });
    }
    
    // Detect bugs using AI
    const analysis = await detectBugsDynamic(code, language);
    
    // Add metadata
    const response = {
      ...analysis,
      timestamp: new Date().toISOString(),
      processingTime: `${Date.now() - startTime}ms`,
      usingAI: !!process.env.GEMINI_API_KEY,
      dynamic: true,
      version: '2.0.0'
    };
    
    // Log success
    console.log(` Analysis completed in ${Date.now() - startTime}ms | Bug: ${analysis.bug?.type || 'none'}`);
    
    res.json(response);
    
  } catch (error) {
    console.error('Analysis error:', error);
    next(error);
  }
});

// Batch analyze (for multiple code snippets)
router.post('/analyze-batch', async (req, res, next) => {
  try {
    const { codes } = req.body;
    
    if (!codes || !Array.isArray(codes)) {
      return res.status(400).json({ error: 'Array of codes required' });
    }
    
    const results = await Promise.all(
      codes.map(async (code, index) => {
        try {
          const analysis = await detectBugsDynamic(code);
          return { index, ...analysis };
        } catch (err) {
          return { index, error: err.message };
        }
      })
    );
    
    res.json({
      results,
      timestamp: new Date().toISOString(),
      totalProcessed: codes.length
    });
    
  } catch (error) {
    next(error);
  }
});

export default router;