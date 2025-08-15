import { useEffect, useRef } from 'react';
import Markdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import remarkGfm from 'remark-gfm';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy } from "lucide-react";


const ChatModelMarkdown = ({ response, isThinking }) => {
    if (!response || !response.message) return null;

    const scrollContainerRef = useRef(null);

    // console.log(response);

    // Auto-scroll when typing/thinking
    useEffect(() => {
        if (isThinking && scrollContainerRef.current) {
            const scrollContainer = scrollContainerRef.current;
            scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }
    }, [response.message, isThinking]);

    // Alternative: Smooth auto-scroll
    const scrollToBottom = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({
                top: scrollContainerRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    };

    // Call smooth scroll when content updates during thinking
    useEffect(() => {
        if (isThinking) {
            scrollToBottom();
        }
    }, [response.message, isThinking]);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).catch(() => {
            const textArea = document.createElement("textarea");
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
            } catch { }
            document.body.removeChild(textArea);
        });
    };

    return (
        <Card className={`shadow-none border-none flex justify-end items-end gap-2 select-text ${isThinking ? "p-1 bg-secondary/70 text-zinc-400 overflow-clip italic" : "bg-transparent px-0 py-0"}`}>
            <div
                ref={scrollContainerRef}
                className={`designed-scroll-bar h-full w-full ${isThinking ? "rounded-md" : ""} overflow-auto select-text cursor-text`}
            >
                <Markdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                        code({ children, className, ...props }) {
                            const match = /language-(\w+)/.exec(className || "");
                            const codeString = String(children).replace(/\n$/, "");

                            return match ? (
                                <div className="bg-muted/80 my-3 rounded-md overflow-clip border">
                                    <div className="px-3 py-2 flex items-center justify-between bg-muted border-b">
                                        <div className="text-foreground font-medium text-sm">
                                            {response.path || match[1]}
                                        </div>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            copyToClipboard(codeString);
                                                        }}
                                                        className="h-7 w-7 p-0"
                                                    >
                                                        <Copy className="h-3 w-3" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Copy Code</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                    <SyntaxHighlighter
                                        {...props}
                                        language={match[1]}
                                        style={vscDarkPlus}
                                        className="designed-scroll-bar"
                                        customStyle={{
                                            margin: 0,
                                            borderTopLeftRadius: 0,
                                            borderTopRightRadius: 0,
                                            fontSize: "13px",
                                            lineHeight: "1.4"
                                        }}
                                    >
                                        {codeString}
                                    </SyntaxHighlighter>
                                </div>
                            ) : (
                                <code
                                    {...props}
                                    className={`${isThinking ? "bg-zinc-700/85" : "bg-zinc-800"} px-1 py-0.5 rounded text-sm font-mono`}
                                >
                                    {children}
                                </code>
                            );
                        },
                        // Typography components using shadcn/ui classes
                        p: ({ children }) => (
                            <p className="leading-7 [&:not(:first-child)]:mt-6">
                                {children}
                            </p>
                        ),
                        h1: ({ children }) => (
                            <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
                                {children}
                            </h1>
                        ),
                        h2: ({ children }) => (
                            <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
                                {children}
                            </h2>
                        ),
                        h3: ({ children }) => (
                            <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                                {children}
                            </h3>
                        ),
                        h4: ({ children }) => (
                            <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
                                {children}
                            </h4>
                        ),
                        h5: ({ children }) => (
                            <h5 className="scroll-m-20 text-lg font-semibold tracking-tight">
                                {children}
                            </h5>
                        ),
                        h6: ({ children }) => (
                            <h6 className="scroll-m-20 text-base font-semibold tracking-tight">
                                {children}
                            </h6>
                        ),
                        blockquote: ({ children }) => (
                            <blockquote className="mt-6 border-l-2 pl-6 italic">
                                {children}
                            </blockquote>
                        ),
                        small: ({ children }) => (
                            <small className="text-sm font-medium leading-none">
                                {children}
                            </small>
                        ),
                        // Lists with proper shadcn/ui styling
                        ul: ({ children }) => (
                            <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
                                {children}
                            </ul>
                        ),
                        ol: ({ children }) => (
                            <ol className="my-6 ml-6 list-decimal [&>li]:mt-2">
                                {children}
                            </ol>
                        ),
                        li: ({ children }) => (
                            <li className="leading-7">
                                {children}
                            </li>
                        ),
                        // Table components with proper structure
                        table: ({ children }) => (
                            <div className="my-6 w-full overflow-y-auto">
                                <table className="w-full">
                                    {children}
                                </table>
                            </div>
                        ),
                        thead: ({ children }) => (
                            <thead>
                                {children}
                            </thead>
                        ),
                        tbody: ({ children }) => (
                            <tbody>
                                {children}
                            </tbody>
                        ),
                        tr: ({ children }) => (
                            <tr className="m-0 border-t p-0 even:bg-muted">
                                {children}
                            </tr>
                        ),
                        th: ({ children }) => (
                            <th className="border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right">
                                {children}
                            </th>
                        ),
                        td: ({ children }) => (
                            <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
                                {children}
                            </td>
                        ),
                        // Additional elements
                        hr: () => (
                            <hr className="my-4 md:my-8" />
                        ),
                        strong: ({ children }) => (
                            <strong className="font-semibold">
                                {children}
                            </strong>
                        ),
                        em: ({ children }) => (
                            <em className="italic">
                                {children}
                            </em>
                        ),
                        a: ({ children, href }) => (
                            <a
                                href={href}
                                className="font-medium text-primary underline underline-offset-4"
                            >
                                {children}
                            </a>
                        ),
                    }}
                >
                    {response.message}
                </Markdown>
            </div>
        </Card>
    );
};

const ChatUserMarkdown = ({ response }) => {
    if (!response || !response.message) return null;

    return (
        <Card className="shadow-none max-w-9/12 rounded-sm bg-muted/90 flex justify-end items-end gap-2 p-2 border-0 select-text">
            <div className="rounded-sm w-full text-sm select-text cursor-text">
                <Markdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                        code({ children, className, ...props }) {
                            const match = /language-(\w+)/.exec(className || "");
                            return match ? (
                                <Card className="border-0 overflow-clip my-2 select-text">
                                    <SyntaxHighlighter
                                        {...props}
                                        language={match[1]}
                                        style={vscDarkPlus}
                                        customStyle={{
                                            margin: 0,
                                            fontSize: "12px",
                                            userSelect: "text"
                                        }}
                                    >
                                        {String(children).replace(/\n$/, "")}
                                    </SyntaxHighlighter>
                                </Card>
                            ) : (
                                <code
                                    {...props}
                                    className="bg-slate-600 p-1 rounded text-white text-xs select-text cursor-text"
                                    style={{ userSelect: "text" }}
                                >
                                    {children}
                                </code>
                            );
                        },
                        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                        h1: ({ children }) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-base font-semibold mb-2">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-sm font-medium mb-1">{children}</h3>,
                        ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                        li: ({ children }) => <li className="text-sm">{children}</li>,
                    }}
                >
                    {response.message}
                </Markdown>
            </div>
        </Card>
    );
};


export { ChatModelMarkdown, ChatUserMarkdown };