import numpy as np
import tensorflow as tf
from PIL import Image
import base64
import io
import os

# 🚨 Disable GPU (Render Free Tier doesn't support CUDA)
os.environ["CUDA_VISIBLE_DEVICES"] = "-1"


def load_model():
    """Loads the pre-trained MNIST model dynamically."""
    try:
        BASE_DIR = os.path.dirname(os.path.abspath(__file__))
        model_path = os.path.join(BASE_DIR, "mnist_model_final.keras")

        # Load the TensorFlow model
        model = tf.keras.models.load_model(model_path)
        print("✅ Model loaded successfully.")
        return model
    except Exception as e:
        raise ValueError(f"❌ Error loading model: {e}")


def preprocess_image(base64_image):
    """Decodes and preprocesses a base64-encoded image for prediction."""
    try:
        # Remove base64 header if present (e.g., "data:image/png;base64,...")
        if ',' in base64_image:
            base64_image = base64_image.split(',')[1]

        # Decode base64
        image_data = base64.b64decode(base64_image)

        # Open image and convert to grayscale (MNIST uses grayscale)
        image = Image.open(io.BytesIO(image_data)).convert('L')

        # Resize to 28x28 pixels (MNIST standard size)
        image = image.resize((28, 28))

        # Convert to NumPy array and normalize (0-1 range)
        image_array = np.array(image, dtype=np.float32) / 255.0

        # 🚨 Debugging: Log image processing
        print(f"📷 Processed image - Max pixel value: {np.max(image_array)}")

        # Reshape for model input: (1, 28, 28, 1)
        image_array = image_array.reshape(1, 28, 28, 1)

        # Ensure correct shape
        if image_array.shape != (1, 28, 28, 1):
            raise ValueError(f"❌ Unexpected input shape: {image_array.shape}")

        return image_array
    except Exception as e:
        raise ValueError(f"❌ Error preprocessing image: {e}")


def predict_digit(base64_image, model):
    """Predicts the digit from an image using the loaded model."""
    try:
        processed_image = preprocess_image(base64_image)

        # Get model predictions
        predictions = model.predict(processed_image)

        # Identify the most probable digit
        predicted_digit = np.argmax(predictions)
        confidence = float(predictions[0][predicted_digit])  # Convert to Python float

        print(f"🔢 Predicted: {predicted_digit}, Confidence: {confidence:.4f}")

        return predicted_digit, confidence
    except Exception as e:
        raise ValueError(f"❌ Error predicting digit: {e}")
