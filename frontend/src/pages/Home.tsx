import { useEffect, useState } from "react";
import { api } from "../api";
import { useAuth } from "../context/authContext";

export default function Home() {
  const [file, setFile] = useState(null);
  const [extractedText, setExtractedText] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const [displayedText, setDisplayedText] = useState("");

  const handleFileChange = (e: any) => {
    setFile(e.target.files[0]);
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

  // Load Backend
  const loadBackend = async () => {
    try {
      const response = await api.get("");
      if (response.data === true) {
        alert("Backend Loaded.");
      } else {
        console.log(response.data);
        alert("Can't Load Backend.");
      }
    } catch (error) {
      console.error("Error: ", error);
      alert("Error loading backend");
    }
  };

  // Text generating effect
  useEffect(() => {
    if (!extractedText) return;

    const words = extractedText.split(" ");
    let currIndex = 0;

    const interval = setInterval(() => {
      setDisplayedText((prev) => prev + (prev ? " " : "") + words[currIndex]);
      currIndex++;

      if (currIndex >= words.length - 1) {
        clearInterval(interval);
      }
    }, 40);

    return () => clearInterval(interval);
  }, [extractedText]);

  const sparkles = (
    <svg fill="#000000" viewBox="0 0 512 512">
      <path d="M208,512,155.62,372.38,16,320l139.62-52.38L208,128l52.38,139.62L400,320,260.38,372.38Z"></path>
      <path d="M88,176,64.43,111.57,0,88,64.43,64.43,88,0l23.57,64.43L176,88l-64.43,23.57Z"></path>
      <path d="M400,256l-31.11-80.89L288,144l80.89-31.11L400,32l31.11,80.89L512,144l-80.89,31.11Z"></path>
    </svg>
  );

  return (
    <>
      <main>
        <div className="flex flex-col justify-center items-center h-[40vh]">
          <header className="text-3xl">
            Hello {user ? user.email : "Guest"}
          </header>
          <div onClick={loadBackend} className="cursor-pointer">
            Load Backend
          </div>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col justify-center items-center py-10 space-y-2"
          >
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
            />
            <button
              type="submit"
              className="bg-red-950 text-white px-2 py-1 w-40 rounded-xl text-2xl"
            >
              Submit
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
              <div className="px-10 py-8">
                {loading ? (
                  <div className="text-center text-2xl">Loading...</div>
                ) : (
                  <div className="text-justify text-2xl font-serif">
                    {displayedText}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
