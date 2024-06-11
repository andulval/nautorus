const express = require('express');

const router = express.Router();
const {
  getAllUsers,
  createUser,
  getUser,
  updateUserData,
} = require('../controllers/userController');
const {
  signup,
  login,
  forgotPassword,
  resetPassword,
  updatePassword,
  protect,
} = require('../controllers/authController');

router.post('/signup', signup);
router.post('/login', login);
router.post('/forgotPassword', forgotPassword);

router.patch('/resetPassword/:token', resetPassword);
router.patch('/updateMyPassword', protect, updatePassword);

router.patch('/updateUserData', protect, updateUserData);

router.route('/').get(getAllUsers).post(createUser);
router.route(`/:id`).get(getUser);

module.exports = router;
