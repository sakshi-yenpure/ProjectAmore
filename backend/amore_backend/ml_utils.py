from transformers import pipeline

# Global variable to store the classifier
classifier = None
_model_loaded = False

def get_classifier():
    global classifier, _model_loaded
    if not _model_loaded:
        try:
            print("Loading DistilRoBERTa emotion model...")
            classifier = pipeline("text-classification", model="j-hartmann/emotion-english-distilroberta-base", top_k=1)
        except Exception as e:
            print(f"Warning: Failed to load DistilRoBERTa emotion model. Initializing without ML tagging. Error: {e}")
            classifier = None
        finally:
            _model_loaded = True
    return classifier

def predict_emotion(text):
    clf = get_classifier()
    if not clf or not text.strip():
        return "neutral"
    
    try:
        # Predict emotion
        preds = clf(text[:512]) # Truncate to avoid model token limits
        emotion = preds[0][0]['label'] if isinstance(preds[0], list) else preds[0]['label']
        
        # Map HuggingFace output tags ('anger', 'disgust', 'fear', 'joy', 'neutral', 'sadness', 'surprise') to Amor tags
        emotions_map = {
            'joy': 'happy',
            'fear': 'anxious',
            'anger': 'angry',
            'sadness': 'sad',
            'surprise': 'happy', # map surprise to happy or neutral, let's say happy
            'disgust': 'angry'   # map disgust to angry
        }
        
        return emotions_map.get(emotion, 'neutral')
    except Exception as e:
        print(f"Emotion prediction failed: {e}")
        return "neutral"
