from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from sklearn.linear_model import LinearRegression

app = Flask(__name__)
CORS(app, origins="*") 

# Sample Training Data
odds = np.array([1.2, 1.5, 2.0, 2.5, 3.0]).reshape(-1, 1)
safety = np.array([90, 80, 65, 40, 20])  # Safety Percentages

# Train the Model
model = LinearRegression()
model.fit(odds, safety)

# Define Endpoint to Predict Safety
@app.route('/predict_safety', methods=['POST'])
def predict_safety():
    try:
        data = request.get_json()
        print("📢 Received Request:", data)  # Log received request

        if not data:
            print("❌ ERROR: No data received!")
            return jsonify({"error": "Request body is empty"}), 400

        if "odds" not in data:
            print("❌ ERROR: Missing 'odds' key in request!")
            return jsonify({"error": "Missing 'odds' key"}), 400
        input_odds = np.array(data['odds']).reshape(-1, 1)
        predicted_safety = model.predict(input_odds)
        
        # Format response
        response = [{"odds": o, "safety": round(s, 2)} for o, s in zip(input_odds.flatten(), predicted_safety)]
        return jsonify({"predictions": response})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# Run the Server
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
