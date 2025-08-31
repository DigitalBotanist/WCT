import tensorflow as tf
import numpy as np
from .model import load_image_model
from .preprocess import preprocess_image
from .utils import decode_predictions

model = load_image_model()

def classify_image(img_content): 
    # preprocess image
    img_array = preprocess_image(img_content=img_content) 

    # predict image
    pred = model.predict(img_array)

    # get class names 
    pred_class_name = decode_predictions(pred)
    print("Predicted class:", pred_class_name)
