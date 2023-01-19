const mongoose = require('mongoose');
const Tour = require('./toursModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty']
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour.']
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a User.']
    }
  },
  {
    // Setting virtual properties so it can appear in the result
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });
reviewSchema.pre(/^find/, function(next) {
  // Populating the tour and user and then selecting only some fields from
  this.populate({
    path: 'user',
    select: 'name photo'
  });

  next();
});

reviewSchema.statics.calcAverageRatings = async function(tourId) {
  // Here will search in the review collection
  const stats = await this.aggregate([
    {
      $match: { tour: tourId }
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);
  // If a review is available on the tourId then will update the ratingsQuantity and ratingsAverage
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating
    });
    // And if not then will set to the default values
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5
    });
  }
};

reviewSchema.post('save', function() {
  this.constructor.calcAverageRatings(this.tour);
});

reviewSchema.pre(/^findOneAnd/, async function(next) {
  const review = this.findOne();
  this.r = await review.clone();
  next();
});

reviewSchema.post(/^findOneAnd/, async function() {
  this.r.constructor.calcAverageRatings(this.r.tour);
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
