// Frontend for AskThings using React

import React, { useState } from "react";
import axios from "axios";
import "./App.css";

const API_BASE = "http://localhost:5000";

function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [deviceName, setDeviceName] = useState("");
  const [userId, setUserId] = useState("");
  const [deviceId, setDeviceId] = useState("");
  const [prompt, setPrompt] = useState("");
  const [chatResponse, setChatResponse] = useState("");
  const [deviceData, setDeviceData] = useState([]);

  const registerUser = async () => {
    try {
      const response = await axios.post(`${API_BASE}/register`, { username, password });
      alert(response.data.message);
    } catch (error) {
      alert(error.response?.data?.error || "Error registering user");
    }
  };

  const addDevice = async () => {
    try {
      const response = await axios.post(`${API_BASE}/add_device`, { device_name: deviceName, user_id: userId });
      setDeviceId(response.data.device_id);
      alert(response.data.message);
    } catch (error) {
      alert(error.response?.data?.error || "Error adding device");
    }
  };

  const startDevice = async () => {
    try {
      await axios.post(`${API_BASE}/start_device`, { device_id: deviceId });
      alert("Device started successfully");
    } catch (error) {
      alert(error.response?.data?.error || "Error starting device");
    }
  };

  const stopDevice = async () => {
    try {
      await axios.post(`${API_BASE}/stop_device`, { device_id: deviceId });
      alert("Device stopped successfully");
    } catch (error) {
      alert(error.response?.data?.error || "Error stopping device");
    }
  };

  const fetchData = async () => {
    try {
      const response = await axios.get(`${API_BASE}/get_data`, { params: { device_id: deviceId } });
      setDeviceData(response.data.data);
    } catch (error) {
      alert(error.response?.data?.error || "Error fetching data");
    }
  };

  const chatWithDevice = async () => {
    try {
      const response = await axios.post(`${API_BASE}/chat`, { device_id: deviceId, prompt });
      setChatResponse(response.data.response);
    } catch (error) {
      alert(error.response?.data?.error || "Error chatting with device");
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>AskThings Platform</h1>
      </header>

      <main className="app-main">
        <section className="card">
          <h2>Register User</h2>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="input"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
          />
          <button onClick={registerUser} className="button">Register</button>
        </section>

        <section className="card">
          <h2>Add Device</h2>
          <input
            type="text"
            placeholder="Device Name"
            value={deviceName}
            onChange={(e) => setDeviceName(e.target.value)}
            className="input"
          />
          <input
            type="text"
            placeholder="User ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="input"
          />
          <button onClick={addDevice} className="button">Add Device</button>
        </section>

        <section className="card">
          <h2>Control Device</h2>
          <input
            type="text"
            placeholder="Device ID"
            value={deviceId}
            onChange={(e) => setDeviceId(e.target.value)}
            className="input"
          />
          <button onClick={startDevice} className="button">Start Device</button>
          <button onClick={stopDevice} className="button">Stop Device</button>
          <button onClick={fetchData} className="button">Fetch Data</button>
        </section>

        <section className="card">
          <h2>Device Data</h2>
          <pre className="data-box">{JSON.stringify(deviceData, null, 2)}</pre>
        </section>

        <section className="card">
          <h2>Chat with Device</h2>
          <textarea
            placeholder="Enter your prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="textarea"
          />
          <button onClick={chatWithDevice} className="button">Chat</button>
          <h3>Response</h3>
          <p className="response-box">{chatResponse}</p>
        </section>
      </main>
    </div>
  );
}

export default App;
