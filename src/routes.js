const express = require('express');
const login = require('./auth/login');
const routes = express();
const checkLogin = require('./middlewares/checkLogin');
const checkEmail = require('./middlewares/checkEmail');
const passwordValidation = require('./middlewares/validatePassword');
// controller Usuarios
const {
  registerUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require('./controllers/users.controller');
// controller Webhook
const { handleWebhook } = require('./controllers/webhook.controller');

// rota de login
routes.post('/api/auth/login', login);
// rota de usuário
routes.post('/api/v1/users', checkEmail, passwordValidation, registerUser);
routes.get('/api/v1/users', checkLogin, getAllUsers);
routes.get('/api/v1/users/:id', checkLogin, getUserById);
routes.put(
  '/api/v1/users/:id',
  checkLogin,
  checkEmail,
  passwordValidation,
  updateUser,
);
routes.delete('/api/v1/users/:id', checkLogin, deleteUser);

// rota de webhook
routes.post('/api/v1/webhook', handleWebhook);

module.exports = routes;
