require('dotenv').config();

const mongoose = require('mongoose');
const Book = require('./models/Book');
const Genre = require('./models/Genre');

function makeIsbn13(sequence) {
  const prefix = `978000000${String(sequence).padStart(3, '0')}`;
  const sum = [...prefix].reduce(
    (total, digit, index) => total + Number(digit) * (index % 2 === 0 ? 1 : 3),
    0
  );
  return `${prefix}${(10 - (sum % 10)) % 10}`;
}

const genreData = [
  { name: 'Science Fiction', slug: 'science-fiction' },
  { name: 'Fantasy', slug: 'fantasy' },
  { name: 'Mystery', slug: 'mystery' },
  { name: 'Historical Fiction', slug: 'historical-fiction' },
];

const bookData = [
  {
    title: 'The Quiet Orbit',
    author: 'Mara Voss',
    description: 'A navigation engineer follows a signal beyond the edge of a settled star system.',
    genre: 'science-fiction',
    totalCopies: 8,
    availableCopies: 6,
  },
  {
    title: 'Glass Meridian',
    author: 'Elias North',
    description: 'Two rival survey crews race to map a planet whose geography changes overnight.',
    genre: 'science-fiction',
    totalCopies: 5,
    availableCopies: 3,
  },
  {
    title: 'The Last Archive',
    author: 'Jun Park',
    description: 'A records keeper uncovers the human cost behind a machine-run colony.',
    genre: 'science-fiction',
    totalCopies: 7,
    availableCopies: 7,
  },
  {
    title: 'Tide of Europa',
    author: 'Nadia Bell',
    description: 'A deep-sea research team must decide what to do when Europa answers back.',
    genre: 'science-fiction',
    totalCopies: 6,
    availableCopies: 4,
  },
  {
    title: 'The Cartographer of Ash',
    author: 'Lena Rowan',
    description: 'An apprentice mapmaker discovers a kingdom erased from every official chart.',
    genre: 'fantasy',
    totalCopies: 9,
    availableCopies: 5,
  },
  {
    title: 'A Crown of Small Stars',
    author: 'T. R. Vale',
    description: 'A village healer is drawn into a succession struggle among the sky-islands.',
    genre: 'fantasy',
    totalCopies: 4,
    availableCopies: 2,
  },
  {
    title: 'The Orchard Witch',
    author: 'Celia Fen',
    description: 'An old orchard hides a bargain that has protected one family for generations.',
    genre: 'fantasy',
    totalCopies: 6,
    availableCopies: 6,
  },
  {
    title: 'Wolves at the Lantern Gate',
    author: 'Oren Dusk',
    description: 'A reluctant guard searches for a missing prince in a city of shifting wards.',
    genre: 'fantasy',
    totalCopies: 8,
    availableCopies: 5,
  },
  {
    title: 'The Blue Room Cipher',
    author: 'Iris Calder',
    description: 'A museum conservator finds a coded message hidden beneath a portrait.',
    genre: 'mystery',
    totalCopies: 10,
    availableCopies: 8,
  },
  {
    title: 'Murder on Alder Street',
    author: 'Graham Pike',
    description: 'A retired inspector revisits a cold case after a new letter reaches his door.',
    genre: 'mystery',
    totalCopies: 5,
    availableCopies: 1,
  },
  {
    title: 'The Borrowed Alibi',
    author: 'S. M. Lyle',
    description: 'A courtroom translator realizes that a witness has memorized someone else’s story.',
    genre: 'mystery',
    totalCopies: 7,
    availableCopies: 4,
  },
  {
    title: 'Death at Bellweather Pier',
    author: 'Nico Ames',
    description: 'A storm strands a detective with six suspects at a quiet coastal hotel.',
    genre: 'mystery',
    totalCopies: 6,
    availableCopies: 6,
  },
  {
    title: 'Letters from the Iron Harbor',
    author: 'Miriam Shaw',
    description: 'A dockworker’s daughter builds a new life in a rapidly changing port city.',
    genre: 'historical-fiction',
    totalCopies: 8,
    availableCopies: 5,
  },
  {
    title: 'The Winter Dispatch',
    author: 'Caleb Mercer',
    description: 'A courier carries a dangerous message across a country divided by civil war.',
    genre: 'historical-fiction',
    totalCopies: 5,
    availableCopies: 4,
  },
  {
    title: 'A Map of Borrowed Years',
    author: 'Amara Ellis',
    description: 'Three generations of a family reckon with the promises made during a city’s rebuilding.',
    genre: 'historical-fiction',
    totalCopies: 9,
    availableCopies: 7,
  },
  {
    title: 'The Clockmaker’s Daughter',
    author: 'Ruth Bellamy',
    description: 'In 1890s Edinburgh, a young craftswoman inherits her father’s unfinished invention.',
    genre: 'historical-fiction',
    totalCopies: 6,
    availableCopies: 3,
  },
];

async function seed() {
  const { MONGODB_URI } = process.env;
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not set. Add it to a .env file before seeding.');
  }

  try {
    await mongoose.connect(MONGODB_URI);
    await Promise.all([Book.deleteMany({}), Genre.deleteMany({})]);

    const genres = await Genre.insertMany(genreData);
    const genreIds = new Map(genres.map((genre) => [genre.slug, genre._id]));
    const books = bookData.map((book, index) => {
      const isbn = makeIsbn13(index + 1);
      return {
        ...book,
        isbn,
        coverImage: `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`,
        genre: genreIds.get(book.genre),
      };
    });

    await Book.insertMany(books);
    console.log(`Seeded ${genres.length} genres and ${books.length} books.`);
  } finally {
    await mongoose.disconnect();
  }
}

seed().catch((error) => {
  console.error('Seed failed:', error.message);
  process.exitCode = 1;
});
