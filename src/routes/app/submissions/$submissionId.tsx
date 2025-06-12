import { FireFilePreview } from "@/components/fire-preview";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { deleteSubmission, downloadSubmission } from "@/lib/firebase";
import { getSubmissionById, useSubmission } from "@/lib/use-submissions";
import { cn, formatDate, triggerClientDownload } from "@/lib/utils";
import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { ArrowLeft, Download, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/submissions/$submissionId")({
  component: RouteComponent,
  loader: async ({ params }) => {
    const { submissionId } = params;
    const submission = await getSubmissionById(submissionId);
    return { submission };
  },
});

function RouteComponent() {
  const navigate = Route.useNavigate();
  const { submissionId } = Route.useParams();
  const { submission: initialSubmission } = Route.useLoaderData();
  const { submission } = useSubmission(
    submissionId,
    initialSubmission || undefined,
  );

  const handleDelete = async () => {
    const result = await deleteSubmission([submissionId]);
    if (result.success) {
      navigate({ to: ".." });
    } else {
      toast.error("Failed to delete submission, please try again later.");
    }
  };

  const handleDownload = async () => {
    if (!submission) return;

    const result = await downloadSubmission(submission);
    if (result.success) {
      triggerClientDownload(result.data, result.archiveName);
    } else {
      toast.error("Failed to download submission, please try again later.");
    }
  };

  if (!submission) {
    return <Navigate to="/app/submissions" />;
  }

  return (
    <div className="flex w-full max-w-3xl flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>{submission?.tags}</CardTitle>
          <CardDescription>
            {submission?.createdAt && formatDate(submission?.createdAt)}
          </CardDescription>
          <CardAction>
            <Button variant="secondary" size="icon" className="size-8" asChild>
              <Link to="..">
                <ArrowLeft />
              </Link>
            </Button>
          </CardAction>
        </CardHeader>

        <CardContent
          className={cn(
            "grid grid-cols-1 gap-2 sm:gap-4",
            (submission?.files.length || 0) > 1 && "md:grid-cols-2",
          )}
        >
          {submission?.files.map((file) => (
            <FireFilePreview
              key={file.path}
              filePath={file.path}
              fileType={file.type}
            />
          ))}
        </CardContent>
        <CardFooter className="gap-x-4">
          <Button
            className="flex-1"
            variant="destructive"
            onClick={handleDelete}
          >
            <Trash2 />
            Delete
          </Button>
          <Button className="flex-1" onClick={handleDownload}>
            <Download />
            Download
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
