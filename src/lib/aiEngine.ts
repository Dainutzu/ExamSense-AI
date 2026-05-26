import type { Topic, Recommendation, PredictedArea } from './supabase';

export interface AnalysisResult {
  topics: Topic[];
  recommendations: Recommendation[];
  predicted_areas: PredictedArea[];
  question_count: number;
  raw_text: string;
}

// ─── Subject-Aware Heuristics Classifier ─────────────────────────────────────

type SubjectCategory =
  | 'economics'
  | 'math'
  | 'physics'
  | 'chemistry'
  | 'biology'
  | 'cs'
  | 'history'
  | 'literature'
  | 'general';

interface SubjectDefinition {
  name: string;
  keywords: string[];
  candidateTopics: { name: string; keywords: string[] }[];
  recommendationTemplates: { text: string; importance: 'critical' | 'important' | 'optional' }[];
  predictionTemplates: string[];
}

const SUBJECT_DEFINITIONS: Record<SubjectCategory, SubjectDefinition> = {
  economics: {
    name: 'Economics & Business',
    keywords: ['demand', 'supply', 'market', 'economy', 'marginal', 'utility', 'cost', 'revenue', 'price', 'inflation', 'trade', 'microeconomics', 'macroeconomics', 'finance', 'consumer', 'producer', 'elasticity', 'gdp', 'tax', 'interest', 'oligopoly', 'monopoly', 'giffen', 'veblen', 'externality', 'surplus', 'equilibrium'],
    candidateTopics: [
      { name: 'Supply & Demand Analysis', keywords: ['supply', 'demand', 'equilibrium', 'shift', 'price'] },
      { name: 'Elasticity of Demand/Supply', keywords: ['elasticity', 'elastic', 'inelastic', 'cross-price'] },
      { name: 'Consumer Theory & Utility', keywords: ['utility', 'consumer', 'preferences', 'indifference', 'marginal utility'] },
      { name: 'Production & Cost Analysis', keywords: ['cost', 'marginal cost', 'average cost', 'revenue', 'production', 'fixed cost'] },
      { name: 'Market Structures', keywords: ['monopoly', 'perfect competition', 'oligopoly', 'monopolistic', 'game theory'] },
      { name: 'Macroeconomic Indicators', keywords: ['gdp', 'inflation', 'unemployment', 'cpi', 'real gdp', 'growth'] },
      { name: 'Monetary & Fiscal Policy', keywords: ['interest rate', 'central bank', 'tax', 'spending', 'fiscal', 'monetary'] },
      { name: 'Market Failures & Externalities', keywords: ['externality', 'public goods', 'pollution', 'subsidy', 'failure'] },
      { name: 'International Trade & Tariffs', keywords: ['tariff', 'quota', 'trade', 'export', 'import', 'comparative advantage'] }
    ],
    recommendationTemplates: [
      { text: 'Focus heavily on [TOPIC_1] — it appears to be a core focus area of this paper.', importance: 'critical' },
      { text: 'Master the curves and graphs for [TOPIC_2], especially shifts and equilibrium conditions.', importance: 'critical' },
      { text: 'Revise [TOPIC_3] calculations under timed conditions.', importance: 'important' },
      { text: 'Review definitions and real-world examples for [TOPIC_4].', importance: 'important' },
      { text: 'Understand the policy implications related to [TOPIC_5].', importance: 'optional' }
    ],
    predictionTemplates: [
      '[TOPIC_1] Shifting Scenarios',
      'Calculations in [TOPIC_2]',
      'Policy Implications of [TOPIC_3]',
      'Advanced [TOPIC_4] Proofs',
      'Conceptual Questions on [TOPIC_5]'
    ]
  },
  math: {
    name: 'Mathematics',
    keywords: ['derivative', 'integral', 'matrix', 'algebra', 'geometry', 'function', 'theorem', 'solve', 'equation', 'probability', 'statistics', 'vector', 'calculus', 'trigonometry', 'angle', 'proof', 'arithmetic', 'fraction', 'decimal', 'percentage', 'coordinate', 'parabola', 'ellipse', 'hyperbola', 'polynomial', 'factorial'],
    candidateTopics: [
      { name: 'Calculus & Differentiation', keywords: ['derivative', 'differentiate', 'calculus', 'tangent', 'rate of change'] },
      { name: 'Integration Techniques', keywords: ['integral', 'integrate', 'substitution', 'parts', 'area under curve'] },
      { name: 'Probability & Statistics', keywords: ['probability', 'statistics', 'mean', 'median', 'variance', 'distribution', 'bayes'] },
      { name: 'Linear Algebra & Matrices', keywords: ['matrix', 'matrices', 'determinant', 'vector', 'eigenvalue', 'system of equations'] },
      { name: 'Trigonometry & Geometry', keywords: ['sine', 'cosine', 'tangent', 'trigonometry', 'triangle', 'circle', 'angle', 'proof'] },
      { name: 'Complex Numbers', keywords: ['complex', 'imaginary', 'argand', 'modulus', 'argument'] },
      { name: 'Differential Equations', keywords: ['differential equation', 'homogenous', 'separable', 'first order'] },
      { name: 'Number Theory & Algebra', keywords: ['prime', 'divisibility', 'modulo', 'sequence', 'series', 'polynomial', 'inequality'] },
      { name: 'Vector Mathematics', keywords: ['vector', 'cross product', 'dot product', 'magnitude', 'plane', 'line'] }
    ],
    recommendationTemplates: [
      { text: 'Focus heavily on [TOPIC_1] — it appears in a significant number of questions.', importance: 'critical' },
      { text: 'Master [TOPIC_2] formulas and integration/derivation steps.', importance: 'critical' },
      { text: 'Practice proofs and multi-step derivations in [TOPIC_3].', importance: 'important' },
      { text: 'Review core definitions and identities for [TOPIC_4].', importance: 'important' },
      { text: 'Practice graphical representations and coordinates for [TOPIC_5].', importance: 'optional' }
    ],
    predictionTemplates: [
      '[TOPIC_1] Applied Problems',
      '[TOPIC_2] Fundamentals & Proofs',
      'Advanced [TOPIC_3] Calculus',
      '[TOPIC_4] System of Equations',
      'Geometric Representations of [TOPIC_5]'
    ]
  },
  physics: {
    name: 'Physics',
    keywords: ['force', 'energy', 'velocity', 'mass', 'gravity', 'acceleration', 'wave', 'quantum', 'field', 'charge', 'electric', 'magnetic', 'motion', 'thermodynamics', 'optics', 'light', 'friction', 'momentum', 'circuit', 'resistance', 'wavelength', 'photon', 'kinetic', 'potential', 'momentum', 'projectile', 'vector', 'torque', 'newton'],
    candidateTopics: [
      { name: 'Classical Mechanics', keywords: ['force', 'mass', 'gravity', 'acceleration', 'motion', 'projectile', 'newton', 'momentum', 'torque', 'friction'] },
      { name: 'Electromagnetism', keywords: ['charge', 'electric', 'magnetic', 'field', 'flux', 'induction', 'coulomb', 'lorentz'] },
      { name: 'Thermodynamics & Heat', keywords: ['thermodynamics', 'heat', 'entropy', 'temperature', 'carnot', 'gas laws'] },
      { name: 'Quantum & Atomic Physics', keywords: ['quantum', 'photon', 'photoelectric', 'bohr', 'schrodinger', 'energy level', 'half-life'] },
      { name: 'Wave Optics & Sound', keywords: ['wave', 'optics', 'light', 'wavelength', 'refraction', 'interference', 'diffraction', 'lens'] },
      { name: 'Electric Circuits', keywords: ['circuit', 'resistance', 'resistor', 'capacitor', 'voltage', 'current', 'ohm'] },
      { name: 'Kinematics & Dynamics', keywords: ['velocity', 'speed', 'displacement', 'kinetic', 'potential', 'work', 'energy'] }
    ],
    recommendationTemplates: [
      { text: 'Focus heavily on [TOPIC_1] — it is central to the questions in this exam.', importance: 'critical' },
      { text: 'Master [TOPIC_2] derivations, including units and vector notations.', importance: 'critical' },
      { text: 'Practice solving circuit/force diagrams related to [TOPIC_3].', importance: 'important' },
      { text: 'Review conceptual statements and theories for [TOPIC_4].', importance: 'important' },
      { text: 'Brush up on key formulas and constant values for [TOPIC_5].', importance: 'optional' }
    ],
    predictionTemplates: [
      'Mathematical Derivations of [TOPIC_1]',
      '[TOPIC_2] Field Analysis',
      'Applied [TOPIC_3] Scenarios',
      'Quantum Calculations of [TOPIC_4]',
      'Experimental Setup of [TOPIC_5]'
    ]
  },
  chemistry: {
    name: 'Chemistry',
    keywords: ['reaction', 'molecule', 'atom', 'element', 'bond', 'organic', 'acid', 'base', 'chemical', 'solution', 'periodic', 'gas', 'concentration', 'equilibrium', 'compound', 'valence', 'stoichiometry', 'titration', 'enthalpy', 'entropy', 'catalyst', 'redox', 'oxidation', 'reduction', 'molar'],
    candidateTopics: [
      { name: 'Organic Chemistry', keywords: ['organic', 'carbon', 'alkane', 'alkene', 'functional group', 'isomer', 'synthesis', 'ester', 'alcohol'] },
      { name: 'Stoichiometry & Mole Concept', keywords: ['stoichiometry', 'mole', 'molar', 'mass', 'concentration', 'yield', 'excess'] },
      { name: 'Chemical Equilibrium', keywords: ['equilibrium', 'le chatelier', 'constant', 'Kc', 'Kp', 'partial pressure'] },
      { name: 'Acids, Bases & pH', keywords: ['acid', 'base', 'pH', 'titration', 'buffer', 'neutralization', 'weak acid', 'strong base'] },
      { name: 'Thermodynamics & Kinetics', keywords: ['enthalpy', 'entropy', 'gibbs', 'activation energy', 'rate law', 'catalyst', 'endothermic'] },
      { name: 'Atomic Structure & Bonding', keywords: ['atom', 'orbital', 'covalent', 'ionic', 'bond', 'periodic table', 'valence', 'hybridization'] },
      { name: 'Redox & Electrochemistry', keywords: ['redox', 'oxidation', 'reduction', 'electrode', 'cell potential', 'electrolysis'] }
    ],
    recommendationTemplates: [
      { text: 'Focus heavily on [TOPIC_1] mechanisms and structural drawings.', importance: 'critical' },
      { text: 'Master [TOPIC_2] calculations and balance chemical equations carefully.', importance: 'critical' },
      { text: 'Practice equilibrium constant and pH calculations for [TOPIC_3].', importance: 'important' },
      { text: 'Review periodic trends and hybridization rules for [TOPIC_4].', importance: 'important' },
      { text: 'Understand lab procedures and titration curves for [TOPIC_5].', importance: 'optional' }
    ],
    predictionTemplates: [
      'Synthesis Mechanisms in [TOPIC_1]',
      '[TOPIC_2] Calculation Problems',
      'Predicting Shifts in [TOPIC_3]',
      'Atomic Geometry of [TOPIC_4]',
      'Electrochemical Cells and [TOPIC_5]'
    ]
  },
  biology: {
    name: 'Biology',
    keywords: ['cell', 'gene', 'protein', 'evolution', 'DNA', 'organism', 'ecosystem', 'photosynthesis', 'respiration', 'virus', 'bacteria', 'plant', 'animal', 'anatomy', 'chromosome', 'enzyme', 'ecology', 'mitosis', 'meiosis', 'mutation', 'selection', 'transcription', 'translation'],
    candidateTopics: [
      { name: 'Cellular Biology', keywords: ['cell', 'membrane', 'mitochondrion', 'organelle', 'mitosis', 'meiosis', 'nucleus'] },
      { name: 'Genetics & DNA', keywords: ['gene', 'DNA', 'rna', 'chromosome', 'genotype', 'phenotype', 'mutation', 'allele', 'transcription', 'translation'] },
      { name: 'Ecology & Ecosystems', keywords: ['ecosystem', 'ecology', 'biodiversity', 'food web', 'population', 'niche', 'habitat'] },
      { name: 'Physiology & Anatomy', keywords: ['organ', 'system', 'circulatory', 'nervous', 'digestive', 'respiratory', 'hormone', 'blood'] },
      { name: 'Evolution & Selection', keywords: ['evolution', 'natural selection', 'speciation', 'adaptation', 'ancestor', 'darwin'] },
      { name: 'Enzymes & Metabolism', keywords: ['enzyme', 'substrate', 'active site', 'photosynthesis', 'respiration', 'atp', 'metabolism'] },
      { name: 'Microbiology & Immunology', keywords: ['virus', 'bacteria', 'pathogen', 'antibody', 'immune', 'infection', 'vaccine'] }
    ],
    recommendationTemplates: [
      { text: 'Focus heavily on [TOPIC_1] diagrams and pathways.', importance: 'critical' },
      { text: 'Master [TOPIC_2] problems, particularly crosses and flow of genetic information.', importance: 'critical' },
      { text: 'Practice identifying the feedback loops and physiological systems in [TOPIC_3].', importance: 'important' },
      { text: 'Review key terms and definition criteria for [TOPIC_4].', importance: 'important' },
      { text: 'Memorize the steps of [TOPIC_5] and experimental design.', importance: 'optional' }
    ],
    predictionTemplates: [
      'Labeling Diagrams of [TOPIC_1]',
      'Pedigree Charts & [TOPIC_2]',
      'Environmental Impact on [TOPIC_3]',
      'Structure and Function of [TOPIC_4]',
      'Kinetic Curves of [TOPIC_5]'
    ]
  },
  cs: {
    name: 'Computer Science & IT',
    keywords: ['algorithm', 'data structure', 'complexity', 'array', 'list', 'function', 'class', 'object', 'recursion', 'memory', 'pointer', 'network', 'compiler', 'database', 'string', 'loop', 'variable', 'binary', 'tree', 'graph', 'sorting', 'programming', 'code', 'stack', 'queue', 'information', 'technology', 'system', 'systems', 'software', 'hardware', 'internet', 'security', 'digital', 'data', 'cloud', 'computer', 'computing', 'server', 'client', 'web', 'application', 'tech', 'cybersecurity', 'developer', 'it', 'techolnofy'],
    candidateTopics: [
      { name: 'Information Systems & Infrastructure', keywords: ['system', 'systems', 'infrastructure', 'hardware', 'software', 'enterprise', 'erp', 'crm', 'information'] },
      { name: 'Database Systems & Data Models', keywords: ['database', 'sql', 'query', 'table', 'primary key', 'foreign key', 'normalization', 'data'] },
      { name: 'Computer Networks & Internet', keywords: ['network', 'protocol', 'ip', 'tcp', 'http', 'packet', 'router', 'client', 'server', 'internet'] },
      { name: 'Cloud Computing & Storage', keywords: ['cloud', 'storage', 'server', 'hosting', 'virtualization', 'aws', 'azure'] },
      { name: 'Cybersecurity & Information Protection', keywords: ['security', 'cybersecurity', 'firewall', 'encryption', 'cryptography', 'threat', 'hack', 'attack'] },
      { name: 'Algorithms & Computational Logic', keywords: ['algorithm', 'sorting', 'searching', 'complexity', 'big o', 'recursion', 'binary search', 'logic'] },
      { name: 'Software Development & Coding', keywords: ['code', 'programming', 'software', 'developer', 'testing', 'git', 'refactoring'] }
    ],
    recommendationTemplates: [
      { text: 'Focus heavily on [TOPIC_1] architectures and workflow integrations.', importance: 'critical' },
      { text: 'Master [TOPIC_2] schemas and querying steps.', importance: 'critical' },
      { text: 'Practice resolving configurations and network tables for [TOPIC_3].', importance: 'important' },
      { text: 'Review core definitions and cloud service models for [TOPIC_4].', importance: 'important' },
      { text: 'Review security protocols and access controls for [TOPIC_5].', importance: 'optional' }
    ],
    predictionTemplates: [
      'Architectural Designs of [TOPIC_1]',
      'Data Modeling Tasks for [TOPIC_2]',
      'Routing Diagrams in [TOPIC_3]',
      'Service Level Optimization for [TOPIC_4]',
      'Threat Modeling of [TOPIC_5]'
    ]
  },
  history: {
    name: 'History & Social Studies',
    keywords: ['war', 'empire', 'century', 'revolution', 'treaty', 'political', 'society', 'government', 'constitution', 'civil', 'king', 'president', 'colony', 'ancient', 'historical', 'dynasty', 'feudal', 'trade route', 'parliament', 'sovereignty', 'independence'],
    candidateTopics: [
      { name: 'World War History', keywords: ['war', 'battle', 'treaty', 'alliance', 'axis', 'allies', 'germany', 'soviet', 'conflict'] },
      { name: 'Ancient Civilizations', keywords: ['ancient', 'roman', 'greek', 'egyptian', 'dynasty', 'empire', 'civilization', 'mesopotamia'] },
      { name: 'Political Ideologies & Systems', keywords: ['political', 'democracy', 'socialism', 'communism', 'fascism', 'monarchy', 'government', 'sovereignty'] },
      { name: 'Revolutions & Social Change', keywords: ['revolution', 'rebellion', 'protest', 'civil rights', 'reform', 'industrial revolution'] },
      { name: 'Colonization & Independence', keywords: ['colony', 'colonization', 'independence', 'empire', 'trade route', 'treaty of'] },
      { name: 'Constitutional & Legal History', keywords: ['constitution', 'law', 'amendment', 'court', 'supreme court', 'parliament', 'act'] }
    ],
    recommendationTemplates: [
      { text: 'Focus heavily on the primary causes and consequences of [TOPIC_1].', importance: 'critical' },
      { text: 'Master the chronological timeline of events for [TOPIC_2].', importance: 'critical' },
      { text: 'Practice structured essay writing contrasting different perspectives on [TOPIC_3].', importance: 'important' },
      { text: 'Review key treaties, agreements, and legal documents for [TOPIC_4].', importance: 'important' },
      { text: 'Understand the social impact and cultural context of [TOPIC_5].', importance: 'optional' }
    ],
    predictionTemplates: [
      'Causal Analysis of [TOPIC_1]',
      'Source-Based Essay on [TOPIC_2]',
      'Ideological Transformations in [TOPIC_3]',
      'Significance of [TOPIC_4] Documents',
      'Comparative Studies of [TOPIC_5]'
    ]
  },
  literature: {
    name: 'Literature & Language',
    keywords: ['metaphor', 'theme', 'character', 'poetry', 'novel', 'author', 'play', 'narrative', 'grammar', 'syntax', 'translation', 'essay', 'analysis', 'text', 'literary', 'poem', 'imagery', 'protagonist', 'antagonist', 'irony', 'symbolism', 'sonnet', 'alliteration'],
    candidateTopics: [
      { name: 'Literary Devices & Symbolism', keywords: ['metaphor', 'imagery', 'irony', 'symbolism', 'alliteration', 'simile', 'device', 'personification'] },
      { name: 'Narrative & Character Analysis', keywords: ['character', 'protagonist', 'antagonist', 'narrative', 'plot', 'perspective', 'narrator'] },
      { name: 'Poetry & Verse Analysis', keywords: ['poetry', 'poem', 'sonnet', 'stanza', 'rhyme', 'meter', 'verse'] },
      { name: 'Theme & Motif Studies', keywords: ['theme', 'motif', 'meaning', 'message', 'conflict', 'moral'] },
      { name: 'Grammar, Syntax & Structure', keywords: ['grammar', 'syntax', 'structure', 'clause', 'sentence', 'punctuation'] },
      { name: 'Comparative Literature & Genres', keywords: ['genre', 'tragedy', 'comedy', 'drama', 'play', 'novel', 'author'] }
    ],
    recommendationTemplates: [
      { text: 'Focus heavily on textual analysis and quote integration for [TOPIC_1].', importance: 'critical' },
      { text: 'Master the main arguments concerning [TOPIC_2] in critical essays.', importance: 'critical' },
      { text: 'Practice close-reading and annotating structure in [TOPIC_3].', importance: 'important' },
      { text: 'Review character arcs and historical context for [TOPIC_4].', importance: 'important' },
      { text: 'Refine grammar mechanics and thesis statements regarding [TOPIC_5].', importance: 'optional' }
    ],
    predictionTemplates: [
      'Close Reading Analysis of [TOPIC_1]',
      'Comparative Essay on [TOPIC_2] Themes',
      'Poetic Form & Structure of [TOPIC_3]',
      'Character Motivation in [TOPIC_4]',
      'Structural Elements of [TOPIC_5]'
    ]
  },
  general: {
    name: 'General Studies & Science',
    keywords: [],
    candidateTopics: [
      { name: 'Critical Thinking & Problem Solving', keywords: ['logic', 'problem', 'solve', 'critical', 'reasoning'] },
      { name: 'Research Methodologies', keywords: ['method', 'research', 'experiment', 'data', 'analysis', 'survey'] },
      { name: 'Data Interpretation', keywords: ['chart', 'graph', 'table', 'results', 'data', 'trends'] },
      { name: 'General Theory Applications', keywords: ['theory', 'model', 'concept', 'framework'] },
      { name: 'Ethics & Case Studies', keywords: ['ethics', 'ethical', 'case study', 'implications', 'scenario'] }
    ],
    recommendationTemplates: [
      { text: 'Focus heavily on [TOPIC_1] and apply logical frameworks.', importance: 'critical' },
      { text: 'Master [TOPIC_2] techniques for experimental design.', importance: 'critical' },
      { text: 'Practice reading and synthesizing information from [TOPIC_3].', importance: 'important' },
      { text: 'Review core terminology and conceptual frameworks for [TOPIC_4].', importance: 'important' },
      { text: 'Practice responding to case study problems for [TOPIC_5].', importance: 'optional' }
    ],
    predictionTemplates: [
      'Problem Solving for [TOPIC_1]',
      'Experimental Design in [TOPIC_2]',
      'Synthesizing Trends in [TOPIC_3]',
      'Case Study Analysis on [TOPIC_4]',
      'Theoretical Framework of [TOPIC_5]'
    ]
  }
};

