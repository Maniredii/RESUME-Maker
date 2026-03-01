const templates = {
  software: `# Priya Sharma
Email: priya.sharma@email.com | Phone: +91-99999-88888 | LinkedIn: linkedin.com/in/priyasharma

## Professional Summary
Results-driven software engineer with 4+ years of experience in full-stack development, cloud platforms, and scalable APIs.

## Skills
JavaScript, TypeScript, React, Node.js, Express, Python, SQL, AWS, Docker, CI/CD, REST APIs, Agile

## Experience
### Software Engineer | TechNova Solutions | 2021 - Present
- Built and maintained React + Node.js applications serving 100K+ users.
- Improved API response time by 35% through caching and SQL optimization.
- Collaborated with product and design teams in Agile sprints.

### Associate Engineer | CodeLeaf Labs | 2019 - 2021
- Developed backend services in Python and integrated third-party APIs.
- Automated deployment workflows with CI/CD pipelines.

## Education
B.Tech in Computer Science, National Institute of Technology, 2019

## Projects
### ATS Resume Optimizer
- Developed a web tool to score resumes against job descriptions using keyword analysis.
`,
  data: `# Arjun Mehta
Email: arjun.mehta@email.com | Phone: +91-98765-43210 | LinkedIn: linkedin.com/in/arjunmehta

## Professional Summary
Data analyst with 3+ years of experience turning business data into actionable insights through dashboards, SQL analytics, and statistical modeling.

## Skills
SQL, Python, Excel, Power BI, Tableau, Statistics, A/B Testing, Data Cleaning, ETL, Communication

## Experience
### Data Analyst | InsightWorks | 2022 - Present
- Built KPI dashboards in Power BI used by leadership across 5 departments.
- Improved reporting cycle by 40% by automating ETL and SQL pipelines.
- Presented trend and cohort analyses for growth and retention strategy.

## Education
B.Sc. in Statistics, University of Delhi, 2021
`,
  product: `# Neha Kapoor
Email: neha.kapoor@email.com | Phone: +91-91234-56789 | LinkedIn: linkedin.com/in/nehakapoor

## Professional Summary
Product manager with 5+ years of experience leading cross-functional teams to launch customer-centric digital products and improve key business metrics.

## Skills
Product Strategy, Roadmapping, User Research, Agile, Jira, A/B Testing, Stakeholder Management, Data Analysis

## Experience
### Product Manager | Nova Apps | 2020 - Present
- Led roadmap planning and launched 3 high-impact features, improving activation by 18%.
- Collaborated with design, engineering, and analytics teams in Agile sprints.
- Defined PRDs and success metrics aligned with quarterly company goals.

## Education
MBA, Indian School of Business, 2019
`
};

const resumeInput = document.getElementById('resumeInput');
const preview = document.getElementById('resumePreview');
const jobDescription = document.getElementById('jobDescription');
const scoreBadge = document.getElementById('scoreBadge');
const atsBreakdown = document.getElementById('atsBreakdown');
const matchedKeywordsNode = document.getElementById('matchedKeywords');
const missingKeywordsNode = document.getElementById('missingKeywords');
const nextStepsList = document.getElementById('nextStepsList');
const templateSelect = document.getElementById('templateSelect');
const loadSampleBtn = document.getElementById('loadSampleBtn');
const downloadBtn = document.getElementById('downloadBtn');
const injectKeywordsBtn = document.getElementById('injectKeywordsBtn');
const printBtn = document.getElementById('printBtn');

const STORAGE_KEY = 'ats-resume-studio-content';

