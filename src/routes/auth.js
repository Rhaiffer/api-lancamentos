const express = require('express');
const login = require('../auth/login');
const router = express.Router();

// As rotas a partir daqui usarão o prefixo /api/auth (registrado no index.js)
router.post('/login', login);

module.exports = router;
