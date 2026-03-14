const app = require('./app');
const connectDB = require('./scripts/connection');
const checkLocalRedis = require('./utils/checkRedis');

const port = process.env.PORT || 3000;

const startServer = async () => {
  const isRedisRunning = await checkLocalRedis();

  if (!isRedisRunning) {
    console.error(
      '\nERRO: O Redis no Docker não está rodando (porta 6379 indisponível)!\n',
    );
    console.error('Suba o Redis no Docker antes de iniciar a API.\n');
    process.exit(1);
  }

  await connectDB();

  if (process.env.NODE_ENV !== 'test') {
    app.listen(port, () => {
      console.log(`Servidor rodando na porta ${port}`);
    });
  }
};

module.exports = startServer;
