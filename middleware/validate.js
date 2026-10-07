const mongoose = require('mongoose');
const asyncHandler = require('./asyncHandler');
const Book = require('../models/Book');
const Genre = require('../models/Genre');

const fields = {
  genre: ['name', 'slug'],
  book: [
    'title',
    'author',
    'isbn',
    'description',
    'coverImage',
    'totalCopies',
    'availableCopies',
    'genre',
  ],
};

function validationResponse(res, details) {
  return res.status(400).json({ error: 'Validation failed', details });
}

function validatePayload(type) {
  const allowedFields = fields[type];
  const Model = type === 'book' ? Book : Genre;

  return asyncHandler(async (req, res, next) => {
    const body = req.body;
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return validationResponse(res, [{ field: 'body', message: 'must be a JSON object' }]);
    }

    const details = [];
    const normalized = {};

    for (const field of Object.keys(body)) {
      if (!allowedFields.includes(field)) {
        details.push({ field, message: 'is not an allowed field' });
      }
    }

    for (const field of allowedFields) {
      const value = body[field];
      if (value === undefined || value === null || value === '') {
        details.push({ field, message: 'is required' });
        continue;
      }

      if (field === 'totalCopies' || field === 'availableCopies') {
        if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) {
          details.push({ field, message: 'must be a non-negative whole number' });
        } else {
          normalized[field] = value;
        }
        continue;
      }

      if (typeof value !== 'string' || value.trim() === '') {
        details.push({ field, message: 'must be a non-empty string' });
        continue;
      }

      normalized[field] = value.trim();
    }

    if (type === 'genre' && typeof normalized.slug === 'string') {
      normalized.slug = normalized.slug.toLowerCase();
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(normalized.slug)) {
        details.push({ field: 'slug', message: 'must be a lowercase URL-safe slug' });
      }
    }

    if (type === 'book') {
      const isbn = normalized.isbn;
      if (typeof isbn === 'string') {
        if (!/^97[89]\d{10}$/.test(isbn)) {
          details.push({ field: 'isbn', message: 'must be a 13-digit ISBN-13' });
        } else {
          const sum = [...isbn].slice(0, 12).reduce(
            (total, digit, index) => total + Number(digit) * (index % 2 === 0 ? 1 : 3),
            0
          );
          if (Number(isbn[12]) !== (10 - (sum % 10)) % 10) {
            details.push({ field: 'isbn', message: 'has an invalid ISBN-13 check digit' });
          }
        }
      }

      if (typeof normalized.coverImage === 'string') {
        try {
          const url = new URL(normalized.coverImage);
          if (!['http:', 'https:'].includes(url.protocol)) throw new Error();
        } catch {
          details.push({ field: 'coverImage', message: 'must be a valid HTTP(S) URL' });
        }
      }

      if (
        typeof normalized.availableCopies === 'number' &&
        typeof normalized.totalCopies === 'number' &&
        normalized.availableCopies > normalized.totalCopies
      ) {
        details.push({ field: 'availableCopies', message: 'cannot exceed totalCopies' });
      }

      if (typeof normalized.genre === 'string' && !/^[a-f\d]{24}$/i.test(normalized.genre)) {
        details.push({ field: 'genre', message: 'must be a valid Genre ObjectId' });
      }
    }

    if (details.length) return validationResponse(res, details);

    const schemaErrors = new Model(normalized).validateSync();
    if (schemaErrors) {
      const schemaDetails = Object.values(schemaErrors.errors).map((error) => ({
        field: error.path,
        message: error.kind === 'required' ? 'is required' : `is invalid (${error.kind})`,
      }));
      return validationResponse(res, schemaDetails);
    }

    if (type === 'book' && !(await Genre.exists({ _id: normalized.genre }))) {
      return validationResponse(res, [{ field: 'genre', message: 'does not reference an existing Genre' }]);
    }

    req.validatedBody = normalized;
    return next();
  });
}

function validateObjectId(parameter) {
  return function objectIdValidator(req, res, next) {
    const value = req.params[parameter];
    if (!mongoose.isValidObjectId(value) || !/^[a-f\d]{24}$/i.test(value)) {
      return validationResponse(res, [{ field: parameter, message: 'must be a valid ObjectId' }]);
    }
    return next();
  };
}

module.exports = {
  validateBook: validatePayload('book'),
  validateGenre: validatePayload('genre'),
  validateObjectId,
};
