import type { Topic, Recommendation, PredictedArea } from './supabase';

export interface AnalysisResult {
  topics: Topic[];
  recommendations: Recommendation[];
  predicted_areas: PredictedArea[];
  question_count: number;
  raw_text: string;
}

// ─── Mock Analysis Data ────────────────────────────────────────────────────
const MOCK_RESULTS: AnalysisResult = {
  question_count: 42,
  raw_text: 'Mock extracted text from exam paper...',
  topics: [
    { name: 'Calculus & Differentiation', count: 12, priority: 'high' },
    { name: 'Probability & Statistics', count: 9, priority: 'high' },
    { name: 'Linear Algebra', count: 8, priority: 'high' },
    { name: 'Integration Techniques', count: 7, priority: 'medium' },
    { name: 'Vector Mathematics', count: 6, priority: 'medium' },
    { name: 'Complex Numbers', count: 5, priority: 'medium' },
    { name: 'Differential Equations', count: 4, priority: 'medium' },
    { name: 'Trigonometry', count: 3, priority: 'low' },
    { name: 'Number Theory', count: 2, priority: 'low' },
    { name: 'Set Theory', count: 1, priority: 'low' },
  ],
  recommendations: [
    { text: 'Focus heavily on Calculus & Differentiation — it appears in 12 out of 42 questions across papers.', importance: 'critical' },
    { text: 'Master Probability & Statistics fundamentals, especially Bayes theorem and distributions.', importance: 'critical' },
    { text: 'Practice Linear Algebra proofs and matrix operations under timed conditions.', importance: 'critical' },
    { text: 'Review Integration by Parts and Substitution — frequently tested techniques.', importance: 'important' },
    { text: 'Revise Vector cross product and dot product applications in 3D space.', importance: 'important' },
    { text: 'Brush up on Complex Number operations and Argand diagrams.', importance: 'optional' },
  ],
  predicted_areas: [
    { area: 'Differential Calculus Applications', confidence: 94 },
    { area: 'Probability Distributions', confidence: 88 },
    { area: 'Matrix Transformations', confidence: 81 },
    { area: 'Integral Calculus', confidence: 76 },
    { area: 'Vector Analysis', confidence: 70 },
  ],
};

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
    // Return mock data with slight randomisation for demo
    await new Promise(r => setTimeout(r, 2500)); // Simulate AI processing
    return {
      ...MOCK_RESULTS,
      topics: MOCK_RESULTS.topics.map(t => ({
        ...t,
        count: Math.max(1, t.count + Math.floor(Math.random() * 3) - 1),
      })),
    };
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

    const data = await response.json();
    const parsed = JSON.parse(data.choices[0].message.content);
    return { ...parsed, raw_text: text };
  } catch (err) {
    console.error('OpenAI analysis error:', err);
    return { ...MOCK_RESULTS, raw_text: text };
  }
}

// ─── Image Text Extraction ────────────────────────────────────────────────
export async function extractTextFromImage(file: File): Promise<string> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey || apiKey === 'your_openai_api_key') {
    return 'Mock extracted text from image-based exam paper.';
  }

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
  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
  });
}
