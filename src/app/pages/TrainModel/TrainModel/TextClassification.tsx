import { toast } from "sonner";
import DomWrapperCreator from "../components/DomWrapper";




export default async function TextClassification(dataset, params) {

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

        // Check if dataset has required structure
        const hasText = dataset.every(item => item.text && typeof item.text === 'string');
        const hasLabels = dataset.every(item => item.label !== undefined);

        if (!hasText) {
            toast.error("Dataset must contain 'text' field for each item");
            return null;
        }

        if (!hasLabels) {
            toast.error("Dataset must contain 'label' field for each item");
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


        // DomWrapperCreator("Unique labels", uniqueLabels);
        // DomWrapperCreator("Number of classes", numClasses);


        // console.log("Unique labels:", uniqueLabels);
        // console.log("Number of classes:", numClasses);

        // Simple tokenization and vocabulary building
        const vocabulary = new Set();
        const tokenizedTexts = texts.map(text => {
            const tokens = text.toLowerCase()
                .replace(/[^\w\s]/g, ' ')
                .split(/\s+/)
                .filter(token => token.length > 0);
            tokens.forEach(token => vocabulary.add(token));
            return tokens;
        });

        const vocabArray = Array.from(vocabulary);
        const vocabSize = Math.min(vocabArray.length, 10000); // Limit vocab size
        const wordToIndex = {};
        vocabArray.slice(0, vocabSize).forEach((word, index) => {
            wordToIndex[word] = index + 1; // Reserve 0 for padding
        });

        // console.log("Vocabulary size:", vocabSize);
        // DomWrapperCreator("Vocabulary size", vocabSize);


        // Convert texts to sequences
        const maxLength = params.maxLength; // Maximum sequence length
        const sequences = tokenizedTexts.map(tokens => {
            const sequence = tokens
                .map(token => wordToIndex[token] || 0)
                .slice(0, maxLength);

            // Pad sequence
            while (sequence.length < maxLength) {
                sequence.push(0);
            }
            return sequence;
        });

        // Convert labels to one-hot encoding
        const labelIndices = labels.map(label => labelToIndex[label]);
        const oneHotLabels = tf.oneHot(labelIndices, numClasses);

        // Create tensors
        const inputTensor = tf.tensor2d(sequences);
        const labelTensor = oneHotLabels;

        // // console.log("Input tensor shape:", inputTensor.shape);
        // DomWrapperCreator("Input tensor shape", inputTensor.shape);

        // // console.log("Label tensor shape:", labelTensor.shape);
        // DomWrapperCreator("Label tensor shape", labelTensor.shape);


        // Split data into training and validation sets (80/20 split)
        const trainSize = Math.floor(dataset.length * 0.8);
        const xTrain = inputTensor.slice([0, 0], [trainSize, maxLength]);
        const yTrain = labelTensor.slice([0, 0], [trainSize, numClasses]);
        const xVal = inputTensor.slice([trainSize, 0], [-1, maxLength]);
        const yVal = labelTensor.slice([trainSize, 0], [-1, numClasses]);

        toast.info("Building model...");

        // Create a simple neural network model
        const model = tf.sequential({
            layers: [
                tf.layers.embedding({
                    inputDim: vocabSize + 1,
                    outputDim: params.embeddingDim,
                    inputLength: maxLength
                }),
                tf.layers.globalAveragePooling1d(),
                tf.layers.dense({
                    units: 64,
                    activation: 'relu'
                }),
                tf.layers.dropout({ rate: params.dropoutRate }),
                tf.layers.dense({
                    units: numClasses,
                    activation: numClasses > 2 ? 'softmax' : 'sigmoid'
                })
            ]
        });

        // Compile the model
        model.compile({
            optimizer: params.optimizer === "adam"
                ? tf.train.adam(params.learningRate)
                : params.optimizer === "sgd"
                    ? tf.train.sgd(params.learningRate)
                    : tf.train.rmsprop(params.learningRate),
            loss: numClasses > 2 ? 'categoricalCrossentropy' : 'binaryCrossentropy',
            metrics: ['accuracy']
        });

        console.log("Model summary:");
        model.summary();

        toast.info("Training model...");

        let trainingLogs = [];

        // Train the model
        const history = await model.fit(xTrain, yTrain, {
            epochs: params.epochs,
            batchSize: params.batchSize,
            validationData: [xVal, yVal],
            callbacks: {
                onEpochEnd: (epoch, logs) => {
                    // DomWrapperCreator();
                    trainingLogs.push({ loss: logs.loss.toFixed(4), accuracy: logs.acc.toFixed(4) })
                    console.log(`Epoch ${epoch + 1}: loss = ${logs.loss.toFixed(4)}, accuracy = ${logs.acc.toFixed(4)}`);
                    toast.info(`Training: Epoch ${epoch + 1}/10 - Accuracy: ${(logs.acc * 100).toFixed(1)}%`);
                }
            }
        });

        // console.log(history, accuracy);
        // const trainingObject = history.history.map((el, i) => ({ acc: el.acc[i], loss: el.loss[i] }));
        // console.log(trainingLogs);
        DomWrapperCreator("Terminology", trainingLogs);

        // trainingLogs[0].forEach(element => {
        // console.log(element.key())
        // Object.entries(trainingLogs[0]).forEach(([key, value], i) => {
        //     // console.log(`Index: ${i}, Key: ${key}`);
        //     console.log({
        //         [key]: {
        //             label: key,
        //             color: `var(--chart-${i})`
        //         }
        //     })
        // });

        // });

        toast.success("Model training completed!");

        // Function to predict new text
        const predictText = (text) => {
            const tokens = text.toLowerCase()
                .replace(/[^\w\s]/g, ' ')
                .split(/\s+/)
                .filter(token => token.length > 0);

            const sequence = tokens
                .map(token => wordToIndex[token] || 0)
                .slice(0, maxLength);

            while (sequence.length < maxLength) {
                sequence.push(0);
            }

            const inputTensor = tf.tensor2d([sequence]);
            const prediction = model.predict(inputTensor);
            const probabilities = prediction.dataSync();

            const predictedIndex = probabilities.indexOf(Math.max(...probabilities));
            const predictedLabel = uniqueLabels[predictedIndex];
            const confidence = probabilities[predictedIndex];

            inputTensor.dispose();
            prediction.dispose();

            return {
                label: predictedLabel,
                confidence: confidence,
                probabilities: Object.fromEntries(
                    uniqueLabels.map((label, index) => [label, probabilities[index]])
                )
            };
        };

        // Clean up tensors
        inputTensor.dispose();
        labelTensor.dispose();
        xTrain.dispose();
        yTrain.dispose();
        xVal.dispose();
        yVal.dispose();
        oneHotLabels.dispose();

        // Return the trained model and utilities
        return {
            model,
            predictText,
            uniqueLabels,
            vocabulary: vocabArray,
            labelToIndex,
            wordToIndex,
            maxLength,
            history: history.history
        };

    } catch (error) {
        console.error("Error in text classification:", error);
        toast.error(`Classification failed: ${error.message}`);
        return null;
    }
}