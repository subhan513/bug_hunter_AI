import express from 'express';
import { 
    getUserProgress, 
    updateProgress, 
    calculateReadinessScore,
    DIFFICULTY_LEVELS 
} from '../services/difficultyManager.js';

const router = express.Router();

// Get initial progress structure
router.get('/init/:userId', (req, res) => {
    const progress = getUserProgress(req.params.userId || 'guest');
    res.json({ success: true, progress, levels: DIFFICULTY_LEVELS });
});

// Update progress after solving a question
router.post('/update', (req, res) => {
    try {
        const { progress, question, hintsUsed, success, timeTaken } = req.body;
        
        if (!progress || !question) {
            return res.status(400).json({ error: 'Missing progress or question data' });
        }
        
        const updatedProgress = updateProgress(progress, question, hintsUsed, success, timeTaken);
        const readiness = calculateReadinessScore(updatedProgress);
        
        res.json({ 
            success: true, 
            progress: updatedProgress,
            readiness
        });
    } catch (error) {
        console.error('Stats update error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get readiness score
router.post('/readiness', (req, res) => {
    const { progress } = req.body;
    const readiness = calculateReadinessScore(progress);
    res.json({ success: true, readiness });
});

export default router;
