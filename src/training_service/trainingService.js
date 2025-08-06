import * as tf from '@tensorflow/tfjs';

interface TrainingConfig {
    maxSequenceLength: number;
    vocabularySize: number;
    embeddingDim: number;
    epochs: number;
    batchSize: number;
    validationSplit: number;
    learningRate: number;
}

interface TrainingCallbacks {
    onEpochEnd?: (epoch: number, loss: number, accuracy: number) => void;
    onTrainingComplete?: (model: tf.LayersModel, history: any) => void;
    onProgress?: (progress: number) => void;
    onError?: (error: Error) => void;
}

interface DatasetItem {
    text: string;
    label: string;
}

export class TextClassificationTrainer {
    private tokenizer: Map<string, number> = new Map();
    private labelEncoder: Map<string, number> = new Map();
    private model: tf.LayersModel | null = null;
    private config: TrainingConfig;

    constructor(config: Partial<TrainingConfig> = {}) {
        this.config = {
            maxSequenceLength: 100,
            vocabularySize: 10000,
            embeddingDim: 128,
            epochs: 10,
            batchSize: 32,
            validationSplit: 0.2,
            learningRate: 0.001,
            ...config
        };
    }

    /**
     * Detect and parse uploaded file
     */
    async detectAndParseFile(file: File): Promise<DatasetItem[]> {
        try {
            const fileExtension = file.name.split('.').pop()?.toLowerCase();
            const fileContent = await this.readFile(file);

            switch (fileExtension) {
                case 'csv':
                    return this.parseCSV(fileContent);
                case 'json':
                    return this.parseJSON(fileContent);
                case 'txt':
                    return this.parseTXT(fileContent);
                default:
                    throw new Error(`Unsupported file format: ${fileExtension}`);
            }
        } catch (error) {
            throw new Error(`Failed to parse file: ${error.message}`);
        }
    }

    private async readFile(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }

