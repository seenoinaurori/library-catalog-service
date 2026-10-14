const express = require('express');
const cookieParser = require('cookie-parser');
const authRouter = require('./routes/auth');
const booksRouter = require('./routes/books');
const genresRouter = require('./routes/genres');
const usersRouter = require('./routes/users');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.disable('x-powered-by');
app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/books', booksRouter);
app.use('/genres', genresRouter);
app.use((req, res) => res.status(404).json({ error: 'Route not found.' }));
app.use(errorHandler);

module.exports = app;
