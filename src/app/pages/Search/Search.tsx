import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    Search as searchIcon, User, FileText, Code, PackageOpen, ImageIcon, Video,
    Music, Archive, Clock, Eye, Download, HardDrive, Package
} from "lucide-react";

import Search_LLMS from "./Huggingface_Models/Search_HF_Models";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Headers } from "@/app/compnents/Headers/Headers";
import MODELS_DOWNLOAD_URL from "@/constant/Models";
import { toast } from "sonner";
import { useDownload } from "@/hooks/useDownload";
import { electron } from "process";
import { storeDownloadFile } from "@/lib/Database/Download";

export default function Search() {
    const [models, setModels] = useState<string | null>(null);
    const [search, setSearch] = useState<string | null>("deepseek-r1");
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    useEffect(() => {
        searchLLM();
    }, []);

    const getTypeIcon = (type) => {
        switch (type) {
            case "document": return <FileText className="w-4 h-4" />;
            case "code": return <Code className="w-4 h-4" />;
            case "image": return <ImageIcon className="w-4 h-4" />;
            case "video": return <Video className="w-4 h-4" />;
            case "audio": return <Music className="w-4 h-4" />;
            case "model": return <Package className="w-4 h-4" />;
            case "model-variant": return <PackageOpen className="w-4 h-4" />;
            default: return <Archive className="w-4 h-4" />;
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case "document": return "bg-blue-100 text-blue-700";
            case "code": return "bg-green-100 text-green-700";
            case "image": return "bg-purple-100 text-purple-700";
            case "video": return "bg-red-100 text-red-700";
            case "audio": return "bg-yellow-100 text-yellow-700";
            default: return "bg-gray-100 text-gray-700";
        }
    };

    const searchLLM = async (slug: string) => {
        try {
            const response = await Search_LLMS({ model_name: slug ? slug : search });
            if (response.message === "Fetch Successfull") {
                console.log(response);
                setModels(response.models);
            } else {
                toast.error(response.message + " for " + search);
            }
        } catch (error) {
            console.error(error);
            toast.error(response.message);
            toast.error("Please Connect To Internet");
        }
    };

    const updateDownloadLink = (slug) => {
        console.log(slug)
        setSearch(slug);
        searchLLM(slug);
    }

    const triggersDownload = async ({ filename, downloadUrl }) => {


        window.electronAPI.ipcRenderer.send("get-download-url", {
            filename, downloadUrl
        });
        console.log(filename, downloadUrl);

        await storeDownloadFile({
            fileName: filename,
            url: downloadUrl,
            progress: 0,
            status: "downloading"
        })


        // toast.error("System Error", {
        //     description: "Please download manually using the link in your browser."
        // });

        // navigator.clipboard.writeText(file.downloadUrl)
        //     .then(() => {
        //         toast.success("Copied!", {
        //             description: "Link copied to clipboard."
        //         });
        //     }).catch(() => {
        //         toast.error("Failed", {
        //             description: "Could not copy the link."
        //         });
        //     });
    };


    return (
        <div>
            <Headers />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="space-y-2">
                    <div className="flex w-full space-x-2">
                        <div className="relative w-full">
                            <searchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                            <Input
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search for anything..."
                                className="pl-4 w-full"
                                defaultValue="deepseek-r1"
                            />
                        </div>
                        <div className="relative">
                            <Button className="cursor-pointer" onClick={searchLLM}>Search</Button>
                        </div>
                    </div>
                    <div className="designed-scroll-bar flex space-x-2 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
                        <div className="designed-scroll-bar flex w-full space-x-2 overflow-x-auto">
                            {MODELS_DOWNLOAD_URL.map(({ name, slug }, idx) => (
                                <Button
                                    key={idx}
                                    onClick={() => updateDownloadLink(slug)}
                                    variant={hoveredIndex === idx ? "default" : "outline"}
                                    className="cursor-pointer flex-shrink-0 whitespace-nowrap"
                                    onMouseOver={() => setHoveredIndex(idx)}
                                    onMouseOut={() => setHoveredIndex(null)}
                                >
                                    {name}
                                </Button>
                            ))}
                        </div>
                    </div>

                </div>

                <div className="space-y-4 py-2">
                    <p className="text-muted-foreground">Search Result for "{search}" </p>
                    {models && models.map((model, index) => (
                        <Card key={index} className="hover:shadow-md transition-shadow">
                            <CardContent className="px-6 py-0">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 space-y-3">
                                        <div className="flex items-start space-x-3">
                                            <div className={`p-2 rounded-lg ${getTypeColor("model")}`}>
                                                {getTypeIcon("model")}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold text-foreground hover:text-primary transition-colors">
                                                    {model.modelId.split("/").pop()}
                                                </h3>
                                                <p className="text-muted-foreground text-sm mt-1">
                                                    Pipeline: {model.pipeline_tag || "N/A"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                            {/* <div className="flex items-center space-x-1"><User className="w-3 h-3" /><span>{model.developer}</span></div> */}
                                            {/* <div className="flex items-center space-x-1"><Eye className="w-3 h-3" /><span>{model.likes?.toLocaleString?.() || 0}</span></div> */}
                                            <div className="flex items-center space-x-1">
                                                <Clock className="w-3 h-3" />
                                                <span>{new Date(model.createdAt).toLocaleString("en-US", {
                                                    year: "numeric", month: "long", day: "numeric",
                                                })}</span>
                                            </div>
                                            <div className="flex items-center space-x-1"><Download className="w-3 h-3" /><span>{model.download?.toLocaleString?.() || 0}</span></div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex flex-wrap gap-1">
                                                {model.tags.map((tag, tagIndex) => (
                                                    <Badge key={tagIndex} variant="outline" className="text-xs">{tag}</Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-3">
                                    <Accordion type="single" className="w-full" collapsible>
                                        <AccordionItem value="item-1">
                                            <AccordionTrigger>
                                                <div className="flex items-center space-x-2">
                                                    {getTypeIcon("model-variant")}
                                                    <h2>Files</h2>
                                                    <Badge variant="secondary">
                                                        {model.files?.filter((file) => file.sizeGB >= 0).length || 0}
                                                    </Badge>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent className="space-y-2">
                                                {model.files && model.files.map((file, fileIndex) => (
                                                    file.sizeGB >= 0 && (
                                                        <Card key={file.filename + "-" + fileIndex + "-" + file.sizeGB} className="w-full hover:shadow-md transition-shadow">
                                                            <CardContent className="px-4 py-0">
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center space-x-3">
                                                                        <div className="p-2 bg-muted rounded-lg">
                                                                            <HardDrive className="w-4 h-4" />
                                                                        </div>
                                                                        <div>
                                                                            <h4 className="text-base font-semibold text-foreground">{file.filename}</h4>
                                                                            <div className="flex items-center space-x-2 mt-1">
                                                                                <span className="text-sm text-muted-foreground">Size: {file.sizeGB} GB</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    {file.downloadUrl ? (
                                                                        <Button
                                                                            className="cursor-pointer"
                                                                            onClick={() => triggersDownload({
                                                                                downloadUrl: file.downloadUrl,
                                                                                filename: file.filename
                                                                            })}
                                                                        >
                                                                            <Download className="w-4 h-4" />
                                                                        </Button>
                                                                    ) : (
                                                                        <Button disabled>Unavailable</Button>
                                                                    )}
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                    )
                                                ))}
                                            </AccordionContent>
                                        </AccordionItem>
                                    </Accordion>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
