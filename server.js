/* eslint-disable no-console */
require('dotenv').config({ path: `${__dirname}/config.env` });

process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down server ...');
  console.log(err.name, err.message);
  process.exit(1);
});

const app = require('./app');
const connectDb = require('./dbConnection');
// Connect to Database
connectDb();

const port = process.env.PORT;
// SERVER STARTED
const server = app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down server ...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
