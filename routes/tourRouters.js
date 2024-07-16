const express = require('express');

const router = express.Router();
const {
  getAllTours,
  createTour,
  getTour,
  aliasTopTours,
  getToursStats,
  getMonthPlan,
  updateTour,
  removeTour,
  //   checkBodyTour,
} = require('../controllers/tourController');
const { protect, restrictTo } = require('../controllers/authController');
const reviewRouter = require('./reviewRouters');

router.use('/:tourId/reviews', reviewRouter); //in this case use nested routes. router. is just a middleware, so we can use .use on it and redirect

// router.param('id', checkID); //midlleware to check if we are out of range of id - if so abort next middlewares
router.route('/top-5-cheap').get(aliasTopTours, getAllTours);

router.route('/tour-stats').get(getToursStats);
router.route('/month-plan/:year').get(getMonthPlan);

router.route('/').get(protect, getAllTours).post(createTour);
router
  .route('/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(protect, restrictTo('admin', 'lead-guide'), removeTour);

// router
//   .route('/:tourId/reviews')
//   .post(protect, restrictTo('user'), createReview);

module.exports = router;
