import { Navigate } from "react-router-dom";
import LoginRegistrationForm from "../components/LoginRegForm";
import { useAuth } from "../context/authContext";
import { registerUserWithEmailAndPassword } from "../firebase/auth";

export default function Register() {
  const { userLoggedIn } = useAuth();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      const formData = new FormData(e.currentTarget);
      const email = await formData.get("userEmail")?.toString().toLowerCase();
      const password = await formData.get("userPassword")?.toString();

      await registerUserWithEmailAndPassword(email!, password!);
    } catch (error) {
      alert(`Error registering user: ${error}`);
      console.log(error);
    }
  }

  if (userLoggedIn) {
    return <Navigate to={"/"} replace={true} />;
  }
  return <LoginRegistrationForm isLogin={false} handleSubmit={handleSubmit} />;
}
