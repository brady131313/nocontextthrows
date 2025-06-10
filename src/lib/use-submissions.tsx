import { useEffect, useState } from "react";
import {
  SubmissionSchema,
  submissionsCollection,
  type Submission,
} from "./firebase";
import { onSnapshot, orderBy, query } from "firebase/firestore";
import { ZodError } from "zod";

export const useSubmissions = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [error, setError] = useState<ZodError | null>(null);

  useEffect(() => {
    const q = query(submissionsCollection, orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      try {
        const items: Submission[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          const preprocessedData = {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate?.() || data.createdAt,
          };
          const submission = SubmissionSchema.parse(preprocessedData);
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