function markdownToHtml(text) {
  const lines = text.split('\n');
  let html = '';
  let inList = false;

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      if (inList) {
        html += '</ul>';
        inList = false;
      }
      continue;
    }

    if (line.startsWith('### ')) {
      if (inList) {
        html += '</ul>';
        inList = false;
      }
      html += `<h3>${escapeHtml(line.slice(4))}</h3>`;
      continue;
    }

    if (line.startsWith('## ')) {
      if (inList) {
        html += '</ul>';
        inList = false;
      }
      html += `<h2>${escapeHtml(line.slice(3))}</h2>`;
      continue;
    }

    if (line.startsWith('# ')) {
      if (inList) {
        html += '</ul>';
        inList = false;
      }
      html += `<h1>${escapeHtml(line.slice(2))}</h1>`;
      continue;
    }

    if (line.startsWith('- ')) {
      if (!inList) {
        html += '<ul>';
        inList = true;
      }
      html += `<li>${escapeHtml(line.slice(2))}</li>`;
      continue;
    }

    if (inList) {
      html += '</ul>';
      inList = false;
    }
    html += `<p>${escapeHtml(line)}</p>`;
  }

  if (inList) {
    html += '</ul>';
  }

  return html;
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function analyzeAtsScore(resumeText, jdText) {
  let score = 0;
  const checks = [];

  const hasEmail = /[\w.-]+@[\w.-]+\.[A-Za-z]{2,}/.test(resumeText);
  const hasPhone = /(\+?\d[\d\s-]{7,}\d)/.test(resumeText);
  const hasSummary = /##\s+Professional Summary/i.test(resumeText);
  const hasSkills = /##\s+Skills/i.test(resumeText);
  const hasExperience = /##\s+Experience/i.test(resumeText);
  const hasEducation = /##\s+Education/i.test(resumeText);

  const sectionChecks = [
    { label: 'Contact details (email + phone)', pass: hasEmail && hasPhone, points: 15 },
    { label: 'Professional Summary section', pass: hasSummary, points: 10 },
    { label: 'Skills section', pass: hasSkills, points: 10 },
    { label: 'Experience section', pass: hasExperience, points: 15 },
    { label: 'Education section', pass: hasEducation, points: 10 }
  ];

  for (const check of sectionChecks) {
    checks.push({ ...check });
    if (check.pass) {
      score += check.points;
    }
  }

  const badFormattingPatterns = [/[|]{3,}/, /\t{2,}/, /\b(table|columns?)\b/i];
  const formattingPenalty = badFormattingPatterns.some((p) => p.test(resumeText)) ? 10 : 0;
  checks.push({
    label: 'ATS-safe formatting (no tables/columns artifacts)',
    pass: formattingPenalty === 0,
    points: 10
  });
  score += formattingPenalty === 0 ? 10 : 0;

  const wordCount = resumeText.split(/\s+/).filter(Boolean).length;
  const lengthPass = wordCount >= 250 && wordCount <= 900;
  checks.push({ label: 'Optimal resume length (250-900 words)', pass: lengthPass, points: 10 });
  score += lengthPass ? 10 : 0;

  const { matched, missing, ratio } = compareKeywords(resumeText, jdText);
  const keywordPoints = Math.round(ratio * 30);
  checks.push({
    label: `Keyword alignment with job description (${matched.length} matched)`,
    pass: ratio >= 0.35,
    points: keywordPoints
  });
  score += keywordPoints;

  return {
    score: Math.min(100, score),
    checks,
    matched,
    missing,
    ratio
  };
}

function compareKeywords(resumeText, jdText) {
  const keywords = extractKeywords(jdText);

  if (keywords.length === 0) {
    return { matched: [], missing: [], ratio: 0 };
  }

  const resumeLower = resumeText.toLowerCase();
  const matched = keywords.filter((word) => resumeLower.includes(word));
  const missing = keywords.filter((word) => !resumeLower.includes(word));

  return {
    matched,
    missing,
    ratio: matched.length / keywords.length
  };
}

function extractKeywords(text) {
  const stopWords = new Set([
    'the', 'a', 'an', 'to', 'for', 'with', 'and', 'or', 'of', 'in', 'on', 'at', 'is', 'are', 'as', 'be',
    'will', 'from', 'that', 'this', 'we', 'you', 'our', 'your', 'their', 'by', 'about', 'using', 'into'
  ]);

  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9+.#\s-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w));

  const frequency = new Map();
  for (const word of words) {
    frequency.set(word, (frequency.get(word) || 0) + 1);
  }

  return [...frequency.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([word]) => word);
}

