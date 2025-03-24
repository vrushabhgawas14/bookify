import { onAuthStateChanged } from "firebase/auth";
import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase/firebase";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isUserVerified, setIsUserVerified] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser({ ...currentUser });
        setUserLoggedIn(true);
        setIsUserVerified(currentUser.emailVerified);
      } else {
        setUser(null);
        setUserLoggedIn(false);
        setIsUserVerified(false);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    console.log("isUserVerified = ", isUserVerified);
  }, [isUserVerified]);

  const value = { user, userLoggedIn, loading, isUserVerified };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
