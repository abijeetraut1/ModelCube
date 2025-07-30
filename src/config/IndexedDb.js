import Dexie from 'dexie';

const IndexedDB = new Dexie('ConversationalDatabase');
IndexedDB.version(1).stores({
    conversations: "conversation_id, user_id, value",
    slugs: "slugs, isUsed, createdAt"
})

export default IndexedDB;