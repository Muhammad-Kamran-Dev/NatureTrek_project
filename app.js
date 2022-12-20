const express = require('express');
const morgan = require('morgan');
const userRouter = require('./routes/userRoutes');
const tourRouter = require('./routes/tourRoutes');
const globalErrorHandler = require('./controllers/errorController');
const AppError = require('./utils/appError');

const app = express();

// MIDDLEWARES
app.use(express.json());

// Use morgan only in development
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//  ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// if no route matched
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

// This middleware will execute for error
app.use(globalErrorHandler);

module.exports = app;
