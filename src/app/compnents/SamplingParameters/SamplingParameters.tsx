import { useState } from "react"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input";
// import { addSocketListener, ListenToEvent } from "@/lib/Services/socketConnection";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function SamplingParameters() {
    const [configureModel, setModelConfiguration] = useState({
        temp: 0.7,
        topP: 0.9,
        maxToken: 512
    });

    const configureModelParameters = (type: string, value: number) => {
        console.log(type, value);
        setModelConfiguration({ ...configureModel, [type]: value });
    };

    function InitializeLLM() {
        addSocketListener("initialize_socket", configureModel);

        ListenToEvent("initialize_socket_response", (data: { message: string, status: number }) => {
            if (data.status === 200) {
                toast.success("Connected to Model");
            } else {
                toast.error("Failed to Load Model");
            }
        });

    }


    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="text-sm font-medium">Temperature</h4>
                        <p className="text-sm text-muted-foreground">
                            Controls how random or creative the response is.
                        </p>
                    </div>

                    <div className="flex items-center max-w-1/3 w-full gap-4">
                        <Slider
                            defaultValue={[0.7]}
                            max={1}
                            step={0.1}
                            onValueChange={value => configureModelParameters("temp", value[0])}
                            className="w-full h-6"
                        />
                        <Input type="number" value={configureModel.temp} className="w-fit" min={0} max={1} />
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="text-sm font-medium">Nucleus Sampling</h4>
                        <p className="text-sm text-muted-foreground">Limits choices to the top 90% of the most likely next words.</p>
                    </div>

                    <div className="flex items-center max-w-1/3 w-full gap-4">
                        <Slider
                            defaultValue={[0.9]}
                            max={1}
                            step={0.1}
                            onValueChange={value => configureModelParameters("topP", value[0])}
                            className="w-full h-6"
                        />
                        <Input type="number" value={configureModel.topP} className="w-fit" min={0} max={1} />
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="text-sm font-medium">Max Token</h4>
                        <p className="text-sm text-muted-foreground">Sets the maximum length of the generated response.</p>
                    </div>

                    <div className="flex items-center max-w-1/3 w-full gap-4">
                        <Input type="number" value={configureModel.maxToken} onChange={el => configureModelParameters("maxToken", Number(el.target.value))} defaultValue={512} className="w-fit" />
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-end">
                <Button onClick={InitializeLLM}> Initialize Model </Button>
            </div>
        </div>
    )
}