# Research Agent — Flask + Groq

A small research-agent web app with the original dark UI, rebuilt from scratch so the browser talks to a Flask backend and the backend talks to Groq.

## Architecture

Browser → Flask → Groq → web search → Flask → Browser

The Groq API key stays on the backend in `.env`.

## Current Groq setup

This version uses:

- `groq/compound`
- Groq built-in `web_search`
- Flask
- Python
- `python-dotenv`

Groq Compound can automatically use built-in tools such as web search and returns tool execution details that the UI can display in the agent log.

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

Copy `.env.example` to `.env` and add your key:

```env
GROQ_API_KEY=your_real_key_here
```

Never commit `.env`.

### 4. Start Flask

```powershell
python app.py
```

Open:

```text
http://127.0.0.1:5000
```

Do not open `index.html` directly with `file://`. Flask needs to serve the page so the frontend can call `/research`.

## Project structure

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

## Next upgrades

1. Stream the research process live instead of returning it all at once.
2. Show clickable source citations.
3. Add multiple research steps.
4. Add source cards.
5. Add conversation history.
6. Add export to Markdown/PDF.


## Author
Md Sakhoyat hossain
