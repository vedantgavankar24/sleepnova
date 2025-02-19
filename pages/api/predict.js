import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    console.log("🔵 Sending request to Flask...");

    const response = await axios.post("http://127.0.0.1:5001/predict", req.body);

    console.log("🟢 Flask Response:", response.data);

    res.status(200).json(response.data);
  } catch (error) {
    console.error("🔴 Error in API request:", error.response?.data || error.message);

    res.status(500).json({
      error: "Failed to process prediction",
      details: error.response?.data || "Unknown error"
    });
  }
}
