import { MongoClient } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your MongoDB URI to .env.local');
}

const uri = process.env.MONGODB_URI;
const options = {
  maxPoolSize: 10,
  minPoolSize: 5,
  maxIdleTimeMS: 60000,
  connectTimeoutMS: 10000,
};

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

class Database {
  private static instance: Database;
  private _clientPromise: Promise<MongoClient>;

  private constructor() {
    if (process.env.NODE_ENV === 'development') {
      // In development mode, use a global variable so that the value
      // is preserved across module reloads caused by HMR (Hot Module Replacement).
      if (!global._mongoClientPromise) {
        const client = new MongoClient(uri, options);
        global._mongoClientPromise = client.connect();
      }
      this._clientPromise = global._mongoClientPromise;
    } else {
      // In production mode, it's best to not use a global variable.
      const client = new MongoClient(uri, options);
      this._clientPromise = client.connect();
    }
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public get clientPromise(): Promise<MongoClient> {
    return this._clientPromise;
  }
}

// Export a module-scoped instance
const database = Database.getInstance();
const clientPromise = database.clientPromise;

export default clientPromise; 