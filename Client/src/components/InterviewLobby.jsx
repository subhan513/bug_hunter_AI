import { useState, useEffect } from 'preact/hooks';
import { fetchAvailableTopics, generateInterviewQuestion, generateByCompany, generateByDifficulty } from '../utils/api';
import CompanyIcon from './CompanyIcon';

const InterviewLobby = ({ userStats, onStartSession }) => {
  const [ data, setData] = useState({ topics: [], companies: [], difficulties: [] });
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetchAvailableTopics();
        setData(res);
      } catch (err) {
        console.error('Failed to load metadata:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleStart = async (type, value) => {
    setGenerating(true);
    try {
      let result;
      if (type === 'topic') result = await generateInterviewQuestion({ topic: value });
      else if (type === 'company') result = await generateByCompany(value);
      else if (type === 'difficulty') result = await generateByDifficulty(value);
      
      const question = Array.isArray(result.questions) ? result.questions[0] : result.question;
      onStartSession(question);
    } catch (err) {
      alert('Error generating question: ' + (err.error || err.message));
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <div className="lobby-loading">Initializing Interview Backend...</div>;

  return (
    <div className="lobby-container animate-fade">
      <div className="lobby-header">
        <h2 className="gradient-text-green">Interview Lobby</h2>
        <p>Challenge yourself with real-world debugging scenarios from top companies.</p>
      </div>

      <div className="lobby-grid">
        {/* Company Challenges */}
        <section className="lobby-section">
          <h3>🏢 Company Challenges</h3>
          <div className="options-grid">
            {data.companies.map(company => (
              <div key={company} className="option-card glass neon-border-hover" onClick={() => handleStart('company', company)}>
                <div className="option-icon">
                  <CompanyIcon name={company} />
                </div>
                <span className="option-label">{company}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Topics */}
        <section className="lobby-section">
          <h3>📚 Subject Topics</h3>
          <div className="options-grid">
            {data.topics.map(topic => (
              <div key={topic} className="option-card glass neon-border-hover" onClick={() => handleStart('topic', topic)}>
                <span className="option-icon">📎</span>
                <span className="option-label" style={{ textTransform: 'capitalize' }}>{topic.replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Difficulty */}
        <section className="lobby-section">
          <h3>⚖️ Select Difficulty</h3>
          <div className="options-grid">
            {data.difficulties.map(diff => (
              <div key={diff} className={`option-card glass diff-${diff.toLowerCase()}`} onClick={() => handleStart('difficulty', diff)}>
                <span className="option-icon">⚡</span>
                <span className="option-label">{diff}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {generating && (
        <div className="generation-overlay">
          <div className="loader"></div>
          <p>AI is crafting your interview question...</p>
        </div>
      )}
    </div>
  );
};

export default InterviewLobby;
