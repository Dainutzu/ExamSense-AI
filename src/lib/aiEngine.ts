import type { Topic, Recommendation, PredictedArea, TopicMapping, KeyTheory, StudyPlanItem } from './supabase';

export interface AnalysisResult {
  topics: Topic[];
  recommendations: Recommendation[];
  predicted_areas: PredictedArea[];
  question_count: number;
  raw_text: string;
  detected_subjects: string[];
  topic_mapping: TopicMapping[];
  key_theories: KeyTheory[];
  high_priority_topics: string[];
  predicted_questions: string[];
  study_plan: StudyPlanItem[];
}

// ─── Subject-Aware Heuristics Classifier ─────────────────────────────────────

type SubjectCategory =
  | 'management'
  | 'accounting'
  | 'economics'
  | 'business'
  | 'law'
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
  relatedFields: string[];
  keyTheoryTemplates: { name: string; description: string }[];
  recommendationTemplates: { text: string; importance: 'critical' | 'important' | 'optional' }[];
  predictionTemplates: string[];
  studyFocus: string[];
}

const SUBJECT_DEFINITIONS: Record<SubjectCategory, SubjectDefinition> = {
  management: {
    name: 'Principles of Management',
    keywords: ['management', 'manager', 'planning', 'organizing', 'leading', 'controlling', 'motivation', 'leadership', 'organisation', 'delegation', 'authority', 'responsibility', 'span', 'hierarchy', 'objective', 'strategy', 'policy', 'decision', 'coordination', 'staffing', 'hrm', 'human resource', 'fayol', 'taylor', 'maslow', 'herzberg', 'mcgregor'],
    candidateTopics: [
      { name: 'Functions of Management', keywords: ['planning', 'organizing', 'leading', 'controlling', 'staffing', 'coordinating'] },
      { name: 'Motivation Theories', keywords: ['motivation', 'maslow', 'herzberg', 'mcgregor', 'theory x', 'theory y', 'needs', 'hygiene'] },
      { name: 'Leadership Styles', keywords: ['leadership', 'autocratic', 'democratic', 'laissez', 'transactional', 'transformational'] },
      { name: 'Organizational Structure', keywords: ['hierarchy', 'span of control', 'delegation', 'authority', 'responsibility', 'structure', 'centralisation'] },
      { name: 'Strategic Planning', keywords: ['strategy', 'mission', 'vision', 'objective', 'swot', 'planning', 'goal'] },
      { name: 'Human Resource Management', keywords: ['hrm', 'recruitment', 'training', 'performance', 'appraisal', 'human resource'] },
      { name: 'Decision Making', keywords: ['decision', 'problem solving', 'rational', 'bounded rationality', 'group decision'] }
    ],
    relatedFields: ['Organizational Behavior', 'Psychology', 'HR Management', 'Business Studies', 'Leadership Studies'],
    keyTheoryTemplates: [
      { name: "Maslow's Hierarchy of Needs", description: "Five-level pyramid of human needs: physiological, safety, love, esteem, self-actualization." },
      { name: "Herzberg's Two-Factor Theory", description: "Distinguishes motivators (growth, achievement) from hygiene factors (salary, environment)." },
      { name: "Fayol's 14 Principles of Management", description: "Classic principles including division of work, authority, unity of command, and esprit de corps." },
      { name: "McGregor's Theory X and Y", description: "Theory X assumes workers dislike work; Theory Y assumes they are self-motivated." }
    ],
    recommendationTemplates: [
      { text: 'Deeply understand [TOPIC_1] — draw diagrams and apply real company examples.', importance: 'critical' },
      { text: 'Compare and contrast all theories within [TOPIC_2] — examiners often ask this.', importance: 'critical' },
      { text: 'Memorize the key names and frameworks in [TOPIC_3] with definitions.', importance: 'important' },
      { text: 'Write practice essay answers applying [TOPIC_4] to business scenarios.', importance: 'important' },
      { text: 'Review the historical context and practical application of [TOPIC_5].', importance: 'optional' }
    ],
    predictionTemplates: [
      'Evaluate [TOPIC_1] using a real-world organizational example',
      'Compare two theories of [TOPIC_2]',
      'Explain how [TOPIC_3] applies in modern business',
      'Discuss the advantages and disadvantages of [TOPIC_4]',
      'Case study on [TOPIC_5] in a Sri Lankan company'
    ],
    studyFocus: ['Motivation theories', 'Leadership styles', 'Fayol\'s principles', 'Organizational structure', 'Decision making']
  },
  accounting: {
    name: 'Accounting',
    keywords: ['debit', 'credit', 'balance sheet', 'income statement', 'profit', 'loss', 'ledger', 'journal', 'trial balance', 'depreciation', 'asset', 'liability', 'equity', 'revenue', 'expense', 'cash flow', 'ratio', 'audit', 'taxation', 'account', 'bookkeeping', 'financial statement', 'accrual', 'prepaid', 'provision'],
    candidateTopics: [
      { name: 'Financial Statements', keywords: ['balance sheet', 'income statement', 'profit', 'loss', 'cash flow', 'statement'] },
      { name: 'Double Entry Bookkeeping', keywords: ['debit', 'credit', 'journal', 'ledger', 'entry', 'bookkeeping'] },
      { name: 'Trial Balance & Adjustments', keywords: ['trial balance', 'adjustment', 'accrual', 'prepaid', 'provision', 'depreciation'] },
      { name: 'Ratio Analysis', keywords: ['ratio', 'liquidity', 'profitability', 'solvency', 'current ratio', 'gearing'] },
      { name: 'Depreciation Methods', keywords: ['depreciation', 'straight line', 'reducing balance', 'asset', 'amortization'] },
      { name: 'Cost Accounting', keywords: ['cost', 'marginal costing', 'absorption', 'overhead', 'variable', 'fixed cost'] },
      { name: 'Budgeting & Variance Analysis', keywords: ['budget', 'variance', 'forecast', 'standard cost', 'actual'] }
    ],
    relatedFields: ['Business Studies', 'Economics', 'Finance', 'Mathematics', 'Law'],
    keyTheoryTemplates: [
      { name: 'Accruals Concept', description: 'Revenue and expenses are recorded when earned/incurred, not when cash is received or paid.' },
      { name: 'Going Concern Concept', description: 'Financial statements are prepared assuming the business will continue operating indefinitely.' },
      { name: 'Double Entry Principle', description: 'Every transaction affects two accounts: one debit and one credit of equal value.' },
      { name: 'Matching Concept', description: 'Expenses must be matched with the revenues they help to generate in the same period.' }
    ],
    recommendationTemplates: [
      { text: 'Practice full [TOPIC_1] preparation under timed conditions — format matters.', importance: 'critical' },
      { text: 'Master [TOPIC_2] — understanding debit/credit rules is foundational.', importance: 'critical' },
      { text: 'Memorize the formulas for [TOPIC_3] and practice interpreting results.', importance: 'important' },
      { text: 'Review adjusting entries and their impact on [TOPIC_4].', importance: 'important' },
      { text: 'Understand the conceptual basis behind [TOPIC_5].', importance: 'optional' }
    ],
    predictionTemplates: [
      'Prepare a complete [TOPIC_1] from given data',
      'Calculate and interpret [TOPIC_2] ratios',
      'Apply [TOPIC_3] adjustments to the trial balance',
      'Explain [TOPIC_4] with worked examples',
      'Evaluate [TOPIC_5] in a given business scenario'
    ],
    studyFocus: ['Financial statements', 'Double entry', 'Ratio analysis', 'Trial balance adjustments', 'Depreciation']
  },
  economics: {
    name: 'Economics',
    keywords: ['demand', 'supply', 'market', 'economy', 'marginal', 'utility', 'cost', 'revenue', 'price', 'inflation', 'trade', 'microeconomics', 'macroeconomics', 'finance', 'consumer', 'producer', 'elasticity', 'gdp', 'tax', 'interest', 'oligopoly', 'monopoly', 'externality', 'surplus', 'equilibrium', 'scarcity', 'opportunity cost'],
    candidateTopics: [
      { name: 'Supply & Demand Analysis', keywords: ['supply', 'demand', 'equilibrium', 'shift', 'price', 'quantity'] },
      { name: 'Elasticity', keywords: ['elasticity', 'elastic', 'inelastic', 'cross-price', 'income elasticity'] },
      { name: 'Consumer Theory & Utility', keywords: ['utility', 'consumer', 'preferences', 'indifference', 'marginal utility', 'budget'] },
      { name: 'Market Structures', keywords: ['monopoly', 'perfect competition', 'oligopoly', 'monopolistic', 'duopoly'] },
      { name: 'Macroeconomic Indicators', keywords: ['gdp', 'inflation', 'unemployment', 'cpi', 'growth', 'recession'] },
      { name: 'Monetary & Fiscal Policy', keywords: ['interest rate', 'central bank', 'tax', 'spending', 'fiscal', 'monetary', 'money supply'] },
      { name: 'International Trade', keywords: ['tariff', 'quota', 'trade', 'export', 'import', 'comparative advantage', 'balance of payments'] }
    ],
    relatedFields: ['Business Studies', 'Mathematics', 'Political Science', 'Sociology', 'Finance'],
    keyTheoryTemplates: [
      { name: 'Law of Demand', description: 'As price increases, quantity demanded decreases, ceteris paribus.' },
      { name: 'Price Elasticity of Demand', description: 'Measures responsiveness of quantity demanded to a change in price.' },
      { name: 'Keynesian Theory', description: 'Government spending can stimulate aggregate demand and pull economies out of recessions.' },
      { name: 'Comparative Advantage', description: 'Countries should produce goods where they have a lower opportunity cost and trade for others.' }
    ],
    recommendationTemplates: [
      { text: 'Master drawing and shifting diagrams for [TOPIC_1].', importance: 'critical' },
      { text: 'Practice [TOPIC_2] calculations and interpretation for exam data questions.', importance: 'critical' },
      { text: 'Understand policy implications and evaluate [TOPIC_3] from multiple perspectives.', importance: 'important' },
      { text: 'Know the assumptions and limitations of [TOPIC_4] models.', importance: 'important' },
      { text: 'Review real-world case studies related to [TOPIC_5].', importance: 'optional' }
    ],
    predictionTemplates: [
      'Draw and explain the [TOPIC_1] equilibrium diagram',
      'Calculate and interpret [TOPIC_2] from given data',
      'Evaluate the effectiveness of [TOPIC_3] policy',
      'Compare and contrast [TOPIC_4] market structures',
      'Discuss the impact of [TOPIC_5] on a developing economy'
    ],
    studyFocus: ['Supply & demand diagrams', 'Elasticity calculations', 'Market structures', 'Fiscal vs monetary policy', 'GDP and inflation']
  },
  business: {
    name: 'Business Studies',
    keywords: ['business', 'entrepreneur', 'marketing', 'product', 'brand', 'promotion', 'stakeholder', 'shareholder', 'corporate', 'strategic', 'competitor', 'customer', 'swot', 'pestle', 'cash flow', 'breakeven', 'operations', 'supply chain', 'logistics', 'e-commerce', 'globalisation', 'merger', 'acquisition', 'franchise'],
    candidateTopics: [
      { name: 'Marketing Mix (4Ps)', keywords: ['product', 'price', 'place', 'promotion', 'marketing', 'brand'] },
      { name: 'Business Environment Analysis', keywords: ['swot', 'pestle', 'competitor', 'environment', 'external', 'internal'] },
      { name: 'Entrepreneurship & Start-ups', keywords: ['entrepreneur', 'startup', 'business plan', 'innovation', 'risk', 'venture'] },
      { name: 'Operations Management', keywords: ['operations', 'supply chain', 'logistics', 'lean', 'quality', 'production'] },
      { name: 'Corporate Strategy', keywords: ['strategy', 'merger', 'acquisition', 'growth', 'diversification', 'globalisation'] },
      { name: 'Stakeholder Management', keywords: ['stakeholder', 'shareholder', 'corporate social responsibility', 'csr', 'ethics'] },
      { name: 'Financial Planning', keywords: ['breakeven', 'cash flow', 'budget', 'profit', 'revenue', 'forecast'] }
    ],
    relatedFields: ['Economics', 'Management', 'Accounting', 'Marketing', 'Law'],
    keyTheoryTemplates: [
      { name: 'SWOT Analysis', description: 'Framework for identifying Strengths, Weaknesses, Opportunities and Threats.' },
      { name: 'PESTLE Analysis', description: 'Analyses macro-environment: Political, Economic, Social, Technological, Legal, Environmental.' },
      { name: 'Marketing Mix (4Ps)', description: 'Product, Price, Place and Promotion — the core tools of marketing strategy.' },
      { name: 'Ansoff Matrix', description: 'Strategic planning tool for market penetration, development, product development and diversification.' }
    ],
    recommendationTemplates: [
      { text: 'Apply real-world examples when answering questions on [TOPIC_1].', importance: 'critical' },
      { text: 'Practise structured evaluation essays on [TOPIC_2] using pros/cons approach.', importance: 'critical' },
      { text: 'Draw and label all diagrams associated with [TOPIC_3].', importance: 'important' },
      { text: 'Know the key terminology and definitions for [TOPIC_4].', importance: 'important' },
      { text: 'Understand the ethical dimensions of [TOPIC_5].', importance: 'optional' }
    ],
    predictionTemplates: [
      'Analyse a business using [TOPIC_1]',
      'Evaluate the strategic decision regarding [TOPIC_2]',
      'Discuss the role of [TOPIC_3] in a growing business',
      'Case study analysis involving [TOPIC_4]',
      'Recommend and justify a strategy for [TOPIC_5]'
    ],
    studyFocus: ['Marketing mix', 'SWOT/PESTLE', 'Cash flow management', 'Stakeholders', 'Business growth strategies']
  },
  law: {
    name: 'Law',
    keywords: ['contract', 'tort', 'liability', 'negligence', 'plaintiff', 'defendant', 'court', 'judge', 'statute', 'common law', 'legislation', 'breach', 'remedy', 'damages', 'offer', 'acceptance', 'consideration', 'constitutional', 'criminal', 'civil', 'appeal', 'jurisdiction', 'precedent', 'legal'],
    candidateTopics: [
      { name: 'Contract Law', keywords: ['contract', 'offer', 'acceptance', 'consideration', 'breach', 'terms', 'agreement'] },
      { name: 'Tort Law & Negligence', keywords: ['tort', 'negligence', 'duty of care', 'liability', 'damages', 'plaintiff', 'defendant'] },
      { name: 'Constitutional Law', keywords: ['constitution', 'rights', 'fundamental', 'parliament', 'government', 'constitutional'] },
      { name: 'Criminal Law', keywords: ['criminal', 'crime', 'offence', 'prosecution', 'sentence', 'mens rea', 'actus reus'] },
      { name: 'Sources of Law', keywords: ['statute', 'common law', 'precedent', 'legislation', 'equity', 'case law'] },
      { name: 'Company & Commercial Law', keywords: ['company', 'corporate', 'shareholder', 'director', 'insolvency', 'commercial'] }
    ],
    relatedFields: ['Business Studies', 'Political Science', 'Ethics', 'Sociology', 'Management'],
    keyTheoryTemplates: [
      { name: 'Doctrine of Precedent (Stare Decisis)', description: 'Courts are bound by earlier decisions of higher courts in similar cases.' },
      { name: 'Elements of a Valid Contract', description: 'Offer, acceptance, consideration, intention and capacity are required for a binding contract.' },
      { name: 'Duty of Care (Donoghue v Stevenson)', description: 'Establishes that manufacturers owe a duty of care to end consumers.' },
      { name: 'Rule of Law', description: 'Everyone is subject to the law equally; no one is above it.' }
    ],
    recommendationTemplates: [
      { text: 'Apply the IRAC method (Issue, Rule, Application, Conclusion) for all [TOPIC_1] problems.', importance: 'critical' },
      { text: 'Memorize landmark cases and statutes relevant to [TOPIC_2].', importance: 'critical' },
      { text: 'Practice problem-based questions for [TOPIC_3].', importance: 'important' },
      { text: 'Understand the procedural steps and remedies in [TOPIC_4].', importance: 'important' },
      { text: 'Review the historical development of [TOPIC_5].', importance: 'optional' }
    ],
    predictionTemplates: [
      'Problem question on [TOPIC_1] using IRAC method',
      'Discuss the elements of [TOPIC_2] with case examples',
      'Explain the role of [TOPIC_3] in the legal system',
      'Advise the parties in a [TOPIC_4] scenario',
      'Compare [TOPIC_5] under common law and statute'
    ],
    studyFocus: ['Contract formation', 'Negligence and duty of care', 'Landmark cases', 'IRAC method', 'Sources of law']
  },
  math: {
    name: 'Mathematics',
    keywords: ['derivative', 'integral', 'matrix', 'algebra', 'geometry', 'function', 'theorem', 'solve', 'equation', 'probability', 'statistics', 'vector', 'calculus', 'trigonometry', 'angle', 'proof', 'arithmetic', 'fraction', 'decimal', 'percentage', 'coordinate', 'polynomial', 'factorial', 'logarithm'],
    candidateTopics: [
      { name: 'Calculus & Differentiation', keywords: ['derivative', 'differentiate', 'calculus', 'tangent', 'rate of change', 'chain rule'] },
      { name: 'Integration Techniques', keywords: ['integral', 'integrate', 'substitution', 'by parts', 'area under curve'] },
      { name: 'Probability & Statistics', keywords: ['probability', 'statistics', 'mean', 'median', 'variance', 'distribution', 'bayes'] },
      { name: 'Linear Algebra & Matrices', keywords: ['matrix', 'matrices', 'determinant', 'vector', 'eigenvalue', 'system of equations'] },
      { name: 'Trigonometry & Geometry', keywords: ['sine', 'cosine', 'tangent', 'trigonometry', 'triangle', 'circle', 'angle', 'proof'] },
      { name: 'Complex Numbers', keywords: ['complex', 'imaginary', 'argand', 'modulus', 'argument'] },
      { name: 'Number Theory & Algebra', keywords: ['prime', 'divisibility', 'sequence', 'series', 'polynomial', 'inequality', 'logarithm'] }
    ],
    relatedFields: ['Physics', 'Economics', 'Computer Science', 'Statistics', 'Engineering'],
    keyTheoryTemplates: [
      { name: 'Fundamental Theorem of Calculus', description: 'Connects differentiation and integration as inverse operations.' },
      { name: 'Bayes\' Theorem', description: 'Formula for updating probability based on new evidence: P(A|B) = P(B|A)P(A)/P(B).' },
      { name: 'Pythagorean Theorem', description: 'In a right triangle: a² + b² = c², where c is the hypotenuse.' },
      { name: 'Binomial Theorem', description: 'Expands (a+b)ⁿ using binomial coefficients.' }
    ],
    recommendationTemplates: [
      { text: 'Practice [TOPIC_1] step-by-step under timed conditions.', importance: 'critical' },
      { text: 'Memorize all key formulas for [TOPIC_2] and apply them to varied problems.', importance: 'critical' },
      { text: 'Work through past paper questions specifically on [TOPIC_3].', importance: 'important' },
      { text: 'Review proofs and graphical representations of [TOPIC_4].', importance: 'important' },
      { text: 'Understand edge cases and exceptions in [TOPIC_5].', importance: 'optional' }
    ],
    predictionTemplates: [
      'Evaluate and simplify [TOPIC_1] expression',
      'Prove the [TOPIC_2] theorem from first principles',
      'Solve applied problems using [TOPIC_3]',
      '[TOPIC_4] graphing and interpretation',
      'Mixed problem involving [TOPIC_5]'
    ],
    studyFocus: ['Calculus techniques', 'Matrix operations', 'Probability distributions', 'Trigonometric identities', 'Algebraic proofs']
  },
  physics: {
    name: 'Physics',
    keywords: ['force', 'energy', 'velocity', 'mass', 'gravity', 'acceleration', 'wave', 'quantum', 'field', 'charge', 'electric', 'magnetic', 'motion', 'thermodynamics', 'optics', 'light', 'friction', 'momentum', 'circuit', 'resistance', 'wavelength', 'photon', 'kinetic', 'potential', 'newton', 'torque'],
    candidateTopics: [
      { name: 'Classical Mechanics', keywords: ['force', 'mass', 'gravity', 'acceleration', 'motion', 'projectile', 'newton', 'momentum'] },
      { name: 'Electromagnetism', keywords: ['charge', 'electric', 'magnetic', 'field', 'flux', 'induction', 'coulomb', 'lorentz'] },
      { name: 'Thermodynamics & Heat', keywords: ['thermodynamics', 'heat', 'entropy', 'temperature', 'carnot', 'gas laws'] },
      { name: 'Quantum & Atomic Physics', keywords: ['quantum', 'photon', 'photoelectric', 'bohr', 'energy level', 'half-life'] },
      { name: 'Wave Optics & Sound', keywords: ['wave', 'optics', 'light', 'wavelength', 'refraction', 'interference', 'diffraction'] },
      { name: 'Electric Circuits', keywords: ['circuit', 'resistance', 'resistor', 'capacitor', 'voltage', 'current', 'ohm'] },
      { name: 'Kinematics & Dynamics', keywords: ['velocity', 'speed', 'displacement', 'kinetic', 'potential', 'work', 'energy'] }
    ],
    relatedFields: ['Mathematics', 'Chemistry', 'Engineering', 'Astronomy', 'Computer Science'],
    keyTheoryTemplates: [
      { name: 'Newton\'s Laws of Motion', description: 'Three laws governing force, mass and acceleration forming the basis of classical mechanics.' },
      { name: 'Conservation of Energy', description: 'Energy cannot be created or destroyed, only converted from one form to another.' },
      { name: 'Ohm\'s Law', description: 'Voltage = Current × Resistance (V = IR) in an electrical circuit.' },
      { name: 'Wave-Particle Duality', description: 'Light and matter exhibit both wave and particle properties depending on the experiment.' }
    ],
    recommendationTemplates: [
      { text: 'Master all derivations and unit analysis for [TOPIC_1].', importance: 'critical' },
      { text: 'Draw clear force/field diagrams for [TOPIC_2] questions.', importance: 'critical' },
      { text: 'Practice multi-step calculation problems for [TOPIC_3].', importance: 'important' },
      { text: 'Understand the conceptual reasoning behind [TOPIC_4].', importance: 'important' },
      { text: 'Review experimental setups and error analysis for [TOPIC_5].', importance: 'optional' }
    ],
    predictionTemplates: [
      'Derive and apply [TOPIC_1] equations',
      'Explain and calculate [TOPIC_2] scenarios',
      'Draw and interpret [TOPIC_3] diagrams',
      'Problem-solving with [TOPIC_4] laws',
      'Experimental analysis of [TOPIC_5]'
    ],
    studyFocus: ['Newton\'s laws', 'Energy conservation', 'Electromagnetic fields', 'Circuit analysis', 'Wave behaviour']
  },
  chemistry: {
    name: 'Chemistry',
    keywords: ['reaction', 'molecule', 'atom', 'element', 'bond', 'organic', 'acid', 'base', 'chemical', 'solution', 'periodic', 'gas', 'concentration', 'equilibrium', 'compound', 'valence', 'stoichiometry', 'titration', 'enthalpy', 'entropy', 'catalyst', 'redox', 'oxidation', 'molar'],
    candidateTopics: [
      { name: 'Organic Chemistry', keywords: ['organic', 'carbon', 'alkane', 'alkene', 'functional group', 'isomer', 'ester', 'alcohol'] },
      { name: 'Stoichiometry & Mole Concept', keywords: ['stoichiometry', 'mole', 'molar', 'mass', 'concentration', 'yield'] },
      { name: 'Chemical Equilibrium', keywords: ['equilibrium', 'le chatelier', 'constant', 'Kc', 'Kp', 'partial pressure'] },
      { name: 'Acids, Bases & pH', keywords: ['acid', 'base', 'pH', 'titration', 'buffer', 'neutralization'] },
      { name: 'Thermodynamics & Kinetics', keywords: ['enthalpy', 'entropy', 'gibbs', 'activation energy', 'rate law', 'catalyst'] },
      { name: 'Atomic Structure & Bonding', keywords: ['atom', 'orbital', 'covalent', 'ionic', 'bond', 'periodic table', 'valence'] },
      { name: 'Redox & Electrochemistry', keywords: ['redox', 'oxidation', 'reduction', 'electrode', 'cell potential', 'electrolysis'] }
    ],
    relatedFields: ['Biology', 'Physics', 'Medicine', 'Environmental Science', 'Mathematics'],
    keyTheoryTemplates: [
      { name: 'Le Chatelier\'s Principle', description: 'If a system at equilibrium is disturbed, it shifts to oppose the disturbance.' },
      { name: 'Aufbau Principle', description: 'Electrons fill orbitals of lowest energy first.' },
      { name: 'Arrhenius Theory of Acids & Bases', description: 'Acids produce H⁺ ions; bases produce OH⁻ ions in aqueous solution.' },
      { name: 'Hess\'s Law', description: 'Total enthalpy change is independent of the reaction pathway taken.' }
    ],
    recommendationTemplates: [
      { text: 'Practice drawing mechanisms and structures for [TOPIC_1].', importance: 'critical' },
      { text: 'Work through mole calculations and balancing for [TOPIC_2].', importance: 'critical' },
      { text: 'Understand equilibrium shifts and calculations in [TOPIC_3].', importance: 'important' },
      { text: 'Memorize trends and rules for [TOPIC_4].', importance: 'important' },
      { text: 'Review experimental procedures related to [TOPIC_5].', importance: 'optional' }
    ],
    predictionTemplates: [
      'Reaction mechanism for [TOPIC_1]',
      'Mole calculation problem in [TOPIC_2]',
      'Equilibrium shift analysis of [TOPIC_3]',
      'Spectroscopy/bonding question on [TOPIC_4]',
      'Electrochemical cell involving [TOPIC_5]'
    ],
    studyFocus: ['Organic mechanisms', 'Mole calculations', 'Equilibrium constants', 'Periodic trends', 'Redox reactions']
  },
  biology: {
    name: 'Biology',
    keywords: ['cell', 'gene', 'protein', 'evolution', 'DNA', 'organism', 'ecosystem', 'photosynthesis', 'respiration', 'virus', 'bacteria', 'plant', 'animal', 'anatomy', 'chromosome', 'enzyme', 'ecology', 'mitosis', 'meiosis', 'mutation', 'selection', 'transcription', 'translation'],
    candidateTopics: [
      { name: 'Cellular Biology', keywords: ['cell', 'membrane', 'mitochondrion', 'organelle', 'mitosis', 'meiosis', 'nucleus'] },
      { name: 'Genetics & DNA', keywords: ['gene', 'DNA', 'rna', 'chromosome', 'genotype', 'phenotype', 'mutation', 'allele'] },
      { name: 'Ecology & Ecosystems', keywords: ['ecosystem', 'ecology', 'biodiversity', 'food web', 'population', 'niche', 'habitat'] },
      { name: 'Physiology & Anatomy', keywords: ['organ', 'system', 'circulatory', 'nervous', 'digestive', 'respiratory', 'hormone'] },
      { name: 'Evolution & Selection', keywords: ['evolution', 'natural selection', 'speciation', 'adaptation', 'ancestor', 'darwin'] },
      { name: 'Enzymes & Metabolism', keywords: ['enzyme', 'substrate', 'active site', 'photosynthesis', 'respiration', 'atp', 'metabolism'] },
      { name: 'Microbiology & Immunology', keywords: ['virus', 'bacteria', 'pathogen', 'antibody', 'immune', 'infection', 'vaccine'] }
    ],
    relatedFields: ['Chemistry', 'Medicine', 'Environmental Science', 'Psychology', 'Genetics'],
    keyTheoryTemplates: [
      { name: 'Cell Theory', description: 'All living things are made of cells; the cell is the basic unit of life.' },
      { name: 'Darwin\'s Theory of Natural Selection', description: 'Organisms with favourable traits are more likely to survive and reproduce.' },
      { name: 'Central Dogma of Molecular Biology', description: 'DNA → RNA → Protein: the flow of genetic information.' },
      { name: 'Enzyme-Substrate Specificity', description: 'Enzymes are specific to their substrates due to complementary active site shapes.' }
    ],
    recommendationTemplates: [
      { text: 'Label and explain all diagrams for [TOPIC_1].', importance: 'critical' },
      { text: 'Master the pathways and sequences in [TOPIC_2].', importance: 'critical' },
      { text: 'Practice interpreting data tables and graphs for [TOPIC_3].', importance: 'important' },
      { text: 'Memorize key definitions and structures for [TOPIC_4].', importance: 'important' },
      { text: 'Review case studies and experimental evidence for [TOPIC_5].', importance: 'optional' }
    ],
    predictionTemplates: [
      'Label and explain the diagram of [TOPIC_1]',
      'Describe the process of [TOPIC_2] step by step',
      'Analyse the data on [TOPIC_3]',
      'Explain the role of [TOPIC_4] in living organisms',
      'Evaluate the evidence for [TOPIC_5]'
    ],
    studyFocus: ['Cell division', 'Genetic inheritance', 'Photosynthesis & respiration', 'Ecological relationships', 'Immune response']
  },
  cs: {
    name: 'Computer Science & IT',
    keywords: ['algorithm', 'data structure', 'complexity', 'array', 'list', 'function', 'class', 'object', 'recursion', 'memory', 'pointer', 'network', 'compiler', 'database', 'string', 'loop', 'variable', 'binary', 'tree', 'graph', 'sorting', 'programming', 'code', 'stack', 'queue', 'information', 'technology', 'system', 'systems', 'software', 'hardware', 'internet', 'security', 'digital', 'data', 'cloud', 'computer', 'computing', 'server', 'client', 'web', 'application', 'tech', 'cybersecurity', 'developer', 'it', 'ict', 'techolnofy', 'business information', 'mis', 'erp'],
    candidateTopics: [
      { name: 'Information Systems & Infrastructure', keywords: ['system', 'systems', 'infrastructure', 'hardware', 'software', 'enterprise', 'erp', 'crm', 'information', 'mis'] },
      { name: 'Database Systems & Data Models', keywords: ['database', 'sql', 'query', 'table', 'primary key', 'foreign key', 'normalization', 'data', 'entity'] },
      { name: 'Computer Networks & Internet', keywords: ['network', 'protocol', 'ip', 'tcp', 'http', 'packet', 'router', 'client', 'server', 'internet', 'topology'] },
      { name: 'Cloud Computing & Storage', keywords: ['cloud', 'storage', 'server', 'hosting', 'virtualization', 'aws', 'azure', 'saas', 'paas'] },
      { name: 'Cybersecurity & Information Protection', keywords: ['security', 'cybersecurity', 'firewall', 'encryption', 'cryptography', 'threat', 'hack', 'attack', 'password'] },
      { name: 'Algorithms & Computational Logic', keywords: ['algorithm', 'sorting', 'searching', 'complexity', 'big o', 'recursion', 'binary search', 'logic', 'flowchart'] },
      { name: 'Software Development & Coding', keywords: ['code', 'programming', 'software', 'developer', 'testing', 'git', 'refactoring', 'agile', 'scrum'] }
    ],
    relatedFields: ['Business Studies', 'Mathematics', 'Management', 'Engineering', 'E-Commerce'],
    keyTheoryTemplates: [
      { name: 'OSI Model (7 Layers)', description: 'A conceptual framework for network communication: Physical, Data Link, Network, Transport, Session, Presentation, Application.' },
      { name: 'Relational Database Model', description: 'Data stored in tables with relationships defined by primary and foreign keys.' },
      { name: 'Agile Development Methodology', description: 'Iterative software development with frequent releases and continuous feedback.' },
      { name: 'CIA Triad (Cybersecurity)', description: 'Confidentiality, Integrity and Availability — the three pillars of information security.' }
    ],
    recommendationTemplates: [
      { text: 'Understand [TOPIC_1] architectures and be ready to draw system diagrams.', importance: 'critical' },
      { text: 'Practice writing and optimizing SQL queries for [TOPIC_2] scenarios.', importance: 'critical' },
      { text: 'Know all network layers, protocols and topologies for [TOPIC_3].', importance: 'important' },
      { text: 'Review cloud service models (IaaS, PaaS, SaaS) for [TOPIC_4].', importance: 'important' },
      { text: 'Understand security threats and countermeasures for [TOPIC_5].', importance: 'optional' }
    ],
    predictionTemplates: [
      'Design and explain an [TOPIC_1] for a given organisation',
      'Write SQL queries and normalise a [TOPIC_2] schema',
      'Explain [TOPIC_3] protocols with a diagram',
      'Compare cloud service models for [TOPIC_4]',
      'Evaluate security measures for [TOPIC_5]'
    ],
    studyFocus: ['Information systems design', 'Database normalisation', 'Network protocols', 'Cloud computing', 'Cybersecurity threats']
  },
  history: {
    name: 'History & Social Studies',
    keywords: ['war', 'empire', 'century', 'revolution', 'treaty', 'political', 'society', 'government', 'constitution', 'civil', 'king', 'president', 'colony', 'ancient', 'historical', 'dynasty', 'feudal', 'parliament', 'sovereignty', 'independence'],
    candidateTopics: [
      { name: 'World War History', keywords: ['war', 'battle', 'treaty', 'alliance', 'axis', 'allies', 'conflict'] },
      { name: 'Ancient Civilizations', keywords: ['ancient', 'roman', 'greek', 'egyptian', 'dynasty', 'empire', 'civilization'] },
      { name: 'Political Ideologies & Systems', keywords: ['political', 'democracy', 'socialism', 'communism', 'fascism', 'monarchy', 'government'] },
      { name: 'Revolutions & Social Change', keywords: ['revolution', 'rebellion', 'protest', 'civil rights', 'reform'] },
      { name: 'Colonization & Independence', keywords: ['colony', 'colonization', 'independence', 'empire', 'trade route'] },
      { name: 'Constitutional & Legal History', keywords: ['constitution', 'law', 'amendment', 'court', 'parliament', 'act'] }
    ],
    relatedFields: ['Political Science', 'Sociology', 'Geography', 'Economics', 'Law'],
    keyTheoryTemplates: [
      { name: 'Marxist Theory of History', description: 'History is driven by class struggle and economic forces.' },
      { name: 'Social Contract Theory', description: 'Governments derive authority from the consent of the governed (Locke, Rousseau, Hobbes).' },
      { name: 'Imperialism Theory', description: 'Powerful nations expand control over weaker regions for economic and political gain.' },
      { name: 'Nationalism', description: 'The ideology that a group sharing culture/language should have its own sovereign state.' }
    ],
    recommendationTemplates: [
      { text: 'Learn causes, events and consequences for [TOPIC_1].', importance: 'critical' },
      { text: 'Practice essay responses analysing [TOPIC_2] from multiple perspectives.', importance: 'critical' },
      { text: 'Revise source-based question techniques for [TOPIC_3].', importance: 'important' },
      { text: 'Understand the key figures and their motivations in [TOPIC_4].', importance: 'important' },
      { text: 'Consider long-term historical impact of [TOPIC_5].', importance: 'optional' }
    ],
    predictionTemplates: [
      'Explain the causes and effects of [TOPIC_1]',
      'Evaluate the significance of [TOPIC_2]',
      'Analyse the source relating to [TOPIC_3]',
      'Compare [TOPIC_4] in two different countries',
      'To what extent did [TOPIC_5] change society?'
    ],
    studyFocus: ['Cause and effect analysis', 'Source evaluation', 'Key political movements', 'Timeline of major events', 'Essay writing technique']
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
    relatedFields: ['History', 'Psychology', 'Philosophy', 'Sociology', 'Language Studies'],
    keyTheoryTemplates: [
      { name: 'Freytag\'s Pyramid', description: 'Narrative structure: exposition, rising action, climax, falling action, resolution.' },
      { name: 'Reader-Response Theory', description: 'Meaning is created through the interaction between text and reader.' },
      { name: 'New Criticism', description: 'Focus on close reading the text itself without reference to author biography or historical context.' },
      { name: 'Marxist Literary Criticism', description: 'Analyses literature through the lens of class struggle and economic power.' }
    ],
    recommendationTemplates: [
      { text: 'Practice embedding and analysing quotes for [TOPIC_1].', importance: 'critical' },
      { text: 'Write structured analytical essays on [TOPIC_2].', importance: 'critical' },
      { text: 'Read the texts multiple times and annotate [TOPIC_3].', importance: 'important' },
      { text: 'Memorize key literary terms related to [TOPIC_4].', importance: 'important' },
      { text: 'Practise comparative analysis across texts for [TOPIC_5].', importance: 'optional' }
    ],
    predictionTemplates: [
      'Analyse the use of [TOPIC_1] in the text',
      'How does the author present [TOPIC_2]?',
      'Compare [TOPIC_3] in two poems/texts',
      'Explore the theme of [TOPIC_4]',
      'Evaluate the structure and form of [TOPIC_5]'
    ],
    studyFocus: ['Quote analysis', 'Literary devices', 'Essay writing', 'Thematic exploration', 'Comparative study']
  },
  general: {
    name: 'General Studies',
    keywords: [],
    candidateTopics: [
      { name: 'Critical Thinking & Problem Solving', keywords: ['logic', 'problem', 'solve', 'critical', 'reasoning'] },
      { name: 'Research Methodologies', keywords: ['method', 'research', 'experiment', 'data', 'analysis', 'survey'] },
      { name: 'Data Interpretation', keywords: ['chart', 'graph', 'table', 'results', 'data', 'trends'] },
      { name: 'General Theory Applications', keywords: ['theory', 'model', 'concept', 'framework'] },
      { name: 'Ethics & Case Studies', keywords: ['ethics', 'ethical', 'case study', 'implications', 'scenario'] }
    ],
    relatedFields: ['Philosophy', 'Sociology', 'Psychology', 'Politics', 'Science'],
    keyTheoryTemplates: [
      { name: 'Scientific Method', description: 'Observation, hypothesis, experimentation, data analysis and conclusion.' },
      { name: 'Critical Thinking Framework', description: 'Evaluate evidence, identify assumptions, consider alternatives, draw conclusions.' },
      { name: 'Ethical Frameworks', description: 'Utilitarian, deontological, and virtue ethics approaches to moral decision-making.' },
      { name: 'Systems Thinking', description: 'Understanding how a system\'s components interrelate and work together over time.' }
    ],
    recommendationTemplates: [
      { text: 'Apply logical frameworks when answering [TOPIC_1] questions.', importance: 'critical' },
      { text: 'Practice structured responses with evidence for [TOPIC_2].', importance: 'critical' },
      { text: 'Develop skills in reading and interpreting data for [TOPIC_3].', importance: 'important' },
      { text: 'Review core concepts and definitions for [TOPIC_4].', importance: 'important' },
      { text: 'Practice case-based reasoning for [TOPIC_5].', importance: 'optional' }
    ],
    predictionTemplates: [
      'Solve a problem using [TOPIC_1]',
      'Interpret and analyse data on [TOPIC_2]',
      'Evaluate a case study involving [TOPIC_3]',
      'Apply a theoretical framework to [TOPIC_4]',
      'Discuss the ethical implications of [TOPIC_5]'
    ],
    studyFocus: ['Logical reasoning', 'Data interpretation', 'Essay technique', 'Research skills', 'Ethical reasoning']
  }
};

