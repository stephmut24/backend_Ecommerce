import express from 'express'
import { authenticate,AuthRequest,requireAdmin } from '../middleware/auth';
import {validate, createProductSchema , updateProductSchema} from '../middleware/validation';
import { ProductService } from '../services/productService';
import { success } from 'zod/v4';



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

  // Get product 
router.get('/', async (req, res)=>{
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;

      //validation des parametres de pagination
      if (page < 1) {
        return res.status(400).json({
          success: false,
          message: 'Invalid page number',
          errors: ['Page must be greater than 0']
        })
      }

      if (limit < 1 || limit > 100) {
        return res.status(400).json({
          success: false,
          message: 'Invalid limit',
          errors: ['Limit must be between 1 and 100']
        });
      }

      const result = await ProductService.getProducts(page, limit, search);
      res.status(200).json(result)
    } catch (error) {
      console.error('Get products error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        errors: ['An unexpected error occured']
      })
    }
  })

//get product by ID
router.get('/:id', async (req, res) =>{
  try {
    const productId = req.params.id;
    const result = await ProductService.getProductById(productId)

    if (result.success){
      res.status(200).json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      errors: ['An unexpected error occurred']
    })
    
  }
})

router.delete('/:id', authenticate, requireAdmin, async (req: AuthRequest, res)=>{
  try {
    const productId = req.params.id;
    const result = await ProductService.deleteProduct(productId)

    if (result.success) {
      res.status(200).json(result);
    } else {
      if (result.errors?.includes('Product does not ')){
        res.status(404).json(result)
      }else {
        res.status(400).json(result);
      }
    }
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      errors: ['An unexpected error occurred']
    });
    
  }
})



export default router