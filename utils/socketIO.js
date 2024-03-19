import { rateLimiter } from '../middleware/rate-limiter.middleware.js';
import { errorHandler } from './errorHandler.js';
import { socketIoServer, appLogger } from '../server.js';
import { backendCall } from './backendCall.js';

export function socketListen(socket) {
  const clientIp =
    socket.client.request.headers['x-forwarded-for']?.split(':')[0];
  appLogger(`socket connected, id: ${socket.id} from ip:,${clientIp}`);

  socket.on('postMessage', async function postMessageHandler(data) {
    try {
      await rateLimiter.consume(clientIp);
      const { gameId, playerName, message } = data;
      socketIoServer.in(gameId).emit('newMessage', { playerName, message });
    } catch (error) {
      errorHandler.handle(error, { clientIp }, 'socket postMessageHandler');
    }
  });

  socket.on('disconnecting', async function disconnectingHandler(reason) {
    appLogger(`disconnecting ${socket.id} due to :${reason}`);
    const [socketId, gameId] = [...socket.rooms]; // (rooms is a Set)
    if (gameId) {
      try {
        await backendCall({
          method: 'patch',
          originalUrl: '/disconnection',
          body: { gameId, socketId },
          headers: { 'Content-Type': 'application/json' },
        });
        appLogger('❌ disconnection SitOut ❗');
      } catch (error) {
        errorHandler.handle(
          error,
          { gameId, socketId },
          '❌ disconnection SitOut ❗'
        );
      }
    }
    try {
      await backendCall({
        method: 'post',
        originalUrl: '/user/logOut',
        body: { socketId },
        headers: { 'Content-Type': 'application/json' },
      });
      appLogger('❌ disconnection LogOut ❗');
    } catch (error) {
      errorHandler.handle(error, { socketId }, '❌ disconnection LogOut ❗');
    }
  });
}
