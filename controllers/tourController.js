const STATUSES = require('../utils/statuses');
const Tour = require('../models/toursModel');

// HANDLER TOURS:
exports.getAllTours = async (req, res) => {
  try {
    //  BUILD QUERY
    // 1A) Filtering
    const queryObj = { ...req.query }; // generating deep copy of req.query

    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryObj[el]);


    // 1B) Advanced Filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = JSON.parse(queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`));

    const query = Tour.find(queryStr);

    const tours = await query;

    res.status(200).json({
      status: STATUSES.SUCCESS,
      results: tours.length,
      data: {
        tours
      }
    });
  } catch (error) {
    res.status(404).send({
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
    res.status(404).send({
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

    res.status(201).send({
      status: STATUSES.SUCCESS,
      data: {
        newTour
      }
    });
  } catch (error) {
    res.status(404).send({
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
    res.status(200).send({
      status: STATUSES.SUCCESS,
      data: {
        updatedTour
      }
    });
  } catch (error) {
    res.status(404).send({
      status: STATUSES.FAIL,
      message: {
        error: error.message
      }
    });
  }
};
exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    res.status(204).send({
      status: STATUSES.SUCCESS,
      data: null
    });
  } catch (error) {
    res.status(404).send({
      status: STATUSES.FAIL,
      message: {
        error: error.message
      }
    });
  }
};
