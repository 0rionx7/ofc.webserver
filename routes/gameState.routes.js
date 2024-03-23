import express from 'express';

import { playerSittingOut, restartGame } from '../controllers/gameState.js';
import { forwardToBackend } from '../utils/backendCall.js';
import { body, param } from 'express-validator';

export const gameStateRouter = express.Router();

gameStateRouter.route('').post(forwardToBackend);
gameStateRouter.route('/:id').get(param('id').isMongoId(), forwardToBackend);

gameStateRouter.use(body('gameId').isMongoId());

gameStateRouter.route('/restart').post(restartGame);

gameStateRouter.route('/sitOut').patch(playerSittingOut);
gameStateRouter.route('/*').patch(forwardToBackend);
