import { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Download as DownloadIcon } from 'lucide-react';
// const { ipcRenderer } = window.require("electron");

export default function Download() {
    const [progress, setProgress] = useState(0);
    const location = useLocation();
    const pathname = location.pathname;
    const [download, setDownloads] = useState({});

    // useEffect(() => {
    //     if (pathname === '/download') {
    //         const handleProgress = (event: any, data: { progress: number }) => {
    //             setProgress(data.progress);
    //             console.log(`Download progress: ${data.progress}%`);
    //         };

    //         const handleComplete = (event: any, filePath: string | null) => {
    //             if (filePath) {
    //                 console.log('Download complete:', filePath);
    //             } else {
    //                 console.log('Download canceled or failed');
    //             }
    //         };

    //         window.electronAPI?.onDownloadProgress(handleProgress);
    //         window.electronAPI?.onDownloadCompleted(handleComplete);

    //         return () => {
    //             window.electronAPI?.onDownloadProgress(() => { });
    //             window.electronAPI?.onDownloadCompleted(() => { });
    //         };
    //     }
    // }, [pathname]);


    useEffect(() => {
        window.electronAPI.ipcRenderer.on("download-start", (event, data) => {
            console.log("Download started:", data);
            setDownloads(prev => ({
                ...prev,
                [data.filename]: {
                    received: 0,
                    total: data.totalBytes,
                    state: 'starting'
                }
            }));
        });
    }, []);


    return (
        <div>
            <div className="border-b">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-4">
                            <Link
                                to="/"
                                className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                <span>Back to Home Screen</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* <div className="space-y-4 py-6">
                    <h1 className="text-2xl font-bold">Download Page</h1>
                    <p className="mt-4">Download progress: {progress}%</p>
                </div> */}

                <Card className="w-full">
                    <CardHeader>
                        <CardTitle>Model Name</CardTitle>
                    </CardHeader>


                    <CardContent>
                        {/*  download progress bar */}
                        <div className='bg-white h-2 rounded-md'></div>

                        {/* download counter */}
                        <div className='py-2 flex gap-2 items-center'>
                            <DownloadIcon className='h-4 w-4' />

                            <div className='flex items-center gap-2'>
                                <p className="leading-7">0</p>
                                <p className="leading-7">/</p>
                                <p className="leading-7">5GB</p>
                            </div>
                        </div>

                    </CardContent>


                    <CardFooter className=" gap-2">
                        <Button type="submit" >
                            Pause
                        </Button>
                        <Button variant="destructive" >
                            Cancel
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
