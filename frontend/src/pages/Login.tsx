import LoginRegistrationForm from "../components/LoginRegForm";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { loginUserWithEmailAndPassword, logoutUser } from "../firebase/auth";
import { useState } from "react";
import {
  collection,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase/firebase";

export default function Login() {
  const { userLoggedIn, isUserVerified } = useAuth();
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    setErrorMessage("Loading...");
    e.preventDefault();
    try {
      const formData = new FormData(e.currentTarget);
      const email = await formData.get("userEmail")?.toString().toLowerCase();
      const password = await formData.get("userPassword")?.toString();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!email?.match(emailRegex)) {
        setErrorMessage("Please enter a valid email address.");
        return;
      }

      if (password?.length! < 6) {
        setErrorMessage("Password must be at least 6 characters long.");
        return;
      }

      const userCredential = await loginUserWithEmailAndPassword(
        email!,
        password!
      );
      const user = userCredential.user;

      if (!user.emailVerified) {
        setErrorMessage("Please verify your email before logging in.");
        await logoutUser();
        return;
      }

      // Update "Verified" data
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("Email", "==", email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0].ref;
        await updateDoc(userDoc, { Verified: true });
      }

      setErrorMessage("User Login Successfully!");
    } catch (error: any) {
      console.log(error);
      if (error.code === "auth/invalid-credential") {
        setErrorMessage("Email or Password is Incorrect.");
      } else if (error.code === "auth/wrong-password") {
        setErrorMessage("Incorrect password. Please try again.");
      } else if (error.code === "auth/network-request-failed") {
        setErrorMessage("Network Error. Check Internet Connection!");
      } else {
        setErrorMessage("Error Login user: " + error.message);
      }
    }
  }

  if (userLoggedIn && isUserVerified) {
    return <Navigate to={"/"} replace={true} />;
  }

  return (
    <LoginRegistrationForm
      isLogin={true}
      handleSubmit={handleSubmit}
      errorMessage={errorMessage}
    />
  );
}
