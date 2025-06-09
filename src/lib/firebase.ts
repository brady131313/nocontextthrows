import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { addDoc, collection, getFirestore } from "firebase/firestore";

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

type Submission = {
  tags: string;
  files: FileList;
};

export const createSubmission = async (submission: Submission) => {
  const docRef = await addDoc(collection(db, "submissions"), {
    tags: submission.tags,
  });
};
