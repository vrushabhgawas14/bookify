import { useState } from "react";
import { Link } from "react-router-dom";
import { doSignInWithGoogle } from "../firebase/auth";

interface myProps {
  isLogin?: Boolean;
  handleSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
  errorMessage?: string;
  redirectMsg?: string;
}

export default function LoginRegistrationForm({
  isLogin,
  handleSubmit,
  errorMessage,
  redirectMsg,
}: myProps) {
  const [loading, setLoading] = useState(false);

  return (
    <>
      <main className="flex flex-col items-center justify-center my-10 px-6 text-zinc-200 space-y-4">
        {redirectMsg && (
          <h1 className="text-green-800 bg-white px-4 py-1 my-4 rounded-xl text-2xl sm:text-xl text-center">
            Verification link sent to{" "}
            <span className="font-bold">{redirectMsg}</span>
          </h1>
        )}
        {errorMessage && (
          <h2 className="text-xl text-center bg-gray-200 text-green-700 p-2 px-4 rounded-xl font-semibold">
            {errorMessage}
          </h2>
        )}
        <section className="flex flex-col items-center py-4 lg:px-6 rounded-xl sm:w-[90vw] bg-slate-950">
          <h1 className="text-3xl font-bold">
            {isLogin ? "Login" : "Registration"}
          </h1>
          <div className="py-6 flex flex-col items-center space-y-2">
            <form
              onSubmit={handleSubmit}
              className="flex flex-col items-center space-y-4"
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
                  className="px-2 pl-3 py-1 sm:w-[50vw] rounded-xl text-teal-900 outline-none"
                />
              </div>
              <div className="flex items-center justify-between w-full font-semibold space-x-4 pb-2">
                <label
                  htmlFor="userPassword"
                  className="text-xl cursor-pointer"
                >
                  Password :
                </label>
                <input
                  id="userPassword"
                  name="userPassword"
                  type="password"
                  required
                  placeholder="john@123"
                  className="px-2 pl-3 py-1 sm:w-[50vw] rounded-xl text-teal-900 outline-none"
                />
              </div>
              <button
                type="submit"
                className="bg-white hover:bg-slate-100 text-xl hover:text-black p-1 px-8 rounded-xl text-center text-slate-950 sm:p-2 sm:px-8"
              >
                {isLogin ? "Login" : "Create Account"}
              </button>
            </form>
            <div>
              {isLogin ? (
                <div className="py-2">
                  Don&apos;t have an account?
                  <Link to="/register" className="pl-1 font-bold underline">
                    Register
                  </Link>
                </div>
              ) : (
                <div className="py-2">
                  Already have an account?
                  <Link to="/login" className="pl-1 font-bold underline">
                    Login
                  </Link>
                </div>
              )}
            </div>
            <p className="font-bold">Or</p>
            {/* Google Login */}
            <div onClick={() => setLoading(!loading)}>
              <button
                type="submit"
                onClick={doSignInWithGoogle}
                className="flex items-center justify-center space-x-2 font-semibold text-xl px-2 py-1 bg-zinc-200 text-black hover:bg-white rounded-xl text-center"
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
                    <span>{isLogin ? "Sign in" : "Continue"} with Google</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
