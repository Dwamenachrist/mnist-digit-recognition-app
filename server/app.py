from flask import Flask, request, jsonify
from mnist_model import load_model, predict_digit
import logging
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
logging.basicConfig(level=logging.DEBUG)

# 🚀 Load model only once
model = load_model()


@app.route('/')
def home():
    return "MNIST Digit Recognition API is running 🚀"


@app.route('/six_layer_model', methods=['POST'])
def predict():
    try:
        data = request.json
        if 'image' not in data:
            return jsonify({"error": "No image data provided"}), 400

        prediction, confidence = predict_digit(data['image'], model)

        return jsonify({"prediction": int(prediction), "confidence": confidence}), 200

    except Exception as e:
        logging.exception("An error occurred during prediction")
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=10000, debug=True)
