import type {Request, Response, NextFunction} from 'express'
import {z} from 'zod';
import {createResponse} from '../utils/response.js'

//Rgister validation schema
export const registerSchema = z.object({
    username: z.string()
        .min(1, 'Username is required')
        .regex(/^[a-zA-Z0-9]+$/, 'Username must be alphanumeric (letters and numbers only)'),
    email: z.string()
        .min(1, 'Email is required')
        .email('Invalid email format'),

    password: z.string()
        .min(8, 'Password must be at least 8 characters long')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[1-9]/, 'Password must contain at least one number')
        .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, 'Password must contain at least one special character'),
})

//Login validation schema
export const loginSchema = z.object({
    email: z.string()
        .min(1, 'Email is required')
        .email('Invalid email format'),
    password: z.string()
        .min(1, 'Password is required'),
})

export const validate = (schema: z.ZodSchema) =>{
    return (req:Request, res:Response, next:NextFunction) =>{
        try {
            schema.parse(req.body);
            next();
        }catch (error) {
            if (error instanceof z.ZodError) {
                const errorMessages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
                return res.status(400).json(
                    createResponse(false, 'Validation failed', null, errorMessages)
                );
            }
            next(error);
        }
    }
}

// Create a product schema validation
export const createProductSchema = z.object({
    name: z.string()
        .min(3, 'Name must be at least 3 characters long')
        .max(100, 'Name must not exceed 100 characters'),
    description: z.string()
        .min(10, 'Description must be at least 10 characteres long')
        .max(1000, 'Description must not exceed 1000 characters'),
    price: z.number()
        .positive('Price must be a positive number')
        .min(0.01, 'Price must be greater than 0'),
    stock: z.number()
        .int('Stock must be an integer')
        .min(0, 'Stock must be a non-negative integer'),
    category: z.string().optional(),
})