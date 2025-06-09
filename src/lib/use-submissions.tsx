import { useEffect, useState } from "react";
import {
  SubmissionSchema,
  submissionsCollection,
  type Submission,
} from "./firebase";
import { onSnapshot } from "firebase/firestore";
import { ZodError } from "zod";

export const useSubmissions = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [error, setError] = useState<ZodError | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(submissionsCollection, (snapshot) => {
      try {
        const items: Submission[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          const submission = SubmissionSchema.parse({ id: doc.id, ...data });
          items.push(submission);
        });

        setSubmissions(items);
      } catch (error) {
        if (error instanceof ZodError) {
          setError(error);
          console.error("Validation error:", error);
        } else {
          console.error("Unexpected error:", error);
        }
        setSubmissions([]);
      }
    });

    return () => unsub();
  }, []);

  return {
    submissions,
    error,
  };
};
