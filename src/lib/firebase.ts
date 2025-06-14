import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
} from "firebase/auth";
import {
  getBlob,
  getStorage,
  ref,
  StorageError,
  uploadBytesResumable,
} from "firebase/storage";
import {
  addDoc,
  collection,
  doc,
  getFirestore,
  runTransaction,
} from "firebase/firestore";
import { z } from "zod";
import JSZip from "jszip";

const firebaseConfig = {
  apiKey: "AIzaSyD18MG0PsY249jEcuokamcBYCak1jJApwM",
  authDomain: "nocontextthrows-ff63b.firebaseapp.com",
  projectId: "nocontextthrows-ff63b",
  storageBucket: "nocontextthrows-ff63b.firebasestorage.app",
  messagingSenderId: "36279573098",
  appId: "1:36279573098:web:679ad0af654f9ba15a0813",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export const signInWithGoogle = async (): Promise<void> => {
  const provider = new GoogleAuthProvider();

  try {
    if (import.meta.env.DEV) {
      await signInWithPopup(auth, provider);
    } else {
      await signInWithRedirect(auth, provider);
    }
  } catch (error) {
    console.error("Error signing in with Google:", error);
  }
};

export const signOut = async () => {
  await auth.signOut();
};

const SubmissionFileType = z.enum(["image", "video"]);
type SubmissionFileType = z.infer<typeof SubmissionFileType>;

const SubmissionFileSchema = z.object({
  path: z.string(),
  size: z.number(),
  type: SubmissionFileType,
});

type SubmissionFile = z.infer<typeof SubmissionFileSchema>;

export const BaseSubmissionSchema = z.object({
  uid: z.string(),
  createdAt: z.date(),
  tags: z.string(),
  files: z.array(SubmissionFileSchema),
  deletedAt: z.date().nullable(),
});

export type BaseSubmissionSchema = z.infer<typeof BaseSubmissionSchema>;

export const SubmissionSchema = BaseSubmissionSchema.extend({
  id: z.string(),
});

export type Submission = z.infer<typeof SubmissionSchema>;

type NewSubmission = {
  tags: string;
  files: FileList;
};

type SubmissionSubmitResult =
  | {
      success: true;
      id: string;
    }
  | {
      success: false;
      error: unknown;
    };

export const submissionsCollection = collection(db, "submissions");

export const submissionDoc = (submissionId: string) =>
  doc(db, "submissions", submissionId);

export const submissionFileRef = (path: string) => ref(storage, path);

type UploadProgressEventDone = { status: "done"; idx: number };
type UploadProgressEventError = {
  status: "error";
  idx: number;
  error: StorageError;
};
type UploadProgressEventChange = {
  status: "change";
  idx: number;
  progress: number;
};

export type UploadProgressEvent =
  | UploadProgressEventDone
  | UploadProgressEventError
  | UploadProgressEventChange;

export const createSubmission = async (
  newSubmission: NewSubmission,
  uid: string,
  uploadProgressHandler?: (event: UploadProgressEvent) => void,
): Promise<SubmissionSubmitResult> => {
  try {
    const filePromises = Array.from(newSubmission.files).map((file, idx) =>
      uploadFileAndGetSubmissionFile(file, uid, idx, uploadProgressHandler),
    );
    const uploadedFiles = await Promise.all(filePromises);
    const submission = BaseSubmissionSchema.parse({
      tags: newSubmission.tags,
      files: uploadedFiles,
      createdAt: new Date(),
      deletedAt: null,
      uid,
    });

    const docRef = await addDoc(submissionsCollection, submission);

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error creating submission: ", error);
    return { success: false, error };
  }
};

const getFileType = (file: File): SubmissionFileType => {
  if (file.type.startsWith("image/")) {
    return "image";
  } else if (file.type.startsWith("video/")) {
    return "video";
  } else {
    throw new Error(`Unsupported file type: ${file.type}`);
  }
};

const uploadFileAndGetSubmissionFile = async (
  file: File,
  uid: string,
  idx: number,
  uploadProgressHandler?: (event: UploadProgressEvent) => void,
): Promise<SubmissionFile> => {
  const timestamp = Date.now();
  const fileName = `${uid}-${timestamp}-${file.name}`;

  const storageRef = ref(storage, `submissions/${fileName}`);
  const uploadTask = uploadBytesResumable(storageRef, file, {
    customMetadata: {
      userId: uid,
    },
  });

  return new Promise((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        uploadProgressHandler?.({ status: "change", idx, progress });
      },
      (error) => {
        uploadProgressHandler?.({ status: "error", idx, error });
        reject(error);
      },
      () => {
        uploadProgressHandler?.({ status: "done", idx });

        resolve({
          path: storageRef.fullPath,
          size: file.size,
          type: getFileType(file),
        });
      },
    );
  });
};

type DeleteResult = { success: true } | { success: false; error: Error };

/// Mark submission as deleted, files will be cleaned up later by cloud function
export const deleteSubmission = async (
  submissionIds: string[],
): Promise<DeleteResult> => {
  try {
    if (submissionIds.length === 0) {
      return { success: true };
    }

    await runTransaction(db, async (tx) => {
      const docs = await Promise.all(
        submissionIds.map((id) => {
          const docRef = submissionDoc(id);
          return tx.get(docRef);
        }),
      );

      for (const doc of docs) {
        if (!doc.exists()) {
          throw new Error(`Submission with ID ${doc.id} does not exist`);
        }
      }

      submissionIds.forEach((id) => {
        const docRef = submissionDoc(id);
        tx.update(docRef, {
          deletedAt: new Date(),
        });
      });
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting submission: ", error);
    return {
      success: false,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
};

type DownloadResult =
  | { success: true; archiveName: string; data: Blob }
  | { success: false; error: Error };

export const downloadSubmission = async (
  submission: Submission,
): Promise<DownloadResult> => {
  try {
    const zip = new JSZip();
    const tagsHypenated = submission.tags.replace(/ +/g, "-").toLowerCase();

    // Download each file and add to zip
    const downloadPromises = submission.files.map(async (file, i) => {
      const fileExtension = file.path.split(".").pop();
      if (!fileExtension) {
        throw new Error(`Invalid file extension for file ${file.path}`);
      }

      const fileName = `${tagsHypenated}-${i + 1}.${fileExtension}`;

      const storageRef = submissionFileRef(file.path);
      const blob = await getBlob(storageRef);
      zip.file(fileName, blob);

      return fileName;
    });

    // Wait for all downloads to complete
    await Promise.all(downloadPromises);

    const zipBlob = await zip.generateAsync({ type: "blob" });
    const archiveName = `${tagsHypenated}.zip`;
    return { success: true, data: zipBlob, archiveName };
  } catch (error) {
    console.error("Error downloading submission: ", error);
    return {
      success: false,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
};
