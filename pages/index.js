import { useState } from "react";
import axios from "axios";

export default function Home() {
  const [formData, setFormData] = useState({
    gender: "Male",
    occupation: "Software Engineer",
    sleepDuration: 8,
    sleepQuality: 5,
    physicalActivity: 60,
    stressLevel: 5,
    bmiCategory: "Normal",
    heartRate: 70,
    dailySteps: 5000,
    age: "26-35",
    bloodPressure: "Normal",
  });

  const [result, setResult] = useState(null);
  const [recommendations, setRecommendations] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    try {
      const modelResponse = await axios.post("/api/predict", formData);
      setResult(modelResponse.data.prediction);

      const prompt = `Provide sleep disorder recommendations for:
      Gender: ${formData.gender}
      Occupation: ${formData.occupation}
      Age: ${formData.age}
      Diagnosis: ${modelResponse.data.prediction}
      Sleep Duration: ${formData.sleepDuration} hours
      Sleep Quality: ${formData.sleepQuality}/10
      Physical Activity: ${formData.physicalActivity} min/day
      Stress Level: ${formData.stressLevel}/10
      BMI: ${formData.bmiCategory}
      Heart Rate: ${formData.heartRate} bpm
      Daily Steps: ${formData.dailySteps}
      Blood Pressure: ${formData.bloodPressure}
      Provide 7 actionable tips.`;

      const aiResponse = await axios.post(
        "https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta",
        { inputs: prompt },
        { headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_HF_API_KEY}` } }
      );

      setRecommendations(aiResponse.data[0]?.generated_text || "No recommendations available.");
    } catch (error) {
      console.error("Error fetching prediction:", error);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white rounded-lg shadow-md">
      <h1 className="text-xl font-bold">Sleep Disorder Prediction</h1>
      <div className="grid grid-cols-2 gap-4 mt-4">
        {Object.keys(formData).map((key) => (
          <div key={key}>
            <label className="block font-medium">{key.replace(/([A-Z])/g, " $1").toUpperCase()}</label>
            <input
              type="text"
              name={key}
              value={formData[key]}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>
        ))}
      </div>
      <button onClick={handleSubmit} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
        Predict
      </button>
      {result && <h2 className="mt-4 text-lg font-semibold">Prediction: {result}</h2>}
      {recommendations && <p className="mt-2">Recommendations: {recommendations}</p>}
    </div>
  );
}
