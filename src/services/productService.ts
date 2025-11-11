
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

    //get all product by pagination et search
    static async getProducts(page:number = 1, limit: number = 10, search?: string): Promise<any> {
        const offset = (page - 1) *limit;

        let whereClause = '';
        let countQuery = 'SELECT COUNT(*) FROM products';
        let productsQuery = `
        SELECT id, name, description, price, stock, category, created_at
        FROM products
        `;

        const queryParams : any[] = [];

        if (search && search.trim() !== '') {
            whereClause = 'WHERE name ILIKE $1';
            countQuery += whereClause;
            productsQuery += whereClause;
            queryParams.push(`%{search}%`);
        }

        //Count total products
        const countResult = await query(countQuery, queryParams);
        const totalProducts = parseInt(countResult.rows[0].count);
        const totalPages = Math.ceil(totalProducts / limit);

        //get products
        productsQuery += 'ORDER BY created_at DESC LIMIT $' + (queryParams.length + 1) + 'OFFSET $' +(queryParams.length + 2);

        const productsResult = await query(
            productsQuery,
            [...queryParams, limit, offset]
        );

        const products = productsResult.rows.map(row =>({
            id : row.id,
            name: row.name,
            description: row.description,
            price: parseFloat(row.price),
            stock: row.stock,
            category: row.category,
            created_at: row.created_at


        }));
        return createPaginatedResponse(
            true,
            'Products retrieved successfully',
            products, 
            page,
            limit,
            totalProducts
        );
    }

}