# Bookify

Bookify is a modern web application built with **React** (frontend) and **Python/FastAPI** (backend) that enables users to convert PDFs, DOCX, and typed text into **AI-generated summaries** and **human-like audio**. It includes features like **audio controls, multilingual support, personalized reading libraries, and cloud storage for registered users**, making it both **accessible for visually impaired users** and **efficient for students and professionals**.

---

## Abstract

A major challenge faced by visually impaired students is the lack of access to structured, summarized educational content. Many resources are unavailable in audio format or are too lengthy to process quickly. Bookify addresses this issue by enabling users to:

- Upload any eBook or study material (PDF/DOCX/text).
- Generate a concise AI-powered summary.
- Convert the summary into natural, human-like audio.

This streamlined approach empowers visually impaired learners to grasp core concepts more efficiently without depending on costly services or external assistance.

The platform also benefits:

- **Students** – by generating quick syllabus summaries.
- **Professionals** – through efficient review of documents.
- **Dyslexic and visually impaired individuals** – by converting text into accessible audio.
- **Readers** – with access to a library of book and novel summaries.

---

## Features

- **AI-Powered Summaries**: Upload PDFs, DOCX, or type text to receive concise summaries.
- **Text-to-Speech**: Convert summaries into audio with adjustable **volume, pitch, speed, and language options**.
- **User Dashboard**: Registered users can save generated outputs and access them anytime.
- **Library Page**: Explore already available story and novel summaries.
- **Multilingual Support**: Listen to content in multiple languages.
- **Authentication**:
  - **Email/Password Registration** (with verification link via email).
  - **Google Sign-In** for quick access.
- **Mobile Responsiveness**

---

## Tech Stack

### Frontend

- **React**
- **TypeScript**
- **TailwindCSS**

### Backend

- **Python**
- **FastAPI**
- **Cerebras API** (GPT-OSS-120B for AI summaries)

---

## Installation & Setup

### Backend (FastAPI + Python)

1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Create a virtual environment and activate it:
   ```bash
   python -m venv venv
   venv/Scripts/activate   # On Windows
   source venv/bin/activate # On macOS/Linux
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the FastAPI server:
   ```bash
   uvicorn main:app --reload
   ```
5. Backend will be running on http://127.0.0.1:8000/

### Frontend (React + TypeScript)

1. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm start
   ```
4. Frontend will be running on http://localhost:3000/

### Thankyou !
