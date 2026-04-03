import logging
from django.apps import AppConfig
from transformers import pipeline

logger = logging.getLogger(__name__)

class EmotionsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "emotions"
    _classifier = None

    def ready(self):
        """
        Load the emotion detection model once at startup.
        Note: This runs in the main thread during startup of the Django development server.
        For production with multiple workers, this will run once per worker process.
        """
        if self._classifier is None:
            model_name = "j-hartmann/emotion-english-distilroberta-base"
            logger.info(f"Loading emotion detection model: {model_name}")
            try:
                # Load the pipeline once. This will be cached in the class.
                self._classifier = pipeline(
                    "text-classification",
                    model=model_name,
                    return_all_scores=True
                )
                logger.info("Emotion detection model loaded successfully.")
            except Exception as e:
                logger.error(f"Failed to load emotion detection model: {str(e)}")

    @property
    def classifier(self):
        return self._classifier
