require('dotenv').config();

const mongoose = require('mongoose');
const app = require('./app');

const { MONGODB_URI } = process.env;
const port = Number(process.env.PORT || 3000);

if (!MONGODB_URI) {
  console.error('MONGODB_URI is not set. Add it to your .env file.');
  process.exit(1);
}

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    app.listen(port, () => console.log(`Library catalog API listening on port ${port}.`));
  })
  .catch(() => {
    console.error('Unable to connect to MongoDB. Check MONGODB_URI and database availability.');
    process.exitCode = 1;
  });
