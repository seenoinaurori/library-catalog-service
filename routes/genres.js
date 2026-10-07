const express = require('express');
const Book = require('../models/Book');
const Genre = require('../models/Genre');
const asyncHandler = require('../middleware/asyncHandler');
const { validateGenre, validateObjectId } = require('../middleware/validate');

const router = express.Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const genres = await Genre.find().sort({ name: 1 });
    res.status(200).json({ data: genres });
  })
);

router.post('/', validateGenre, asyncHandler(async (req, res) => {
  const genre = await Genre.create(req.validatedBody);
  res.status(201).json({ data: genre });
}));

router.get(
  '/:id',
  validateObjectId('id'),
  asyncHandler(async (req, res) => {
    const genre = await Genre.findById(req.params.id);
    if (!genre) return res.status(404).json({ error: 'Genre not found.' });
    return res.status(200).json({ data: genre });
  })
);

router.put(
  '/:id',
  validateObjectId('id'),
  validateGenre,
  asyncHandler(async (req, res) => {
    const genre = await Genre.findByIdAndUpdate(req.params.id, req.validatedBody, {
      new: true,
      runValidators: true,
    });
    if (!genre) return res.status(404).json({ error: 'Genre not found.' });
    return res.status(200).json({ data: genre });
  })
);

router.delete(
  '/:id',
  validateObjectId('id'),
  asyncHandler(async (req, res) => {
    const genre = await Genre.findById(req.params.id);
    if (!genre) return res.status(404).json({ error: 'Genre not found.' });

    if (await Book.exists({ genre: genre._id })) {
      return res.status(409).json({ error: 'Cannot delete a genre that is referenced by books.' });
    }

    await Genre.deleteOne({ _id: genre._id });
    return res.status(204).end();
  })
);

module.exports = router;
