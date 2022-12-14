const fs = require('fs');
const path = require('path');
const STATUSES = require('../utils/statuses');

const toursData = fs.readFileSync(
  path.join(__dirname, '../dev-data/data/tours-simple.json'),
  'utf8'
);
// check whether the toursData contain some data or not if contain then parse
let tours = toursData ? JSON.parse(toursData) : toursData;

// Middleware
exports.checkId = (req, res, next, val) => {
  // Check item with the id exist or not

  const tourExist = tours.find(element => element.id === val * 1);
  if (!tourExist)
    return res
      .status(404)
      .json({ status: STATUSES.FAIL, message: 'Invalid id' });
  next();
};
exports.checkBody = (req, res, next) => {
  // Check request body for price and name
  if (!req.body.name || req.body.price) {
    return res
      .status(400)
      .json({ status: STATUSES.FAIL, message: 'Name and Price is mandatory' });
  }
  next();
};
// HANDLER TOURS:
exports.getAllTours = (req, res) => {
  res.status(200).json({
    status: STATUSES.SUCCESS,
    results: tours.length,
    data: {
      tours
    }
  });
};

exports.getTour = (req, res) => {
  const tour = tours.filter(element => element.id === req.params.id * 1);
  res.status(200).json({
    status: STATUSES.SUCCESS,
    data: {
      tour
    }
  });
};
exports.createTour = (req, res) => {
  const newId = JSON.parse(toursData).length + 1;
  const newTour = Object.assign(req.body, { id: newId });
  tours.push(newTour);

  // Writing to file
  fs.writeFile(
    path.join(__dirname, '../dev-data/data/tours-simple.json'),
    JSON.stringify(tours),
    err => {
      if (err) {
        return res
          .status(500)
          .json({ status: STATUSES.FAIL, error: 'Internal server error !' });
      }
      res.status(201).send({
        status: STATUSES.SUCCESS,
        data: {
          newTour
        }
      });
    }
  );
};
exports.updateTour = (req, res) => {
  const id = req.params.id * 1;
  const { name, duration } = req.body;
  tours.forEach(element => {
    if (element.id === id) {
      element.name = name;
      element.duration = duration;
    }
  });
  const updatedTour = tours.find(element => element.id === id);

  // Writing to file
  fs.writeFile(
    path.join(__dirname, '../dev-data/data/tours-simple.json'),
    JSON.stringify(tours),
    err => {
      if (err) {
        return res
          .status(500)
          .json({ status: STATUSES.FAIL, error: 'Internal server error !' });
      }
      res.status(200).send({
        status: STATUSES.SUCCESS,
        data: {
          updatedTour
        }
      });
    }
  );
};
exports.deleteTour = (req, res) => {
  // NOTE: multiplying id with 1 convert string number to number
  const id = req.params.id * 1;

  tours = tours.filter(element => element.id !== id);
  // Writing to file
  fs.writeFile(
    path.join(__dirname, '../dev-data/data/tours-simple.json'),
    JSON.stringify(tours),
    err => {
      if (err) {
        return res
          .status(500)
          .json({ status: STATUSES.FAIL, error: 'Internal server error !' });
      }
      res.status(204).send({
        status: STATUSES.SUCCESS,
        data: null
      });
    }
  );
};
