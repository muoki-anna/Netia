import { Router } from 'express';
import healthCheck from './health-check.js';
import subscriptionsRouter from './ecommerce/subscriptions.js';
import mpesaRouter from './mpesa.js';
import ordersRouter from './orders.js';
import authMiddleware from '../middleware/auth.js';

const router = Router();

export default () => {
    router.get('/health', healthCheck);
    router.use('/ecommerce/subscriptions', authMiddleware, subscriptionsRouter);
    router.use('/mpesa', mpesaRouter);
    router.use('/orders', ordersRouter);

    return router;
};

