import { errorHandler } from '../utils/errorHandler.js';
import { RateLimiterMongo } from 'rate-limiter-flexible';
import { defaultConnection } from '../utils/mongoConn.js';

const opts = {
  storeClient: defaultConnection,
  points: 2, // Number of points
  duration: 10, // Per second(s)
  blockDuration: 60, // secs
};

export const rateLimiter = new RateLimiterMongo(opts);

export const rateLimiterMiddleWare = async (req, res, next) => {
  try {
    await rateLimiter.consume(req.ip);
    next();
  } catch (error) {
    errorHandler.handle(
      error,
      { ip: req.ip },
      `rate limited ${req.originalUrl}`
    );
    res.status(500).send('');
  }
};