function buildNextSteps(result, jdText) {
  const steps = [];

  if (!jdText.trim()) {
    steps.push('Paste a target job description to get role-specific optimization feedback.');
  }

  if (result.score < 75) {
    steps.push('Increase ATS score above 75 by improving missing sections and keyword alignment.');
  }

  const failedChecks = result.checks.filter((check) => !check.pass);
  failedChecks.slice(0, 3).forEach((check) => {
    steps.push(`Fix: ${check.label}.`);
  });

  if (result.missing.length > 0) {
    steps.push(`Add at least 5 missing keywords: ${result.missing.slice(0, 5).join(', ')}.`);
  }

  if (result.ratio >= 0.6) {
    steps.push('Great keyword alignment. Next, quantify impact with metrics in each experience bullet.');
  }

  if (steps.length === 0) {
    steps.push('Excellent baseline. Tailor each experience bullet to mirror job-description outcomes and metrics.');
  }

  return steps;
}

function renderAtsFeedback(result) {
  scoreBadge.textContent = String(result.score);

  if (result.score >= 80) {
    scoreBadge.style.background = 'var(--good)';
  } else if (result.score >= 60) {
    scoreBadge.style.background = 'var(--warn)';
  } else {
    scoreBadge.style.background = 'var(--bad)';
  }

  atsBreakdown.innerHTML = '';
  result.checks.forEach((check) => {
    const li = document.createElement('li');
    li.textContent = `${check.pass ? '✅' : '❌'} ${check.label} (+${check.points})`;
    atsBreakdown.appendChild(li);
  });

  matchedKeywordsNode.textContent = result.matched.length
    ? result.matched.join(', ')
    : 'None (add job description to see matches)';
  missingKeywordsNode.textContent = result.missing.length
    ? result.missing.join(', ')
    : 'None';
}

function renderNextSteps(steps) {
  nextStepsList.innerHTML = '';
  steps.forEach((step) => {
    const li = document.createElement('li');
    li.textContent = step;
    nextStepsList.appendChild(li);
  });
}

function refresh() {
  const text = resumeInput.value;
  preview.innerHTML = markdownToHtml(text);
  localStorage.setItem(STORAGE_KEY, text);

  const result = analyzeAtsScore(text, jobDescription.value);
  renderAtsFeedback(result);
  renderNextSteps(buildNextSteps(result, jobDescription.value));
}

function downloadResumeHtml() {
  const content = `<!doctype html><html><head><meta charset="utf-8"><title>Resume</title></head><body>${preview.innerHTML}</body></html>`;
  const blob = new Blob([content], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'resume.html';
  a.click();
  URL.revokeObjectURL(url);
}

function injectMissingKeywords() {
  const result = analyzeAtsScore(resumeInput.value, jobDescription.value);
  const toAdd = result.missing.slice(0, 8);

  if (!toAdd.length) {
    return;
  }

  if (/##\s+Skills/i.test(resumeInput.value)) {
    resumeInput.value = resumeInput.value.replace(/(##\s+Skills\n)([^#]*)/i, (full, header, skillsBlock) => {
      const combined = `${skillsBlock.trim()}${skillsBlock.trim().endsWith(',') || skillsBlock.trim() === '' ? '' : ', '} ${toAdd.join(', ')}`;
      return `${header}${combined.trim()}\n\n`;
    });
  } else {
    resumeInput.value += `\n## Skills\n${toAdd.join(', ')}\n`;
  }

  refresh();
}

function loadSelectedTemplate() {
  resumeInput.value = templates[templateSelect.value] || templates.software;
  refresh();
}

loadSampleBtn.addEventListener('click', loadSelectedTemplate);
downloadBtn.addEventListener('click', downloadResumeHtml);
injectKeywordsBtn.addEventListener('click', injectMissingKeywords);
printBtn.addEventListener('click', () => window.print());
resumeInput.addEventListener('input', refresh);
jobDescription.addEventListener('input', refresh);

resumeInput.value = localStorage.getItem(STORAGE_KEY) || templates.software;
refresh();
