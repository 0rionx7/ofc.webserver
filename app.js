/* eslint-disable no-unused-vars */
import express from 'express';
import mongoSanitize from 'express-mongo-sanitize';
import { checkSchema } from 'express-validator';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

import { filterIpAddresses } from './middleware/filterIpAddresses.middleware.js';
// import { rateLimiterMiddleWare } from './middleware/rate-limiter.middleware.js';
import appInsightsClient from './utils/analytics.js';
import {
  forgotSchema,
  loginSchema,
  passChangeSchema,
  registerSchema,
  usernameSchema,
  validateTableName,
} from './utils/validationSchemas.js';
import { gameStateRouter } from './routes/gameState.routes.js';
import { forgotPassword } from './controllers/gameState.js';
import { forwardToBackend } from './utils/backendCall.js';
import { errorHandler } from './utils/errorHandler.js';
import { appLogger } from './server.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const app = express();
app.use(express.json({ limit: '5kb' }));

const HEADERS = {
  'Content-Security-Policy':
    "default-src 'self' https://westeurope-5.in.applicationinsights.azure.com/v2/track; base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests",
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',
  'Origin-Agent-Cluster': '?1',
  'Referrer-Policy': 'no-referrer',
  'Strict-Transport-Security': 'max-age=15552000; includeSubDomains',
  'X-Content-Type-Options': 'nosniff',
  'X-DNS-Prefetch-Control': 'off',
  'X-Download-Options': 'noopen',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-Permitted-Cross-Domain-Policies': 'none',
  'X-XSS-Protection': '0',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'Origin, X-Requested-With, Content-Type, Accept, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH,  OPTIONS',
  'Access-Control-Expose-Headers': '*',
};
app.use((_req, res, next) => {
  res.set(HEADERS);
  next();
});
app.disable('x-powered-by'); // for hiding being an express
app.set('etag', false); // for avoiding 304 not changed response
app.set('trust proxy', true); // to get the req.ip

// app.use(rateLimiterMiddleWare);

app.use(
  mongoSanitize({
    onSanitize: ({ req, key }) => {
      appLogger(`Sanitizing ${key}`);
      appInsightsClient.trackEvent({
        name: 'Injection Attempt',
        properties: { [key]: req[key], clientIp: req.ip },
      });
    },
  })
);
app.use((req, res, next) => {
  if ('OPTIONS' === req.method) return res.sendStatus(200);
  appLogger('Request method and url : ', req.method, req.originalUrl);
  appLogger('Request body:', req.body);
  next();
});

app.use('/gameState', gameStateRouter);
app.use('/user/login', checkSchema(loginSchema), forwardToBackend);
app.use('/user/register', checkSchema(registerSchema), forwardToBackend);
app.use('/user/forgot', checkSchema(forgotSchema), forgotPassword);
app.use(
  '/user/passwordChange',
  checkSchema(passChangeSchema),
  forwardToBackend
);
app.use('/user/usernameChange', checkSchema(usernameSchema), forwardToBackend);
app.get('/requests/:tableName', validateTableName, forwardToBackend);
app.use('/requests', forwardToBackend);
app.use('/tables', forwardToBackend);
app.use('/user', forwardToBackend);
app.use('/payments/VwalletWebhookRoute', filterIpAddresses, forwardToBackend);
app.use('/payments', forwardToBackend);

app.use(express.static(path.join(__dirname, 'build')));
app.use((_req, res) => {
  res.sendFile(path.join(__dirname, './build', 'index.html'));
});

app.use(errorHandler.middleware);
