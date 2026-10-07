const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: String,
      required: true,
      trim: true,
    },
    isbn: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      validate: {
        validator: (value) => {
          if (!/^97[89]\d{10}$/.test(value)) return false;
          const sum = [...value].slice(0, 12).reduce(
            (total, digit, index) => total + Number(digit) * (index % 2 === 0 ? 1 : 3),
            0
          );
          return Number(value[12]) === (10 - (sum % 10)) % 10;
        },
        message: 'ISBN must be a valid 13-digit ISBN-13.',
      },
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    coverImage: {
      type: String,
      required: true,
      trim: true,
      match: [/^https?:\/\/.+/i, 'Cover image must be an HTTP(S) URL.'],
    },
    totalCopies: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: 'totalCopies must be a whole number.',
      },
    },
    availableCopies: {
      type: Number,
      required: true,
      min: 0,
      validate: [
        {
          validator: Number.isInteger,
          message: 'availableCopies must be a whole number.',
        },
        {
          validator: function (value) {
            return value <= this.totalCopies;
          },
          message: 'availableCopies cannot exceed totalCopies.',
        },
      ],
    },
    genre: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Genre',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Book', bookSchema);