// ─── Classify subject ───────────────────────────────────────────────────────

function classifySubject(text: string, fileName: string): SubjectCategory {
  const cleanText = (text + ' ' + fileName).toLowerCase();
  const lName = fileName.toLowerCase();

  let bestSubject: SubjectCategory = 'general';
  let maxMatches = -1;

  for (const [subjKey, def] of Object.entries(SUBJECT_DEFINITIONS)) {
    if (subjKey === 'general') continue;
    let matchCount = 0;

    for (const keyword of def.keywords) {
      const regex = new RegExp('\\b' + keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'g');
      const matches = cleanText.match(regex);
      if (matches) matchCount += matches.length;
    }

    // Filename boost
    const boosts: Record<string, string[]> = {
      economics: ['econ', 'micro', 'macro', 'gdp'],
      management: ['manag', 'hrm', 'fayol', 'leader'],
      accounting: ['account', 'ledger', 'bookkeep', 'financial'],
      business: ['business', 'biz', 'entrepreneur', 'marketing'],
      law: ['law', 'legal', 'tort', 'contract'],
      math: ['math', 'calc', 'algebra', 'geometry', 'stat'],
      physics: ['phys'],
      chemistry: ['chem'],
      biology: ['bio'],
      cs: ['tech', 'info', 'ict', 'system', 'network', 'comp', 'prog', 'it', 'code', 'java', 'python', 'software'],
      history: ['hist', 'social', 'war'],
      literature: ['lit', 'english', 'lang', 'poem', 'essay']
    };

    const boostWords = boosts[subjKey] || [];
    if (boostWords.some(w => lName.includes(w))) {
      matchCount += 50;
    }

    if (matchCount > maxMatches && matchCount > 0) {
      maxMatches = matchCount;
      bestSubject = subjKey as SubjectCategory;
    }
  }

  return bestSubject;
}

