import { MongoClient } from 'mongodb';
import logMessage from '../utils/logger.js';
import { LOG_LEVELS } from '../config/constants.js';

class MongoDBConnection {
  constructor() {
    this.client = null;
    this.db = null;
    this.isConnected = false;
  }

  async connect() {
    if (this.isConnected && this.client) {
      return this.client;
    }

    try {
      const mongoUri = process.env.MONGODB_URI;

      if (!mongoUri) {
        throw new Error('MONGODB_URI not found in environment variables');
      }

      logMessage('🗄️ Connecting to MongoDB...', LOG_LEVELS.INFO);

      this.client = new MongoClient(mongoUri, {
        // Connection pooling untuk performance
        maxPoolSize: 10,
        minPoolSize: 2,
        maxIdleTimeMS: 30000,

        // Timeout settings
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,

        // Retry settings
        retryWrites: true,
        retryReads: true,

        // Compression (optional)
        compressors: ['zlib']
      });

      await this.client.connect();
      this.db = this.client.db('whatsapp_bot');
      this.isConnected = true;

      logMessage('✅ MongoDB connected successfully!', LOG_LEVELS.SUCCESS);
      logMessage(`📊 Database: ${this.db.databaseName}`, LOG_LEVELS.INFO);

      // Test connection dengan ping
      await this.db.admin().ping();
      logMessage('🏓 MongoDB ping successful', LOG_LEVELS.SUCCESS);

      return this.client;

    } catch (error) {
      this.isConnected = false;
      logMessage(`❌ MongoDB connection failed: ${error.message}`, LOG_LEVELS.ERROR);
      throw error;
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.close();
      this.isConnected = false;
      logMessage('🔌 MongoDB disconnected', LOG_LEVELS.INFO);
    }
  }

  getDatabase() {
    if (!this.isConnected || !this.db) {
      throw new Error('MongoDB not connected. Call connect() first.');
    }
    return this.db;
  }

  async healthCheck() {
    try {
      if (!this.isConnected) {
        return { status: 'disconnected', error: 'Not connected' };
      }

      const start = Date.now();
      await this.db.admin().ping();
      const latency = Date.now() - start;

      return {
        status: 'healthy',
        latency: `${latency}ms`,
        database: this.db.databaseName
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message
      };
    }
  }

  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      database: this.db?.databaseName || null,
      uri: process.env.MONGODB_URI ? '***configured***' : 'not configured'
    };
  }
}

// Export singleton instance
export const mongoDB = new MongoDBConnection();
export default mongoDB;