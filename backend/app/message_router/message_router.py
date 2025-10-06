import joblib
import sys
from typing import Optional
import logging

from app.message_router.spacy_preprocessor import SpacyPreprocessor
from app.message_router.nlp_training import nlp_training

class MessageRouter:
    _instance = None

    def __init__(self):
        if MessageRouter._instance is not None: 
            raise Exception("Use `get_instance()` to access the singleton instance.")
        
        self.pipeline = None
        self._get_pipeline()  

        MessageRouter._instance = self

    def classify_intent(self, text): 
        try:
            probs = self.pipeline.predict_proba([text])[0]
            max_prob = probs.max()
            intent = self.pipeline.predict([text])[0]

            if (max_prob < 0.25): 
                intent = 'unkown'
        except Exception as e:
            print("Error predicting intent:", e, file=sys.stderr)
            intent = "unknown"
        logging.info(f"intent: {intent}")
        return intent

    def _get_pipeline(self):
        try: 
            self.pipeline = joblib.load("app/message_router/chatbot_nlp.plk") 
        except:
            self.pipeline = nlp_training() 

    @classmethod
    def get_message_router(cls):
        if cls._instance is None: 
            cls._instance = cls()
        return cls._instance 