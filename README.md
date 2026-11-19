# Research Agent — Flask + Groq

An AI-powered research-agent web application built with Flask and Groq. Users can enter a research topic, let the AI search the web, and receive a clear summary of the findings.

## Architecture

Browser → Flask → Groq (GPT-OSS 20B) → Browser Search → Flask → Browser

The Groq API key stays securely on the backend in `.env`.

## Current Groq Setup

This version uses:

- `openai/gpt-oss-20b` — AI model hosted by Groq
- Groq built-in `browser_search` tool
- Flask
- Python
- `python-dotenv`

The GPT-OSS 20B model supports Groq's built-in browser search functionality. This allows the research agent to retrieve current web information and generate summaries without requiring a separate search API.

## Features

- Research topics using an AI model
- Built-in web search through Groq
- Flask backend for handling requests
- Interactive dark-themed web interface
- Live research status and agent activity display
- AI-generated research summaries

## Setup

### 1. Create a virtual environment

Windows PowerShell:

```powershell
python -m venv venv
venv\Scripts\activate
```

### 2. Install dependencies

```powershell
pip install -r requirements.txt
```

### 3. Create `.env`

Copy `.env.example` to `.env` and add your Groq API key:

```env
GROQ_API_KEY=your_real_key_here
```

Never commit `.env` to GitHub.

### 4. Start Flask

```powershell
python app.py
```

Open:

```text
http://127.0.0.1:5000
```

Do not open `index.html` directly using `file://`. Flask needs to serve the page so the frontend can communicate with the backend.

## Project Structure

```text
Research_Agent_Groq/
│
├── app.py
├── .env.example
├── .gitignore
├── requirements.txt
├── README.md
│
├── templates/
│   └── index.html
│
└── static/
    ├── script.js
    └── styles.css
```

## Future Improvements

1. Stream the research process live instead of returning everything at once.
2. Show clickable source citations.
3. Add multiple research steps.
4. Add source cards.
5. Add conversation history.
6. Add export to Markdown/PDF.
7. Improve API error handling and token management.

## Technologies Used

- Python
- Flask
- Groq API
- GPT-OSS 20B
- Browser Search
- HTML
- CSS
- JavaScript

## Author

**Md Sakhoyat Hossain Siam**

Computer Science Student | Python & Cybersecurity Learner
