import {query} from '../config/database.js'
import { CreateOrderRequest,OrderResponse} from '../models/order.js'
import { createResponse } from '../utils/response.js';
import {ProductService} from './productService.js'


export class OrderService {
    // create new order
    static async createOrder(orderData: CreateOrderRequest, userId: string): Promise<any> {
        const client = await query('BEGIN');

        try {
            const {items} = orderData;

            //check if order contain products

            if(!items || items.length === 0) {
                await query('ROLLBACK');
                return createResponse(false, 'Order creation failed', null, ['Order must contain at least one item'])
            }

            let totalPrice = 0;
            const orderItems: any[] = [];

            //Validate every product and calcul the total price
            for (const item of items) {
                // check if product exists
                const productResult = await query(
                    'SELECT id, name, price, stock FROM products WHERE id = $1',
                    [item.productId]
                );

                if(productResult.rows.length === 0) {
                    await query('ROLLBACK');
                    return createResponse(false, 'Order creation failed', null, [`Product not found: ${item.productId}`])
                }
                const product = productResult.rows[0];

                //check the stock
                if (product.stock < item.quantity) {
                    await query('ROLLBACK');
                    return createResponse(false, 'Order creation failed', null, [`Insufficient stock for product: ${product.name}, Available: ${product.stock}, Requested: ${item.quantity}`])
                }

                //calculate the product price
                const itemTotal = parseFloat(product.price)*item.quantity;
                totalPrice += itemTotal;

                orderItems.push({
                    productId: item.productId,
                    productName: product.name,
                    quantity: item.quantity,
                    unitPrice: parseFloat(product.price),
                    totalPrice: itemTotal
                });
            }

            // create an order
            const orderDescription = `Order with ${items.length} item(s)`;
            const orderResult =  await query(
                `
                INSERT INTO orders (user_id, description, total_price, status)
                VALUES ($1, $2, $3, $4)
                RETURNING id, user_id, description, total_price, status, created_at
                `,
                [userId, orderDescription, totalPrice, 'pending']
            );

            const order = orderResult.rows[0];

            //create order product and update stock

            for (const item of orderItems) {
                // Insert order product
                await query(
                    `INSERT INTO order_items (order_id, product_id, quantity, unit_price)
                    VALUES ($1, $2, $3, $4)
                    `, [order.id, item.productId, item.quantity,item.unitPrice ]
                );

                //update stock
                await query(
                    'UPDATE products SET stock= stock - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [item.quantity, item.productId]
                );
            }
            await query('COMMIT');

            //Prepare answer
            const orderResponse: OrderResponse = {
                    id: order.id,
                    user_id: order.user_id,
                    description: order.description,
                    total_price: parseFloat(order.total_price),
                    status: order.status,
                    items: orderItems.map(item => ({
                        product_id: item.productId,
                        product_name: item.productName,
                        quantity: item.quantity,
                        unit_price: item.unitPrice,
                        total_price: item.totalPrice

                    })),
                    created_at: order.created_at
            };
            return createResponse(true, 'Order created successfully', orderResponse)
        } catch (error) {
            await query('ROLLBACK');
            console.error('Create order transaction error:', error);
            throw error;
        }
    }
}