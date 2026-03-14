const corsOptions = require('../config/cors');

describe('CORS Config', () => {
  it('deve ter as opções corretas de CORS configuradas', () => {
    expect(corsOptions).toBeDefined();
    expect(corsOptions.credentials).toBe(true);
    expect(corsOptions.origin).toBe('*');
    expect(corsOptions.methods).toBe('GET,HEAD,PUT,PATCH,POST,DELETE');
    expect(corsOptions.preflightContinue).toBe(false);
    expect(corsOptions.optionsSuccessStatus).toBe(204);
  });
});
