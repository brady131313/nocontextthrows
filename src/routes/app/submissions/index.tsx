import { SubmissionsTable } from "@/components/submissions-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app/submissions/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex w-full max-w-3xl flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <SubmissionsTable />
        </CardContent>
      </Card>
    </div>
  );
}
