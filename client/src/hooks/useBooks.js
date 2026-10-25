import { useEffect, useState } from 'react';
import { getJson } from '../api.js';

export default function useBooks({ genre, search, page, attempt }) {
  const [result, setResult] = useState({
    books: [],
    pagination: null,
    loading: true,
    error: '',
  });

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({ page: String(page), limit: '8' });
    if (genre) params.set('genre', genre);
    if (search.trim()) params.set('search', search.trim());

    setResult((current) => ({ ...current, loading: true, error: '' }));

    getJson(`/books?${params}`, controller.signal)
      .then((payload) => {
        if (!Array.isArray(payload?.data)) {
          throw new Error('The catalog returned an unexpected response.');
        }
        setResult({
          books: payload.data,
          pagination: payload.pagination ?? null,
          loading: false,
          error: '',
        });
      })
      .catch((error) => {
        if (error.name === 'AbortError') return;
        setResult({ books: [], pagination: null, loading: false, error: error.message });
      });

    return () => controller.abort();
  }, [genre, search, page, attempt]);

  return { ...result, empty: !result.loading && !result.error && result.books.length === 0 };
}