    private parseCSV(content: string): DatasetItem[] {
        const lines = content.trim().split('\n');
        const data: DatasetItem[] = [];

        // Assume first line is header
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));

        // Find text and label columns
        const textColumn = headers.findIndex(h =>
            h.toLowerCase().includes('text') ||
            h.toLowerCase().includes('review') ||
            h.toLowerCase().includes('content')
        );
        const labelColumn = headers.findIndex(h =>
            h.toLowerCase().includes('label') ||
            h.toLowerCase().includes('sentiment') ||
            h.toLowerCase().includes('category')
        );

        if (textColumn === -1 || labelColumn === -1) {
            throw new Error('Could not find text and label columns in CSV');
        }

        for (let i = 1; i < lines.length; i++) {
            const columns = this.parseCSVLine(lines[i]);
            if (columns.length > Math.max(textColumn, labelColumn)) {
                data.push({
                    text: columns[textColumn].trim(),
                    label: columns[labelColumn].trim()
                });
            }
        }

        return data;
    }

    private parseCSVLine(line: string): string[] {
        const result = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current.replace(/"/g, ''));
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current.replace(/"/g, ''));
        return result;
    }

    private parseJSON(content: string): DatasetItem[] {
        const data = JSON.parse(content);

        if (Array.isArray(data)) {
            return data.map(item => ({
                text: item.text || item.review || item.content || '',
                label: item.label || item.sentiment || item.category || ''
            }));
        } else {
            throw new Error('JSON file should contain an array of objects');
        }
    }

    private parseTXT(content: string): DatasetItem[] {
        const lines = content.trim().split('\n');
        const data: DatasetItem[] = [];

        for (const line of lines) {
            // Assume format: "label\ttext" or "label,text"
            const separator = line.includes('\t') ? '\t' : ',';
            const parts = line.split(separator, 2);

            if (parts.length === 2) {
                data.push({
                    text: parts[1].trim(),
                    label: parts[0].trim()
                });
            }
        }

        return data;
    }

    /**
     * Preprocess text data
     */
    private preprocessText(text: string): string {
        return text
            .toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    /**
     * Build vocabulary from texts
     */
    private buildVocabulary(texts: string[]): void {
        const wordCount = new Map < string, number> ();

        // Count word frequencies
        texts.forEach(text => {
            const words = this.preprocessText(text).split(' ');
            words.forEach(word => {
                if (word.length > 0) {
                    wordCount.set(word, (wordCount.get(word) || 0) + 1);
                }
            });
        });

        // Sort by frequency and take top words
        const sortedWords = Array.from(wordCount.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, this.config.vocabularySize - 2); // Reserve space for <PAD> and <UNK>

        // Build tokenizer
        this.tokenizer.clear();
        this.tokenizer.set('<PAD>', 0);
        this.tokenizer.set('<UNK>', 1);

        sortedWords.forEach(([word], index) => {
            this.tokenizer.set(word, index + 2);
        });
    }

    /**
     * Tokenize text to sequence of integers
     */
    private tokenizeText(text: string): number[] {
        const words = this.preprocessText(text).split(' ');
        const tokens = words.map(word => this.tokenizer.get(word) || 1); // 1 is <UNK>

        // Pad or truncate to maxSequenceLength
        if (tokens.length < this.config.maxSequenceLength) {
            return [...tokens, ...new Array(this.config.maxSequenceLength - tokens.length).fill(0)];
        } else {
            return tokens.slice(0, this.config.maxSequenceLength);
        }
    }

    /**
     * Encode labels to integers
     */
    private encodeLabels(labels: string[]): number[] {
        const uniqueLabels = [...new Set(labels)];

        this.labelEncoder.clear();
        uniqueLabels.forEach((label, index) => {
            this.labelEncoder.set(label, index);
        });

        return labels.map(label => this.labelEncoder.get(label)!);
    }

    /**
     * Create the neural network model
     */
    private createModel(numClasses: number): tf.LayersModel {
        const model = tf.sequential({
            layers: [
                tf.layers.embedding({
                    inputDim: this.config.vocabularySize,
                    outputDim: this.config.embeddingDim,
                    inputLength: this.config.maxSequenceLength,
                }),
                tf.layers.globalAveragePooling1d(),
                tf.layers.dense({
                    units: 64,
                    activation: 'relu',
                }),
                tf.layers.dropout({ rate: 0.5 }),
                tf.layers.dense({
                    units: 32,
                    activation: 'relu',
                }),
                tf.layers.dropout({ rate: 0.3 }),
                tf.layers.dense({
                    units: numClasses,
                    activation: numClasses > 2 ? 'softmax' : 'sigmoid',
                }),
            ],
        });

        model.compile({
            optimizer: tf.train.adam(this.config.learningRate),
            loss: numClasses > 2 ? 'sparseCategoricalCrossentropy' : 'binaryCrossentropy',
            metrics: ['accuracy'],
        });

        return model;
    }

    /**
     * Main training function
     */
    async trainModel(
        dataset: DatasetItem[],
        callbacks: TrainingCallbacks = {}
    ): Promise<tf.LayersModel> {
        try {
            const { onEpochEnd, onTrainingComplete, onProgress, onError } = callbacks;

            if (dataset.length === 0) {
                throw new Error('Dataset is empty');
            }

            onProgress?.(10);

            // Extract texts and labels
            const texts = dataset.map(item => item.text);
            const labels = dataset.map(item => item.label);

            // Build vocabulary
            this.buildVocabulary(texts);
            onProgress?.(25);

            // Tokenize texts
            const sequences = texts.map(text => this.tokenizeText(text));
            const encodedLabels = this.encodeLabels(labels);
            const numClasses = this.labelEncoder.size;

            onProgress?.(40);

            // Convert to tensors
            const xs = tf.tensor2d(sequences);
            const ys = numClasses > 2
                ? tf.tensor1d(encodedLabels, 'int32')
                : tf.tensor2d(encodedLabels.map(label => [label]));

            onProgress?.(50);

            // Create model
            this.model = this.createModel(numClasses);

            console.log('Model Summary:');
            this.model.summary();

            onProgress?.(60);

            // Training callbacks
            const trainCallbacks: tf.CustomCallbackArgs = {
                onEpochEnd: async (epoch, logs) => {
                    const loss = logs?.loss || 0;
                    const accuracy = logs?.acc || logs?.accuracy || 0;
                    onEpochEnd?.(epoch, loss, accuracy);
                    onProgress?.(60 + (epoch + 1) / this.config.epochs * 35);
                }
            };

            // Train the model
            const history = await this.model.fit(xs, ys, {
                epochs: this.config.epochs,
                batchSize: this.config.batchSize,
                validationSplit: this.config.validationSplit,
                callbacks: trainCallbacks,
                verbose: 1,
            });

            onProgress?.(100);
            onTrainingComplete?.(this.model, history);

            // Cleanup tensors
            xs.dispose();
            ys.dispose();

            return this.model;

        } catch (error) {
            callbacks.onError?.(error as Error);
            throw error;
        }
    }

    /**
     * Predict single text
     */
    async predict(text: string): Promise<{ label: string; confidence: number }> {
        if (!this.model) {
            throw new Error('Model not trained yet');
        }

        const sequence = this.tokenizeText(text);
        const input = tf.tensor2d([sequence]);

        const prediction = this.model.predict(input) as tf.Tensor;
        const probabilities = await prediction.data();

        let predictedIndex: number;
        let confidence: number;

        if (this.labelEncoder.size > 2) {
            // Multi-class classification
            predictedIndex = probabilities.indexOf(Math.max(...probabilities));
            confidence = probabilities[predictedIndex];
        } else {
            // Binary classification
            confidence = probabilities[0];
            predictedIndex = confidence > 0.5 ? 1 : 0;
        }

        const predictedLabel = Array.from(this.labelEncoder.entries())
            .find(([_, index]) => index === predictedIndex)?.[0] || 'unknown';

        input.dispose();
        prediction.dispose();

        return { label: predictedLabel, confidence };
    }

    /**
     * Save model to downloads
     */
    async saveModel(name: string = 'text-classifier'): Promise<void> {
        if (!this.model) {
            throw new Error('No model to save');
        }

        await this.model.save(`downloads://${name}`);

        // Save tokenizer and label encoder
        const metadata = {
            tokenizer: Object.fromEntries(this.tokenizer),
            labelEncoder: Object.fromEntries(this.labelEncoder),
            config: this.config
        };

        const blob = new Blob([JSON.stringify(metadata, null, 2)],
            { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${name}-metadata.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    /**
     * Load model from files
     */
    async loadModel(modelUrl: string, metadataUrl: string): Promise<void> {
        this.model = await tf.loadLayersModel(modelUrl);

        const response = await fetch(metadataUrl);
        const metadata = await response.json();

        this.tokenizer = new Map(Object.entries(metadata.tokenizer));
        this.labelEncoder = new Map(Object.entries(metadata.labelEncoder));
        this.config = { ...this.config, ...metadata.config };
    }

    /**
     * Get model info
     */
    getModelInfo(): any {
        return {
            vocabularySize: this.tokenizer.size,
            numClasses: this.labelEncoder.size,
            labels: Array.from(this.labelEncoder.keys()),
            config: this.config
        };
    }
}