import { query } from '../config/database.js'
import { CreateOrderRequest, OrderResponse } from '../models/order.js'
import { createPaginatedResponse, createResponse } from '../utils/response.js';
import { ProductService } from './productService.js'


export class OrderService {
    // create new order
    static async createOrder(orderData: CreateOrderRequest, userId: string): Promise<any> {
        const client = await query('BEGIN');

        try {
            const { items } = orderData;

            //check if order contain products

            if (!items || items.length === 0) {
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

                if (productResult.rows.length === 0) {
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
                const itemTotal = parseFloat(product.price) * item.quantity;
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
            const orderResult = await query(
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
                    `, [order.id, item.productId, item.quantity, item.unitPrice]
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

    //Get the order history
    static async getUserOrders(userId: string, page: number = 1, limit: number = 10): Promise<any> {
        const offset = (page - 1) * limit;

        // count total order
        const countResult = await query(
            'SELECT COUNT(*) FROM orders WHERE user_id = $1',
            [userId]
        );
        const totalOrders = parseInt(countResult.rows[0].count);
        const totalPages = Math.ceil(totalOrders / limit);

        //Get orders with pagination
        const orderResult = await query(
            `
            SELECT id, user_id, description, total_price, status, created_at
            FROM orders
            WHERE user_id = $1
            ORDER BY created_at DESC
            LIMIT $2 OFFSET $3
            `,
            [userId, limit, offset]
        );

        //Get products for an order
        const ordersWithItems = await Promise.all(
            orderResult.rows.map(async (order) => {
                const itemsResult = await query(
                    `SELECT oi.product_id, p.name as product_name, oi.quantity, oi.unit_price, (oi.quantity * oi.unit_price) as total_price
                    FROM order_items oi
                    JOIN products p ON oi.product_id = p.id
                    WHERE oi.order_id = $1
                    `,
                    [order.id]
                );
                return {
                    id: order.id,
                    user_id: order.user_id,
                    description: order.description,
                    total_price: parseFloat(order.total_price),
                    status: order.status,
                    items: itemsResult.rows.map(item => ({
                        product_id: item.product_id,
                        product_name: item.product_name,
                        quantity: item.quantity,
                        unit_price: parseFloat(item.unit_price),
                        total_price: parseFloat(item.total_price)

                    })),
                    created_at: order.created_at
                };
            })
        );
        return createPaginatedResponse(
            true,
            'Orders retrieved successfully',
            ordersWithItems,
            page,
            limit,
            totalOrders
        )
    }

    // Get a specific order by ID (ownership check)
    static async getOrderById(orderId: string, userId: string): Promise<any> {
        const orderResult = await query(
            `SELECT id, user_id, description, total_price, status, created_at 
       FROM orders 
       WHERE id = $1`,
            [orderId]
        );

        if (orderResult.rows.length === 0) {
            return createResponse(false, 'Order not found', null, ['Order does not exist']);
        }

        const order = orderResult.rows[0];

        // Check that the user owns the order
        if (order.user_id !== userId) {
            return createResponse(false, 'Access denied', null, ['You can only view your own orders']);
        }

        // Get the items from the order
        const itemsResult = await query(
            `SELECT oi.product_id, p.name as product_name, oi.quantity, oi.unit_price, 
              (oi.quantity * oi.unit_price) as total_price
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = $1`,
            [orderId]
        );

        const orderResponse: OrderResponse = {
            id: order.id,
            user_id: order.user_id,
            description: order.description,
            total_price: parseFloat(order.total_price),
            status: order.status,
            items: itemsResult.rows.map(item => ({
                product_id: item.product_id,
                product_name: item.product_name,
                quantity: item.quantity,
                unit_price: parseFloat(item.unit_price),
                total_price: parseFloat(item.total_price)
            })),
            created_at: order.created_at
        };

        return createResponse(true, 'Order retrieved successfully', orderResponse);
    }

    // Mettre à jour le statut d'une commande (Admin seulement)
    static async updateOrderStatus(orderId: string, status: string): Promise<any> {
        // Vérifier si la commande existe
        const existingOrder = await query(
            'SELECT id FROM orders WHERE id = $1',
            [orderId]
        );

        if (existingOrder.rows.length === 0) {
            return createResponse(false, 'Order not found', null, ['Order does not exist']);
        }

        // Valider le statut
        const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return createResponse(false, 'Invalid status', null, [`Status must be one of: ${validStatuses.join(', ')}`]);
        }

        const result = await query(
            `UPDATE orders 
       SET status = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 
       RETURNING id, user_id, description, total_price, status, created_at, updated_at`,
            [status, orderId]
        );

        const order = result.rows[0];

        // Obtenir les articles pour la réponse
        const itemsResult = await query(
            `SELECT oi.product_id, p.name as product_name, oi.quantity, oi.unit_price, 
              (oi.quantity * oi.unit_price) as total_price
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = $1`,
            [orderId]
        );

        const orderResponse: OrderResponse = {
            id: order.id,
            user_id: order.user_id,
            description: order.description,
            total_price: parseFloat(order.total_price),
            status: order.status,
            items: itemsResult.rows.map(item => ({
                product_id: item.product_id,
                product_name: item.product_name,
                quantity: item.quantity,
                unit_price: parseFloat(item.unit_price),
                total_price: parseFloat(item.total_price)
            })),
            created_at: order.created_at
        };

        return createResponse(true, 'Order status updated successfully', orderResponse);
    }

    // Obtenir toutes les commandes (Admin seulement)
    static async getAllOrders(page: number = 1, limit: number = 10): Promise<any> {
        const offset = (page - 1) * limit;

        // Compter le total des commandes
        const countResult = await query('SELECT COUNT(*) FROM orders');
        const totalOrders = parseInt(countResult.rows[0].count);
        const totalPages = Math.ceil(totalOrders / limit);

        // Obtenir les commandes avec pagination
        const ordersResult = await query(
            `SELECT o.id, o.user_id, o.description, o.total_price, o.status, o.created_at,
              u.username, u.email
       FROM orders o
       JOIN users u ON o.user_id = u.id
       ORDER BY o.created_at DESC 
       LIMIT $1 OFFSET $2`,
            [limit, offset]
        );

        const orders = await Promise.all(
            ordersResult.rows.map(async (order) => {
                const itemsResult = await query(
                    `SELECT oi.product_id, p.name as product_name, oi.quantity, oi.unit_price, 
                  (oi.quantity * oi.unit_price) as total_price
           FROM order_items oi
           JOIN products p ON oi.product_id = p.id
           WHERE oi.order_id = $1`,
                    [order.id]
                );

                return {
                    id: order.id,
                    user_id: order.user_id,
                    username: order.username,
                    email: order.email,
                    description: order.description,
                    total_price: parseFloat(order.total_price),
                    status: order.status,
                    items: itemsResult.rows.map(item => ({
                        product_id: item.product_id,
                        product_name: item.product_name,
                        quantity: item.quantity,
                        unit_price: parseFloat(item.unit_price),
                        total_price: parseFloat(item.total_price)
                    })),
                    created_at: order.created_at
                };
            })
        );

        return createPaginatedResponse(
            true,
            'All orders retrieved successfully',
            orders,
            page,
            limit,
            totalOrders
        );
    }

}