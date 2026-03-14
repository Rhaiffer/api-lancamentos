const express = require('express');
const UserController = require('../controllers/users.controller');
const checkLogin = require('../middlewares/checkLogin');
const checkEmail = require('../middlewares/checkEmail');
const passwordValidation = require('../middlewares/validatePassword');

const router = express.Router();

router.post(
  '/',
  checkLogin,
  checkEmail,
  passwordValidation,
  UserController.registerUser,
);
router.get('/', checkLogin, UserController.getAllUsers);
router.get('/:id', checkLogin, UserController.getUserById);
router.put(
  '/:id',
  checkLogin,
  checkEmail,
  passwordValidation,
  UserController.updateUser,
);
router.delete('/:id', checkLogin, UserController.deleteUser);

module.exports = router;
