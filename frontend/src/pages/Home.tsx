import { useEffect, useRef, useState } from "react";
import { api } from "../api";
import { useAuth } from "../context/authContext";

export default function Home() {
  const [file, setFile] = useState(null);
  const [extractedText, setExtractedText] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const [displayedText, setDisplayedText] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const isUserScrollingRef = useRef(isUserScrolling);
  const [selectedFileName, setSelectedFileName] = useState("");
  const sparkles = (
    <svg fill="#000000" viewBox="0 0 512 512">
      <path d="M208,512,155.62,372.38,16,320l139.62-52.38L208,128l52.38,139.62L400,320,260.38,372.38Z"></path>
      <path d="M88,176,64.43,111.57,0,88,64.43,64.43,88,0l23.57,64.43L176,88l-64.43,23.57Z"></path>
      <path d="M400,256l-31.11-80.89L288,144l80.89-31.11L400,32l31.11,80.89L512,144l-80.89,31.11Z"></path>
    </svg>
  );

  const handleFileChange = (e: any) => {
    const myFile = e.target.files[0];
    if (myFile) {
      setFile(myFile);
      setSelectedFileName(myFile.name);
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!file) {
      alert("Upload a PDF File");
      return;
    } else {
      setLoading(true);
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await api.post("/extract-text", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setExtractedText(response.data.text);
      setLoading(false);
    } catch (error) {
      console.error("Error: ", error);
      alert("Something Went Wrong!");
    }
  };

  useEffect(() => {
    isUserScrollingRef.current = isUserScrolling;
  }, [isUserScrolling]);

  // Text generating effect
  useEffect(() => {
    if (!extractedText) return;

    const words = extractedText.split(" ");
    let currIndex = 0;

    const interval = setInterval(() => {
      setDisplayedText((prev) => prev + (prev ? " " : "") + words[currIndex++]);

      if (!isUserScrollingRef.current) {
        containerRef.current?.scrollIntoView({ behavior: "smooth" });
      }

      if (currIndex >= words.length - 1) {
        clearInterval(interval);
      }
    }, 40);

    return () => clearInterval(interval);
  }, [extractedText]);

  // Stop Auto Scrolling Effect With Mouse Wheel
  useEffect(() => {
    const handleScroll = () => {
      setIsUserScrolling(true);
    };

    window.addEventListener("wheel", handleScroll);
    window.addEventListener("touchmove", handleScroll);

    return () => {
      window.removeEventListener("wheel", handleScroll);
      window.removeEventListener("touchmove", handleScroll);
    };
  }, []);

  return (
    <>
      <main>
        <div className="flex flex-col justify-center items-center py-10">
          <header className="text-3xl text-center sm:text-xl">
            Hello {user ? user.email : "Guest"} !
          </header>
          <form
            onSubmit={handleSubmit}
            className="flex justify-between sm:justify-around items-center mt-10 p-2 rounded-2xl space-x-2 border-2 border-black px-4 sm:w-[90vw]"
          >
            <div className="flex items-center">
              <input
                type="file"
                accept="application/pdf"
                id="file-input"
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="file-input" className="cursor-pointer">
                <svg
                  // xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10"
                  viewBox="0 0 48 48"
                >
                  <path d="M 12.5 5 C 8.3754991 5 5 8.3754991 5 12.5 L 5 30.5 C 5 34.624501 8.3754991 38 12.5 38 L 30.5 38 C 34.624501 38 38 34.624501 38 30.5 L 38 12.5 C 38 8.3754991 34.624501 5 30.5 5 L 12.5 5 z M 12.5 8 L 30.5 8 C 33.003499 8 35 9.9965009 35 12.5 L 35 28.152344 L 29.75 23.072266 L 29.75 23.074219 C 29.015295 22.362375 28.049695 21.998844 27.09375 22 L 27.091797 22 C 26.136566 22.000488 25.176302 22.365751 24.445312 23.072266 A 1.50015 1.50015 0 0 0 24.443359 23.072266 L 22.345703 25.101562 L 17.150391 20.074219 C 16.416911 19.365243 15.450588 19.001953 14.496094 19.001953 C 13.5416 19.001953 12.577229 19.365243 11.84375 20.074219 L 8 23.792969 L 8 12.5 C 8 9.9965009 9.9965009 8 12.5 8 z M 40 11.513672 L 40 31.5 C 40 36.187 36.187 40 31.5 40 L 11.513672 40 C 12.883672 41.818 15.053 43 17.5 43 L 31.5 43 C 37.841 43 43 37.841 43 31.5 L 43 17.5 C 43 15.054 41.818 12.883672 40 11.513672 z M 27.5 13 A 2.5 2.5 0 0 0 27.5 18 A 2.5 2.5 0 0 0 27.5 13 z M 14.496094 22.001953 C 14.7036 22.001953 14.899932 22.071443 15.064453 22.230469 L 20.189453 27.1875 L 12.150391 34.964844 C 9.8163844 34.785918 8 32.883527 8 30.5 L 8 27.966797 L 13.929688 22.230469 C 14.094207 22.071444 14.288588 22.001953 14.496094 22.001953 z M 27.09375 25 A 1.50015 1.50015 0 0 0 27.095703 25 C 27.303134 24.999644 27.501258 25.07079 27.664062 25.228516 L 34.712891 32.048828 C 34.085865 33.775109 32.455428 35 30.5 35 L 16.427734 35 L 26.529297 25.228516 L 26.529297 25.230469 C 26.693865 25.071409 26.889612 25 27.09375 25 z"></path>
                </svg>
              </label>
            </div>
            {selectedFileName ? (
              <div className="font-semibold w-60">
                &quot;{selectedFileName}&quot; Selected.
              </div>
            ) : (
              <input
                type="text"
                placeholder="Enter Text"
                className="bg-slate-900 text-zinc-100 text-xl sm:text-lg sm:w-[50vw] px-4 py-2 rounded-lg font-semibold border-2 border-black outline-none"
              />
            )}

            <button
              type="submit"
              className="text-white py-1 rounded-xl text-2xl"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="40"
                height="40"
                viewBox="0 0 512 512"
              >
                <path
                  className="fill-slate-800"
                  d="M504.1,256C504.1,119,393,7.9,256,7.9C119,7.9,7.9,119,7.9,256C7.9,393,119,504.1,256,504.1C393,504.1,504.1,393,504.1,256z"
                ></path>
                <path
                  fill="#FFF"
                  d="M408.8,245.5l-141.2-86.7c-3.9-2.4-8.9-2.5-12.9-0.3c-4,2.2-6.5,6.5-6.5,11.1v172.7c0,4.6,2.5,8.8,6.5,11.1c1.9,1.1,4.1,1.6,6.2,1.6c2.3,0,4.6-0.6,6.6-1.9l141.2-86c3.8-2.3,6.1-6.4,6.1-10.8C414.9,251.9,412.6,247.8,408.8,245.5z"
                ></path>
                <path
                  fill="#FFF"
                  d="M343.5,229.5H109.2c-6.7,0-12,5.4-12,12v28.9c0,6.7,5.4,12,12,12h234.3c6.7,0,12-5.4,12-12v-28.9C355.6,234.9,350.2,229.5,343.5,229.5z"
                ></path>
              </svg>
            </button>
          </form>
        </div>
        {/* Output Section */}
        <section className="flex justify-center w-full">
          <div className="w-[70vw] sm:w-[90vw] flex flex-col space-y-4 py-4">
            {/* Answer Text */}
            <div className="flex items-center space-x-4">
              <p className="h-6 w-6">{sparkles}</p>
              <h2 className="text-3xl font-semibold">Answer</h2>
            </div>
            {/* Actual Answer */}
            <div className="border-2 border-black rounded-xl bg-yellow-100">
              <header className="flex justify-between items-center border-b-2 border-black py-2 px-4">
                <h2 className="text-2xl font-semibold">Summary</h2>
                <div className="flex space-x-4">
                  <h2 className="text-xl">Download</h2>
                  <h2 className="text-xl">Copy</h2>
                </div>
              </header>
              <div className="answer-rendering px-10 py-8 sm:px-5 sm:py-6 overflow-y-scroll max-h-[60vh] sm:max-h-[40vh]">
                {loading ? (
                  <div className="text-center text-2xl">Loading...</div>
                ) : (
                  <div className="text-justify text-2xl sm:text-xl font-serif">
                    {displayedText}
                    <div ref={containerRef}></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
        <div className="px-10 text-3xl">
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ipsa
          blanditiis, eum dolore fuga quod modi! Possimus recusandae ex ipsa
          distinctio delectus quos voluptatibus omnis iusto ab cupiditate
          consectetur, fugiat nam sequi atque cum. Labore porro dolore dolorem
          adipisci, optio distinctio harum repudiandae sequi, voluptatibus id
          veniam enim quis natus impedit? Lorem ipsum dolor sit amet consectetur
          adipisicing elit. Exercitationem natus culpa obcaecati hic ex cumque,
          dicta eum iure corrupti recusandae non fuga totam doloremque, sit
          molestiae, praesentium eos! Quasi ipsa, harum, repellat ad asperiores
          ut veniam odio dolores maiores quisquam aliquam, fugiat voluptas id
          alias. Commodi odit reprehenderit corrupti doloremque.
        </div>
      </main>
    </>
  );
}
