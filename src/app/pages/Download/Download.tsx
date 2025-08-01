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
import { Headers } from "@/app/compnents/Headers/Headers";
import { Progress } from "@/components/ui/progress"
import { fetchDownloads } from '@/lib/Database/Download';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export default function Download() {
    const location = useLocation();
    const pathname = location.pathname;
    const [download, setDownloads] = useState(null);
    const [onGoingDownload, setOnGoingDownload] = useState(null);
    const [downloadListMode, setDownloadListMode] = useState('ongoing');
    const [progress, setProgress] = useState(0);
    const [downloadInfo, setDownloadInfo] = useState(null);

    useEffect(() => {
        // Listen for live progress
        window.electronAPI.ipcRenderer.on("download-progress", (progress) => {
            console.log(progress)
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

        if (downloadListMode === "incompleted") {

            (async () => {
                const downloadList = await fetchDownloads();
                if (downloadList.stauts == 200) {
                    setDownloads(downloadList.downloads);
                }
            })();
        }

    }, [downloadListMode]);




    return (
        <div>
            <div className="border-b">
                <div className="max-w-full px-4 sm:px-6 lg:px-6">
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


                        <Select onValueChange={(value) => setDownloadListMode(value)}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Download Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Download Status</SelectLabel>
                                    <SelectItem value="ongoing">Ongoing</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="incompleted">Incompleted</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>

                    </div>
                </div>
            </div>


            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">


                {onGoingDownload ? <Downloads onGoingDownload={onGoingDownload} /> : <NoDownload />}

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
                            <Progress value={onGoingDownload.progress?.progress || 0} className="w-[60%]" />
                            {/* <div
                        className="bg-blue-500 h-2 rounded-md"
                        style={{ width: `${onGoingDownload.progress?.progress || 0}%` }}
                    ></div> */}
                        </div>

                        {/* Download Counter */}
                        <div className="py-2 flex gap-2 items-center text-secondary-foreground/40">
                            <DownloadIcon className="h-4 w-4" />
                            <div className="flex items-center gap-2">
                                <p className="leading-7">{onGoingDownload.progress?.downloaded || 0}</p>
                                <p className="leading-7">/</p>
                                <p className="leading-7">{onGoingDownload.progress?.total || 0}%</p>
                                {/* <p className="leading-7">({progress.status})</p> */}
                            </div>
                        </div>

                        {/* <div className="py-2 flex gap-2 items-center text-secondary-foreground/40">
                    <DownloadIcon className="h-4 w-4" />
                    <div className="flex items-center gap-2">
                        <p className="leading-7">{downloadList.progress || 0}%</p>
                        <p className="leading-7">({downloadList.status})</p>
                    </div>
                </div> */}
                    </CardContent>


                    {/* <CardFooter className=" gap-2">
                <Button type="submit" >
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