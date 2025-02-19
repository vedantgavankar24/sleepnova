import pandas as pd
import numpy as np
from flask import Flask, request, jsonify
import pickle

app = Flask(__name__)

# Load the model
try:
    with open("models/lgbm_model.pkl", "rb") as f:
        model = pickle.load(f)
    print("Model loaded successfully!")
except Exception as e:
    print("Error loading model:", e)

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.json
        print("Received data:", data)  # Debugging
        
        # Convert JSON input to DataFrame
        input_data = pd.DataFrame([data])

        input_data = input_data.astype({
            "gender": int,
            "occupation": int,
            "sleepDuration": int,
            "sleepQuality": int,
            "physicalActivity": int,
            "stressLevel": int,
            "bmiCategory": int,
            "heartRate": int,
            "dailySteps": int,
            "age": int,
            "bloodPressure": int
        })

        print("Formatted input data:", input_data)  # Debugging

        # Get class probabilities
        probabilities = model.predict(input_data)

        # Handle multi-class output
        if isinstance(probabilities, np.ndarray) and len(probabilities.shape) > 1:
            predicted_class = int(np.argmax(probabilities, axis=1)[0])
            probability_list = probabilities[0].tolist()  # Convert to Python list
        else:
            predicted_class = int(probabilities[0] > 0.5)  # For binary classification
            probability_list = [1 - probabilities[0], probabilities[0]]

        print("Predicted class:", predicted_class)
        print("Class probabilities:", probability_list)

        return jsonify({
            "prediction": predicted_class,
            "probabilities": probability_list
        })
    except Exception as e:
        print("Prediction error:", e)
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    from waitress import serve
    print("🚀 Starting production server...")
    serve(app, host="0.0.0.0", port=5001)
