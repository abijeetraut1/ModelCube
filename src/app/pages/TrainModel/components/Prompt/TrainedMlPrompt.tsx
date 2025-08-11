import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CircleArrowRight, Loader2 } from "lucide-react";

// @ts-ignore
interface PromptProps {
    chatRef: React.RefObject<HTMLTextAreaElement>;
    input: string;
    setInput: (input: string) => void;
    onSubmit: () => void;
}

export default function TrainedMlPrompt({
    chatRef,
    input,
    setInput,
    onSubmit,
}: PromptProps) {

    return (
        <Card className="bg-muted w-full py-1 px-1 gap-2">
            <CardContent className="flex justify-between gap-2 px-0 pt-0">
                <Textarea
                    ref={chatRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask me anything..."
                    className="bg-muted designed-scroll-bar p-1 h-8 resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
            </CardContent>

            <CardFooter className="flex justify-end gap-2 px-0 pt-0">
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        onClick={() => onSubmit()}
                    >

                        <CircleArrowRight className="h-4 w-4" />
                        Send
                    </Button>
                </div>
            </CardFooter>
        </Card>
    )
}