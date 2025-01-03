import { useState } from "react";
import { api } from "./api";

export default function App() {
  const [file, setFile] = useState(null);
  const [extractedText, setExtractedText] = useState("");
  const [loading, setLoading] = useState(false);

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

  return (
    <main>
      <div className="flex flex-col justify-center items-center h-[40vh]">
        <header className="text-3xl">Hello Vrushabh</header>
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
      <div className="flex justify-center">
        {loading ? (
          <div className="w-[80vw] text-center text-2xl">Loading...</div>
        ) : (
          <div className="w-[80vw] text-center text-2xl">{extractedText}</div>
        )}
      </div>
    </main>
  );
}
