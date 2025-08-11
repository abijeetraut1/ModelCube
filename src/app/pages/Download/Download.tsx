import { useEffect, useState } from 'react';
import { useLocation, Link, useFetcher } from 'react-router-dom';
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
import { Progress } from "@/components/ui/progress"
import { fetchDownloads, updateDownload } from '@/lib/Database/Download';

export default function Download() {
    const location = useLocation();
    const pathname = location.pathname;
    const [onGoingDownload, setOnGoingDownload] = useState(null);
    const [progress, setProgress] = useState(0);
    const [downloadInfo, setDownloadInfo] = useState(null);
    const [prevDownloads, setPrevDownloads] = useState(null);

    useEffect(() => {
        // Listen for live progress
        window.electronAPI.ipcRenderer.on("download-progress", (progress) => {
            console.log(progress)
            updateDownload(progress.filename, progress.progress)

            setProgress(progress.percent);
            setOnGoingDownload(progress);
        });

        // ✅ Ask main process for current state when this page loads
        window.electronAPI.ipcRenderer.send("get-current-download");

        window.electronAPI.ipcRenderer.on("current-download", (progress) => {
            if (progress) {
                setProgress(progress.percent)
                setOnGoingDownload(progress);
            }
        });

        return () => {
            window.electronAPI.ipcRenderer.removeAllListeners("download-progress");
            window.electronAPI.ipcRenderer.removeAllListeners("current-download");
        };
    }, []);

    useEffect(() => {
        (async () => {
            const downloadList = await fetchDownloads();
            if (downloadList.stauts == 200) {
                setPrevDownloads(downloadList.downloads);
            }
        })();
    }, []);




    return (
        <div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-2">
                {onGoingDownload ? <Downloads onGoingDownload={onGoingDownload} /> : <NoDownload />}
                <ListDownload downloadList={prevDownloads} />
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


const Downloads = ({ onGoingDownload }) => {
    // console.log(onGoingDownload);
    return (
        <>
            {
                onGoingDownload.filename && <Card className="w-full">
                    <CardHeader>
                        <CardTitle>{onGoingDownload.filename}</CardTitle>
                    </CardHeader>


                    <CardContent>
                        {/* Download Progress Bar */}
                        <div className="bg-gray-200 h-2 rounded-md w-full">
                            <Progress value={onGoingDownload.progress?.progress || 0} className="bg-secondary" />
                        </div>

                        {/* Download Counter */}
                        <div className="py-2 flex gap-2 items-center text-secondary-foreground/40">
                            <DownloadIcon className="h-4 w-4" />
                            <div className="flex items-center gap-2">
                                <p className="leading-7">{onGoingDownload.progress?.downloaded || 0}</p>
                                <p className="leading-7">/</p>
                                <p className="leading-7">{onGoingDownload.progress?.total || 0}</p>
                                <p className="leading-7">({onGoingDownload.progress?.speed || 0})</p>
                                {/* <p className="leading-7">({progress.status})</p> */}
                            </div>
                        </div>
                    </CardContent>


                    {/* <CardFooter className=" gap-2">
                        <Button type="submit">
                            Pause
                        </Button>
                        <Button variant="destructive" >
                            Cancel
                        </Button>
                    </CardFooter> */}
                </Card>
            }
        </>
    )
}

const ListDownload = ({ downloadList }) => {
    return (
        <div className='space-y-2'>
            {Array.isArray(downloadList) && downloadList.map((downloads, i) => (
                <Card className="w-full" key={i}>
                    <CardHeader>
                        <CardTitle>{downloads.id}</CardTitle>
                    </CardHeader>

                    <CardContent>
                        {/* Download Progress Bar */}
                        <div className="bg-gray-200 h-2 rounded-md w-full">
                            <Progress value={downloads.progress || 0} className='bg-secondary' />
                        </div>

                        {/* Download Counter */}
                        <div className="py-2 flex gap-2 items-center text-secondary-foreground/40">
                            <DownloadIcon className="h-4 w-4" />
                            <div className="flex items-center gap-2">
                                <p className="leading-7">{downloads.downloaded || 0}</p>
                                <p className="leading-7">/</p>
                                <p className="leading-7">{downloads.total || 0}</p>
                                {/* <p className="leading-7">({downloads.progress?.speed || 0})</p> */}
                            </div>
                        </div>
                    </CardContent>

                    {/* <CardFooter className=" gap-2">
                        <Button type="submit" onClick={() => alert(downloads.url)}>
                            Continue
                        </Button>
                        <Button variant="destructive" >
                            Cancel
                        </Button>
                    </CardFooter> */}
                </Card>
            ))
            }
        </div>
    )
}