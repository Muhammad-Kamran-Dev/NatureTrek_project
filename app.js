const express = require('express');
const morgan = require('morgan');

const app = express();
const userRouter = require('./routes/userRoutes');
const tourRouter = require('./routes/tourRoutes');

// MIDDLEWARES
app.use(morgan('dev'));
app.use(express.json());

//  ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

module.exports = app;
