import { config } from 'dotenv';
import path from 'path';
import { MongoClient } from 'mongodb';

// Load environment variables from .env.local
config({ path: path.resolve(process.cwd(), '.env.local') });

async function checkDatabase() {
  try {
    console.log('Environment Check:');
    console.log('MONGODB_URI:', process.env.MONGODB_URI ? '✓ Set' : '✗ Not Set');
    console.log('NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? '✓ Set' : '✗ Not Set');
    console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL ? '✓ Set' : '✗ Not Set');
    console.log('\n-------------------\n');

    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not set in .env.local');
    }

    console.log('Attempting to connect to MongoDB...');
    const client = await MongoClient.connect(process.env.MONGODB_URI);
    const db = client.db();
    
    console.log('Successfully connected to MongoDB');
    
    // Check users collection
    const usersCollection = db.collection('users');
    const users = await usersCollection.find({}).toArray();
    
    console.log('\nUsers in database:', users.length ? `${users.length} users found` : 'No users found');
    
    if (users.length === 0) {
      console.log('Warning: No users found in the database');
    } else {
      users.forEach(user => {
        console.log('\n------------------------');
        console.log(`User Details:`);
        console.log(`ID: ${user._id}`);
        console.log(`Email: ${user.email}`);
        console.log(`Name: ${user.name}`);
        console.log(`Role: ${user.role || 'No role set'}`);
        console.log(`Is Active: ${user.isActive !== false ? 'Yes' : 'No'}`);
        console.log(`Password: ${user.password ? '✓ Set' : '✗ Not Set'}`);
        console.log(`Created At: ${user.createdAt || 'Not set'}`);
        console.log(`Last Login: ${user.lastLogin || 'Never'}`);
      });
    }

    // Check collections
    const collections = await db.listCollections().toArray();
    console.log('\n------------------------');
    console.log('\nAvailable collections:');
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });

    await client.close();
    process.exit(0);
  } catch (error) {
    console.error('\nDatabase Error:', error);
    process.exit(1);
  }
}

checkDatabase(); 