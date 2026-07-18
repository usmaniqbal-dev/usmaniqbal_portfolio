"""Train the local portfolio chatbot knowledge base and embeddings.

This script reads portfolio data from /data JSON files, the existing .data
fallback content file, and Neon PostgreSQL when DATABASE_URL is configured.
It writes a structured knowledge base and sentence-transformer embeddings for retrieval.
"""

from __future__ import annotations

import json
import os
import pickle
from pathlib import Path
from typing import Any, Dict, Iterable, List, Tuple

import psycopg
import numpy as np
from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

ROOT_DIR = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT_DIR / "data"
LOCAL_DATA_DIR = ROOT_DIR / ".data"
KNOWLEDGE_PATH = DATA_DIR / "knowledge-base.json"
EMBEDDINGS_PATH = DATA_DIR / "embeddings.pkl"
MODEL_NAME = "all-MiniLM-L6-v2"


KnowledgeBase = Dict[str, Any]


def empty_knowledge_base() -> KnowledgeBase:
    """Return the canonical knowledge-base shape used by the chatbot."""
    return {
        "owner": {"name": "", "title": "", "bio": "", "email": "", "location": "", "phone": "", "availability": ""},
        "skills": [],
        "projects": [],
        "experience": [],
        "education": [],
        "services": [],
        "testimonials": [],
        "contact": {"email": "", "github": "", "linkedin": "", "twitter": "", "website": ""},
        "faq": [],
        "customQA": [],
    }


def read_json_file(path: Path) -> Any:
    """Read a JSON file safely and return an empty dict when invalid."""
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return {}


def collect_json_documents() -> List[Any]:
    """Collect all JSON documents from /data and the existing .data fallback."""
    documents: List[Any] = []
    for directory in (DATA_DIR, LOCAL_DATA_DIR):
        if not directory.exists():
            continue
        for path in directory.glob("*.json"):
            if path.name in {"knowledge-base.json", "chatbot-settings.json", "chat-analytics.json"}:
                documents.append(read_json_file(path))
            else:
                documents.append(read_json_file(path))
    return documents


def collect_postgres_documents() -> List[Any]:
    """Collect JSON portfolio content from Neon PostgreSQL when DATABASE_URL exists."""
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        return []

    try:
        with psycopg.connect(database_url) as connection:
            with connection.cursor() as cursor:
                cursor.execute("SELECT content FROM site_content")
                site_rows = cursor.fetchall()
                cursor.execute("SELECT value FROM app_data")
                app_rows = cursor.fetchall()
    except Exception:
        return []

    documents: List[Any] = []
    for row in [*site_rows, *app_rows]:
        value = row[0]
        if isinstance(value, str):
            documents.append(json.loads(value))
        elif value:
            documents.append(value)
    return documents


def first_text(*values: Any) -> str:
    """Return the first non-empty text value from a set of candidates."""
    for value in values:
        if value is not None and str(value).strip():
            return str(value).strip()
    return ""


def merge_site_content(kb: KnowledgeBase, content: Dict[str, Any]) -> None:
    """Merge the existing portfolio content model into the chatbot knowledge base."""
    home = content.get("home", {})
    about = content.get("about", {})
    contact = content.get("contact", {})
    socials = content.get("socials", [])

    kb["owner"].update(
        {
            "name": first_text(home.get("title"), kb["owner"]["name"]).replace("I'm ", ""),
            "title": first_text(home.get("subtitle"), kb["owner"]["title"]),
            "bio": first_text(about.get("description"), home.get("description"), kb["owner"]["bio"]),
            "email": first_text(contact.get("email"), kb["owner"]["email"]),
            "location": first_text(contact.get("location"), kb["owner"]["location"]),
            "phone": first_text(contact.get("phone"), kb["owner"]["phone"]),
            "availability": first_text("Available for new CRM and automation projects", kb["owner"]["availability"]),
        }
    )
    kb["contact"]["email"] = first_text(contact.get("email"), kb["contact"].get("email"))

    for social in socials:
        platform = str(social.get("platform", "")).lower()
        if "github" in platform:
            kb["contact"]["github"] = social.get("url", "")
        if "linkedin" in platform:
            kb["contact"]["linkedin"] = social.get("url", "")
        if "twitter" in platform or "x" == platform:
            kb["contact"]["twitter"] = social.get("url", "")

    for skill in content.get("skills", []):
        kb["skills"].append(
            {
                "name": first_text(skill.get("name")),
                "level": first_text(skill.get("level")),
                "category": first_text(skill.get("category")),
                "description": first_text(skill.get("description"), f"{skill.get('name', '')} skill in {skill.get('category', '')}."),
            }
        )

    for project in content.get("projects", []):
        kb["projects"].append(
            {
                "title": first_text(project.get("title")),
                "description": first_text(project.get("description")),
                "techStack": project.get("tags", []) if isinstance(project.get("tags"), list) else [],
                "liveUrl": first_text(project.get("url")),
                "githubUrl": first_text(project.get("githubUrl")),
                "highlights": project.get("highlights", []) if isinstance(project.get("highlights"), list) else [],
            }
        )

    for service in content.get("services", []):
        kb["services"].append(
            {
                "title": first_text(service.get("title")),
                "description": first_text(service.get("description")),
                "price": first_text(service.get("price")),
            }
        )


