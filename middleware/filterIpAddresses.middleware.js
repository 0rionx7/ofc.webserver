import { errorHandler } from '../utils/errorHandler.js';
import { appLogger } from '../server.js';

const vivaWalletIps = [
  '20.50.240.57',
  '40.74.20.78',
  '94.70.170.65',
  '94.70.174.36',
  '94.70.255.73',
  '94.70.248.18',
  '83.235.24.226',
]; // change for production !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

export const filterIpAddresses = (req, res, next) => {
  if (vivaWalletIps.some(ip => req.ip.includes(ip))) {
    appLogger('TRUSTED', req.ip);
    next();
  } else {
    const error = Error(`Untrusted ip address`);
    errorHandler.handle(
      error,
      { ip: req.ip },
      `filterIpAddresses ${req.originalUrl}`
    );
    res.status(500).send('');
  }
};
