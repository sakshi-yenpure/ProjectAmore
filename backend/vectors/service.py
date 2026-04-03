import logging
from . import apps

logger = logging.getLogger(__name__)

def store_vector(text, user_id, source, emotion, timestamp, entry_id):
    """
    Convert text to vector using MiniLM
    Save to ChromaDB with metadata:
    { user_id, source, emotion, timestamp, entry_id }
    Each document ID = source_entryid_userid
    """
    try:
        if apps.model is None or apps.collection is None:
            return None

        # Create 384-dimensional vector
        vector = apps.model.encode(text).tolist()
        
        doc_id = f"{source}_{entry_id}_{user_id}"
        
        metadata = {
            "user_id": str(user_id),
            "source": source,
            "emotion": emotion if emotion else "none",
            "timestamp": str(timestamp),
            "entry_id": str(entry_id)
        }
        
        # Upsert allows updating if the ID exists and adding if it doesn't
        apps.collection.upsert(
            ids=[doc_id],
            embeddings=[vector],
            documents=[text],
            metadatas=[metadata]
        )
        return doc_id
    except Exception as e:
        logger.error(f"Error storing vector: {e}")
        return None

def search_similar(query_text, user_id, top_k=5):
    """
    Convert query_text to vector
    Search ChromaDB for top_k most similar
    Filter by user_id so users only see their own memories
    """
    try:
        if apps.model is None or apps.collection is None:
            return []

        query_vector = apps.model.encode(query_text).tolist()
        
        results = apps.collection.query(
            query_embeddings=[query_vector],
            n_results=top_k,
            where={"user_id": str(user_id)}
        )
        
        memories = []
        if results and results.get("documents") and len(results["documents"]) > 0:
            docs = results["documents"][0]
            metadatas = results["metadatas"][0]
            distances = results["distances"][0] if "distances" in results and results["distances"] else [0]*len(docs)
            
            for doc, meta, dist in zip(docs, metadatas, distances):
                # distance is typically L2. We'll pass it as is or normalize it.
                similarity_score = 1.0 / (1.0 + float(dist))
                memories.append({
                    "text": doc,
                    "emotion": meta.get("emotion"),
                    "timestamp": meta.get("timestamp"),
                    "source": meta.get("source"),
                    "similarity_score": similarity_score,
                    "entry_id": meta.get("entry_id")
                })
        return memories
    except Exception as e:
        logger.error(f"Error searching similar memories: {e}")
        return []

def get_emotion_memories(user_id, emotion, top_k=3):
    """
    Search ChromaDB filtered by: user_id AND emotion = given emotion
    Returns past entries where user felt this same emotion before
    """
    try:
        if apps.model is None or apps.collection is None:
            return []
            
        results = apps.collection.get(
            where={
                "$and": [
                    {"user_id": str(user_id)},
                    {"emotion": emotion}
                ]
            },
            limit=top_k
        )
        
        memories = []
        if results and results.get("documents"):
            docs = results["documents"]
            metadatas = results["metadatas"]
            
            for doc, meta in zip(docs, metadatas):
                memories.append({
                    "text": doc,
                    "emotion": meta.get("emotion"),
                    "timestamp": meta.get("timestamp"),
                    "source": meta.get("source"),
                    "entry_id": meta.get("entry_id")
                })
        return memories
    except Exception as e:
        logger.error(f"Error getting emotion memories: {e}")
        return []
