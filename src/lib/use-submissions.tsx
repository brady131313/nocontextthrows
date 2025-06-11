import { useEffect, useState } from "react";
import {
  submissionDoc,
  SubmissionSchema,
  submissionsCollection,
  type Submission,
} from "./firebase";
import {
  getDoc,
  onSnapshot,
  orderBy,
  query,
  where,
  type DocumentData,
} from "firebase/firestore";
import { ZodError } from "zod";

const processSubmissionDoc = (
  docId: string,
  docData: DocumentData,
): Submission => {
  const preprocessedData = {
    id: docId,
    ...docData,
    createdAt: docData.createdAt?.toDate?.() || docData.createdAt,
    deletedAt: docData.deletedAt?.toDate?.() || docData.deletedAt,
  };

  return SubmissionSchema.parse(preprocessedData);
};

export const getSubmissionById = async (
  submissionId: string,
): Promise<Submission | null> => {
  try {
    const docRef = submissionDoc(submissionId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return processSubmissionDoc(docSnap.id, docSnap.data());
    } else {
      return null;
    }
  } catch (error) {
    if (error instanceof ZodError) {
      console.error("Validation error:", error);
    } else {
      console.error("Error fetching submission:", error);
    }
    return null;
  }
};

export const useSubmission = (
  submissionId: string,
  initialData?: Submission,
) => {
  const [submission, setSubmission] = useState<Submission | null>(
    initialData || null,
  );
  const [loading, setLoading] = useState<boolean>(!initialData);
  const [error, setError] = useState<ZodError | Error | null>(null);

  useEffect(() => {
    setLoading(!submission);
    const docRef = submissionDoc(submissionId);

    const unsub = onSnapshot(
      docRef,
      (docSnap) => {
        try {
          if (docSnap.exists()) {
            const parsedSubmission = processSubmissionDoc(
              docSnap.id,
              docSnap.data(),
            );
            setSubmission(parsedSubmission);
          } else {
            setSubmission(null);
          }
          setError(null);
        } catch (error) {
          if (error instanceof ZodError) {
            setError(error);
            console.error("Validation error:", error);
          } else {
            setError(error instanceof Error ? error : new Error(String(error)));
            console.error("Error processing submission data:", error);
          }
          setSubmission(null);
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error("Firestore subscription error:", err);
        setError(err);
        setLoading(false);
      },
    );

    return () => unsub();
  }, [submissionId]);

  return {
    submission,
    loading,
    error,
  };
};

export const useSubmissions = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [error, setError] = useState<ZodError | null>(null);

  useEffect(() => {
    const q = query(
      submissionsCollection,
      where("deletedAt", "==", null),
      orderBy("createdAt", "desc"),
    );
    const unsub = onSnapshot(q, (snapshot) => {
      try {
        const items: Submission[] = [];
        snapshot.forEach((doc) => {
          items.push(processSubmissionDoc(doc.id, doc.data()));
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
