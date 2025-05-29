import bcrypt from 'bcryptjs';
import User from '@/models/User';
import clientPromise from './db';

export async function seedAdmin() {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  try {
    const client = await clientPromise;
    const db = client.db();

    // Check if admin exists
    const adminExists = await db.collection('users').findOne({
      email: 'admin@example.com',
      role: 'ADMIN'
    });

    if (!adminExists) {
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash('admin123', salt);

      await db.collection('users').insertOne({
        name: 'Admin User',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'ADMIN',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      console.log('Admin user seeded successfully');
    }
  } catch (error) {
    console.error('Error seeding admin user:', error);
  }
} 