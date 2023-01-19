const Review = require('../models/reviewModel');
const factory = require('../controllers/handlerFactory');
const catchAsync = require('../utils/catchAsync');
const Tour = require('../models/toursModel');
const AppError = require('../utils/appError');

exports.setTourUserIds = catchAsync(async (req, res, next) => {
  // Allow nested routes
  if (!req.body.tour) {
    // Check if the tour on which user is storing the review is available in db or not
    const tour = await Tour.findById(req.params.tourId);
    if (!tour) return next(new AppError('No tour with this id found', 404));
    // if tour present then do it
    req.body.tour = req.params.tourId;
  }
  if (!req.body.user) req.body.user = req.user.id;
  next();
});

// HANDLER TOURS:
exports.getAllReviews = factory.getAll(Review);
exports.GetReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.deleteReview = factory.deleteOne(Review);
exports.UpdateReview = factory.UpdateOne(Review);
