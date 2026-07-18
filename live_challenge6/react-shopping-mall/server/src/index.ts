import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';

import { initializeDatabase } from './db/schema';
import { adminRouter } from './routes/adminRoutes';
import { authRouter } from './routes/authRoutes';
import { inventoryRouter } from './routes/inventoryRoutes';
import { orderRouter } from './routes/orderRoutes';

dotenv.config();

initializeDatabase();

const app = express();

const port =
    Number(process.env.PORT) || 4000;

const clientOrigin =
    process.env.CLIENT_ORIGIN
    || 'http://localhost:5173';

app.use(
    cors({
        origin: clientOrigin,
    }),
);

app.use(express.json());

app.use(
    '/api/auth',
    authRouter,
);

app.use(
    '/api/inventory',
    inventoryRouter,
);

app.use(
    '/api/admin',
    adminRouter,
);

app.use(
    '/api/orders',
    orderRouter,
);

app.get(
    '/health',
    (_request, response) => {
        response.status(200).json({
            success: true,
            message: 'Server is running.',
        });
    },
);

app.listen(port, () => {
    console.log(
        `Server running at http://localhost:${port}`,
    );
});
