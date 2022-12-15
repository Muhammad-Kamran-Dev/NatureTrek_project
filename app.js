const express = require('express');
const morgan = require('morgan');

const app = express();
const userRouter = require('./routes/userRoutes');
const tourRouter = require('./routes/tourRoutes');

// MIDDLEWARES
app.use(express.json());

// Use morgan only in development
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//  ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

module.exports = app;
