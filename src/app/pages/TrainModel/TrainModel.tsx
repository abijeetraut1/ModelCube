import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardFooter, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
    SheetClose
} from "@/components/ui/sheet";
import { Package } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from 'sonner';


export default function TrainModel() {

    const handleSelect = async () => {
        try {
            // @ts-ignore if electronAPI is not typed
            const connectionResponse = await window.electronAPI.openDatasetFile();

            console.log("connectionResponse:", connectionResponse);

        } catch (error) {
            console.error("Error selecting dataset file:", error);
            toast.error("An unexpected error occurred while selecting the dataset file.");
        }
    };

    return (
        <div >

            <div className="max-w-4xl px-4 mx-auto  sm:px-6 lg:px-8 py-8">

                <Card className="w-full"  >

                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Package className="w-5 h-5" />
                            <span>Train Model</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="w-full space-y-1">
                                    <Label>Choose Dataset</Label>
                                    <div className='flex justify-between w-full'>
                                        <Button onClick={handleSelect} className='w-full' variant={'outline'} > Select Dataset </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className='flex justify-between items-end w-full'>
                        <div>
                            <Sheet>
                                <SheetTrigger>
                                    <Button>Change Parameters</Button>
                                </SheetTrigger>
                                <SheetContent>
                                    <SheetHeader>
                                        <SheetTitle>Toogle Training Parameters</SheetTitle>
                                        <SheetDescription>
                                            This action cannot be undone. This will permanently delete your account
                                            and remove your data from our servers.
                                        </SheetDescription>
                                    </SheetHeader>

                                    <div className="grid flex-1 auto-rows-min gap-6 px-4">
                                        <div className="grid gap-3">
                                            <label>Select Training Type</label>
                                            <Select >
                                                <SelectTrigger >
                                                    <SelectValue placeholder="Select Training Type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        <SelectLabel>Text Dataset Train Type    </SelectLabel>
                                                        <SelectItem value="text-classification">Text Classification</SelectItem>
                                                        <SelectItem value="text-generation">Text Generation</SelectItem>
                                                        {/* <SelectItem value="named-entity-recognition">Named Entity Recognition</SelectItem>
                                                        <SelectItem value="text-summarization">Text Summarization</SelectItem>
                                                        <SelectItem value="machine-translation">Machine Translation</SelectItem> */}
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="grid gap-3">
                                            <Label htmlFor="sheet-demo-username">Username</Label>
                                            <Input id="sheet-demo-username" defaultValue="@peduarte" />
                                        </div>
                                    </div>

                                    <SheetFooter className='flex items-end'>
                                        <div className='flex gap-2'>
                                            <Button variant={'destructive'}>Reset</Button>
                                            <Button>Update</Button>
                                        </div>
                                    </SheetFooter>
                                </SheetContent>



                            </Sheet>
                        </div>
                        <div className='flex gap-2'>
                            <Button>View Dataset</Button>
                            <Button variant="outline">Train Model</Button>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}