import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Analysis } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { analyzeExamPaper, extractTextFromPDF, extractTextFromImage } from '../lib/aiEngine';

export function useAnalysis() {
  const { user } = useAuth();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalysis = useCallback(async (uploadId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('analyses')
      .select('*')
      .eq('upload_id', uploadId)
      .single();
    if (error) setError(error.message);
    else setAnalysis(data as Analysis);
    setLoading(false);
  }, []);

  const fetchAllAnalyses = useCallback(async (): Promise<Analysis[]> => {
    if (!user) return [];
    const { data } = await supabase
      .from('analyses')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    return (data as Analysis[]) || [];
  }, [user]);

  const runAnalysis = useCallback(async (file: File, uploadId: string) => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      // Extract text
      let text = '';
      if (file.type === 'application/pdf') {
        text = await extractTextFromPDF(file);
      } else {
        text = await extractTextFromImage(file);
      }

      // AI analysis
      const result = await analyzeExamPaper(text, file.name);

      // Save to Supabase
      const { data, error: dbError } = await supabase.from('analyses').insert({
        upload_id: uploadId,
        user_id: user.id,
        topics: result.topics,
        recommendations: result.recommendations,
        predicted_areas: result.predicted_areas,
        raw_text: result.raw_text,
        question_count: result.question_count,
      }).select().single();

      if (dbError) throw dbError;

      // Update upload status to done
      await supabase.from('uploads').update({ status: 'done' }).eq('id', uploadId);

      setAnalysis(data as Analysis);
      return data as Analysis;
    } catch (err: any) {
      setError(err.message);
      await supabase.from('uploads').update({ status: 'error' }).eq('id', uploadId);
    } finally {
      setLoading(false);
    }
  }, [user]);

  return { analysis, loading, error, fetchAnalysis, fetchAllAnalyses, runAnalysis };
}
