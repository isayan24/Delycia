// "use client";

// import * as React from "react";
// import {
//   closestCenter,
//   DndContext,
//   KeyboardSensor,
//   MouseSensor,
//   TouchSensor,
//   useSensor,
//   useSensors,
//   type DragEndEvent,
//   type UniqueIdentifier,
// } from "@dnd-kit/core";
// import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
// import {
//   arrayMove,
//   SortableContext,
//   useSortable,
//   verticalListSortingStrategy,
// } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";
// import {
//   IconChevronDown,
//   IconChevronLeft,
//   IconChevronRight,
//   IconChevronsLeft,
//   IconChevronsRight,
//   IconCircleCheckFilled,
//   IconDotsVertical,
//   IconGripVertical,
//   IconLayoutColumns,
//   IconLoader,
//   IconPlus,
//   IconTrendingUp,
// } from "@tabler/icons-react";
// import {
//   ColumnDef,
//   ColumnFiltersState,
//   flexRender,
//   getCoreRowModel,
//   getFacetedRowModel,
//   getFacetedUniqueValues,
//   getFilteredRowModel,
//   getPaginationRowModel,
//   getSortedRowModel,
//   Row,
//   SortingState,
//   useReactTable,
//   VisibilityState,
// } from "@tanstack/react-table";
// import { z } from "zod";

// import { useIsMobile } from "@/hooks/use-mobile";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Checkbox } from "@/components/ui/checkbox";
// import {
//   DropdownMenu,
//   DropdownMenuCheckboxItem,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Separator } from "@/components/ui/separator";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { orderSchema } from "@/schemas/orderSchema";
// import { Clock } from "lucide-react";
// import {
//   Drawer,
//   DrawerClose,
//   DrawerContent,
//   DrawerDescription,
//   DrawerFooter,
//   DrawerHeader,
//   DrawerTitle,
//   DrawerTrigger,
// } from "./drawer";

// // Create a separate component for the drag handle
// function DragHandle({ id }: { id: number }) {
//   const { attributes, listeners } = useSortable({
//     id,
//   });

//   return (
//     <Button
//       {...attributes}
//       {...listeners}
//       variant="ghost"
//       size="icon"
//       className="text-muted-foreground size-7 hover:bg-transparent"
//     >
//       <IconGripVertical className="text-muted-foreground size-3" />
//       <span className="sr-only">Drag to reorder</span>
//     </Button>
//   );
// }

// // mark all columns are here
// const columns: ColumnDef<z.infer<typeof orderSchema>>[] = [
//   {
//     id: "drag",
//     header: () => null,
//     cell: ({ row }) => <DragHandle id={row.original.id} />,
//   },
//   {
//     id: "select",
//     header: ({ table }) => (
//       <div className="flex items-center justify-center">
//         <Checkbox
//           checked={
//             table.getIsAllPageRowsSelected() ||
//             (table.getIsSomePageRowsSelected() && "indeterminate")
//           }
//           onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
//           aria-label="Select all"
//         />
//       </div>
//     ),
//     cell: ({ row }) => (
//       <div className="flex items-center justify-center">
//         <Checkbox
//           checked={row.getIsSelected()}
//           onCheckedChange={(value) => row.toggleSelected(!!value)}
//           aria-label="Select row"
//         />
//       </div>
//     ),
//     enableSorting: false,
//     enableHiding: false,
//   },
//   // mark header
//   {
//     accessorKey: "customerName",
//     header: "Customer Name",
//     cell: ({ row }) => {
//       return (
//         <div className="min-w-32">
//           <TableCellViewer item={row.original} />
//         </div>
//       );
//     },
//     enableHiding: false,
//   },
//   {
//     accessorKey: "phone_number",
//     header: "Contact Number",
//     cell: ({ row }) => (
//       <div className="w-32">
//         <span>+91</span> <span>{row.original.phone_number}</span>
//       </div>
//     ),
//   },
//   {
//     accessorKey: "table_number",
//     header: "Table Number",
//     cell: ({ row }) => (
//       <div className="w-6">
//         <span>{row.original.table_number}</span>
//       </div>
//     ),
//   },
//   {
//     accessorKey: "total_price",
//     header: "Total Price",
//     cell: ({ row }) => (
//       <div className="w-14">
//         <span>₹{row.original.total_price}</span>
//       </div>
//     ),
//   },
//   {
//     accessorKey: "payment_status",
//     header: "Payment Status",
//     cell: ({ row }) => (
//       <div className="w-32 flex gap-2 items-center">
//         <span>{row.original.payment_method}</span>{" "}
//         <span>
//           <Badge
//             variant="outline"
//             className={`${row.original.payment_status === "Paid" ? "text-green-500 border-green-200" : "text-orange-500 border-orange-200"} px-1.5`}
//           >
//             {row.original.payment_status}
//           </Badge>
//         </span>
//       </div>
//     ),
//   },
//   {
//     accessorKey: "status",
//     header: "Status",
//     cell: ({ row }) => (
//       <Badge variant="outline" className="text-muted-foreground px-1.5">
//         {row.original.status === "Done" ? (
//           <IconCircleCheckFilled className="fill-green-500 dark:fill-green-400" />
//         ) : (
//           <IconLoader />
//         )}
//         {row.original.status}
//       </Badge>
//     ),
//   },
//   {
//     accessorKey: "order_time",
//     header: "Order Time",
//     cell: ({ row }) => (
//       <div className="min-w-32 flex gap-2 items-center">
//         <Clock className="h-3 w-3" />{" "}
//         <span className="text-muted-foreground text-xs">
//           {row.original.order_time}
//         </span>
//       </div>
//     ),
//   },
//   {
//     id: "actions",
//     cell: () => (
//       <DropdownMenu>
//         <DropdownMenuTrigger asChild>
//           <Button
//             variant="ghost"
//             className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
//             size="icon"
//           >
//             <IconDotsVertical />
//             <span className="sr-only">Open menu</span>
//           </Button>
//         </DropdownMenuTrigger>
//         <DropdownMenuContent align="end" className="w-32">
//           <DropdownMenuItem>Edit</DropdownMenuItem>
//           <DropdownMenuItem>Make a copy</DropdownMenuItem>
//           <DropdownMenuItem>Favorite</DropdownMenuItem>
//           <DropdownMenuSeparator />
//           <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
//         </DropdownMenuContent>
//       </DropdownMenu>
//     ),
//   },
// ];

