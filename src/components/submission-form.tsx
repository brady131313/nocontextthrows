import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { createSubmission, type UploadProgressEvent } from "@/lib/firebase";
import { toast } from "sonner";
import { useState } from "react";
import { useAuth } from "@/lib/auth-provider";
import { Label } from "./ui/label";
import { Progress } from "./ui/progress";

const MAX_SIZE = 100 * 1024 * 1024;

const submissionSchema = z.object({
  tags: z.string(),
  files: z
    .instanceof(FileList, { message: "Please select at least one file" })
    .refine((files) => files.length <= 5, {
      message: "You can only upload up to 5 files",
    })
    .refine(
      (files) =>
        Array.from(files).every(
          (f) => f.type.startsWith("image/") || f.type.startsWith("video/"),
        ),
      { message: "Only images and videos are allowed" },
    )
    .refine((files) => Array.from(files).every((f) => f.size < MAX_SIZE), {
      message: "File size exceeds the limit",
    }),
});

type SubmissionSchema = z.infer<typeof submissionSchema>;

export function SubmissionForm() {
  const { user } = useAuth();
  const [fileInputKey, setFileInputKey] = useState("file-input");
  const [uploadProgress, setUploadProgress] = useState<UploadProgressEvent[]>(
    [],
  );

  const form = useForm<SubmissionSchema>({
    resolver: zodResolver(submissionSchema),
    defaultValues: {
      tags: "",
      files: undefined,
    },
  });

  const resetForm = () => {
    form.reset();
    // Reset the file input key to trigger a re-render
    const keySuffix = Math.random().toString(36).substring(2, 9);
    setFileInputKey(`${fileInputKey}-${keySuffix}`);
  };

  const onSubmit = async (data: SubmissionSchema) => {
    const initialProgress: UploadProgressEvent[] = Array.from(data.files).map(
      (_, idx) => ({
        status: "change",
        progress: 0,
        idx,
      }),
    );
    setUploadProgress(initialProgress);

    const result = await createSubmission(data, user!.uid, (event) => {
      setUploadProgress((prev) =>
        prev.map((e) => (e.idx === event.idx ? event : e)),
      );
    });

    if (result.success) {
      resetForm();
      setUploadProgress([]);
      toast.success("Submission created successfully!");
    } else {
      toast.error("Submission failed");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>
                Provide the tags you would like to be included in the post
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="files"
          render={({ field: { onChange, value: _, ...fieldProps } }) => (
            <FormItem>
              <FormLabel>Images/Videos</FormLabel>
              <FormControl>
                <Input
                  key={fileInputKey}
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  {...fieldProps}
                  onChange={(e) => onChange(e.target.files)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {uploadProgress.length > 0 && (
          <div>
            <Label>Upload Progress</Label>
            <div className="space-y-2 mt-3">
              {uploadProgress.map((progress) => (
                <Progress
                  key={progress.idx}
                  variant={progress.status === "error" ? "error" : "default"}
                  value={progress.status === "change" ? progress.progress : 100}
                />
              ))}
            </div>
          </div>
        )}

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Submitting..." : "Submit"}
        </Button>
      </form>
    </Form>
  );
}
