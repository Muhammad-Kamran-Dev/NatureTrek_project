const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const STATUSES = require('../utils/statuses');
// ROUTE: HANDLER USERS:
exports.getAllUsers = catchAsync(async (req, res) => {
  const users = await User.find();
  res.status(200).json({
    status: STATUSES.ERROR,
    results: users.length,
    data: { users }
  });
});
exports.createUser = (req, res) => {
  res.status(501).json({
    status: STATUSES.ERROR,
    message: 'This route is not yet defined '
  });
};
exports.getUser = (req, res) => {
  res.status(501).json({
    status: STATUSES.ERROR,
    message: 'This route is not yet defined '
  });
};
exports.updateUser = (req, res) => {
  res.status(501).json({
    status: STATUSES.ERROR,
    message: 'This route is not yet defined '
  });
};
exports.deleteUser = catchAsync(async (req, res) => {
  const deleted = await User.findByIdAndDelete(req.params.id);
  res.status(204).json({
    status: STATUSES.SUCCESS,
    message: deleted
  });
});
