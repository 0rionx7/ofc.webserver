import mongoose from 'mongoose';
import debug from 'debug';
import os from 'os';

import { errorHandler } from './errorHandler.js';
import appInsightsClient from './analytics.js';

const appLogger = debug('frontend');
const hostName = os.hostname();

try {
  mongoose.set('strictQuery', false); // if true only the fields that are specified in the Schema will be saved
  mongoose.set('bufferCommands', false); // for ratelimiter not to consume points before connection
  await mongoose.connect(
    `${process.env.MONGODB_CONN_STRING}${process.env.ADAPTER_DB}?retryWrites=true&w=majority`
  );
  const info = `🌎 FrontEnd connected to ${process.env.ADAPTER_DB} 🌎`;
  appLogger(info);
  appInsightsClient.trackEvent({
    name: info,
    properties: { frontEnd: hostName, pid: process.pid },
  });
} catch (error) {
  errorHandler.handle(
    error,
    { isCritical: 0 },
    `FrontEnd connection to ${process.env.ADAPTER_DB} error`
  );
}

export const defaultConnection = mongoose.connection;

export const adapterCollection = defaultConnection.collection(
  process.env.ADAPTER_COLLECTION
);
try {
  adapterCollection.createIndex(
    { createdAt: 1 },
    { expireAfterSeconds: 60, background: true }
  );
} catch (error) {
  errorHandler.handle(
    error,
    {},
    `Create index for ${process.env.ADAPTER_COLLECTION} error`
  );
}

defaultConnection.on('error', error => {
  errorHandler.handle(error, { isCritical: 0 }, `Default Connection  error`);
});
defaultConnection.on('disconnected', () => {
  appLogger(`🌞 FrontEnd disconnected from ${process.env.ADAPTER_DB}`);
  appInsightsClient.trackEvent({
    name: `🌞 FrontEnd disconnected from ${process.env.ADAPTER_DB}`,
    properties: { frontEnd: hostName, pid: process.pid },
  });
});
