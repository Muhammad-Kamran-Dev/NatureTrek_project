const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const STATUSES = require('../utils/statuses');
const ApiFeatures = require('./../utils/apiFeatures');

exports.deleteOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError('No document found with that Id', 404));
    }
    res.status(204).json({
      status: STATUSES.SUCCESS,
      data: null
    });
  });

exports.UpdateOne = Model =>
  catchAsync(async (req, res, next) => {
    const updatedDoc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!updatedDoc) {
      return next(new AppError('No document found with that Id', 404));
    }

    res.status(200).json({
      status: STATUSES.SUCCESS,
      data: {
        data: updatedDoc
      }
    });
  });

exports.createOne = Model =>
  catchAsync(async (req, res, next) => {
    const newDoc = await Model.create(req.body);

    res.status(201).json({
      status: STATUSES.SUCCESS,
      data: {
        data: newDoc
      }
    });
  });

exports.getOne = (Model, popOpt) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOpt) query = query.populate(popOpt);

    const doc = await query;
    if (!doc) {
      return next(new AppError('No document found with that Id', 404));
    }

    res.status(200).json({
      status: STATUSES.SUCCESS,
      data: {
        data: doc
      }
    });
  });
exports.getAll = Model =>
  catchAsync(async (req, res, next) => {
    const filterObj = {};
    if (req.params.tourId) filterObj.tour = req.params.tourId;

    const features = new ApiFeatures(Model.find(filterObj), req.query);
    features
      .filter()
      .sort()
      .limitFields()
      .paginate();

    // EXECUTE QUERY
    const doc = await features.query;

    res.status(200).json({
      status: STATUSES.SUCCESS,
      results: doc.length,
      data: {
        data: doc
      }
    });
  });
