const checkLocalRedis = require('../utils/checkRedis');
const net = require('net');

jest.mock('net');

describe('Check Local Redis Utility', () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    jest.clearAllMocks();
  });

  it('deve retornar true direto se estiver em production', async () => {
    process.env.NODE_ENV = 'production';
    const result = await checkLocalRedis();
    expect(result).toBe(true);
  });

  it('deve retornar true direto se estiver em test', async () => {
    process.env.NODE_ENV = 'test';
    const result = await checkLocalRedis();
    expect(result).toBe(true);
  });

  it('deve retornar true se a porta do Redis responder com connect', async () => {
    process.env.NODE_ENV = 'development';

    // Configura o mock do net.Socket
    const mockSocketInstance = {
      setTimeout: jest.fn(),
      on: jest.fn((event, callback) => {
        if (event === 'connect') {
          process.nextTick(callback); // Chama assíncrono para o event emit
        }
      }),
      connect: jest.fn(),
      destroy: jest.fn(),
    };

    net.Socket.mockImplementation(() => mockSocketInstance);

    const result = await checkLocalRedis();

    expect(mockSocketInstance.setTimeout).toHaveBeenCalledWith(2000);
    expect(mockSocketInstance.connect).toHaveBeenCalledWith(6379, '127.0.0.1');
    expect(mockSocketInstance.destroy).toHaveBeenCalled();
    expect(result).toBe(true);
  });

  it('deve retornar false se houver erro ao conectar na porta do Redis', async () => {
    process.env.NODE_ENV = 'development';

    const mockSocketInstance = {
      setTimeout: jest.fn(),
      on: jest.fn((event, callback) => {
        if (event === 'error') {
          process.nextTick(callback);
        }
      }),
      connect: jest.fn(),
      destroy: jest.fn(),
    };

    net.Socket.mockImplementation(() => mockSocketInstance);

    const result = await checkLocalRedis();

    expect(result).toBe(false);
  });

  it('deve retornar false por timeout se a conexão demorar', async () => {
    process.env.NODE_ENV = 'development';

    const mockSocketInstance = {
      setTimeout: jest.fn(),
      on: jest.fn((event, callback) => {
        if (event === 'timeout') {
          process.nextTick(callback);
        }
      }),
      connect: jest.fn(),
      destroy: jest.fn(),
    };

    net.Socket.mockImplementation(() => mockSocketInstance);

    const result = await checkLocalRedis();

    expect(mockSocketInstance.destroy).toHaveBeenCalled();
    expect(result).toBe(false);
  });
});
