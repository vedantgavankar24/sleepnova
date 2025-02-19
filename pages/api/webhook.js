import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    console.log("🔵 Webhook Data Received:", req.body);

    // Forward data to your Flask prediction API
    const flaskResponse = await axios.post("https://your-flask-api.onrender.com/predict", req.body);

    console.log("🟢 Prediction Response:", flaskResponse.data);

    // Respond back to Botpress
    res.status(200).json({
      prediction: flaskResponse.data.prediction,
      probabilities: flaskResponse.data.probabilities
    });
  } catch (error) {
    console.error("🔴 Webhook API Error:", error.response?.data || error.message);

    res.status(500).json({
      error: "Webhook failed",
      details: error.response?.data || "Unknown error"
    });
  }
}
