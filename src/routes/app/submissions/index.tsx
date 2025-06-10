import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import type { Submission } from "@/lib/firebase";
import { useSubmissions } from "@/lib/use-submissions";
import { formatDate } from "@/lib/utils";
import { createFileRoute } from "@tanstack/react-router";
import { createColumnHelper } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

export const Route = createFileRoute("/app/submissions/")({
  component: RouteComponent,
});

const columnHelper = createColumnHelper<Submission>();

const columns = [
  columnHelper.display({
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(v) => row.toggleSelected(!!v)}
        aria-label="Select row"
      />
    ),
  }),
  columnHelper.accessor("createdAt", {
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Submitted
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ getValue }) => (
      <div className="font-medium">{formatDate(getValue())}</div>
    ),
    meta: {
      className: "w-[150px] min-w-[150px] max-w-[150px]",
    },
  }),
  columnHelper.accessor("tags", {
    header: "Tag As",
    meta: {
      className: "w-full",
    },
  }),
  columnHelper.accessor("filePaths", {
    header: () => <div className="text-right">Files</div>,
    cell: ({ getValue }) => (
      <div className="text-right">{getValue().length}</div>
    ),
    meta: {
      className: "w-[75px] min-w-[75px] max-w-[75px]",
    },
  }),
];

function RouteComponent() {
  const { submissions } = useSubmissions();

  const onDeleteSubmissions = (ids: string[]) => {
    console.log("Deleting submissions:", ids);
  };

  return (
    <div className="flex w-full max-w-3xl flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={submissions}
            filterColumn="tags"
            filterPlaceholder="Search tags..."
            getRowId={(row) => row.id}
            onDelete={onDeleteSubmissions}
          />
        </CardContent>
      </Card>
    </div>
  );
}
