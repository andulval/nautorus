const express = require('express');

const router = express.Router({ mergeParams: true }); //to allow this route to add parameter in the previous query

const {
  createReview,
  getAllReviews,
  getAllReviews,
  deleteReview,
  updateReview,
  getReview,
} = require('../controllers/reviewController');
const { protect, restrictTo } = require('../controllers/authController');

router
  .route('/')
  .get(getAllReviews)
  .post(protect, restrictTo('user'), setTourAndUserIds, createReview);

router
  .route('/:id')
  .get(getReview)
  .delete(protect, restrictTo('user'), deleteReview)
  .patch(protect, updateReview);
module.exports = router;
