import os
import io
import json
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from pdfminer.high_level import extract_text  
from dotenv import load_dotenv
from groq import Groq  
from fastapi.middleware.cors import CORSMiddleware
import logging as logger
from supabase import create_client, Client

# Set up logging
logger.basicConfig(level=logger.INFO)

# Create the FastAPI app instance.
app = FastAPI()

# Configure CORS (for testing, allow all origins)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
logger.info("CORS enabled")

# Load environment variables
load_dotenv(dotenv_path=".env.local")

# Use proper backend environment variable names
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
if not SUPABASE_URL or not SUPABASE_KEY:
    logger.error("Supabase credentials not set!")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Initialize the Groq client
client = Groq(api_key=os.getenv("GROQ_API_KEY"))
NOTION_API_KEY = os.getenv("NOTION_API_KEY")


def groq_infer(prompt: str) -> str:
    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}]
        )
        return response.choices[0].message.content
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"GROQ inference failed: {str(e)}")


def parse_flashcards(text: str):
    cards = []
    for item in text.strip().split("\n\n"):
        parts = item.strip().split("\n")
        if len(parts) >= 2:
            question = parts[0].strip()
            front = parts[1].strip()  # second line as Front
            back = " ".join(part.strip() for part in parts[2:]).strip() if len(parts) > 2 else ""
            cards.append({
                "question": question,
                "answer": {
                    "Front": front,
                    "Back": back
                }
            })
    return cards


@app.post("/analyze")
async def analyze(subject: str = Form(...), content: str = Form(None)):
    prompt = f"Create flashcards for the subject: {subject}"
    if content:
        prompt += f"\nContent: {content}"
    try:
        logger.info(f"Prompt: {prompt}")
        result = groq_infer(prompt)
        flashcards = parse_flashcards(result)
        logger.info(f"Flashcards: {flashcards}")
        return {"flashcards": flashcards}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/upload")
async def upload_document(subject: str = Form(...), file: UploadFile = File(...)):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files supported for now")
    try:
        contents = await file.read()
        text = extract_text(io.BytesIO(contents))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error processing the file: " + str(e))
    
    prompt = f"Create flashcards for the subject: {subject}\nContent: {text}"
    try:
        logger.info(f"Prompt: {prompt}")
        result = groq_infer(prompt)
        flashcards = parse_flashcards(result)
        return {"flashcards": flashcards}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/store-flashcards")
async def store_flashcards(email: str = Form(...), flashcards: str = Form(...)):
    try:
        flashcards_data = json.loads(flashcards)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid flashcards format")
    for card in flashcards_data:
        data = {
            "user_email": email,
            "question": card["question"],
            "front": card["answer"]["Front"],
            "back": card["answer"]["Back"],
        }
        res = supabase.table("flashcards").insert(data).execute()
        # if res.error:
        #     raise HTTPException(status_code=500, detail=res.error.message)
    return {"message": "Flashcards stored successfully"}


@app.get("/")
async def root():
    return {"message": "Hello World"}


if __name__ == "__main__":
    import uvicorn
    print("Starting server...")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
