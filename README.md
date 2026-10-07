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
