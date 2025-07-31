import { useState, useEffect, useRef } from "react";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useSelector, useDispatch } from "react-redux";
import Render_Function from "./Components/Render_Function";
import { setGeneratedFolders } from "@/lib/Redux/Reducers/response";
import Header from "./Components/Header";
import { useParams } from "react-router-dom";
import { setSlug } from "@/lib/Redux/Reducers/SystemWorkflow";
import { RequirementIdentifier } from "./Functions/RequirementIdentifier";
import { addChats } from "@/lib/Database/CodesDB";
import { checkHistory } from "@/lib/Database/CheckHistory";
import { toast } from "sonner";

document.title = "Generate";

export default function Playground() {
  const dispatch = useDispatch();
  const { slug } = useParams();
  const { currentViewingFile } = useSelector(state => state.workflow);

  // Initialize socketRef only once
  const socketRef = useRef(null);
  const [isSocketReady, setIsSocketReady] = useState();

  // calculating the code generated index
  const [generationIndex, setGenerationIndex] = useState(0);

  // const PromptResponsesRef = useRef({ data: [], text: null });
  const [File, setFile] = useState();
  const [ResponseCodes, setResponseCodes] = useState([]);
  const [value, setValue] = useState("console.log('hello world!');");
  const [codeGenerationActivate, setCodeGenerationActivate] = useState(false);

  const { Folders, Category, Database_Tables, Description, Backend_Framework, Database, ORM } = useSelector(state => state.prompt);
  const { FoldersPath, GeneratedFolders } = useSelector(state => state.response);

  useEffect(() => {

    toast.error("Local init failed", {
      description: "Too resource-intensive; switching online."
    });

  }, []);


  useEffect(() => {
    setSlug(dispatch(setSlug(slug)));

    (async () => {
      const user_id = 1122;
      const generationIndex = await checkHistory(slug, user_id, dispatch);
      if (!generationIndex) return;
      // console.log(generationIndex.codes)
      setGenerationIndex(generationIndex.codes.length);
    })();
  }, [slug])


  useEffect(() => {
    // Initialize socket first
    const socket = null; // Use initializeSocket instead of getSocket

    const handleConnect = () => {
      socketRef.current = socket;
      setIsSocketReady(true);
    };

    const handleDisconnect = () => {
      setIsSocketReady(false);
    };

    // Check connection status immediately
    // if (socket.connected) {
    //   setIsSocketReady(true);
    // }

    // Set up listeners
    // socket.on("connect", handleConnect);
    // socket.on("disconnect", handleDisconnect);

    // return () => {
    //   // Clean up listeners
    //   socket.off("connect", handleConnect);
    //   socket.off("disconnect", handleDisconnect);
    // };
  }, []);



  socketRef.current?.on("trigger_code_generation", (data) => {
    setCodeGenerationActivate(data.start_code_generation);
  })

  useEffect(() => {
    if (!codeGenerationActivate || generationIndex >= FoldersPath.length) {
      return;
    }

    (async () => {

      try {
        const fileToSend = FoldersPath[generationIndex];

        dispatch(setGeneratedFolders(fileToSend));

        if (fileToSend.startsWith("controllers/") || fileToSend.startsWith("routes/")) {
          const requredDatas = await RequirementIdentifier(slug, Category, GeneratedFolders, fileToSend);


          if (generationIndex <= FoldersPath.length) {

            socketRef.current?.emit("prompt", { path: fileToSend, relative: JSON.stringify(requredDatas) });
          }

        } else {

          if (generationIndex <= FoldersPath.length) {
            socketRef.current?.emit("prompt", { path: fileToSend });
          }
        }

      } catch (err) {
        console.error("Error during code generation:", err);
      }
    })();
  }, [codeGenerationActivate, generationIndex, FoldersPath]);

  useEffect(() => {
    if (!codeGenerationActivate) return;

    const responseHandler = (data) => {
      // console.log(data);

      setGenerationIndex((currentIndex) => {
        if (currentIndex >= FoldersPath.length) {
          socketRef.current?.off("response", responseHandler);
          return currentIndex;
        }

        const regex = /(\`{3}[\s\S]*?\`{3})|([\s\S]+?)(?=\`{3}|$)/g;
        const code = data.code.match(regex);
        const extractedIndex = code.findIndex(block => block.match(/```[\w]*\n?/));

        let textBlock = "";
        code.forEach((el, i) => {
          if (extractedIndex !== i) {
            textBlock += el;
          }
        });

        const CodeBlocks = {
          code: code[extractedIndex].replace(/```[\w]*\n?/, '').replace(/```$/, '').trim(),
          text: textBlock
        };

        // console.log(data)
        const user_id = 1123;
        const upload = addChats(slug, user_id, CodeBlocks, data.path);

        // saveData(slug, Category, data.path, CodeBlocks);
        // console.log("Successfully added: " + data.path);
        return currentIndex + 1;
      });
    };

    socketRef.current?.on("response", responseHandler);

    return () => {
      socketRef.current?.off("response", responseHandler);
    };

  }, [codeGenerationActivate]);

  useEffect(() => {
    if (socketRef.current && isSocketReady) {
      const prompt = {
        Database_Tables,
        Category,
        Folders,
        Description,
        Database,
        ORM,
        Backend_Framework
      };


      // socketRef.current.emit("prompt", { prompt: prompt });
      // System_Requirement_Initiator(prompt);
      socketRef.current.emit("system_initialization", { prompt });
    }
  }, [isSocketReady]);

  useEffect(() => {
    if (Array.isArray(ResponseCodes)) {
      const currentCode = ResponseCodes.find(el => el.path === currentViewingFile);

      if (currentCode) {
        setValue(currentCode.code);
        setFile(currentViewingFile.split("/"));
      }
    }
  }, [currentViewingFile]);



  return (
    <SidebarProvider className="h-full">
      {/*  <AppSidebar codes={refactorResponse} SendPrompt={Refactor_Initator_Prompt} isDatabaseRequired={true} isFolderStructureRequire={true} /> */}

      <SidebarInset className=" bg-muted/40">

        {/* <Header /> */}

        <div className="flex flex-1 flex-row gap-4">
          <Render_Function Files={ResponseCodes} />
        </div>

      </SidebarInset>

    </SidebarProvider>
  )
}
