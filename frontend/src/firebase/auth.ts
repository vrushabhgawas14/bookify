import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { auth, db } from "./firebase";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";

export const registerUserWithEmailAndPassword = (
  email: string,
  password: string
) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const loginUserWithEmailAndPassword = (
  email: string,
  password: string
) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const doSignInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();

  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    const userName = user.displayName?.split(" ") ?? [];
    const [firstName, ...lastName] = userName;

    if (user) {
      const q = query(
        collection(db, "users"),
        where("Email", "==", user.email)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        const usersRef = collection(db, "users");
        const added = await addDoc(usersRef, {
          FirstName: firstName || "Not Provided",
          LastName: lastName.join(" ") || "Undefined",
          Email: user.email,
          Verified: user.emailVerified,
          UserImage: user.photoURL,
          Provider: "google",
        });

        if (!added) {
          alert("Failed to store user Data with Google SignIn.");
          await logoutUser();
          return;
        }

        console.log("User signed up and data stored.");
        return result;
      } else {
        console.log("User Data already exists !");
      }
    }
  } catch (error) {
    console.error("Google Sign-In Error:", error);
  }
};

export const logoutUser = () => {
  return signOut(auth);
};
