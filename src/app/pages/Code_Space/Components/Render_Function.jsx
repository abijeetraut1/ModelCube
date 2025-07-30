import { useCallback, useRef, useState, memo } from 'react';
import { Button } from '@/components/ui/button';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Figma, CircleArrowRight, Download } from "lucide-react";
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, } from "@/components/ui/tooltip";
import DatabaseSchemaFlow from '@/app/pages/Code_Space/DatabaseSchemaFlows/DatabaseSchemaFlows';
import { StructureCreator } from '@/components/sidebar/Structure';
import { Copy } from 'lucide-react';
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Avatar } from "@/components/ui/avatar";
import Editor from '@monaco-editor/react';
import { getLanguageFromFilename } from '../Functions/Functions';
import { fetchChats, saveChats } from '@/lib/Database/ChatsDB';
import { show, updateCodes } from '@/lib/Database/CodesDB';
// import { addSocketListener, listenToCodeGenerationEvent } from '@/utils/socketConnection';
import { Skeleton } from "@/components/ui/skeleton"
import { useVirtualizer } from '@tanstack/react-virtual'
import { ModelMarkdown, UserMarkdown } from '../Markdown/Markdown';
import { DownloadSingleFile } from '@/lib/exports/Download';
import { checkHistory } from '@/lib/Database/CheckHistory';

import Prompt from '@/app/compnents/Prompt/Prompt';

const MemoizedUserMarkdown = memo(UserMarkdown);
const MemoizedModelMarkdown = memo(ModelMarkdown);

export default function Render_Function() {
    const [currentViewCode] = useState(null);

    const { Category } = useSelector(state => state.prompt);
    const { GeneratedFolders, } = useSelector(state => state.response);


    return (
        <ResizablePanelGroup direction="horizontal" className="bg-muted/40 w-full border rounded-xl overflow-hidden ">
            <ResizablePanel defaultSize={30} minSize={25} maxSize={40} className="bg-muted/40 px-2 overflow-auto w-1/4">
                <ChatBox Category={Category} />
            </ResizablePanel>

            <ResizableHandle />

            {/* Sidebar */}
            <ResizablePanel defaultSize={20} minSize={10} maxSize={20} className="rounded-xl px-2 overflow-auto">
                <div style={{ maxHeight: 'calc(94vh - 0px)' }} className="designed-scroll-bar w-full flex flex-col justify-end overflow-auto h-full">
                    <div className="designed-scroll-bar h-full flex flex-col justify-end py-2 flex-1 overflow-y-auto">

                        <StructureCreator Items={GeneratedFolders} Title={"Folder"} Section={"Folder Structure"} />

                    </div>
                </div>
            </ResizablePanel>

            <ResizableHandle />

            {/* Code Editor */}

            <ResizablePanel onContextMenu={(e) => e.preventDefault()} style={{ maxHeight: 'calc(94vh - 0px)' }} className="designed-scroll-bar h-full flex flex-col w-full overflow-y-auto bg-muted/50">

                {/* Code Editor */}
                <CodeEditorWorkspace code={currentViewCode?.code || ""} />

            </ResizablePanel>
        </ResizablePanelGroup >
    );
}

function CodeEditorWorkspace({ code }) {
    const { panelView, slug, currentViewingFile } = useSelector(state => state.workflow);
    const [CurrentFileData, setCurrentFileData] = useState();
    // const [viewThink, setThinkView] = useState(true);

    useEffect(() => {

        (async () => {
            const user_id = 1123;

            const currentFileData = await show(slug, user_id, currentViewingFile);
            if (!currentFileData) return;
            console.log(currentFileData)
            // console.log(currentFileData[currentFileData.length - 1]?.value);
            setCurrentFileData(currentFileData.value);
        })();

    }, [currentViewingFile]);

    return (
        <div className="designed-scroll-bar relative w-full h-svh overflow-hidden">
            {panelView === 'code' && (
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className='py-1 px-2 flex justify-between items-center bg-[#1e1e1e]'>
                        <div>
                            <p className='text-sm text-white'>
                                {currentViewingFile && currentViewingFile.split("/").map((file, index, arr) => (
                                    <span key={index}>
                                        <span>{file}</span>
                                        {index !== arr.length - 1 && <span> / </span>}
                                    </span>
                                ))}
                            </p>
                        </div>
                        <div className='flex gap-1'>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <span>
                                            <Button size="codePanel" variant="codePanel">
                                                <Copy />
                                            </Button>
                                        </span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Copy File Code</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <span>
                                            <Button onClick={() => DownloadSingleFile(currentViewingFile, CurrentFileData)} size="codePanel" variant="codePanel">
                                                <Download />
                                            </Button>
                                        </span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Download File</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </div>

                    {/* Editor takes remaining space */}
                    <div className="flex-1 overflow-hidden">
                        <Editor
                            height="100%"
                            value={CurrentFileData ? CurrentFileData[0].code : ""}
                            onChange={(changedCodes) => updateCodes(slug, 1111, currentViewingFile, 0, changedCodes)}
                            className="font-mono designed-scroll-bar"
                            defaultLanguage={getLanguageFromFilename(currentViewingFile)}
                            theme="vs-dark"
                            options={{
                                minimap: { enabled: false },
                                automaticLayout: true,
                                lineNumbers: 'on',
                                scrollBeyondLastLine: false,
                                wordWrap: 'on',
                                fontSize: 14,
                                folding: true,
                                renderLineHighlight: 'all',
                                suggestOnTriggerCharacters: false,
                                quickSuggestions: false,
                                parameterHints: { enabled: false },
                                tabCompletion: 'off',
                                contextmenu: false,
                                autoIndent: 'advanced',
                                hover: { enabled: true },
                                codeLens: true,
                                wordBasedSuggestions: false,
                            }}
                        />
                    </div>
                </div>
            )}
            {panelView === 'database' && <DatabaseSchemaFlow />}
        </div>
    );
}


