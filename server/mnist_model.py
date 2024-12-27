import numpy as np
import tensorflow as tf
from PIL import Image, ImageOps
import base64
import io


def load_model(model_path=r'C:\Users\Christian\Desktop\Internship\mnist-digit-recognition-app\server\mnist_model995.keras'):  # Adjust the path if needed
    """Loads the pre-trained MNIST model.
    """
    model = tf.keras.models.load_model(model_path)
    return model


def preprocess_image(base64_image):
    """
    Decode and preprocess the base64-encoded image for prediction,
    mirroring the training data preprocessing.
    """
    try:
        # Decode the base64 image
        image_data = base64.b64decode(base64_image.split(',')[1])

        # Open the image and convert to grayscale ('L' mode for Pillow)
        image = Image.open(io.BytesIO(image_data)).convert('L')

        # Resize to 28x28 pixels
        image = image.resize((28, 28))

        # Invert the image (as MNIST digits are white on black background)
        image = ImageOps.invert(image)  # Invert using Pillow's Image.eval

        # Convert to NumPy array and normalize pixel values
        image_array = np.array(image, dtype=np.float32) / 255.0

        # Reshape to (1, 28, 28, 1) to match the model's input shape
        image_array = image_array.reshape(1, 28, 28, 1)

        return image_array
    except Exception as e:
        raise ValueError(f"Error preprocessing image: {e}")


def predict_digit(base64_image, model):
    """
        Predict the digit in a preprocessed image using the loaded model.
    """
    try:
        processed_image = preprocess_image(base64_image)
        predictions = model.predict(processed_image)

        # Find the predicted digit and its confidence
        predicted_digit = np.argmax(predictions)
        confidence = predictions[0][predicted_digit]

        # Convert confidence to a standard Python float
        confidence = float(confidence)

        return predicted_digit, confidence
    except Exception as e:
        raise ValueError(f"Error predicting digit: {e}")
