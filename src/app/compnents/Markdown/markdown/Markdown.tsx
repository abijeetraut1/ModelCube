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


    console.log(response);

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
            <div className={`designed-scroll-bar h-full w-full ${isThinking ? "rounded-md" : ""} overflow-auto select-text cursor-text`}>
                <Markdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                        code({ children, className, ...props }) {
                            const match = /language-(\w+)/.exec(className || "");
                            const codeString = String(children).replace(/\n$/, "");

                            return match ? (
                                <div className="bg-muted/80 my-3 rounded-md overflow-clip border ">
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
                                        className="designed-scroll-bar "
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
                        p: ({ children }) => <p className="leading-7 [&:not(:first-child)]:mt-6">{children}</p>,
                        h1: ({ children }) => <h1 className="scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance">{children}</h1>,
                        h2: ({ children }) => <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">{children}</h2>,
                        h3: ({ children }) => <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">{children}</h3>,
                        h4: ({ children }) => <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">{children}</h4>,
                        blockquote: ({ children }) => <blockquote className="mt-6 border-l-2 pl-6 italic">{children}</blockquote>,
                        small: ({ children }) => <small className="text-sm leading-none font-medium">{children}</small>,

                        ul: ({ children, depth = 0 }) => (
                            <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
                                {children}
                            </ul>
                        ),

                        ol: ({ children, depth = 0, start = 1 }) => (
                            <ol className={`
                mb-4 last:mb-0 space-y-2 
                ${depth > 0 ? 'ml-6 mt-2 mb-2 space-y-1' : 'ml-0'}
              `}
                                style={{
                                    listStyle: 'none',
                                    counterReset: `list-counter ${start - 1}`
                                }}>
                                {children}
                            </ol>
                        ),

                        li: ({ children, ordered, ...props }) => {
                            const isOrdered = props.node?.parent?.tagName === 'ol';
                            const depth = (props.node?.parent?.depth || 0) - 2;

                            return (
                                <li className="leading-relaxed relative"
                                    style={isOrdered ? { counterIncrement: 'list-counter' } : {}}>
                                    <div className="flex items-start gap-3">

                                        <div className={`
                      flex-shrink-0 select-none flex items-center justify-center
                      transition-colors duration-200
                      ${isThinking ? "bg-zinc-400" : ""}
                      ${isOrdered
                                                ? 'w-7 h-7 bg-primary/10 text-primary border border-primary/20 rounded-full font-semibold text-sm hover:bg-primary/20'
                                                : 'w-2 h-2 bg-primary rounded-full mt-2 hover:bg-primary/80'
                                            }
                      ${depth > 0 ? 'scale-90' : ''}
                    `}>
                                            {isOrdered && (
                                                <span className="font-bold -zinc-500 text-xs" style={{
                                                    content: 'counter(list-counter)'
                                                }}>
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className={`${isThinking ? "text-zinc-400" : "text-foreground"}`}>{children}</div>
                                        </div>
                                    </div>
                                </li>
                            );
                        },

                        table: ({ children }) => (
                            <div className="my-6 w-full overflow-y-auto">
                                <table className="w-full">{children}</table>
                            </div>
                        ),
                        thead: ({ children }) => (
                            <thead>{children}</thead>
                        ),
                        tr: ({ children }) => (
                            <th className="even:bg-muted m-0 border-t p-0">{children}</th>
                        ),
                        th: ({ children }) => (
                            <th className="border-b border-muted bg-muted/50 px-4 py-3 text-left font-semibold text-sm">{children}</th>
                        ),
                        td: ({ children }) => <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">{children}</td>,
                    }}
                >
                    {response.message}
                </Markdown>
            </div>
        </Card >
    );
}

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