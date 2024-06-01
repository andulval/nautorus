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

module.exports = router;
