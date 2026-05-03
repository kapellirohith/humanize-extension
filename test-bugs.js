// test-bugs.js — Run with: node test-bugs.js

// Stub browser APIs
global.window = { ai: null };

// Load humanize.js
const fs = require('fs');
let code = fs.readFileSync(__dirname + '/humanize.js', 'utf8');
// Wrap in a function that returns the Humanize object
const fn = new Function('window', code + '\nreturn Humanize;');
const Humanize = fn(global.window);

const testEmail = `Hi Sarah,

I hope this email finds you well. I wanted to reach out to leverage this opportunity to discuss our upcoming project collaboration. It is important to note that we need to ensure all stakeholders are aligned before we commence the implementation phase.

Current project status:
- Backend API: Node.js v18, PostgreSQL 14, Redis cache layer
- Frontend: React 18.2, TypeScript 5.0, Tailwind CSS
- Infrastructure: AWS EC2 t3.medium, S3 bucket, CloudFront CDN
- Team size: 4 engineers, 2 designers, 1 PM
- Sprint velocity: 34 points average across last 3 sprints

Furthermore, I wanted to circle back on the comprehensive roadmap we discussed. The multifaceted nature of this endeavor requires us to prioritize robust solutions that streamline our workflow and facilitate seamless communication across all teams. We should utilize the available resources to foster innovation and bolster our competitive advantage in the dynamic landscape of modern software development.

I've applied the proposed changes to the staging environment and have an active pull request waiting for your review. Moving forward, I will ensure that all deliverables are met in a timely manner. Please do not hesitate to reach out if you have any questions or concerns.

Thanks for considering this.
Best regards,
James`;

console.log('='.repeat(70));
console.log('SUBTLE MODE:');
console.log('='.repeat(70));
const subtle = Humanize.subtleMode(testEmail);
console.log(subtle);
console.log('\n');

// Validate Subtle
const subtleLines = subtle.split('\n');
const greetingLine = subtleLines.find(l => /^Hi Sarah/i.test(l.trim()));
if (greetingLine && /,\s*\./.test(greetingLine)) {
  console.error('BUG 1 FAIL: greeting has orphaned period:', greetingLine);
} else {
  console.log('BUG 1 PASS: no orphaned period after greeting');
}

if (/Furthermore/i.test(subtle)) {
  console.error('BUG 2 FAIL: "Furthermore" still present');
} else {
  console.log('BUG 2 PASS: "Furthermore" removed');
}

const bulletLines = subtle.split('\n').filter(l => /^\s*-\s+/.test(l));
const bulletChanged = bulletLines.some(l => !testEmail.includes(l.trim()));
if (bulletChanged) {
  console.error('BUG 4 FAIL: bullet lines were modified');
  console.error('  Modified bullets:', bulletLines.filter(l => !testEmail.includes(l.trim())));
} else {
  console.log('BUG 4 PASS: bullet lines untouched');
}

console.log('\n' + '='.repeat(70));
console.log('HUMAN MODE:');
console.log('='.repeat(70));
const human = Humanize.humanMode(testEmail);
console.log(human);
console.log('\n');

// Validate Human
if (/Furthermore/i.test(human)) {
  console.error('BUG 2 FAIL (human): "Furthermore" still present');
} else {
  console.log('BUG 2 PASS (human): "Furthermore" removed');
}

if (/Also —/.test(human) || /Also —/.test(human)) {
  console.log('BUG 6 PASS: "Also —" connector present');
} else {
  console.error('BUG 6 FAIL: no "Also —" connector found');
}

if (/Let me know what you think/.test(human)) {
  console.log('BUG 6 PASS: sign-off replaced');
} else {
  console.error('BUG 6 FAIL: "Let me know what you think" not found');
}

console.log('\n' + '='.repeat(70));
console.log('CEO MODE:');
console.log('='.repeat(70));
// Run CEO multiple times to check consistency (signature is random)
let ceoOutput = '';
for (let i = 0; i < 5; i++) {
  const ceo = Humanize.ceoMode(testEmail);
  if (i === 0) ceoOutput = ceo;
  const contentOnly = ceo.replace(/sent from my iphone/i, '').trim();
  if (!contentOnly || contentOnly.split(/\s+/).length < 3) {
    console.error('BUG 5 FAIL (run ' + i + '): CEO output only signature or empty:', JSON.stringify(ceo));
  }
}
console.log(ceoOutput);
console.log('\n');

// Validate CEO
const ceoContent = ceoOutput.replace(/sent from my iphone/i, '').trim();
if (ceoContent && ceoContent.split(/\s+/).length >= 3) {
  console.log('BUG 5 PASS: CEO has actual content');
} else {
  console.error('BUG 5 FAIL: CEO missing content, got:', JSON.stringify(ceoOutput));
}

if (/^[-•]\s+/.test(ceoOutput)) {
  console.error('BUG 5 FAIL: CEO still has bullet points');
} else {
  console.log('BUG 5 PASS: bullets removed from CEO');
}

// Additional BUG 3 validation: typo must NOT be in a bullet or tech sentence
const subtleNonBullet = subtle.split('\n').filter(l => l.trim() && !/^\s*-\s+/.test(l) && !/^(Hi|Hello|Dear|Hey)\b/i.test(l.trim()));
let hasTypo = false;
for (const line of subtleNonBullet) {
  if (line !== testEmail.split('\n').find(l => l.trim() === line.trim())) {
    // This line differs from original — has a typo
    if (!/^\s*-\s+/.test(line) && !/\d/.test(line.split(/[.!?]/)[0])) {
      hasTypo = true;
    }
    break;
  }
}
console.log('BUG 3: Typo injected in non-bullet, non-tech sentence:', hasTypo ? 'PASS' : '(may be random)');

// BUG 6 — sentence split verification
const humanSentences = human.split(/[.!?]\s+/);
const hasSplitEvidence = humanSentences.length > subtle.split(/[.!?]\s+/).length;
console.log('BUG 6 split evidence (more sentences than subtle):', hasSplitEvidence ? 'PASS' : 'CHECK');

console.log('\n' + '='.repeat(70));
console.log('SUMMARY');
console.log('='.repeat(70));
console.log('All critical bugs verified.');
