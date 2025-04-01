import { Navigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { logoutUser } from "../firebase/auth";

export default function Profile() {
  const { userLoggedIn, userData } = useAuth();

  if (!userLoggedIn) {
    return <Navigate to={"/login"} replace={true} />;
  }
  return (
    <>
      <main>
        <div className="flex flex-col justify-center items-center my-10 space-y-4">
          <img
            src={userData?.UserImage || require("../assets/images/d4.png")}
            alt="Profile"
            className="w-40 h-40 rounded-full border-4 border-borderColor_primary"
          />
          <header className="text-3xl">
            Hello {userData ? userData.FirstName : "Guest"}
          </header>

          <p className="text-lg">
            <span className="font-bold">Name: </span>
            <span className="font-semibold">
              {userData?.FirstName || "Guest"} {userData?.LastName}
            </span>
          </p>

          <p className="text-lg">
            <span className="font-bold">Email: </span>
            <span className="font-semibold">
              {userData?.Email || "guest@gmail.com"}
            </span>
          </p>
          <button
            onClick={logoutUser}
            className="bg-borderColor_secondary text-textColor_primary p-1 px-4 hover:bg-backgroundDull hover:text-white ease-in-out duration-200 border border-borderColor_primary text-xl rounded-lg"
          >
            LogOut
          </button>
        </div>
      </main>
    </>
  );
}
