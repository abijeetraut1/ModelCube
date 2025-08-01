import Dexie from 'dexie';

const IndexedDB = new Dexie('ConversationalDatabase');
IndexedDB.version(1).stores({
    conversations: "conversation_id, user_id, value",
    downloads: "++id, fileName, url, progress, status, createdAt",
})

export default IndexedDB;