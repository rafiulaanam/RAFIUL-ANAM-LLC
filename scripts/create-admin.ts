import { config } from 'dotenv';
import path from 'path';
import bcrypt from 'bcryptjs';
import { MongoClient } from 'mongodb';

// Load environment variables from .env.local
config({ path: path.resolve(process.cwd(), '.env.local') });

if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI is not set in .env.local');
  process.exit(1);
}

async function createAdminUser() {
  try {
    console.log('Connecting to MongoDB...');
    const client = await MongoClient.connect(process.env.MONGODB_URI as string);
    const db = client.db();

    console.log('Checking if admin exists...');
    // Check if admin already exists
    const existingAdmin = await db.collection('users').findOne({
      email: 'admin@example.com',
    });

    if (existingAdmin) {
      console.log('Admin user already exists');
      await client.close();
      process.exit(0);
    }

    // Hash password
    console.log('Creating new admin user...');
    const hashedPassword = await bcrypt.hash('admin123', 12);

    // Create admin user
    const result = await db.collection('users').insertOne({
      name: 'Admin User',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'ADMIN',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log('Admin user created successfully:', result.insertedId);
    await client.close();
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
}

createAdminUser(); 