import { Link } from 'react-router-dom';
import BookCover from './BookCover.jsx';

export default function BookCard({ book }) {
  const genre = typeof book.genre === 'object' ? book.genre?.name : '';

  return (
    <article className="book-card">
      <Link className="book-card-link" to={`/books/${book._id}`} aria-label={`View ${book.title} by ${book.author}`}>
        <div className="book-cover-wrap">
          <BookCover className="book-cover" src={book.coverImage} title={book.title} />
          <span className="cover-action" aria-hidden="true">↗</span>
        </div>
        <div className="book-card-copy">
          <div className="book-card-meta">
            <span>{genre || 'From the collection'}</span>
            <span className="availability-dot" aria-hidden="true" />
          </div>
          <h2>{book.title}</h2>
          <p>{book.author}</p>
        </div>
      </Link>
    </article>
  );
}
