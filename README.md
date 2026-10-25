# Library Catalog Service

Mongoose models and an idempotent seed script for a small library catalog. The seed script creates four genres and sixteen books.

## Setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env`, set `MONGODB_URI`, and replace `JWT_SECRET` with a random secret of at least 32 characters. Keep real credentials out of source control.
3. Run `npm run seed`.

Each seed run clears the existing `Book` and `Genre` documents before inserting the catalog again. It creates or refreshes one known librarian account without replacing other users. Book ISBNs are generated as valid ISBN-13 values, and each book stores a reference to its inserted genre.

## Schema Design

### Book

- `title` and `author` are required strings embedded directly in each book. They describe the work itself and are read with the book; putting either in a separate collection would add lookups without providing useful independent identity in this catalog.
- `isbn` is a required, unique string. ISBNs are identifiers rather than numeric quantities, so keeping the value as text preserves its format. The schema validates the ISBN-13 checksum, while the unique index prevents two catalog records from claiming the same ISBN.
- `description` and `coverImage` are required strings stored on the book because they are book-specific display data. Keeping them together makes a catalog result self-contained; the trade-off is that changing a shared image or description would require updating each affected book.
- `totalCopies` and `availableCopies` are required, non-negative whole numbers embedded in the book. They are normally displayed with the title and author, so separate inventory documents would add read complexity. Validation rejects available counts above the owned total; future checkout workflows would still need atomic updates to avoid concurrent requests overselling copies.
- `genre` is a required ObjectId reference to `Genre`, not an embedded name or genre object. Many books share a genre, and the separate document gives its display name and URL slug one consistent home. This avoids duplicated genre text and makes genre-level edits straightforward, at the cost of a populate/join when a book response needs genre details.

### Genre

- `name` and `slug` are required unique strings. The name is the display label; the lowercase slug supports stable, URL-friendly routes. Keeping both in one genre document means books can refer to the genre by ObjectId without copying either value into every book.

## API

Set `MONGODB_URI` and `JWT_SECRET` in `.env`, install dependencies with `npm install`, then start the API with `npm start`. The server listens on port `3000` by default; set `PORT` to override it. Routes are mounted at `/api/auth`, `/api/users`, `/genres`, and `/books`.

### Authentication and users

| Method | Endpoint | Success |
| --- | --- | --- |
| POST | `/api/auth/register` | `201`, creates a patron |
| POST | `/api/auth/login` | `200`, sets the authentication cookie |
| POST | `/api/auth/logout` | `200`, clears the authentication cookie |
| GET | `/api/users/profile` | `200`, returns the authenticated caller's profile |

Register with JSON containing `username`, `email`, and `password` (8-72 UTF-8 bytes, matching bcrypt's input limit). New accounts always receive the `patron` role; clients cannot set their own role. Passwords are bcrypt-hashed before storage and are not returned by API responses. Login accepts `email` and `password`. The seed creates the test librarian `librarian@library.test` with password `LibraryAdmin2026!` and demotes other librarian accounts so there is exactly one. This public test credential is for local development only; change or remove it before deploying.

### Token Storage

The API issues a signed JWT in the `library_token` cookie after successful login. The cookie is `HttpOnly`, `SameSite=Strict`, scoped to `/`, and expires after one hour; it is marked `Secure` when `NODE_ENV=production`. JavaScript cannot read an HttpOnly cookie, which reduces the chance that a cross-site scripting (XSS) bug can steal the token. The server reads the cookie and reloads the user from MongoDB on protected requests, so authorization uses the account's current role rather than trusting a role claim embedded in the token. Tokens contain only the subject user ID and are signed with the `JWT_SECRET` set in the environment.

The main trade-off is that browsers attach cookies automatically: this is convenient for clients and protects the token from direct JavaScript reads, but can introduce cross-site request forgery (CSRF), unlike a bearer token kept only in a custom header. This service uses `SameSite=Strict` to limit cross-site cookie sending; a production deployment should also restrict allowed origins and add CSRF tokens if cross-site integrations require relaxing that setting. Cookie-authenticated state-changing requests should remain same-site. `POST /api/auth/logout` clears the browser cookie. There is no server-side token blocklist: a copied token can still be replayed until its one-hour expiry, so clients must discard it on logout and deployments should use HTTPS. `localStorage` was not chosen because a successful XSS attack could read tokens stored there. The Postman collection demonstrates the flow; its cookie jar should retain the cookie after login and remove it after logout.

### Genres

| Method | Endpoint | Success |
| --- | --- | --- |
| GET | `/genres` | `200`, `{ "data": [...] }` |
| GET | `/genres/:id` | `200`, or `404` when missing |
| POST | `/genres` | `201` |
| PUT | `/genres/:id` | `200`, or `404` when missing |
| DELETE | `/genres/:id` | `204`, or `404` when missing |

Create and update require both `name` and `slug`. Deleting a genre referenced by one or more books returns `409`; books are not silently deleted or left with broken references.

### Books

| Method | Endpoint | Success |
| --- | --- | --- |
| GET | `/books` | `200` with `data` and `pagination` |
| GET | `/books/:id` | `200`, or `404` when missing |
| POST | `/books` | `201` (librarian only) |
| PUT | `/books/:id` | `200`, or `404` when missing (librarian only) |
| DELETE | `/books/:id` | `204`, or `404` when missing (librarian only) |

Book creation, update, and deletion require an authenticated librarian. Requests without a valid token return `401`; authenticated patrons receive `403`. Read routes remain public. The token may be sent in the `library_token` cookie or an `Authorization: Bearer <token>` header.

`GET /books` accepts `genre=<ObjectId>`, `search=<text>` (case-insensitive match against title or author), `page=<positive integer>`, and `limit=<positive integer>`. All filters can be combined. Defaults are page `1` and limit `10`; the maximum limit is `100`. The response includes `pagination.total`, `pagination.page`, `pagination.limit`, and `pagination.totalPages`.

Book create and update require all schema fields. The API rejects invalid field types, ISBN-13 values, cover URLs, copy counts, and missing genre references with `400` JSON such as `{ "error": "Validation failed", "details": [{ "field": "genre", "message": "does not reference an existing Genre" }] }`. Error responses never include stack traces or raw database errors.

The Postman collection at [`postman/library-catalog.postman_collection.json`](postman/library-catalog.postman_collection.json) contains requests for every route, including an example saved `400` response for an empty book body. Set its `baseUrl`, `genreId`, and `bookId` variables before running requests that require document IDs.

## Catalog frontend

The patron-facing React/Vite application is in [`client/`](client/). Follow its [setup and demo instructions](client/README.md) to run the responsive catalog alongside this API. The client uses API-side genre and search filtering, including combined filters and pagination.
