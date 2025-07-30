// @ts-nocheck
"use client"

import React, { useRef, useState, useEffect, useCallback, useMemo, memo } from "react";

import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "react-router-dom";

import Markdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import { useVirtualizer } from '@tanstack/react-virtual';

import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Copy, Timer } from "lucide-react";

// import { initializeSocket } from "@/lib/Services/socketConnection";
import { createDatabase } from "@/lib/Database/CodesDB";
import { fetchNormalChats, saveNormalChats } from "@/lib/Database/ChatsDB";
import { v4 as uuidv4 } from "uuid";
import Prompt from "@/app/compnents/Prompt/Prompt";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { getCurrentSlug, getSlugs } from "@/lib/Database/StoreSlugs";

export default function Chat({ params }: { params: Promise<{ slug: string }> }) {
  const [input, setInput] = useState("");
  const navigate = useNavigate()
  const [chatsArray, setChatsArray] = useState([]);
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const [isSocketReady, setIsSocketReady] = useState(false);
  // const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const chatRef = useRef<HTMLTextAreaElement | null>(null);
  const [tempChatStore, setTempChatStore] = useState({ message: "", thinking: "" });
  const responseChunks = useRef<string | "">({ message: "", thinking: "" });
  const wordCount = useRef(0);

  const tempChatStoreRef = useRef(tempChatStore);
  tempChatStoreRef.current = tempChatStore;

  const { slug } = useParams();

  // useEffect(() => {
  //   const socket = initializeSocket();

  //   const handleConnect = () => {
  //     console.log("Socket connected");
  //     socketRef.current = socket;
  //     setIsSocketReady(true);
  //   };

  //   const handleDisconnect = () => {
  //     console.log("Socket disconnected");
  //     setIsSocketReady(false);
  //   };

  //   if (socket?.connected) {
  //     socketRef.current = socket;
  //     setIsSocketReady(true);
  //   }

  //   socket?.on("connect", handleConnect);
  //   socket?.on("disconnect", handleDisconnect);

  //   return () => {
  //     socket?.off("connect", handleConnect);
  //     socket?.off("disconnect", handleDisconnect);
  //   };
  // }, []);

  useEffect(() => {
    const fetchData = async () => {

      if (slug) {
        const data = await fetchNormalChats(slug);
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
    const handleChatResponse = async (data: any) => {
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
      const remainingChunks = responseChunks.current;
      const currentState = tempChatStoreRef.current;

      const finalData = {
        message: currentState.message + remainingChunks.message,
        thinking: currentState.thinking + remainingChunks.thinking
      };

      const saveModelResponse = {
        id: Date.now(),
        role: "model",
        message: {
          think: finalData.thinking,
          message: finalData.message
        },
        completionTime: data.timeTook,
        finished: data.status === 200 ? true : false,
      }


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

    window.electronAPI.onChat(handleChatResponse)

    window.electronAPI.onChatEnd(handleChatEnd);


    return () => {
      window.electronAPI.removeChatListener(handleChatResponse);
      window.electronAPI.removeChatEndListener(handleChatEnd);
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
      navigate("/c/" + id);
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isWaitingForResponse && input.trim()) {
        setChatSlug();
      }
    }
  };

  return (
    <div className="h-full flex flex-1 pt-0 ">
      <div className="h-full p-1 flex justify-center gap-2 items-center w-full overflow-y-auto">

        {/* Chat Section */}
        <div className={` flex flex-col h-full w-full rounded-md  "max-w-full"`}>
          <div className="flex flex-col flex-1 my-2">
            <MemoizedMarkdown currentResponse={tempChatStore} ChatsArray={chatsArray} isWaitingForResponse={isWaitingForResponse} />
            <div ref={messagesEndRef} />
          </div>

          {/* Input Section */}
          <div className="px-8 md:px-24 xl:px-32">
            <Prompt
              chatRef={chatRef}
              input={input}
              setInput={setInput}
              handleKeyDown={handleKeyDown}
              onSubmit={setChatSlug}
              isWaitingForResponse={isWaitingForResponse}
              isSocketReady={isSocketReady}
            />
          </div>
        </div>
      </div>

    </div>
  );
}

const ChatUserMarkdown = ({ response }) => {
  if (!response || !response.message) return null;

  return (
    <Card className="shadow-none max-w-9/12 rounded-sm bg-muted/90 flex justify-end items-end gap-2 p-2 border-0 select-text">
      <div className="rounded-sm w-full text-sm select-text cursor-text">
        <Markdown
          remarkPlugins={[remarkGfm]}
          components={{
            code({ children, className, ...props }) {
              const match = /language-(\w+)/.exec(className || "");
              return match ? (
                <Card className="border-0 overflow-clip my-2 select-text">
                  <SyntaxHighlighter
                    {...props}
                    language={match[1]}
                    style={vscDarkPlus}
                    customStyle={{
                      margin: 0,
                      fontSize: "12px",
                      userSelect: "text"
                    }}
                  >
                    {String(children).replace(/\n$/, "")}
                  </SyntaxHighlighter>
                </Card>
              ) : (
                <code
                  {...props}
                  className="bg-slate-600 p-1 rounded text-white text-xs select-text cursor-text"
                  style={{ userSelect: "text" }}
                >
                  {children}
                </code>
              );
            },
            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
            h1: ({ children }) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
            h2: ({ children }) => <h2 className="text-base font-semibold mb-2">{children}</h2>,
            h3: ({ children }) => <h3 className="text-sm font-medium mb-1">{children}</h3>,
            ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
            li: ({ children }) => <li className="text-sm">{children}</li>,
          }}
        >
          {response.message}
        </Markdown>
      </div>
    </Card>
  );
};

const ChatModelMarkdown = ({ response, isThinking }) => {
  if (!response || !response.message) return null;


  console.log(response);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).catch(() => {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
      } catch { }
      document.body.removeChild(textArea);
    });
  };

  return (
    <Card className={`shadow-none border-none flex justify-end items-end gap-2 select-text ${isThinking ? "p-1 bg-secondary/70 text-zinc-400 overflow-clip italic" : "bg-transparent px-0 py-0"}`}>
      <div className={`designed-scroll-bar h-full w-full ${isThinking ? "rounded-md" : ""} overflow-auto select-text cursor-text`}>
        <Markdown
          remarkPlugins={[remarkGfm]}
          components={{
            code({ children, className, ...props }) {
              const match = /language-(\w+)/.exec(className || "");
              const codeString = String(children).replace(/\n$/, "");

              return match ? (
                <div className="bg-muted/80 my-3 rounded-md overflow-clip border ">
                  <div className="px-3 py-2 flex items-center justify-between bg-muted border-b">
                    <div className="text-foreground font-medium text-sm">
                      {response.path || match[1]}
                    </div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(codeString);
                            }}
                            className="h-7 w-7 p-0"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Copy Code</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <SyntaxHighlighter
                    {...props}
                    language={match[1]}
                    style={vscDarkPlus}
                    className="designed-scroll-bar "
                    customStyle={{
                      margin: 0,
                      borderTopLeftRadius: 0,
                      borderTopRightRadius: 0,
                      fontSize: "13px",
                      lineHeight: "1.4"
                    }}
                  >
                    {codeString}
                  </SyntaxHighlighter>
                </div>
              ) : (
                <code
                  {...props}
                  className={`${isThinking ? "bg-zinc-700/85" : "bg-zinc-800"} px-1 py-0.5 rounded text-sm font-mono`}
                >
                  {children}
                </code>
              );
            },
            p: ({ children }) => <p className="leading-7 [&:not(:first-child)]:mt-6">{children}</p>,
            h1: ({ children }) => <h1 className="scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance">{children}</h1>,
            h2: ({ children }) => <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">{children}</h2>,
            h3: ({ children }) => <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">{children}</h3>,
            h4: ({ children }) => <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">{children}</h4>,
            blockquote: ({ children }) => <blockquote className="mt-6 border-l-2 pl-6 italic">{children}</blockquote>,
            small: ({ children }) => <small className="text-sm leading-none font-medium">{children}</small>,

            ul: ({ children, depth = 0 }) => (
              <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
                {children}
              </ul>
            ),

            ol: ({ children, depth = 0, start = 1 }) => (
              <ol className={`
                mb-4 last:mb-0 space-y-2 
                ${depth > 0 ? 'ml-6 mt-2 mb-2 space-y-1' : 'ml-0'}
              `}
                style={{
                  listStyle: 'none',
                  counterReset: `list-counter ${start - 1}`
                }}>
                {children}
              </ol>
            ),

            li: ({ children, ordered, ...props }) => {
              const isOrdered = props.node?.parent?.tagName === 'ol';
              const depth = (props.node?.parent?.depth || 0) - 2;

              return (
                <li className="leading-relaxed relative"
                  style={isOrdered ? { counterIncrement: 'list-counter' } : {}}>
                  <div className="flex items-start gap-3">

                    <div className={`
                      flex-shrink-0 select-none flex items-center justify-center
                      transition-colors duration-200
                      ${isThinking ? "bg-zinc-400" : ""}
                      ${isOrdered
                        ? 'w-7 h-7 bg-primary/10 text-primary border border-primary/20 rounded-full font-semibold text-sm hover:bg-primary/20'
                        : 'w-2 h-2 bg-primary rounded-full mt-2 hover:bg-primary/80'
                      }
                      ${depth > 0 ? 'scale-90' : ''}
                    `}>
                      {isOrdered && (
                        <span className="font-bold -zinc-500 text-xs" style={{
                          content: 'counter(list-counter)'
                        }}>
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className={`${isThinking ? "text-zinc-400" : "text-foreground"}`}>{children}</div>
                    </div>
                  </div>
                </li>
              );
            },

            table: ({ children }) => (
              <div className="my-6 w-full overflow-y-auto">
                <table className="w-full">{children}</table>
              </div>
            ),
            thead: ({ children }) => (
              <thead>{children}</thead>
            ),
            tr: ({ children }) => (
              <th className="even:bg-muted m-0 border-t p-0">{children}</th>
            ),
            th: ({ children }) => (
              <th className="border-b border-muted bg-muted/50 px-4 py-3 text-left font-semibold text-sm">{children}</th>
            ),
            td: ({ children }) => <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">{children}</td>,
          }}
        >
          {response.message}
        </Markdown>
      </div>
    </Card >
  );
};

const MemoizedUserMarkdown = memo(ChatUserMarkdown);
const MemoizedModelMarkdown = memo(ChatModelMarkdown);

interface MemoizedMarkdownProps {
  currentResponse: String;
  ChatsArray: any;
  isWaitingForResponse: any;
}


const MemoizedMarkdown = memo(({ currentResponse, ChatsArray, isWaitingForResponse }: MemoizedMarkdownProps) => {
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
        className="List designed-scroll-bar h-full w-full flex-1 px-8 md:px-24 xl:px-32"
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

MemoizedMarkdown.displayName = "MemoizedMarkdown";