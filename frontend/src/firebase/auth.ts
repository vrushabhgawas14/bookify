import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { auth, db } from "./firebase";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";

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

export const updateUserProfile = async (
  newName?: string,
  newImage?: File | null
) => {
  const user = auth.currentUser;
  if (!user) throw new Error("No user logged in");

  const userQuery = query(
    collection(db, "users"),
    where("Email", "==", user.email)
  );
  const userDocs = await getDocs(userQuery);

  let imageURL: string | null = null;
  let fullName: string[] | null = null;
  let firstName = "";
  let lastName = "";

  if (newName) {
    fullName = newName?.split(" ");
    firstName = fullName ? fullName[0] : "";
    lastName =
      fullName && fullName.length > 1 ? fullName.slice(1).join(" ") : "";
  }

  // Upload image to Imgur if provided
  if (newImage) {
    imageURL = await uploadImageToImgur(newImage);
  }

  for (const document of userDocs.docs) {
    const updates: any = {};

    if (newName) updates.FirstName = firstName;
    if (newName) updates.LastName = lastName;
    if (imageURL) updates.UserImage = imageURL;

    if (Object.keys(updates).length > 0) {
      await updateDoc(doc(db, "users", document.id), updates);
    }
  }
};

async function uploadImageToImgur(file: File) {
  const CLIENT_ID = "aad565c0e43817e";

  const formData = new FormData();
  formData.append("image", file);

  try {
    console.log("Uploading Image..");
    const response = await fetch("https://api.imgur.com/3/image", {
      method: "POST",
      headers: {
        Authorization: `Client-ID ${CLIENT_ID}`,
      },
      body: formData,
    });
    console.log("Uploaded Image");

    const data = await response.json();

    if (data.success) {
      return data.data.link;
    } else {
      console.error("Imgur upload failed:", data);
      return null;
    }
  } catch (error) {
    console.error("Error uploading image to Imgur:", error);
    return null;
  }
}
