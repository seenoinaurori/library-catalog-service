import { Link, Route, Routes } from 'react-router-dom';
import BookDetailPage from './pages/BookDetailPage.jsx';
import CatalogPage from './pages/CatalogPage.jsx';

function NotFoundPage() {
  return (
    <main className="message-page">
      <span className="eyebrow">404 · PAGE NOT FOUND</span>
      <h1>This page is off the shelf.</h1>
      <Link className="button button-dark" to="/">Return to the catalog</Link>
    </main>
  );
}

export default function App() {
  return (
    <div className="app-shell">
      <header className="site-header">
        <Link className="brand" to="/" aria-label="Stacks home">
          <span className="brand-mark" aria-hidden="true">S</span>
          <span>stacks<span className="brand-period">.</span></span>
        </Link>
        <span className="header-note">A little more room for a good story.</span>
        <Link className="header-link" to="/">Browse books <span aria-hidden="true">↗</span></Link>
      </header>
      <Routes>
        <Route path="/" element={<CatalogPage />} />
        <Route path="/books/:id" element={<BookDetailPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <footer className="site-footer">
        <Link className="brand footer-brand" to="/">
          <span className="brand-mark" aria-hidden="true">S</span>
          <span>stacks<span className="brand-period">.</span></span>
        </Link>
        <span>Find a story worth staying up for.</span>
        <span>Made for curious readers · Est. 2025</span>
      </footer>
    </div>
  );
}
