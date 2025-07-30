const RESET_DEFAULTS = {
    downloadDirectory: '',
    modelFile: null,
    systemPrompt: '',
    batchSize: 128,
    threads: 4,
    optimizedMatrixMultiplication: true,
    contextSize: 1024,
    memoryLocking: false,
    memoryMapping: true,
    lowVramMode: true,
    ropeFrequencyBase: 10000,
    ropeFrequencyScale: 1,
    halfPrecisionKvCache: true,
    outputAllLogits: false,
    vocabularyOnlyMode: false,
    embeddingMode: false,
    gpuLayers: 20,
    gpuLayersAlternative: 20,
    randomSeed: 42,
}

export default RESET_DEFAULTS;