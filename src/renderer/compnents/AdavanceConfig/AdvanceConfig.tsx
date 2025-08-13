"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Cpu, HardDrive, Settings, Zap, Info, Save, RotateCcw } from "lucide-react"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { Separator } from "@/components/ui/separator"

const ModelConfigSidebar = () => {
    const [modelOptions, setModelOptions] = useState({
        gpuLayers: 20,
        contextSize: 1024,
        batchSize: 128,
        seed: 42,
        f16Kv: true,
        logitsAll: false,
        vocabOnly: false,
        useMlock: false,
        embedding: false,
        useMmap: true,
        nThreads: 4,
        nGpuLayers: 20,
        lowVram: true,
        ropeFreqBase: 10000,
        ropeFreqScale: 1,
        mulMatQ: true,
    })

    const handleChange = (key: string, value: any) => {
        setModelOptions((prev) => ({ ...prev, [key]: value }))
    }

    const resetToDefaults = () => {
        setModelOptions({
            gpuLayers: 20,
            contextSize: 1024,
            batchSize: 128,
            seed: 42,
            f16Kv: true,
            logitsAll: false,
            vocabOnly: false,
            useMlock: false,
            embedding: false,
            useMmap: true,
            nThreads: 4,
            nGpuLayers: 20,
            lowVram: true,
            ropeFreqBase: 10000,
            ropeFreqScale: 1,
            mulMatQ: true,
        })
    }

    return (
        <TooltipProvider>
            <div className="h-full flex flex-col bg-muted/10">


                {/* Scrollable Content */}
                <div className="flex-1 overflow-auto p-1 space-y-4 designed-scroll-bar">

                    <Accordion type="single" collapsible>
                        <AccordionItem value="item-1">
                            <AccordionTrigger className="hover:no-underline pb-0">
                                GPU & Performance
                            </AccordionTrigger>
                            <AccordionContent>
                                <Card className="border-0 bg-transparent">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-sm font-medium">GPU Layers</Label>
                                            <span className="text-sm text-muted-foreground">{modelOptions.gpuLayers}</span>
                                        </div>
                                        <Slider
                                            value={[modelOptions.gpuLayers]}
                                            onValueChange={(value) => handleChange("gpuLayers", value[0])}
                                            max={50}
                                            min={0}
                                            step={1}
                                            className="w-full"
                                        />
                                    </div>

                                    <div className="flex items-center justify-between gap-4  rounded">
                                        <Label htmlFor="threads" className="text-sm  px-2 py-1 rounded">
                                            Threads
                                        </Label>
                                        <Input
                                            id="threads"
                                            type="number"
                                            value={modelOptions.nThreads}
                                            onChange={(e) => handleChange("nThreads", Number(e.target.value))}
                                            min={1}
                                            max={32}
                                            className="h-8 w-24"
                                        />
                                    </div>


                                    <div className="space-y-2">
                                        <Label htmlFor="gpu-layers-input" className="text-sm">
                                            GPU Layers
                                        </Label>
                                        <Input
                                            id="gpu-layers-input"
                                            type="number"
                                            value={modelOptions.nGpuLayers}
                                            onChange={(e) => handleChange("nGpuLayers", Number(e.target.value))}
                                            min={0}
                                            max={50}
                                            className="h-8"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="low-vram" className="text-sm font-medium">
                                            Low VRAM Mode
                                        </Label>
                                        <Switch
                                            id="low-vram"
                                            checked={modelOptions.lowVram}
                                            onCheckedChange={(val) => handleChange("lowVram", val)}
                                        />
                                    </div>
                                </Card>

                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                    <Separator />

                    <Accordion type="single" collapsible>
                        <AccordionItem value="item-1">
                            <AccordionTrigger className="hover:no-underline pb-0">
                                GPU & Performance
                            </AccordionTrigger>
                            <AccordionContent>
                                <Card className="border-0 bg-transparent">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-sm font-medium">GPU Layers</Label>
                                            <span className="text-sm text-muted-foreground">{modelOptions.gpuLayers}</span>
                                        </div>
                                        <Slider
                                            value={[modelOptions.gpuLayers]}
                                            onValueChange={(value) => handleChange("gpuLayers", value[0])}
                                            max={50}
                                            min={0}
                                            step={1}
                                            className="w-full"
                                        />
                                    </div>

                                    <div className="flex items-center justify-between gap-4  rounded">
                                        <Label htmlFor="threads" className="text-sm  px-2 py-1 rounded">
                                            Threads
                                        </Label>
                                        <Input
                                            id="threads"
                                            type="number"
                                            value={modelOptions.nThreads}
                                            onChange={(e) => handleChange("nThreads", Number(e.target.value))}
                                            min={1}
                                            max={32}
                                            className="h-8 w-24"
                                        />
                                    </div>


                                    <div className="space-y-2">
                                        <Label htmlFor="gpu-layers-input" className="text-sm">
                                            GPU Layers
                                        </Label>
                                        <Input
                                            id="gpu-layers-input"
                                            type="number"
                                            value={modelOptions.nGpuLayers}
                                            onChange={(e) => handleChange("nGpuLayers", Number(e.target.value))}
                                            min={0}
                                            max={50}
                                            className="h-8"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="low-vram" className="text-sm font-medium">
                                            Low VRAM Mode
                                        </Label>
                                        <Switch
                                            id="low-vram"
                                            checked={modelOptions.lowVram}
                                            onCheckedChange={(val) => handleChange("lowVram", val)}
                                        />
                                    </div>
                                </Card>

                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                    <Separator />


                    <Accordion type="single" collapsible>
                        <AccordionItem value="item-1">
                            <AccordionTrigger className="hover:no-underline pb-0">
                                GPU & Performance
                            </AccordionTrigger>
                            <AccordionContent>
                                <Card className="border-0 bg-transparent">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-sm font-medium">GPU Layers</Label>
                                            <span className="text-sm text-muted-foreground">{modelOptions.gpuLayers}</span>
                                        </div>
                                        <Slider
                                            value={[modelOptions.gpuLayers]}
                                            onValueChange={(value) => handleChange("gpuLayers", value[0])}
                                            max={50}
                                            min={0}
                                            step={1}
                                            className="w-full"
                                        />
                                    </div>

                                    <div className="flex items-center justify-between gap-4  rounded">
                                        <Label htmlFor="threads" className="text-sm  px-2 py-1 rounded">
                                            Threads
                                        </Label>
                                        <Input
                                            id="threads"
                                            type="number"
                                            value={modelOptions.nThreads}
                                            onChange={(e) => handleChange("nThreads", Number(e.target.value))}
                                            min={1}
                                            max={32}
                                            className="h-8 w-24"
                                        />
                                    </div>


                                    <div className="space-y-2">
                                        <Label htmlFor="gpu-layers-input" className="text-sm">
                                            GPU Layers
                                        </Label>
                                        <Input
                                            id="gpu-layers-input"
                                            type="number"
                                            value={modelOptions.nGpuLayers}
                                            onChange={(e) => handleChange("nGpuLayers", Number(e.target.value))}
                                            min={0}
                                            max={50}
                                            className="h-8"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="low-vram" className="text-sm font-medium">
                                            Low VRAM Mode
                                        </Label>
                                        <Switch
                                            id="low-vram"
                                            checked={modelOptions.lowVram}
                                            onCheckedChange={(val) => handleChange("lowVram", val)}
                                        />
                                    </div>
                                </Card>

                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>

                    <Separator />

                    <Accordion type="single" collapsible>
                        <AccordionItem value="item-1">
                            <AccordionTrigger className="hover:no-underline pb-0">
                                GPU & Performance
                            </AccordionTrigger>
                            <AccordionContent>
                                <Card className="border-0 bg-transparent">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-sm font-medium">GPU Layers</Label>
                                            <span className="text-sm text-muted-foreground">{modelOptions.gpuLayers}</span>
                                        </div>
                                        <Slider
                                            value={[modelOptions.gpuLayers]}
                                            onValueChange={(value) => handleChange("gpuLayers", value[0])}
                                            max={50}
                                            min={0}
                                            step={1}
                                            className="w-full"
                                        />
                                    </div>

                                    <div className="flex items-center justify-between gap-4  rounded">
                                        <Label htmlFor="threads" className="text-sm  px-2 py-1 rounded">
                                            Threads
                                        </Label>
                                        <Input
                                            id="threads"
                                            type="number"
                                            value={modelOptions.nThreads}
                                            onChange={(e) => handleChange("nThreads", Number(e.target.value))}
                                            min={1}
                                            max={32}
                                            className="h-8 w-24"
                                        />
                                    </div>


                                    <div className="space-y-2">
                                        <Label htmlFor="gpu-layers-input" className="text-sm">
                                            GPU Layers
                                        </Label>
                                        <Input
                                            id="gpu-layers-input"
                                            type="number"
                                            value={modelOptions.nGpuLayers}
                                            onChange={(e) => handleChange("nGpuLayers", Number(e.target.value))}
                                            min={0}
                                            max={50}
                                            className="h-8"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="low-vram" className="text-sm font-medium">
                                            Low VRAM Mode
                                        </Label>
                                        <Switch
                                            id="low-vram"
                                            checked={modelOptions.lowVram}
                                            onCheckedChange={(val) => handleChange("lowVram", val)}
                                        />
                                    </div>
                                </Card>

                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                    <Separator />


                    <Accordion type="single" collapsible>
                        <AccordionItem value="item-1">
                            <AccordionTrigger className="hover:no-underline pb-0">
                                GPU & Performance
                            </AccordionTrigger>
                            <AccordionContent>
                                <Card className="border-0 bg-transparent">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-sm font-medium">GPU Layers</Label>
                                            <span className="text-sm text-muted-foreground">{modelOptions.gpuLayers}</span>
                                        </div>
                                        <Slider
                                            value={[modelOptions.gpuLayers]}
                                            onValueChange={(value) => handleChange("gpuLayers", value[0])}
                                            max={50}
                                            min={0}
                                            step={1}
                                            className="w-full"
                                        />
                                    </div>

                                    <div className="flex items-center justify-between gap-4  rounded">
                                        <Label htmlFor="threads" className="text-sm  px-2 py-1 rounded">
                                            Threads
                                        </Label>
                                        <Input
                                            id="threads"
                                            type="number"
                                            value={modelOptions.nThreads}
                                            onChange={(e) => handleChange("nThreads", Number(e.target.value))}
                                            min={1}
                                            max={32}
                                            className="h-8 w-24"
                                        />
                                    </div>


                                    <div className="space-y-2">
                                        <Label htmlFor="gpu-layers-input" className="text-sm">
                                            GPU Layers
                                        </Label>
                                        <Input
                                            id="gpu-layers-input"
                                            type="number"
                                            value={modelOptions.nGpuLayers}
                                            onChange={(e) => handleChange("nGpuLayers", Number(e.target.value))}
                                            min={0}
                                            max={50}
                                            className="h-8"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="low-vram" className="text-sm font-medium">
                                            Low VRAM Mode
                                        </Label>
                                        <Switch
                                            id="low-vram"
                                            checked={modelOptions.lowVram}
                                            onCheckedChange={(val) => handleChange("lowVram", val)}
                                        />
                                    </div>
                                </Card>

                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>

                    <Separator />

                    <Accordion type="single" collapsible>
                        <AccordionItem value="item-1">
                            <AccordionTrigger className="hover:no-underline pb-0">
                                GPU & Performance
                            </AccordionTrigger>
                            <AccordionContent>
                                <Card className="border-0 bg-transparent">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-sm font-medium">GPU Layers</Label>
                                            <span className="text-sm text-muted-foreground">{modelOptions.gpuLayers}</span>
                                        </div>
                                        <Slider
                                            value={[modelOptions.gpuLayers]}
                                            onValueChange={(value) => handleChange("gpuLayers", value[0])}
                                            max={50}
                                            min={0}
                                            step={1}
                                            className="w-full"
                                        />
                                    </div>

                                    <div className="flex items-center justify-between gap-4  rounded">
                                        <Label htmlFor="threads" className="text-sm  px-2 py-1 rounded">
                                            Threads
                                        </Label>
                                        <Input
                                            id="threads"
                                            type="number"
                                            value={modelOptions.nThreads}
                                            onChange={(e) => handleChange("nThreads", Number(e.target.value))}
                                            min={1}
                                            max={32}
                                            className="h-8 w-24"
                                        />
                                    </div>


                                    <div className="space-y-2">
                                        <Label htmlFor="gpu-layers-input" className="text-sm">
                                            GPU Layers
                                        </Label>
                                        <Input
                                            id="gpu-layers-input"
                                            type="number"
                                            value={modelOptions.nGpuLayers}
                                            onChange={(e) => handleChange("nGpuLayers", Number(e.target.value))}
                                            min={0}
                                            max={50}
                                            className="h-8"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="low-vram" className="text-sm font-medium">
                                            Low VRAM Mode
                                        </Label>
                                        <Switch
                                            id="low-vram"
                                            checked={modelOptions.lowVram}
                                            onCheckedChange={(val) => handleChange("lowVram", val)}
                                        />
                                    </div>
                                </Card>

                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>




                    {/* Context & Processing Section */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Cpu className="h-4 w-4 text-blue-500" />
                                Context & Processing
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label htmlFor="context-size" className="text-sm">
                                        Context Size
                                    </Label>
                                    <Input
                                        id="context-size"
                                        type="number"
                                        value={modelOptions.contextSize}
                                        onChange={(e) => handleChange("contextSize", Number(e.target.value))}
                                        className="h-8"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="batch-size" className="text-sm">
                                        Batch Size
                                    </Label>
                                    <Input
                                        id="batch-size"
                                        type="number"
                                        value={modelOptions.batchSize}
                                        onChange={(e) => handleChange("batchSize", Number(e.target.value))}
                                        className="h-8"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="seed" className="text-sm">
                                    Random Seed
                                </Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="seed"
                                        type="number"
                                        value={modelOptions.seed}
                                        onChange={(e) => handleChange("seed", Number(e.target.value))}
                                        className="h-8"
                                    />
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleChange("seed", Math.floor(Math.random() * 10000))}
                                        className="h-8 px-3"
                                    >
                                        Random
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                    <Label htmlFor="mul-mat-q" className="text-sm font-medium">
                                        Matrix Multiplication Quantization
                                    </Label>
                                    <Switch
                                        id="mul-mat-q"
                                        checked={modelOptions.mulMatQ}
                                        onCheckedChange={(val) => handleChange("mulMatQ", val)}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Memory Management Section */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <HardDrive className="h-4 w-4 text-green-500" />
                                Memory Management
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                <div className="flex items-center gap-2">
                                    <Label htmlFor="f16-kv" className="text-sm font-medium">
                                        Half-Precision KV Cache
                                    </Label>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <Info className="h-3 w-3 text-muted-foreground" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Uses 16-bit precision for key-value cache to save memory</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                                <Switch
                                    id="f16-kv"
                                    checked={modelOptions.f16Kv}
                                    onCheckedChange={(val) => handleChange("f16Kv", val)}
                                />
                            </div>

                            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                <Label htmlFor="use-mmap" className="text-sm font-medium">
                                    Memory Mapping
                                </Label>
                                <Switch
                                    id="use-mmap"
                                    checked={modelOptions.useMmap}
                                    onCheckedChange={(val) => handleChange("useMmap", val)}
                                />
                            </div>

                            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                <Label htmlFor="use-mlock" className="text-sm font-medium">
                                    Memory Lock
                                </Label>
                                <Switch
                                    id="use-mlock"
                                    checked={modelOptions.useMlock}
                                    onCheckedChange={(val) => handleChange("useMlock", val)}
                                />
                            </div>

                            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                <Label htmlFor="embedding" className="text-sm font-medium">
                                    Embedding Mode
                                </Label>
                                <Switch
                                    id="embedding"
                                    checked={modelOptions.embedding}
                                    onCheckedChange={(val) => handleChange("embedding", val)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Advanced Options */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Advanced Options</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label htmlFor="rope-freq-base" className="text-sm">
                                        RoPE Freq Base
                                    </Label>
                                    <Input
                                        id="rope-freq-base"
                                        type="number"
                                        value={modelOptions.ropeFreqBase}
                                        onChange={(e) => handleChange("ropeFreqBase", Number(e.target.value))}
                                        className="h-8"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="rope-freq-scale" className="text-sm">
                                        RoPE Freq Scale
                                    </Label>
                                    <Input
                                        id="rope-freq-scale"
                                        type="number"
                                        step="0.1"
                                        value={modelOptions.ropeFreqScale}
                                        onChange={(e) => handleChange("ropeFreqScale", Number(e.target.value))}
                                        className="h-8"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                    <Label htmlFor="logits-all" className="text-sm font-medium">
                                        Return All Logits
                                    </Label>
                                    <Switch
                                        id="logits-all"
                                        checked={modelOptions.logitsAll}
                                        onCheckedChange={(val) => handleChange("logitsAll", val)}
                                    />
                                </div>

                                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                    <Label htmlFor="vocab-only" className="text-sm font-medium">
                                        Vocabulary Only
                                    </Label>
                                    <Switch
                                        id="vocab-only"
                                        checked={modelOptions.vocabOnly}
                                        onCheckedChange={(val) => handleChange("vocabOnly", val)}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>


            </div>
        </TooltipProvider >
    )
}

export default ModelConfigSidebar
