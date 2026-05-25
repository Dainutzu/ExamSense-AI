import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Upload } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function useUploads() {
  const { user } = useAuth();
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUploads = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('uploads')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) setError(error.message);
    else setUploads(data as Upload[]);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchUploads(); }, [fetchUploads]);

  async function deleteUpload(id: string) {
    await supabase.from('uploads').delete().eq('id', id);
    setUploads(prev => prev.filter(u => u.id !== id));
  }

  return { uploads, loading, error, refetch: fetchUploads, deleteUpload };
}
