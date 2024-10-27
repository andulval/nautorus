const express = require('express');

const router = express.Router({ mergeParams: true }); //to allow this route to add parameter in the previous query

const {
  createReview,
  getAllReviews,
  deleteReview,
  updateReview,
  getReview,
  setTourAndUserIds,
} = require('../controllers/reviewController');
const { protect, restrictTo } = require('../controllers/authController');

//! from this point all routes need auth, so we can have here middleware which starts from here and protect ALL futher routes
router.use(protect);

router
  .route('/')
  .get(getAllReviews)
  .post(restrictTo('user'), setTourAndUserIds, createReview);

router
  .route('/:id')
  .get(getReview)
  .delete(restrictTo('user', 'admin'), deleteReview)
  .patch(restrictTo('user', 'admin'), updateReview);
module.exports = router;
