import os

# 🚨 Disable GPU (Fixes CUDA errors on Render)
os.environ["CUDA_VISIBLE_DEVICES"] = "-1"

import numpy as np
import tensorflow as tf
from PIL import Image
import base64
import io


def load_model():
    """Loads the pre-trained MNIST model dynamically."""
    try:
        BASE_DIR = os.path.dirname(os.path.abspath(__file__))
        model_path = os.path.join(BASE_DIR, "mnist_model_final.keras")

        model = tf.keras.models.load_model(model_path)
        print("✅ Model loaded successfully.")
        return model
    except Exception as e:
        raise ValueError(f"❌ Error loading model: {e}")


def preprocess_image(base64_image):
    """Decodes and preprocesses a base64-encoded image for prediction."""
    try:
        if ',' in base64_image:
            base64_image = base64_image.split(',')[1]

        image_data = base64.b64decode(base64_image)
        image = Image.open(io.BytesIO(image_data)).convert('L')
        image = image.resize((28, 28))
        image_array = np.array(image, dtype=np.float32) / 255.0
        image_array = image_array.reshape(1, 28, 28, 1)

        return image_array
    except Exception as e:
        raise ValueError(f"❌ Error preprocessing image: {e}")


def predict_digit(base64_image, model):
    """Predicts the digit from an image using the loaded model."""
    try:
        processed_image = preprocess_image(base64_image)
        predictions = model.predict(processed_image)

        predicted_digit = np.argmax(predictions)
        confidence = float(predictions[0][predicted_digit])

        # 🚀 Free up memory after inference (Fixes Render OOM issue)
        tf.keras.backend.clear_session()

        return predicted_digit, confidence
    except Exception as e:
        raise ValueError(f"❌ Error predicting digit: {e}")
