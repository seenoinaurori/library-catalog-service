# Library Catalog Service

Mongoose models and an idempotent seed script for a small library catalog. The seed script creates four genres and sixteen books.

## Setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env` and set `MONGODB_URI` to your local MongoDB or Atlas connection string. Keep real credentials out of source control.
3. Run `npm run seed`.

Each seed run clears the existing `Book` and `Genre` documents before inserting the catalog again. Book ISBNs are generated as valid ISBN-13 values, and each book stores a reference to its inserted genre.

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

Set `MONGODB_URI` in `.env`, install dependencies with `npm install`, then start the API with `npm start`. The server listens on port `3000` by default; set `PORT` to override it. Routes are mounted at `/genres` and `/books`.

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
| POST | `/books` | `201` |
| PUT | `/books/:id` | `200`, or `404` when missing |
| DELETE | `/books/:id` | `204`, or `404` when missing |

`GET /books` accepts `genre=<ObjectId>`, `search=<text>` (case-insensitive match against title or author), `page=<positive integer>`, and `limit=<positive integer>`. All filters can be combined. Defaults are page `1` and limit `10`; the maximum limit is `100`. The response includes `pagination.total`, `pagination.page`, `pagination.limit`, and `pagination.totalPages`.

Book create and update require all schema fields. The API rejects invalid field types, ISBN-13 values, cover URLs, copy counts, and missing genre references with `400` JSON such as `{ "error": "Validation failed", "details": [{ "field": "genre", "message": "does not reference an existing Genre" }] }`. Error responses never include stack traces or raw database errors.

The Postman collection at [`postman/library-catalog.postman_collection.json`](postman/library-catalog.postman_collection.json) contains requests for every route, including an example saved `400` response for an empty book body. Set its `baseUrl`, `genreId`, and `bookId` variables before running requests that require document IDs.
