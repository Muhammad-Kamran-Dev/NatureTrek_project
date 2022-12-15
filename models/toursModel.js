const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: [true, 'Name is required']
  },
  price: {
    type: Number,
    required: [true, 'Price is required']
  },
  rating: {
    type: Number,
    default: 4.5
  }
});
const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
