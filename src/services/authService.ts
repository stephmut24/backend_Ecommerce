
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import {query} from '../config/database.js';
import {CreateUserRequest, LoginRequest, UserResponse} from '../models/Users.js'
import {env} from '../config/env.js'
import {createResponse,BaseResponse} from '../utils/response.js'

export class AuthService {
    // check if the email exists
    static async emailExists(email: string): Promise<boolean> {
        const result = await query(
            'SELECT id FROM users WHERE email = $1',
            [email.toLowerCase()]
        )
         return result.rows.length > 0;
    }

    //check if the username exists
    
    static async usernameExists(username: string): Promise<boolean> {
        const result = await query(
            'SELECT id FROM users WHERE username = $1',
            [username]
        )
         return result.rows.length > 0;
    }

    //create a new user
    static async register(userData: CreateUserRequest): Promise<BaseResponse> {
        const {username, email, password} = userData;

        //check if email exists
        if(await this.emailExists(email)) {
            return createResponse(false, 'Registration failed', null, ['Email already registered']);
        }

        //check if username exists
        if(await this.usernameExists(username)) {
            return createResponse(false, 'Registration failed', null, ['Username already registered']);
        }

        //hash password
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        //Insert user in the database
        const result = await query(
            `INSERT INTO users (username, email, password_hash, role)
            VALUES ($1, $2, $3, $4)
            RETURNING id, username, email, role, created_at`, [username, email.toLowerCase(), passwordHash, 'user']
        );

        const user = result.rows[0];
        const userResponse: UserResponse = {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            created_at: user.created_at
        };

        return createResponse(true, 'User registered successfully', userResponse)
        
    }

    //Login
    static async login(loginData: LoginRequest): Promise<BaseResponse> {
        const {email, password} = loginData;

        //Found user by Email-address

        const result = await query(
            'SELECT id, username, email, password_hash, role FROM users WHERE email = $1',
            [email.toLowerCase()]
        );

        if (result.rows.length === 0) {
            return createResponse(false, 'Login failed', null, ['Invalid credentials']);
        }

        const user = result.rows[0];

        //check password
        const IsPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!IsPasswordValid) {
            return createResponse(false, 'Login failed', null, ['Invalid credentials']);
        }

        // Generate jwt
        const token = jwt.sign(
            {
                userId : user.id,
                username : user.username,
                role: user.role
            },
            env.JWT_SECRET,
            {expiresIn: '24h'}
        );

        const UserResponse : UserResponse = {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            created_at: user.created_at
        };

        return createResponse(true, 'Login successful', {
            user: UserResponse,
            token
        });

    }
   
}