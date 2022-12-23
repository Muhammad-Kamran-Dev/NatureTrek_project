const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const User = require('../models/userModel');
const Statuses = require('../utils/statuses');

exports.signup = catchAsync(async (req, res, next) => {
  const { name, email, password, confirmPassword, passwordChangeAt } = req.body;

  const newUSer = await User.create({
    name,
    email,
    password,
    confirmPassword,
    passwordChangeAt
  });
  const token = jwt.sign({ id: newUSer._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });

  res
    .status(201)
    .json({ status: Statuses.SUCCESS, token, data: { user: newUSer } });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  //  1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }

  // 2) Check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect Email or Password', 401));
  }
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });

  // 3) If everything ok, send token to client
  res.status(200).json({ status: Statuses.SUCCESS, token });
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check if it's there
  if (!req.headers.authorization)
    return next(new AppError('Provide a valid token to get access', 401));
  const token = req.headers.authorization.split(' ')[1];
  if (!token) {
    return next(new AppError('Provide a valid token'));
  }

  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });

  // 3) check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser)
    return next(
      new AppError(
        'The user belonging to this token does no longer exist ',
        401
      )
    );
  // 4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! log in again.', 401)
    );
  }
  req.user = currentUser;
  next();
});
