import { useState } from "react";
import axios from "axios";
import { useEffect } from "react";

// Define the mapping objects for categorical fields
const genderMapping = { Female: 0, Male: 1 };
const ageMapping = { "26-35": 0, "36-45": 1, "46-55": 2, "55+": 3 };
const occupationMapping = {
  Accountant: 0,
  Doctor: 1,
  Engineer: 2,
  Lawyer: 3,
  Manager: 4,
  Nurse: 5,
  "Sales Representative": 6,
  Salesperson: 7,
  Scientist: 8,
  "Software Engineer": 9,
  Teacher: 10,
};
const sleepDurationMapping = { Ideal: 0, Long: 1, Moderate: 2, Short: 3 };
const physicalActivityMapping = { High: 0, Low: 1, Moderate: 2 };
const stressLevelMapping = { High: 0, Low: 1, Moderate: 2 };
const bmiCategoryMapping = { Normal: 0, Obese: 1, Overweight: 2 };
const bloodPressureMapping = {
  Elevated: 0,
  "High (Stage 1)": 1,
  "High (Stage 2)": 2,
  Normal: 3,
};

// Define possible values for dropdowns
const genderOptions = ["Female", "Male"];
const ageOptions = ["26-35", "36-45", "46-55", "55+"];
const occupationOptions = [
  "Accountant",
  "Doctor",
  "Engineer",
  "Lawyer",
  "Manager",
  "Nurse",
  "Sales Representative",
  "Salesperson",
  "Scientist",
  "Software Engineer",
  "Teacher",
];
const bmiCategoryOptions = ["Normal", "Obese", "Overweight"];
const bloodPressureOptions = ["Elevated", "High (Stage 1)", "High (Stage 2)", "Normal"];

