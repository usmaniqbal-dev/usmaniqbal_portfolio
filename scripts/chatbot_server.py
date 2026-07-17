"""FastAPI server for the portfolio chatbot.

The server loads local sentence-transformer embeddings, retrieves relevant
portfolio context, and streams an answer from the website knowledge base.
"""

from __future__ import annotations

import json
import os
import pickle
import time
from collections import defaultdict
from pathlib import Path
from typing import Any, Dict, Generator, List

import numpy as np
from dotenv import load_dotenv
from fastapi import FastAPI, Header, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel, Field
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

from train_chatbot import EMBEDDINGS_PATH, KNOWLEDGE_PATH, ROOT_DIR, retrieve_context, train_embeddings

load_dotenv(ROOT_DIR / ".env.local")

DATA_DIR = ROOT_DIR / "data"
ANALYTICS_PATH = DATA_DIR / "chat-analytics.json"
SETTINGS_PATH = DATA_DIR / "chatbot-settings.json"
MODEL_NAME = "all-MiniLM-L6-v2"
RATE_LIMIT = 20
RATE_WINDOW_SECONDS = 60 * 60

app = FastAPI(title="Portfolio AI Chatbot")
rate_limits: Dict[str, List[float]] = defaultdict(list)


class ChatMessage(BaseModel):
    """A single chat history item from the frontend."""

    role: str
    content: str


class ChatRequest(BaseModel):
    """Incoming chat request payload."""

    message: str = Field(min_length=1, max_length=500)
    history: List[ChatMessage] = []


def allowed_origins() -> List[str]:
    """Return local and production origins allowed to call this server."""
    origins = ["http://localhost:3000", "http://127.0.0.1:3000"]
    site_url = os.getenv("NEXT_PUBLIC_SITE_URL")
    if site_url:
        origins.append(site_url.rstrip("/"))
    return origins


app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins(),
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


def load_json(path: Path, fallback: Any) -> Any:
    """Load JSON with a fallback to keep the API resilient."""
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return fallback


def write_json(path: Path, payload: Any) -> None:
    """Write JSON data to disk with consistent formatting."""
    path.parent.mkdir(exist_ok=True)
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")


def check_rate_limit(ip: str) -> None:
    """Allow up to 20 chat requests per IP per hour."""
    now = time.time()
    rate_limits[ip] = [stamp for stamp in rate_limits[ip] if now - stamp < RATE_WINDOW_SECONDS]
    if len(rate_limits[ip]) >= RATE_LIMIT:
        raise HTTPException(status_code=429, detail="Rate limit reached. Try again later.")
    rate_limits[ip].append(now)


def load_embeddings() -> Dict[str, Any]:
    """Load embeddings, training first when the file does not exist."""
    if not EMBEDDINGS_PATH.exists():
        train_embeddings()
    with EMBEDDINGS_PATH.open("rb") as file:
        return pickle.load(file)


def retrieve_debug_context(question: str, top_k: int = 3) -> Dict[str, Any]:
    """Retrieve context chunks and similarity scores for admin debugging."""
    payload = load_embeddings()
    chunks = payload.get("chunks", [])
    embeddings = payload.get("embeddings", np.empty((0, 384)))
    if not chunks:
        return {"context": "", "matches": []}

    model = SentenceTransformer(payload.get("model", MODEL_NAME))
    query_embedding = model.encode([question], convert_to_numpy=True)
    scores = cosine_similarity(query_embedding, embeddings)[0]
    top_indices = scores.argsort()[-top_k:][::-1]
    matches = [{"text": chunks[index], "score": float(scores[index])} for index in top_indices]
    return {"context": "\n\n".join(match["text"] for match in matches), "matches": matches}


def update_analytics(question: str, response_time_ms: int) -> None:
    """Store lightweight local chatbot analytics."""
    today = time.strftime("%Y-%m-%d")
    analytics = load_json(ANALYTICS_PATH, {"totalConversationsToday": 0, "mostAskedQuestions": [], "averageResponseTimeMs": 0, "events": []})
    events = [event for event in analytics.get("events", []) if event.get("date") == today]
    events.append({"date": today, "question": question, "responseTimeMs": response_time_ms})
    counts: Dict[str, int] = {}
    for event in events:
        counts[event["question"]] = counts.get(event["question"], 0) + 1
    analytics["events"] = events[-200:]
    analytics["totalConversationsToday"] = len(events)
    analytics["mostAskedQuestions"] = sorted(counts, key=counts.get, reverse=True)[:5]
    analytics["averageResponseTimeMs"] = int(sum(event["responseTimeMs"] for event in events) / max(len(events), 1))
    write_json(ANALYTICS_PATH, analytics)


def normalize_question(question: str) -> str:
    """Normalize a user question for simple local intent matching."""
    return question.lower().strip()


def format_contact_answer(knowledge: Dict[str, Any]) -> str:
    """Build a contact answer from the local knowledge base."""
    owner = knowledge.get("owner", {}) if isinstance(knowledge.get("owner"), dict) else {}
    contact = knowledge.get("contact", {}) if isinstance(knowledge.get("contact"), dict) else {}
    parts = [
        f"Email: {owner.get('email') or contact.get('email')}",
        f"Phone: {owner.get('phone')}",
        f"Location: {owner.get('location')}",
        f"LinkedIn: {contact.get('linkedin')}",
        f"GitHub: {contact.get('github')}",
        f"Website: {contact.get('website')}",
    ]
    clean = [part for part in parts if not part.endswith(": ") and not part.endswith(": None")]
    return "You can contact Usman through these details:\n" + "\n".join(f"- {part}" for part in clean) if clean else ""


