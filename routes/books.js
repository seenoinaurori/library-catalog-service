const express = require('express');
const Book = require('../models/Book');
const asyncHandler = require('../middleware/asyncHandler');
const { validateBook, validateObjectId } = require('../middleware/validate');

const router = express.Router();

function badQuery(field, message) {
  const error = new Error(message);
  error.statusCode = 400;
  error.details = [{ field, message }];
  return error;
}

function positiveInteger(value, field, fallback, maximum = Number.MAX_SAFE_INTEGER) {
  if (value === undefined) return fallback;
  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) {
    throw badQuery(field, 'must be a positive integer');
  }
  const number = Number(value);
  if (!Number.isSafeInteger(number) || number > maximum) {
    throw badQuery(field, `must be no greater than ${maximum}`);
  }
  return number;
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const page = positiveInteger(req.query.page, 'page', 1);
    const limit = positiveInteger(req.query.limit, 'limit', 10, 100);
    const filter = {};

    if (req.query.genre !== undefined) {
      if (typeof req.query.genre !== 'string' || !/^[a-f\d]{24}$/i.test(req.query.genre)) {
        throw badQuery('genre', 'must be a valid Genre ObjectId');
      }
      filter.genre = req.query.genre;
    }

    if (req.query.search !== undefined) {
      if (typeof req.query.search !== 'string') {
        throw badQuery('search', 'must be a string');
      }
      const search = req.query.search.trim();
      if (search) {
        const expression = new RegExp(escapeRegex(search), 'i');
        filter.$or = [{ title: expression }, { author: expression }];
      }
    }

    const [books, total] = await Promise.all([
      Book.find(filter)
        .populate('genre')
        .sort({ title: 1, _id: 1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Book.countDocuments(filter),
    ]);

    res.status(200).json({
      data: books,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  })
);

router.post('/', validateBook, asyncHandler(async (req, res) => {
  const book = await Book.create(req.validatedBody);
  res.status(201).json({ data: book });
}));

router.get(
  '/:id',
  validateObjectId('id'),
  asyncHandler(async (req, res) => {
    const book = await Book.findById(req.params.id).populate('genre');
    if (!book) return res.status(404).json({ error: 'Book not found.' });
    return res.status(200).json({ data: book });
  })
);

router.put(
  '/:id',
  validateObjectId('id'),
  validateBook,
  asyncHandler(async (req, res) => {
    const book = await Book.findByIdAndUpdate(req.params.id, req.validatedBody, {
      new: true,
      runValidators: true,
    });
    if (!book) return res.status(404).json({ error: 'Book not found.' });
    return res.status(200).json({ data: book });
  })
);

router.delete(
  '/:id',
  validateObjectId('id'),
  asyncHandler(async (req, res) => {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) return res.status(404).json({ error: 'Book not found.' });
    return res.status(204).end();
  })
);

module.exports = router;
