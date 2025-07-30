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
import Welcome from '@/app/compnents/welcome/welcome';

const MemoizedUserMarkdown = memo(UserMarkdown);
const MemoizedModelMarkdown = memo(ModelMarkdown);

export default function Render_Function() {
    const [currentViewCode] = useState(null);

    const { Category } = useSelector(state => state.prompt);
    const { GeneratedFolders, } = useSelector(state => state.response);


    return (
        <ResizablePanelGroup direction="horizontal" className="bg-muted/40 w-full overflow-hidden ">
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

            <ResizableHandle />

            <ResizablePanel defaultSize={30} minSize={25} maxSize={40} className="bg-muted/40 px-2 overflow-auto w-1/4">
                <ChatBox Category={Category} />
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


import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { uuidv4 } from 'zod';

const ChatBox = () => {
    const dispatch = useDispatch();
    const { slug } = useSelector(state => state.workflow);
    const chatRef = useRef(null);
    const [chatsArray, setChatsArray] = useState(null);

    const [input, setInput] = useState("");
    const messagesEndRef = useRef(null);
    const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);

    const [modelInitStatus, setModelStatus] = useState(false);

    const handleSelect = async () => {
        // @ts-ignore
        try {
            const connectionResponse = await window.electronAPI.openModelFile();

            console.log("connectionResponse : ", connectionResponse)
            if (connectionResponse.status == 200) {
                const id = uuidv4();

                toast.success(connectionResponse.message, {
                    description: "Now you can use the system as like a developer",
                    duration: 5000
                });

                setModelStatus(true);

                window.electronAPI.onChatID({ chatId: id, enableDeveloperMode: true })
            } else {
                setModelStatus(false);
                toast.error(connectionResponse.message || "Failed to open model file.");
            }
        } catch (error) {
            console.error("Error selecting model file:", error);
            toast.error("An unexpected error occurred while selecting the model file.");
        }
    };

    const handleKeyDown = () => {
        setChatSlug();
        // if (e.key === "Enter" && !e.shiftKey) {
        //   e.preventDefault();
        //   if (!isWaitingForResponse && input.trim()) {
        //   }
        // }
    };

    const setChatSlug = async () => {
        // if (!input.trim() || !isSocketReady) return;

        // if (!slug) {
        //   const id = uuidv4();
        //   router.push("/c/" + id);
        //   await createDatabase(id, 1111);
        //   return;
        // }

        // const userMsg = {
        //   id: Date.now(),
        //   role: "user",
        //   message: input.trim(),
        // };

        // await saveNormalChats(slug, 1111, userMsg);
        // const updatedChats = await fetchNormalChats(slug, 1111);
        // setChatsArray(updatedChats || []);
        // setInput("");
        // setIsWaitingForResponse(true);

        // // sending prompt to main.js /electron/main.js
        // window.electronAPI.setPrompt("Hello");
        // addSocketListener("chats", input.trim());
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatsArray, isWaitingForResponse]);

    useEffect(() => {

        (async () => {
            const user_id = 1122;
            const prevGeneration = await checkHistory(slug, user_id, dispatch);
            const chatsArr = prevGeneration.conversation;
            setChatsArray(chatsArr);
        })();
    }, [slug])


    useEffect(() => {
        // Only add socket listeners on client side
        // if (!mounted) return;


        // ListenToEvent("chat_response", handleChatResponse);
    }, [slug]);

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
        <div className="designed-scroll-bar w-full flex flex-col overflow-auto h-full">
            <div className="designed-scroll-bar flex flex-col h-full  justify-end flex-1 overflow-y-auto">


                {chatsArray && <MemoizedMarkdown ChatsArray={chatsArray} />}

                {/* {chat?.status === "pending" && <div className='animate-bounce'> *** </div>} */}

            </div>

            {!modelInitStatus && <div className={` flex flex-col h-full w-full rounded-md max-w-full"}`}>
                <div className="px-8 md:px-4 xl:px-8 flex flex-col gap-4 justify-center h-full items-center">
                    <div className=' text-4xl font-bold text-center'>
                        File’s yours. <br /> What do you want to do next?
                    </div>

                    <div className='flex gap-2'>
                        <Button className="w-fit" onClick={handleSelect}>Choose Model</Button>

                        <Link to="/search">
                            <Button variant="outline">Download LLM</Button>
                        </Link>
                    </div>

                </div>
            </div >}


            <Prompt
                chatRef={chatRef}
                input={input}
                setInput={setInput}
                handleKeyDown={handleKeyDown}
                onSubmit={setChatSlug}
                isWaitingForResponse={isWaitingForResponse}
            // isSocketReady={isSocketReady}
            />
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