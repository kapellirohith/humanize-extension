// humanize.js — All bugs fixed (1-6), pure JS, no API

const Humanize = (() => {

  const REPLACEMENTS = [
    [/I hope this (?:email|message) finds you well[.,]?\s*/gi,''],
    [/I trust this email finds you well[.,]?\s*/gi,''],
    [/I hope you'?re doing well[.,]?\s*/gi,''],
    [/I would like to take this opportunity to\s*/gi,''],
    [/Thank you for your time and consideration[.,]?\s*/gi,''],
    [/I look forward to hearing from you[.,]?\s*/gi,'let me know what you think.'],
    [/Please let me know if you have any questions[.,]?\s*/gi,'let me know if you have questions.'],
    [/Please do not hesitate to\s*/gi,''],
    [/Feel free to\s*/gi,''],
    [/It is important to note that\s*/gi,''],
    [/It'?s worth noting that\s*/gi,''],
    [/It is worth mentioning that\s*/gi,''],
    [/As per my previous email/gi,'as I mentioned'],
    [/As mentioned previously/gi,'as I said'],
    [/I wanted to reach out(?:[^.!?]*)(?=[.!?]|$)/gi,''],
    [/I wanted to(?:[^.!?]*)(?=[.!?]|$)/gi,''],
    [/I am writing to(?:[^.!?]*)(?=[.!?]|$)/gi,''],
    [/In today'?s fast-paced world[.,]?\s*/gi,''],
    [/In today'?s digital landscape[.,]?\s*/gi,''],
    [/In today'?s competitive environment[.,]?\s*/gi,''],
    [/As we move forward[.,]?\s*/gi,''],
    [/Going forward[.,]?\s*/gi,''],
    [/At the end of the day[.,]?\s*/gi,''],
    [/In light of the above[.,]?\s*/gi,''],
    [/With that being said[.,]?\s*/gi,''],
    [/That being said[.,]?\s*/gi,''],
    [/Moving forward[.,]?\s*/gi,'from here, '],
    [/Needless to say[.,]?\s*/gi,''],
    [/It goes without saying that?\s*/gi,''],
    [/For all intents and purposes[.,]?\s*/gi,''],
    [/At this juncture/gi,'right now'],
    [/Pursuant to/gi,'following'],
    [/Aforementioned/gi,'this'],
    [/\bHerein\b/gi,''],
    [/\bIn order to\b/gi,'to'],
    [/\bDue to the fact that\b/gi,'because'],
    [/\bIn the event that\b/gi,'if'],
    [/In conclusion[.,]?\s*/gi,''],
    [/To summarize[.,]?\s*/gi,''],
    [/In summary[.,]?\s*/gi,''],
    [/\bSubsequently\b/gi,'Then'],
    [/\bHenceforth\b/gi,'From now on'],
    [/\bdive deep(?:ly)?\b/gi,'look closely'],
    [/\bcircle back\b/gi,'follow up'],
    [/\btouch base\b/gi,'check in'],
    [/\bspearhead(?:ing|ed|s)?\b/gi,'lead'],
    [/\bsynergize\b/gi,'work together'],
    [/\bideate\b/gi,'brainstorm'],
    [/\butilize(?:d|s|ing)?\b/gi,'use'],
    [/\bleverage(?:d|s|ing)?\b/gi,'use'],
    [/\bfacilitate(?:d|s|ing)?\b/gi,'help'],
    [/\bendeavor(?:ed|s|ing)?\b/gi, (m, offset, str) => {
      const before = str.slice(0, offset).split(/\s+/).slice(-2).join(' ').toLowerCase();
      if (/\b(this|our|the|an|their|your|my)\s*$/.test(before)) return 'effort';
      if (/\b(we|i|they|you|it)\s*$/.test(before)) return 'try';
      return 'effort';
    }],
    [/\bcommence(?:d|s|ing)?\b/gi,'start'],
    [/\bimplement(?:ed|s|ing)?\b/gi,'set up'],
    [/\bstreamline(?:d|s|ing)?\b/gi,'simplify'],
    [/\boptimize(?:d|s|ing)?\b/gi,'improve'],
    [/\bprioritize(?:d|s|ing)?\b/gi,'focus on'],
    [/\bensure(?:d|s|ing)?\b/gi,'make sure'],
    [/\bascertain(?:ed|s|ing)?\b/gi,'find out'],
    [/\bdemonstrate(?:d|s|ing)?\b/gi,'show'],
    [/\bhighlight(?:ed|s|ing)?\b/gi,'point out'],
    [/\bnavigate(?:d|s|ing)?\b/gi,'deal with'],
    [/\bunderscore(?:d|s|ing)?\b/gi,'stress'],
    [/\breiterate(?:d|s|ing)?\b/gi,'repeat'],
    [/\bgarner(?:ed|s|ing)?\b/gi,'get'],
    [/\bfoster innovation\b/gi,'drive innovation'],
    [/\bfoster(?:ed|s|ing)?\b/gi,'build'],
    [/\bcultivate(?:d|s|ing)?\b/gi,'build'],
    [/\bharness(?:ed|es|ing)?\b/gi,'use'],
    [/\bbolster(?:ed|s|ing)?\b/gi,'strengthen'],
    [/\belevate(?:d|s|ing)?\b/gi,'improve'],
    [/\bempower(?:ed|s|ing)?\b/gi,'help'],
    [/\bdelve(?:d|s|ing)?\b/gi,'look into'],
    [/\bunpack(?:ed|s|ing)?\b/gi,'go through'],
    [/\bcutting[- ]edge\b/gi,'latest'],
    [/\bstate[- ]of[- ]the[- ]art\b/gi,'modern'],
    [/\blow[- ]hanging fruit\b/gi,'easiest wins'],
    [/\bpain points?\b/gi,'problems'],
    [/\bvalue proposition\b/gi,'the benefit'],
    [/\brobust\b/gi,'strong'],
    [/\bcomprehensive\b/gi,'full'],
    [/\bseamless(?:ly)?\b/gi,'smooth'],
    [/\binnovative\b/gi,'new'],
    [/\bmultifaceted\b/gi,'complex'],
    [/\bpivotal\b/gi,'key'],
    [/\bcrucial\b/gi,'important'],
    [/\bparamount\b/gi,'most important'],
    [/\bimperative\b/gi,'needed'],
    [/\bsubstantial(?:ly)?\b/gi,'significant'],
    [/\btremendous(?:ly)?\b/gi,'great'],
    [/\bexceptional(?:ly)?\b/gi,'great'],
    [/\bremarkable(?:ly)?\b/gi,'impressive'],
    [/\bdynamic\b/gi,'fast-moving'],
    [/\bscalable\b/gi,'flexible'],
    [/\bactionable\b/gi,'practical'],
    [/\bgranular\b/gi,'detailed'],
    [/\bholistic(?:ally)?\b/gi,'overall'],
    [/\bproactive(?:ly)?\b/gi,'early'],
    [/\bbespoke\b/gi,'custom'],
    [/\bsynergy\b/gi,'collaboration'],
    [/\becosystem\b/gi,'space'],
    [/\blandscape\b/gi,'field'],
    [/\bparadigm\b/gi,'approach'],
    [/\bframework\b/gi,'plan'],
    [/\bdeliverable\b/gi,'output'],
    [/\bbandwidth\b/gi,'capacity'],
    [/\bdeliverables\s+are\s+met\b/gi,'deadlines are hit'],
    [/\bmeet\s+the\s+deliverables\b/gi,'hit the deadlines'],
    [/\ball\s+deliverables\b/gi,'everything'],
    [/\bdeliverables\b/gi,'results'],
    [/\bdeliverable\b/gi,'result'],
    [/\bstakeholders\b/gi,'team members'],
    [/\bstakeholder\b/gi,'team member'],
    [/\beffectively\b/gi,''],
    [/\befficiently\b/gi,''],
    [/\bsuccessfully\b/gi,''],
    [/\bproactively\b/gi,''],
    [/\bstrategically\b/gi,''],
    [/\bcomprehensively\b/gi,''],
    [/\bsignificantly\b/gi,''],
    [/\bsubstantially\b/gi,''],
    [/\btremendously\b/gi,''],
    [/\bexceptionally\b/gi,''],
    [/\bremarkably\b/gi,''],
    [/\babsolutely\b/gi,''],
    [/\bcertainly\b/gi,''],
    [/\bdefinitely\b/gi,''],
    [/\bclearly\b/gi,''],
    [/\bobviously\b/gi,''],
    [/\bundoubtedly\b/gi,''],
    [/\bunquestionably\b/gi,''],
  ];

  const CONTRACTIONS = [
    [/\bdo not\b/gi,"don't"],[/\bcannot\b/gi,"can't"],[/\bwill not\b/gi,"won't"],
    [/\bI am\b/g,"I'm"],[/\bI have\b/g,"I've"],[/\bwe are\b/gi,"we're"],
    [/\bwe will\b/gi,"we'll"],[/\bit is\b/gi,"it's"],[/\bthat is\b/gi,"that's"],
    [/\bthey are\b/gi,"they're"],[/\byou are\b/gi,"you're"],
    [/\bwould not\b/gi,"wouldn't"],[/\bshould not\b/gi,"shouldn't"],
    [/\bcould not\b/gi,"couldn't"],[/\bdoes not\b/gi,"doesn't"],
    [/\bis not\b/gi,"isn't"],[/\bare not\b/gi,"aren't"],[/\bwas not\b/gi,"wasn't"],
    [/\bhave not\b/gi,"haven't"],[/\bhad not\b/gi,"hadn't"],[/\bhas not\b/gi,"hasn't"],
    [/\blet us\b/gi,"let's"],[/\bI would\b/g,"I'd"],[/\bI will\b/g,"I'll"],
    [/\bwho is\b/gi,"who's"],[/\bthere is\b/gi,"there's"],[/\bhere is\b/gi,"here's"],
  ];

  const CLOSINGS = [
    [/^Best regards,?$/mi,'Thanks,'],[/^Sincerely yours,?$/mi,'Thanks,'],
    [/^Warm regards,?$/mi,'Cheers,'],[/^Kind regards,?$/mi,'Thanks,'],
    [/^Yours faithfully,?$/mi,'Thanks,'],[/^With appreciation,?$/mi,'Thanks for your time,'],
    [/^Looking forward to your response,?$/mi,'Let me know what you think.'],
  ];

  const OPENERS = [
    [/^To Whom It May Concern[,:]?\s*/mi,'Hi there,\n\n'],
    [/^Good day[,:]?\s*/mi,'Hi,\n\n'],
  ];

  const CEO_PHRASES = [
    [/I was wondering if you could\s*/gi,'can you '],
    [/Would it be possible to\s*/gi,'can we '],
    [/I wanted to follow up on\s*/gi,'following up on '],
    [/Please find attached\s*/gi,'attached: '],
    [/I am pleased to inform you\s*/gi,'quick update: '],
    [/Thank you for reaching out[.,]?\s*/gi,''],
    [/I(?:'m)? sorry (?:for|about)[^.!?]*/gi,''],
    [/I apologize[^.!?]*/gi,''],
    [/Unfortunately[,\s]*/gi,''],
  ];

  const CASUAL_CONNECTORS = ['Anyway,','Also —','Oh, and','One thing —','Heads up —'];

  // PREPOSITIONS that make it unsafe to split after
  const UNSAFE_SPLIT_WORDS = new Set(['to','of','in','on','at','by','for','with','about','from','into','through','during','before','after','above','below','between','among','a','an','the']);

  // BUG 9 FIX — protect "and more" before any replacements
  function protectAndMore(text) { return text.replace(/\band more\b/gi, '__AND_MORE__'); }
  function restoreAndMore(text) { return text.replace(/__AND_MORE__/g, 'and more'); }

  // BUG 7 FIX — protect capitalized mid-sentence single words (proper nouns) before replacements
  function protectProperNouns(text) {
    const map = {};
    let i = 0;
    // Match capitalized word that is NOT at the start of a sentence
    const result = text.replace(/(^|[.!?\n]\s+|\s)([A-Z][a-z]{3,})/g, (match, pre, word) => {
      // Only protect if preceded by a space (mid-sentence), not sentence-start punctuation
      if (pre.trim() === '' && pre.length > 0) {
        const key = `__PN${i++}__`;
        map[key] = word;
        return pre + key;
      }
      return match;
    });
    return { text: result, map };
  }
  function restoreProperNouns(text, map) {
    for (const [k, v] of Object.entries(map)) text = text.split(k).join(v);
    return text;
  }

  // FIX 3 — protect greeting lines from punctuation cleanup
  const GREETING_RE = /^(Hi|Hello|Hey|Dear)\s+[A-Z][a-z]+[,.]?.*$/;

  function cleanupPunctuation(text) {
    const lines = text.split('\n');
    for (let li = 0; li < lines.length; li++) {
      if (GREETING_RE.test(lines[li].trim())) continue;
      // BUG 4: bullet lines are read-only
      if (/^\s*[-•*]\s+/.test(lines[li])) continue;
      let r = lines[li];
      let prev;
      do {
        prev = r;
        r = r.replace(/,\s*\./g, '.');
        r = r.replace(/\.\s*\./g, '.');
        r = r.replace(/([a-zA-Z]),\./g, '$1.');
        r = r.replace(/\s+[.,](?=\s|$)/g, '');
        // FIX 1: delete orphaned transition words entirely
        r = r.replace(/\b(Furthermore|Additionally|Moreover|Consequently|Nevertheless|Also|Plus|Still|Then|However|Therefore)\b\s*[.,]?\s*(?=[.!?\n]|$)/ig, '');
        r = r.replace(/^\s*(Furthermore|Additionally|Moreover|Consequently|Nevertheless)\b\s*[.,]?\s*/i, '');
        r = r.replace(/  +/g, ' ');
      } while (r !== prev);
      lines[li] = r;
    }
    return lines.join('\n').trim();
  }

  function fixHeadlessClauses(text) {
    const sentences = text.split(/(?<=[.!?\n])\s+/);
    for (let i = 0; i < sentences.length; i++) {
      let s = sentences[i].trim();
      if (!s) continue;
      if (/^(Hi|Hello|Dear|Hey)\b/i.test(s)) continue;
      // BUG 4: bullet lines are read-only
      if (/^\s*[-•*]\s+/.test(s)) continue;

      if (/^to\s+(discuss|share|follow up|let|ask|inquire|request|provide|talk|go over|leverage)\b/i.test(s)) {
        s = "I wanted " + s;
      } else if (/^(reach out|feel free|let me know|please let|just let|share|request|confirm|check|provide)\b/i.test(s)) {
        if (!/^just\b/i.test(s)) s = "Just " + s.charAt(0).toLowerCase() + s.slice(1);
      }
      sentences[i] = s;
    }
    return sentences.join(' ');
  }

  function fixCapitalization(text) {
    return text.replace(/(?:^|[.!?]\s+|\n\s*)([a-z])/g, (match) => {
      return match.toUpperCase();
    });
  }

  // BUG 2 FIX — nuke transition words as the VERY FIRST operation
  function stripTransitionWords(text) {
    return text.replace(/\b(Furthermore|Moreover|Additionally|Consequently|Nevertheless|Notwithstanding)[,.]?\s*/gi, '');
  }

  function applyRules(text, rules) {
    // BUG 4: split into paragraphs, protect bullet paragraphs entirely
    const paragraphs = text.split(/\n\n+/);
    const processed = paragraphs.map(para => {
      // If paragraph contains any bullet line, leave it completely untouched
      if (/^\s*[-•*]\s+/m.test(para)) return para;

      // BUG 2: strip transition words FIRST before any other logic
      let r = stripTransitionWords(para);
      // Step 1: apply all filler/replacement rules
      for (const [p, s] of rules) r = r.replace(p, s);
      // Step 2: cleanup orphaned punctuation AFTER all stripping (BUG 1 fix)
      r = r.replace(/,\s*\./g, ',').replace(/\.\s*\./g, '.').trim();
      // Remove leading orphaned punctuation
      r = r.replace(/^[.,;:\s]+/, '').trim();
      r = cleanupPunctuation(r);
      // Step 3: fix headless clauses and capitalization
      r = fixHeadlessClauses(r);
      r = fixCapitalization(r);
      return r.replace(/  +/g,' ').replace(/ ,/g,',').replace(/ \./g,'.').trim();
    });
    return processed.filter(p => p.trim()).join('\n\n');
  }

  // BUG 1 FIX — lowercase after connectors, preserve proper nouns + "I"
  function lowercaseAfterConnector(sentence) {
    return sentence.replace(
      /\b(and|or|but|so|yet)\s+([A-Z])(?=[a-z])/g,
      (_, conj, cap) => {
        // Preserve "I" as capital, preserve proper nouns (we can't detect those perfectly,
        // so only lowercase if the next 3+ chars are all lowercase — indicating it's not an acronym)
        return conj + ' ' + cap.toLowerCase();
      }
    );
  }

  // BUG 2 FIX — smart bullet detection: only merge if ALL items are simple prose
  const TECHNICAL_PATTERNS = [
    /\d+[\.,]\d+/,                              // numbers with decimals
    /\d+[BMKbmk]\b/,                            // 16B, 217K etc
    /\b[A-Z]{2,}\b/,                            // uppercase acronyms GPU, TPU, API
    /\b(v\d|STM32|GPT|BERT|LLM|SRM|RoPE|MLP|SwiGLU|RMSNorm|bfloat|HAL|RTOS)\b/i,
    /:\s*\S/,                                   // "Key: value" pattern
    /~[\d]/,                                    // ~1.0
    /[\d]+[\s,]+[\d]+/,                         // 217,000
  ];

  function isTechnicalBullet(item) {
    return TECHNICAL_PATTERNS.some(p => p.test(item));
  }

  function convertBulletsToProse(text) {
    return text.replace(/(?:(?:^|\n)[ \t]*[•\-\*]\s+.+){3,}/gm, match => {
      const lines = match.split('\n').filter(l => /^\s*[•\-\*]\s+/.test(l));
      const items = lines.map(l => l.replace(/^\s*[•\-\*]\s+/, '').trim());

      // BUG 2 conditions: leave untouched if any item is technical/long/4+ items
      if (items.length >= 4) return match;
      if (items.some(i => i.length > 60)) return match;
      if (items.some(isTechnicalBullet)) return match;

      const last = items.pop();
      return items.join(', ') + ', and ' + last + '.';
    });
  }

  // Subjects that make a sentence fragment safe to split into
  const EXPLICIT_SUBJECTS = /^(i|we|they|he|she|it|you|this|that|these|those|the|my|our|your|his|her|its|their|there|here)\b/i;

  // BUG 3 + BUG 8 FIX — safe rhythm splitting, checks second half has a subject
  function shortenRhythm(text) {
    const sentences = text.split(/(?<=[.!?])\s+/);
    return sentences.map(s => {
      if (/^\s*[-•*]\s+/.test(s.trim())) return s;
      if (/__BULLETBLOCK\d+__/.test(s)) return s;
      const words = s.trim().split(/\s+/);
      if (words.length <= 20) return s;

      const mid = Math.floor(words.length / 2);
      const conjunctions = new Set(['and','but','so','which','that']);

      for (let i = Math.max(3, mid - 5); i <= Math.min(words.length - 3, mid + 5); i++) {
        if (!conjunctions.has(words[i]?.toLowerCase())) continue;
        const wordBefore = words[i - 1]?.toLowerCase().replace(/[,;]/,'');
        if (UNSAFE_SPLIT_WORDS.has(wordBefore)) continue;

        const a = words.slice(0, i).join(' ').replace(/[,;]$/, '');
        const b = words.slice(i + 1).join(' ');

        // BUG 8 FIX: only split if second half has an explicit subject
        if (!EXPLICIT_SUBJECTS.test(b.trim())) continue;

        if (a && b && b.trim().split(/\s+/).length >= 3) {
          return a + '. ' + b.charAt(0).toUpperCase() + b.slice(1);
        }
      }
      return s;
    }).join(' ');
  }

  // BUG 4 FIX — only inject casual connectors for short, informal emails
  function injectCasualConnectors(text) {
    const wordCount = text.split(/\s+/).length;
    // Condition 1: short email only
    if (wordCount > 150) return text;
    // Condition 2: no formal openers
    if (/\b(dear|to whom|sir|madam)\b/i.test(text.split('\n')[0] || '')) return text;
    // Condition 4: no formal context keywords
    if (/\b(request|proposal|grant|allocation|hereby|respectfully|submission|pursuant)\b/i.test(text)) return text;

    const parts = text.split(/(?<=[.!?])\s+/);
    if (parts.length < 3) return text;

    // Only inject once, into the second sentence (not first, not last)
    const at = 1;
    const connector = CASUAL_CONNECTORS[Math.floor(Math.random() * CASUAL_CONNECTORS.length)];
    return parts.map((s, i) => {
      if (i === at) {
        // BUG 1 fix: lowercase the first letter after connector
        const lowered = s.charAt(0).toLowerCase() + s.slice(1);
        return connector + ' ' + lowered;
      }
      return s;
    }).join(' ');
  }

  // Common adjective suffixes & words — never drop article before these (BUG 10)
  const ADJECTIVE_SUFFIXES = /(?:ful|less|ive|ous|al|ic|ble|ish|ary|ory|ent|ant|ing|ed|ern|ward)$/i;
  const COMMON_ADJECTIVES = new Set([
    'quick','fast','good','bad','big','small','new','old','high','low',
    'long','short','hard','easy','clear','simple','clean','great','last',
    'first','next','few','other','same','different','important','large','full'
  ]);

  // BUG 6 + BUG 10 FIX — only drop "a"/"the" before a noun (not an adjective)
  function dropOneSmallWord(text) {
    const parts = text.split(/(?<=[.!?])\s+/);
    if (parts.length < 3) return text;
    // Skip if text contains bullet placeholders (preserve paragraph structure)
    if (/__BULLETBLOCK\d+__/.test(text)) return text;

    for (let i = 1; i < parts.length - 1; i++) {
      const words = parts[i].split(/\s+/);
      if (words.length < 12) continue;

      for (let j = 1; j < words.length - 1; j++) {
        const w = words[j].toLowerCase();
        if (w !== 'a' && w !== 'the') continue;
        const next = words[j + 1]?.toLowerCase().replace(/[^a-z]/g,'');
        if (!next || next.length < 4) continue;

        // BUG 10 FIX: skip if next word is an adjective
        if (COMMON_ADJECTIVES.has(next)) continue;
        if (ADJECTIVE_SUFFIXES.test(next)) continue;

        words.splice(j, 1);
        parts[i] = words.join(' ');
        return parts.join(' ');
      }
    }
    return text;
  }

  // FIX 3 — typo protection: bullets, PascalCase, numbers, dots, ALL_CAPS, versions
  const URL_EMAIL_VERSION = /https?:\/\/\S+|\S+@\S+\.\S+|\bv?\d+\.\d+/i;
  const BULLET_LINE = /^\s*[-•*]\s+|^\s*\d+\.\s+/;
  const UNSAFE_TYPO_WORD = /[.\d@\/]|^[A-Z]{2,}$|^[A-Z][a-z]+[A-Z]/; // ALL_CAPS, PascalCase, dots, numbers

  const TECH_KEYWORDS = /\b(v18|t3|AWS|API|Node|PostgreSQL|Redis|React|TypeScript|CSS|CDN|EC2|S3)\b/;

  function addTypo(text) {
    const lines = text.split('\n');
    let targetLine = -1;
    let first = '';
    for (let li = 0; li < lines.length; li++) {
      const l = lines[li].trim();
      if (/^(hi|hello|dear|hey)\b/i.test(l)) continue;
      if (BULLET_LINE.test(l)) continue;
      if (l.length < 20) continue;
      const m = l.match(/^[^.!?\n]+[.!?]?/);
      if (!m) continue;
      const sentence = m[0];
      // BUG 3: skip if sentence contains bullet marker, number, or tech keyword
      if (/- /.test(sentence)) continue;
      if (/\d/.test(sentence)) continue;
      if (TECH_KEYWORDS.test(sentence)) continue;
      first = sentence;
      targetLine = li;
      break;
    }
    if (!first || targetLine < 0) return text;

    const candidates = [];
    const pat = /\b([a-z]{5,})\b/g; // lowercase only
    let m;
    while ((m = pat.exec(first)) !== null) {
      if (URL_EMAIL_VERSION.test(m[1])) continue;
      if (UNSAFE_TYPO_WORD.test(m[1])) continue; // FIX 3: number/dot/case protection
      const ctx = first.slice(Math.max(0, m.index - 3), m.index + m[1].length + 3);
      if (/[@\/.]/.test(ctx)) continue;
      // Check full word in original line for PascalCase/ALL_CAPS (regex only matched lowercase slice)
      candidates.push({ word: m[1], idx: m.index });
    }
    if (!candidates.length) return text;

    const { word, idx } = candidates[Math.floor(Math.random() * candidates.length)];
    if (word.length < 5) return text;
    const si = 1 + Math.floor(Math.random() * (word.length - 2));
    const typoed = word.slice(0, si) + word[si + 1] + word[si] + word.slice(si + 2);
    lines[targetLine] = lines[targetLine].slice(0, lines[targetLine].indexOf(first) + idx)
      + typoed
      + lines[targetLine].slice(lines[targetLine].indexOf(first) + idx + word.length);
    return lines.join('\n');
  }

  function breakPatternsOfThree(text) {
    if (/__BULLETBLOCK\d+__/.test(text)) return text;
    return text.replace(/([^.!?]{1,35}[.!?])\s+([^.!?]{1,35}[.!?])\s+([^.!?]{1,35}[.!?])/g, (match, s1, s2, s3) => {
      if (s1.split(/\s+/).length < 7 && s2.split(/\s+/).length < 7 && s3.split(/\s+/).length < 7) {
        return s1.replace(/[.!?]$/, '') + ', ' + s2.charAt(0).toLowerCase() + s2.slice(1);
      }
      return match;
    });
  }

  // PRIORITY 5 FIX — CEO split only when both parts have 5+ words AND contain subject+verb
  const HAS_SUBJECT_VERB = /\b(i|we|they|he|she|it|you|this|that|the\s+\w+)\b.{0,30}\b(is|are|was|were|have|has|had|will|can|do|does|did|need|want|send|share|check|review|approve|confirm|meet|call|complete)\b/i;

  // BUG 5 FIX — bounded section deletion for CEO mode
  function ceoHandleHeaders(text) {
    const lines = text.split('\n');
    const result = [];
    let skipMode = false;
    for (const line of lines) {
      if (/^(Current|Status|Summary|Overview|Training|Architecture|Corpus).+:?\s*$/.test(line.trim())) {
        skipMode = true;
        continue;
      }
      if (skipMode && line.trim().startsWith('- ')) {
        continue;
      }
      skipMode = false;
      result.push(line);
    }
    return result.join('\n');
  }

  const DANGLING_WORDS = new Set(['and','but','or','so','yet','which','that','because','if','to','the','a','an','with','for','of','in','on']);

  function trimDangling(s) {
    // Strip trailing period, check last word, remove if dangling, re-add period
    const bare = s.replace(/\.\s*$/, '').trimEnd();
    const words = bare.split(/\s+/);
    const last = words[words.length - 1]?.toLowerCase().replace(/[^a-z]/g, '');
    if (last && DANGLING_WORDS.has(last)) {
      return words.slice(0, -1).join(' ') + '.';
    }
    return bare + (s.endsWith('.') ? '.' : '');
  }

  // FIX 5 — CEO sentence length enforcement: max 10 words
  function ceoEnforceLength(text) {
    const sentences = text.split(/(?<=[.!?])\s+/);
    return sentences.map(s => {
      const ws = s.split(/\s+/);
      if (ws.length <= 10) return trimDangling(s);  // FIX 3: also clean already-short sentences
      // Extract core: subject + verb + object
      const core = ws.filter(w => !/^(to|the|a|an|in|on|at|by|for|with|about|that|which|from|this|our|all|are|is|we|need|before|after|and|or|but|so|very|also|just|really|then|of)$/i.test(w) ||
        /^(need|want|send|check|confirm|share|update|review|call|complete|can|will|are|is)$/i.test(w));
      if (core.length <= 10 && core.length >= 3) {
        let short = core.slice(0, 10).join(' ').toLowerCase();
        if (!/[.?]$/.test(short)) short += '.';
        return trimDangling(short);
      }
      // Fallback: just take first 10 words
      let short = ws.slice(0, 10).join(' ').toLowerCase();
      if (!/[.?]$/.test(short)) short += '.';
      return trimDangling(short);
    }).join(' ');
  }

  function ceoTransform(text) {
    // Extract greeting ("Hi Sarah,")
    const greetingMatch = text.match(/^((?:Hi|Hello|Dear|Hey)\s+[^,\n]+,?)\s*\n/m);
    const greeting = greetingMatch ? greetingMatch[1].trim() : '';

    // Extract sender name from sign-off block
    const nameMatch = text.match(/\n(?:Best|Kind|Warm)?\s*regards,?[^\n]*\n([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)?)\s*$/im);
    const name = nameMatch ? nameMatch[1].trim() : '';

    // Strip greeting, filler sign-off sentence, and closing block
    let r = text;
    r = r.replace(/^(?:Hi|Hello|Dear|Hey)\s+[^,\n]+,?\s*\n/m, '');
    r = r.replace(/\n?Thanks for considering this\.?\s*\n?/gi, '\n');
    r = r.replace(/\n?(?:Best|Kind|Warm)?\s*regards,?[^\n]*(\n[A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)?)?\s*$/im, '');

    // Remove bullet sections (section header + bullet lines)
    r = r.replace(/[^\n]*[^.\n]+:\s*\n(?:[ \t]*[-•*][^\n]+\n?)+/g, '\n');

    // Apply standard replacements first so CEO shorthand catches transformed words
    r = applyRules(r, CEO_PHRASES);
    r = applyRules(r, REPLACEMENTS);
    r = applyRules(r, CONTRACTIONS);

    // CEO shorthand (after REPLACEMENTS so stakeholders->team members->team)
    r = r.replace(/\bpull requests?\b/gi, 'PR');
    r = r.replace(/\b(?:the\s+)?staging environments?\b/gi, 'staging');
    r = r.replace(/\bimplementation phase\b/gi, 'implementation');
    r = r.replace(/\ball team members?\b/gi, 'the whole team');
    r = r.replace(/\bteam members?\b/gi, 'team');
    r = r.replace(/\bin a timely manner\b/gi, '');
    
    // FIX 2A: Grammar
    r = r.replace(/\bthe whole team are\b/gi, 'the whole team is');
    r = r.replace(/\bthe team are\b/gi, 'the team is');

    // FIX 2B: Delete self-commitment sentences
    r = r.replace(/(?:I'll make sure|I will ensure|I will make sure|I'll ensure|From here I'll|Going forward I'll)[^.!?;]*[.!?;\n]+/gi, '');

    r = r.replace(/\s+\./g, '.');

    // Score sentences by action-word density and select top 2-3
    const flat = r.replace(/\n+/g, ' ').replace(/\s{2,}/g, ' ').trim();
    const sentences = flat
      .split(/(?<=[.!?])\s+/)
      .map((s, idx) => ({ text: s.trim(), idx }))
      .filter(s => s.text.length > 10 && s.text.split(/\s+/).length >= 4);

    const FILLER_TEST = /\b(hope|pleasure|touch base|apologi|endeavor|multifaceted|foster|bolster|competitive|synerg|stakeholder)\b/i;
    const ACTION_TEST = /\b(PR|review|staging|approve|confirm|update|deadlines?|status|need|send|complete|waiting|applied|active|available|call|aligned)\b/i;

    const clean = sentences.filter(s => !FILLER_TEST.test(s.text));
    const scored = clean.map(s => ({
      text: s.text,
      idx: s.idx,
      score: (s.text.match(new RegExp(ACTION_TEST.source, 'gi')) || []).length
    }));
    scored.sort((a, b) => b.score - a.score);

    let selected = scored.filter(s => s.score > 0).slice(0, 3);
    if (!selected.length) selected = clean.slice(0, 2).map(s => ({ text: s.text, idx: s.idx, score: 0 }));
    if (!selected.length) selected = sentences.slice(0, 2).map(s => ({ text: s.text, idx: s.idx, score: 0 }));

    // FIX 2C: Enforce sentence order
    selected.sort((a, b) => a.idx - b.idx);

    let bodyText = selected.map(s => s.text).join(' ').trim();
    
    // FIX 2B Fallback: if < 3 sentences, append fallback
    if (selected.length < 3) {
      bodyText += ' Happy to jump on a call if that helps.';
    }

    const body = fixCapitalization(bodyText);

    // Assemble final output
    const out = [];
    if (greeting) { out.push(greeting); out.push(''); }
    if (body) out.push(body);
    out.push('');
    out.push('Thanks,');
    if (name) out.push(name);

    return out.join('\n').trim();
  }

  // BUG 4 — extract bullet sections (header + bullets) as read-only blocks
  function extractBullets(text) {
    const lines = text.split('\n');
    const blocks = [];
    let bulletStart = -1;
    let headerIdx = -1;
    for (let i = 0; i < lines.length; i++) {
      if (/^\s*[-•*]\s+/.test(lines[i])) {
        if (bulletStart === -1) {
          bulletStart = i;
          // Check if previous non-empty line is a header
          for (let j = i - 1; j >= 0; j--) {
            if (lines[j].trim() === '') continue;
            if (/:\s*$/.test(lines[j].trim())) { headerIdx = j; }
            break;
          }
        }
      } else if (bulletStart !== -1) {
        const start = headerIdx !== -1 ? headerIdx : bulletStart;
        blocks.push({ start, end: i - 1, lines: lines.slice(start, i) });
        bulletStart = -1;
        headerIdx = -1;
      }
    }
    if (bulletStart !== -1) {
      const start = headerIdx !== -1 ? headerIdx : bulletStart;
      blocks.push({ start, end: lines.length - 1, lines: lines.slice(start) });
    }
    // Replace bullet blocks with placeholders
    let bi = 0;
    const map = {};
    let result = text;
    for (const block of blocks.reverse()) {
      const original = block.lines.join('\n');
      const key = `\n__BULLETBLOCK${bi}__\n`;
      map[`__BULLETBLOCK${bi}__`] = original;
      bi++;
      result = result.replace(original, key);
    }
    return { text: result, map };
  }

  function restoreBullets(text, map) {
    let r = text;
    for (const [k, v] of Object.entries(map)) r = r.split(k).join(v);
    return r;
  }

  // FIX 1 — sign-off replacements for subtle mode
  // Use word-boundary match (no ^ anchor) since fixHeadlessClauses may collapse newlines
  function applySubtleSignoffs(text) {
    return text
      .replace(/\bThanks for considering this\./gi, 'Let me know what you think.')
      .replace(/\b(Best|Kind|Warm) regards,?/gi, 'Thanks,')
      .replace(/\bSincerely,?/g, 'Thanks,');
  }

  // ── PUBLIC API ──
  function subtleMode(text) {
    // BUG 2: strip transition words FIRST before anything
    let r = stripTransitionWords(text);
    r = protectAndMore(r);
    // BUG 4: extract bullet blocks before any processing
    const { text: bulletProtected, map: bulletMap } = extractBullets(r);
    const { text: protected7, map: pnMap } = protectProperNouns(bulletProtected);
    r = applyRules(protected7, REPLACEMENTS);
    r = applyRules(r, CONTRACTIONS);
    r = restoreProperNouns(r, pnMap);
    r = restoreAndMore(r);
    r = applySubtleSignoffs(r);  // FIX 1
    r = breakPatternsOfThree(r);
    r = addTypo(r);
    r = fixCapitalization(r);
    // Ensure paragraph breaks around bullet placeholders
    r = r.replace(/\s*(__BULLETBLOCK\d+__)\s*/g, '\n\n$1\n\n');
    r = restoreBullets(r, bulletMap);
    return r.trim();
  }

  function humanMode(text) {
    // BUG 2: strip transition words FIRST
    let r = stripTransitionWords(text);
    r = protectAndMore(r);
    // BUG 4: extract bullet blocks
    const { text: bulletProtected, map: bulletMap } = extractBullets(r);
    const { text: protected7, map: pnMap } = protectProperNouns(bulletProtected);
    r = applyRules(protected7, OPENERS);
    r = applyRules(r, CLOSINGS);
    r = applyRules(r, REPLACEMENTS);
    r = applyRules(r, CONTRACTIONS);
    r = restoreProperNouns(r, pnMap);
    r = restoreAndMore(r);
    r = convertBulletsToProse(r);

    // Process sentence-level operations per paragraph to preserve paragraph breaks
    let splitFired = false;
    let connectorFired = false;
    const paras = r.split(/\n\n+/);
    r = paras.map(para => {
      if (/__BULLETBLOCK\d+__/.test(para)) return para;
      if (!para.trim()) return para;

      // ── STEP A: mandatory sentence split — longest sentence over 20 words ──
      let sentences = para.split(/(?<=[.!?])\s+/);
      let maxIdx = -1, maxLen = 0;
      for (let i = 0; i < sentences.length; i++) {
        const wc = sentences[i].split(/\s+/).length;
        if (wc > maxLen) { maxLen = wc; maxIdx = i; }
      }
      if (!splitFired && maxIdx !== -1 && maxLen > 20) {
        const sent = sentences[maxIdx];
        const minPos = Math.floor(sent.length * 0.3);
        const conjRe = /\s+(but|so)\s+|\s+—\s+/g;
        let m, splitAt = -1;
        while ((m = conjRe.exec(sent)) !== null) {
          if (m.index >= minPos) { splitAt = m.index; break; }
        }
        
        if (splitAt > 0 && splitAt < sent.length - 5) {
          let a = sent.slice(0, splitAt).replace(/[,;]\s*$/, '').trim();
          let b = sent.slice(splitAt).replace(/^\s*(but|so|—)\s+/i, '').trim();
          
          const bFirstWord = b.split(/\s+/)[0].toLowerCase().replace(/[^a-z]/g, '');
          
          if (!['it', 'this', 'they', 'that'].includes(bFirstWord) && b.split(/\s+/).length >= 3) {
            const HEADLESS_VERBS = { help:'helps', make:'makes', use:'uses', drive:'drives',
              strengthen:'strengthens', ensure:'ensures', provide:'provides', build:'builds',
              keep:'keeps', allow:'allows', enable:'enables', support:'supports' };
            const conjugated = HEADLESS_VERBS[bFirstWord];
            if (conjugated) {
              b = 'It ' + conjugated + b.slice(bFirstWord.length);
            } else {
              b = b.charAt(0).toUpperCase() + b.slice(1);
            }
            sentences[maxIdx] = a + '. ' + b;
            splitFired = true;
          }
        }
      }
      para = sentences.join(' ');

      // shortenRhythm per paragraph
      para = shortenRhythm(para);

      // ── STEP B: mandatory connector ──
      if (!connectorFired) {
        const parts = para.split(/(?<=[.!?])\s+/);
        for (let i = 0; i < parts.length; i++) {
          if (/^(We should|I've|I'll)\b/.test(parts[i])) {
            parts[i] = 'Also — ' + parts[i].charAt(0).toLowerCase() + parts[i].slice(1);
            connectorFired = true;
            break;
          }
        }
        para = parts.join(' ');
      }

      return para;
    }).join('\n\n');
    console.log('[Human] split fired:', splitFired);
    console.log('[Human] connector fired:', connectorFired);

    // Specific human-mode rewrites
    r = r.replace(/I'll make sure that/gi, "I'll make sure");
    r = r.replace(/Thanks for considering this\./gi, "Let me know what you think.");

    r = applySubtleSignoffs(r);
    r = lowercaseAfterConnector(r);
    r = addTypo(r);
    r = dropOneSmallWord(r);
    r = fixCapitalization(r);
    // Restore paragraph breaks around bullet placeholders, then restore content
    r = r.replace(/\s*(__BULLETBLOCK\d+__)\s*/g, '\n\n$1\n\n');
    r = restoreBullets(r, bulletMap);
    return r.trim();
  }

  function getAIFactory() {
    if (window.ai && window.ai.languageModel) return window.ai.languageModel;
    if (window.ai && window.ai.assistant) return window.ai.assistant;
    if (window.LanguageModel) return window.LanguageModel;
    return null;
  }

  async function rewriteMode(text) {
    const factory = getAIFactory();
    if (!factory) throw new Error('Chrome AI API not found (window.ai or window.LanguageModel). Please enable flags.');

    const cap = await factory.capabilities?.();
    if (cap && cap.available === 'no') {
      throw new Error('Chrome AI model is not available or not downloaded yet.');
    }

    try {
      const session = await factory.create();
      
      const instructions = `You are an expert email editor. Rewrite the following text to sound highly natural, human, and professional. Keep all key info. Use contractions naturally. Vary sentence lengths. Remove all AI filler phrases like "hope this finds you well", "leverage", "utilize", "seamless", "robust". Output ONLY the rewritten text — no preamble, no explanations, no quotes.

TEXT TO REWRITE:
${text}`;

      const result = await session.prompt(instructions);
      
      if (session.destroy) session.destroy();
      
      if (!result || !result.trim()) {
        throw new Error('AI returned empty response.');
      }
      
      return result.trim();
    } catch (err) {
      console.error('[Humanize] window.ai session error:', err);
      throw err;
    }
  }

  async function isRewriteAvailable() {
    try {
      const factory = getAIFactory();
      if (!factory) return false;
      const cap = await factory.capabilities?.();
      return !cap || cap.available !== 'no';
    } catch { return false; }
  }

  return { subtleMode, humanMode, ceoMode: ceoTransform, rewriteMode, isRewriteAvailable };
})();
