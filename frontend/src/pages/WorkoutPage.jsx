import { COLORS } from '../lib/constants';
import axios from "axios";
import { useState } from "react";
import React from "react";

const WorkoutPage = () => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const handleQuestionChange = (e) => {
    setQuestion(e.target.value);
  };

  const askQuestion = async () => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/question', { question });
      setAnswer(response.data.answer);
    } catch (error) {
      console.error(error);
      setAnswer("An error has occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen p-6 md:p-8"
      style={{ 
        backgroundColor: COLORS.BLACK, 
        color: COLORS.WHITE 
      }}
    >
      <div className="container mx-auto">
        <h1 
          className="text-3xl md:text-4xl font-bold mb-4"
          style={{ color: COLORS.NEON_GREEN }}
        >
          Workout Page
        </h1>
        <p className="text-lg text-[#B0B0B0] mb-6">
          Custom tailored workout plans based on your goals.
        </p>
      </div>

      <div className="mb-6">
        <label className="block text-white text-sm font-bold mb-2">
          Ask a question:
        </label>
        <textarea 
          className="shadow appearance-none border rounded w-full py-2 px-3 text-black"
          rows={4}
          value={question}
          onChange={handleQuestionChange}
          placeholder="What workout is best for me?"
        />
        <button 
          className="mt-2 px-4 py-2 rounded font-bold"
          style={{ backgroundColor: COLORS.NEON_GREEN, color: COLORS.BLACK }}
          onClick={askQuestion}
          disabled={loading}
        >
          {loading ? "Processing..." : "Ask"}
        </button>
      </div>

      {loading && <div className="text-xl font-bold">Loading...</div>}
      
      {answer && (
        <div className="mt-4 p-4 rounded" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
          <strong className="block text-xl mb-2" style={{ color: COLORS.NEON_GREEN }}>
            Answer:
          </strong>
          <p className="text-lg">{answer}</p>
        </div>
      )}
    </div>
  );
};

export default WorkoutPage;
