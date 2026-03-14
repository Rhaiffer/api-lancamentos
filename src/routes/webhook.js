const express = require('express');
const { handleWebhook } = require('../controllers/webhook.controller');

const router = express.Router();

// As rotas a partir daqui usarão o prefixo /api/v1/webhook (registrado no index.js)
router.post('/', handleWebhook);

module.exports = router;
