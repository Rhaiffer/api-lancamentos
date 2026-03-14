const requestLogger = require('../middlewares/logger');

describe('Logger Middleware', () => {
  let consoleSpy;

  beforeEach(() => {
    // Espiona o console.log para verificar se ele foi chamado
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('deve registrar no console os detalhes da requisição após o término', () => {
    // Mocks para req, res e next
    const mockReq = {
      method: 'GET',
      originalUrl: '/api/test',
    };

    let finishCallback;
    const mockRes = {
      statusCode: 200,
      on: jest.fn((event, callback) => {
        if (event === 'finish') {
          finishCallback = callback;
        }
      }),
    };

    const mockNext = jest.fn();

    // Executa o middleware
    requestLogger(mockReq, mockRes, mockNext);

    // Verifica se "next" foi chamado sem travar a requisição
    expect(mockNext).toHaveBeenCalled();

    // Simula a finalização da resposta ('finish' event)
    finishCallback();

    // Verifica se o console.log imprimiu exatamente o que queríamos
    expect(consoleSpy).toHaveBeenCalledWith('GET /api/test 200');
  });
});