// ─── Estimate question count ───────────────────────────────────────────────

function estimateQuestionCount(text: string): number {
  const numbered = text.match(/\b(?:question|q\.?)\s*\d+\b/gi);
  if (numbered && numbered.length > 3) {
    const nums = numbered.map(m => { const n = m.match(/\d+/); return n ? parseInt(n[0]) : 0; });
    const max = Math.max(...nums);
    if (max > 3 && max < 150) return max;
    return Math.min(80, numbered.length);
  }
  const listItems = text.match(/^\s*\d+[\.\)]\s+[A-Z]/gm);
  if (listItems && listItems.length > 3) return Math.min(100, listItems.length);
  const words = text.split(/\s+/).length;
  return Math.min(60, Math.max(10, Math.floor(words / 150)));
}

// ─── Main local heuristics analyzer ───────────────────────────────────────

function analyzePaperHeuristically(text: string, fileName: string): AnalysisResult {
  const cleanText = (text + ' ' + fileName).toLowerCase();
  const subjectKey = classifySubject(text, fileName);
  const def = SUBJECT_DEFINITIONS[subjectKey];

  // Score candidate topics
  const scoredTopics = def.candidateTopics.map(topic => {
    let score = 0;
    for (const keyword of topic.keywords) {
      const regex = new RegExp('\\b' + keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'g');
      const m = cleanText.match(regex);
      if (m) score += m.length;
    }
    return { name: topic.name, score };
  });

  scoredTopics.sort((a, b) => b.score - a.score);
  const selectedTopics = scoredTopics.slice(0, 5);

  const questionCount = Math.max(10, Math.min(100, estimateQuestionCount(text)));

  // Build topics with counts & priority
  const topicNames = selectedTopics.map(t => t.name);
  while (topicNames.length < 5) topicNames.push('Core Concepts & Theory');

  const portions = [0.36, 0.24, 0.18, 0.13, 0.09];
  let remaining = questionCount;
  const topics: Topic[] = selectedTopics.map((st, i) => {
    let count = Math.max(1, Math.floor(questionCount * portions[i]));
    count = Math.min(count, remaining);
    remaining = Math.max(0, remaining - count);
    const priority: 'high' | 'medium' | 'low' = i <= 1 ? 'high' : i <= 3 ? 'medium' : 'low';
    return { name: st.name, count, priority };
  });
  if (remaining > 0 && topics.length > 0) topics[0].count += remaining;
  topics.sort((a, b) => b.count - a.count);

  // Recommendations
  const recommendations: Recommendation[] = def.recommendationTemplates.map(t => ({
    text: t.text
      .replace('[TOPIC_1]', topicNames[0])
      .replace('[TOPIC_2]', topicNames[1])
      .replace('[TOPIC_3]', topicNames[2])
      .replace('[TOPIC_4]', topicNames[3])
      .replace('[TOPIC_5]', topicNames[4]),
    importance: t.importance
  }));

  // Predicted areas
  const predicted_areas: PredictedArea[] = def.predictionTemplates.map((tmpl, i) => ({
    area: tmpl
      .replace('[TOPIC_1]', topicNames[0])
      .replace('[TOPIC_2]', topicNames[1])
      .replace('[TOPIC_3]', topicNames[2])
      .replace('[TOPIC_4]', topicNames[3])
      .replace('[TOPIC_5]', topicNames[4]),
    confidence: Math.max(50, Math.min(97, 95 - i * 8 - Math.floor(Math.random() * 4)))
  }));

  // Detected subjects (primary + related)
  const detected_subjects = [def.name, ...def.relatedFields.slice(0, 2)];

  // Topic mapping (cross-discipline)
  const topic_mapping: TopicMapping[] = topicNames.slice(0, 5).map((tName, i) => ({
    question: `Questions relating to ${tName}`,
    core_topic: tName,
    related_fields: def.relatedFields,
    explanation: `${tName} is a key area in ${def.name}. ${def.keyTheoryTemplates[i % def.keyTheoryTemplates.length]?.description ?? ''}`,
    exam_notes: def.predictionTemplates[i % def.predictionTemplates.length]
      ?.replace('[TOPIC_1]', topicNames[0])
      ?.replace('[TOPIC_2]', topicNames[1])
      ?.replace('[TOPIC_3]', topicNames[2])
      ?.replace('[TOPIC_4]', topicNames[3])
      ?.replace('[TOPIC_5]', topicNames[4]) ?? ''
  }));

  // Key theories
  const key_theories: KeyTheory[] = def.keyTheoryTemplates.map(t => ({
    name: t.name,
    subject: def.name,
    description: t.description
  }));

  // High priority topics
  const high_priority_topics = def.studyFocus;

  // Predicted questions
  const predicted_questions = def.predictionTemplates.map(tmpl =>
    tmpl
      .replace('[TOPIC_1]', topicNames[0])
      .replace('[TOPIC_2]', topicNames[1])
      .replace('[TOPIC_3]', topicNames[2])
      .replace('[TOPIC_4]', topicNames[3])
      .replace('[TOPIC_5]', topicNames[4])
  );

  // Study plan
  const study_plan: StudyPlanItem[] = def.studyFocus.map((focus, i) => ({
    day: `Day ${i + 1}`,
    focus,
    tasks: [
      `Review all notes and definitions on ${focus}`,
      `Practice 5 past paper questions on ${focus}`,
      `Create a summary sheet or mind map for ${focus}`
    ]
  }));

  return {
    topics,
    recommendations,
    predicted_areas,
    question_count: questionCount,
    raw_text: text,
    detected_subjects,
    topic_mapping,
    key_theories,
    high_priority_topics,
    predicted_questions,
    study_plan
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
      fullText += textContent.items.map((item: any) => item.str).join(' ') + '\n';
    }
    return fullText;
  } catch (err) {
    console.error('PDF extraction error:', err);
    return '';
  }
}

