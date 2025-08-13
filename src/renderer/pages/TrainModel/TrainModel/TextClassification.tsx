import { toast } from "sonner";
import DomWrapperCreator from "../components/DomWrapper";

function tokenizeTexts(texts, wordToIndex, maxLength) {
    return texts.map(text => {
        const tokens = text.toLowerCase().split(/\s+/).map(word => wordToIndex[word] || 0);
        const padded = new Array(maxLength).fill(0);
        for (let i = 0; i < Math.min(tokens.length, maxLength); i++) {
            padded[i] = tokens[i];
        }
        return padded;
    });
}

export default async function TextClassification(dataset, params) {
    const texts = dataset.map(d => d.text);
    const labels = dataset.map(d => d.label);

    if (!tf) return;

    // Encode labels
    const uniqueLabels = [...new Set(labels)];
    const labelToIndex = {};
    uniqueLabels.forEach((l, i) => labelToIndex[l] = i);
    const yData = labels.map(l => labelToIndex[l]);
    const yTensor = tf.oneHot(tf.tensor1d(yData, 'int32'), uniqueLabels.length);

    // Build vocabulary
    const wordToIndex = {};
    let index = 1; // 0 reserved for padding
    texts.forEach(text => {
        text.toLowerCase().split(/\s+/).forEach(word => {
            if (!wordToIndex[word]) {
                wordToIndex[word] = index++;
            }
        });
    });

    // Tokenize & pad
    const xData = tokenizeTexts(texts, wordToIndex, params.maxLength);
    const xTensor = tf.tensor2d(xData, [xData.length, params.maxLength]);

    // Define model
    const model = tf.sequential();
    model.add(tf.layers.embedding({
        inputDim: Object.keys(wordToIndex).length + 1,
        outputDim: params.embeddingDim,
        inputLength: params.maxLength
    }));
    model.add(tf.layers.dropout({ rate: params.dropoutRate }));
    model.add(tf.layers.lstm({ units: 16 }));
    model.add(tf.layers.dropout({ rate: params.dropoutRate }));
    model.add(tf.layers.dense({ units: uniqueLabels.length, activation: 'softmax' }));

    // Compile
    model.compile({
        optimizer: tf.train.adam(params.learningRate),
        loss: 'categoricalCrossentropy',
        metrics: ['accuracy']
    });

    // Train
    await model.fit(xTensor, yTensor, {
        epochs: params.epochs,
        batchSize: params.batchSize,
        validationSplit: 0.2,
        shuffle: true
    });

    // Predict function
    function predictText(inputText) {
        const seq = tokenizeTexts([inputText], wordToIndex, params.maxLength);
        const pred = model.predict(tf.tensor2d(seq, [1, params.maxLength]));
        const idx = pred.argMax(-1).dataSync()[0];
        return uniqueLabels[idx];
    }

    console.log(model)

    return {
        model,
        predictText,
        wordToIndex,
        maxLength: params.maxLength,
        uniqueLabels
    };
}