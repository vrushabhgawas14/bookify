// import { Navigate } from "react-router-dom";
// import { useAuth } from "../context/authContext";
// import { logoutUser } from "../firebase/auth";

// export default function Profile() {
//   const { userLoggedIn, userData } = useAuth();

//   if (!userLoggedIn) {
//     return <Navigate to={"/login"} replace={true} />;
//   }
//   return (
//     <>
//       <main>
//         <div className="flex flex-col justify-center items-center my-10 space-y-4">
//           <img
//             src={userData?.UserImage || require("../assets/images/d4.png")}
//             alt="Profile"
//             className="w-40 h-40 rounded-full border-4 border-borderColor_primary"
//           />
//           <header className="text-3xl">
//             Hello {userData ? userData.FirstName : "Guest"}
//           </header>

//           <p className="text-lg">
//             <span className="font-bold">Name: </span>
//             <span className="font-semibold">
//               {userData?.FirstName || "Guest"} {userData?.LastName}
//             </span>
//           </p>

//           <p className="text-lg">
//             <span className="font-bold">Email: </span>
//             <span className="font-semibold">
//               {userData?.Email || "guest@gmail.com"}
//             </span>
//           </p>
//           <button
//             onClick={logoutUser}
//             className="bg-borderColor_secondary text-textColor_primary p-1 px-4 hover:bg-backgroundDull hover:text-white ease-in-out duration-200 border border-borderColor_primary text-xl rounded-lg"
//           >
//             LogOut
//           </button>
//         </div>
//       </main>
//     </>
//   );
// }

import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import {
  logoutUser,
  deleteUserAccount,
  updateUserProfile,
} from "../firebase/auth";
import { Pencil, Trash2, Camera, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function Profile() {
  const { userLoggedIn, userData } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [newImage, setNewImage] = useState<File | null>(null);
  const [newName, setNewName] = useState(userData?.FirstName || "");

  if (!userLoggedIn) {
    return <Navigate to={"/login"} replace={true} />;
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewImage(e.target.files[0]);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setIsUpdating(true);
      await updateUserProfile(newName, newImage);
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      await deleteUserAccount();
      toast.success("Account deleted successfully");
    } catch (error) {
      toast.error("Failed to delete account");
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-backgroundDull rounded-2xl p-8 shadow-lg border border-borderColor_primary">
          <div className="relative flex flex-col items-center">
            {/* Profile Image */}
            <div className="relative group">
              <img
                src={
                  newImage
                    ? URL.createObjectURL(newImage)
                    : userData?.UserImage || require("../assets/images/d4.png")
                }
                alt="Profile"
                className="w-40 h-40 rounded-full border-4 border-borderColor_primary object-cover"
              />
              {isEditing && (
                <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full cursor-pointer group-hover:bg-opacity-70 transition-all">
                  <Camera className="w-8 h-8 text-white" />
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleImageChange}
                    accept="image/*"
                  />
                </label>
              )}
            </div>

            {/* Edit Button */}
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="absolute top-0 right-0 p-2 text-textColor_secondary hover:text-colorBright transition-colors"
            >
              {isEditing ? (
                <X className="w-6 h-6" />
              ) : (
                <Pencil className="w-6 h-6" />
              )}
            </button>

            {/* User Info */}
            <div className="mt-6 text-center space-y-4">
              {isEditing ? (
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="bg-background text-textColor_primary text-2xl text-center border border-borderColor_primary rounded-lg px-4 py-2 focus:outline-none focus:border-colorBright"
                />
              ) : (
                <h1 className="text-3xl font-bold text-colorBright">
                  Hello {userData?.FirstName || "Guest"}
                </h1>
              )}

              <div className="space-y-2 text-textColor_secondary">
                <p className="text-lg">
                  <span className="font-semibold">Full Name: </span>
                  {userData?.FirstName || "Guest"} {userData?.LastName}
                </p>
                <p className="text-lg">
                  <span className="font-semibold">Email: </span>
                  {userData?.Email || "guest@gmail.com"}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
                {isEditing ? (
                  <button
                    onClick={handleUpdateProfile}
                    disabled={isUpdating}
                    className="flex items-center justify-center px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                  >
                    {isUpdating ? (
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                ) : (
                  <button
                    onClick={logoutUser}
                    className="px-6 py-2 bg-backgroundDull text-textColor_primary border border-borderColor_primary rounded-lg hover:bg-background transition-colors"
                  >
                    Logout
                  </button>
                )}

                <button
                  onClick={() => setIsDeleting(true)}
                  className="flex items-center justify-center px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="w-5 h-5 mr-2" />
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {isDeleting && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-backgroundDull rounded-lg p-6 max-w-md w-full">
              <h2 className="text-2xl font-bold text-colorBright mb-4">
                Delete Account
              </h2>
              <p className="text-textColor_secondary mb-6">
                Are you sure you want to delete your account? This action cannot
                be undone.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setIsDeleting(false)}
                  className="px-4 py-2 bg-backgroundDull text-textColor_primary border border-borderColor_primary rounded-lg hover:bg-background transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
