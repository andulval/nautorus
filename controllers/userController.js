const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
// const AppError = require('../utils/appError');
const handleFactory = require('./handlerFactory');

const filteredObj = (body, ...allowedFilters) => {
  const result = {};
  allowedFilters.forEach((filter) => {
    if (body.hasOwnProperty(filter)) {
      result[filter] = body[filter];
    }
  });
  return result;
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id; //middleware needed for generic handler factory function of getMe - for user we have id in authentication protect middleware no in params query like otthers
  next();
};

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({ status: 'success', data: null });
});

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined! Please use /signup instead!',
  });
};

//! DO NOT updadte passwords with this - findByIdAndUpdate does NOT run safe middlewares!
exports.deleteUser = handleFactory.deleteOne(User);
// exports.updateUserData = handleFactory.updateOne(User); //! below code is quite diffreent so I decide that it will be diffrent that in  the course
exports.updateUserData = catchAsync(async (req, res, next) => {
  //update information about user - by user himself
  //1) error if user POST password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route doesnt change password, use /updatePassword',
        400,
      ),
    );
  }

  //2) update user's data
  const filteredBody = filteredObj(req.body, 'name', 'email');
  const updateUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updateUser,
    },
  });
});

exports.getUser = handleFactory.getOne(User);
// exports.getUser = (req, res) => {
//     res
//       .status(500)
//       .json({ status: 'error', message: 'This route is not yet defined!' });
//   };

exports.getAllUsers = handleFactory.getAll(User);
// exports.getAllUsers = catchAsync(async (req, res, next) => {
//     const users = await User.find();
//     res.status(200).json({ status: 'success', users: users });
//   });
