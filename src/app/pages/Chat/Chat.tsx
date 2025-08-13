import React, { useRef, useState, useEffect } from "react";
import { MemoizedMarkdown } from "@/app/compnents/Markdown/MemoizedMarkdown";
import { useNavigate, useParams } from "react-router-dom";

// import { initializeSocket } from "@/lib/Services/socketConnection";
import { createDatabase, updateCodes } from "@/lib/Database/CodesDB";
import { fetchNormalChats, saveNormalChats, updateTitle } from "@/lib/Database/ChatsDB";
import { v4 as uuidv4 } from "uuid";
import Prompt from "@/app/compnents/Prompt/Prompt";
import { useDispatch } from "react-redux";
import { setSlug } from "@/lib/Redux/Reducers/SystemWorkflow";


export default function Chat() {
  const dispatch = useDispatch();
  const [input, setInput] = useState("");
  const navigate = useNavigate()
  const [chatsArray, setChatsArray] = useState([]);
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  // const socketRef = useRef(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const chatRef = useRef<HTMLTextAreaElement | null>(null);
  const [tempChatStore, setTempChatStore] = useState({ message: "", thinking: "" });
  const responseChunks = useRef<{ message: string; thinking: string }>({
    message: "",
    thinking: ""
  });


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
      console.log(data)

      if (data.message === "set-title") {
        // updateCodes(slug, );
        updateTitle(slug, data.title);

        setTimeout(() => {
          dispatch(setSlug(slug));
        }, 1000);
      } else {

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

          <div className="px-2 md:px-4 xl:px-28">
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

