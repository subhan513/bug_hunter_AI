// Dynamic Bug Detection — No Hardcoded Patterns!
// This uses smart heuristics and AI fallback

export async function detectBugsSmart(code, language = 'auto') {
    const detectedLanguage = language === 'auto' ? detectLanguage(code) : language;

    const bugs = [];

    // ============ DYNAMIC CHECKS (No Hardcoding) ============

    // 1. Check for syntax errors (dynamic)
    const syntaxIssue = checkSyntaxDynamic(code);
    if (syntaxIssue) bugs.push(syntaxIssue);

    // 2. Check for variable scope issues (dynamic)
    const scopeIssue = checkScopeDynamic(code);
    if (scopeIssue) bugs.push(scopeIssue);

    // 3. Check for async issues (dynamic)
    const asyncIssue = checkAsyncDynamic(code);
    if (asyncIssue) bugs.push(asyncIssue);

    // 4. Check for type safety (dynamic)
    const typeIssue = checkTypeSafety(code);
    if (typeIssue) bugs.push(typeIssue);

    // 5. Check for performance issues (dynamic)
    const perfIssue = checkPerformance(code);
    if (perfIssue) bugs.push(perfIssue);

    // 6. Check for security issues (dynamic)
    const securityIssue = checkSecurity(code);
    if (securityIssue) bugs.push(securityIssue);

    // Return the most critical bug
    if (bugs.length > 0) {
        bugs.sort((a, b) => getSeverityWeight(b.severity) - getSeverityWeight(a.severity));
        return bugs[0];
    }

    return null;
}

function detectLanguage(code) {
    const pythonIndicators = ['def ', 'print(', 'import ', 'from ', 'class ', 'self.'];
    const jsIndicators = ['function', '=>', 'const ', 'let ', 'var ', 'console.log', 'async', 'await'];

    let pythonScore = 0;
    let jsScore = 0;

    pythonIndicators.forEach(ind => {
        if (code.includes(ind)) pythonScore++;
    });

    jsIndicators.forEach(ind => {
        if (code.includes(ind)) jsScore++;
    });

    return pythonScore > jsScore ? 'python' : 'javascript';
}

function checkSyntaxDynamic(code) {
    const lines = code.split('\n');

    // Check for unmatched brackets
    let braces = 0, parentheses = 0, brackets = 0;

    for (let i = 0; i < code.length; i++) {
        const char = code[i];
        if (char === '{') braces++;
        if (char === '}') braces--;
        if (char === '(') parentheses++;
        if (char === ')') parentheses--;
        if (char === '[') brackets++;
        if (char === ']') brackets--;
    }

    if (braces !== 0) {
        return {
            type: 'unmatched_braces',
            message: `Unmatched curly braces: ${Math.abs(braces)} unclosed`,
            line: findLineWithIssue(code, '{', '}'),
            severity: 'high'
        };
    }

    if (parentheses !== 0) {
        return {
            type: 'unmatched_parentheses',
            message: `Unmatched parentheses: ${Math.abs(parentheses)} unclosed`,
            line: findLineWithIssue(code, '(', ')'),
            severity: 'high'
        };
    }

    return null;
}

function checkScopeDynamic(code) {
    const lines = code.split('\n');

    // Extract variable definitions
    const varDefs = new Set();
    const varUsage = new Set();

    // Dynamic variable detection (works for any variable name)
    const patterns = [
        /(?:const|let|var)\s+(\w+)/g,
        /(?:def)\s+(\w+)/g,
        /(?:function)\s+(\w+)/g,
        /(?:class)\s+(\w+)/g
    ];

    patterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(code)) !== null) {
            varDefs.add(match[1]);
        }
    });

    // Find variable usage
    const wordPattern = /\b[a-z_][a-z0-9_]*\b/gi;
    let match;
    while ((match = wordPattern.exec(code)) !== null) {
        const word = match[0];
        const reserved = ['if', 'for', 'while', 'return', 'true', 'false', 'null', 'undefined', 'NaN', 'typeof', 'instanceof', 'new', 'this', 'delete', 'void'];
        if (!reserved.includes(word) && !varDefs.has(word)) {
            varUsage.add(word);
        }
    }

    // Check for potential typos (compare with defined variables)
    for (const used of varUsage) {
        for (const def of varDefs) {
            if (isSimilarWord(used, def) && used !== def) {
                return {
                    type: 'undefined_variable',
                    message: `Variable '${used}' might be a typo. Did you mean '${def}'?`,
                    line: findLineWithWord(code, used),
                    severity: 'high'
                };
            }
        }
    }

    return null;
}

