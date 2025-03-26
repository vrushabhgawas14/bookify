import { Navigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { logoutUser } from "../firebase/auth";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase/firebase";

export default function Profile() {
  const { user, userLoggedIn } = useAuth();
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user?.email) {
        try {
          const q = query(
            collection(db, "users"),
            where("Email", "==", user.email)
          );
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const userData = querySnapshot.docs[0].data();
            setUserData(userData);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };

    fetchUserData();
  }, [user]);

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
            className="w-40 h-40 rounded-full border-4 border-slate-900"
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
            className="bg-white text-slate-900 p-1 px-4 hover:bg-slate-950 hover:text-white ease-in-out duration-200 border-2 border-slate-900 text-xl rounded-lg"
          >
            LogOut
          </button>
        </div>
      </main>
    </>
  );
}
