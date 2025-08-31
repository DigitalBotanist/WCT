import os
import tensorflow as tf 
from tensorflow.keras.applications import EfficientNetB0

MODEL_PATH = os.path.join(os.path.dirname(__file__), "../../checkpoints/wildlife_model.keras")

def load_image_model():
    return tf.keras.models.load_model(MODEL_PATH, custom_objects={'EfficientNetB0': EfficientNetB0})
