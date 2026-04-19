import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI = null;
let model = null;

if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here') {
    try {
        genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        console.log('Question Generator: Gemini AI initialized');
    } catch (error) {
        console.error(' Gemini init failed:', error.message);
    }
}

// ============ SINGLE QUESTION GENERATION ============
export async function generateInterviewQuestion(topic, difficulty = 'Medium', company = null) {
    if (model) {
        try {
            const aiQuestion = await generateWithAI(topic, difficulty, company);
            if (aiQuestion && aiQuestion.success) {
                return aiQuestion;
            }
        } catch (error) {
            console.error('AI generation failed:', error.message);
        }
    }

    return generateFallbackQuestion(topic, difficulty, company);
}

// ============ MULTIPLE QUESTIONS GENERATION (BATCH) ============
export async function generateMultipleQuestions(topics, count = 5, difficulty = null, company = null) {
    const questions = [];
    const errors = [];

    // Agar topics array nahi hai toh default topics le lo
    const topicsList = Array.isArray(topics) ? topics : [topics];

    for (let i = 0; i < count; i++) {
        // Cycle through topics if less topics than count
        const topic = topicsList[i % topicsList.length];

        // Random difficulty if not specified
        const difficulties = ['Easy', 'Medium', 'Hard'];
        const selectedDifficulty = difficulty || difficulties[Math.floor(Math.random() * difficulties.length)];

        try {
            const result = await generateInterviewQuestion(topic, selectedDifficulty, company);
            if (result.success) {
                questions.push(result.question);
            } else {
                errors.push({ topic, difficulty: selectedDifficulty, error: 'Generation failed' });
            }
        } catch (error) {
            errors.push({ topic, difficulty: selectedDifficulty, error: error.message });
        }

        // Small delay to avoid rate limiting
        if (i < count - 1) {
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }

    return {
        success: true,
        totalRequested: count,
        totalGenerated: questions.length,
        questions,
        errors: errors.length > 0 ? errors : null
    };
}

// ============ GENERATE BY DIFFICULTY ============
export async function generateQuestionsByDifficulty(difficulty, count = 3) {
    const topicsByDifficulty = {
        Easy: ['variables', 'syntax', 'functions', 'loops', 'conditionals'],
        Medium: ['async/await', 'promises', 'closures', 'event loop', 'this binding'],
        Hard: ['race conditions', 'memory leaks', 'concurrency', 'performance', 'security']
    };

    const topics = topicsByDifficulty[difficulty] || topicsByDifficulty.Medium;
    return generateMultipleQuestions(topics, count, difficulty);
}

// ============ GENERATE BY COMPANY ============
export async function generateQuestionsByCompany(company, count = 3) {
    const companyTopics = {
        Google: ['closures', 'event loop', 'hoisting', 'performance', 'algorithms'],
        Meta: ['race conditions', 'state management', 'react hooks', 'async patterns'],
        Amazon: ['error handling', 'async/await', 'api design', 'promises'],
        Microsoft: ['typescript', 'this binding', 'prototypes', 'design patterns'],
        Netflix: ['streaming', 'performance', 'memory leaks', 'concurrency']
    };

    const topics = companyTopics[company] || companyTopics.Google;
    return generateMultipleQuestions(topics, count, null, company);
}

// ============ AI GENERATION (Single) ============
async function generateWithAI(topic, difficulty, company) {
    const companyContext = company ? `This question should be typical of ${company} interviews.` : '';

    const prompt = `Generate a unique debugging interview question about ${topic}.
Difficulty: ${difficulty}
${companyContext}

CRITICAL: Return ONLY a single valid JSON object. 
IMPORTANT: Ensure all code snippets are properly escaped as single-line strings with \\n for newlines. 
DO NOT include literal newlines or tabs inside the JSON values.

JSON Structure:
{
  "success": true,
  "question": {
    "id": ${Date.now()},
    "company": "${company || 'General'}",
    "logo": "🔷",
    "difficulty": "${difficulty}",
    "title": "Title",
    "description": "Short explanation of the objective",
    "buggyCode": "code_snippet",
    "hint1": "Hint 1",
    "hint2": "Hint 2",
    "hint3": "Hint 3",
    "solution": "Fixed code",
    "explanation": "Brief explanation",
    "points": ${difficulty === 'Easy' ? 50 : difficulty === 'Medium' ? 75 : 100},
    "timeLimit": ${difficulty === 'Easy' ? 180 : difficulty === 'Medium' ? 300 : 600}
  }
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();

    // Clean markdown code blocks
    text = text.replace(/^```json/i, '').replace(/```$/i, '').trim();

    // Robust JSON extraction
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        try {
            // First try parsing directly
            return JSON.parse(jsonMatch[0]);
        } catch (parseError) {
            // If parsing fails due to control characters, try to replace literal newlines
            try {
                const cleaned = jsonMatch[0]
                    .replace(/\n(?=[^"]*"([^"]*"[^"]*")*[^"]*$)/g, '\\n') // Replace newlines inside quotes
                    .replace(/\r/g, '');
                return JSON.parse(cleaned);
            } catch (finalError) {
                // Fallback: replace ALL literal newlines (dangerous but better than 404)
                try {
                    const aggressiveClean = jsonMatch[0].replace(/\n/g, '\\n').replace(/\r/g, '');
                    return JSON.parse(aggressiveClean);
                } catch (e) {
                    console.error('Gemini Parsing Error. Raw Text:', text);
                    throw new Error(`JSON Format Error: ${parseError.message}`);
                }
            }
        }
    }

    throw new Error('Invalid JSON from Gemini: No object found');
}

// ============ FALLBACK GENERATION ============
function generateFallbackQuestion(topic, difficulty, company) {
    const difficulties = {
        Easy: { points: 50, timeLimit: 180 },
        Medium: { points: 75, timeLimit: 300 },
        Hard: { points: 100, timeLimit: 600 }
    };

    const config = difficulties[difficulty] || difficulties.Medium;

    const templates = {
        'closures': {
            title: `Closure Bug in Loop`,
            buggyCode: `for (var i = 0; i < 3; i++) {
  setTimeout(() => {
    console.log(i);
  }, 100);
}`,
            hint1: " varhas function scope, not block scope",
            hint2: " All setTimeout functions share the same 'i' variable",
            solution: "Use 'let' instead of 'var'"
        },
        'async/await': {
            title: `Missing Async/Await Pattern`,
            buggyCode: `function fetchData() {
  const data = await fetch('/api/data');
  return data.json();
}`,
            hint1: "'await' needs a special function declaration",
            hint2: " Add a keyword before 'function'",
            solution: "Add 'async' before function"
        },
        'race conditions': {
            title: `Race Condition Bug`,
            buggyCode: `let count = 0;
async function increment() {
  const current = count;
  await new Promise(r => setTimeout(r, 10));
  count = current + 1;
}`,
            hint1: "Multiple functions reading same variable",
            hint2: " Need to synchronize access",
            solution: "Use a mutex or atomic operations"
        }
    };

    const template = templates[topic.toLowerCase()] || templates['closures'];

    return {
        success: true,
        question: {
            id: Date.now(),
            company: company || "Tech Company",
            logo: "",
            difficulty: difficulty,
            title: template.title,
            description: `Fix the ${topic} related bug in this code`,
            buggyCode: template.buggyCode,
            hint1: template.hint1,
            hint2: template.hint2,
            hint3: " The solution is simpler than you think!",
            solution: template.solution,
            explanation: `Understanding ${topic} is crucial for JavaScript interviews.`,
            points: config.points,
            timeLimit: config.timeLimit,
            companiesAsked: [company || "Google", "Meta", "Amazon"].filter(Boolean)
        }
    };
}

// ============ EXPORT ALL FUNCTIONS ============
export const getAvailableTopics = () => [
    'closures', 'async/await', 'race conditions', 'event loop',
    'hoisting', 'prototypes', 'this binding', 'promises',
    'error handling', 'memory leaks', 'performance', 'security'
];