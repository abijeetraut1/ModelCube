import { useEffect, useState } from 'react';
import {
    Table,
    TableBody, TableCell, TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Headers } from "@/app/compnents/Headers/Headers";
import { checkHistoryTitle } from '@/lib/Database/CheckHistory';
import { deleteConversationById } from '@/lib/Database/CodesDB';
import { Button } from '@/components/ui/button';


export default function History() {
    const [prevChats, setPrevChats] = useState(null);
    useEffect(() => {
        fetchTitle();
    }, []);

    async function fetchTitle() {
        const history = await checkHistoryTitle();

        if (history.length != 0) {
            console.log(history)
            setPrevChats(history);
        }

    }

    async function deleteConversationId(conversation_id: string) {
        await deleteConversationById(conversation_id);
        await fetchTitle();
    }


    return (
        <div>
            <Headers />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>S.N</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Array.isArray(prevChats) && prevChats.map((item, i) => (
                            <TableRow key={i} >
                                <TableCell className="font-medium">{i}</TableCell>
                                <TableCell className="font-medium">{item.conversation_id}</TableCell>
                                <TableCell className="font-medium">
                                    <Button variant="link" onClick={() => deleteConversationId(item.conversation_id)}>
                                        Delete
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>

    )
}
