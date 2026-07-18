import { Router } from 'express';

import {
    login,
    register,
} from '../controllers/authController';
import {
    changePassword,
    deleteAccount,
    getCurrentUser,
} from '../controllers/userController';
import { authenticate } from '../middleware/authenticate';

export const authRouter = Router();

authRouter.post('/register', register);
authRouter.post('/login', login);

authRouter.get(
    '/me',
    authenticate,
    getCurrentUser,
);

authRouter.patch(
    '/change-password',
    authenticate,
    changePassword,
);

authRouter.delete(
    '/account',
    authenticate,
    deleteAccount,
);
