import { Link, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/authContext";
import {
  doSignInWithGoogle,
  loginUserWithEmailAndPassword,
  logoutUser,
} from "../firebase/auth";
import { useEffect, useState } from "react";
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
  const location = useLocation();
  const [redirectMsg, setRedirectMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const params = new URLSearchParams(location.search);
  const slugEmail = params.get("slug");

  useEffect(() => {
    if (slugEmail != null) {
      setRedirectMsg(slugEmail);
    }
  }, [slugEmail]);

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

      // Check if auth provider is google
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("Email", "==", email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();

        if (userData.Provider === "google") {
          setErrorMessage(
            "You signed up with Google. \nPlease login using Google Again!"
          );
          return;
        }
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
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0].ref;
        await updateDoc(userDoc, { Verified: true });
      }

      setErrorMessage("");
      setSuccessMessage("User Login Successfully!");
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
    <main className="flex flex-col items-center justify-center my-10 px-6 text-zinc-200 space-y-4">
      {redirectMsg && (
        <h1 className="text-green-800 bg-textColor_primary px-4 py-1 my-4 rounded-xl text-2xl sm:text-xl text-center">
          Verification link sent to{" "}
          <span className="font-bold">{redirectMsg}</span>
        </h1>
      )}
      <section className="flex flex-col items-center py-4 lg:px-6 rounded-xl sm:w-[90vw] bg-message border-2 border-borderColor_primary text-textColor_primary">
        <h1 className="text-3xl font-bold">Login</h1>
        <div className="py-6 flex flex-col items-center space-y-2">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col items-center space-y-4 mx-2 md:mx-6"
          >
            <div className="flex items-center justify-between w-full font-semibold space-x-4">
              <label htmlFor="userEmail" className="text-xl cursor-pointer">
                Email :
              </label>
              <input
                id="userEmail"
                name="userEmail"
                type="text"
                required
                placeholder="john@gmail.com"
                defaultValue={redirectMsg}
                className="w-[20vw] md:w-[25vw] sm:w-[50vw] px-2 pl-3 py-1 border border-textColor_primary bg-white/95 rounded-lg focus:outline-none focus:ring-1 focus:ring-borderColor_primary text-background"
              />
            </div>
            <div className="flex items-center justify-between w-full font-semibold space-x-4 pb-2">
              <label htmlFor="userPassword" className="text-xl cursor-pointer">
                Password :
              </label>
              <input
                id="userPassword"
                name="userPassword"
                type="password"
                required
                placeholder="john@123"
                className="w-[20vw] md:w-[25vw] sm:w-[50vw] px-2 pl-3 py-1 border border-textColor_primary  bg-white/95 rounded-lg focus:outline-none focus:ring-1 focus:ring-borderColor_primary text-background"
              />
            </div>
            {errorMessage && (
              <h2 className="w-[25vw] sm:w-[70vw] text-lg sm:text-base text-center bg-colorBright border border-borderColor_primary text-red-700 py-1 px-2 rounded-xl font-semibold mx-4 text-wrap whitespace-pre-line">
                {errorMessage}
              </h2>
            )}

            {successMessage && (
              <h2 className="w-[25vw] sm:w-[70vw] text-lg sm:text-base text-center bg-colorBright border border-borderColor_primary text-green-700 py-1 px-2 rounded-xl font-semibold mx-4 text-wrap">
                {successMessage}
              </h2>
            )}
            <button
              type="submit"
              className="bg-colorBright hover:bg-slate-100 text-xl sm:text-lg hover:text-black p-1 px-8 rounded-xl text-center text-stone-950 sm:px-6 border-2 border-backgroundDull"
            >
              Login
            </button>
          </form>
          <div>
            <div className="py-2">
              Don&apos;t have an account?
              <Link to="/register" className="pl-1 font-bold underline">
                Register
              </Link>
            </div>
          </div>
          <p className="font-bold">Or</p>
          {/* Google Login */}
          <div onClick={() => setLoading(!loading)}>
            <button
              type="submit"
              onClick={doSignInWithGoogle}
              className="flex items-center justify-center space-x-2 font-semibold text-xl px-3 py-2 bg-background text-zinc-200 hover:bg-backgroundDull rounded-xl text-center border border-borderColor_primary"
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
                  <span>Sign in with Google</span>
                </>
              )}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
