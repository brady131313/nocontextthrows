import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { deleteSubmission, type Submission } from "@/lib/firebase";
import { useSubmissions } from "@/lib/use-submissions";
import { formatDate } from "@/lib/utils";
import { createFileRoute } from "@tanstack/react-router";
import { createColumnHelper } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { toast } from "sonner";

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
      className: "md:w-[150px] md:min-w-[150px] md:max-w-[150px]",
      clickable: true,
    },
  }),
  columnHelper.accessor("tags", {
    header: "Tag As",
    meta: {
      className: "w-full",
      clickable: true,
    },
  }),
  columnHelper.accessor("files", {
    header: () => <div className="text-right">Files</div>,
    cell: ({ row }) => (
      <div className="text-right">{row.original.files.length}</div>
    ),
    meta: {
      className:
        "hidden md:table-cell md:w-[75px] md:min-w-[75px] md:max-w-[75px]",
      clickable: true,
    },
  }),
];

function RouteComponent() {
  const { submissions } = useSubmissions();
  const navigate = Route.useNavigate();

  const onDeleteSubmissions = async (ids: string[]) => {
    const result = await deleteSubmission(ids);
    if (!result.success) {
      toast.error("Failed to delete submissions, please try again later.");
    }
  };

  return (
    <div className="flex w-full max-w-3xl flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Submissions</CardTitle>
        </CardHeader>
        <CardContent className="px-3 sm:px-6">
          <DataTable
            columns={columns}
            data={submissions}
            filterColumn="tags"
            filterPlaceholder="Search tags..."
            getRowId={(row) => row.id}
            onDelete={onDeleteSubmissions}
            onClick={(id) =>
              navigate({
                to: "/app/submissions/$submissionId",
                params: { submissionId: id },
              })
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