// // mark draggable row
// function DraggableRow({ row }: { row: Row<z.infer<typeof orderSchema>> }) {
//   const { transform, transition, setNodeRef, isDragging } = useSortable({
//     id: row.original.id,
//   });

//   return (
//     <TableRow
//       data-state={row.getIsSelected() && "selected"}
//       data-dragging={isDragging}
//       ref={setNodeRef}
//       className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
//       style={{
//         transform: CSS.Transform.toString(transform),
//         transition: transition,
//       }}
//     >
//       {row.getVisibleCells().map((cell) => (
//         <TableCell key={cell.id}>
//           {flexRender(cell.column.columnDef.cell, cell.getContext())}
//         </TableCell>
//       ))}
//     </TableRow>
//   );
// }

// // mark Main DataTable Component
// export function DataTable({
//   data: initialData,
// }: {
//   data: z.infer<typeof orderSchema>[];
// }) {
//   const [data, setData] = React.useState(() => initialData);
//   const [rowSelection, setRowSelection] = React.useState({});
//   const [columnVisibility, setColumnVisibility] =
//     React.useState<VisibilityState>({});
//   const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
//     []
//   );
//   const [sorting, setSorting] = React.useState<SortingState>([]);
//   const [pagination, setPagination] = React.useState({
//     pageIndex: 0,
//     pageSize: 10,
//   });
//   const sortableId = React.useId();
//   const sensors = useSensors(
//     useSensor(MouseSensor, {}),
//     useSensor(TouchSensor, {}),
//     useSensor(KeyboardSensor, {})
//   );

//   const dataIds = React.useMemo<UniqueIdentifier[]>(
//     () => data?.map(({ id }) => id) || [],
//     [data]
//   );

//   const table = useReactTable({
//     data,
//     columns,
//     state: {
//       sorting,
//       columnVisibility,
//       rowSelection,
//       columnFilters,
//       pagination,
//     },
//     getRowId: (row) => row.id.toString(),
//     enableRowSelection: true,
//     onRowSelectionChange: setRowSelection,
//     onSortingChange: setSorting,
//     onColumnFiltersChange: setColumnFilters,
//     onColumnVisibilityChange: setColumnVisibility,
//     onPaginationChange: setPagination,
//     getCoreRowModel: getCoreRowModel(),
//     getFilteredRowModel: getFilteredRowModel(),
//     getPaginationRowModel: getPaginationRowModel(),
//     getSortedRowModel: getSortedRowModel(),
//     getFacetedRowModel: getFacetedRowModel(),
//     getFacetedUniqueValues: getFacetedUniqueValues(),
//   });

