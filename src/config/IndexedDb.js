import Dexie from 'dexie';

const IndexedDB = new Dexie('ConversationalDatabase');
IndexedDB.version(1).stores({
    conversations: "conversation_id, user_id, value",
    downloads: "id, url, progress, status, total, downloaded, createdAt",
    settings: "id, system_prompt, performance_tuning, optimized_matrix_multiplication, memory_management, model_precision_and_numberical_settings, gpu_gpu_resource_allocation, randomness",
})

export default IndexedDB;