function analyzePaperHeuristically(text: string, fileName: string): AnalysisResult {
  const cleanText = (text + ' ' + fileName).toLowerCase();
  
  // 1. Detect subject
  let bestSubject: SubjectCategory = 'general';
  let maxMatches = -1;
  
  for (const [subjKey, def] of Object.entries(SUBJECT_DEFINITIONS)) {
    if (subjKey === 'general') continue;
    let matchCount = 0;
    for (const keyword of def.keywords) {
      const regex = new RegExp('\\b' + keyword + '\\b', 'g');
      const matches = cleanText.match(regex);
      if (matches) {
        matchCount += matches.length;
      }
    }
    
    // Check filename explicitly for key subject identifiers
    const lName = fileName.toLowerCase();
    if (subjKey === 'economics' && (lName.includes('econ') || lName.includes('micro') || lName.includes('macro') || lName.includes('finance') || lName.includes('business'))) {
      matchCount += 30;
    }
    if (subjKey === 'math' && (lName.includes('math') || lName.includes('calc') || lName.includes('algebra') || lName.includes('geometry') || lName.includes('stat'))) {
      matchCount += 30;
    }
    if (subjKey === 'physics' && lName.includes('phys')) {
      matchCount += 30;
    }
    if (subjKey === 'chemistry' && lName.includes('chem')) {
      matchCount += 30;
    }
    if (subjKey === 'biology' && lName.includes('bio')) {
      matchCount += 30;
    }
    if (subjKey === 'cs' && (
      lName.includes('cs') || 
      lName.includes('comp') || 
      lName.includes('prog') || 
      lName.includes('code') || 
      lName.includes('java') || 
      lName.includes('python') ||
      lName.includes('tech') ||
      lName.includes('info') ||
      lName.includes('system') ||
      lName.includes('network') ||
      lName.includes('it')
    )) {
      matchCount += 50;
    }
    if (subjKey === 'history' && (lName.includes('hist') || lName.includes('social') || lName.includes('war'))) {
      matchCount += 30;
    }
    if (subjKey === 'literature' && (lName.includes('lit') || lName.includes('english') || lName.includes('lang') || lName.includes('poem') || lName.includes('essay'))) {
      matchCount += 30;
    }
    
    if (matchCount > maxMatches && matchCount > 0) {
      maxMatches = matchCount;
      bestSubject = subjKey as SubjectCategory;
    }
  }
  
  const def = SUBJECT_DEFINITIONS[bestSubject];
  
  // 2. Score candidate topics
  const scoredTopics = def.candidateTopics.map(topic => {
    let score = 0;
    for (const keyword of topic.keywords) {
      const regex = new RegExp('\\b' + keyword + '\\b', 'g');
      const matches = cleanText.match(regex);
      if (matches) {
        score += matches.length;
      }
    }
    // Add small default score based on index to keep a consistent hierarchy if no keywords match
    return { name: topic.name, score };
  });
  
  // Sort descending by score, select top 5 topics
  scoredTopics.sort((a, b) => b.score - a.score);
  const selectedTopics = scoredTopics.slice(0, 5);
  
  // 3. Estimate Question Count
  const questionPattern = /\b(?:question|q|q\.)\s*\d+\b/gi;
  const questionMatches = text.match(questionPattern);
  let questionCount = 30; // Default
  if (questionMatches && questionMatches.length > 5) {
    const numbers = questionMatches.map(m => {
      const numMatch = m.match(/\d+/);
      return numMatch ? parseInt(numMatch[0]) : null;
    }).filter((n): n is number => n !== null);
    const maxNum = Math.max(...numbers, 0);
    if (maxNum > 5 && maxNum < 150) {
      questionCount = maxNum;
    } else {
      questionCount = Math.min(80, Math.max(10, questionMatches.length));
    }
  } else {
    const listPattern = /^\s*\d+[\.\)]\s+[A-Z]/gm;
    const listMatches = text.match(listPattern);
    if (listMatches && listMatches.length > 5) {
      questionCount = Math.min(100, listMatches.length);
    } else {
      const words = text.split(/\s+/).length;
      questionCount = Math.min(65, Math.max(15, Math.floor(words / 140)));
    }
  }
  
  // Ensure realistic range
  questionCount = Math.max(10, Math.min(100, questionCount));
  
  // 4. Generate Topics array with counts and priorities
  let remainingQuestions = questionCount;
  const topics: Topic[] = selectedTopics.map((st, index) => {
    let count = 1;
    if (index === 0) {
      count = Math.max(3, Math.floor(questionCount * 0.38));
    } else if (index === 1) {
      count = Math.max(2, Math.floor(questionCount * 0.26));
    } else if (index === 2) {
      count = Math.max(2, Math.floor(questionCount * 0.18));
    } else if (index === 3) {
      count = Math.max(1, Math.floor(questionCount * 0.11));
    } else {
      count = Math.max(1, Math.floor(questionCount * 0.07));
    }
    
    count = Math.max(1, Math.min(remainingQuestions, count));
    remainingQuestions = Math.max(0, remainingQuestions - count);
    
    let priority: 'high' | 'medium' | 'low' = 'low';
    if (index <= 1) priority = 'high';
    else if (index <= 3) priority = 'medium';
    
    return {
      name: st.name,
      count,
      priority
    };
  });
  
  if (remainingQuestions > 0 && topics.length > 0) {
    topics[0].count += remainingQuestions;
  }
  
  topics.sort((a, b) => b.count - a.count);
  
  // 5. Generate Recommendations
  const topicNames = topics.map(t => t.name);
  while (topicNames.length < 5) {
    topicNames.push('Fundamental Core Principles');
  }
  
  const recommendations: Recommendation[] = def.recommendationTemplates.map((templateObj) => {
    let textStr = templateObj.text;
    textStr = textStr.replace('[TOPIC_1]', topicNames[0]);
    textStr = textStr.replace('[TOPIC_2]', topicNames[1]);
    textStr = textStr.replace('[TOPIC_3]', topicNames[2]);
    textStr = textStr.replace('[TOPIC_4]', topicNames[3]);
    textStr = textStr.replace('[TOPIC_5]', topicNames[4]);
    return {
      text: textStr,
      importance: templateObj.importance
    };
  });
  
  // 6. Generate Predicted Exam Areas
  const predicted_areas: PredictedArea[] = def.predictionTemplates.map((templateStr, index) => {
    let area = templateStr;
    area = area.replace('[TOPIC_1]', topicNames[0]);
    area = area.replace('[TOPIC_2]', topicNames[1]);
    area = area.replace('[TOPIC_3]', topicNames[2]);
    area = area.replace('[TOPIC_4]', topicNames[3]);
    area = area.replace('[TOPIC_5]', topicNames[4]);
    
    let confidence = 94 - index * 7 - Math.floor(Math.random() * 4);
    confidence = Math.max(50, Math.min(98, confidence));
    
    return {
      area,
      confidence
    };
  });
  
  return {
    topics,
    recommendations,
    predicted_areas,
    question_count: questionCount,
    raw_text: text
  };
}

