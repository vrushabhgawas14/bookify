import os
import uvicorn # type: ignore
from fastapi import FastAPI, File, UploadFile # type: ignore
from fastapi.middleware.cors import CORSMiddleware # type: ignore
from dotenv import load_dotenv # type: ignore
import fitz # type: ignore # PyMuPDF
import requests # type: ignore
import json
from typing import Dict

load_dotenv()

app = FastAPI()

FRONTEND_URL=os.getenv("BOOKIFY_FRONTEND_URL")
EXTRA_URL=os.getenv("EXTRA_FRONTEND_URL")
GROQ_API_KEY=os.getenv("GROQ_API_KEY")

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
        pdf_content = await file.read() # pymupdf takes 2 sec for 165 pdf

        pdf_document = fitz.open(stream=pdf_content,filetype="pdf")
        extracted_text = ""

        for page_no in range(len(pdf_document)):
            page = pdf_document[page_no]
            extracted_text += page.get_text("text") + "\n" 

        pdf_document.close()
        calculate_char(extracted_text.strip(),"Input:")

        summarized_text = summarize_text(extracted_text.strip()) # Summarize
        calculate_char(summarized_text,"Output: ")

        print(summarized_text + "\n\nNew Text:\n\n")
        
        formatted_text = format_text_with_line_breaks(summarized_text.strip())
        print("Final: \n",formatted_text)

        return {"text":formatted_text.strip()}

    except Exception as e:
        return {"error": str(e)}

def summarize_text(text:str) -> str:
    GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": "gemma2-9b-it",  # "llama-3-8b-8192"
        "messages": [
            {"role": "system", "content": "You are an AI assistant that summarizes long text into concise summaries."},
            {"role": "user", "content": f"Summarize the following text and if a text is about to be on new line then make it on new line and also avoid using bullet but use points if needed but in the new line:\n\n{text}"}
        ],
        "temperature": 0.7,
        "max_tokens": 8000
    }
    
    response = requests.post(GROQ_API_URL, headers=headers, data=json.dumps(payload))
    if response.status_code == 200:
        return response.json()["choices"][0]["message"]["content"]
    else:
        return f"Error: {response.text}"

# Text Queries 
@app.post("/get-summary-of-text")
async def get_summary_of_text(data: Dict[str, str]):
    resolved_queries = resolve_query(data["text"].strip()) # Summarize
    formatted_text = format_text_with_line_breaks(resolved_queries.strip()).removesuffix("\n")
    # print("Final: \n",formatted_text)

    return {"text": formatted_text}

def resolve_query(text:str) -> str:
    GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": "gemma2-9b-it",  # "llama-3-8b-8192"
        "messages": [
            {"role": "system", "content": "You are an AI assistant that solves user queries."},
            {"role": "user", "content": f"Most likely user will ask to Summarize the following text or anything else like chatting so the output will be a text and also avoid using bullet but use points if needed but in the new line. This was just a prerequiste to you rest depends on user input:\n\n{text}"}
        ],
        "temperature": 0.7,
        "max_tokens": 8000
    }
    
    response = requests.post(GROQ_API_URL, headers=headers, data=json.dumps(payload))
    if response.status_code == 200:
        return response.json()["choices"][0]["message"]["content"]
    else:
        return f"Error: {response.text}"


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
    

# uvicorn main:app --reload