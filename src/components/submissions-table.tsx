import { useSubmissions } from "@/lib/use-submissions";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { formatDate } from "@/lib/utils";

export function SubmissionsTable() {
  const { submissions } = useSubmissions();
  return (
    <Table>
      <TableCaption>Total submissions: {submissions.length}</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Submitted At</TableHead>
          <TableHead>Tag As</TableHead>
          <TableHead className="text-right">Files</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {submissions.map((submission) => (
          <TableRow key={submission.id}>
            <TableCell className="font-medium">
              {formatDate(submission.createdAt)}
            </TableCell>
            <TableCell>{submission.tags}</TableCell>
            <TableCell className="text-right">
              {submission.fileUrls.length}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
