import { composeForgotPassword, transporter } from '../utils/nodmailer.js';
import { appLogger, socketIoServer } from '../server.js';
import { backendCall } from '../utils/backendCall.js';
import appInsightsClient from '../utils/analytics.js';

export const restartGame = async (req, res, next) => {
  try {
    const { tableName } = await backendCall(req);
    const gameId = req.body.gameId.toString();
    res.status(201).send({ tableName, gameId });
  } catch (error) {
    next(error);
  }
};
export const playerSittingOut = async (req, res, next) => {
  try {
    await backendCall(req);
    if (!req.body.timedout) {
      const socket = socketIoServer.sockets.sockets.get(req.body.socketId);
      if (socket)
        [...socket.rooms].slice(1).forEach(room => socket.leave(room));
    }
    const gameId = req.body.gameId;
    res.send({ gameId, id: gameId, tableName: req.body.tableName });
  } catch (error) {
    next(error);
  }
};
export const forgotPassword = async (req, res, next) => {
  try {
    const { token } = await backendCall(req);
    const email = composeForgotPassword(req.body.email, token);
    transporter.sendMail(email, function sendMail(error, info) {
      if (error) next(error);
      else {
        appLogger(info);
        appInsightsClient.trackEvent({
          name: 'Forgot password',
          properties: { email: info?.accepted },
        });
        res.status(200).json('check your email');
      }
    });
  } catch (error) {
    next(error);
  }
};
