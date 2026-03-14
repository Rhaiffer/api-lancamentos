const express = require('express');

const authRoutes = require('./auth');
const usersRoutes = require('./users');
const webhookRoutes = require('./webhook');

const routes = express.Router();

routes.use('/api/auth', authRoutes);
routes.use('/api/v1/users', usersRoutes);
routes.use('/api/v1/webhook', webhookRoutes);

module.exports = routes;
