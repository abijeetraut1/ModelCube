import { toast } from "sonner";
import DomWrapperCreator from "../components/DomWrapper";

export default async function TextClassification(dataset, params) {
    console.log(dataset, params);

    // Wait for TensorFlow.js to load
    if (typeof window.tf === 'undefined') {
        toast.error("Connect to internet - TensorFlow.js not loaded");
        return null;
    }

    const tf = window.tf;

    try {
        // Validate dataset structure
        if (!dataset || !Array.isArray(dataset) || dataset.length === 0) {
            toast.error("Invalid dataset: Please provide a non-empty array");
            return null;
        }

        const hasText = dataset.every(item => item.text && typeof item.text === 'string');
        const hasLabels = dataset.every(item => item.label !== undefined);

        if (!hasText || !hasLabels) {
            toast.error("Dataset must contain 'text' and 'label' fields for each item");
            return null;
        }

        toast.info("Processing dataset...");

        // Extract texts and labels
        const texts = dataset.map(item => item.text);
        const labels = dataset.map(item => item.label);

        // Get unique labels and create label mapping
        const uniqueLabels = [...new Set(labels)];
        const numClasses = uniqueLabels.length;
        const labelToIndex = {};
        uniqueLabels.forEach((label, index) => {
            labelToIndex[label] = index;
        });

        // Create a simple bag-of-words approach instead of sequences
        const allWords = new Set();
        const processedTexts = texts.map(text => {
            const words = text.toLowerCase()
                .replace(/[^\w\s]/g, ' ')
                .split(/\s+/)
                .filter(word => word.length > 2); // Only words longer than 2 chars
            words.forEach(word => allWords.add(word));
            return words;
        });

        // Create vocabulary from most common words
        const wordFreq = {};
        processedTexts.forEach(words => {
            words.forEach(word => {
                wordFreq[word] = (wordFreq[word] || 0) + 1;
            });
        });

        // Sort by frequency and take top words
        const sortedWords = Object.entries(wordFreq)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 200) // Use only top 200 words
            .map(([word]) => word);

        // Create bag-of-words vectors
        const bagOfWordsVectors = processedTexts.map(words => {
            const vector = new Array(sortedWords.length).fill(0);
            words.forEach(word => {
                const index = sortedWords.indexOf(word);
                if (index !== -1) {
                    vector[index] = 1; // Binary presence (could also use frequency)
                }
            });
            return vector;
        });

        // Shuffle dataset
        const shuffledIndices = Array.from({length: dataset.length}, (_, i) => i);
        for (let i = shuffledIndices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledIndices[i], shuffledIndices[j]] = [shuffledIndices[j], shuffledIndices[i]];
        }

        const shuffledVectors = shuffledIndices.map(i => bagOfWordsVectors[i]);
        const shuffledLabels = shuffledIndices.map(i => labels[i]);

        // Check class distribution
        const classCount = {};
        shuffledLabels.forEach(label => {
            classCount[label] = (classCount[label] || 0) + 1;
        });

        // Convert to tensors
        const inputTensor = tf.tensor2d(shuffledVectors);
        const labelIndices = shuffledLabels.map(label => labelToIndex[label]);
        const labelTensor = tf.oneHot(labelIndices, numClasses);

        // Simple train/test split
        const trainSize = Math.max(Math.floor(dataset.length * 0.75), 1);
        const xTrain = inputTensor.slice([0, 0], [trainSize, sortedWords.length]);
        const yTrain = labelTensor.slice([0, 0], [trainSize, numClasses]);
        const xVal = trainSize < dataset.length ? inputTensor.slice([trainSize, 0], [-1, sortedWords.length]) : null;
        const yVal = trainSize < dataset.length ? labelTensor.slice([trainSize, 0], [-1, numClasses]) : null;

        // Calculate class weights to handle imbalance
        const totalSamples = dataset.length;
        const classWeights = {};
        uniqueLabels.forEach(label => {
            const count = classCount[label];
            classWeights[labelToIndex[label]] = totalSamples / (numClasses * count);
        });

        // Build a simple neural network model
        const model = tf.sequential({
            layers: [
                tf.layers.dense({
                    inputShape: [sortedWords.length],
                    units: 32,
                    activation: 'relu',
                    kernelRegularizer: tf.regularizers.l2({ l2: 0.001 })
                }),
                tf.layers.dropout({ rate: 0.3 }),
                tf.layers.dense({
                    units: 16,
                    activation: 'relu',
                    kernelRegularizer: tf.regularizers.l2({ l2: 0.001 })
                }),
                tf.layers.dropout({ rate: 0.2 }),
                tf.layers.dense({
                    units: numClasses,
                    activation: numClasses > 2 ? 'softmax' : 'sigmoid'
                })
            ]
        });

        // Compile the model
        const optimizer = tf.train.adam(0.005);  // Adjust learning rate for smoother training
        model.compile({
            optimizer: optimizer,
            loss: numClasses > 2 ? 'categoricalCrossentropy' : 'binaryCrossentropy',
            metrics: ['accuracy']
        });

        // Train the model
        const trainingLogs = [];
        const maxEpochs = 100;
        const validationData = (xVal && yVal) ? [xVal, yVal] : null;
        
        const history = await model.fit(xTrain, yTrain, {
            epochs: maxEpochs,
            batchSize: Math.max(Math.floor(trainSize / 3), 1),
            validationData: validationData,
            shuffle: true,
            verbose: 0,
            classWeight: classWeights,
            callbacks: {
                onEpochEnd: (epoch, logs) => {
                    const accuracy = logs.accuracy || logs.acc || 0;
                    const loss = logs.loss || 0;
                    const valAccuracy = logs.val_accuracy || logs.val_acc || 0;
                    const valLoss = logs.val_loss || 0;

                    if ((epoch + 1) % 10 === 0 || epoch === 0 || epoch === maxEpochs - 1) {
                        trainingLogs.push({ 
                            epoch: epoch + 1,
                            loss: loss.toFixed(4), 
                            accuracy: accuracy.toFixed(4),
                            val_loss: validationData ? valLoss.toFixed(4) : 'N/A',
                            val_accuracy: validationData ? valAccuracy.toFixed(4) : 'N/A'
                        });
                    }
                }
            }
        });

        // Prediction function with a threshold for confidence
        const predictText = (text) => {
            if (!text || text.trim().length === 0) {
                return {
                    label: uniqueLabels[0], // Default to the first label (e.g., "positive")
                    confidence: 1 / numClasses, // Even confidence
                    probabilities: Object.fromEntries(uniqueLabels.map(label => [label, 1 / numClasses]))
                };
            }

            const words = text.toLowerCase().replace(/[^\w\s]/g, ' ').split(/\s+/).filter(word => word.length > 2);
            const vector = new Array(sortedWords.length).fill(0);
            words.forEach(word => {
                const index = sortedWords.indexOf(word);
                if (index !== -1) {
                    vector[index] = 1;
                }
            });

            const inputTensor = tf.tensor2d([vector]);
            const prediction = model.predict(inputTensor);
            const probabilities = prediction.dataSync();
            
            const maxProb = Math.max(...probabilities);
            const predictedIndex = probabilities.indexOf(maxProb);
            const predictedLabel = uniqueLabels[predictedIndex];
            const confidence = maxProb;

            // Apply a threshold (e.g., only make prediction if confidence is greater than 0.7)
            if (confidence < 0.7) {
                return {
                    label: "uncertain", // For low-confidence predictions, return "uncertain"
                    confidence: confidence,
                    probabilities: Object.fromEntries(uniqueLabels.map((label, index) => [label, probabilities[index]]))
                };
            }

            inputTensor.dispose();
            prediction.dispose();

            return {
                label: predictedLabel,
                confidence: confidence,
                probabilities: Object.fromEntries(uniqueLabels.map((label, index) => [label, probabilities[index]]))
            };
        };

        // Return the model, prediction function, and training logs
        DomWrapperCreator("Training Logs", trainingLogs);

        return {
            model,
            predictText,
            uniqueLabels,
            vocabulary: sortedWords,
            labelToIndex,
            history: history.history,
            trainingLogs
        };

    } catch (error) {
        console.error("Error in text classification:", error);
        toast.error(`Classification failed: ${error.message}`);
        return null;
    }
}
