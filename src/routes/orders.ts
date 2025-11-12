import express from 'express';
import {OrderService} from '../services/orderService.js'
import {validate, createOrderSchema, updateOrderStatusSchema} from '../middleware/validation.js'
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

// Get user connected order
router.get('/', authenticate, async (req:AuthRequest, res)=>{
    try {
        const userId = req.user!.userId;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        //Validating paging settings
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
                errors:['Page must be between 1 and 100']
            })
        }

        const result = await OrderService.getUserOrders(userId, page, limit);
        res.status(200).json(result);
    } catch (error) {
        console.error('Get user orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            errors: ['An unexpected error occurred']
        });
    }
})

// GET /orders/:id - Get a specific order
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user!.userId;
    const result = await OrderService.getOrderById(orderId, userId);

    if (result.success) {
      res.status(200).json(result);
    } else {
      if (result.errors?.includes('Order does not exist')) {
        res.status(404).json(result);
      } else if (result.errors?.includes('You can only view your own orders')) {
        res.status(403).json(result);
      } else {
        res.status(400).json(result);
      }
    }
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      errors: ['An unexpected error occurred']
    });
  }
});

// PUT /orders/:id/status - Update order status (Admin only)
router.put('/:id/status', authenticate, requireAdmin, validate(updateOrderStatusSchema), async (req: AuthRequest, res) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;
    const result = await OrderService.updateOrderStatus(orderId, status);

    if (result.success) {
      res.status(200).json(result);
    } else {
      if (result.errors?.includes('Order does not exist')) {
        res.status(404).json(result);
      } else {
        res.status(400).json(result);
      }
    }
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      errors: ['An unexpected error occurred']
    });
  }
});

// GET /admin/orders - Get all orders (Admin only)
router.get('/admin/orders', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    // Validating paging settings
    if (page < 1) {
      return res.status(400).json({
        success: false,
        message: 'Invalid page number',
        errors: ['Page must be greater than 0']
      });
    }

    if (limit < 1 || limit > 100) {
      return res.status(400).json({
        success: false,
        message: 'Invalid limit',
        errors: ['Limit must be between 1 and 100']
      });
    }

    const result = await OrderService.getAllOrders(page, limit);
    res.status(200).json(result);
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      errors: ['An unexpected error occurred']
    });
  }
});
export default router 