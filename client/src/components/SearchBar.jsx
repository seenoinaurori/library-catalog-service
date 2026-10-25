import { useEffect, useRef, useState } from 'react';

export default function SearchBar({ value, onSearch }) {
  const [input, setInput] = useState(value);
  const timeoutRef = useRef(null);

  useEffect(() => {
    setInput(value);
  }, [value]);

  useEffect(() => () => window.clearTimeout(timeoutRef.current), []);

  function handleChange(event) {
    const nextValue = event.target.value;
    setInput(nextValue);
    window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => onSearch(nextValue.trim()), 400);
  }

  return (
    <label className="search-control">
      <span className="sr-only">Search by title or author</span>
      <span className="search-icon" aria-hidden="true">⌕</span>
      <input
        type="search"
        value={input}
        onChange={handleChange}
        placeholder="Search titles, authors…"
        aria-label="Search titles or authors"
      />
      <kbd>↵</kbd>
    </label>
  );
}
