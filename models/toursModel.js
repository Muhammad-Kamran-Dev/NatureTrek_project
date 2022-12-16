const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: [true, 'A tour must have Name']
  },
  price: {
    type: Number,
    required: [true, 'A tour must have price']
  },
  ratingsAverage: {
    type: Number,
    default: 4.5
  },
  ratingQuantity: {
    type: Number,
    default: 0
  },
  imageCover: {
    type: String,
    required: [true, 'A tour must have image cover']
  },
  images: [String],

  createdAt: {
    type: Date,
    default: Date.now()
  },
  startDates: [Date],
  duration: {
    type: Number,
    required: [true, 'A tour must have duration']
  },
  maxGroupSize: {
    type: Number,
    required: [true, 'A tour must have group size']
  },
  difficulty: {
    type: String,
    required: [true, 'A tour must have difficulty']
  },
  summary: {
    type: String,
    trim: [true, 'A tour must have summary']
  },
  description: {
    type: String
  },
  priceDiscount: Number
});
const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
