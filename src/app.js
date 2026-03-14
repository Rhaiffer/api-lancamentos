const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');

const routes = require('./routes');
const swaggerFile = require('./swagger/swagger_output.json');
const corsOptions = require('./config/cors');
const requestLogger = require('./middlewares/logger');

const app = express();

// Middlewares globais
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
