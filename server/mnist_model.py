import numpy as np
import tensorflow as tf
from PIL import Image
import base64
import io


def load_model(model_path=r'C:\Users\Christian\Desktop\Internship\mnist-digit-recognition-app\server\mnist_model30.keras'):  # Adjust the path if needed
    """Loads the pre-trained MNIST model.
    """
    model = tf.keras.models.load_model(model_path)
    return model


def preprocess_image(base64_image):
    """
    Decode and preprocess the base64-encoded image for prediction.
    """
    # Decode the base64 image
    image_data = base64.b64decode(base64_image.split(',')[1])
    image = Image.open(io.BytesIO(image_data)).convert('L')  # Convert to grayscale

    # Resize to 28x28 pixels (MNIST model input size)
    image = image.resize((28, 28))

    # Convert to numpy array and normalize pixel values
    image_array = np.array(image) / 255.0  # Normalize to 0-1 range
    return image_array.reshape(1, 28, 28, 1)  # Add batch dimension


def predict_digit(base64_image, model):
    processed_image = preprocess_image(base64_image)
    predictions = model.predict(processed_image)

    # Find the predicted digit and its confidence
    predicted_digit = np.argmax(predictions)
    confidence = predictions[0][predicted_digit]

    # Convert confidence to a standard Python float
    confidence = float(confidence)

    return predicted_digit, confidence
