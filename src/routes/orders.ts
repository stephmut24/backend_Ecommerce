import express from 'express';
import {OrderService} from '../services/orderService.js'
import {validate, createOrderSchema} from '../middleware/validation.js'
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

//Post orders
router.post('/', authenticate, validate(createOrderSchema), async(req:AuthRequest, res)=>{
    try {
        const userId =  req.user!.userId;
        const result = await OrderService.createOrder(req.body,userId);

        if (result.success) {
            res.status(201).json(result);
        } else {
            if (result.errors?.some((err:string) => err.includes('Product not found'))){
                res.status(404).json(result)
            } else if (result.errors?.some((err:string) => err.includes('Insufficient stock'))){
                res.status(400).json(result);
            } else {
                res.status(400).json(result)
            }
        }
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            errors: ['An unexpected error occurred']
        });
    }
})
export default router 