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
import { Headers } from "@/app/compnents/Headers/Headers";


export default function Download() {
    const location = useLocation();
    const pathname = location.pathname;
    const [download, setDownloads] = useState(null);

    const [progress, setProgress] = useState(0);
    const [downloadInfo, setDownloadInfo] = useState(null);

    useEffect(() => {
        // Listen for live progress
        window.electronAPI.ipcRenderer.on("download-progress", (progress) => {
            console.log(progress)
            setProgress(progress.percent);
        });

        // ✅ Ask main process for current state when this page loads
        window.electronAPI.ipcRenderer.send("get-current-download");

        window.electronAPI.ipcRenderer.on("current-download", (progress) => {
            if (progress) setProgress(progress.percent);
        });

        return () => {
            window.electronAPI.ipcRenderer.removeAllListeners("download-progress");
            window.electronAPI.ipcRenderer.removeAllListeners("current-download");
        };
    }, []);




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


    // useEffect(() => {
    //     window.electronAPI.ipcRenderer.on("download-start", (event, data) => {
    //         console.log("Download started:", data);
    //         setDownloads(prev => ({
    //             ...prev,
    //             [data.filename]: {
    //                 received: 0,
    //                 total: data.totalBytes,
    //                 state: 'starting'
    //             }
    //         }));
    //     });
    // }, []);


    return (
        <div>

            <Headers />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">


                {download ? <Downloads /> : <NoDownload />}


            </div>
        </div>
    );
}

const NoDownload = () => {
    return (
        <div>
            No Downloads
        </div>
    )
}


const Downloads = () => {
    return (
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
    )
}