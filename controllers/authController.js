const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const signToken = (id) =>
  jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

exports.signup = catchAsync(async (req, res, next) => {
  const { name, email, password, passwordConfirm } = req.body; //SECURITY - take only atributes we want - ex no role parameter like admin
  //   console.log('req.body', req.body);
  const newUser = await User.create({
    name: name,
    email: email,
    password: password,
    passwordConfirm: passwordConfirm,
  });

  const token = signToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token: token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
    //RETURN because after calling next middleware do not continue this function
    //otherwise in node we will have error with double headers to send (two responses)
  }

  const user = await User.findOne({
    email: email,
  }).select('+password'); //force to get default hidden password from DB

  if (!user || !(await user.correctPassword(password, user.password))) {
    //in one line bcs if user doesnt exist then js will not take the second case and it wont throw an error
    return next(new AppError('Incorrect email or password!', 401));
    //RETURN because after calling next middleware do no continue this function
    //otherwise in node we will have error with double headers to send (two responses)
  }

  const token = signToken(user._id);

  res.status(200).json({
    status: 'success',
    token: token,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  //1) get token and check if it's there
  const { authorization } = req.headers;
  let token = '';
  if (authorization && authorization.startsWith('Bearer ')) {
    token = authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('You are not logged in!', 401));
  }
  //2) verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  //promisify - beacuse jwt.verify as third argument call callback
  //but we want use async await SEEmelusly like in other places of the code

  //3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('The user no longer exists', 401));
  }

  //4) check if user changed password - during time expire of the token
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again', 401),
    );
  }

  req.user = currentUser;
  //Grant access to next protected route
  next();
});

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    //thanks to 'protect' middleaware which is called before restrictTo we have user object on request object (req.user = currentUser;)
    if (!roles.includes(req.user.role)) {
      //if user doesnt have role required as argument to this function
      return next(
        new AppError('You do not have permissions to do that action.', 403),
      );
    }
    next();
  };

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1 get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('No user with this email.', 404));
  }
  //generate the random reset token
  const resetToken = user.createPasswordResetToken(); //modify document
  //now we need save changes (modification is not upadting/saving)
  //and
  await user.save({ validateBeforeSave: false }); //!!! we dont have required fields here (eg email, password, etc..), because we want only change password


});

 //!    
// exports.resetPassword = (req, res, next) => {
//   //get the data - user click on link in his email to change password
//   const { newPassword } = req.body.newPassword;

//     //check if the request is within 10mins


//   const isTokenTrue = await User.findOne({ passwordResetToken: newPassword });
//   next(new AppError('You do not have permissions to do that action.', 403));
//   //next();
// };
