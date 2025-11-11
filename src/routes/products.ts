import express from 'express'
import { authenticate,AuthRequest,requireAdmin } from '../middleware/auth';
import {validate, createProductSchema } from '../middleware/validation';
import { ProductService } from '../services/productService';



const router =express.Router();

//POST /products - create a product (admin only)
router.post('/', authenticate, requireAdmin, validate(createProductSchema), async (req: AuthRequest, res)=>{
    try {
        const userId = req.user!.userId;
        const result = await ProductService.createProduct(req.body, userId);

        if (result.success) {
            res.status(201).json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal sever error',
            errors: ['An unexpected error occurred']
        })
    }
})

export default router