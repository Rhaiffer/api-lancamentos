const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const rateLimit = require('express-rate-limit');

const routes = require('./routes');
const swaggerFile = require('./swagger/swagger_output.json');
const corsOptions = require('./config/cors');
const requestLogger = require('./middlewares/logger');

const app = express();

// Configuração do Rate Limit para evitar ataques de força bruta (CodeQL)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Limita a 100 requisições por IP a cada 15 minutos
  message:
    'Muitas requisições criadas a partir deste IP, tente novamente após 15 minutos',
  standardHeaders: true,
  legacyHeaders: false,
});

// Middlewares globais
app.use(limiter);
app.use(requestLogger);
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Documentação Swagger
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));

// Rota raiz
app.get('/', (req, res) => {
  res.send('Bem-vindo à API de gerenciamento de tarefas!');
});

// Rotas da API
app.use(routes);

module.exports = app;