def format_section_answer(knowledge: Dict[str, Any], section: str, title: str) -> str:
    """Build a concise answer for a known portfolio section."""
    value = knowledge.get(section)
    if not value:
        return ""

    if isinstance(value, dict):
        details = [f"{key}: {item}" for key, item in value.items() if item]
        return f"{title}:\n" + "\n".join(f"- {detail}" for detail in details)

    if isinstance(value, list):
        lines: List[str] = []
        for item in value[:8]:
            if isinstance(item, dict):
                name = item.get("title") or item.get("name") or item.get("question") or item.get("company") or "Item"
                description = item.get("description") or item.get("answer") or item.get("category") or item.get("role") or ""
                lines.append(f"{name}: {description}".strip(": "))
            elif item:
                lines.append(str(item))
        return f"{title}:\n" + "\n".join(f"- {line}" for line in lines if line)

    return f"{title}: {value}"


def build_local_answer(question: str, context: str) -> str:
    """Answer from the trained website knowledge base without any external API key."""
    knowledge = load_json(KNOWLEDGE_PATH, {})
    query = normalize_question(question)

    words = {word.strip("?!.,") for word in query.split()}
    if words.intersection({"hello", "hi", "salam", "assalam", "hey"}):
        owner = knowledge.get("owner", {}) if isinstance(knowledge.get("owner"), dict) else {}
        return f"Hi, I am {owner.get('name') or 'Usman'}'s website assistant. You can ask me about skills, services, projects, experience, availability, or contact details."

    section_map = [
        (["contact", "email", "phone", "call", "whatsapp", "linkedin", "github"], lambda: format_contact_answer(knowledge)),
        (["skill", "skills", "technology", "tech", "stack"], lambda: format_section_answer(knowledge, "skills", "Skills")),
        (["service", "services", "offer", "work"], lambda: format_section_answer(knowledge, "services", "Services")),
        (["project", "projects", "portfolio", "case study"], lambda: format_section_answer(knowledge, "projects", "Projects")),
        (["experience", "job", "career"], lambda: format_section_answer(knowledge, "experience", "Experience")),
        (["education", "degree", "study"], lambda: format_section_answer(knowledge, "education", "Education")),
        (["about", "bio", "who", "owner", "usman"], lambda: format_section_answer(knowledge, "owner", "About Usman")),
        (["faq", "question"], lambda: format_section_answer(knowledge, "faq", "FAQ")),
    ]

    for keywords, builder in section_map:
        if any(keyword in query for keyword in keywords):
            answer = builder()
            if answer:
                return answer

    if context:
        clean_lines = [line.strip() for line in context.splitlines() if line.strip()]
        return "Here is what I found on the website:\n" + "\n".join(f"- {line}" for line in clean_lines[:8])

    return "I do not have that detail in the website knowledge base yet. Please add it in the admin panel or the chatbot knowledge base, then retrain the chatbot."


def stream_local_response(payload: ChatRequest, context: str) -> Generator[str, None, None]:
    """Stream a local answer generated only from website data."""
    start = time.time()
    try:
        answer = build_local_answer(payload.message, context)
        for index in range(0, len(answer), 120):
            yield answer[index : index + 120]
    except Exception:
        yield "I am having trouble reading the website knowledge base right now. Please retrain the chatbot and try again."
    finally:
        update_analytics(payload.message, int((time.time() - start) * 1000))


@app.post("/api/chat")
async def chat(payload: ChatRequest, request: Request) -> StreamingResponse:
    """Stream an assistant answer for a user message."""
    ip = request.client.host if request.client else "unknown"
    check_rate_limit(ip)
    context = retrieve_context(payload.message, top_k=3)
    return StreamingResponse(stream_local_response(payload, context), media_type="text/plain")


@app.post("/api/chat/debug")
async def chat_debug(payload: ChatRequest, request: Request) -> JSONResponse:
    """Return retrieved context for admin live testing."""
    ip = request.client.host if request.client else "unknown"
    check_rate_limit(ip)
    return JSONResponse(retrieve_debug_context(payload.message, top_k=3))


@app.get("/api/suggestions")
async def suggestions() -> JSONResponse:
    """Return five starter questions from settings or portfolio defaults."""
    settings = load_json(SETTINGS_PATH, {})
    configured = settings.get("suggestions") if isinstance(settings.get("suggestions"), list) else []
    fallback = ["What are your skills?", "Tell me about your projects", "What services do you offer?", "Are you available for work?", "How can I contact you?"]
    return JSONResponse((configured or fallback)[:5])


@app.post("/api/retrain")
async def retrain(x_admin_key: str = Header(default="")) -> JSONResponse:
    """Rebuild the knowledge base and embeddings after admin authentication."""
    expected = os.getenv("CHATBOT_ADMIN_KEY")
    if not expected or x_admin_key != expected:
        raise HTTPException(status_code=401, detail="Unauthorized")

    trained = train_embeddings()
    settings = load_json(SETTINGS_PATH, {})
    settings["lastTrainedAt"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    write_json(SETTINGS_PATH, settings)
    return JSONResponse({"ok": True, "chunks": len(trained.get("chunks", [])), "lastTrainedAt": settings["lastTrainedAt"]})


@app.get("/api/analytics")
async def analytics() -> JSONResponse:
    """Return local chatbot analytics for the admin page."""
    return JSONResponse(load_json(ANALYTICS_PATH, {"totalConversationsToday": 0, "mostAskedQuestions": [], "averageResponseTimeMs": 0, "events": []}))


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("chatbot_server:app", host="0.0.0.0", port=8000, reload=True)
