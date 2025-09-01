
import tensorflow as tf
import numpy as np
from tensorflow.keras.preprocessing import image
from tensorflow.keras.applications.efficientnet import preprocess_input
from PIL import Image
from io import BytesIO



def preprocess_image(img_content, target_size=(224, 224)):
    # Load and resize
    img = Image.open(BytesIO(img_content)).convert("RGB")
    img = img.resize(target_size)

    # change to numpy array 
    img_array = tf.keras.utils.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)

    # preprossing
    img_array = preprocess_input(img_array)

    return img_array


