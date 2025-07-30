import Markdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import remarkGfm from 'remark-gfm';
import { Button } from '@/components/ui/button';
import { Replace, Pencil, Copy } from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"


export const UserMarkdown = ({ response }) => (
    <Card className="bg-inherit shadow-none border-0 flex gap-2 p-2">
        <Avatar title="user" className="h-6 w-6">
            <AvatarImage
                src="https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=600&auto=format&fit=crop&q=60"
                alt="User"
            />
            <AvatarFallback>AR</AvatarFallback>
        </Avatar>
        <Markdown
            className="rounded-md w-full "
            remarkPlugins={[remarkGfm]}
            components={{
                code({ children, className, ...props }) {
                    const match = /language-(\w+)/.exec(className || "");
                    return match ? (
                        <Card className=" border-0 overflow-clip">
                            <SyntaxHighlighter
                                {...props}
                                language={match[1]}
                                style={vscDarkPlus}
                                customStyle={{ margin: 0 }}
                            >
                                {String(children).replace(/\n$/, "")}
                            </SyntaxHighlighter>
                        </Card>
                    ) : (
                        <code {...props} className="bg-slate-600 p-1 rounded text-white">
                            {children}
                        </code>
                    );
                },
            }}
        >
            {response.message}
        </Markdown>
    </Card>
);

export const ModelMarkdown = ({ response }) => (
    <Card className="designed-scroll-bar h-full w-full border-0 flex gap-2 p-1">
        <Avatar title="model" className="h-6 w-6">
            <AvatarImage src="https://github.com/shadcn.png" alt="Model" />
            <AvatarFallback>CC</AvatarFallback>
        </Avatar>
        <div className='overflow-clip w-full'>

            <Markdown
                className="designed-scroll-bar h-full w-full rounded-md shadow-xl overflow-auto"
                children={response.data}
                remarkPlugins={[remarkGfm]}
                components={{
                    code({ children, className, ...props }) {
                        const match = /language-(\w+)/.exec(className || '');
                        return match ? (
                            <div className=" bg-[#161718] my-2 designed-scroll-bar h-full  rounded-md overflow-clip">

                                <div className=' p-1 flex items-center justify-between gap-1 text-gray-400 '>
                                    <div>
                                        {response.path ? response.path : ""}
                                    </div>
                                    <div className='p-1 gap-1'>

                                        <Tooltip>
                                            <TooltipTrigger>
                                                <Button size="sm" variant="outline">
                                                    <Pencil />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Edit Code</p>
                                            </TooltipContent>
                                        </Tooltip>

                                        <Tooltip>
                                            <TooltipTrigger>
                                                <Button size="sm" variant="outline">
                                                    <Replace />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Update Code</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>



                                </div>


                                <SyntaxHighlighter
                                    {...props}
                                    language={match[1]}
                                    style={vscDarkPlus}
                                    className="designed-scroll-bar h-full"
                                    customStyle={{
                                        margin: 0,
                                        borderTopLeftRadius: 0,
                                        borderTopRightRadius: 0
                                    }}
                                >
                                    {String(children).replace(/\n$/, '')}
                                </SyntaxHighlighter>
                            </div>
                        ) : (
                            <code {...props} className="m-0 p-0 ">
                                {children}
                            </code>
                        );
                    }
                }}
            >
                {response.message}
            </Markdown>
        </div>

    </Card>
);


// export const ChatUserMarkdown = ({ response }) => (
//     <Card className="shadow-none bg-muted/90 flex justify-end items-end gap-2 p-2">
//         <Markdown
//             className="rounded-md w-full"
//             remarkPlugins={[remarkGfm]}
//             components={{
//                 code({ children, className, ...props }) {
//                     const match = /language-(\w+)/.exec(className || "");
//                     return match ? (
//                         <Card className="border-0 overflow-clip">
//                             <SyntaxHighlighter
//                                 {...props}
//                                 language={match[1]}
//                                 style={vscDarkPlus}
//                                 customStyle={{ margin: 0 }}
//                             >
//                                 {String(children).replace(/\n$/, "")}
//                             </SyntaxHighlighter>
//                         </Card>
//                     ) : (
//                         <code {...props} className="bg-slate-600 p-1 rounded text-white">
//                             {children}
//                         </code>
//                     );
//                 },
//             }}
//         >
//             {response.message}
//         </Markdown>
//     </Card>
// );

// export const ChatModelMarkdown = ({ response }) => (
//     <Card className="shadow-none bg-transparent border-none flex justify-end items-end gap-2">
//         <Markdown
//             className="designed-scroll-bar h-full w-full rounded-md shadow-xl overflow-auto"
//             remarkPlugins={[remarkGfm]}
//             components={{
//                 code({ children, className, ...props }) {
//                     const match = /language-(\w+)/.exec(className || '');
//                     return match ? (
//                         <div className="bg-muted/80 my-2 designed-scroll-bar h-full rounded-md overflow-clip">
//                             <div className='px-3 py-1 flex items-center justify-between gap-1'>
//                                 <div className='text-white font-thin font-sans'>
//                                     {response.path ? response.path : match[1]}
//                                 </div>
//                                 <div className='flex gap-1'>
//                                     <Tooltip>
//                                         <TooltipTrigger>
//                                             <Button size="sm" variant="outline">
//                                                 <Copy />
//                                             </Button>
//                                         </TooltipTrigger>
//                                         <TooltipContent>
//                                             <p>Copy Code</p>
//                                         </TooltipContent>
//                                     </Tooltip>
//                                 </div>
//                             </div>

//                             <SyntaxHighlighter
//                                 {...props}
//                                 language={match[1]}
//                                 style={vscDarkPlus}
//                                 className="designed-scroll-bar h-full"
//                                 customStyle={{
//                                     margin: 0,
//                                     borderTopLeftRadius: 0,
//                                     borderTopRightRadius: 0
//                                 }}
//                             >
//                                 {String(children).replace(/\n$/, '')}
//                             </SyntaxHighlighter>
//                         </div>
//                     ) : (
//                         <code {...props} className="m-0 p-0">
//                             {children}
//                         </code>
//                     );
//                 }
//             }}
//         >
//             {response.message}
//         </Markdown>
//     </Card>
// );

