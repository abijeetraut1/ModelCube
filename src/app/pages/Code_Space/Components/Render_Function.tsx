import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Download } from "lucide-react";
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, } from "@/components/ui/tooltip";
import DatabaseSchemaFlow from '@/app/pages/Code_Space/DatabaseSchemaFlows/DatabaseSchemaFlows';
import { StructureCreator } from '@/components/sidebar/Structure';
import { Copy } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { getLanguageFromFilename } from '../Functions/Functions';
import { show, updateCodes } from '@/lib/Database/CodesDB';
// import { addSocketListener, listenToCodeGenerationEvent } from '@/utils/socketConnection';
import { DownloadSingleFile } from '@/lib/exports/Download';

import Prompt from '@/app/compnents/Prompt/Prompt';


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


import { MemoizedMarkdown } from "@/app/compnents/Markdown/MemoizedMarkdown";
import { useParams } from "react-router-dom";

// import { initializeSocket } from "@/lib/Services/socketConnection";
import { createDatabase } from "@/lib/Database/CodesDB";
import { fetchNormalChats, saveNormalChats } from "@/lib/Database/ChatsDB";
import { v4 as uuidv4 } from "uuid";


function ChatBox() {
    const [input, setInput] = useState("");
    const [chatsArray, setChatsArray] = useState([]);
    const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
    const [isSocketReady, setIsSocketReady] = useState(false);
    // const socketRef = useRef(null);
    const messagesEndRef = useRef(null);
    const chatRef = useRef<HTMLTextAreaElement | null>(null);
    const [tempChatStore, setTempChatStore] = useState({ message: "", thinking: "" });
    const responseChunks = useRef<string | "">({ message: "", thinking: "" });

    const tempChatStoreRef = useRef(tempChatStore);
    tempChatStoreRef.current = tempChatStore;

    const { slug } = useParams();

    useEffect(() => {
        const fetchData = async () => {
            if (slug) {
                const data = await fetchNormalChats(slug);
                setChatsArray(data || []);
            } else {
                // if not slug then it will create new slug
                const re_slug = uuidv4();
                const data = await fetchNormalChats(re_slug);
                setChatsArray(data || []);
            }
        };

        fetchData();
    }, [slug]);

    useEffect(() => {
        if (!chatRef.current) return;
        chatRef.current.style.height = "auto";
        chatRef.current.style.height = `${Math.min(chatRef.current.scrollHeight, 256)}px`;
    }, [input]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatsArray, isWaitingForResponse]);

    useEffect(() => {
        if (!window.electronAPI) return;

        const handleChatResponse = async (data) => {
            // console.log(data, data.text)
            if (data.type === "segment" && data.segmentType === "thought") {
                if (data.segmentStartTime != null && data.segmentEndTime == null) {
                    responseChunks.current.thinking += `${(data.text === undefined || data.text === null) ? "" : data.text}`;
                } else if (data.segmentEndTime != null && data.segmentStartTime == null) {
                    responseChunks.current.thinking += `${data.text}`;
                } else {
                    responseChunks.current.thinking += (data.text === undefined || data.text === null) ? "" : data.text;
                }
            } else if (data.type === "segment") {
                responseChunks.current.message += data.text;
            } else {
                responseChunks.current.message += data.text;
            }



            const tempHold = responseChunks.current;
            // console.log(tempHold);
            responseChunks.current = { message: "", thinking: "" };
            setTempChatStore(prev => ({
                message: ((prev.message === undefined || prev.message === null) ? "" : prev.message) + tempHold.message,
                thinking: (prev.thinking === undefined || prev.thinking === null ? "" : prev.thinking) + tempHold.thinking,
            }));
            // if (wordCount.current > 3) {

            //   // console.log(responseChunks.current);
            //   wordCount.current = 0;
            // }

            // wordCount.current += 1;
        };

        const handleChatEnd = async (data: any) => {
            console.log(data);
            const remainingChunks = responseChunks.current || { message: "", thinking: "" };
            const currentState = tempChatStoreRef.current || { message: "", thinking: "" };

            const finalData = {
                message: currentState.message + remainingChunks.message,
                thinking: currentState.thinking + remainingChunks.thinking
            };

            const saveModelResponse = {
                id: Date.now(),
                role: "model",
                message: {
                    think: finalData.thinking,
                    message: finalData.message  // ✅ MUST end with a comma
                },
                completionTime: data.timeTook,
                finished: data.status === 200,
            };



            const saveResponseChat = await saveNormalChats(slug, saveModelResponse);
            if (saveResponseChat === 1) {
                setIsWaitingForResponse(false);
                tempChatStoreRef.current = "";
                setTempChatStore({ message: "", thinking: "" });
                responseChunks.current = { message: "", thinking: "" }

                const updatedChats = await fetchNormalChats(slug);
                setChatsArray(updatedChats || []);
            }
        }

        const terminatechat = () => {
            setIsWaitingForResponse(false);
        }

        window?.electronAPI.onChat(handleChatResponse)

        window.electronAPI.onChatEnd(handleChatEnd);


        return () => {
            window.electronAPI.removeChatListener(handleChatResponse);
            // window.electronAPI.removeChatEndListener(handleChatEnd);
        };

    }, [slug]);

    const setChatSlug = async () => {
        // if (!input.trim() || !isSocketReady) return;

        if (isWaitingForResponse) {
            setIsWaitingForResponse(false);
            window.electronAPI.onChatTerminate();
        } else {
            window.electronAPI.onChatRestart();
        }

        if (!slug) {
            const id = uuidv4();
            // navigate("/c/" + id);
            await createDatabase(id);
            return;
        }

        const userMsg = {
            id: Date.now(),
            role: "user",
            message: input.trim(),
        };


        await saveNormalChats(slug, userMsg);
        const updatedChats = await fetchNormalChats(slug);
        setChatsArray(updatedChats || []);
        setInput("");
        setIsWaitingForResponse(true);
        // addSocketListener("chats", input.trim());

        window.electronAPI.setPrompt(input);

    };

    const adjustHeight = () => {
        const textarea = chatRef.current
        if (!textarea) return

        textarea.style.height = "auto"

        const newHeight = Math.min(textarea.scrollHeight, 256)
        textarea.style.height = `${newHeight}px`
    }

    useEffect(() => {
        adjustHeight()
    }, [input])

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (!isWaitingForResponse && input.trim()) {
                setChatSlug();
            }
        }
    };

    return (
        <div className="h-full flex flex-1 pt-0 ">
            <div className="h-full py-1 flex justify-center gap-2 items-center w-full overflow-y-auto">

                {/* Chat Section */}
                <div className={` flex flex-col h-full w-full rounded-md  max-w-full`}>
                    <div className="flex flex-col flex-1 my-2">
                        <MemoizedMarkdown currentResponse={tempChatStore} ChatsArray={chatsArray} isWaitingForResponse={isWaitingForResponse} />
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Section */}

                    <div >
                        <Prompt
                            chatRef={chatRef}
                            input={input}
                            setInput={setInput}
                            handleKeyDown={handleKeyDown}
                            onSubmit={setChatSlug}
                            isWaitingForResponse={isWaitingForResponse}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

