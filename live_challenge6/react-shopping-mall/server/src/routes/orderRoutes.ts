import { Router } from 'express';

import {
    createOrder,
    getMyOrders,
} from '../controllers/orderController';
import { authenticate } from '../middleware/authenticate';

export const orderRouter = Router();

orderRouter.use(authenticate);

orderRouter.post(
    '/',
    createOrder,
);

orderRouter.get(
    '/',
    getMyOrders,
);
