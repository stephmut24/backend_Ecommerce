import {PrismaClient} from '@prisma/client'

const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
});

export const connectDB = async (): Promise<void> =>{
    try {
        await prisma.$connect();
        console.log('Connected to the database')


    }catch (error) {
        console.error('Failed to connecte to the database:');
        console.error(error);
        process.exit(1);
    }
};

export {prisma}
export default prisma;