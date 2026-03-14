const corsOptions = {
  credentials: true,
  // Para produção, devemos permitir apenas a nossa origem pra não cair no CodeQL "Permissive CORS".
  // Falback para localhost em ambiente dev.
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : 'http://localhost:3000',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

module.exports = corsOptions;
