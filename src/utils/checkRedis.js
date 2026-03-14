const net = require('net');

const checkLocalRedis = async () => {
  if (
    process.env.NODE_ENV === 'production' ||
    process.env.NODE_ENV === 'test'
  ) {
    return true; // Pula a verificação na DigitalOcean e em testes
  }

  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(2000);

    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });

    socket.on('error', () => {
      resolve(false);
    });

    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });

    socket.connect(6379, '127.0.0.1');
  });
};

module.exports = checkLocalRedis;
