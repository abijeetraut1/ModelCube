import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardFooter, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet";
import { Package } from 'lucide-react';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from 'sonner';
import { useState, useEffect, useRef } from 'react';
import TextClassification from './TrainModel/TextClassification';
import TrainedMlPrompt from './components/Prompt/TrainedMlPrompt';

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

export default function TrainModel() {
    const [datasetPath, setDatasetPath] = useState(null);
    const [trainedModel, setTrainedModel] = useState(null);
    const [predictFn, setPredictFn] = useState(null);
    const [testInput, setTestInput] = useState("");
    const chatRef = useRef(null);
    const [testingChats, setTestingChats] = useState([]);
    const [testModel, setTestModel] = useState(false);

    useEffect(() => {
        if (!chatRef.current) return;
        chatRef.current.style.height = "auto";
        chatRef.current.style.height = `${Math.min(chatRef.current.scrollHeight, 256)}px`;
    }, [testInput]);

    const adjustHeight = () => {
        const textarea = chatRef.current
        if (!textarea) return

        textarea.style.height = "auto"

        const newHeight = Math.min(textarea.scrollHeight, 256)
        textarea.style.height = `${newHeight}px`
    }

    useEffect(() => {
        adjustHeight()
    }, [testInput])


    const [params, setParams] = useState({
        trainingType: "text-classification",
        epochs: 10,
        batchSize: 32,
        optimizer: "adam",
        learningRate: 0.001,
        dropoutRate: 0.5,
        embeddingDim: 64,
        maxLength: 100
    });

    const handleSelect = async () => {
        try {
            const connectionResponse = await window.electronAPI.openDatasetFile();
            if (connectionResponse.status == 200) {
                setDatasetPath(connectionResponse.filePath);
            }
        } catch (error) {
            console.error("Error selecting dataset file:", error);
            toast.error("An unexpected error occurred while selecting the dataset file.");
        }
    };

    const handleTrainModel = async () => {
        if (!datasetPath) {
            toast.error("Please Select Dataset", {
                description: "Training Dataset is not selected"
            });
            return;
        }

        window.electronAPI.ipcRenderer.send("start-dataset-extration");
    };

    useEffect(() => {
        window.electronAPI.ipcRenderer.on("extract-dataset", async (event, payload) => {
            if (event.status == 200) {
                console.log(event, payload)
                const result = await TextClassification(event.data, params);
                if (result?.model) {
                    setTrainedModel(result.model);
                    setPredictFn(() => result.predictText);
                    // Save metadata for later use
                    localStorage.setItem("textMeta", JSON.stringify({
                        wordToIndex: result.wordToIndex,
                        maxLength: result.maxLength,
                        uniqueLabels: result.uniqueLabels
                    }));
                    toast.success("Training complete! You can now download or test the model.");
                }
            }
        });
    }, [params]);



    const handleTestModel = () => {
        if (!predictFn) {
            toast.error("Train the model first!");
            return;
        }
        const prediction = predictFn(testInput);

        setTestingChats(prev => [...prev, {
            prompt: testInput,
            response: prediction,
        }])

        // toast.info(`Prediction: ${prediction.label} (${(prediction.confidence * 100).toFixed(1)}%)`);


        console.log(prediction);
    };


    const handleDownload = async () => {
        if (trainedModel) {
            await trainedModel?.save('downloads://text-classification-model');
            toast.success("Model Saved", {
                description: "Now you can use the model"
            });
        } else {
            toast.error("No trained model available.");
        }
    };

    return (
        <div className='space-y-2'>
            <div className="max-w-4xl px-4 mx-auto space-y-2 sm:px-6 lg:px-8 py-8">
                <Card className="w-full">
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Package className="w-5 h-5" />
                            <span>Train Model</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="w-full">
                                    <Label className='mb-2'>Choose Dataset</Label>
                                    <div className='flex justify-between w-full'>
                                        <Button onClick={handleSelect} className='w-full' variant={'outline'}>
                                            {datasetPath || "Choose Dataset"}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className='flex justify-between items-end w-full'>
                        <div>
                            <Sheet>
                                <SheetTrigger>
                                    <Button>Change Parameters</Button>
                                </SheetTrigger>
                                <SheetContent>
                                    <SheetHeader>
                                        <SheetTitle>Training Parameters</SheetTitle>
                                        <SheetDescription>
                                            Adjust your training parameters before starting model training.
                                        </SheetDescription>
                                    </SheetHeader>
                                    <div className="grid gap-4 px-4">
                                        {/* Training Type */}
                                        <div>
                                            <Label className='mb-2'>Select Training Type</Label>
                                            <Select
                                                value={params.trainingType}
                                                onValueChange={(v) => setParams(p => ({ ...p, trainingType: v }))}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Training Type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        <SelectLabel>Text Dataset Train Type</SelectLabel>
                                                        <SelectItem value="text-classification">Text Classification</SelectItem>
                                                        <SelectItem value="text-generation">Text Generation</SelectItem>
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Epochs */}
                                        <div>
                                            <Label className='mb-2'>Epochs</Label>
                                            <Input
                                                type="number"
                                                value={params.epochs}
                                                onChange={(e) => setParams(p => ({ ...p, epochs: Number(e.target.value) }))}
                                            />
                                        </div>

                                        {/* Batch Size */}
                                        <div>
                                            <Label className='mb-2'>Batch Size</Label>
                                            <Input
                                                type="number"
                                                value={params.batchSize}
                                                onChange={(e) => setParams(p => ({ ...p, batchSize: Number(e.target.value) }))}
                                            />
                                        </div>

                                        {/* Optimizer */}
                                        <div>
                                            <Label className='mb-2'>Optimizer</Label>
                                            <Select
                                                value={params.optimizer}
                                                onValueChange={(v) => setParams(p => ({ ...p, optimizer: v }))}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Optimizer" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="adam">Adam</SelectItem>
                                                    <SelectItem value="sgd">SGD</SelectItem>
                                                    <SelectItem value="rmsprop">RMSProp</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Learning Rate */}
                                        <div>
                                            <Label className='mb-2'>Learning Rate</Label>
                                            <Input
                                                type="number"
                                                step="0.0001"
                                                value={params.learningRate}
                                                onChange={(e) => setParams(p => ({ ...p, learningRate: Number(e.target.value) }))}
                                            />
                                        </div>

                                        {/* Dropout Rate */}
                                        <div>
                                            <Label className='mb-2'>Dropout Rate</Label>
                                            <Input
                                                type="number"
                                                step="0.1"
                                                min="0"
                                                max="1"
                                                value={params.dropoutRate}
                                                onChange={(e) => setParams(p => ({ ...p, dropoutRate: Number(e.target.value) }))}
                                            />
                                        </div>

                                        {/* Embedding Dimensions */}
                                        <div>
                                            <Label className='mb-2'>Embedding Dimension</Label>
                                            <Input
                                                type="number"
                                                value={params.embeddingDim}
                                                onChange={(e) => setParams(p => ({ ...p, embeddingDim: Number(e.target.value) }))}
                                            />
                                        </div>

                                        {/* Max Sequence Length */}
                                        <div>
                                            <Label className='mb-2'>Max Sequence Length</Label>
                                            <Input
                                                type="number"
                                                value={params.maxLength}
                                                onChange={(e) => setParams(p => ({ ...p, maxLength: Number(e.target.value) }))}
                                            />
                                        </div>
                                    </div>

                                    <SheetFooter className='flex flex-row w-full'>
                                        <Button
                                            className='w-1/2'
                                            variant='destructive'
                                            onClick={() => setParams({
                                                trainingType: "text-classification",
                                                epochs: 10,
                                                batchSize: 32,
                                                optimizer: "adam",
                                                learningRate: 0.001,
                                                dropoutRate: 0.5,
                                                embeddingDim: 64,
                                                maxLength: 100
                                            })}
                                        >
                                            Reset
                                        </Button>
                                        <Button className='w-1/2' onClick={() => toast.success("Parameters updated!")}>
                                            Update
                                        </Button>
                                    </SheetFooter>
                                </SheetContent>
                            </Sheet>
                        </div>
                        <div className='flex gap-2'>
                            {trainedModel &&
                                <>
                                    <Button variant="outline" onClick={() => setTestModel(!testModel)}>Test Model</Button>
                                    <Button variant="outline" onClick={handleDownload}>Download Model</Button>
                                </>
                            }
                            <Button variant="outline" onClick={handleTrainModel}>Train Model</Button>
                        </div>
                    </CardFooter>
                </Card>


                {testModel && <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <span>Test Model</span>
                        </CardTitle>
                    </CardHeader>

                    <CardContent>
                        <div className='my-2'>
                            {/* {responseRef.current} */}
                            {testingChats && testingChats.map((el, i) => (
                                <div key={i} className='py-1 flex gap-2 flex-col'>
                                    <div className='flex  justify-end w-full '>
                                        <Card className=' py-1 w-fit '>
                                            <CardContent className='py-1'>
                                                {el.prompt}
                                            </CardContent>
                                        </Card>
                                    </div>

                                    <div className='flex w-full '>
                                        <Card className='w-fit py-1'>
                                            <CardContent className='py-1 flex  flex-col'>
                                                <div className='w-full'>
                                                    {el.response.label} : ({el.response.confidence})
                                                </div>


                                                <div>
                                                    <Accordion type="single" collapsible>
                                                        <AccordionItem value="item-1">
                                                            <AccordionTrigger>Probabilities</AccordionTrigger>
                                                            <AccordionContent>
                                                                <ul className="list-disc [&>li]:mt-2">
                                                                    {Object.entries(el.response.probabilities).map(([key, value], i) => (
                                                                        <li key={i} className='space-x-2'>
                                                                            <span className='capitalize text-secondary-foreground'>{key}</span>
                                                                            <span>:</span>
                                                                            <span>{value}</span>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </AccordionContent>
                                                        </AccordionItem>
                                                    </Accordion>
                                                </div>

                                            </CardContent>
                                        </Card>
                                    </div>

                                </div>
                            ))}
                        </div>

                        {trainedModel && (
                            <div className="space-y-2">
                                <div className="flex gap-2">

                                    <TrainedMlPrompt
                                        chatRef={chatRef}
                                        input={testInput}
                                        setInput={setTestInput}
                                        onSubmit={handleTestModel}
                                    />
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>}

                <div id='train-logger-container' className='space-y-2'></div>
            </div>
        </div>
    );
}
