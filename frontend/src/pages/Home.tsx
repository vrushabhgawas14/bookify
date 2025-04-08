import { useEffect, useRef, useState } from "react";
import { api } from "../api";
import { useAuth } from "../context/authContext";
import { Headphones, FileText, Brain, BookMarked, Crown } from "lucide-react";
import AudioControl from "../components/AudioControl";
import toast, { Toaster } from "react-hot-toast";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase/firebase";

export default function Home() {
  const [file, setFile] = useState(null);
  const [extractedText, setExtractedText] = useState("");
  const [loading, setLoading] = useState(false);
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
  const [userInputData, setUserInputData] = useState("");

  const { userData, userLoggedIn } = useAuth();

  // When File is Selected
  const handleFileChange = (e: any) => {
    const myFile = e.target.files?.[0];
    if (myFile) {
      setFile(myFile);
      setSelectedFileName(myFile.name);
      setUserInputData("");
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
      setUserInputData(userInput.toString());
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

  function FeatureCard({ icon, title, description }: any) {
    return (
      <div className="bg-borderColor_secondary p-8 rounded-lg shadow-lg text-center w-[50vw] sm:w-[80vw]">
        <div className="flex justify-center mb-4">{icon}</div>
        <h3 className="text-xl font-semibold mb-4">{title}</h3>
        <p className="text-textColor_secondary">{description}</p>
      </div>
    );
  }

  function UseCaseCard({ title, description, image }: any) {
    return (
      <div className="bg-borderColor_secondary w-[50vw] sm:w-[80vw] rounded-lg shadow-lg overflow-hidden">
        <img src={image} alt={title} className="w-full h-48 object-cover" />
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-4">{title}</h3>
          <p className="text-textColor_secondary">{description}</p>
        </div>
      </div>
    );
  }

  const handleDownload = async () => {
    try {
      if (!extractedText) {
        toast.error("No summary to download");
        return;
      }
      if (!userLoggedIn) {
        toast.error("Please login to save summary!");
        return;
      }

      const q = query(
        collection(db, "users"),
        where("Email", "==", userData.Email)
      );

      const querySnapShot = await getDocs(q);
      if (!querySnapShot.empty) {
        const userDataRef = querySnapShot.docs[0].ref;

        const userRef = collection(userDataRef, "summaries");

        await addDoc(userRef, {
          Title: userInputData || selectedFileName || "No Title",
          Summary: extractedText || "No Summary",
          Email: userData.Email || "No Email",
          createdAt: new Date().toLocaleDateString(),
        });
      }

      toast.success("Summary saved successfully!");
    } catch (error) {
      console.error("Error saving summary:", error);
      toast.error("Failed to save summary");
    }
  };

  const handleCopy = async () => {
    try {
      if (extractedText) {
        await navigator.clipboard.writeText(extractedText);
        toast.success("Copied to clipboard!");
      } else {
        toast.error("Nothing to Copy!");
      }
    } catch (error) {
      toast.error("Failed to copy text");
    }
  };

  return (
    <>
      <main>
        <div className="flex flex-col justify-center items-center py-10">
          {stopDynamicText ? (
            <header className="text-3xl font-semibold text-center sm:text-xl">
              Hello {userData?.FirstName || "Guest"} !
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
                accept=".pdf,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
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

        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        {/* Output Section */}
        <section className="flex flex-col items-center justify-center w-full mb-10">
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
                  <button onClick={handleDownload}>
                    <img
                      src={require("../assets/svgs/download.svg").default}
                      alt="Download"
                      className="w-6 h-6 active:opacity-40"
                    />
                  </button>
                  <button onClick={handleCopy}>
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

          {/* Audio Controls */}
          <AudioControl extractedText={extractedText} />
        </section>
      </main>

      <main className="mt-20">
        <div className="min-h-screen bg-background">
          {/* Hero Section */}
          <section className="bg-gradient-to-r from-message to-backgroundDull text-textColor_primary py-20">
            <div className="container mx-auto px-6">
              <div className="max-w-4xl mx-auto text-center">
                <h1 className="text-4xl sm:text-3xl font-bold mb-6">
                  Transform Text into Knowledge
                </h1>
                <p className="text-xl mb-8 px-10">
                  Your all-in-one platform for PDF summarization, audio
                  conversion, and premium ebook access.
                </p>
                <a
                  href="/about"
                  className="bg-borderColor_secondary hover:bg-backgroundDull border border-borderColor_primary text-white font-semibold py-3 px-8 rounded-lg transition duration-300"
                >
                  Get Started Free
                </a>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-20">
            <div className="">
              <h2 className="text-3xl font-bold text-center mb-16">
                Powerful Features for Everyone
              </h2>
              <div className="flex flex-col gap-y-10 items-center">
                <FeatureCard
                  icon={<FileText className="w-8 h-8 text-textColor_primary" />}
                  title="Smart PDF Processing"
                  description="Upload any PDF and get instant, accurate text extraction with advanced OCR technology."
                />
                <FeatureCard
                  icon={<Brain className="w-8 h-8 text-textColor_primary" />}
                  title="AI-Powered Summaries"
                  description="Get concise, meaningful summaries powered by GROQ's advanced AI technology."
                />
                <FeatureCard
                  icon={
                    <Headphones className="w-8 h-8 text-textColor_primary" />
                  }
                  title="Audio Conversion"
                  description="Convert summaries to natural-sounding audio for accessibility and convenience."
                />
              </div>
            </div>
          </section>

          {/* Premium Library Section */}
          <section className="bg-backgroundDull py-20">
            <div className="container mx-auto px-6">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="md:w-1/2 mb-10 md:mb-0">
                  <h2 className="text-3xl font-bold mb-6">
                    Premium eBook Library
                  </h2>
                  <p className="text-textColor_secondary mb-8">
                    Access thousands of premium ebooks on-demand. Rent
                    bestsellers, academic texts, and professional resources at
                    competitive prices.
                  </p>
                  <div className="flex items-center space-x-4">
                    <BookMarked className="w-6 h-6 text-textColor_primary" />
                    <span>Over 10,000 curated titles</span>
                  </div>
                  <div className="flex items-center space-x-4 mt-4">
                    <Crown className="w-6 h-6 text-textColor_primary" />
                    <span>Exclusive academic and professional content</span>
                  </div>
                </div>
                <div className="md:w-1/2">
                  <img
                    src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                    alt="Library collection"
                    className="rounded-lg shadow-xl"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Use Cases Section */}
          <section className="py-20">
            <div className="container mx-auto px-6">
              <h2 className="text-3xl font-bold text-center mb-16">
                Perfect For Every Reader
              </h2>
              <div className="flex flex-col gap-y-10 items-center">
                <UseCaseCard
                  title="Students & Researchers"
                  description="Quickly digest academic papers and research documents. Convert summaries to audio for efficient learning on-the-go."
                  image="https://images.unsplash.com/photo-1506377872008-6645d9d29ef7?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                />
                <UseCaseCard
                  title="Professionals"
                  description="Stay updated with industry reports and technical documentation. Save time with concise summaries of lengthy documents."
                  image="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                />
                <UseCaseCard
                  title="Visually Impaired"
                  description="Access written content through high-quality audio conversion. Enjoy literature and professional content without barriers."
                  image="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
                />
              </div>
            </div>
          </section>

          {/* CTA Section */}
          {!userLoggedIn && (
            <section className="bg-backgroundDull text-textColor_primary py-16">
              <div className="container mx-auto px-6 text-center">
                <h2 className="text-3xl font-bold mb-4">
                  Ready to Transform Your Reading Experience?
                </h2>
                <p className="mb-8">
                  Join thousands of users who are already benefiting from our
                  smart document processing.
                </p>
                <a
                  href="/register"
                  className="bg-borderColor_secondary hover:bg-backgroundDull border border-borderColor_primary text-white font-semibold py-3 px-8 rounded-lg transition duration-300"
                >
                  Signup
                </a>
              </div>
            </section>
          )}
        </div>
      </main>
    </>
  );
}
