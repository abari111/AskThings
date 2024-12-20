from flask import Flask, request, jsonify
from pymongo import MongoClient
import threading
import time
import os
import random
import openai

from dotenv import load_dotenv
load_dotenv()
# Flask app setup
app = Flask(__name__)

# MongoDB setup
client = MongoClient("mongodb://localhost:27017/")
db = client['askthings_db']
users_collection = db['users']
devices_collection = db['devices']
data_collection = db['device_data']

# OpenAI API Key setup
openai.api_key = os.environ.get("")

# In-memory simulation of IoT devices
connected_devices = {}

# Device simulation function
def simulate_device(device_id):
    while device_id in connected_devices:
        data = {
            "device_id": device_id,
            "timestamp": time.time(),
            "value": random.uniform(0, 100),
        }
        data_collection.insert_one(data)
        time.sleep(2)  # Simulate data every 2 seconds

@app.route('/register', methods=['POST'])
def register_user():
    data = request.json
    if not data.get('username') or not data.get('password'):
        return jsonify({"error": "Username and password required."}), 400

    users_collection.insert_one(data)
    return jsonify({"message": "User registered successfully."}), 201

@app.route('/add_device', methods=['POST'])
def add_device():
    data = request.json
    if not data.get('device_name') or not data.get('user_id'):
        return jsonify({"error": "Device name and user ID required."}), 400

    device_id = str(time.time())  # Simple device ID generation
    devices_collection.insert_one({"device_id": device_id, "device_name": data['device_name'], "user_id": data['user_id']})
    return jsonify({"device_id": device_id, "message": "Device added successfully."}), 201

@app.route('/start_device', methods=['POST'])
def start_device():
    data = request.json
    device_id = data.get('device_id')
    if not device_id:
        return jsonify({"error": "Device ID required."}), 400

    if device_id not in connected_devices:
        connected_devices[device_id] = True
        threading.Thread(target=simulate_device, args=(device_id,), daemon=True).start()
        return jsonify({"message": "Device started successfully."}), 200
    else:
        return jsonify({"error": "Device already running."}), 400

@app.route('/stop_device', methods=['POST'])
def stop_device():
    data = request.json
    device_id = data.get('device_id')
    if not device_id:
        return jsonify({"error": "Device ID required."}), 400

    if device_id in connected_devices:
        connected_devices.pop(device_id)
        return jsonify({"message": "Device stopped successfully."}), 200
    else:
        return jsonify({"error": "Device not running."}), 400

@app.route('/get_data', methods=['GET'])
def get_device_data():
    device_id = request.args.get('device_id')
    if not device_id:
        return jsonify({"error": "Device ID required."}), 400

    data = list(data_collection.find({"device_id": device_id}, {"_id": 0}))
    return jsonify({"data": data}), 200

@app.route('/chat', methods=['POST'])
def chat_with_device():
    data = request.json
    device_id = data.get('device_id')
    user_prompt = data.get('prompt')

    if not device_id or not user_prompt:
        return jsonify({"error": "Device ID and prompt required."}), 400

    device_data = list(data_collection.find({"device_id": device_id}, {"_id": 0}))[-5:]  # Fetch last 5 data points
    prompt = f"Device Data: {device_data}\nUser Query: {user_prompt}"

    try:
        response = openai.Completion.create(
            engine="text-davinci-003",
            prompt=prompt,
            max_tokens=150
        )
        return jsonify({"response": response['choices'][0]['text'].strip()}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
