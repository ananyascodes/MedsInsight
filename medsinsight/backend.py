from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import firebase_admin
from firebase_admin import credentials, auth
import json
import re
import os
from pydantic import BaseModel
from typing import Optional
import uvicorn
import requests

from csv_ai import analyze_csv


try:
    cred = credentials.Certificate("serviceAccountKey.json")
    firebase_admin.initialize_app(cred)
except Exception as e:
    print(f"Firebase init failed: {e}")
    print("Make sure serviceAccountKey.json is in the same directory")


app = FastAPI(title="Healthcare ML Assistant")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5500", "http://localhost:5500", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


PPLX_API_KEY = ""
PPLX_MODEL = ""  
PPLX_URL = ""


class PatientData(BaseModel):
    name: str
    age: str
    gender: str
    symptoms: str
    disease: Optional[str] = None


class TokenData(BaseModel):
    token: str


class ChatRequest(BaseModel):
    question: str



def extract_json(text: str) -> Optional[dict]:
    text = text.strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    patterns = [
        r"\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}",
        r"\{.*\}",
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.DOTALL)
        if match:
            try:
                return json.loads(match.group())
            except json.JSONDecodeError:
                continue
    return None


def generate_fallback_response():
    return {
        "condition": "Unable to assess clearly from provided information",
        "diet": "Balanced Indian diet: Include dal, rice/roti, seasonal vegetables, fruits, and curd. Stay hydrated.",
        "medication": "Consult a qualified doctor before taking any medication. Do not self-medicate.",
        "precautions": "Monitor symptoms closely. Rest adequately. Maintain hygiene. Avoid known allergens.",
        "hospital_advice": "Visit nearest hospital or clinic if symptoms worsen, persist >48hrs, or new symptoms appear.",
    }



@app.post("/verify")
async def verify_token(request: TokenData):
    try:
        decoded_token = auth.verify_id_token(request.token)
        return {
            "status": "verified",
            "uid": decoded_token["uid"],
            "email": decoded_token.get("email", ""),
        }
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")



@app.post("/analyze_patient")
async def analyze_patient(patient_data: PatientData):
    system_prompt = (
        "You are an AI healthcare assistant for Indian patients. "
        "Provide ONLY GENERAL guidance (no diagnosis, no drug names). "
        "Respond strictly in valid JSON with keys: "
        "condition, diet, medication, precautions, hospital_advice."
    )

    user_prompt = f"""
Patient Details:
- Name: {patient_data.name}
- Age: {patient_data.age}
- Gender: {patient_data.gender}
- Symptoms: {patient_data.symptoms}
- Existing conditions: {patient_data.disease or 'None mentioned'}

Output format (JSON only, no extra text):
{{
  "condition": "...",
  "diet": "...",
  "medication": "...",
  "precautions": "...",
  "hospital_advice": "..."
}}
"""

    try:
        headers = {
            "Authorization": f"Bearer {PPLX_API_KEY}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": PPLX_MODEL,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
        }

        r = requests.post(PPLX_URL, headers=headers, json=payload, timeout=30)
        if r.status_code != 200:
            print("Perplexity API error (patient):", r.status_code, r.text)
            return generate_fallback_response()

        data = r.json()
        raw_text = data["choices"][0]["message"]["content"]
        print("\n---- RAW PERPLEXITY TEXT ----\n", raw_text[:500], "\n-------------------------")

        ai_json = extract_json(raw_text)
        if ai_json:
            required_keys = [
                "condition",
                "diet",
                "medication",
                "precautions",
                "hospital_advice",
            ]
            for key in required_keys:
                if key not in ai_json or not ai_json[key]:
                    ai_json[key] = "Information not available"
            return ai_json

        print("JSON parse failed, using fallback.")
        return generate_fallback_response()

    except Exception as e:
        print("AI Analysis failed:", repr(e))
        return generate_fallback_response()



@app.post("/upload_csv")
async def upload_csv(file: UploadFile = File(...)):
    """
    Receives a CSV file and returns:
    - columns: list of column names
    - summary: df.describe().to_dict()
    - prediction: simple risk text
    """
    try:
        result = analyze_csv(file.file)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"CSV processing failed: {str(e)}")


@app.post("/chat")
async def chat(req: ChatRequest):
    """
    Chatbot endpoint for floating chat widget.
    Uses the same Perplexity model.
    """
    try:
        headers = {
            "Authorization": f"Bearer {PPLX_API_KEY}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": PPLX_MODEL,
            "messages": [
                {
                    "role": "system",
                    "content": (
                        "You are a friendly AI assistant inside a healthcare + data "
                        "dashboard web app. Answer briefly and clearly. If the user "
                        "asks for medical advice, remind them to consult a real doctor."
                    ),
                },
                {"role": "user", "content": req.question},
            ],
        }

        r = requests.post(PPLX_URL, headers=headers, json=payload, timeout=30)
        if r.status_code != 200:
            print("Perplexity API error (chat):", r.status_code, r.text)
            return {
                "answer": "The chatbot service is temporarily unavailable. Please try again later."
            }

        data = r.json()
        answer = data["choices"][0]["message"]["content"]
        return {"answer": answer}

    except Exception as e:
        print("Chatbot error:", repr(e))
        return {
            "answer": (
                "There was an error talking to the chatbot service. "
                "Please try again in a moment."
            )
        }



@app.get("/")
async def root():
    return {"message": "Healthcare ML Assistant API is running!"}


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
