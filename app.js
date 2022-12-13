const fs = require('fs');
const express = require('express');
const path = require('path');
const morgan = require('morgan');
const app = express();

// constant like enum
const STATUSES = Object.freeze({
  SUCCESS: 'success',
  FAIL: 'fail',
  ERROR: 'error',
});

const port = 5000;

// 1) MIDDLEWARES

// using middleware which will embed the json into the request body
app.use(morgan('dev'));
app.use(express.json());

const toursData = fs.readFileSync(
  path.join(__dirname, '/dev-data/data/tours-simple.json'),
  'utf8'
);
// check whether the toursData contain some data or not if contain then parse
let tours = toursData ? JSON.parse(toursData) : toursData;

// 2) ROUTE: HANDELER TOURS:
const getAllTours = (req, res) => {
  if (!toursData)
    return res
      .status(404)
      .json({ status: STATUSES.SUCCESS, message: 'No Tours Exist' });

  res.status(200).json({
    status: STATUSES.SUCCESS,
    results: tours.length,
    data: {
      tours,
    },
  });
};

const getTour = (req, res) => {
  if (!toursData)
    return res
      .status(404)
      .json({ status: STATUSES.SUCCESS, message: 'No Tours Exist' });

  const tour = tours.filter((element) => element.id === req.params.id * 1);
  if (tour.length < 1)
    return res
      .status(404)
      .json({ status: STATUSES.SUCCESS, message: 'Tour not found' });

  res.status(200).json({
    status: STATUSES.SUCCESS,
    data: {
      tour,
    },
  });
};
const createTour = (req, res) => {
  const newId = JSON.parse(toursData).length + 1;
  const newTour = Object.assign(req.body, { id: newId });
  tours.push(newTour);

  // Wrirting to file
  fs.writeFile(
    path.join(__dirname, '/dev-data/data/tours-simple.json'),
    JSON.stringify(tours),
    (err) => {
      if (err) {
        return res
          .status(500)
          .json({ status: STATUSES.FAIL, error: 'Internal server error !' });
      }
      res.status(201).send({
        status: STATUSES.SUCCESS,
        data: {
          newTour,
        },
      });
    }
  );
};
const updateTour = (req, res) => {
  const id = req.params.id * 1 - 1;
  if (id > tours.length - 1)
    return res
      .status(404)
      .json({ status: STATUSES.FAIL, error: 'Invalid id ' });

  const { name } = req.body;
  tours[id].name = name;
  const updatedTour = tours[id];

  // Wrirting to file
  fs.writeFile(
    path.join(__dirname, '/dev-data/data/tours-simple.json'),
    JSON.stringify(tours),
    (err) => {
      if (err) {
        return res
          .status(500)
          .json({ status: STATUSES.FAIL, error: 'Internal server error !' });
      }
      res.status(200).send({
        status: STATUSES.SUCCESS,
        data: {
          updatedTour,
        },
      });
    }
  );
};
const deleteTour = (req, res) => {
  // NOTE: multiplying id with 1 convert string number to number
  const id = req.params.id * 1;
  const tourExist = tours.find((element) => element.id === id);
  if (!tourExist)
    return res
      .status(404)
      .json({ status: STATUSES.FAIL, error: 'No tour found' });

  tours = tours.filter((element) => element.id !== id);
  // Wrirting to file
  fs.writeFile(
    path.join(__dirname, '/dev-data/data/tours-simple.json'),
    JSON.stringify(tours),
    (err) => {
      if (err) {
        return res
          .status(500)
          .json({ status: STATUSES.FAIL, error: 'Internal server error !' });
      }
      res.status(204).send({
        status: STATUSES.SUCCESS,
        data: null,
      });
    }
  );
};
// 2) ROUTE: HANDELER USERS:

const getAllUsers = (req, res) => {
  res.status(500).json({
    status: STATUSES.ERROR,
    message: 'This route is not yet defined ',
  });
};
const createUser = (req, res) => {
  res.status(500).json({
    status: STATUSES.ERROR,
    message: 'This route is not yet defined ',
  });
};
const getUser = (req, res) => {
  res.status(500).json({
    status: STATUSES.ERROR,
    message: 'This route is not yet defined ',
  });
};
const updateUser = (req, res) => {
  res.status(500).json({
    status: STATUSES.ERROR,
    message: 'This route is not yet defined ',
  });
};
const deleteUser = (req, res) => {
  res.status(500).json({
    status: STATUSES.ERROR,
    message: 'This route is not yet defined ',
  });
};
// 3) ROUTES

// NOTE: good to seperate routes and routes handler but another better aproach
// // ROUTE: 1 Fetch all tours using GET : api/v1/tours
// app.get('/api/v1/tours', getAllTours);

// // ROUTE: 2 Fetch specific tour GET : api/v1/tours/:id
// app.get('/api/v1/tours/:id', getTour);

// // ROUTE: 3 Create new tour using  POST : api/v1/tours
// app.post('/api/v1/tours', createTour);

// // ROUTE: 4 Update tour using  PATCH : api/v1/tours/:id
// app.patch('/api/v1/tours/:id', updateTour);

// // ROUTE: 5 DELETE tour using  DELETE : api/v1/tours
// app.delete('/api/v1/tours/:id', deleteTour);

// NOTE: very good aprouch if you need to change something in route you need to change it once
app.route('/api/v1/tours').get(getAllTours).post(createTour);

app
  .route('/api/v1/tours/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(deleteTour);

app.route('/api/v1/users').get(getAllUsers).post(createUser);

app
  .route('/api/v1/users/:id')
  .get(getUser)
  .patch(updateUser)
  .delete(deleteUser);

// SERVER STARTED
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
