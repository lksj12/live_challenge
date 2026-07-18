import { Router } from 'express';

import {
    deleteUserByAdmin,
    listUsers,
    resetUserPassword,
} from '../controllers/adminController';
import {
    updateProductStock,
} from '../controllers/inventoryController';
import { authenticate } from '../middleware/authenticate';
import { requireAdmin } from '../middleware/requireAdmin';

export const adminRouter = Router();

adminRouter.use(
    authenticate,
    requireAdmin,
);

adminRouter.get(
    '/users',
    listUsers,
);

adminRouter.patch(
    '/users/:userId/reset-password',
    resetUserPassword,
);

adminRouter.delete(
    '/users/:userId',
    deleteUserByAdmin,
);

adminRouter.patch(
    '/products/:productId/stock',
    updateProductStock,
);
