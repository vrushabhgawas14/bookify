import { Link } from "react-router-dom";
import { NavbarDetails } from "../constants/NavbarDetails";

export default function Navbar() {
  return (
    <>
      <nav className="border-b-2 border-black">
        <section className="h-16 w-full flex justify-between px-10 sm:px-4 items-center">
          <div className="text-3xl font-semibold">
            <Link to="/">Bookify</Link>
          </div>
          <div className="space-x-8 text-xl font-semibold sm:hidden">
            {NavbarDetails.map((item, i) => (
              <Link key={i} to={item.url}>
                {item.title}
              </Link>
            ))}
          </div>
          <div className="flex space-x-4 items-center text-xl font-semibold">
            <div>Login</div>
            <div className="bg-gray-400 px-2 py-1 rounded-lg">SignUp</div>
          </div>
        </section>
      </nav>
    </>
  );
}
