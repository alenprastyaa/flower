const http = require('http');
const app = require('./app');
const env = require('./config/env');
const { initSockets } = require('./sockets');

const httpServer = http.createServer(app);
initSockets(httpServer);

httpServer.listen(env.port, () => {
  console.log(`Server listening on port ${env.port} [${env.nodeEnv}]`);
});
