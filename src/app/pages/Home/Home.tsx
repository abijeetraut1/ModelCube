import React, { useRef, useState, useEffect } from "react";

import { fetchNormalChats } from "@/lib/Database/ChatsDB";
import { checkHistoryTitle } from "@/lib/Database/CheckHistory";
import { v4 as uuidv4 } from "uuid";
import Welcome from "@/app/compnents/welcome/welcome";
import Prompt from "@/app/compnents/Prompt/Prompt";
import { getSlugs, storeSlugs } from "@/lib/Database/StoreSlugs";
import { useParams } from "react-router-dom";


export default function Home({ params }: { params: Promise<{ slug: string }> }) {
    const [input, setInput] = useState("");
    const [chatsArray, setChatsArray] = useState([]);
    const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
    const [isSocketReady, setIsSocketReady] = useState(false);
    const socketRef = useRef(null);
    const messagesEndRef = useRef(null);
    const chatRef = useRef<HTMLTextAreaElement | null>(null);
    const [tempChatStore, setTempChatStore] = useState(null);
    const [mounted, setMounted] = useState(false);


    const { slug } = useParams();

    useEffect(() => {
        // checks the new slug everytime when the user visits
        const generateSlugs = async () => {
            const newSlug = uuidv4();
            const conversationSlug = await getSlugs();

            if (!conversationSlug.message.includes(newSlug)) {
                await storeSlugs(newSlug);
            } else {
                generateSlugs();
            }
        }

        generateSlugs();
    }, []);

    // Add mounted state to prevent SSR issues
    useEffect(() => {
        setMounted(true);
    }, []);

    // useEffect(() => {
    //   // Only initialize socket on client side
    //   if (!mounted) return;

    //   const socket = initializeSocket();

    //   // Check if socket is null (can happen on server side)
    //   if (!socket) {
    //     console.warn("Socket initialization failed");
    //     return;
    //   }

    //   const handleConnect = () => {
    //     console.log("Socket connected");
    //     socketRef.current = socket;
    //     setIsSocketReady(true);
    //   };

    //   const handleDisconnect = () => {
    //     console.log("Socket disconnected");
    //     setIsSocketReady(false);
    //   };

    //   if (socket.connected) {
    //     socketRef.current = socket;
    //     setIsSocketReady(true);
    //   }

    //   socket.on("connect", handleConnect);
    //   socket.on("disconnect", handleDisconnect);

    //   return () => {
    //     socket.off("connect", handleConnect);
    //     socket.off("disconnect", handleDisconnect);
    //   };
    // }, [mounted]);

    useEffect(() => {
        // Only fetch data on client side
        if (!mounted) return;

        const fetchData = async () => {
            const history = await checkHistoryTitle();

            if (slug) {
                const data = await fetchNormalChats(slug);
                setChatsArray(data || []);
            }
        };

        fetchData();
    }, [slug, mounted]);

    useEffect(() => {
        if (!chatRef.current) return;
        chatRef.current.style.height = "auto";
        chatRef.current.style.height = `${Math.min(chatRef.current.scrollHeight, 256)}px`;
    }, [input]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatsArray, isWaitingForResponse]);

    useEffect(() => {
        // Only add socket listeners on client side
        if (!mounted) return;

        const handleChatResponse = async (data: any) => {
            setTempChatStore((prev) => {
                let newMessage;
                if (data.type === "segment") {
                    // contains thinking

                    if (data.segment === "thought" && data.segmentStartTime != null) {
                        // runs while start the thinkingc
                        newMessage = `<thinking> + ${data.text}`
                    } else if (data.segment === "thought" && data.segmentStartTime != null) {
                        // runs while ending the thinking
                        newMessage = data.text

                    } else {
                        // middle of thinking content
                        newMessage = `${data.text}</thinking>`
                    }

                } else {
                    // this is compelte
                    newMessage = data.text
                }

                return [...prev, newMessage]
            });

            // const modelMessage = {
            //   id: Date.now(),
            //   role: "model",
            //   message: data.message.content || data.code || "No response",
            // };

            // if (slug) {
            //   await saveNormalChats(slug, 1111, modelMessage);
            //   const updatedChats = await fetchNormalChats(slug, 1111);
            //   setChatsArray(updatedChats || []);
            // }

            setIsWaitingForResponse(false);
        };

        // ListenToEvent("chat_response", handleChatResponse);
    }, [slug, mounted]);

    // Move setChatSlug logic to the main component
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

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        setChatSlug();
        // if (e.key === "Enter" && !e.shiftKey) {
        //   e.preventDefault();
        //   if (!isWaitingForResponse && input.trim()) {
        //   }
        // }
    };

    // Don't render anything until mounted on client side
    if (!mounted) {
        return null;
    }


    return (
        <div className=" h-full flex flex-1  pt-0">
            <div className="h-full p-1 flex justify-center gap-2 items-center w-full overflow-y-auto">

                {/* Chat Section */}
                <div className="flex flex-col h-full w-full rounded-md max-w-full">

                    <Welcome />

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