import { memo, useEffect } from "react"
import ReactFlow, { Background, useNodesState } from "reactflow"
import "reactflow/dist/style.css"
import { Database, GripVertical, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogDescription, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { useDispatch, useSelector } from "react-redux"
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AddColumn, UpdateColumn, DeleteColumn } from "@/lib/Redux/Reducers/response"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, } from "@/components/ui/tooltip"

const mysqlTypes = [
    { type: "PRIMARY_KEY" },
    { type: "INT" },
    { type: "VARCHAR(255)" },
    { type: "TEXT" },
    { type: "STRING" },
    { type: "DATE" },
    { type: "DATETIME" },
    { type: "BOOLEAN" },
    { type: "FLOAT" },
    { type: "DECIMAL(10,2)" },
    { type: "BLOB" }
];


const TableNode = memo(({ data }) => {

    const dispatch = useDispatch();

    console.log(data);

    function AddSchemaColumn(Model) {
        dispatch(AddColumn(Model));
    }

    function UpdateSchemaColumn(Model, Index, Value) {
        dispatch(UpdateColumn({ Model, Index, Value }));
    }

    function DeleteSchemaColumn(Model, Index) {
        dispatch(DeleteColumn({ Model, Index }));
    }

    return (
        <div className="bg-[#222831] rounded-md border-white shadow-md w-[320px] border overflow-hidden z-50">
            <div className="flex items-center justify-between p-2 border-gray-200 bg-[#222831]">
                <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-white" />
                    <span className="font-medium text-sm text-white">{data.label}</span>
                </div>
                <div className="flex items-center gap-1">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button >Add</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-fit">
                            <DialogHeader>
                                <DialogTitle>
                                    {data.label}
                                </DialogTitle>
                            </DialogHeader>

                            <DialogDescription className="border p-2 rounded-md space-y-2 overflow-auto max-h-[30rem]">
                                {console.log(data.DatabaseSchema)}
                                {data.DatabaseSchema.columns.map((row, i) => (
                                    <div key={i} className="flex items-center space-x-4 border  rounded-md p-2">
                                        <div className="flex items-center">
                                            <button >
                                                <GripVertical height={16} width={16} />
                                            </button>
                                        </div>
                                        <div>
                                            <Input placeholder="Column Name" value={row.name} onChange={(el) => UpdateSchemaColumn(data.label, i, { columnName: el.target.value })} />
                                        </div>
                                        <div>
                                            <Select value={row.type} onValueChange={(value) => UpdateSchemaColumn(data.label, i, { DataType: value })}>
                                                <SelectTrigger className="w-[150px]">
                                                    <SelectValue placeholder="Select a Column">
                                                        {/* {row.type} */}
                                                        {mysqlTypes.filter(el => row.type === el.type)}
                                                    </SelectValue>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        <SelectLabel>Variables</SelectLabel>
                                                        <hr />
                                                        {mysqlTypes.map((variable, index) => (
                                                            <SelectItem key={index} value={variable.type}>
                                                                {variable.type}
                                                            </SelectItem>
                                                        ))}

                                                    </SelectGroup>

                                                    <SelectGroup>
                                                        <hr />
                                                        <SelectLabel>Relation</SelectLabel>
                                                        <hr />
                                                        {data.Tables.map((variable, index) => (
                                                            <SelectItem key={index} value={variable}>
                                                                {variable.split(".")[0] + " " + "Model"}
                                                            </SelectItem>
                                                        ))}

                                                    </SelectGroup>

                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <TooltipProvider>
                                                <Tooltip >
                                                    <TooltipTrigger className="flex items-center" asChild>
                                                        <Checkbox
                                                            id="terms"
                                                            onCheckedChange={(checked) => UpdateSchemaColumn(data.label, i, { Nullable: checked })}
                                                        />
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Nullable Field {row.null ? "yes" : "no"}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                        <div className="flex items-center">
                                            <button onClick={() => DeleteSchemaColumn(data.label, i)}>
                                                <Trash2 className="text-red-500" height={16} width={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}

                            </DialogDescription>

                            <DialogFooter className="flex justify-between">
                                <Button type="button" onClick={() => AddSchemaColumn(data.label)}>
                                    Add Column
                                </Button>
                                <DialogClose asChild>
                                    <Button type="button" variant="secondary">
                                        Cancel
                                    </Button>
                                </DialogClose>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="p-0">
                <table className="w-full text-sm text-white">
                    <thead>
                        <tr className="border-b border-gray-700">
                            <th className="px-3 py-2 text-left">Column</th>
                            <th className="px-3 py-2 text-left">Type</th>
                            <th className="px-3 py-2 text-left">Null</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.DatabaseSchema.columns.map((row, index) => (
                            <tr key={index} className="border-b border-gray-700">
                                <td className="px-3 py-2">{row.name}</td>
                                <td className="px-3 py-2">{row.type}</td>
                                <td className="px-3 py-2">{row.null ? "yes" : "no"}</td>
                            </tr>
                        ))}
                    </tbody>

                </table>
            </div>
        </div>
    );
});

const nodeTypes = {
    tableNode: TableNode
}

export default function DatabaseSchemaFlow() {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const { Database_Tables } = useSelector(state => state.response);

    // console.log(Database_Tables)

    useEffect(() => {

        const newNodes = Database_Tables.map((contain, i) => ({
            id: contain.Table.split('.')[1] == 'js' ? contain.Table.split('.')[0] + "Model" : contain.Table,
            type: "tableNode",
            position: { x: 100 + (i * 50), y: 100 + (i * 50) },
            data: {
                label: contain.Table,
                rows: contain.Columns,
                DatabaseSchema: contain,
                Tables: Database_Tables.map(schema => schema.Table)
            },
        }));

        setNodes(newNodes);

    }, [Database_Tables]);


    return (
        <div className="w-full h-full overflow-auto rounded-lg relative">
            <div className="relative w-full h-full">
                <ReactFlow
                    nodes={nodes}
                    onNodesChange={onNodesChange}
                    nodeTypes={nodeTypes}
                    fitView
                    fitViewOptions={{ padding: 1 }}
                    defaultZoom={0.1}
                    minZoom={0.6}
                    maxZoom={1.5}
                >
                    <Background color="#f0f0f0" gap={16} />
                </ReactFlow>
            </div>
        </div>
    )
}
