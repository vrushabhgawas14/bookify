import { Link } from "react-router-dom";
import { NavbarAuthButton, NavbarDetails } from "../constants/NavbarDetails";
import { useEffect, useState } from "react";
import { useAuth } from "../context/authContext";

export default function Navbar() {
  const hamburgerMenu = {
    bar: (
      <svg viewBox="0 0 448 512" fill="#a8a29e">
        <path d="M0 96C0 78.3 14.3 64 32 64H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H32C14.3 128 0 113.7 0 96zM0 256c0-17.7 14.3-32 32-32H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H32c-17.7 0-32-14.3-32-32zM448 416c0 17.7-14.3 32-32 32H32c-17.7 0-32-14.3-32-32s14.3-32 32-32H416c17.7 0 32 14.3 32 32z" />
      </svg>
    ),
    cross: (
      <svg viewBox="0 0 490 490" fill="#d4d4d8">
        <polygon
          points="456.851,0 245,212.564 33.149,0 0.708,32.337 212.669,245.004 0.708,457.678 33.149,490 245,277.443 456.851,490 
	489.292,457.678 277.331,245.004 489.292,32.337 "
        />
      </svg>
    ),
  };

  const { userLoggedIn, isUserVerified } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  let hamburger = hamburgerMenu.bar;
  hamburger = isOpen ? hamburgerMenu.cross : hamburgerMenu.bar;

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto"; // Cleanup
    };
  }, [isOpen]);
  return (
    <>
      <nav className="relative">
        <section className="h-16 w-full flex justify-between px-10 sm:px-4 items-center fixed border-b border-borderColor_secondary bg-backgroundDull z-40">
          <div className="text-3xl font-semibold z-50">
            <Link to="/" className="font-bold text-textColor_primary">
              Bookify
            </Link>
          </div>
          <div
            className={`flex lg:justify-between items-center lg:w-[60vw] w-full ${
              isOpen ? "toggleNav" : "sm:hidden md:hidden"
            }`}
            onClick={() => setIsOpen(false)}
          >
            {/* Nav Elements */}
            <div
              className={`lg:text-lg font-semibold ${
                isOpen
                  ? "flex flex-col text-2xl mt-32 md:mt-24 justify-start items-center space-y-6"
                  : "space-x-8"
              }`}
            >
              {NavbarDetails.map((item, i) => (
                <Link
                  key={i}
                  to={item.url}
                  className={`${
                    isOpen
                      ? "bg-backgroundDull p-2 px-8 rounded-xl w-60 text-center shadow-md shadow-borderColor_primary border border-borderColor_primary"
                      : "w-fit relative before:absolute before:bottom-0 before:left-0 before:w-0 before:h-[2px] before:bg-textColor_secondary before:bg-opacity-70 before:transition-all before:duration-300 hover:before:w-full"
                  }`}
                >
                  {item.title}
                </Link>
              ))}
            </div>
            {/* Login And Registration */}
            <div className="flex sm:flex-col sm:space-y-4 lg:space-x-4 items-center font-semibold">
              {userLoggedIn && isUserVerified ? (
                <>
                  <Link
                    to={"/profile"}
                    className="hover:bg-background bg-backgroundDull text-xl hover:text-textColor_secondary ease-in-out duration-200 p-1 px-8 rounded-xl text-center border-2 border-borderColor_primary shadow-md sm:shadow-borderColor_primary sm:p-2 sm:px-8"
                  >
                    Profile
                  </Link>
                </>
              ) : (
                <>
                  {NavbarAuthButton.map((item, i) => (
                    <Link
                      key={i}
                      to={item.url}
                      className="hover:bg-background bg-backgroundDull text-xl hover:text-textColor_secondary ease-in-out duration-200 p-1 px-8 rounded-xl text-center border-2 border-borderColor_primary shadow-md sm:shadow-borderColor_primary sm:p-2 sm:px-8"
                    >
                      {item.title}
                    </Link>
                  ))}
                </>
              )}
            </div>
          </div>
          {/* Hamburger Menu */}
          <div className="lg:hidden sm:w-auto z-50 fixed right-6">
            <button
              className="w-6 h-6"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Hamburger Menu"
            >
              {hamburger}
            </button>
          </div>
        </section>
        <section className="pt-16" />
      </nav>
    </>
  );
}
