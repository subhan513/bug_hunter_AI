import { useState, useEffect, useRef } from 'preact/hooks';
const CodeEditor = ({ code, setCode, language, setLanguage }) => {
  const [lines, setLines] = useState([1]);
  const textareaRef = useRef(null);

  useEffect(() => {
    const lineCount = code.split('\n').length;
    setLines(Array.from({ length: Math.max(lineCount, 1) }, (_, i) => i + 1));
  }, [code]);

  const handleContainerClick = () => {
    if (textareaRef.current) {
        textareaRef.current.focus();
    }
  };

  return (
    <div className="editor-container">
      <div className="editor-header">
        <h3 className="gradient-text">Challenge Editor</h3>
        <select
          className="language-pill"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option value="auto" style={{ color: "black" }}>Auto Detect</option>
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
        </select>
      </div>

      <div className="editor-main glass" onClick={handleContainerClick}>
        <div className="line-numbers">
          {lines.map(num => (
            <div key={num}>{num}</div>
          ))}
        </div>
        <textarea
          ref={textareaRef}
          value={code}
          onInput={(e) => setCode(e.target.value)}
          placeholder="// Paste your buggy code here...
// The AI will find the bugs for you."
          spellCheck={false}
        />
      </div>
    </div>
  );
};

export default CodeEditor;
