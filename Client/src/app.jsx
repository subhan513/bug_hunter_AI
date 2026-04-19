import { useState } from 'preact/hooks';
import './app.css';
import CodeEditor from './components/CodeEditor.jsx';
import AnalysisResults from './components/AnalysisResults.jsx';
import InterviewLobby from './components/InterviewLobby.jsx';
import InterviewSession from './components/InterviewSession.jsx';
import { analyzeCode, getInitialProgress } from './utils/api.js';

const VIEWS = {
  LANDING: 'landing',
  HUNT: 'hunt',
  LOBBY: 'lobby',
  SESSION: 'session'
};

export function App() {
  const [view, setView] = useState(VIEWS.LANDING);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('auto');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Interview States
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [userStats, setUserStats] = useState(() => {
    const saved = localStorage.getItem('bug_hunter_stats');
    return saved ? JSON.parse(saved) : { totalPoints: 0, currentLevel: 'BEGINNER', currentStreak: 0 };
  });

  // Fetch initial points if not in localStorage
  useState(() => {
    if (!localStorage.getItem('bug_hunter_stats')) {
      getInitialProgress('guest').then(res => {
        setUserStats(res.progress);
        localStorage.setItem('bug_hunter_stats', JSON.stringify(res.progress));
      });
    }
  });

  const handleAnalyze = async () => {
    if (!code.trim()) {
      setError('Please enter some code to analyze');
      return;
    }
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      const data = await analyzeCode(code, language);
      setResults(data);
    } catch (err) {
      setError(err.error || 'Server connection failed. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartInterview = (question) => {
    setCurrentQuestion(question);
    setView(VIEWS.SESSION);
  };

  const handleSessionComplete = (updatedStats) => {
    setUserStats(updatedStats);
    localStorage.setItem('bug_hunter_stats', JSON.stringify(updatedStats));
    setView(VIEWS.LOBBY);
  };

  if (view === 'landing') {
    return (
      <div className="landing-container animate-fade">
        <header className="hero-header">
          <div className="logo-container">
            <div className="neon-border" style={{ padding: '0.4rem', borderRadius: '8px', display: 'flex' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20V10" />
                <path d="M18 9a6 6 0 0 0-12 0" />
                <path d="M12 13V13.01" />
                <path d="M4.93 4.93 4.93 4.93" />
                <path d="M19.07 4.93 19.07 4.93" />
                <path d="m2 13 3-1" />
                <path d="m22 13-3-1" />
                <path d="m20.94 18.06-2.94-2.06" />
                <path d="m3.06 18.06 2.94-2.06" />
              </svg>
            </div>
            <div style={{ textAlign: 'left' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Bug Hunter AI</h2>
              <p style={{ fontSize: '0.6rem', color: 'var(--accent)', letterSpacing: '0.2em', marginTop: '-2px' }}>DEBUG • LEARN • INTERVIEW</p>
            </div>
          </div>
          
          <div className="nav-links">
            <span onClick={() => setView(VIEWS.HUNT)}>DEBUG</span>
            <span onClick={() => alert('Coming soon: Deep dive lessons!')}>LEARN</span>
            <span onClick={() => setView(VIEWS.LOBBY)}>INTERVIEW</span>
          </div>

          <div className="user-stats">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ filter: userStats.currentStreak > 0 ? 'grayscale(0)' : 'grayscale(1)' }}></span>
              <span style={{ color: 'var(--text-dim)' }}>{userStats.currentStreak || 0} day streak</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: 'var(--medium)' }}>★</span>
              <span>{userStats.totalPoints || 0} <span style={{ color: 'var(--text-dim)' }}>pts</span></span>
            </div>
            <div style={{ cursor: 'pointer' }} title={`Level: ${userStats.currentLevel}`}></div>
          </div>
        </header>

        <main>          
          <h1 className="hero-title">
            Hunt bugs.<br />
            <span className="gradient-text-green">Master FAANG interviews.</span>
          </h1>

          <p className="hero-subtitle">
            An AI debugging coach that teaches through progressive hints — never spoon-feeding answers. 
            Then practice real Google, Meta & Amazon interview bugs.
          </p>
          
          <div className="btn-group">
            <button className="btn-primary" onClick={() => setView(VIEWS.HUNT)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="M22 12h-2"/><path d="m19.07 19.07-1.41-1.41"/><path d="M12 22v-2"/><path d="m6.34 17.66-1.41 1.41"/><path d="M2 12h2"/><path d="m4.93 19.07 1.41-1.41"/><path d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z"/></svg>
              Start hunting
            </button>
            <button className="btn-secondary" onClick={() => setView(VIEWS.LOBBY)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1 0-4.88 2.5 2.5 0 0 1 0-4.88A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 0-4.88 2.5 2.5 0 0 0 0-4.88A2.5 2.5 0 0 0 14.5 2Z"/></svg>
              FAANG mode
            </button>
          </div>

          <div className="feature-grid">
            <div className="feature-card glass">
              <div className="icon-box"></div>
              <h4>10+ bug patterns</h4>
              <p>Python & JS</p>
            </div>
            <div className="feature-card glass">
              <div className="icon-box"></div>
              <h4>5 FAANG bugs</h4>
              <p>real interview Qs</p>
            </div>
            <div className="feature-card glass">
              <div className="icon-box"></div>
              <h4>Streaks & achievements</h4>
              <p>stay consistent</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (view === VIEWS.LOBBY) {
    return (
      <div className="animate-fade">
        <header style={{ marginBottom: '2rem', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 className="gradient-text-green" style={{ fontSize: '1.5rem', cursor: 'pointer' }} onClick={() => setView(VIEWS.LANDING)}>Bug Hunter AI</h1>
          <div className="user-stats">
            <span>★ {userStats.totalPoints} pts</span>
            <span>{userStats.currentLevel}</span>
          </div>
        </header>
        <InterviewLobby userStats={userStats} onStartSession={handleStartInterview} />
      </div>
    );
  }

  if (view === VIEWS.SESSION) {
    return (
      <div className="animate-fade">
        <InterviewSession 
          question={currentQuestion} 
          userStats={userStats} 
          onComplete={handleSessionComplete}
          onExit={() => setView(VIEWS.LOBBY)}
        />
      </div>
    );
  }

  return (
    <div id="app" className="animate-fade" style={{ paddingTop: '2rem' }}>
      <header style={{ marginBottom: '3rem', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="gradient-text-green" style={{ fontSize: '2rem', marginBottom: '0.2rem' }}>
            Bug Hunter AI
          </h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>
            Hunt the bug, master the concept.
          </p>
        </div>
        <button className="btn-secondary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.8rem' }} onClick={() => setView('landing')}>
          Back to Lobby
        </button>
      </header>

      <main style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2rem', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <CodeEditor 
            code={code} 
            setCode={setCode} 
            language={language} 
            setLanguage={setLanguage} 
          />
          <button 
            className="btn-primary neon-glow" 
            style={{ width: '100%', padding: '1.2rem', justifyContent: 'center' }}
            onClick={handleAnalyze}
            disabled={loading}
          >
            {loading ? 'Analyzing...' : 'Hunt Bugs'}
          </button>
          {error && (
            <div className="glass" style={{ padding: '1rem', border: '1px solid var(--critical)', color: 'var(--critical)', background: 'rgba(239, 68, 68, 0.05)' }}>
              <strong>Error:</strong> {error}
            </div>
          )}
        </div>
        <AnalysisResults results={results} loading={loading} />
      </main>
    </div>
  );
}
