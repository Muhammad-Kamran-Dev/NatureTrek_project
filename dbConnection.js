const mongoose = require('mongoose');
require('dotenv').config({ path: `${__dirname}/config.env` });

module.exports = () => {
  const Db = process.env.DATABASE.replace(
    '<PASSWORD>',
    process.env.DATABASE_PASSWORD
  );
  mongoose.set('strictQuery', true);
  mongoose.connect(Db).then(() => {
    console.log('connect db Successfully');
  });
};
