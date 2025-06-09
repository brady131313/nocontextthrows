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
import { createSubmission } from "@/lib/firebase";
import { toast } from "sonner";
import { useState } from "react";

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
    ),
});

type SubmissionSchema = z.infer<typeof submissionSchema>;

export function SubmissionForm() {
  const [fileInputKey, setFileInputKey] = useState("file-input");

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
    try {
      await createSubmission(data);
      resetForm();
      toast.success("Submission created successfully!");
    } catch (error) {
      console.error(error);
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

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Submitting..." : "Submit"}
        </Button>
      </form>
    </Form>
  );
}
