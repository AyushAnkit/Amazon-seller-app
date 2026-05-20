import os
import json
from flask import Flask, render_template, request, jsonify
from groq import Groq
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Initialize Groq client
# This expects GROQ_API_KEY to be set in the environment or .env file
client = Groq(
    api_key=os.environ.get("GROQ_API_KEY"),
)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generate', methods=['POST'])
def generate():
    data = request.json
    product_name = data.get('product_name')

    if not product_name:
        return jsonify({"error": "Product name is required"}), 400

    try:
        # Prompt for the Groq model
        prompt = f"""
You are an expert Amazon SEO copywriter. A user is selling a product named "{product_name}".
Please provide exactly 10 highly relevant SEO keywords and 3 optimized, catchy product titles for Amazon.
Return the output strictly in JSON format with the following structure, and do not include any markdown formatting, backticks, or other text outside of the JSON.
{{
    "keywords": [
        "keyword1",
        "keyword2",
        ...
    ],
    "titles": [
        "Title 1",
        "Title 2",
        "Title 3"
    ]
}}
"""

        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.7,
            response_format={"type": "json_object"}
        )

        response_content = chat_completion.choices[0].message.content
        result = json.loads(response_content)
        return jsonify(result)

    except Exception as e:
        print(f"Error calling Groq API: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
