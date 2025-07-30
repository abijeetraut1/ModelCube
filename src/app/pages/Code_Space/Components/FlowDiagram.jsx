import React from 'react'
import { Input } from '@/components/ui/input';
import { MdDragIndicator } from "react-icons/md";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { CiTrash } from "react-icons/ci";

const frameworks = [
    {
        value: "next.js",
        label: "Next.js",
    },
    {
        value: "sveltekit",
        label: "SvelteKit",
    },
    {
        value: "nuxt.js",
        label: "Nuxt.js",
    },
    {
        value: "remix",
        label: "Remix",
    },
    {
        value: "astro",
        label: "Astro",
    },
];

export function ComboboxDemo() {
    const [open, setOpen] = React.useState(false)
    const [value, setValue] = React.useState("");
    const [searchTerm, setSearchTerm] = React.useState("");




    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-[200px] justify-between"
                >
                    {value
                        ? frameworks.find((framework) => framework.value === value)?.label
                        : "Select framework..."}
                    <ChevronsUpDown className="opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
                <Command>
                    <CommandInput
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        placeholder="Search framework..."
                        className="h-9"
                        autoFocus
                        onKeyDown={(event) => event.stopPropagation()}
                    />

                    <CommandList>
                        <CommandEmpty>No framework found.</CommandEmpty>
                        <CommandGroup>
                            {frameworks.map((framework) => (
                                <CommandItem
                                    key={framework.value}
                                    value={framework.value}
                                    onSelect={(currentValue) => {
                                        setValue(currentValue === value ? "" : currentValue)
                                        setOpen(false)
                                    }}
                                >
                                    {framework.label}
                                    <Check
                                        className={cn(
                                            "ml-auto",
                                            value === framework.value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}


export default function FlowDiagram() {


    return (
        <div className='m-2 space-y-2 w-fit'>
            <div>
                <Input type="text" placeholder="Model" className="w-2/5" />
            </div>

            <div className='rounded'>
                <div className='my-2 border rounded-md border-[#29292d]'>
                    <div className='flex flex-row justify-center items-center'>
                        {/* Drag Icon */}
                        <div className='p-2 w-fit border-r flex items-center rounded-md border-[#29292d]'>
                            <MdDragIndicator />
                        </div>

                        {/* ComboBoxes */}
                        <div className='flex border-x border-[#29292d]'>
                            <div className='py-2 px-2 '>
                                <ComboboxDemo />
                            </div>
                            <div className='py-2 px-2'>
                                <ComboboxDemo />
                            </div>
                        </div>

                        {/* Trash Icon */}
                        <div className='p-2 w-fit border-l flex items-center rounded-md'>
                            <CiTrash />
                        </div>
                    </div>
                </div>


                <div>
                    <Button variant="outline">Add</Button>
                </div>
            </div>


        </div>

    )
}
