const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your Name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    trim: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  photo: {
    type: String
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false
  },
  confirmPassword: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      validator: function(password) {
        return this.password === password;
      },
      message: 'Password do not match!'
    }
  },
  passwordChangeAt: Date
});

// NOTE: Mongoose Middlewares
userSchema.pre('save', async function(next) {
  // Storing the hash of password in Db
  this.password = await bcrypt.hash(this.password, 12);

  // Delete confirm password to appear in the results
  this.confirmPassword = undefined;

  next();
});
userSchema.methods.correctPassword = async function(
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangeAt) {
    const changedTimestamp = Math.floor(this.passwordChangeAt.getTime() / 1000);

    // NOTE: So if 100 < 50 means that the jwt token is the latest one and if 100 < 150 means that the token is old and the user changed his password after this token
    return JWTTimestamp < changedTimestamp;
  }

  // False mean Not changed
  return false;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
