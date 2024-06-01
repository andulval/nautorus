const express = require('express');

const router = express.Router();
const {
  getAllUsers,
  createUser,
  getUser,
} = require('../controllers/userController');
const {
  signup,
  login,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController');

router.post('/signup', signup);
router.post('/login', login);
router.post('/forgotPassword', forgotPassword);
router.post('/resetPassword', resetPassword);

router.route('/').get(getAllUsers).post(createUser);
router.route(`/:id`).get(getUser);

module.exports = router;