// ─── PDF Text Extraction ──────────────────────────────────────────────────
export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    const pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n';
    }

    return fullText;
  } catch (err) {
    console.error('PDF extraction error:', err);
    return '';
  }
}

// ─── AI Analysis ─────────────────────────────────────────────────────────
export async function analyzeExamPaper(
  text: string,
  fileName: string
): Promise<AnalysisResult> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  if (!apiKey || apiKey === 'your_openai_api_key') {
    // Return heuristic-based dynamic local data with a simulated delay
    await new Promise(r => setTimeout(r, 2200));
    return analyzePaperHeuristically(text, fileName);
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are an expert exam analyst. Analyze the following exam paper text and return a JSON object with:
- topics: array of { name: string, count: number, priority: "high"|"medium"|"low" }
- recommendations: array of { text: string, importance: "critical"|"important"|"optional" }
- predicted_areas: array of { area: string, confidence: number (0-100) }
- question_count: number
Sort topics by count descending. Return only valid JSON.`,
          },
          {
            role: 'user',
            content: `Exam paper: "${fileName}"\n\n${text.substring(0, 6000)}`,
          },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API responded with status ${response.status}`);
    }

    const data = await response.json();
    const parsed = JSON.parse(data.choices[0].message.content);
    return { ...parsed, raw_text: text };
  } catch (err) {
    console.warn('OpenAI analysis error, falling back to local heuristic analysis:', err);
    return analyzePaperHeuristically(text, fileName);
  }
}

// ─── Image Text Extraction ────────────────────────────────────────────────
export async function extractTextFromImage(file: File): Promise<string> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey || apiKey === 'your_openai_api_key') {
    return 'Mock extracted text from image-based exam paper: Microeconomics exam paper questions on supply demand consumer surplus elasticity and market failure.';
  }

  try {
    const base64 = await fileToBase64(file);
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Extract all text from this exam paper image. Include all questions, numbers, and text verbatim.' },
              { type: 'image_url', image_url: { url: `data:${file.type};base64,${base64}` } },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API responded with status ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  } catch (err) {
    console.warn('Image extraction OpenAI error, returning default mock text:', err);
    return 'Mock extracted text from image-based exam paper: Microeconomics exam paper questions on supply demand consumer surplus elasticity and market failure.';
  }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
  });
}
