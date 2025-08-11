// @ts-nocheck
"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitlem, CardFooter, CardTitle } from "@/components/ui/card"
import { ArrowLeft, CloudLightning, Download, Cpu, MemoryStick, Settings as settingIcon, Zap, Shuffle, BrainCircuit, FileEdit } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import RESET_DEFAULTS from "@/constant/defaultParameters";
import axios from "axios";
import { toast } from "sonner";
import { fetchSettings, updateSettings } from "@/lib/Database/settings";

export default function Settings() {

    const [updatedParameters, setUpdateParameters] = useState({
        downloadDirectory: '',
        modelFile: null,
        systemPrompt: '',
        batchSize: 128,
        threads: 4,
        optimizedMatrixMultiplication: true,
        contextSize: 0,
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
    });

    useEffect(() => {

        (async () => {
            const settings = await fetchSettings();

            if (settings?.status == 200) {
                setUpdateParameters(settings.response);
            }
            console.log(updatedParameters)
        })();

    }, []);

    const updateParameters = (field, value) => {
        console.log(field, value)
        setUpdateParameters((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const resetParameters = () => {
        setUpdateParameters(RESET_DEFAULTS);
        toast.success("Default Value Updated");
    }

    const sendUpdateParameters = async () => {
        // 1️⃣ Validation
        if (updatedParameters.contextSize > 4096) {
            toast.warning("Context size must be less then 4096");
            return;
        }

        if (updatedParameters.batchSize < 1 || updatedParameters.batchSize > 512) {
            toast.warning("Batch size must be between 1 and 512");
            return;
        }

        if (updatedParameters.threads < 1 || updatedParameters.threads > 32) {
            toast.warning("Threads must be between 1 and 32");
            return;
        }

        if (updatedParameters.ropeFrequencyBase < 1000) {
            toast.warning("RoPE Frequency Base must be at least 1000");
            return;
        }

        if (updatedParameters.ropeFrequencyScale < 0.1 || updatedParameters.ropeFrequencyScale > 10) {
            toast.warning("RoPE Frequency Scale must be between 0.1 and 10");
            return;
        }

        if (updatedParameters.gpuLayers < 0 || updatedParameters.gpuLayersAlternative < 0) {
            toast.warning("GPU Layers must be non-negative");
            return;
        }

        if (updatedParameters.randomSeed < 0) {
            toast.warning("Random seed must be non-negative");
            return;
        }

        await updateSettings(updatedParameters);

    };


    return (
        <div >
            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="space-y-4">

                    {/* Page Header */}
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
                        <p className="text-muted-foreground mt-2">
                            Manage your account settings.
                        </p>
                    </div>

                    {/* Model */}
                    <Card className="w-full opacity-50 select-none cursor-not-allowed" aria-disabled >

                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Download className="w-5 h-5" />
                                <span>Model</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="text-sm font-medium">Download Directory</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Change the Model Download Directory
                                        </p>
                                    </div>
                                    <div className="max-w-1/3 w-full">
                                        <Input
                                            type="text"
                                            className="w-full"
                                            value={updatedParameters?.downloadDirectory}
                                            onChange={(e) => updateParameters('downloadDirectory', e.target.value)}
                                            placeholder="Enter download directory path"
                                            disabled
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="text-sm font-medium">Model File</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Upload the model file (.gguf)
                                        </p>
                                    </div>
                                    <div className="max-w-1/3 w-full">
                                        <Input
                                            type="file"
                                            className="w-full"
                                            accept=".gguf"
                                            disabled
                                            onChange={(e) => {
                                                if (e.target.files && e.target.files[0]) {
                                                    updateParameters('modelFile', e.target.files[0]);
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* System Prompt Instructions */}
                    <Card className=" w-full">
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <BrainCircuit className="w-5 h-5" />
                                <span>System Prompt Instructions</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 gap-6">
                                <div className="space-y-2">
                                    <label htmlFor="system-prompt" className="text-sm font-medium">
                                        System Prompt
                                    </label>
                                    <Textarea
                                        id="system-prompt"
                                        value={updatedParameters?.systemPrompt}
                                        onChange={(e) => updateParameters('systemPrompt', e.target.value)}
                                        placeholder="Write detailed instructions for the system prompt here..."
                                        className="w-full resize-none"
                                        rows={6}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Performance Tuning */}
                    <Card className="w-full  "  >
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Zap className="w-5 h-5" />
                                <span>Performance Tuning</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Batch Size</label>
                                    <Input
                                        type="number"
                                        value={updatedParameters?.batchSize}
                                        onChange={(e) => updateParameters('batchSize', parseInt(e.target.value))}
                                        className="w-full"
                                    />
                                    <p className="text-xs text-muted-foreground">Processing batch size for optimal throughput</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Threads</label>
                                    <Input
                                        type="number"
                                        value={updatedParameters?.threads}
                                        onChange={(e) => updateParameters('threads', parseInt(e.target.value))}
                                        className="w-full"
                                    />
                                    <p className="text-xs text-muted-foreground">Number of CPU threads for processing</p>
                                </div>
                            </div>
                            <div className="pt-4 border-t">
                                <div className="flex items-center justify-between p-3 border rounded-lg">
                                    <div>
                                        <p className="text-sm font-medium">Optimized Matrix Multiplication</p>
                                        <p className="text-xs text-muted-foreground">Enable faster computation algorithms</p>
                                    </div>
                                    <Switch
                                        checked={updatedParameters?.optimizedMatrixMultiplication}
                                        onCheckedChange={(checked) => updateParameters('optimizedMatrixMultiplication', checked)}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Memory Management */}
                    <Card className="w-full  "  >
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <MemoryStick className="w-5 h-5" />
                                <span>Memory Management</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Context Size</label>
                                <Input
                                    type="number"
                                    value={updatedParameters?.contextSize}
                                    onChange={(e) => updateParameters('contextSize', parseInt(e.target.value))}
                                    className="w-full"
                                    max={4096}
                                />
                                <p className="text-xs text-muted-foreground">Context window size in tokens</p>
                            </div>
                            <div className="pt-4 border-t">
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="flex items-center justify-between p-3 border rounded-lg">
                                        <div>
                                            <p className="text-sm font-medium">Memory Locking (MLock)</p>
                                            <p className="text-xs text-muted-foreground">Lock model in RAM to prevent swapping</p>
                                        </div>
                                        <Switch
                                            checked={updatedParameters?.memoryLocking}
                                            onCheckedChange={(checked) => updateParameters('memoryLocking', checked)}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between p-3 border rounded-lg">
                                        <div>
                                            <p className="text-sm font-medium">Memory Mapping (MMap)</p>
                                            <p className="text-xs text-muted-foreground">Enable memory mapping for efficient loading</p>
                                        </div>
                                        <Switch
                                            checked={updatedParameters?.memoryMapping}
                                            onCheckedChange={(checked) => updateParameters('memoryMapping', checked)}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between p-3 border rounded-lg">
                                        <div>
                                            <p className="text-sm font-medium">Low VRAM Mode</p>
                                            <p className="text-xs text-muted-foreground">Optimize for systems with limited VRAM</p>
                                        </div>
                                        <Switch
                                            checked={updatedParameters?.lowVramMode}
                                            onCheckedChange={(checked) => updateParameters('lowVramMode', checked)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Model Precision and Numerical Settings */}
                    <Card className="w-full  "  >
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <settingIcon className="w-5 h-5" />
                                <span>Model Precision and Numerical Settings</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">RoPE Frequency Base</label>
                                    <Input
                                        type="number"
                                        value={updatedParameters?.ropeFrequencyBase}
                                        onChange={(e) => updateParameters('ropeFrequencyBase', parseInt(e.target.value))}
                                        className="w-full"
                                    />
                                    <p className="text-xs text-muted-foreground">Base frequency for rotary position encoding</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">RoPE Frequency Scale</label>
                                    <Input
                                        type="number"
                                        step="0.1"
                                        value={updatedParameters?.ropeFrequencyScale}
                                        onChange={(e) => updateParameters('ropeFrequencyScale', parseFloat(e.target.value))}
                                        className="w-full"
                                    />
                                    <p className="text-xs text-muted-foreground">Scaling factor for RoPE frequencies</p>
                                </div>
                            </div>
                            <div className="pt-4 border-t">
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="flex items-center justify-between p-3 border rounded-lg">
                                        <div>
                                            <p className="text-sm font-medium">Half-precision KV Cache (F16)</p>
                                            <p className="text-xs text-muted-foreground">Use 16-bit precision for key-value cache</p>
                                        </div>
                                        <Switch
                                            checked={updatedParameters?.halfPrecisionKvCache}
                                            onCheckedChange={(checked) => updateParameters('halfPrecisionKvCache', checked)}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between p-3 border rounded-lg">
                                        <div>
                                            <p className="text-sm font-medium">Output All Logits</p>
                                            <p className="text-xs text-muted-foreground">Return logits for all tokens</p>
                                        </div>
                                        <Switch
                                            checked={updatedParameters?.outputAllLogits}
                                            onCheckedChange={(checked) => updateParameters('outputAllLogits', checked)}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between p-3 border rounded-lg">
                                        <div>
                                            <p className="text-sm font-medium">Vocabulary Only Mode</p>
                                            <p className="text-xs text-muted-foreground">Load only vocabulary without weights</p>
                                        </div>
                                        <Switch
                                            checked={updatedParameters?.vocabularyOnlyMode}
                                            onCheckedChange={(checked) => updateParameters('vocabularyOnlyMode', checked)}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between p-3 border rounded-lg">
                                        <div>
                                            <p className="text-sm font-medium">Embedding Mode</p>
                                            <p className="text-xs text-muted-foreground">Use model for embeddings only</p>
                                        </div>
                                        <Switch
                                            checked={updatedParameters?.embeddingMode}
                                            onCheckedChange={(checked) => updateParameters('embeddingMode', checked)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* GPU/CPU Resource Allocation */}
                    <Card className="w-full  opacity-50 select-none cursor-not-allowed" aria-disabled >
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Cpu className="w-5 h-5" />
                                <span>GPU/CPU Resource Allocation</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">GPU Layers</label>
                                    <Input
                                        type="number"
                                        value={updatedParameters?.gpuLayers}
                                        onChange={(e) => updateParameters('gpuLayers', parseInt(e.target.value))}
                                        className="w-full"
                                        disabled
                                    />
                                    <p className="text-xs text-muted-foreground">Number of model layers to offload to GPU</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">GPU Layers (Alternative)</label>
                                    <Input
                                        type="number"
                                        value={updatedParameters?.gpuLayersAlternative}
                                        onChange={(e) => updateParameters('gpuLayersAlternative', parseInt(e.target.value))}
                                        className="w-full"
                                        disabled

                                    />
                                    <p className="text-xs text-muted-foreground">Alternative GPU layer configuration</p>
                                </div>
                            </div>
                            <div className="pt-4 border-t">
                                <div className="bg-muted/20 border rounded-lg p-4">
                                    <h4 className="text-sm font-medium text-white mb-2">Resource Allocation Tips</h4>
                                    <ul className="text-xs text-muted-foreground space-y-1">
                                        <li>• Higher GPU layers = faster inference but requires more VRAM</li>
                                        <li>• Conservative setting: 20 layers for 4GB VRAM systems</li>
                                        <li>• Monitor GPU memory usage to avoid out-of-memory errors</li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Randomness / Reproducibility */}
                    <Card className="w-full"  >
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Shuffle className="w-5 h-5" />
                                <span>Randomness / Reproducibility</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Random Seed</label>
                                <Input
                                    type="number"
                                    value={updatedParameters?.randomSeed}
                                    onChange={(e) => updateParameters('randomSeed', parseInt(e.target.value))}
                                    className="w-full"
                                />
                                <p className="text-xs text-muted-foreground">Seed value for reproducible generation</p>
                            </div>
                            <div className="pt-4 border-t">
                                <div className="bg-muted/20 border rounded-lg p-4">
                                    <h4 className="text-sm font-medium text-white mb-2">Reproducibility Notes</h4>
                                    <ul className="text-xs text-muted-foreground space-y-1">
                                        <li>• Use the same seed value to get consistent outputs</li>
                                        <li>• Set to -1 or leave empty for random generation</li>
                                        <li>• Useful for testing and debugging model behavior</li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Save/Reset */}
                    <Card>
                        <CardContent>
                            <div className="flex justify-between items-center">
                                <div className="space-y-1">
                                    <h3 className="font-medium">Save Configuration</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Apply your settings and restart the model if necessary.
                                    </p>
                                </div>
                                <div className="flex gap-3">
                                    <Button variant="outline" onClick={resetParameters}>Reset to Defaults</Button>
                                    <Button onClick={sendUpdateParameters}>Save Changes</Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Danger Zone */}
                    <Card className="border-destructive/20">
                        <CardHeader>
                            <CardTitle className="text-destructive">Clear History</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="text-sm font-medium">Delete Previous Chats</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Permanently delete your previous chats history.
                                    </p>
                                </div>
                                <Button variant="destructive" size="sm">Clear History</Button>
                            </div>
                        </CardContent>
                    </Card>

                </div>
            </div>

        </div >
    )
}