const ChatBox = () => {
    const dispatch = useDispatch();
    const { slug } = useSelector(state => state.workflow);
    const chatRef = useRef(null);
    const [chatsArray, setChatsArray] = useState(null);

    useEffect(() => {

        (async () => {
            const user_id = 1122;
            const prevGeneration = await checkHistory(slug, user_id, dispatch);
            const chatsArr = prevGeneration.conversation;
            setChatsArray(chatsArr);
        })();
    }, [slug])

    // listenToCodeGenerationEvent("refactor_response", async (data) => {
    //     const messageObj = {
    //         message: data.message,
    //         role: "model",
    //         path: data.path,
    //         timeStamp: new Date().toISOString(),
    //     }
    //     // console.log("response data : ", messageObj, data);

    //     const user_id = 1123;
    //     const saveMsg = await saveChats(slug, user_id, messageObj);
    //     if (saveMsg === 1) {
    //         // addSocketListener("refactor_codebase", messageObj);
    //         const Chats_Data = await fetchChats(slug, user_id);
    //         setChatsArray(Chats_Data);
    //     }
    // })

    const SendPrompt = async () => {

        const promptObj = {
            message: chatRef.current,
            role: "user",
            timeStamp: new Date().toISOString(),
        };

        const user_id = 1123;

        const saveMsg = await saveChats(slug, user_id, promptObj);
        if (saveMsg === 1) {
            addSocketListener("refactor_codebase", promptObj);
            const Chats_Data = await fetchChats(slug, user_id);
            setChatsArray(Chats_Data);
        }


    }

    return (
        <div style={{ maxHeight: 'calc(93.7vh - 0px)' }} className="designed-scroll-bar w-full flex flex-col overflow-auto h-full">
            <div className="designed-scroll-bar flex flex-col h-full  justify-end flex-1 overflow-y-auto">


                {chatsArray && <MemoizedMarkdown ChatsArray={chatsArray} />}

                {/* {chat?.status === "pending" && <div className='animate-bounce'> *** </div>} */}

            </div>


            {/* <div className="px-0 pt-3">
                <Card className="max-w-2xl bg-muted mx-auto">
                    <CardContent className="p-3">
                        <Textarea
                            // value={chat?.status === "pending" ? "" : chat?.prompt}
                            onChange={(el) => chatRef.current = el.target.value}
                            placeholder="Ask me anything..."
                            className="designed-scroll-bar  min-h-8 resize-none border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                        />
                    </CardContent>

                    <CardFooter className="flex justify-end gap-2 p-3 pt-0">
                        <TooltipProvider className="w-fit">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            disabled
                                            className="opacity-50 cursor-not-allowed pointer-events-none"
                                        >
                                            <Figma className="h-4 w-4 mr-2" />
                                            Design
                                        </Button>
                                    </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>In development — available in an upcoming release.</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        <Button size="sm" onClick={() => SendPrompt()}>
                            <CircleArrowRight className="h-4 w-4 mr-2" />
                            Send
                        </Button>
                    </CardFooter>
                </Card>
            </div> */}

            <Prompt />
        </div>
    )
}


const MemoizedMarkdown = ({ ChatsArray }) => {
    const parentRef = useRef(null);

    // Estimate size function with caching
    const estimateSize = useCallback(() => 45, []);

    const virtualizer = useVirtualizer({
        count: ChatsArray.length,
        getScrollElement: () => parentRef.current,
        estimateSize,
        overscan: 5, // Add some overscan to reduce flickering
    });

    const items = virtualizer.getVirtualItems();

    // Render function for items to prevent recreating functions
    const renderItem = useCallback((virtualRow) => {
        const chatItem = ChatsArray[virtualRow.index];
        return (
            <div
                key={virtualRow.key}
                data-index={virtualRow.index}
                ref={virtualizer.measureElement}
                className={virtualRow.index % 2 ? 'ListItemOdd' : 'ListItemEven'}
            // style={{ padding: '10px 0' }}
            >
                <div>
                    {chatItem.role === "user" && (
                        <MemoizedUserMarkdown response={chatItem} />
                    )}
                    {chatItem.role === "model" && (
                        <MemoizedModelMarkdown response={chatItem} />
                    )}
                </div>
            </div>
        );
    }, [ChatsArray, virtualizer.measureElement]);

    return (
        <div
            style={{ maxHeight: 'calc(92vh - 0px)' }}
            className="flex-1 designed-scroll-bar overflow-auto flex flex-col gap-4 border-0"
        >
            <div
                ref={parentRef}
                className="List designed-scroll-bar w-full flex-1"
                style={{
                    overflowY: 'auto',
                    contain: 'strict',
                    willChange: 'transform', // Hint to browser for optimization
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
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            transform: `translateY(${items[0]?.start ?? 0}px)`,
                        }}
                    >
                        {items.map(renderItem)}
                    </div>
                </div>
            </div>
        </div>
    );
};


const SkeletonComponent = () => {
    <Card className="border-0 flex gap-2 p-2">
        <div className="max-h-6 max-w-6 rounded-md">
            <Avatar title="user" className="max-h-6 max-w-6">
                <Skeleton className="w-full h-full" />
            </Avatar>
        </div>
        <div className="flex flex-col gap-2 w-full">
            <Skeleton className="h-4 w-3/4 rounded" />
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-5/6 rounded" />
            <Skeleton className="h-4 w-2/3 rounded" />

            {/* Optional code block skeleton */}
            <Skeleton className="h-24 w-full rounded-md mt-2" />
        </div>
    </Card>
}

