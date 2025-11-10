import type {Request, Response, NextFunction} from 'express'
import jwt from 'jsonwebtoken'
import {env} from '../config/env.js'
import {createResponse} from '../utils/response.js'

export interface AuthRequest extends Request {
    user?: {
        userId: string;
        username: string;
        role: string;
    };
}

export const authenticate = (req: AuthRequest, res:Response, next:NextFunction) =>{
    const token = req.header('Authorization')?.replace('Bearer', '');

    if(!token) {
        return res.status(401).json(
            createResponse(false, 'Access denied. No token provided.', null, ['Token is required'])
        );
    }
    try {
        const decoded = jwt.verify(token, env.JWT_SECRET) as any;
        req.user = decoded;
        next()
    } catch (error) {
        return res.status(401).json(
            createResponse(false, 'Invalid token.', null, ['Token is invalid or expired'])
        )
        
    }
}

export const requireAdmin = (req: AuthRequest, res:Response, next:NextFunction) =>{
    if (req.user?.role !== 'admin'){
        return res.status(403).json(
            createResponse(false, 'Access denied. Admin role required.', null, ['Insufficient permissions'])
        )
    }
    next();
}