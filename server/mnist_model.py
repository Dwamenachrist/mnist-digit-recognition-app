import numpy as np
import tensorflow as tf
from PIL import Image
import base64
import io


def load_model(model_path='\mnist-digit-recognition-app\server\mnist_model_final.keras'):
    """Loads the pre-trained MNIST model.
    """
    try:
        model = tf.keras.models.load_model(model_path)
        print("Model loaded successfully.")
        return model
    except Exception as e:
        raise ValueError(f"Error loading model: {e}")


# def preprocess_image(base64_image):
#     """
#     Decode and preprocess the base64-encoded image for prediction,
#     mirroring the training data preprocessing.
#     """
#     try:
#         # Decode the base64 image
#         image_data = base64.b64decode(base64_image.split(',')[1])
#
#         # Open the image and convert to grayscale ('L' mode for Pillow)
#         image = Image.open(io.BytesIO(image_data)).convert('L')
#
#         # Resize to 28x28 pixels
#         image = image.resize((28, 28))
#
#         # Invert the image (as MNIST digits are white on black background)
#         image = ImageOps.invert(image)  # Invert using Pillow's Image.eval
#
#         # Convert to NumPy array and normalize pixel values
#         image_array = np.array(image, dtype=np.float32) / 255.0
#         print(f"Maximum pixel value after normalization: {np.max(image_array)}\n")
#
#         # Reshape to (1, 28, 28, 1) to match the model's input shape
#         image_array = image_array.reshape(1, 28, 28, 1)
#
#         return image_array
#     except Exception as e:
#         raise ValueError(f"Error preprocessing image: {e}")

def preprocess_image(base64_image):
    """Decode and preprocess the base64-encoded image for prediction."""
    try:
        # Decode the base64 image
        if ',' in base64_image:
            base64_image = base64_image.split(',')[1]
        image_data = base64.b64decode(base64_image)

        # Open the image and convert to grayscale
        image = Image.open(io.BytesIO(image_data)).convert('L')

        # Resize to 28x28 pixels
        image = image.resize((28, 28))

        # Invert the image (MNIST digits are white on black background)
        # image = ImageOps.invert(image)

        # Convert to NumPy array and normalize pixel values
        image_array = np.array(image, dtype=np.float32) / 255.0

        # Debugging: Save and log processed image info
        image.save("debug_image.png")  # Check if inversion is correct
        print(f"Processed image saved for debugging.")
        print(f"Maximum pixel value after normalization: {np.max(image_array)}")

        # Reshape to match the model's input shape
        image_array = image_array.reshape(1, 28, 28, 1)

        # Assert the shape for safety
        assert image_array.shape == (1, 28, 28, 1), f"Unexpected shape: {image_array.shape}"

        return image_array
    except Exception as e:
        raise ValueError(f"Error preprocessing image: {e}")


def predict_digit(base64_image, model):
    """Predict the digit from a preprocessed image using the loaded model."""
    try:
        processed_image = preprocess_image(base64_image)
        predictions = model.predict(processed_image)

        # Find the predicted digit and its confidence
        predicted_digit = np.argmax(predictions)
        confidence = float(predictions[0][predicted_digit])  # Convert to Python float

        return predicted_digit, confidence
    except Exception as e:
        raise ValueError(f"Error predicting digit: {e}")
