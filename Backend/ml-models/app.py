from flask import Flask, request, jsonify
from flask_cors import CORS
import openai 
print(openai.__version__)
import os
app = Flask(__name__)
CORS(app)  # Allow frontend requests

openai.api_key = os.getenv("OPENAI_API_KEY")  # Your key from .env

@app.route("/chat", methods=["POST"])
def chat():
    data = request.json
    message = data.get("message")

    if not message:
        return jsonify({"error": "No message provided"}), 400

    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": message}],
        )
        reply = response.choices[0].message.content
        return jsonify({"reply": reply})
    except Exception as e:
        print("AI error:", e)
        return jsonify({"error": "Failed to get response"}), 500

if __name__ == "__main__":
    app.run(port=5000, debug=True)
