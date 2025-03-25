import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import {
  doSignInWithGoogle,
  logoutUser,
  registerUserWithEmailAndPassword,
} from "../firebase/auth";
import { useState } from "react";
import { sendEmailVerification } from "firebase/auth";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../firebase/firebase";

export default function Register() {
  const { userLoggedIn, isUserVerified } = useAuth();
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    setErrorMessage("Verifying...");
    e.preventDefault();
    try {
      const formData = new FormData(e.currentTarget);
      const firstName = await formData.get("firstName")?.toString().trim();
      const lastName = await formData.get("lastName")?.toString().trim();
      const email = await formData
        .get("userEmail")
        ?.toString()
        .trim()
        .toLowerCase();
      const password = await formData.get("userPassword")?.toString().trim();
      const confirmPassword = await formData
        .get("userConfPassword")
        ?.toString()
        .trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      const imageInput = (await formData.get("imageInput")) as File;
      let imageURL = null;

      if (!email || !password || !confirmPassword || !firstName || !lastName) {
        setErrorMessage("All fields are required.");
        return;
      }

      if (!email?.match(emailRegex)) {
        setErrorMessage("Please enter a valid email address.");
        return;
      }

      if (password?.length! < 6) {
        setErrorMessage("Password must be at least 6 characters long.");
        return;
      }

      if (confirmPassword?.length! < 6) {
        setErrorMessage("Confirm Password must be at least 6 characters long.");
        return;
      }

      if (password !== confirmPassword) {
        setErrorMessage("Both Passwords do not match.");
        return;
      }

      const userCredential = await registerUserWithEmailAndPassword(
        email!,
        password!
      );
      const user = userCredential.user;

      if (imageInput && imageInput.size > 0) {
        imageURL = await uploadImageToImgur(imageInput);
      }

      const usersRef = collection(db, "users");
      const added = await addDoc(usersRef, {
        FirstName: firstName,
        LastName: lastName,
        Email: email,
        Verified: false,
        userImage: imageURL,
      });

      if (!added) {
        setErrorMessage("Data doesn't got saved. Please try again!");
        return;
      }

      await sendEmailVerification(user);

      await logoutUser();

      setErrorMessage("");
      setSuccessMessage(`Verification email sent ! \nPlease check your inbox.`);

      setTimeout(() => {
        navigate(`/login?slug=${encodeURIComponent(email)}`);
      }, 2000);
    } catch (error: any) {
      console.log(error);
      if (error.code === "auth/email-already-in-use") {
        setErrorMessage(
          "This email is already in use. Please use a different email."
        );
      } else if (error.code === "auth/network-request-failed") {
        setErrorMessage("Network Error. Check Internet Connection!");
      } else {
        setErrorMessage("Error registering user: " + error.message);
      }
    }
  }

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

  if (userLoggedIn && isUserVerified) {
    return <Navigate to={"/"} replace={true} />;
  }
  return (
    <main className="flex flex-col items-center justify-center my-10 px-6 space-y-4">
      <section className="flex flex-col items-center py-4 lg:px-6 rounded-xl sm:w-[90vw] bg-slate-200 border-2 border-slate-900 text-slate-900">
        <h1 className="text-3xl font-bold">Register</h1>
        <div className="py-6 flex flex-col items-center space-y-2">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col items-center space-y-4"
          >
            <div className="grid grid-cols-2 gap-4 px-4">
              <input
                type="text"
                id="firstName"
                name="firstName"
                placeholder="First Name*"
                className="w-full p-2 border border-gray-900 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                required
              />
              <input
                type="text"
                id="lastName"
                name="lastName"
                placeholder="Last Name*"
                className="w-full p-2 border border-gray-900 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                required
              />
            </div>
            <div className="flex items-center justify-between w-full font-semibold px-4">
              <label
                htmlFor="userEmail"
                className="text-xl sm:text-lg cursor-pointer"
              >
                Email<span className="text-red-700">*</span> :
              </label>
              <input
                id="userEmail"
                name="userEmail"
                type="text"
                required
                placeholder="john@gmail.com"
                className="border border-gray-900 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 px-2 pl-3 py-1 sm:w-[50vw]"
              />
            </div>
            <div className="flex items-center justify-between w-full font-semibold space-x-4 pb-2 px-4">
              <label
                htmlFor="userPassword"
                className="text-xl sm:text-lg cursor-pointer"
              >
                Password<span className="text-red-700">*</span> :
              </label>
              <input
                id="userPassword"
                name="userPassword"
                type="password"
                required
                placeholder="john@123"
                className="border border-gray-900 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 px-2 pl-3 py-1 sm:w-[50vw]"
              />
            </div>
            <div className="flex items-center justify-between w-full font-semibold space-x-4 pb-2 px-4">
              <label
                htmlFor="userConfPassword"
                className="text-xl sm:text-lg cursor-pointer"
              >
                Confirm Password<span className="text-red-700">*</span> :
              </label>
              <input
                id="userConfPassword"
                name="userConfPassword"
                type="password"
                required
                placeholder="john@123"
                className="border border-gray-900 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 px-2 pl-3 py-1 sm:w-[50vw]"
              />
            </div>

            <div className="flex flex-col items-start justify-between w-full font-semibold pb-2 px-4">
              <label
                htmlFor="imageInput"
                className="text-xl sm:text-lg cursor-pointer mb-2"
              >
                Profile Image :
              </label>
              <input
                type="file"
                id="imageInput"
                name="imageInput"
                accept=".jpg,.jpeg,.png"
                className="w-full  border border-slate-900 file:bg-background file:rounded-lg file:px-2 file:cursor-pointer p-2 rounded-md mb-3 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            {errorMessage && (
              <h2 className="w-[30vw] sm:w-[70vw] text-lg sm:text-base text-center bg-slate-200 text-red-700 border border-slate-900 py-1 px-2 rounded-xl font-semibold mx-4 text-wrap">
                {errorMessage}
              </h2>
            )}
            {successMessage && (
              <h2 className="w-[30vw] sm:w-[70vw] text-lg sm:text-base text-center bg-slate-200 text-green-700 border border-slate-900 py-1 px-2 rounded-xl font-semibold mx-4 text-wrap whitespace-pre-line">
                {successMessage}
              </h2>
            )}

            <button
              type="submit"
              className="bg-white hover:bg-slate-100 text-xl hover:text-black p-1 px-8 rounded-xl text-center text-slate-950 sm:p-2 sm:px-8 border-2 border-slate-900"
            >
              Create Account
            </button>
          </form>
          <div>
            <div className="py-2">
              Already have an account?
              <Link to="/login" className="pl-1 font-bold underline">
                Login
              </Link>
            </div>
          </div>
          <p className="font-bold">Or</p>
          {/* Google Login */}
          <div onClick={() => setLoading(!loading)}>
            <button
              type="submit"
              onClick={doSignInWithGoogle}
              className="flex items-center justify-center space-x-2 font-semibold text-xl px-3 py-2 bg-slate-900 text-zinc-200 hover:bg-slate-950 rounded-xl text-center"
            >
              {loading ? (
                <span>Loading...</span>
              ) : (
                <>
                  <img
                    src={require("../assets/svgs/google.svg").default}
                    alt="Google Svg"
                    className="w-7 h-7"
                  />
                  <span>Continue with Google</span>
                </>
              )}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
