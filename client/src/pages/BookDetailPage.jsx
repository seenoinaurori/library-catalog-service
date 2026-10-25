import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getJson } from '../api.js';
import BookCover from '../components/BookCover.jsx';

export default function BookDetailPage() {
  const { id } = useParams();
  const [state, setState] = useState({ book: null, loading: true, error: '' });

  useEffect(() => {
    const controller = new AbortController();
    setState({ book: null, loading: true, error: '' });

    getJson(`/books/${encodeURIComponent(id)}`, controller.signal)
      .then((payload) => {
        if (!payload?.data || typeof payload.data !== 'object') {
          throw new Error('The catalog returned an unexpected book record.');
        }
        setState({ book: payload.data, loading: false, error: '' });
      })
      .catch((error) => {
        if (error.name === 'AbortError') return;
        setState({ book: null, loading: false, error: error.message });
      });

    return () => controller.abort();
  }, [id]);

  if (state.loading) {
    return (
      <main className="detail-state" role="status">
        <span className="loading-spinner" aria-hidden="true" />
        <h1>Finding this book…</h1>
        <p>Just a moment while we check the shelves.</p>
      </main>
    );
  }

  if (state.error) {
    return (
      <main className="detail-state" role="alert">
        <span className="eyebrow">BOOK UNAVAILABLE</span>
        <h1>We couldn't find that book.</h1>
        <p>{state.error}</p>
        <Link className="button button-dark" to="/">Back to the catalog</Link>
      </main>
    );
  }

  const { book } = state;
  const genreName = typeof book.genre === 'object' ? book.genre?.name : 'Uncategorized';
  const available = Number(book.availableCopies);

  return (
    <main className="detail-page">
      <div className="detail-breadcrumb">
        <Link to="/">The book nook</Link><span>/</span><span>{book.title}</span>
      </div>
      <section className="detail-layout">
        <div className="detail-cover-stage">
          <span className="detail-cover-label">ON THE SHELF · {genreName}</span>
          <BookCover className="detail-cover" src={book.coverImage} title={book.title} />
          <span className="detail-cover-index">STACKS COLLECTION&nbsp; / &nbsp;{String(book.isbn || '').slice(-4)}</span>
        </div>
        <div className="detail-copy">
          <span className="eyebrow"><span className="eyebrow-line" /> {genreName}</span>
          <h1>{book.title}</h1>
          <p className="detail-author">by <span>{book.author}</span></p>
          <div className="detail-rule" />
          <h2>About this book</h2>
          <p className="detail-description">{book.description}</p>
          <div className="book-facts">
            <div><span>ISBN</span><strong>{book.isbn}</strong></div>
            <div><span>IN THE COLLECTION</span><strong>{book.totalCopies} {Number(book.totalCopies) === 1 ? 'copy' : 'copies'}</strong></div>
            <div><span>AVAILABILITY</span><strong className={available > 0 ? 'available' : 'unavailable'}>{available > 0 ? `${available} available` : 'Currently checked out'}</strong></div>
          </div>
          <Link className="button button-dark detail-back" to="/">← <span>Back to all books</span></Link>
        </div>
      </section>
    </main>
  );
}
