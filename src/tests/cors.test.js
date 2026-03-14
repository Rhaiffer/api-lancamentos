const corsOptions = require('../config/cors');

describe('CORS Config', () => {
  it('deve ter as opções corretas de CORS configuradas', () => {
    expect(corsOptions).toBeDefined();
    expect(corsOptions.credentials).toBe(true);

    // O ambiente de testes (NODE_ENV=test) cai no fallback de development, retornando localhost:3000
    // em vez do asterisco (*) perigoso antigo.
    expect(corsOptions.origin).toBe('http://localhost:3000');

    expect(corsOptions.methods).toBe('GET,HEAD,PUT,PATCH,POST,DELETE');
    expect(corsOptions.preflightContinue).toBe(false);
    expect(corsOptions.optionsSuccessStatus).toBe(204);
  });
});
