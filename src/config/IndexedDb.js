import Dexie from 'dexie';

const IndexedDB = new Dexie('ConversationalDatabase');
IndexedDB.version(1).stores({
    conversations: "conversation_id, user_id, value",
    downloads: "id, url, progress, status, total, downloaded, createdAt",
    settings: "id, downloadDirectory, modelFile, systemPrompt, batchSize, threads, optimizedMatrixMultiplication, contextSize, memoryLocking, memoryMapping, lowVramMode, ropeFrequencyBase, ropeFrequencyScale, halfPrecisionKvCache, outputAllLogits, vocabularyOnlyMode, embeddingMode, gpuLayers, gpuLayersAlternative, randomSeed"
})

export default IndexedDB;