import joblib
import sys

from app.message_router.spacy_preprocessor import SpacyPreprocessor
from app.message_router.nlp_training import nlp_training

class MessageRouter:
    def __init__(self):
        self.pipeline = None

        self._get_pipeline()  

    def classify_intent(self, text): 
        try:
            probs = self.pipeline.predict_proba([text])[0]
            max_prob = probs.max()
            intent = self.pipeline.predict([text])[0]
        except Exception as e:
            print("Error predicting intent:", e, file=sys.stderr)
            intent = "unknown"
        return intent, max_prob

    def _get_pipeline(self):
        try: 
            self.pipeline = joblib.load("app/message_router/chatbot_nlp.plk") 
        except:
            self.pipeline = nlp_training() 