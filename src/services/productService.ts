import {query} from '../config/database.js'
import {Product, CreateProductRequest, UpdateProductRequest, ProductResponse} from '../models/Product.js'
import { createResponse, createPaginatedResponse } from '../utils/response.js'

export class ProductService {
    //create a new product (admin only)

    static async createProduct(productdata: CreateProductRequest, userId: string): Promise<any> {
        const {name, description, price, stock, category} = productdata;

        const result = await query(
            `INSERT INTO products (name, description, price,stock, category, user_id)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, name, description, price, stock, category, created_at
            `, [name, description, price, stock, category, userId]
        );

        const product = result.rows[0];
        const productResponse : ProductResponse = {
            id: product.id,
            name: product.name,
            description: product.description,
            price: parseFloat(product.price),
            stock: product.stock,
            category: product.category,
            created_at: product.created_at
        };

        return createResponse(true, 'Product created successfully', productResponse)
    }
}