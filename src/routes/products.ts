import express from 'express'
import { authenticate,AuthRequest,requireAdmin } from '../middleware/auth';
import {validate, createProductSchema , updateProductSchema} from '../middleware/validation';
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

//PUT /products/:id
router.put('/:id', authenticate, requireAdmin, validate(updateProductSchema), async(req: AuthRequest, res)=>{
    try {
    const productId = req.params.id;
    const result = await ProductService.updateProduct(productId, req.body);

    if (result.success) {
      res.status(200).json(result);
    } else {
      if (result.errors?.includes('Product does not exist')) {
        res.status(404).json(result);
      } else {
        res.status(400).json(result);
      }
    }
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      errors: ['An unexpected error occurred']
});

  }
})

export default router