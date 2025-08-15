import { useState } from "react"
import { Button } from "@/components/ui/button";

export default function LoadLLM() {
    const [modelPath, setModelPath] = useState<string | null>(null);

    const handleSelect = async () => {
        // @ts-ignore
        const path = await window.electronAPI.openModelFile();

        if (path) {
            setModelPath(path);
            console.log("Selected model:", path);
        }
    };



    return (
        <div className="space-y-4">
            <div className="flex flex-col items-center justify-between gap-4">
                <div className="w-full flex items-center justify-between">
                    <div>
                        <h4 className="text-sm font-medium">
                            Load Model
                        </h4>
                        <p className="text-sm text-muted-foreground">
                            {modelPath ? "Model Path : " + modelPath : "Load your own Model"}
                        </p>
                    </div>

                    <div className="max-w-1/3 w-full flex gap-2">
                        <Button className="w-full" onClick={handleSelect}>Choose Model</Button>
                    </div>
                </div>

                <div className="w-full flex items-center justify-end">
                    <Button> Load </Button>
                </div>
            </div>
        </div>
    )
}