import { useCallback, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import BookCard from '../components/BookCard.jsx';
import GenreFilter from '../components/GenreFilter.jsx';
import SearchBar from '../components/SearchBar.jsx';
import useBooks from '../hooks/useBooks.js';

function CatalogMessage({ title, description, action }) {
  return (
    <div className="catalog-message" role="status">
      <span className="message-mark" aria-hidden="true">✳</span>
      <h2>{title}</h2>
      <p>{description}</p>
      {action}
    </div>
  );
}

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [attempt, setAttempt] = useState(0);
  const genre = searchParams.get('genre') || '';
  const search = searchParams.get('search') || '';
  const requestedPage = Number.parseInt(searchParams.get('page') || '1', 10);
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const { books, pagination, loading, error, empty } = useBooks({ genre, search, page, attempt });

  const updateParams = useCallback((updates) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      Object.entries(updates).forEach(([key, value]) => {
        if (value) next.set(key, value);
        else next.delete(key);
      });
      return next;
    });
  }, [setSearchParams]);

  const updateSearch = useCallback((value) => updateParams({ search: value, page: '' }), [updateParams]);
  const clearFilters = () => setSearchParams({});
  const resultCount = pagination?.total ?? books.length;

  return (
    <main>
      <section className="hero">
        <div className="hero-text">
          <span className="eyebrow"><span className="eyebrow-line" /> THE LIBRARY, REIMAGINED</span>
          <h1>Find your next<br /><em>favorite chapter.</em></h1>
          <p>Good stories have a way of finding us. Start with one that speaks to you.</p>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="sun-shape" />
          <div className="art-book art-book-back" />
          <div className="art-book art-book-mid" />
          <div className="art-book art-book-front"><span>READ<br />WIDELY</span></div>
          <span className="art-sparkle sparkle-one">✳</span>
          <span className="art-sparkle sparkle-two">✳</span>
          <span className="art-note">YOUR NEXT<br />GREAT READ</span>
        </div>
        <div className="hero-index"><span>01</span><i /> 04 GENRES · 16 STORIES</div>
      </section>

      <section className="catalog-section" aria-labelledby="catalog-heading">
        <div className="catalog-heading-row">
          <div>
            <span className="eyebrow">A COLLECTION TO GET LOST IN</span>
            <h2 id="catalog-heading">The book nook<span className="brand-period">.</span></h2>
          </div>
          <span className="result-count">{resultCount} {resultCount === 1 ? 'book' : 'books'} to explore</span>
        </div>

        <div className="catalog-toolbar">
          <SearchBar value={search} onSearch={updateSearch} />
          <div className="toolbar-divider" aria-hidden="true" />
          <GenreFilter
            value={genre}
            onChange={(value) => updateParams({ genre: value, page: '' })}
          />
        </div>

        {loading ? (
          <div className="catalog-message" role="status" aria-live="polite">
            <span className="loading-spinner" aria-hidden="true" />
            <h2>Turning a few pages…</h2>
            <p>Finding the right books for you.</p>
          </div>
        ) : error ? (
          <CatalogMessage
            title="We couldn't reach the shelves."
            description={error}
            action={<button className="button button-dark" onClick={() => setAttempt((count) => count + 1)}>Try again</button>}
          />
        ) : empty ? (
          <CatalogMessage
            title="No books found this time."
            description="Try another title, author, or genre to discover something new."
            action={<button className="button button-dark" onClick={clearFilters}>Clear filters</button>}
          />
        ) : (
          <>
            <div className="book-grid">
              {books.map((book) => <BookCard key={book._id} book={book} />)}
            </div>
            {pagination && pagination.totalPages > 1 && (
              <nav className="pagination" aria-label="Catalog pages">
                <button
                  className="page-button"
                  disabled={page <= 1}
                  onClick={() => updateParams({ page: String(page - 1) })}
                >
                  ← <span>Previous</span>
                </button>
                <span>Page <strong>{page}</strong> of {pagination.totalPages}</span>
                <button
                  className="page-button"
                  disabled={page >= pagination.totalPages}
                  onClick={() => updateParams({ page: String(page + 1) })}
                >
                  <span>Next</span> →
                </button>
              </nav>
            )}
          </>
        )}
      </section>
    </main>
  );
}
