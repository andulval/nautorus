// const fs = require('fs');
const Review = require('../models/reviewModel');
const AppError = require('../utils/appError');
// const AppError = require('../utils/appError');
// const catchAsync = require('../utils/catchAsync');
const handleFactory = require('./handlerFactory');

//middleware to set some additional value and allow to use generic handlerFactory to generate this func
exports.setTourAndUserIds = (req, res, next) => {
  //allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id; //if not on body eg from postman, then set user from protected middleware
  next();
};

exports.deleteReview = handleFactory.deleteOne(Review);
exports.updateReview = handleFactory.updateOne(Review);
exports.createReview = handleFactory.createOne(Review);
// exports.createReview = catchAsync(async (req, res, next) => {
//   //allow nested routes
//   if (!req.body.tour) req.body.tour = req.params.tourId;
//   if (!req.body.user) req.body.user = req.user.id; //if not on body eg from postman, then set user from protected middleware

//   const newReview = await Review.create(req.body);

//   res.status(201).json({
//     status: 'success',
//     data: { review: newReview },
//   });
// });
exports.getReview = handleFactory.getOne(Review);
exports.getAllReviews = handleFactory.getAll(Review);
// exports.getAllReviews = catchAsync(async (req, res, next) => {
//     const reviews = await Review.find(filterObj);

//     res
//       .status(200)
//       .json({ status: 'success', results: reviews.length, data: reviews });
//   });
