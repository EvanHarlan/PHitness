import OpenAI from "openai";

export default async (req, res) => {
  const { question } = req.body;

  if (!question) {
    return res.status(400).json({ error: "Question is required" });
  }

  try {
    console.log("OpenAI API Key:", process.env.OPENAI_API_KEY ? "Found (starts with " + process.env.OPENAI_API_KEY.substring(0, 5) + "...)" : "Not found");
    
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    console.log("Sending request to OpenAI with model: gpt-3.5-turbo");
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // Using a standard model name
      messages: [
        { role: "user", content: question }
      ],
      max_tokens: 500
    });
    
    console.log("OpenAI response received:", JSON.stringify(response.choices[0].message));
    
    return res.json({ answer: response.choices[0].message.content });
  } catch (error) {
    console.error("OpenAI API error details:", error);
    
    // More specific error handling
    if (error.response) {
      console.error("OpenAI API response error:", error.response.data);
      return res.status(500).json({ 
        error: "OpenAI API error", 
        details: error.response.data 
      });
    } else {
      console.error("Error details:", error.message);
      return res.status(500).json({ 
        error: "Error fetching response from OpenAI",
        message: error.message
      });
    }
  }
};