import React, { useRef, useState, useEffect } from "react";
import { fetchNormalChats } from "@/lib/Database/ChatsDB";
import Welcome from "@/app/compnents/welcome/welcome";
import Prompt from "@/app/compnents/Prompt/Prompt";
import { useParams } from "react-router-dom";
import { toast } from "sonner";


export default function Home() {
    const [input, setInput] = useState("");
    const [chatsArray, setChatsArray] = useState([]);
    const messagesEndRef = useRef(null);
    const chatRef = useRef<HTMLTextAreaElement>();
    const [mounted, setMounted] = useState(false);


    const { slug } = useParams();

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
    }, [chatsArray]);


    // Move setChatSlug logic to the main component
    const setChatSlug = async () => {
        toast.success("Model not initialized", {
            description: "please choose a model or download"
        })
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        toast.success("Model not initialized", {
            description: "please choose a model or download"
        })
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
                            onSubmit={setChatSlug} isWaitingForResponse={false}                            // isWaitingForResponse={isWaitingForResponse}
                        />
                    </div>

                </div>

            </div>
        </div>
    );
}