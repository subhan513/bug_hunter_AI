import { useState } from 'preact/hooks';

const AnalysisResults = ({ results, loading }) => {
  const [hintLevel, setHintLevel] = useState(0);

  if (loading) {
    return (
      <div className="results-container glass" style={{ padding: '2rem', textAlign: 'center' }}>
        <div className="loader"></div>
        <p style={{ marginTop: '1rem', color: 'var(--text-dim)' }}>Bug Hunter AI is analyzing your code...</p>
      </div>
    );
  }
  
  if (!results) {
    return (
      <div className="results-container glass" style={{ padding: '3rem', textAlign: 'center', opacity: 0.6 }}>
        <h3 style={{ marginBottom: '1rem' }}>No Analysis Yet</h3>
        <p style={{ fontSize: '0.9rem' }}>Enter your code on the left and click "Hunt Bugs" to start the interview simulation.</p>
      </div>
    );
  }

  const { bug, hints, feedback, scenario, message } = results;

  const getSeverityClass = (sev) => {
    const s = sev?.toLowerCase();
    if (s === 'critical') return 'critical-bg';
    if (s === 'high') return 'high-bg';
    if (s === 'medium') return 'medium-bg';
    return 'low-bg';
  };

  return (
    <div className="results-container animate-fade">
      {/* Bug Summary Card */}
      <div className="glass" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.2rem' }}>Audit Result</h2>
          {bug && (
            <span className={`severity-tag ${getSeverityClass(bug.severity)}`}>
              {bug.severity} PRIORITY
            </span>
          )}
        </div>
        
        <p style={{ color: bug ? 'var(--text-main)' : 'var(--low)', fontWeight: 500 }}>
          {message}
        </p>
        
        {bug && (
          <div style={{ marginTop: '0.8rem', fontSize: '0.9rem', color: 'var(--text-dim)' }}>
            <span style={{ color: 'var(--accent)' }}>Line {bug.line}:</span> {bug.type.replace(/_/g, ' ')}
          </div>
        )}
      </div>

      {/* Progressive Hints Section */}
      {hints && hints.length > 0 && (
        <div className="glass" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span></span> Progressive Hints
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {hints.slice(0, hintLevel + 1).map((hint, index) => (
              <div key={index} className="hint-card animate-fade" style={{ animationDelay: `${index * 0.1}s` }}>
                <span style={{ color: 'var(--accent)', fontWeight: 600, marginRight: '0.5rem' }}>
                  {index === 0 ? 'Subtle:' : index === 1 ? 'Clearer:' : 'Solution:'}
                </span>
                {hint}
              </div>
            ))}
          </div>

          {hintLevel < hints.length - 1 && (
            <button className="reveal-btn" onClick={() => setHintLevel(prev => prev + 1)}>
              Reveal Next Hint ({hintLevel + 1}/{hints.length})
            </button>
          )}
        </div>
      )}

      {/* Educational Feedback */}
      {feedback && (
        <div className="glass" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Interview Feedback</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.9rem' }}>
            <div>
              <div style={{ color: 'var(--text-dim)', marginBottom: '0.2rem' }}>Core Concept</div>
              <div style={{ fontWeight: 600, color: 'var(--suggestion)' }}>{feedback.concept}</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-dim)', marginBottom: '0.2rem' }}>Difficulty</div>
              <div style={{ fontWeight: 600 }}>{feedback.difficulty}</div>
            </div>
          </div>
          <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <div style={{ color: 'var(--text-dim)', fontSize: '0.8rem', marginBottom: '0.4rem' }}>Recommended Practice</div>
            <div style={{ fontSize: '0.9rem' }}>{feedback.practice}</div>
          </div>
        </div>
      )}

      {/* Real World Scenario */}
      {scenario && (
        <div className="glass" style={{ padding: '1.5rem', borderLeft: '4px solid var(--accent)' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: 'var(--accent)' }}> Real-World Impact</h3>
          <p style={{ fontSize: '0.9rem', lineHeight: 1.6, fontStyle: 'italic', color: 'var(--text-dim)' }}>
            {scenario}
          </p>
        </div>
      )}
    </div>
  );
};

export default AnalysisResults;
