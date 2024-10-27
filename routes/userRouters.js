const express = require('express');

const router = express.Router();

const {
  getAllUsers,
  createUser,
  getUser,
  updateUserData,
  deleteMe,
  deleteUser,
  getMe,
} = require('../controllers/userController');
const {
  signup,
  login,
  forgotPassword,
  resetPassword,
  updatePassword,
  protect,
  restrictTo,
} = require('../controllers/authController');

router.post('/signup', signup);
router.post('/login', login);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

//! from this point all routes need auth, so we can have here middleware which starts from here and protect ALL futher routes
router.use(protect);

router.get('/me', getMe, getUser);
router.patch('/updateMyPassword', updatePassword);
router.delete('/deleteMe', deleteMe);

//! from this point all routes need auth, so we can have here middleware which starts from here and restrictTo ALL futher routes
router.use(restrictTo('admin'));

router.route('/').get(getAllUsers).post(createUser);
router.route(`/:id`).get(getUser).patch(updateUserData).delete(deleteUser);

module.exports = router;
