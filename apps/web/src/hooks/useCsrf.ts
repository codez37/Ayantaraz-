import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';

export const useCsrf = () => {
  const [csrfToken, setCsrfToken] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const fetchToken = useCallback(async () => {
    try {
      const data = await api.get<{ token: string }>('/csrf/token');
      setCsrfToken(data.token);
    } catch (err) {
      console.error('CSRF token fetch error:', err);
      setCsrfToken('');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchToken();
  }, [fetchToken]);

  return { csrfToken, loading };
};
