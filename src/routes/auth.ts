import express from 'express'
import { AuthService } from '../services/authService.js';
import {validate, registerSchema, loginSchema} from '../middleware/validation.js'
import {authenticate, AuthRequest} from '../middleware/auth.js';
import { success } from 'zod/v4';

const router = express.Router();

router.post('/register', validate(registerSchema), async (req, res)=>{
    try {
        const result = await AuthService.register(req.body);

        if (result.success) {
            res.status(201).json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            errors: ['An unecpected error occured']
        })
        
    }
})

export default router