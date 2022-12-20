const STATUSES = require('../utils/statuses');
const Tour = require('../models/toursModel');
const ApiFeatures = require('./../utils/apiFeatures');
const AppError = require('../utils/appError');

// MIDDLEWARE
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.fields = 'name,price,difficulty,ratingsAverage';
  req.query.sort = '-ratingsAverage, price';
  next();
};
const catchAsync = fn => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
// HANDLER TOURS:
exports.getAllTours = catchAsync(async (req, res, next) => {
  const features = new ApiFeatures(Tour.find(), req.query);
  features
    .filter()
    .sort()
    .limitFields()
    .paginate();

  // EXECUTE QUERY
  const tours = await features.query;

  res.status(200).json({
    status: STATUSES.SUCCESS,
    results: tours.length,
    data: {
      tours
    }
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);

  if (!tour) {
    return next(new AppError('No Tour found with that Id'));
  }

  res.status(200).json({
    status: STATUSES.SUCCESS,
    data: {
      tour
    }
  });
});
exports.createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);

  res.status(201).json({
    status: STATUSES.SUCCESS,
    data: {
      newTour
    }
  });
});
exports.updateTour = catchAsync(async (req, res, next) => {
  const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!updatedTour) {
    return next(new AppError('No Tour found with that Id'));
  }

  res.status(200).json({
    status: STATUSES.SUCCESS,
    data: {
      updatedTour
    }
  });
});
exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);

  if (!tour) {
    return next(new AppError('No Tour found with that Id'));
  }
  res.status(204).json({
    status: STATUSES.SUCCESS,
    data: null
  });
});

// AGGREGATE PIPELINE
exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: {
        ratingsAverage: { $gte: 4.5 }
      }
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        avgRating: {
          $avg: '$ratingsAverage'
        },
        numTours: { $sum: 1 },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
        avgPrice: { $avg: '$price' },
        numOfRatings: {
          $sum: '$ratingsQuantity'
        }
      }
    },
    {
      $sort: {
        avgRating: -1
      }
    },
    {
      $addFields: {
        title: '$_id'
      }
    },
    {
      $project: {
        _id: 1,
        numTours: 1,
        duration: 1,
        avgRating: 1,
        avgPrice: 1,
        minPrice: 1,
        numOfRatings: 1,
        maxPrice: 1
      }
    }
  ]);
  res.status(200).json({
    status: STATUSES.SUCCESS,
    data: stats
  });
});

exports.getMonthlyPlane = catchAsync(async (req, res, next) => {
  const { year } = req.params;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates'
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-1-1`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTours: {
          $sum: 1
        },

        tours: { $push: '$name' }
      }
    },
    {
      $addFields: {
        Month: '$_id'
      }
    },
    {
      $project: {
        _id: 0,
        Month: 1,
        tours: 1,
        numTours: 1,
        year: 1
      }
    },
    {
      $sort: {
        numTours: -1
      }
    }
  ]);
  res.status(200).json({
    status: STATUSES.SUCCESS,
    results: plan.length,
    data: {
      plan
    }
  });
});
