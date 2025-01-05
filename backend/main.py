import os
import uvicorn
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import fitz # PyMuPDF
# import pdfplumber

load_dotenv()

app = FastAPI()

FRONTEND_URL=os.getenv("BOOKIFY_FRONTEND_URL")
EXTRA_URL=os.getenv("EXTRA_FRONTEND_URL")

origins = [FRONTEND_URL,EXTRA_URL]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def main():
    return True


@app.post("/extract-text")
async def extract_text(file: UploadFile = File(...)):
    try:
        # pymupdf takes 2 sec for 165 pdf
        pdf_content = await file.read()

        pdf_document = fitz.open(stream=pdf_content,filetype="pdf")
        extracted_text = ""

        for page_no in range(len(pdf_document)):
            page = pdf_document[page_no]
            extracted_text += page.get_text("text") + "\n" 

        pdf_document.close()

        # PdfPlumber takes 45 sec for 165 page pdf
        # with pdfplumber.open(file.file) as pdf:
        #     extracted_text = ""
        #     for page in pdf.pages:
        #         extracted_text += page.extract_text() + "\n"

        
        return {"text":extracted_text.strip()}
    except Exception as e:
        return {"error": str(e)}


if __name__ == "__main__":
    uvicorn.run(app,host="0.0.0.0",port=8000)


# uvicorn main:app --reload