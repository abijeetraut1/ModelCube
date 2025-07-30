import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { setPanelView } from "@/lib/Redux/Reducers/SystemWorkflow"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import Constant from "@/constant/constant"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { useSelector, useDispatch } from "react-redux"
import { FolderDown } from "lucide-react"
import { DownloadSourceCode } from "@/lib/exports/Download"

export default function Header() {
    const { Category, Backend_Framework, } = useSelector(
        (state) => state.prompt,
    )
    const { panelView, slug } = useSelector((state) => state.workflow)
    const dispatch = useDispatch();

    return (
        <header className="flex shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 h-10">
            <div className="flex items-center justify-between w-full gap-2 px-1 py-1">
                <div className="flex items-center">
                    <Breadcrumb className="text-sm">
                        <BreadcrumbList className="capitalize">
                            <BreadcrumbItem className="hidden md:block">
                                <BreadcrumbLink>{Backend_Framework}</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator className="hidden md:block" />
                            <BreadcrumbItem>
                                <BreadcrumbPage> {Category} </BreadcrumbPage>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator className="hidden md:block" />
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
            </div>
            <div className="flex items-center gap-2 max-h-8">
                <div>
                    <Select onValueChange={(value) => dispatch(setPanelView(value))}>
                        <SelectTrigger className="w-28 h-7 capitalize outline-none ring-0 text-xs">
                            <SelectValue value={panelView} placeholder="View" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Switch View</SelectLabel>
                                {Constant.workspace &&
                                    Constant.workspace.map((workspace) => (
                                        <SelectItem key={workspace} value={workspace} className="capitalize">
                                            {workspace}
                                        </SelectItem>
                                    ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <Button onClick={() => DownloadSourceCode(slug, Category)} variant="ghost" size="codePanel" className="h-7 w-7 p-0">
                                    <FolderDown />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Download Source Code</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>

            </div>
        </header>
    )
}
