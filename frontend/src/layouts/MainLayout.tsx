import { Outlet } from "react-router-dom";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

export default function MainLayout() {
  return (
    <main className="bg-white text-slate-900">
      <Navbar />
      <Outlet />
      <Footer />
    </main>
  );
}
