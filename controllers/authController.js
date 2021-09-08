const { promisify } = require('util');
const User = require('./../models/UserModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const jwt = require('jsonwebtoken');

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
}

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
  });

  const token = signToken(newUser._id);

  res.status(201).json({
    status: ' success',
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async(req,res,next) => {
  const {email, password} = req.body;

  //1) Check if email and password exist

  if(!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  //2) Check if the user exist && the password is correct

  const user = await User.findOne({email}).select('+password');

  if(!user || !await user.correctPassword(password, user.password)) {
    return next(new AppError('Incorrect email or password',401));
  }

  //If everything is ok, send back the JWT

  const token = signToken(user._id);

  console.log('TOKEN',token)

  res.status(200).json({
    status: 'success',
    token
  })
});

exports.protect = catchAsync(async (req,res,next) => {
  //1) Getting JWT and check if exist
  let token;
  if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
     token = req.headers.authorization.split(' ')[1];
  }

  if(!token) {
    return next(new Error('You are not logged in! Please login to get access',401))
  }
  //2) JWT verification

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //3) Check if user still exist

  const currentUser = await User.findById(decoded.id);

  if(!currentUser) {
    return next(new AppError('The user belonging to this token no longer exist',401))
  }

  //4) Check if user changed password after JWT was issued

  if(currentUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppError('The user recently changed password! Please log in again', 401));
  };

  req.user = currentUser;

  next();
})