//   function handleDragEnd(event: DragEndEvent) {
//     const { active, over } = event;
//     if (active && over && active.id !== over.id) {
//       setData((data) => {
//         const oldIndex = dataIds.indexOf(active.id);
//         const newIndex = dataIds.indexOf(over.id);
//         return arrayMove(data, oldIndex, newIndex);
//       });
//     }
//   }

//   return (
//     <Tabs
//       defaultValue="allOrders"
//       className="w-full flex-col justify-start gap-6"
//     >
//       <div className="flex items-center justify-between px-4 lg:px-6">
//         <Label htmlFor="view-selector" className="sr-only">
//           View
//         </Label>
//         {/* TODO: Add filters and date picker */}
//         <Select defaultValue="today">
//           <SelectTrigger
//             className="flex w-fit @4xl/main:hidden"
//             id="view-selector"
//           >
//             <SelectValue placeholder="Select a view" />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="today">Today</SelectItem>
//             <SelectItem value="yesterday">Yesterday</SelectItem>
//             <SelectItem value="last7days">Last 7 days</SelectItem>
//             <SelectItem value="last30days">Last 30 days</SelectItem>
//           </SelectContent>
//         </Select>
//         {/* mark tab lists */}
//         <TabsList
//         // className="**:data-[slot=badge]:bg-muted-foreground/30 hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:px-1 @4xl/main:flex"
//         >
//           <TabsTrigger value="allOrders">
//             All Orders <Badge variant="secondary">123</Badge>
//           </TabsTrigger>
//           <TabsTrigger value="processing">
//             Processing <Badge variant="secondary">3</Badge>
//           </TabsTrigger>
//           <TabsTrigger value="ready">
//             Ready <Badge variant="secondary">2</Badge>
//           </TabsTrigger>
//           <TabsTrigger value="delivered">Delivered</TabsTrigger>
//         </TabsList>
//         <div className="flex items-center gap-2">
//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <Button variant="outline" size="sm">
//                 <IconLayoutColumns />
//                 <span className="hidden lg:inline">Customize Columns</span>
//                 <span className="lg:hidden">Columns</span>
//                 <IconChevronDown />
//               </Button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent align="end" className="w-56">
//               {table
//                 .getAllColumns()
//                 .filter(
//                   (column) =>
//                     typeof column.accessorFn !== "undefined" &&
//                     column.getCanHide()
//                 )
//                 .map((column) => {
//                   return (
//                     <DropdownMenuCheckboxItem
//                       key={column.id}
//                       className="capitalize"
//                       checked={column.getIsVisible()}
//                       onCheckedChange={(value) =>
//                         column.toggleVisibility(!!value)
//                       }
//                     >
//                       {column.id}
//                     </DropdownMenuCheckboxItem>
//                   );
//                 })}
//             </DropdownMenuContent>
//           </DropdownMenu>
//           <Button variant="outline" size="sm">
//             <IconPlus />
//             <span className="hidden lg:inline">Add Section</span>
//           </Button>
//         </div>
//       </div>
//       {/* mark 1st tab content */}
//       <TabsContent
//         value="allOrders"
//         className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
//       >
//         <div className="overflow-hidden rounded-lg border">
//           <DndContext
//             collisionDetection={closestCenter}
//             modifiers={[restrictToVerticalAxis]}
//             onDragEnd={handleDragEnd}
//             sensors={sensors}
//             id={sortableId}
//           >
//             <Table>
//               <TableHeader className="bg-muted sticky top-0 z-10">
//                 {table.getHeaderGroups().map((headerGroup) => (
//                   <TableRow key={headerGroup.id}>
//                     {headerGroup.headers.map((header) => {
//                       return (
//                         <TableHead key={header.id} colSpan={header.colSpan}>
//                           {header.isPlaceholder
//                             ? null
//                             : flexRender(
//                                 header.column.columnDef.header,
//                                 header.getContext()
//                               )}
//                         </TableHead>
//                       );
//                     })}
//                   </TableRow>
//                 ))}
//               </TableHeader>
//               <TableBody className="**:data-[slot=table-cell]:first:w-8">
//                 {table.getRowModel().rows?.length ? (
//                   <SortableContext
//                     items={dataIds}
//                     strategy={verticalListSortingStrategy}
//                   >
//                     {table.getRowModel().rows.map((row) => (
//                       <DraggableRow key={row.id} row={row} />
//                     ))}
//                   </SortableContext>
//                 ) : (
//                   <TableRow>
//                     <TableCell
//                       colSpan={columns.length}
//                       className="h-24 text-center"
//                     >
//                       No results.
//                     </TableCell>
//                   </TableRow>
//                 )}
//               </TableBody>
//             </Table>
//           </DndContext>
//         </div>
//         {/* mark pagination */}
//         <div className="flex items-center justify-between px-4">
//           <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
//             {table.getFilteredSelectedRowModel().rows.length} of{" "}
//             {table.getFilteredRowModel().rows.length} row(s) selected.
//           </div>
//           <div className="flex w-full items-center gap-8 lg:w-fit">
//             <div className="hidden items-center gap-2 lg:flex">
//               <Label htmlFor="rows-per-page" className="text-sm font-medium">
//                 Rows per page
//               </Label>
//               <Select
//                 value={`${table.getState().pagination.pageSize}`}
//                 onValueChange={(value) => {
//                   table.setPageSize(Number(value));
//                 }}
//               >
//                 <SelectTrigger className="w-20" id="rows-per-page">
//                   <SelectValue
//                     placeholder={table.getState().pagination.pageSize}
//                   />
//                 </SelectTrigger>
//                 <SelectContent side="top">
//                   {[10, 20, 30, 40, 50].map((pageSize) => (
//                     <SelectItem key={pageSize} value={`${pageSize}`}>
//                       {pageSize}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>
//             <div className="flex w-fit items-center justify-center text-sm font-medium">
//               Page {table.getState().pagination.pageIndex + 1} of{" "}
//               {table.getPageCount()}
//             </div>
//             <div className="ml-auto flex items-center gap-2 lg:ml-0">
//               <Button
//                 variant="outline"
//                 className="hidden h-8 w-8 p-0 lg:flex"
//                 onClick={() => table.setPageIndex(0)}
//                 disabled={!table.getCanPreviousPage()}
//               >
//                 <span className="sr-only">Go to first page</span>
//                 <IconChevronsLeft />
//               </Button>
//               <Button
//                 variant="outline"
//                 className="size-8"
//                 size="icon"
//                 onClick={() => table.previousPage()}
//                 disabled={!table.getCanPreviousPage()}
//               >
//                 <span className="sr-only">Go to previous page</span>
//                 <IconChevronLeft />
//               </Button>
//               <Button
//                 variant="outline"
//                 className="size-8"
//                 size="icon"
//                 onClick={() => table.nextPage()}
//                 disabled={!table.getCanNextPage()}
//               >
//                 <span className="sr-only">Go to next page</span>
//                 <IconChevronRight />
//               </Button>
//               <Button
//                 variant="outline"
//                 className="hidden size-8 lg:flex"
//                 size="icon"
//                 onClick={() => table.setPageIndex(table.getPageCount() - 1)}
//                 disabled={!table.getCanNextPage()}
//               >
//                 <span className="sr-only">Go to last page</span>
//                 <IconChevronsRight />
//               </Button>
//             </div>
//           </div>
//         </div>
//       </TabsContent>
//       {/* mark Edit other tabs accordingly */}
//       <TabsContent value="processing" className="flex flex-col px-4 lg:px-6">
//         <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
//       </TabsContent>
//       <TabsContent value="ready" className="flex flex-col px-4 lg:px-6">
//         <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
//       </TabsContent>
//       <TabsContent value="delivered" className="flex flex-col px-4 lg:px-6">
//         <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
//       </TabsContent>
//     </Tabs>
//   );
// }

// // mark table viewer
// function TableCellViewer({ item }: { item: z.infer<typeof orderSchema> }) {
//   const isMobile = useIsMobile();

//   return (
//     <Drawer direction={isMobile ? "bottom" : "right"}>
//       <DrawerTrigger asChild>
//         <Button variant="link" className="text-foreground w-fit px-0 text-left">
//           {item.customerName}
//         </Button>
//       </DrawerTrigger>
//       <DrawerContent>
//         <DrawerHeader className="gap-1">
//           <DrawerTitle>{item.customerName}</DrawerTitle>
//           <DrawerDescription>
//             Showing total visitors for the last 6 months
//           </DrawerDescription>
//         </DrawerHeader>
//         {/* main items belongs here */}
//         <DrawerFooter>
//           <Button>Submit</Button>
//           <DrawerClose asChild>
//             <Button variant="outline">Done</Button>
//           </DrawerClose>
//         </DrawerFooter>
//       </DrawerContent>
//     </Drawer>
//   );
// }
