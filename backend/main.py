import os
import uvicorn # type: ignore
from fastapi import FastAPI, File, UploadFile # type: ignore
from fastapi.middleware.cors import CORSMiddleware # type: ignore
from cerebras.cloud.sdk import Cerebras # type: ignore
from dotenv import load_dotenv # type: ignore
import fitz # type: ignore # PyMuPDF
import requests # type: ignore
import json
from typing import Dict
from docx import Document # type: ignore

load_dotenv()

app = FastAPI()

FRONTEND_URL=os.getenv("BOOKIFY_FRONTEND_URL")
EXTRA_URL=os.getenv("EXTRA_FRONTEND_URL")
client = Cerebras(
    api_key=os.getenv("CEREBRAS_API_KEY")
)

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

@app.get("/health")
def health():
    return {"status" : "ok"}

@app.post("/extract-text")
async def extract_text(file: UploadFile = File(...)):
    try:
        file_content = await file.read()
        filename = file.filename.lower()

        extracted_text = ""

        if filename.endswith(".pdf"):
            # PDF
            pdf_document = fitz.open(stream=file_content,filetype="pdf")
            print("Number of Pages in PDF: ",len(pdf_document))
            if(len(pdf_document) > 12):
                return {"text":"Please provide pdf with less than 12 pages."}

            for page_no in range(len(pdf_document)):
                page = pdf_document[page_no]
                extracted_text += page.get_text("text") + "\n" 

            pdf_document.close()

        elif filename.endswith(".docx"):
            # DOCX
            with open("temp.docx", "wb") as temp_file:
                temp_file.write(file_content)
            doc = Document("temp.docx")
            for para in doc.paragraphs:
                extracted_text += para.text + "\n"
            
            number_of_words = len(extracted_text.strip(" ").split(" "))
            print("Number of Pages in DOCX: ",number_of_words)
            if( number_of_words > 2700):
                return {"text": "The document is too large to process. Kindly reduce its content or number of pages to less than 12"}

        else:
            return {"text": "Unsupported file type. Please upload PDF or DOCX."}

        calculate_char(extracted_text.strip(),"Input:")
        summarized_text = summarize_text(extracted_text.strip()) # Summarize
        calculate_char(summarized_text,"Output: ")
        
        formatted_text = format_text_with_line_breaks(summarized_text.strip())

        return {"text":formatted_text.strip()}

    except Exception as e:
        return {"error": str(e)}

def summarize_text(text: str) -> str:
    try:
        stream = client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You are an AI assistant that summarizes long text into concise summaries."},
                {"role": "user", "content": f"Summarize the following text and if a text is about to be on new line then make it on new line and also avoid using bullet but use points if needed but in the new line:\n\n{text}"}
            ],
            model="gpt-oss-120b",
            stream=True,
            max_completion_tokens=5000,  # adjust as needed
            temperature=0.7,
            top_p=1,
            reasoning_effort="medium"
        )

        summarized_text = ""
        for chunk in stream:
            summarized_text += chunk.choices[0].delta.content or ""
        return summarized_text.strip()

    except Exception as e:
        return f"Error: {str(e)}"


# Text Queries 
@app.post("/get-summary-of-text")
async def get_summary_of_text(data: Dict[str, str]):
    resolved_queries = resolve_query(data["text"].strip()) # Summarize
    formatted_text = format_text_with_line_breaks(resolved_queries.strip()).removesuffix("\n")
    # print("Final: \n",formatted_text)

    return {"text": formatted_text}


def resolve_query(text: str) -> str:
    try:
        stream = client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You are an AI assistant that solves user queries."},
                {"role": "user", "content": f"Most likely user will ask to Summarize the following text or anything else like chatting so the output will be a text and also avoid using bullet but use points if needed but in the new line. This was just a prerequisite to you rest depends on user input:\n\n{text}"}
            ],
            model="gpt-oss-120b",
            stream=True,
            max_completion_tokens=5000,
            temperature=0.7,
            top_p=1,
            reasoning_effort="medium"
        )

        resolved_text = ""
        for chunk in stream:
            resolved_text += chunk.choices[0].delta.content or ""
        return resolved_text.strip()

    except Exception as e:
        return f"Error: {str(e)}"

def format_text_with_line_breaks(text):
    
    lines = text.split(".\n") # Split after full stop
    formatted_text = []
    final_formatted_text = ""
    
    # print("Lines: .\-n\n",lines,"\n\n")

    for i in range(len(lines)): 
        formatted_text.append(lines[i] + ("." if i != len(lines) -1 else "")) 
    
    for i in range(len(formatted_text)):
        subText = formatted_text[i]
        final_formatted_text += subText + "\n"

    # print("Formatted: replace('\-n','')",formatted_text, "\n\n")
    return final_formatted_text

if __name__ == "__main__":
    uvicorn.run(app,host="0.0.0.0",port=8000)

def calculate_char(text, displayText):
    result = text.split(" ")
    print(displayText)
    print("Character: ",len(text))
    print("Words: ",len(result))
    print("Tokens: ", len(text) / 4,"\n\n")
    

### Running Backend in Local

# touch app.py
# python -m venv venv
# venv/Scripts/activate
# - pip install uvicorn
# - pip install fastapi
# - pip install python-dotenv
# - pip install pymupdf
# uvicorn main:app --reload  (It will generate __pycache__)
# pip freeze > requirements.txt
# pip install -r .\requirements.txt