// ─── AI Analysis ─────────────────────────────────────────────────────────
export async function analyzeExamPaper(text: string, fileName: string): Promise<AnalysisResult> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  if (!apiKey || apiKey === 'your_openai_api_key') {
    await new Promise(r => setTimeout(r, 2200));
    return analyzePaperHeuristically(text, fileName);
  }

  const systemPrompt = `You are an advanced academic exam analysis system.

Analyze the provided exam paper and return ONLY a valid JSON object with this exact structure:
{
  "detected_subjects": ["Primary Subject", "Related Subject 1"],
  "topics": [{"name": "Topic Name", "count": 12, "priority": "high"}],
  "recommendations": [{"text": "Study recommendation text", "importance": "critical"}],
  "predicted_areas": [{"area": "Predicted exam area", "confidence": 88}],
  "question_count": 30,
  "topic_mapping": [{"question": "Question text", "core_topic": "Core Topic", "related_fields": ["Field1", "Field2"], "explanation": "Explanation", "exam_notes": "Exam tips"}],
  "key_theories": [{"name": "Theory Name", "subject": "Subject", "description": "Description"}],
  "high_priority_topics": ["Topic 1", "Topic 2", "Topic 3"],
  "predicted_questions": ["Likely exam question 1", "Likely exam question 2"],
  "study_plan": [{"day": "Day 1", "focus": "Topic Focus", "tasks": ["Task 1", "Task 2"]}]
}

Rules:
- Auto-detect the subject from content — do NOT assume any fixed subject
- Cross-map topics to related academic disciplines
- Keep all explanations student-friendly
- Sort topics by count descending, priority: high/medium/low
- importance values: critical/important/optional
- Return only valid JSON, no extra text`;

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
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Exam paper filename: "${fileName}"\n\nPaper content:\n${text.substring(0, 7000)}` }
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) throw new Error(`OpenAI API error: ${response.status}`);
    const data = await response.json();
    const parsed = JSON.parse(data.choices[0].message.content);
    return { ...parsed, raw_text: text };
  } catch (err) {
    console.warn('OpenAI failed, falling back to local heuristics:', err);
    return analyzePaperHeuristically(text, fileName);
  }
}

// ─── Image Text Extraction ────────────────────────────────────────────────
export async function extractTextFromImage(file: File): Promise<string> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey || apiKey === 'your_openai_api_key') {
    return `Exam paper: ${file.name}. Topics include information systems, database management, network protocols, software development, and cybersecurity for business applications.`;
  }
  try {
    const base64 = await fileToBase64(file);
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: [
          { type: 'text', text: 'Extract all text from this exam paper image verbatim including all questions, instructions and content.' },
          { type: 'image_url', image_url: { url: `data:${file.type};base64,${base64}` } }
        ]}]
      }),
    });
    if (!response.ok) throw new Error(`OpenAI image API error: ${response.status}`);
    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  } catch (err) {
    console.warn('Image extraction failed:', err);
    return `Exam paper: ${file.name}`;
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
