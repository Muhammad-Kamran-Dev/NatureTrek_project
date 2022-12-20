const STATUSES = require('../utils/statuses');
const Tour = require('../models/toursModel');
const ApiFeatures = require('./../utils/apiFeatures');
const { SUCCESS, FAIL } = require('../utils/statuses');

// MIDDLEWARE
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.fields = 'name,price,difficulty,ratingsAverage';
  req.query.sort = '-ratingsAverage, price';
  next();
};

// HANDLER TOURS:
exports.getAllTours = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(404).json({
      status: STATUSES.FAIL,
      message: {
        error: error.message
      }
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    res.status(200).json({
      status: STATUSES.SUCCESS,
      data: {
        tour
      }
    });
  } catch (error) {
    res.status(404).json({
      status: STATUSES.FAIL,
      message: {
        error: error.message
      }
    });
  }
};
exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);

    res.status(201).json({
      status: STATUSES.SUCCESS,
      data: {
        newTour
      }
    });
  } catch (error) {
    res.status(404).json({
      status: STATUSES.FAIL,
      message: {
        error: error.message
      }
    });
  }
};
exports.updateTour = async (req, res) => {
  try {
    const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    res.status(200).json({
      status: STATUSES.SUCCESS,
      data: {
        updatedTour
      }
    });
  } catch (error) {
    res.status(404).json({
      status: STATUSES.FAIL,
      message: {
        error: error.message
      }
    });
  }
};
exports.deleteTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndDelete(req.params.id);
    if (!tour)
      return res
        .status(404)
        .json({ status: FAIL, message: 'No tour found with this id ' });
    res.status(204).json({
      status: STATUSES.SUCCESS,
      data: null
    });
  } catch (error) {
    res.status(404).json({
      status: STATUSES.FAIL,
      message: {
        error: error.message
      }
    });
  }
};

// AGGREGATE PIPELINE
exports.getTourStats = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(404).json({
      status: STATUSES.FAIL,
      message: {
        error: error.message
      }
    });
  }
};

exports.getMonthlyPlane = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(404).json({
      status: STATUSES.FAIL,
      message: {
        error: error.message
      }
    });
  }
};
