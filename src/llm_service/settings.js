// takes the system information for the model to run locally
export const defaultModelOptions = {
    gpuLayers: 0,
    nGpuLayers: 0,
    contextSize: 4096,
    batchSize: 64,
    seed: 42,
    f16Kv: false,
    logitsAll: false,
    vocabOnly: false,
    useMlock: false,
    embedding: false,
    useMmap: true,
    nThreads: 4,
    lowVram: true,
    ropeFreqBase: 10000,
    ropeFreqScale: 1,
    mulMatQ: true
};

// model path and information which we generally use
export const modelInformation = {
    modelPath: "",
    // modelPath: "E:\DeepSeek-R1-0528-Qwen3-8B-Q4_K_M.gguf",
    topP: .7,
    temperature: .7,
    maxTokens: 512,
}

export const updateModelInformation = (field, value) => {
    modelInformation[field] = value;
}

export const updateGenerationParameters = (field, value) => {
    modelInformation[field] = value;
}
