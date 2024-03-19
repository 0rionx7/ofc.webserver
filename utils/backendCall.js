import axios from 'axios';
import { validationResult } from 'express-validator';

import appInsightsClient from './analytics.js';

export const backEndUrl = process.env.BACKEND_URL;

export const backendCall = async req => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    throw Error(errors.array().at(0)?.msg, { cause: 'validation' });
  try {
    const response = await axios({
      method: req.method,
      url: backEndUrl + req.originalUrl,
      data: req.body,
      headers: { authorization: req.headers.authorization },
    });
    return response.data;
  } catch (error) {
    if (error.response?.data?.message)
      throw Error(error.response.data.message, { cause: 'backend error' });
    else {
      appInsightsClient.trackException({ exception: error });
      throw Error('Server error');
    }
  }
};
export async function forwardToBackend(req, res, next) {
  try {
    const response = await backendCall(req);
    res.json(response);
  } catch (error) {
    next(error);
  }
}
