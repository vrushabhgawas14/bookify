import { ConnectColumn, LearnColumn } from "../constants/FooterDetails";

export default function Footer() {
  return (
    <>
      <footer
        id="footer"
        className="flex flex-col border-t-2 border-borderColor_primary"
      >
        {/* Actual Footer */}
        <section className="flex justify-between m-10 sm:flex-col ">
          {/* Left Side */}
          <div className="p-4 space-y-4 text-center">
            <a href="/" className="text-4xl sm:text-3xl font-bold">
              Bookify
            </a>
            <div className="flex items-center space-x-4 justify-center pb-4 border-b border-textColor_secondary/60">
              <a href="https://linkedin.com/in/vrushabhgawas/" target="_blank">
                <img
                  src={require("../assets/svgs/linkedin.svg").default}
                  width={20}
                  height={20}
                  alt="LinkedIN"
                />
              </a>
              <a href="https://github.com/vrushabhgawas14/" target="_blank">
                <img
                  src={require("../assets/svgs/github.svg").default}
                  width={24}
                  height={24}
                  alt="Github"
                />
              </a>
            </div>
            <div className="flex gap-x-2 justify-center px-4 font-semibold">
              <a
                href={"/terms"}
                target="_blank"
                className="hover:opacity-95 ease-out duration-200"
              >
                Terms
              </a>
              <span>•</span>
              <a
                href={"/privacy"}
                target="_blank"
                className="hover:opacity-95 ease-out duration-200"
              >
                Privacy
              </a>
              <span>•</span>
              <a
                href={"/contact"}
                target="_blank"
                className="hover:opacity-95 ease-out duration-200"
              >
                Contact
              </a>
            </div>
          </div>
          {/* Right Side */}
          <div className="flex sm:flex-wrap items-start justify-evenly sm:justify-between lg:w-[60%] md:w-[50%] sm:mt-10">
            <div>
              <h1 className="text-3xl py-4 font-semibold">Learn</h1>
              {LearnColumn.map((item, index) => (
                <a
                  key={index}
                  href={item.url}
                  className="flex flex-col py-2 text-xl w-fit relative before:absolute before:bottom-0 before:left-0 before:w-0 before:h-[2px] before:bg-textColor_secondary/60 before:transition-all before:duration-300 hover:before:w-full hover:opacity-95 ease-out duration-200"
                >
                  {item.text}
                </a>
              ))}
            </div>
            {/* Connect */}
            <div>
              <h1 className="text-3xl py-4 font-semibold">Connect</h1>
              {ConnectColumn.map((item, index) => (
                <a
                  key={index}
                  href={item.url}
                  className="flex flex-col py-2 text-xl w-fit relative before:absolute before:bottom-0 before:left-0 before:w-0 before:h-[2px] before:bg-textColor_secondary/60 before:transition-all before:duration-300 hover:before:w-full hover:opacity-95 ease-out duration-200"
                >
                  {item.text}
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* About Me */}
        <section className="text-center pt-5 pb-10 sm:pb-12 w-full space-y-1 text-sm opacity-95 font-semibold">
          <div>© 2025 Bookify. All Rights Reserved.</div>
          <div>
            Developed by{"  "}
            <a
              href="http://vrushabhgawas14.github.io"
              target="_blank"
              className="relative before:absolute before:bottom-0 before:left-0 before:h-[1px] before:w-full before:bg-textColor_secondary"
            >
              Vrushabh Gawas
            </a>
            .
          </div>
        </section>
      </footer>
    </>
  );
}
