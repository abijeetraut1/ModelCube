import React from 'react'



export default function SelectDatabaseContains() {
    return (
        <Select >
            <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Select a Column" />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <SelectLabel>Variables</SelectLabel>
                    {mysqlTypes.map((variable, index) => (
                        <SelectItem key={index} value={variable.type}>{variable.type}</SelectItem>
                    ))}
                </SelectGroup>
            </SelectContent>
        </Select>
    )
}