def merge_knowledge_document(kb: KnowledgeBase, document: Dict[str, Any]) -> None:
    """Merge an existing knowledge-base-shaped document into the canonical shape."""
    if "owner" in document and isinstance(document["owner"], dict):
        kb["owner"].update({key: first_text(document["owner"].get(key), kb["owner"].get(key)) for key in kb["owner"]})
    if "contact" in document and isinstance(document["contact"], dict):
        kb["contact"].update({key: first_text(document["contact"].get(key), kb["contact"].get(key)) for key in kb["contact"]})

    for key in ["skills", "projects", "experience", "education", "services", "testimonials", "faq", "customQA"]:
        if isinstance(document.get(key), list):
            kb[key].extend(document[key])


def build_knowledge_base() -> KnowledgeBase:
    """Build a structured knowledge base from JSON and Neon PostgreSQL portfolio data."""
    load_dotenv(ROOT_DIR / ".env.local")
    DATA_DIR.mkdir(exist_ok=True)
    kb = empty_knowledge_base()

    for document in [*collect_json_documents(), *collect_postgres_documents()]:
        if not isinstance(document, dict):
            continue
        merge_knowledge_document(kb, document)
        merge_site_content(kb, document)

    KNOWLEDGE_PATH.write_text(json.dumps(kb, indent=2, ensure_ascii=False), encoding="utf-8")
    return kb


def flatten_value(label: str, value: Any) -> Iterable[str]:
    """Convert nested knowledge-base values into searchable text chunks."""
    if isinstance(value, dict):
        text = ", ".join(f"{key}: {item}" for key, item in value.items() if item)
        if text:
            yield f"{label}: {text}"
    elif isinstance(value, list):
        for item in value:
            if isinstance(item, dict):
                text = ", ".join(f"{key}: {child}" for key, child in item.items() if child)
                if text:
                    yield f"{label}: {text}"
            elif item:
                yield f"{label}: {item}"
    elif value:
        yield f"{label}: {value}"


def create_chunks(kb: KnowledgeBase) -> List[str]:
    """Create retrieval chunks from every major knowledge-base section."""
    chunks: List[str] = []
    for key, value in kb.items():
        chunks.extend(flatten_value(key, value))
    return chunks


def train_embeddings() -> Dict[str, Any]:
    """Generate local sentence-transformer embeddings and save them to disk."""
    kb = build_knowledge_base()
    chunks = create_chunks(kb)
    model = SentenceTransformer(MODEL_NAME)
    embeddings = model.encode(chunks, convert_to_numpy=True) if chunks else np.empty((0, 384))
    payload = {"model": MODEL_NAME, "chunks": chunks, "embeddings": embeddings, "knowledge": kb}
    with EMBEDDINGS_PATH.open("wb") as file:
        pickle.dump(payload, file)
    return payload


def retrieve_context(question: str, top_k: int = 3) -> str:
    """Retrieve the top matching context chunks for a user question."""
    if not EMBEDDINGS_PATH.exists():
        train_embeddings()

    with EMBEDDINGS_PATH.open("rb") as file:
        payload = pickle.load(file)

    chunks: List[str] = payload.get("chunks", [])
    embeddings = payload.get("embeddings")
    if not chunks or embeddings is None:
        return ""

    model = SentenceTransformer(payload.get("model", MODEL_NAME))
    query_embedding = model.encode([question], convert_to_numpy=True)
    scores = cosine_similarity(query_embedding, embeddings)[0]
    top_indices = scores.argsort()[-top_k:][::-1]
    return "\n\n".join(chunks[index] for index in top_indices)


if __name__ == "__main__":
    trained = train_embeddings()
    print(f"Knowledge base saved to {KNOWLEDGE_PATH}")
    print(f"Embeddings saved to {EMBEDDINGS_PATH}")
    print(f"Chunks trained: {len(trained['chunks'])}")
