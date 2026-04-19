import { useState, useEffect } from 'preact/hooks';
import CodeEditor from './CodeEditor.jsx';
import { updateProgress } from '../utils/api';
import CompanyIcon from './CompanyIcon';

const InterviewSession = ({ question, userStats, onComplete, onExit }) => {
  // ... (rest of the component state)
  const [code, setCode] = useState(question.buggyCode);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [timer, setTimer] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(t => {
        if (t >= question.timeLimit) {
          clearInterval(interval);
          return t;
        }
        return t + 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [question.timeLimit]);

  const formatTime = (s) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getNextHint = () => {
    if (hintsUsed < 3) setHintsUsed(h => h + 1);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // Basic check: did the user change the code?
      // In a real app, we'd run tests or use AI to verify.
      // For this demo, if they changed the code and it doesn't contain the bug pattern, mark as solved.
      const isSolved = code !== question.buggyCode; // Simplified logic
      
      const res = await updateProgress({
        progress: userStats,
        question: question,
        hintsUsed,
        success: isSolved,
        timeTaken: timer
      });

      setResult(res);
    } catch (err) {
      alert('Submission error: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    return (
      <div className="interview-result-overlay animate-fade">
        <div className="result-card glass neon-border">
          <h2 className={result.progress.pointsEarned > 0 ? "text-success" : "text-error"}>
            {result.progress.pointsEarned > 0 ? "MISSION ACCOMPLISHED" : "MISSION FAILED"}
          </h2>
          <div className="stats-summary">
            <p>Points Earned: <span>+{result.progress.pointsEarned}</span></p>
            <p>New Level: <span>{result.progress.currentLevel}</span></p>
            {result.progress.leveledUp && <p className="level-up-tag">LEVEL UP! 🎉</p>}
          </div>
          <button className="btn-primary" onClick={() => onComplete(result.progress)}>Return to Lobby</button>
        </div>
      </div>
    );
  }

  return (
    <div className="interview-session animate-fade">
      <div className="session-sidebar">
        <div className="question-card glass">
          <div className="q-header">
            <div className="company-logo-pill">
              <CompanyIcon name={question.company} />
              <span className="q-badge">{question.company}</span>
            </div>
            <span className={`q-diff ${question.difficulty.toLowerCase()}`}>{question.difficulty}</span>
          </div>
          <h2 className="q-title">{question.title}</h2>
          <p className="q-desc">{question.description}</p>
          
          <div className={`timer-box ${timer >= question.timeLimit ? 'critical-glow' : ''}`}>
             ⏱️ {formatTime(timer)} / {formatTime(question.timeLimit)}
             {timer >= question.timeLimit && <div style={{ color: 'var(--critical)', fontSize: '0.8rem', marginTop: '0.5rem', fontWeight: 800 }}>TIME IS UP!</div>}
          </div>
        </div>

        <div className="hints-section">
          <h3>Hints ({hintsUsed}/3)</h3>
          {hintsUsed >= 1 && <div className="hint-pill animate-fade">{question.hint1}</div>}
          {hintsUsed >= 2 && <div className="hint-pill animate-fade">{question.hint2}</div>}
          {hintsUsed >= 3 && <div className="hint-pill animate-fade">{question.hint3}</div>}
          
          {hintsUsed < 3 && (
            <button className="btn-secondary hint-btn" onClick={getNextHint}>
              Get Hint (-15% pts)
            </button>
          )}
        </div>
      </div>

      <div className="session-editor">
        <CodeEditor code={code} setCode={setCode} language="javascript" />
        <div className="session-controls">
          <button className="btn-secondary" onClick={onExit}>Exit Session</button>
          <button className="btn-primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Verifying...' : 'Submit Solution'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InterviewSession;
