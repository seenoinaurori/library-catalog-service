import { useEffect, useState } from 'react';
import { getJson } from '../api.js';

export default function GenreFilter({ value, onChange }) {
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');

    getJson('/genres', controller.signal)
      .then((payload) => {
        if (!Array.isArray(payload?.data)) {
          throw new Error('The catalog returned an unexpected genre list.');
        }
        setGenres(payload.data);
        setLoading(false);
      })
      .catch((requestError) => {
        if (requestError.name === 'AbortError') return;
        setError(requestError.message);
        setLoading(false);
      });

    return () => controller.abort();
  }, [attempt]);

  if (error) {
    return (
      <div className="genre-control genre-error">
        <span role="alert">Genres unavailable: {error}</span>
        <button type="button" className="text-button" onClick={() => setAttempt((count) => count + 1)}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <label className="genre-control">
      <span className="sr-only">Filter by genre</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={loading}
        aria-label="Filter by genre"
      >
        <option value="">{loading ? 'Loading genres…' : 'All genres'}</option>
        {genres.map((genre) => <option key={genre._id} value={genre._id}>{genre.name}</option>)}
      </select>
      <span className="select-arrow" aria-hidden="true">⌄</span>
    </label>
  );
}
