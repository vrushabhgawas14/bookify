import LoginRegistrationForm from "../components/LoginRegForm";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { loginUserWithEmailAndPassword } from "../firebase/auth";

export default function Login() {
  const { userLoggedIn } = useAuth();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      const formData = new FormData(e.currentTarget);
      const email = await formData.get("userEmail")?.toString().toLowerCase();
      const password = await formData.get("userPassword")?.toString();

      await loginUserWithEmailAndPassword(email!, password!);

      // alert(`User Login Successfully! ${userCredentials.user.email}`);
    } catch (error) {
      alert(`Error in user login: ${error}`);
      console.log(error);
    }
  }

  if (userLoggedIn) {
    return <Navigate to={"/"} replace={true} />;
  }
  return <LoginRegistrationForm isLogin={true} handleSubmit={handleSubmit} />;
}
