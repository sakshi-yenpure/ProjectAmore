import sys
from django.apps import AppConfig
from django.conf import settings

model = None
chroma_client = None
collection = None

class VectorsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "vectors"

    def ready(self):
        global model, chroma_client, collection
        
        # Avoid loading models during migrations or admin commands unless it's a server run
        allowed_commands = ['runserver', 'daphne', 'gunicorn']
        is_allowed = any(cmd in sys.argv for cmd in allowed_commands) or sys.argv[0].endswith('pytest') or 'test_chat_backend.py' in sys.argv[0]
        
        if is_allowed:
            if model is None:
                from sentence_transformers import SentenceTransformer
                import chromadb
                
                print("[Vectors] Loading sentence-transformer all-MiniLM-L6-v2 ...")
                model = SentenceTransformer('all-MiniLM-L6-v2')
                
                print("[Vectors] Initializing ChromaDB ...")
                chroma_path = getattr(settings, 'CHROMA_PATH', './chromadb_store')
                chroma_client = chromadb.PersistentClient(path=chroma_path)
                collection = chroma_client.get_or_create_collection(name="amorechat_memory")
                print("[Vectors] Ready.")
