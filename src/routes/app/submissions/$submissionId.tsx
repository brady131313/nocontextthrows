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
import { deleteSubmission } from "@/lib/firebase";
import { getSubmissionById, useSubmission } from "@/lib/use-submissions";
import { cn, formatDate } from "@/lib/utils";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Download, Trash2 } from "lucide-react";

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
    await deleteSubmission([submissionId]);
    navigate({ to: ".." });
  };

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
            (submission?.filePaths.length || 0) > 1 && "md:grid-cols-2",
          )}
        >
          {submission?.filePaths.map((filePath) => (
            <FireFilePreview
              key={filePath}
              filePath={filePath}
              fileType="image"
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
          <Button className="flex-1">
            <Download />
            Download
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