const sleepQuotes = [
  { text: "\"A good laugh and a long sleep are the two best cures for anything.\"", author: "- Irish Proverb" },
  { text: "\"Sleep is the best meditation.\"", author: "- Dalai Lama" },
  { text: "\"Your future depends on your dreams, so go to sleep.\"", author: "- Mesut Barazany" },
  { text: "\"Sleep is that golden chain that ties health and our bodies together.\"", author: "- Thomas Dekker" },
  { text: "\"Man should forget his anger before he lies down to sleep.\"", author: "- Mahatma Gandhi" },
  { text: "\"Happiness consists of getting enough sleep.\"", author: "- Robert A. Heinlein" },
  { text: "\"Early to bed and early to rise makes a man healthy, wealthy, and wise.\"", author: "- Benjamin Franklin" },
  { text: "\"There is a time for many words, and there is also a time for sleep.\"", author: "- Homer" },
  { text: "\"A well-spent day brings happy sleep.\"", author: "- Leonardo da Vinci" },
  { text: "\"Sleep is the most delicious invention.\"", author: "- Heinrich Heine" },
  { text: "\"I love sleep. My life has the tendency to fall apart when I'm awake, you know?\"", author: "- Ernest Hemingway" },
  { text: "\"Tired minds don't plan well. Sleep first, plan later.\"", author: "- Walter Reisch" },
  { text: "\"Without enough sleep, we all become tall two-year-olds.\"", author: "- JoJo Jensen" },
  { text: "\"The night is the womb of the day; sleep is the mother of all creation.\"", author: "- Upanishads" },
  { text: "\"Sleep is the nectar that nourishes the soul and rejuvenates the spirit.\"", author: "- Bhagavad Gita" },
  { text: "\"A peaceful mind leads to peaceful sleep, and peaceful sleep leads to a peaceful life.\"", author: "- Chanakya" },
  { text: "\"Sleep is the bridge that connects the conscious mind to the divine.\"", author: "- Yoga Sutras of Patanjali" },
  { text: "\"The body rests in sleep, but the soul awakens to its true nature.\"", author: "- Vedanta" },
  { text: "\"Sleep is the time when the mind dissolves into the infinite ocean of consciousness.\"", author: "- Adi Shankaracharya" },
  { text: "\"A peaceful sleep is the greatest gift you can give to your body and mind.\"", author: "- Ayurvedic Wisdom" },
];


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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [chatInput, setChatInput] = useState(""); // Chat input state
  const [chatHistory, setChatHistory] = useState([]); // Chat history state

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true); // Start loading
      // Transform categorical values to their corresponding integer encodings
      const transformedData = {
        ...formData,
        gender: genderMapping[formData.gender],
        age: ageMapping[formData.age],
        occupation: occupationMapping[formData.occupation],
        bmiCategory: bmiCategoryMapping[formData.bmiCategory],
        bloodPressure: bloodPressureMapping[formData.bloodPressure],
      };

      const modelResponse = await axios.post("/api/predict", transformedData);
      const prediction = modelResponse.data.prediction; // Assuming prediction is an array of probabilities
      const probabilities = modelResponse.data.probabilities; 

    // Map the predicted class to its label
      const predictionClass = prediction.length > 1
        ? prediction.indexOf(Math.max(...prediction)) // For multi-class classification
        : prediction[0] > 0.5 ? 1 : 0; // For binary classification

      const predLabels = ['Healthy', 'Insomnia', 'Sleep Apnea'];
      const predLabel = predLabels[predictionClass];

      // Extract prediction probabilities
      const probs = prediction.length > 1
        ? prediction // For multi-class classification
        : [1 - prediction[0], prediction[0]]; // For binary classification

      setResult(modelResponse.data.prediction);

      const prompt = `You are a medical assistant specializing in sleep disorders. Provide personalized recommendations for a user with:
       - Gender: ${formData.gender}
       - Occupation: ${formData.occupation}
       - Age: ${formData.age}
       - Diagnosis: ${predLabel}
       - Prediction Probabilities: Healthy (${probabilities[0].toFixed(2)}), Insomnia (${probabilities[1].toFixed(2)}), Sleep Apnea (${probabilities[2].toFixed(2)})
       - Sleep Duration: ${formData.sleepDuration} hours
       - Sleep Quality: ${formData.sleepQuality}/10
       - Physical Activity: ${formData.physicalActivity} min/day
       - Stress Level: ${formData.stressLevel}/10
       - BMI: ${formData.bmiCategory}
       - Heart Rate: ${formData.heartRate} bpm
       - Daily Steps: ${formData.dailySteps}
       - Blood Pressure: ${formData.bloodPressure}
       - Provide a numbered list of 7 actionable recommendations.`;

      const aiResponse = await axios.post(
        "https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1",
        { inputs: prompt },
        { headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_HF_API_KEY}` } }
      );
  
      console.log("API Response:", aiResponse.data); // Debugging: Log the API response
  
      // Extract the generated text from the response
      if (aiResponse.data && Array.isArray(aiResponse.data) && aiResponse.data[0] && aiResponse.data[0].generated_text) {
        const generatedText = aiResponse.data[0].generated_text;
        // Remove the prompt from the generated text
        const recommendations = generatedText.replace(prompt, "Recommendations:\n").trim();
        const diagnosisMessage = `Your diagnosis : ${predLabel}.\nPrediction Probabilities: Healthy (${probabilities[0].toFixed(2)}), Insomnia (${probabilities[1].toFixed(2)}), Sleep Apnea (${probabilities[2].toFixed(2)})`;
        setRecommendations(recommendations);
        setChatHistory((prev) => [
          ...prev,
          { role: "assistant", content: diagnosisMessage },
          { role: "assistant", content: recommendations },
        ]);
      };

      // Add recommendations to chat history as a message from the assistant
  
    } catch (error) {
      console.error("Error fetching prediction:", error);
    } finally {
      setIsLoading(false); // Stop loading
      setIsModalOpen(false); // Close the modal after submission
    }
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    // Add user message to chat history
    setChatHistory((prev) => [...prev, { role: "user", content: chatInput }]);

    try {
      // Send chat input to Hugging Face model with a specific role prompt
      const prompt = `You are a sleep and lifestyle advisory chatbot. Provide helpful advice related to sleep, lifestyle, and health. Do not deviate from this role. User: ${chatInput}`;

      const aiResponse = await axios.post(
        "https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta",
        { inputs: prompt },
        { headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_HF_API_KEY}` } }
      );

      // Add AI response to chat history
      const rawResponse = aiResponse.data[0]?.generated_text || "No response available.";
      const filteredResponse = rawResponse
        .replace(prompt, "") // Remove the role prompt
        .trim();

      setChatHistory((prev) => [
        ...prev,
        { role: "assistant", content: filteredResponse },
      ]);
    } catch (error) {
      console.error("Error fetching chat response:", error);
      setChatHistory((prev) => [...prev, { role: "assistant", content: "Failed to fetch response." }]);
    } finally {
      setChatInput(""); // Clear chat input
    }
  };

  const [quote, setQuote] = useState(sleepQuotes[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setQuote(sleepQuotes[Math.floor(Math.random() * sleepQuotes.length)]);
    }, 5000);
    return () => clearInterval(interval);
  }, []);


  return (
    <div className="p-6 max-w-3xl mx-auto bg-white rounded-lg shadow-md" >
      <header className="header" style={{
        backgroundColor: "#0078d4",
        color: "white",
        padding: "15px 20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 3px 5px rgba(0, 0, 0, 0.2)",
        width: "100vw",
        boxSizing: "border-box",
        position: "fixed",
        top: 0,
        left: 0,
        fontFamily: "Arial, sans-serif",
        zIndex: 1000, // Ensure the header stays on top
      }}>
        <div className="container" style={{
          width: "100%",
          maxWidth: "1200px",
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        //  color:#d900ff
        }}>
          <div className="logo">
            <h1 style={{ fontSize: "1.8rem", margin: 0, letterSpacing: "1px" }}>Sleep<span style={{ color: "#ffaf02" }}>Nova</span></h1>
          </div>
          <nav>
            <ul className="nav-links" style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
              display: "flex",
              gap: "20px",
              alignItems: "center", // Vertically center all nav items
            }}>
              <li>
                <button
                  onClick={() => setIsModalOpen(true)}
                  style={{
                    backgroundColor: "rgb(255, 175, 2)",
                    color: "black",
                    borderRadius: "8px",
                    fontSize: "1rem",
                    fontWeight: "500",
                    padding: "0.5rem 1rem", // Adjusted padding for better proportions
                    border: "2px solid black",
                    cursor: "pointer",
                    transition: "background-color 0.3s ease",
                    display: "flex",
                    alignItems: "center", // Vertically center button text
                    justifyContent: "center",
                    height: "40px", // Match the height of other nav items
                  }}
                >
                  Predict Disorder
                </button>
              </li>
              <li>
                <a href="/dashboard" style={{
                  textDecoration: "none",
                  color: "white",
                  fontWeight: "bold",
                  transition: "color 0.3s",
                  display: "flex",
                  alignItems: "center", // Vertically center link text
                  height: "40px", // Match the height of other nav items
                }}>
                  Dashboard
                </a>
              </li>
              <li>
                <a href="#" style={{
                  textDecoration: "none",
                  color: "white",
                  fontWeight: "bold",
                  transition: "color 0.3s",
                  display: "flex",
                  alignItems: "center", // Vertically center link text
                  height: "40px", // Match the height of other nav items
                }}>
                  About
                </a>
              </li>
              <li>
                <a href="#" style={{
                  textDecoration: "none",
                  color: "white",
                  fontWeight: "bold",
                  transition: "color 0.3s",
                  display: "flex",
                  alignItems: "center", // Vertically center link text
                  height: "40px", // Match the height of other nav items
                }}>
                  Contact
                </a>
              </li>
              <li>
                <a href="/login" style={{
                  textDecoration: "none",
                  color: "white",
                  fontWeight: "bold",
                  transition: "color 0.3s",
                  display: "flex",
                  alignItems: "center", // Vertically center link text
                  height: "40px", // Match the height of other nav items
                }}>
                  Sign Out
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <h1 className="text-xl font-bold">Sleep Disorder Prediction</h1>

      <div style={{ 
        width: "100%", 
        borderTop: "1px solid #e2e8f0", 
        padding: "1rem", 
        marginTop: "auto" 
      }}>
        <div style={{ maxWidth: "90%", margin: "0 auto", textAlign: "center" }}>
          <div style={{ display: "inline-block", padding: "1rem", background: "#f4f6f9", boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)", borderRadius: "10px", fontStyle: "italic", fontSize: "1.2rem", fontWeight: "bold", color: "#0078d4", whiteSpace: "normal" }}>
            {quote.text}
            <div style={{ fontSize: "1rem", fontWeight: "normal", marginTop: "5px" }}>{quote.author}</div>
          </div>
          </div>
          </div>

      {/* Modal for the form */}
      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "2rem",
              borderRadius: "12px",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
              width: "90%",
              maxWidth: "600px",
              animation: "fadeIn 0.3s ease-in-out",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#1f2937" }}>Sleep Disorder Prediction Form</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: "none", border: "none", fontSize: "1.5rem", color: "#6b7280", cursor: "pointer" }}
              >
                &times;
              </button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1.5rem" }}>
              {/* Gender Dropdown */}
              <div>
                <label style={{ display: "block", fontWeight: "500", color: "#374151", marginBottom: "0.5rem" }}>Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "1rem",
                    transition: "border-color 0.3s ease, box-shadow 0.3s ease",
                  }}
                >
                  {genderOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              {/* Age Dropdown */}
              <div>
                <label style={{ display: "block", fontWeight: "500", color: "#374151", marginBottom: "0.5rem" }}>Age group</label>
                <select
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "1rem",
                    transition: "border-color 0.3s ease, box-shadow 0.3s ease",
                  }}
                >
                  {ageOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              {/* Occupation Dropdown */}
              <div>
                <label style={{ display: "block", fontWeight: "500", color: "#374151", marginBottom: "0.5rem" }}>Occupation</label>
                <select
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "1rem",
                    transition: "border-color 0.3s ease, box-shadow 0.3s ease",
                  }}
                >
                  {occupationOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              {/* BMI Category Dropdown */}
              <div>
                <label style={{ display: "block", fontWeight: "500", color: "#374151", marginBottom: "0.5rem" }}>BMI Category</label>
                <select
                  name="bmiCategory"
                  value={formData.bmiCategory}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "1rem",
                    transition: "border-color 0.3s ease, box-shadow 0.3s ease",
                  }}
                >
                  {bmiCategoryOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              {/* Blood Pressure Dropdown */}
              <div>
                <label style={{ display: "block", fontWeight: "500", color: "#374151", marginBottom: "0.5rem" }}>Blood Pressure</label>
                <select
                  name="bloodPressure"
                  value={formData.bloodPressure}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "1rem",
                    transition: "border-color 0.3s ease, box-shadow 0.3s ease",
                  }}
                >
                  {bloodPressureOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              {/* Numeric Inputs */}
              {/* {["sleepDuration", "sleepQuality", "physicalActivity", "stressLevel", "heartRate", "dailySteps"].map((key) => (
                <div key={key}>
                  <label style={{ display: "block", fontWeight: "500", color: "#374151", marginBottom: "0.5rem" }}>
                    {key.replace(/([A-Z])/g, " $1").toUpperCase()}
                  </label>
                  <input
                    type="number"
                    name={key}
                    value={formData[key]}
                    onChange={handleChange}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      fontSize: "1rem",
                      transition: "border-color 0.3s ease, box-shadow 0.3s ease",
                    }}
                  />
                </div>
              ))} */}
              {
                [
                  {
                    key: "sleepDuration",
                    label: "Sleep Duration (hours/day)",
                    type: "select",
                    options: Array.from({ length: 12 }, (_, i) => i + 1), // 1-12 hours
                  },
                  {
                    key: "sleepQuality",
                    label: "Sleep Quality",
                    type: "select",
                    options: Array.from({ length: 10 }, (_, i) => i + 1), // 1-10
                  },
                  {
                    key: "physicalActivity",
                    label: "Physical Activity (min/day)",
                    type: "number",
                    min: 5, // Minimum 5 minutes
                    max: 360, // Maximum 360 minutes
                  },
                  {
                    key: "stressLevel",
                    label: "Stress Level",
                    type: "select",
                    options: Array.from({ length: 10 }, (_, i) => i + 1), // 1-10
                  },
                  {
                    key: "heartRate",
                    label: "Heart Rate (bpm)",
                    type: "select",
                    options: Array.from({ length: 121 }, (_, i) => i + 40), // 40-160 bpm
                  },
                  {
                    key: "dailySteps",
                    label: "Daily Steps",
                    type: "number",
                    min: 50, // Minimum 50 steps
                    max: 10000,
                  },
                ].map((field) => (
                  <div key={field.key}>
                    <label style={{ display: "block", fontWeight: "500", color: "#374151", marginBottom: "0.5rem" }}>
                      {field.label}
                    </label>
                    {field.type === "select" ? (
                      <select
                        name={field.key}
                        value={formData[field.key]}
                        onChange={handleChange}
                        style={{
                          width: "100%",
                          padding: "0.75rem",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                          fontSize: "1rem",
                          transition: "border-color 0.3s ease, box-shadow 0.3s ease",
                        }}
                      >
                        {field.options.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.type}
                        name={field.key}
                        value={formData[field.key]}
                        onChange={handleChange}
                        min={field.min}
                        max={field.max}
                        style={{
                          width: "100%",
                          padding: "0.75rem",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                          fontSize: "1rem",
                          transition: "border-color 0.3s ease, box-shadow 0.3s ease",
                        }}
                      />
                    )}
                    {/* Show error message if value is invalid */}
                    {field.type === "number" && (formData[field.key] < field.min || formData[field.key] > field.max) && (
                      <p style={{ color: "red", fontSize: "0.875rem", marginTop: "0.25rem" }}>
                        {`${field.label} must be between ${field.min} and ${field.max}.`}
                      </p>
                    )}
                  </div>
                ))
              }
            </div>
            <button
              onClick={handleSubmit}
              disabled={
                formData.physicalActivity < 5 ||
                formData.physicalActivity > 360 ||
                formData.dailySteps < 50 ||
                formData.dailySteps > 10000
              }
              style={{
                width: "100%",
                padding: "0.75rem",
                backgroundColor: "#3b82f6",
                color: "white",
                borderRadius: "8px",
                fontSize: "1rem",
                fontWeight: "500",
                marginTop: "1.5rem",
                transition: "background-color 0.3s ease",
                opacity: formData.physicalActivity < 5 || formData.dailySteps < 50 ? 0.5 : 1,
                cursor: formData.physicalActivity < 5 || formData.dailySteps < 50 ? "not-allowed" : "pointer",
              }}
            >
              Predict
            </button>
          </div>
        </div>
      )}

      {/* Loading Animation */}
      {isLoading && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1001,
          }}
        >
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Display Results */}
      {result && (
        <div style={{ marginTop: "1.5rem", padding: "1.5rem", backgroundColor: "#f9fafb", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#1f2937", marginBottom: "1rem" }}>Prediction: {result}</h2>
        </div>
      )}

      {/* Chatbot Interface */}
      <div style={{ position: "fixed", bottom: 70, left: 0, width: "100%", backgroundColor: "white", borderTop: "1px solid #e2e8f0", padding: "1rem" }}>
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <div style={{ maxHeight: "480px", overflowY: "auto", marginBottom: "1rem"}}>
            {chatHistory.map((chat, index) => (
              <div
                key={index}
                style={{
                  marginBottom: "0.5rem",
                  padding: "0.5rem",
                  backgroundColor: chat.role === "user" ? "#f3f4f6" : "#dbeafe",
                  borderRadius: "8px",
                  alignSelf: chat.role === "user" ? "flex-end" : "flex-start",
                  maxWidth: "80%",
                  marginLeft: chat.role === "user" ? "auto" : "0",
                }}
              >
                <p style={{ fontSize: "0.875rem", color: "#1f2937", whiteSpace: "pre-line" }}>
                  {chat.content.split("\n").map((line, i) => (
                    <span key={i}>
                      {line.startsWith("**") ? <strong>{line.replace(/\*\*/g, "")}</strong> : line}
                      <br />
                    </span>
                  ))}
                </p>
              </div>
            ))}
          </div>
          <form onSubmit={handleChatSubmit} style={{ display: "flex", gap: "0.5rem" }}>
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Type your message..."
              style={{
                flex: 1,
                padding: "0.75rem",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                fontSize: "1rem",
              }}
            />
            <button
              type="submit"
              style={{
                padding: "0.75rem 1.5rem",
                backgroundColor: "#3b82f6",
                color: "white",
                borderRadius: "8px",
                fontSize: "1rem",
                fontWeight: "500",
                transition: "background-color 0.3s ease",
              }}
            >
              Send
            </button>
          </form>
        </div>
      </div>

      <footer className="footer" style={{
        backgroundColor: "black",
        width: "100vw",
        color: "white",
        textAlign: "center",
        padding: "4px",
        fontSize: "0.9rem",
        position: "fixed",
        bottom: 0,
        left: 0,
        fontFamily: "Arial, sans-serif"
      }}>
        <p>&copy; 2025 SleepNova | All rights reserved.</p>
      </footer>
    </div>
  );
}
