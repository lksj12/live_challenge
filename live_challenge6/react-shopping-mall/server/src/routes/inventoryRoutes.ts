import { Router } from 'express';

import {
    listProductInventory,
} from '../controllers/inventoryController';

export const inventoryRouter = Router();

inventoryRouter.get(
    '/',
    listProductInventory,
);
