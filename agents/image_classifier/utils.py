import json
import tensorflow as tf
import numpy as np
import os 

CLASS_NAMES_FILE_PATH = os.path.join(os.path.dirname(__file__), "./class_names.json") 

def decode_predictions(preds):

    # get class names from the json file
    with open(CLASS_NAMES_FILE_PATH, "r") as class_file:
        labels = json.load(class_file)
    
    class_idx = preds.argmax()
    return {"label": labels[class_idx], "confidence": float(preds[0][class_idx])}
