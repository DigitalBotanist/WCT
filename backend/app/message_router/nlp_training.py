
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.base import BaseEstimator, TransformerMixin

import joblib

from app.message_router.spacy_preprocessor import SpacyPreprocessor

# -------------------------
# Simple spaCy-based preprocessor transformer
# -------------------------

# -------------------------
# Training data (small demo -- expand for production)
# -------------------------
training_data = [
    # Animal Classification (20 examples)
    ("what animal is in this image?", "animal_classification"),
    ("identify this creature", "animal_classification"),
    ("what species is this?", "animal_classification"),
    ("can you tell me what animal this is?", "animal_classification"),
    ("classify this animal from the picture", "animal_classification"),
    ("what type of animal is shown here?", "animal_classification"),
    ("recognize the animal in this photo", "animal_classification"),
    ("what kind of animal is this?", "animal_classification"),
    ("identify the species in this image", "animal_classification"),
    ("can you identify this animal?", "animal_classification"),
    ("what's this animal called?", "animal_classification"),
    ("tell me the name of this animal", "animal_classification"),
    ("what animal appears in this picture?", "animal_classification"),
    ("classify the creature in this image", "animal_classification"),
    ("identify the wildlife in this photo", "animal_classification"),
    ("what mammal is this?", "animal_classification"),
    ("what bird species is shown here?", "animal_classification"),
    ("identify this insect", "animal_classification"),
    ("what reptile is in this image?", "animal_classification"),
    ("can you classify this marine animal?", "animal_classification"),
    ("what fish species is this?", "animal_classification"),

    # Greeting (15 examples)
    ("hello", "greeting"),
    ("hi there", "greeting"),
    ("hey", "greeting"),
    ("good morning", "greeting"),
    ("good afternoon", "greeting"),
    ("good evening", "greeting"),
    ("greetings", "greeting"),
    ("hello there", "greeting"),
    ("hi", "greeting"),
    ("hey there", "greeting"),
    ("howdy", "greeting"),
    ("what's up", "greeting"),
    ("good day", "greeting"),
    ("nice to meet you", "greeting"),
    ("pleasure to meet you", "greeting"),
    ("hello friend", "greeting"),

    # Help (15 examples)
    ("help", "help"),
    ("i need assistance", "help"),
    ("can you help me?", "help"),
    ("what can you do?", "help"),
    ("how does this work?", "help"),
    ("i need support", "help"),
    ("can you assist me?", "help"),
    ("i need some help", "help"),
    ("help me please", "help"),
    ("what help can you provide?", "help"),
    ("how can you help me?", "help"),
    ("i need guidance", "help"),
    ("can you explain your capabilities?", "help"),
    ("what support do you offer?", "help"),
    ("i'm having trouble", "help"),
    ("need some assistance", "help"),

    # Migration Analysis (20 examples)
    ("analyze the migration data", "migration_analyze"),
    ("show me migration patterns", "migration_analyze"),
    ("analyze this migration file", "migration_analyze"),
    ("process the migration dataset", "migration_analyze"),
    ("what are the migration trends?", "migration_analyze"),
    ("analyze animal movement data", "migration_analyze"),
    ("study the migration routes", "migration_analyze"),
    ("examine the migration patterns", "migration_analyze"),
    ("analyze wildlife migration data", "migration_analyze"),
    ("process migration tracking information", "migration_analyze"),
    ("show migration analysis", "migration_analyze"),
    ("analyze bird migration data", "migration_analyze"),
    ("study animal movement patterns", "migration_analyze"),
    ("examine the migration dataset", "migration_analyze"),
    ("analyze seasonal migration", "migration_analyze"),
    ("process animal tracking data", "migration_analyze"),
    ("show me the migration analysis results", "migration_analyze"),
    ("analyze this animal migration file", "migration_analyze"),
    ("study wildlife movement patterns", "migration_analyze"),
    ("examine migration route data", "migration_analyze"),
    ("analyze population migration", "migration_analyze"),

    # Threat Analysis (20 examples)
    ("what is the endangered level of pandas?", "threat_analyze"),
    ("tell me the conservation status", "threat_analyze"),
    ("how endangered is this species?", "threat_analyze"),
    ("analyze the threat level", "threat_analyze"),
    ("what's the extinction risk?", "threat_analyze"),
    ("conservation status analysis", "threat_analyze"),
    ("what is the threat level for tigers?", "threat_analyze"),
    ("analyze endangered species status", "threat_analyze"),
    ("how threatened is this animal?", "threat_analyze"),
    ("what's the conservation status of elephants?", "threat_analyze"),
    ("analyze extinction risk for this species", "threat_analyze"),
    ("tell me the IUCN status", "threat_analyze"),
    ("what's the endangered classification?", "threat_analyze"),
    ("analyze species threat level", "threat_analyze"),
    ("how vulnerable is this species?", "threat_analyze"),
    ("what's the risk status of this animal?", "threat_analyze"),
    ("analyze conservation threat", "threat_analyze"),
    ("tell me the protection status", "threat_analyze"),
    ("how at risk is this species?", "threat_analyze"),
    ("what's the endangered category?", "threat_analyze"),
    ("analyze population threat level", "threat_analyze"),

    # Goodbye (15 examples)
    ("goodbye", "goodbye"),
    ("bye", "goodbye"),
    ("see you later", "goodbye"),
    ("farewell", "goodbye"),
    ("have a good day", "goodbye"),
    ("talk to you later", "goodbye"),
    ("see you soon", "goodbye"),
    ("take care", "goodbye"),
    ("until next time", "goodbye"),
    ("good night", "goodbye"),
    ("catch you later", "goodbye"),
    ("bye for now", "goodbye"),
    ("see ya", "goodbye"),
    ("later", "goodbye"),
    ("have a nice day", "goodbye"),
    ("signing off", "goodbye")
]

def nlp_training():
    texts, labels = zip(*training_data)
    preprocessor = SpacyPreprocessor(model="en_core_web_md")

    pipeline = Pipeline([
        ("preprocess", preprocessor),
        ("tfidf", TfidfVectorizer(ngram_range=(1,2), max_features=2000)),
        ("clf", LogisticRegression(max_iter=1000))
    ])

    # Train
    pipeline.fit(texts, labels)
    joblib.dump(pipeline, "app/message_router/chatbot_nlp.plk")

    return pipeline
