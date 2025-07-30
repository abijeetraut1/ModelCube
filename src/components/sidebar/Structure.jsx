"use client"
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Loader, Folder as FolderIcon } from "lucide-react";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
    SidebarGroup,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { useDispatch } from "react-redux";
import { setCurrentViewingFile } from "@/lib/Redux/Reducers/SystemWorkflow";

import { useSelector } from "react-redux";
import { FileJson2 } from "lucide-react";

const contentVariants = {
    hidden: {
        opacity: 0,
        height: 0,
        overflow: "hidden"
    },
    visible: {
        opacity: 1,
        height: "auto",
        transition: {
            duration: 0.3,
            ease: "easeInOut"
        }
    },
    exit: {
        opacity: 0,
        height: 0,
        transition: {
            duration: 0.2,
            ease: "easeInOut"
        }
    }
};

export function StructureCreator({ Items, Title, Section }) {
    const dispatch = useDispatch();
    const { Title: systemTitle, Category, Database, Backend_Framework } = useSelector(state => state.prompt);

    const changeFile = (path) => {
        dispatch(setCurrentViewingFile(path));
    }

    return (
        <SidebarGroup className="py-0 px-0 overflow-y-auto h-full">
            <SidebarMenu className="overflow-y-auto">
                <Collapsible asChild defaultOpen={true} className="designed-scroll-bar group/parentfolder">
                    <div className="overflow-y-auto">
                        <CollapsibleTrigger asChild>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    tooltip={Section}
                                    className="hover:bg-white/10 hover:backdrop-blur-sm hover:shadow-sm"
                                >
                                    <FolderIcon />
                                    <span>
                                        {systemTitle}
                                    </span>
                                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/parentfolder:rotate-90" />
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </CollapsibleTrigger>
                        <AnimatePresence initial={false}>
                            <CollapsibleContent asChild>
                                <motion.div
                                    variants={contentVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    key="parentFolder"
                                >
                                    <SidebarMenuItem className="px-2">
                                        {Items && Items.map((Folder) => (
                                            <Collapsible
                                                key={Folder.Folder}
                                                asChild
                                                defaultOpen={true}
                                                className="px-0 m-0 group/folder"
                                            >
                                                <SidebarMenuItem>
                                                    <CollapsibleTrigger defaultOpen={true} asChild>
                                                        <SidebarMenuButton defaultOpen={true} className="hover:bg-white/10 hover:backdrop-blur-sm hover:shadow-sm" tooltip={Folder.title}>
                                                            <FolderIcon />
                                                            <span>{Folder.Folder}</span>
                                                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/folder:rotate-90" />
                                                        </SidebarMenuButton>
                                                    </CollapsibleTrigger>
                                                    <AnimatePresence mode="wait" initial={false}>
                                                        <CollapsibleContent asChild>
                                                            <motion.div
                                                                variants={contentVariants}
                                                                initial="hidden"
                                                                animate="visible"
                                                                exit="exit"
                                                                key={`folder-${Folder.Folder}`}
                                                            >
                                                                <SidebarMenuSub>
                                                                    {Array.isArray(Folder.Files) ? (
                                                                        Folder.Files?.map((subFile) => (
                                                                            <SidebarMenuButton key={subFile} className="hover:bg-white/10 w-full hover:backdrop-blur-sm hover:shadow-sm" asChild>
                                                                                <div title={subFile} className="cursor-pointer w-full flex items-center gap-2" onClick={() => changeFile(`${Folder.Folder}/${subFile}`)}>
                                                                                    <FileJson2 />
                                                                                    <p>{subFile} </p>
                                                                                </div>
                                                                            </SidebarMenuButton>
                                                                        ))
                                                                    ) : (
                                                                        Object.entries(Folder.Files).map(([subFolderName, subFolderContents]) => (
                                                                            <Collapsible
                                                                                key={subFolderName}
                                                                                asChild
                                                                                defaultOpen={true}
                                                                                className="group/subfolder"
                                                                            >
                                                                                <div>
                                                                                    <CollapsibleTrigger asChild>
                                                                                        <SidebarMenuButton className="mx-0 px-0 hover:bg-white/10 hover:backdrop-blur-sm hover:shadow-sm" tooltip={subFolderName}>
                                                                                            <FolderIcon />
                                                                                            <span>{subFolderName} </span>
                                                                                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/subfolder:rotate-90" />
                                                                                        </SidebarMenuButton>
                                                                                    </CollapsibleTrigger>
                                                                                    <AnimatePresence mode="wait" initial={false}>
                                                                                        <CollapsibleContent asChild>
                                                                                            <motion.div
                                                                                                variants={contentVariants}
                                                                                                initial="hidden"
                                                                                                animate="visible"
                                                                                                exit="exit"
                                                                                                key={`subfolder-${subFolderName}`}
                                                                                            >
                                                                                                <SidebarMenuSub className="mx-0 border-l p-0">
                                                                                                    {Array.isArray(subFolderContents) ? (
                                                                                                        subFolderContents.map((file) => (
                                                                                                            <SidebarMenuButton key={file} title={file} onClick={() => changeFile(`${Folder.Folder}/${subFolderName}/${file}`)} className="cursor-pointer hover:bg-white/10 hover:backdrop-blur-sm hover:shadow-sm" asChild>
                                                                                                                <div>
                                                                                                                    <FileJson2 />
                                                                                                                    <span>{file} </span>
                                                                                                                </div>
                                                                                                            </SidebarMenuButton>
                                                                                                        ))
                                                                                                    ) : (
                                                                                                        <SidebarMenuSubItem key={subFolderContents}>
                                                                                                            <SidebarMenuSubButton asChild>
                                                                                                                <div>
                                                                                                                    <span>{subFolderContents}</span>
                                                                                                                </div>
                                                                                                            </SidebarMenuSubButton>
                                                                                                        </SidebarMenuSubItem>
                                                                                                    )}
                                                                                                </SidebarMenuSub>
                                                                                            </motion.div>
                                                                                        </CollapsibleContent>
                                                                                    </AnimatePresence>
                                                                                </div>
                                                                            </Collapsible>
                                                                        ))
                                                                    )}
                                                                </SidebarMenuSub>
                                                            </motion.div>
                                                        </CollapsibleContent>
                                                    </AnimatePresence>
                                                </SidebarMenuItem>
                                            </Collapsible>
                                        ))}
                                    </SidebarMenuItem>
                                </motion.div>
                            </CollapsibleContent>
                        </AnimatePresence>
                    </div>
                </Collapsible>
            </SidebarMenu>
        </SidebarGroup>
    );
}