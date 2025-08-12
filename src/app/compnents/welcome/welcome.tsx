import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
// import { addSocketListener, ListenToEvent } from '@/lib/Services/socketConnection';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from "uuid";

type ErrorState = {
    status: number | null;
    message: string | null;
};

interface welcome {
    redirect: boolean
}

export default function Welcome({ redirect }: welcome) {
    const navigate = useNavigate();


    const handleSelect = async () => {
        // @ts-ignore
        try {
            const connectionResponse : unknown = await window.electronAPI.openModelFile();

            if (connectionResponse?.status == 200) {
                const id = uuidv4();

                if (redirect) {
                    navigate("/c/" + id);
                }

                toast.success(connectionResponse?.message, {
                    duration: 5000
                });

                window.electronAPI.onChatID({ chatId: id })
            } else {
                toast.error(connectionResponse.message || "Failed to open model file.");
            }
        } catch (error) {
            // console.error("Error selecting model file:", error);
            toast.error("An unexpected error occurred while selecting the model file.");
        }
    };

    return (
        <div className={` flex flex-col h-full w-full rounded-md max-w-full"}`}>
            <div className="px-8 md:px-24 xl:px-32 flex flex-col gap-4 justify-center h-full items-center">
                <div className=' text-4xl font-bold text-center'>
                    File’s yours. <br /> What do you want to do next?
                </div>

                <div className='flex gap-2'>
                    <Button className="w-fit" onClick={handleSelect}>Choose Model</Button>

                    <Link to="/search">
                        <Button variant="outline">Download LLM</Button>
                    </Link>
                </div>

            </div>
        </div >
    )
}
