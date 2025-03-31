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
  const [isTextExtracting, setIsTextExtracting] = useState(false);
  const [progressText, setProgressText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [stopDynamicText, setStopDynamicText] = useState(false);

  // When File is Selected
  const handleFileChange = (e: any) => {
    const myFile = e.target.files?.[0];
    if (myFile) {
      setFile(myFile);
      setSelectedFileName(myFile.name);
      setErrorMessage("");
      if (displayedText) {
        console.log("Result Reset Done!");
        setDisplayedText("");
      }
    }
  };

  // Reseting Selected File
  const resetFileInput = () => {
    setFile(null);
    setSelectedFileName("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Submission of PDF to Backend
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const userInput = formData.get("userInput");

    if (!file && !userInput) {
      setErrorMessage("Upload a PDF File or type your query");
      setStopDynamicText(false);
      return;
    } else {
      setLoading(true);
    }

    if (file) {
      formData.append("file", file);

      try {
        const response = await api.post("/extract-text", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        setExtractedText(response.data.text);
        setLoading(false);
        setErrorMessage("");
      } catch (error) {
        console.error("Error: ", error);
        setErrorMessage("Something Went Wrong, Try Again!");
        setLoading(false);
      }
    } else if (userInput) {
      setDisplayedText("");
      // console.log(userInput);
      try {
        const response = await api.post(
          "/get-summary-of-text",
          { text: userInput },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        setExtractedText(response.data.text);
        setLoading(false);
        setErrorMessage("");
      } catch (error) {
        console.error("Error: ", error);
        setErrorMessage("Something Went Wrong, Try Again!");
        setLoading(false);
      }
    }
    setStopDynamicText(true);
  };

  // UseRef for checking scroll status in div box
  useEffect(() => {
    isUserScrollingRef.current = isUserScrolling;
  }, [isUserScrolling]);

  // Text generating effect
  useEffect(() => {
    if (!extractedText) return;

    const words = extractedText.split(" ");
    let currIndex = 0;
    setIsTextExtracting(true);

    const interval = setInterval(() => {
      setDisplayedText((prev) => prev + (prev ? " " : "") + words[currIndex++]);

      if (containerRef.current && !isUserScrollingRef.current) {
        containerRef.current.scrollTop = containerRef.current.scrollHeight;
      }

      if (currIndex >= words.length - 1) {
        clearInterval(interval);
        setIsTextExtracting(false);
      }
    }, 40);

    return () => clearInterval(interval);
  }, [extractedText]);

  // Stop Auto Scrolling Effect With Mouse Wheel
  useEffect(() => {
    const handleScroll = () => {
      setIsUserScrolling(true);
    };

    containerRef.current?.addEventListener("wheel", handleScroll);
    containerRef.current?.addEventListener("touchmove", handleScroll);

    return () => {
      containerRef.current?.removeEventListener("wheel", handleScroll);
      containerRef.current?.removeEventListener("touchmove", handleScroll);
    };
  }, []);

  // Output Processing Text
  useEffect(() => {
    const defaultText = "Answer";
    const generatingText = "Generating Summary...";

    const words = isTextExtracting ? generatingText : defaultText;
    let currIndex = 0;
    setProgressText("");
    const interval = setInterval(() => {
      setProgressText((prev) => prev + words[currIndex++]);

      if (currIndex >= words.length - 1) {
        clearInterval(interval);
      }
    }, 70);

    return () => clearInterval(interval);
  }, [isTextExtracting]);

  const phrases = [
    "What can I help you with?",
    "Summarize a PDF?",
    "Ask for answers?",
    "Generate audio output?",
    "Extract key insights?",
    "Analyze documents?",
  ];

  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setIsVisible(false);

      setTimeout(() => {
        setCurrentPhraseIndex((prevIndex) =>
          prevIndex === phrases.length - 1 ? 0 : prevIndex + 1
        );
        setIsVisible(true);
      }, 500);
    }, 2000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <>
      <main>
        <div className="flex flex-col justify-center items-center py-10">
          {stopDynamicText ? (
            <header className="text-3xl font-semibold text-center sm:text-xl">
              Hello {user ? user.email : "Guest"} !
            </header>
          ) : (
            <header
              className={`text-3xl md:text-2xl sm:text-xl font-bold text-stone-200 transition-opacity duration-500 ${
                isVisible ? "opacity-100" : "opacity-0"
              }`}
            >
              {phrases[currentPhraseIndex]}
            </header>
          )}

          {/* Input Section */}
          <form
            onSubmit={handleSubmit}
            className="flex justify-between sm:justify-around items-center mt-10 p-2 rounded-2xl space-x-2 border border-borderColor_primary px-4 w-[50vw] sm:w-[90vw]"
          >
            <div className="flex items-center">
              <input
                type="file"
                accept="application/pdf"
                id="file-input"
                onChange={handleFileChange}
                ref={fileInputRef}
                className="hidden"
              />
              {!file ? (
                <label htmlFor="file-input" className="cursor-pointer">
                  <img
                    src={require("../assets/svgs/gallery.svg").default}
                    alt="File Upload"
                    className="w-10 h-10 bg-borderColor_primary rounded-lg"
                  />
                </label>
              ) : (
                <div
                  onClick={resetFileInput}
                  className="cursor-pointer p-2 mr-1 bg-textColor_primary hover:bg-textColor_primary/70 ease-in-out duration-150 hover:bg-opacity-45 rounded-lg border-2 border-borderColor_primary"
                >
                  <img
                    src={require("../assets/svgs/cross.svg").default}
                    alt="Cross"
                    className="w-3 h-3"
                  />
                </div>
              )}
            </div>
            {selectedFileName ? (
              <div className="inputMessage font-semibold w-96 md:w-80 sm:w-60 bg-message px-4 py-3 text-textColor_primary rounded-xl line-clamp-4">
                &quot;{selectedFileName}&quot; Selected.
              </div>
            ) : (
              <input
                type="text"
                name="userInput"
                placeholder="Ask anything..."
                className="inputMessage bg-message text-textColor_primary text-xl sm:text-lg w-[85%] sm:w-[55vw] px-4 py-2 rounded-lg font-semibold border border-borderColor_primary outline-none"
              />
            )}

            <button
              type="submit"
              className="text-white py-1 rounded-xl text-2xl"
            >
              <img
                src={require("../assets/svgs/right-submit.svg").default}
                alt="Submit"
                className="w-10 h-10"
              />
            </button>
          </form>
          {errorMessage && (
            <div className="mt-4 py-1 px-2 max-w-[80vw] text-center rounded-xl font-semibold text-red-800 bg-textColor_secondary border-2 border-borderColor_primary">
              {errorMessage}
            </div>
          )}
        </div>
        {/* Output Section */}
        <section className="flex justify-center w-full mb-10">
          <div className="w-[70vw] sm:w-[90vw] flex flex-col space-y-4 py-4">
            {/* Answer Text */}
            <div className="flex items-center space-x-4">
              <img
                src={require("../assets/svgs/sparkles.svg").default}
                alt="Sparkles"
                className="w-6 h-6"
              />
              <h2 className="text-3xl font-semibold sm:text-2xl">
                {progressText}
              </h2>
            </div>
            {/* Actual Answer */}
            <div className="border border-borderColor_primary rounded-xl bg-backgroundDull">
              <header className="flex justify-between items-center border-b border-borderColor_primary py-2 px-4">
                <h2 className="text-xl font-semibold">Summary</h2>
                <div className="flex space-x-4">
                  <button>
                    <img
                      src={require("../assets/svgs/download.svg").default}
                      alt="Download"
                      className="w-6 h-6"
                    />
                  </button>
                  <button
                    onClick={() => navigator.clipboard.writeText(extractedText)}
                  >
                    <img
                      src={require("../assets/svgs/copy-icon.svg").default}
                      alt="Copy"
                      className="w-5 h-5 active:opacity-50"
                    />
                  </button>
                </div>
              </header>
              <div
                ref={containerRef}
                className="answer-rendering px-10 py-8 sm:px-5 sm:py-6 overflow-y-scroll max-h-[60vh] sm:max-h-[60vh] text-justify text-2xl sm:text-xl font-serif"
              >
                {loading ? (
                  <div className="text-center text-2xl">Loading...</div>
                ) : (
                  <p className="whitespace-pre-wrap text-xl">{displayedText}</p>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
