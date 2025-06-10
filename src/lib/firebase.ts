import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getStorage, ref, uploadBytes } from "firebase/storage";
import { addDoc, collection, getFirestore } from "firebase/firestore";
import { z } from "zod";

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

export const signInWithGoogle = async (): Promise<boolean> => {
  const provider = new GoogleAuthProvider();

  try {
    await signInWithPopup(auth, provider);
    return true;
  } catch (error) {
    console.error("Error signing in with Google:", error);
    return false;
  }
};

export const signOut = async () => {
  await auth.signOut();
};

export const SubmissionSchema = z.object({
  id: z.string(),
  tags: z.string(),
  filePaths: z.array(z.string()),
  uid: z.string(),
  createdAt: z.coerce.date(),
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

export const createSubmission = async (
  submission: NewSubmission,
  uid: string,
): Promise<SubmissionSubmitResult> => {
  try {
    const filePromises = Array.from(submission.files).map((file) =>
      uploadFileAndGetUrl(file, uid),
    );
    const uploadedFileUrls = await Promise.all(filePromises);

    const docRef = await addDoc(submissionsCollection, {
      tags: submission.tags,
      filePaths: uploadedFileUrls,
      createdAt: new Date(),
      uid,
    });

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error creating submission: ", error);
    return { success: false, error };
  }
};

const uploadFileAndGetUrl = async (
  file: File,
  uid: string,
): Promise<string> => {
  const timestamp = Date.now();
  const fileName = `${uid}-${timestamp}-${file.name}`;

  const storageRef = ref(storage, `submissions/${fileName}`);
  await uploadBytes(storageRef, file, {
    customMetadata: {
      userId: uid,
    },
  });

  return storageRef.fullPath;
};
