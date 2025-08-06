import React, { useRef, useState, useEffect } from "react";

import { fetchNormalChats } from "@/lib/Database/ChatsDB";
import { v4 as uuidv4 } from "uuid";
import Welcome from "@/app/compnents/welcome/welcome";
import Prompt from "@/app/compnents/Prompt/Prompt";
import { getSlugs, storeSlugs } from "@/lib/Database/StoreSlugs";
import { useParams } from "react-router-dom";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { toast } from "sonner";


export default function Home({ params }: { params: Promise<{ slug: string }> }) {
    const [input, setInput] = useState("");
    const [chatsArray, setChatsArray] = useState([]);
    const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
    const messagesEndRef = useRef(null);
    const chatRef = useRef<HTMLTextAreaElement | null>(null);
    const [mounted, setMounted] = useState(false);


    const { slug } = useParams();

    // useEffect(() => {
    //     // checks the new slug everytime when the user visits
    //     const generateSlugs = async () => {
    //         const newSlug = uuidv4();
    //         const conversationSlug = await getSlugs();

    //         if (!conversationSlug.message.includes(newSlug)) {
    //             await storeSlugs(newSlug);
    //         } else {
    //             generateSlugs();
    //         }
    //     }

    //     generateSlugs();
    // }, []);

    // Add mounted state to prevent SSR issues
    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        // Only fetch data on client side
        if (!mounted) return;

        const fetchData = async () => {
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


    // Move setChatSlug logic to the main component
    const setChatSlug = async () => {
        toast.success("Model not initialized", {
            description: "please choose a model or download"
        })
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
        toast.success("Model not initialized", {
            description: "please choose a model or download"
        })
        // setChatSlug();
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

                    <Welcome redirect={true} />

                    {/* Input Section */}
                    <div className="px-8 md:px-24 xl:px-32">
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