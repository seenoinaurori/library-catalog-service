const express = require('express');
const booksRouter = require('./routes/books');
const genresRouter = require('./routes/genres');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.disable('x-powered-by');
app.use(express.json({ limit: '100kb' }));
app.use('/books', booksRouter);
app.use('/genres', genresRouter);
app.use((req, res) => res.status(404).json({ error: 'Route not found.' }));
app.use(errorHandler);

module.exports = app;
