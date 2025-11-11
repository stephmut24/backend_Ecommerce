
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

    //update product
    static async updateProduct(productId: string, productData: UpdateProductRequest): Promise<any> {
        //check if the product exists

        const existingProduct = await query(
            'SELECT id FROM products WHERE id = $1', [productId]
        )

        if (existingProduct.rows.length === 0) {
            return createResponse(false, 'product not found', null, ['Product does not exist'])
        }

        const updates : string[] = [];
        const values : any[] = [];
        let paramCount = 1;

        if (productData.name !== undefined) {
            updates.push(`name = $${paramCount}`);
            values.push(productData.name);
            paramCount++;
        }

        if (productData.price !== undefined) {
            updates.push(`price = $${paramCount}`);
            values.push(productData.price);
            paramCount++;
        }
        if (productData.stock !== undefined) {
             updates.push(`stock = $${paramCount}`);
            values.push(productData.stock);
            paramCount++;
        }
        if (productData.category !== undefined) {
             updates.push(`category = $${paramCount}`);
            values.push(productData.category);
            paramCount++;
        }

        if (updates.length === 0 ){
            return createResponse(false, 'No fields to update', null, ['Provide at least one field to update'])
        }

        updates.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(productId);

        const result = await query(
            `UPDATE products
            SET ${updates.join(', ')}
            WHERE id = $${paramCount}
            RETURNING id, name, description, price, stock, category, created_at, updated_at
            `, values
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
        return createResponse(true, 'Product updated successfully', productResponse);
    }
}