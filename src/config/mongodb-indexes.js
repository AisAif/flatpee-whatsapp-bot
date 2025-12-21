import mongoDB from './mongodb.js';
import logMessage from '../utils/logger.js';
import { LOG_LEVELS } from '../config/constants.js';

export async function createIndexes() {
  try {
    const db = mongoDB.getDatabase();
    const collection = db.collection('chat_history');

    logMessage('📊 Creating MongoDB indexes...', LOG_LEVELS.INFO);

    // Index untuk chat-based queries
    await collection.createIndex({ chatId: 1 });
    logMessage('✅ Created index: { chatId: 1 }', LOG_LEVELS.SUCCESS);

    // Index untuk timestamp sorting (newest first)
    await collection.createIndex({ chatId: 1, timestamp: -1 });
    logMessage('✅ Created index: { chatId: 1, timestamp: -1 }', LOG_LEVELS.SUCCESS);

    // TTL index untuk auto-cleanup (30 days)
    await collection.createIndex(
      { timestamp: 1 },
      { expireAfterSeconds: 30 * 24 * 60 * 60 }
    );
    logMessage('✅ Created TTL index: { timestamp: 1 } (30 days)', LOG_LEVELS.SUCCESS);

    logMessage('🎉 All MongoDB indexes created successfully!', LOG_LEVELS.SUCCESS);

  } catch (error) {
    logMessage(`❌ Failed to create indexes: ${error.message}`, LOG_LEVELS.ERROR);
    throw error;
  }
}

export async function listIndexes() {
  try {
    const db = mongoDB.getDatabase();
    const collection = db.collection('chat_history');

    const indexes = await collection.indexes();

    logMessage('📋 Current MongoDB indexes:', LOG_LEVELS.INFO);
    indexes.forEach((index, i) => {
      logMessage(`  ${i + 1}. ${JSON.stringify(index.key)} (${index.name})`, LOG_LEVELS.INFO);
    });

    return indexes;

  } catch (error) {
    logMessage(`❌ Failed to list indexes: ${error.message}`, LOG_LEVELS.ERROR);
    return [];
  }
}