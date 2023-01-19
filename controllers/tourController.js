const STATUSES = require('../utils/statuses');
const Tour = require('../models/toursModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('../controllers/handlerFactory');
const AppError = require('../utils/appError');

// MIDDLEWARE
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.fields = 'name,price,difficulty,ratingsAverage';
  req.query.sort = '-ratingsAverage, price';
  next();
};

// HANDLER TOURS:
exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, {
  path: 'reviews',
  options: { sort: { createdAt: -1 } }
});
exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.UpdateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);

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

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
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

//.route('/tours-within/:distance/center/:latlng/unit/:unit')
exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitude and longitude in the format lat,lng.',
        400
      )
    );
  }

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
  });

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours
    }
  });
});
