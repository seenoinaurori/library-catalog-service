# Stacks — Library Catalog

A responsive React catalog for the Library Catalog Service. Patrons can browse books, filter by genre, search by title or author, and open a full book detail page.

## Run locally

1. Start MongoDB and configure the API using [`../.env.example`](../.env.example).
2. From `library-catalog-service`, install dependencies, seed the catalog, and start the API:

   ```bash
   npm install
   npm run seed
   npm start
   ```

3. In a second terminal, start the client:

   ```bash
   cd client
   npm install
   npm run dev
   ```

4. Open the local URL printed by Vite (typically `http://localhost:5173`).

The Vite development server proxies `/books` and `/genres` to `http://localhost:3000`. The API can also be hosted on a different origin by updating the proxy in `vite.config.js`.

## Filtering and search

The client filters through the API rather than downloading the full catalog. It calls `GET /books` with the current `genre`, `search`, `page`, and `limit` parameters, so genre and search narrow results together and pagination remains server-backed. Genre options come from `GET /genres`. Search changes are committed after a 400 ms debounce.

## Demo

Record or link a short screen capture here before submitting. Demonstrate browsing the catalog, selecting a genre, searching while the genre remains selected, and opening a book detail page. A GIF can be committed to this folder and embedded like this:

```md
![Catalog demo](./catalog-demo.gif)
```

No screen recording is included yet; add the course submission recording or GIF link here.
