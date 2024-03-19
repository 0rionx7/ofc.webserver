import appInsightsClient from './utils/analytics.js';
import { createAdapter } from '@socket.io/mongo-adapter';
import { Server } from 'socket.io';
import mongoose from 'mongoose';

import debug from 'debug';
import os from 'os';

import { adapterCollection } from './utils/mongoConn.js';
import { socketListen } from './utils/socketIO.js';
import { errorHandler } from './utils/errorHandler.js';
import { app } from './app.js';

export const appLogger = debug('frontend');
const port = normalizePort(process.env.PORT || '3100');
app.set('port', port);

export const hostName = os.hostname();
export const pid = process.pid;

export const server = app.listen(port, () => {
  appLogger(
    `🤙 Express on ${hostName}, id: ${pid}, listening on port: ${
      server.address().port
    }`
  );
  appInsightsClient.trackEvent({
    name: 'FRONTEND STARTED',
    properties: { hostName, pid, port },
  });
});

export const socketIoServer = new Server(server, {
  connectionStateRecovery: { maxDisconnectionDuration: 1 * 60 * 1000 },
  pingInterval: 7000,
  pingTimeout: 40000,
});
socketIoServer.adapter(
  createAdapter(adapterCollection, { addCreatedAtField: true })
);
// socketIoServer.engine.use(helmet());  --------------------------------------------
socketIoServer.on('connection', socketListen);

server.on('error', onError);
server.on('listening', onListening);

process.on('uncaughtException', function uncaughtExceptionHandler(error) {
  errorHandler.handle(error, { isCritical: 1 }, 'process uncaughtException');
});

process.on('unhandledRejection', function unhandledRejectionHandler(reason) {
  const error = Error(reason);
  errorHandler.handle(error, { isCritical: 1 }, 'process unhandledRejection');
});

process.on('SIGINT', gracefulExit);
process.on('SIGTERM', gracefulExit);

async function gracefulExit() {
  await mongoose.disconnect();
  socketIoServer.close();
  process.exit(0);
}

function normalizePort(val) {
  const port = parseInt(val, 10);
  if (isNaN(port)) return val;
  if (port >= 0) return port;
  return false;
}
function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }
  const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

  switch (error.code) {
    case 'EACCES': {
      const error = Error(bind + ' requires elevated privileges');
      errorHandler.handle(error, { isCritical: 1 });
      break;
    }
    case 'EADDRINUSE': {
      const error = Error(bind + ' is already in use');
      errorHandler.handle(error, { isCritical: 1 });
      break;
    }
    default:
      throw error;
  }
}
function onListening() {
  const addr = server.address();
  const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
  appLogger('Listening on ' + bind);
}
