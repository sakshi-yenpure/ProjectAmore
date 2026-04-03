from amore_backend.ml_utils import predict_emotion

def analyze_emotion(text):
    """
    Analyzes the emotion of a given text using the local HuggingFace Pipeline.
    Model: j-hartmann/emotion-english-distilroberta-base
    """
    return predict_emotion(text)