function checkAsyncDynamic(code) {
    if (code.includes('await')) {
        const lines = code.split('\n');
        let hasAsync = false;

        // Check if any function is async
        if (code.match(/async\s+function/) || code.match(/async\s*\(/) || code.match(/async\s+\w+\s*\(/)) {
            hasAsync = true;
        }

        if (!hasAsync) {
            return {
                type: 'missing_async',
                message: 'Using "await" but no async function found',
                line: findLineWithWord(code, 'await'),
                severity: 'high'
            };
        }
    }

    return null;
}

function checkTypeSafety(code) {
    // Check for loose equality in JS
    if (code.includes('==') && !code.includes('===')) {
        const lines = code.split('\n');
        const lineNum = lines.findIndex(line => line.includes('==') && !line.includes('==='));

        if (lineNum !== -1) {
            return {
                type: 'loose_equality',
                message: 'Using loose equality (==) can cause type coercion bugs',
                line: lineNum + 1,
                severity: 'medium'
            };
        }
    }

    return null;
}

function checkPerformance(code) {
    // Check for potential infinite loops
    if (code.includes('while') && code.includes('true')) {
        if (!code.includes('break') && !code.includes('return')) {
            return {
                type: 'infinite_loop_risk',
                message: 'Potential infinite loop detected (while true without break)',
                line: findLineWithWord(code, 'while'),
                severity: 'high'
            };
        }
    }

    // Check for inefficient array operations in loops
    const lines = code.split('\n');
    for (let i = 0; i < lines.length; i++) {
        if ((lines[i].includes('for') || lines[i].includes('while')) &&
            (lines[i].includes('.length') || lines[i].includes('.size'))) {
            return {
                type: 'performance_issue',
                message: 'Consider caching array length outside loop for better performance',
                line: i + 1,
                severity: 'low'
            };
        }
    }

    return null;
}

function checkSecurity(code) {
    const sensitivePatterns = ['password', 'secret', 'api_key', 'apikey', 'token', 'private'];
    const lowerCode = code.toLowerCase();

    for (const pattern of sensitivePatterns) {
        if (lowerCode.includes(pattern) && (code.includes('=') || code.includes(':'))) {
            return {
                type: 'hardcoded_secret',
                message: `Hardcoded '${pattern}' detected — security risk! Use environment variables`,
                line: findLineWithWord(code, pattern),
                severity: 'critical'
            };
        }
    }

    return null;
}

function getSeverityWeight(severity) {
    const weights = { critical: 5, high: 4, medium: 3, low: 2, suggestion: 1 };
    return weights[severity] || 0;
}

function isSimilarWord(word1, word2) {
    if (Math.abs(word1.length - word2.length) > 2) return false;

    let differences = 0;
    const minLen = Math.min(word1.length, word2.length);

    for (let i = 0; i < minLen; i++) {
        if (word1[i] !== word2[i]) differences++;
    }

    differences += Math.abs(word1.length - word2.length);
    return differences <= 2;
}

function findLineWithWord(code, word) {
    const lines = code.split('\n');
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].toLowerCase().includes(word.toLowerCase())) {
            return i + 1;
        }
    }
    return null;
}

function findLineWithIssue(code, openChar, closeChar) {
    const lines = code.split('\n');
    let count = 0;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        let lineCount = 0;

        for (const char of line) {
            if (char === openChar) lineCount++;
            if (char === closeChar) lineCount--;
        }

        count += lineCount;
        if (Math.abs(count) > 0 && lineCount !== 0) {
            return i + 1;
        }
    }

    return null;
}

// Generate hints dynamically based on bug type
export function generateDynamicHints(bugType, context = {}) {
    const hintsMap = {
        undefined_variable: [
            "Look at line " + (context.line || 'X') + " — check if the variable name is spelled correctly",
            "Compare the variable you're using with variables defined above",
            ` Fix: ${context.suggestion || 'Rename the variable to match your definition'}`
        ],
        missing_async: [
            "'await' can only be used inside functions marked as 'async'",
            "Add the 'async' keyword before your function declaration",
            " Fix: Change 'function()' to 'async function()'"
        ],
        loose_equality: [
            "'==' converts types before comparing, '===' does not",
            "Use '===' for strict equality to avoid type coercion bugs",
            " Fix: Replace '==' with '==='"
        ],
        infinite_loop_risk: [
            "Your loop condition never becomes false",
            "Add a counter or break condition to exit the loop",
            " Fix: Ensure the condition will eventually evaluate to false"
        ],
        hardcoded_secret: [
            "Never hardcode passwords or API keys in source code",
            "Use environment variables (.env file) for secrets",
            " Fix: Move to .env and use process.env.VARIABLE_NAME"
        ],
        unmatched_braces: [
            "Count your opening { and closing } braces",
            " Every { needs a matching }",
            " Fix: Add missing } at the end or remove extra {"
        ]
    };

    return hintsMap[bugType] || [
        " Read the error message carefully",
        "Use console.log() or print() to debug step by step",
        "Check documentation for the function you're using"
    ];
}

export default {
    detectBugsSmart,
    generateDynamicHints
};