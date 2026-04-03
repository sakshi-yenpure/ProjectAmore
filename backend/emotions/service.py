import logging
from django.apps import apps

logger = logging.getLogger(__name__)

class EmotionService:
    # Mapping model labels to user-friendly labels as requested
    MODEL_TO_MAPPED = {
        'joy': 'happy',
        'sadness': 'sad',
        'fear': 'anxious',
        'anger': 'angry',
        'surprise': 'anxious', # Changed from happy to anxious for wellness context
        'disgust': 'angry'
    }

    # Internal list of the 4 requested target emotions
    TARGET_EMOTIONS = ['happy', 'sad', 'anxious', 'angry']

    @staticmethod
    def analyze(text: str):
        """
        Analyzes the emotion of the given text using the preloaded model.
        Returns: { emotion, confidence, score, all_scores }
        """
        try:
            # Access the preloaded classifier from AppsConfig
            classifier = apps.get_app_config('emotions').classifier
            if classifier is None:
                logger.error("Emotion detection model not initialized.")
                return None

            # Get raw results from the transformers pipeline
            # top_k=None returns all labels sorted by score
            results = classifier(text, top_k=None)
            
            # Ensure we have a list of entries for this single text input
            if isinstance(results[0], list):
                results = results[0]
            
            # results should now be: [{'label': 'joy', 'score': 0.9}, {'label': 'neutral', 'score': 0.05}, ...]
            raw_scores = {res['label']: res['score'] for res in results}
            
            # 1. Aggregate scores for mapped labels
            mapped_scores = {target: 0.0 for target in EmotionService.TARGET_EMOTIONS}
            for label, score in raw_scores.items():
                if label == 'neutral':
                    continue
                target = EmotionService.MODEL_TO_MAPPED.get(label)
                if target:
                    mapped_scores[target] += score

            # Find the winner among raw labels
            top_raw = max(results, key=lambda x: x['score'])
            top_label = top_raw['label']
            confidence = top_raw['score']

            if top_label == 'neutral':
                # Neutral mapping: pick highest from mapped_scores
                final_emotion = max(mapped_scores.items(), key=lambda x: x[1])[0]
            else:
                final_emotion = EmotionService.MODEL_TO_MAPPED.get(top_label, top_label)

            # Re-normalize mapped_scores to sum to 1 for all_scores output
            total = sum(mapped_scores.values())
            if total > 0:
                all_scores = {k: round(v / total, 4) for k, v in mapped_scores.items()}
            else:
                # If everything else was 0, just leave them as 0
                all_scores = mapped_scores

            return {
                'emotion': final_emotion,
                'confidence': round(float(confidence), 4),
                'score': all_scores.get(final_emotion, 0.0),
                'all_scores': all_scores
            }

        except Exception as e:
            logger.error(f"Error in EmotionService.analyze: {str(e)}")
            return None
