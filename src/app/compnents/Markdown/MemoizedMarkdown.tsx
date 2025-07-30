import { useRef, useState, useEffect, useCallback, useMemo, memo } from "react";
import { useVirtualizer } from '@tanstack/react-virtual';

import { Card } from "@/components/ui/card";
import { Timer } from "lucide-react";

// import { initializeSocket } from "@/lib/Services/socketConnection";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";


import { ChatModelMarkdown, ChatUserMarkdown } from "./markdown/Markdown";

interface MemoizedMarkdownProps {
    currentResponse: string;
    ChatsArray: any;
    isWaitingForResponse: any;
}

const MemoizedUserMarkdown = memo(ChatUserMarkdown);
const MemoizedModelMarkdown = memo(ChatModelMarkdown);


export const MemoizedMarkdown = memo(({ currentResponse, ChatsArray, isWaitingForResponse }: MemoizedMarkdownProps) => {
    const parentRef = useRef(null);
    const safeChatsArray = ChatsArray || [];
    const [onProcessingChat, setOnProcessingChat] = useState();

    useEffect(() => {
        setOnProcessingChat(currentResponse);
        // console.log(currentResponse)
    }, [currentResponse]);


    const displayArray = useMemo(() => {
        if (isWaitingForResponse) {
            return [...safeChatsArray, { id: 'loading', role: 'loading', message: '' }];
        }
        return safeChatsArray;
    }, [safeChatsArray, isWaitingForResponse]);

    const estimateSize = useCallback(() => 45, []);

    const virtualizer = useVirtualizer({
        count: displayArray.length,
        getScrollElement: () => parentRef.current,
        estimateSize,
        overscan: 5,
    });

    const items = virtualizer.getVirtualItems();

    const renderItem = useCallback((virtualRow) => {
        const chatItem = displayArray[virtualRow.index];
        if (!chatItem) return null;

        return (
            <div
                key={virtualRow.key}
                data-index={virtualRow.index}
                ref={virtualizer.measureElement}
                className={virtualRow.index % 2 ? 'ListItemOdd' : 'ListItemEven'}
            >
                <div className="w-full">
                    {chatItem.role === "user" && (
                        <div className="max-w-full w-full py-1 flex justify-end">
                            <MemoizedUserMarkdown response={chatItem} />
                        </div>
                    )}

                    {chatItem.role === "model" && (

                        <div className="space-y-1">
                            {chatItem.message.think && <Accordion type="single" collapsible>
                                <AccordionItem value="item-1">
                                    <AccordionTrigger className="max-w-fit w-full py-1 hover:no-underline text-gray-400">Thought</AccordionTrigger>
                                    <AccordionContent className="pb-2">
                                        <Card className="py-1 px-2 bg-secondary m-0 border-none shadow-none rounded-md overflow-clip">
                                            <MemoizedModelMarkdown
                                                isThinking={true}
                                                response={{ message: safeStringify(!chatItem.message.think ? "" : chatItem.message.think) }}
                                            />
                                        </Card>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>}

                            <MemoizedModelMarkdown
                                response={{ message: safeStringify(!chatItem.message.message ? "" : chatItem.message.message) }}
                                isThinking={false} />

                            <div className="flex items-center gap-1 h-full text-gray-400">
                                <Timer className="h-4 w-4" />
                                <p className="text-xs ">{chatItem.completionTime}'s</p>
                            </div>
                        </div>
                    )}

                    {onProcessingChat?.message && (
                        <MemoizedModelMarkdown response={onProcessingChat} />
                    )}


                </div>
            </div>
        );
    }, [displayArray, virtualizer.measureElement]);

    const safeStringify = (value) => {
        if (typeof value === 'string') return value;
        if (value === null || value === undefined) return '';
        if (typeof value === 'object') return JSON.stringify(value);
        return String(value);
    };

    return (
        <div
            style={{ maxHeight: 'calc(92vh - 0px)' }}
            className="flex-1 bg-inherit h-full flex  gap-4 border-0"
        >
            <div
                ref={parentRef}
                className="List designed-scroll-bar h-full w-full flex-1 px-2 md:px-4 xl:px-28"
                style={{
                    overflowY: 'auto',
                    contain: 'strict',
                    willChange: 'transform',
                }}
            >
                <div
                    style={{
                        height: virtualizer.getTotalSize(),
                        width: '100%',
                        position: 'relative',
                    }}
                >
                    <div
                        className="h-full space-y-2"
                        style={{
                            width: '100%',
                            transform: `translateY(${items[0]?.start ?? 0}px)`,
                        }}
                    >
                        {items.map(renderItem)}

                    </div>
                    {onProcessingChat?.thinking && (
                        <Accordion type="single" collapsible>
                            <AccordionItem value="item-1" >
                                <AccordionTrigger className="max-w-fit w-full py-1 hover:no-underline  text-gray-400">Thought</AccordionTrigger>
                                <AccordionContent>
                                    <Card className="py-1 px-2 bg-secondary m-0 border-none shadow-none rounded-md overflow-clip">
                                        <MemoizedModelMarkdown
                                            isThinking={true}
                                            response={{ message: safeStringify(!onProcessingChat.thinking ? "" : onProcessingChat.thinking) }}
                                        />
                                    </Card>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    )}

                    {onProcessingChat?.message && (
                        <MemoizedModelMarkdown
                            isThinking={false}
                            response={{ message: safeStringify(!onProcessingChat.message ? "" : onProcessingChat.message) }}
                        />
                    )}
                </div>
            </div>

        </div>
    );
});