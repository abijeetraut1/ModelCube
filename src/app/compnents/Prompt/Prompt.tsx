import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CircleArrowRight, Loader2, Paperclip, Brain } from "lucide-react";
import SamplingParameters from "../SamplingParameters/SamplingParameters";

// @ts-ignore
interface PromptProps {
    chatRef: React.RefObject<HTMLTextAreaElement>;
    input: string;
    setInput: (input: string) => void;
    handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
    onSubmit: () => void;
    isWaitingForResponse: boolean;
}

export default function Prompt({
    chatRef,
    input,
    setInput,
    handleKeyDown,
    onSubmit,
    isWaitingForResponse,
}: PromptProps) {

    return (
        <Card className="bg-muted w-full py-1 px-1 gap-2">
            <CardContent className="flex justify-between gap-2 px-0 pt-0">
                <Textarea
                    ref={chatRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask me anything..."
                    className="bg-muted designed-scroll-bar p-1 h-8 resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
            </CardContent>
            <CardFooter className="flex justify-between gap-2 px-0 pt-0">
                <div className="flex gap-1">
                    <div className="w-fit">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            disabled
                                            className="opacity-50 cursor-not-allowed pointer-events-none"
                                        >
                                            <span> <Paperclip className="h-4 w-4 mr-0" /> </span>
                                            <span className="hidden @[300px]:inline">Attachments</span>

                                        </Button>
                                    </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>In development — available in an upcoming release.</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>

                    <Dialog>
                        <DialogTrigger>
                            <Button variant="outline" asChild size="sm">
                                <div>
                                    <span> <Brain className="h-4 w-4 mr-0" /> </span>
                                    <span className="hidden @[300px]:inline">Attachments</span>
                                </div>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="!max-w-2xl !w-full">
                            <DialogHeader>
                                <DialogTitle>Sampling Parameters</DialogTitle>
                                <DialogDescription className="py-2 space-y-6">
                                    <SamplingParameters />
                                </DialogDescription>
                            </DialogHeader>
                        </DialogContent>
                    </Dialog>
                </div>



                <div className="flex gap-2">
                    <Button
                        size="sm"
                        onClick={() => onSubmit()}
                    >
                        {isWaitingForResponse ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                Reciving...
                            </>
                        ) : (
                            <>
                                <CircleArrowRight className="h-4 w-4" />
                                Send
                            </>
                        )}
                    </Button>


                </div>
            </CardFooter>
        </Card>
    )
}