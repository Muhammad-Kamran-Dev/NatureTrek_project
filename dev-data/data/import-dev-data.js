const mongoose = require('mongoose');
const fs = require('fs');
require('dotenv').config({ path: `${__dirname}/../../config.env` });

const Tour = require('./../../models/toursModel');

const Db = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose.set('strictQuery', true);
mongoose.connect(Db).then(() => {
  console.log('Connected to Db');
});

const importData = async () => {
  // READ DEV-DATA
  try {
    const tours = JSON.parse(
      fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8')
    );

    // LOAD DATA TO DB
    await Tour.create(tours);
    console.log('Data Loaded successfully to database');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

const deleteTours = async () => {
  try {
    // Delete all tours From Database
    await Tour.deleteMany();
    console.log('Tours Data Cleared');
  } catch (error) {
    console.log(err);
  }
  process.exit();
};

if (process.argv.includes('--import')) {
  importData();
} else if (process.argv.includes('--delete')) {
  deleteTours();
}
