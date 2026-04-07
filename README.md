#  Amore — Premium AI Emotional Wellness Platform

Understanding and expressing your emotions should be simple, safe, and deeply personal. **Amore** is a full-stack mental wellness sanctuary that combines state-of-the-art AI with beautiful, empathetic design to help you reflect, heal, and grow.



##  Features that Matter

###  Long-Term AI Memory
Unlike standard chatbots, Amore **remembers**. Using a **ChromaDB Vector Store**, the AI recalls your past feelings, life events, and breakthroughs to provide context-aware, deeply personal support.

###  Real-time Emotion Detection
Every word you type is analyzed by a local NLP engine to detect 8+ emotional states (Happy, Anxious, Sad, etc.). The interface dynamically adapts its colors and responses to meet you exactly where you are.

###  Personalized Sanctuary
Customizable **High-Definition Wallpapers** (Zen Forest, Dreamy clouds, etc.) and a premium **Glassmorphism UI** create a calming, distraction-free environment for your thoughts.

###  Wellness Dashboard
Track your emotional journey over weeks and months. Visualize your mood trends and patterns using interactive Recharts data visualization.

###  User Profile & Streaks
A dedicated profile page to manage your personal details and track your consistency with a visual daily mood calendar and journal streaks.

###  Performance Optimized
Built with **Python Threading**, the app processes complex vector embeddings and AI titling in the background, ensuring you get near-instant responses (average latency < 3s).

---

##  Technology Stack

- **Frontend**: React (Vite), Framer Motion, Zustand, Tailwind CSS, Recharts.
- **Backend**: Django 4.2+, Django REST Framework, Daphne (ASGI).
- **AI Intelligence**: 
  - **Inference**: OpenRouter (Qwen-3.6-Plus, Nemotron-3-Super, Gemini Flash 1.5).
  - **Memory**: ChromaDB Vector Store.
  - **NLP**: `sentence-transformers` for local embeddings.
- **Database**: PostgreSQL (Required for production).

---

##  Installation & Setup

### 1. Clone & Environment
```bash
git clone https://github.com/your-username/amore.git
cd amore
```

### 2. Backend Configuration
Navigate to `backend/` and create a `.env` file based on the keys below:
```env
DB_NAME=amorechat
DB_USER=amorechat_user
DB_PASSWORD=your_password
OPENROUTER_API_KEY=your_sk_key_here
GEMINI_API_KEY=your_google_key_here
CHROMA_PATH=./chromadb_store
```

### 3. Run the Servers
**Backend:**
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate # Windows
pip install -r requirements.txt
python manage.py migrate
# Use Daphne for ASGI support
daphne -p 8000 amore_backend.asgi:application
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

##  Privacy & Security
Amore is built with a **Security-First** approach.
- **`.env` Protection**: API keys and secrets are strictly ignored by Git.
- **Local Analysis**: Mood detection happens on your local server, keeping your raw sentiments private.

---

