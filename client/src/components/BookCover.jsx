import { useState } from 'react';

export default function BookCover({ src, title, className = '' }) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div className={`cover-fallback ${className}`} role="img" aria-label={`Cover unavailable for ${title}`}>
        <span aria-hidden="true">S</span>
        <small>STACKS<br />LIBRARY</small>
      </div>
    );
  }

  return (
    <img
      className={className}
      src={src}
      alt={`Cover of ${title}`}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}
