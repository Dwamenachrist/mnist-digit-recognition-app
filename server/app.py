from flask import Flask, request, jsonify
from mnist_model import load_model, predict_digit
import logging
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
# Configure logging
logging.basicConfig(level=logging.DEBUG)

# Load the model at startup
model = load_model()


@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Get image data from the request
        data = request.json
        if 'image' not in data:
            return jsonify({"error": "No image data provided"}), 400

        # Predict the digit
        prediction, confidence = predict_digit(data['image'], model)

        # Convert prediction to a standard Python integer
        prediction = int(prediction)

        return jsonify({"prediction": prediction, "confidence": confidence}), 200

    except Exception as e:
        logging.exception("An error occurred during prediction")
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)