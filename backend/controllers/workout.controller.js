import OpenAI from "openai";

export default async (req, res) => {
  // Extract structured parameters from request body
  const { 
    height, 
    weight, 
    age, 
    gender, 
    fitnessGoal, 
    experienceLevel, 
    equipment,
    timeFrame,
    question // Keep backward compatibility with free-form questions
  } = req.body;

  // Determine if we're handling a structured fitness request or a free-form question
  const isStructuredRequest = height && weight && fitnessGoal;
  
  if (!isStructuredRequest && !question) {
    return res.status(400).json({ error: "Either structured fitness parameters or a question is required" });
  }

  try {
    console.log("OpenAI API Key:", process.env.OPENAI_API_KEY ? "Found (starts with " + process.env.OPENAI_API_KEY.substring(0, 5) + "...)" : "Not found");
    
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    let content;
    let systemPrompt;
    
    if (isStructuredRequest) {
      // Using backticks for multi-line strings
      systemPrompt = `You are a fitness coach providing exactly ONE workout routine. You MUST follow this EXACT format for EVERY response without ANY deviation:

2. For EACH of the 6 exercises (you MUST provide EXACTLY 5 exercises):
   - Number each exercise (1-6)
   - Bold the exercise name
   - On the next line write 'Sets/Reps:' followed by the specific sets and reps
   - On the next line provide a link using format '<a href="YOUTUBE_URL" target="_blank" style="background-color: #39FF14; color: #000000; padding: 4px 8px; border-radius: 4px; font-weight: bold; text-decoration: none; display: inline-block; margin-top: 4px;">Watch Tutorial</a>'
   - Add a blank line after each exercise

EXTREMELY IMPORTANT: For your YouTube links, ONLY use videos from major fitness channels like Athlean-X, Jeff Nippard, Jeremy Ethier, FitnessBlender, or NASM. These are established channels with stable videos that won't be taken down. DO NOT use obscure or random videos as they might not exist.`;
      
      // Map coded values to human-readable text
      const goalMap = {
        'weight-loss': 'Weight Loss',
        'muscle-gain': 'Muscle Gain (Hypertrophy)',
        'strength': 'Strength Building',
        'endurance': 'Endurance and Stamina',
        'flexibility': 'Flexibility and Mobility',
        'overall-fitness': 'Overall Fitness and Health'
      };
      
      const equipmentMap = {
        'minimal': 'Minimal Home Equipment',
        'gym': 'Full Gym Access',
        'bodyweight': 'Bodyweight Exercises Only',
        'resistance-bands': 'Resistance Bands',
        'dumbbells': 'Dumbbells Only'
      };
      
      // Map time frame values to human-readable text
      const timeFrameMap = {
        '15-minutes': '15 Minute',
        '30-minutes': '30 Minute',
        '1-hour': '1 Hour',
        '2-hours': '2 Hour'
      };
      
      content = `Create ONE single workout routine with EXACTLY 5 exercises that fits these parameters:

Height: ${height}
Weight: ${weight} lbs
Goal: ${goalMap[fitnessGoal] || fitnessGoal}
Experience: ${experienceLevel.charAt(0).toUpperCase() + experienceLevel.slice(1)}
Equipment: ${equipmentMap[equipment] || equipment}
Time: ${timeFrameMap[timeFrame] || timeFrame}

You MUST follow this EXACT format without ANY deviation:
1. Start with a bolded title like "**[Time] [Equipment] [Goal] Workout**"
2. For EACH of the 6 exercises (you MUST provide EXACTLY 6 exercises):
   - Number each exercise (1-6)
   - Bold the exercise name
   - On the next line write 'Sets/Reps:' followed by the specific sets and reps
   - On the next line provide a link using format '<a href="YOUTUBE_URL" target="_blank" style="background-color: #39FF14; color: #000000; padding: 4px 8px; border-radius: 4px; font-weight: bold; text-decoration: none; display: inline-block; margin-top: 4px;">Watch Tutorial</a>'
   - Add a blank line after each exercise

EXTREMELY IMPORTANT: For the YouTube URLs, ONLY use videos from major fitness channels like Athlean-X, Jeff Nippard, Jeremy Ethier, FitnessBlender, or NASM. These channels have reliable, high-quality videos that won't be taken down.

DO NOT DEVIATE FROM THIS FORMAT. NO EXTRA TEXT. NO INTRODUCTION. NO CONCLUSION.`;
    } else {
      // Handle free-form questions
      systemPrompt = "You are a knowledgeable fitness expert providing accurate, evidence-based information about exercise, nutrition, and wellness.";
      content = question;
    }
    
    console.log(`Sending request to OpenAI with model: gpt-4o (${isStructuredRequest ? 'structured fitness plan' : 'free-form question'})`);
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: `${systemPrompt}\n\nIMPORTANT: For each exercise, provide a POPULAR YouTube tutorial video URL. Look for official fitness channels like Athlean-X, Jeff Nippard, Jeremy Ethier, FitnessBlender, or NASM. These are more likely to be stable, long-term videos that won't be taken down.` 
        },
        { 
          role: "user", 
          content: `${content}\n\nIMPORTANT: For EACH exercise, include a YouTube tutorial link from a POPULAR fitness channel (like Athlean-X, Jeff Nippard, etc.). Choose well-established videos with millions of views when possible, as these are less likely to be removed.` 
        }
      ],
      max_tokens: 500
    });
    
    // Get the initial response
    let responseContent = response.choices[0].message.content;
    
    // Check basic structure
    if (isStructuredRequest) {
      // Completely rewrite the response to ensure consistent formatting
      try {
        // Extract the original response components, but don't use any defaults
        const titleMatch = responseContent.match(/^\s*\*\*([^*]+)\*\*/);
        const title = titleMatch ? titleMatch[1].trim() : "";
        
        // Try to extract YouTube links from the response
        const urlRegex = /<a href="(https:\/\/www\.youtube\.com\/watch\?v=[^"]+)"/g;
        let extractedLinks = [];
        let match;
        while ((match = urlRegex.exec(responseContent)) !== null) {
          extractedLinks.push(match[1]);
        }
        
        // Extract exercises names
        const exerciseMatches = responseContent.match(/\d+\.\s+\*\*([^*]+)\*\*/g);
        let extractedExercises = [];
        if (exerciseMatches) {
          extractedExercises = exerciseMatches.map(match => {
            const name = match.replace(/\d+\.\s+\*\*/, "").replace(/\*\*$/, "").trim();
            return name;
          });
        }
        
        // Extract sets/reps information
        const setsRepsMatches = responseContent.match(/Sets\/Reps:\s*([^\n]+)/g);
        let extractedSetsReps = [];
        if (setsRepsMatches) {
          extractedSetsReps = setsRepsMatches.map(match => {
            return match.replace(/Sets\/Reps:\s*/, "").trim();
          });
        }
        
        // If we couldn't extract enough data, return the original AI response
        if (extractedExercises.length < 3) {
          console.log("Not enough exercises extracted, using original response");
          return res.json({ answer: responseContent });
        }
        
        // Build a formatted response with the AI's content
        let newResponse = title ? `**${title}**\n\n` : "";
        
        for (let i = 0; i < Math.min(extractedExercises.length, 5); i++) {
          const exerciseName = extractedExercises[i];
          const setsReps = i < extractedSetsReps.length ? extractedSetsReps[i] : "";
          const videoUrl = i < extractedLinks.length ? extractedLinks[i] : "";
          
          newResponse += `${i+1}. **${exerciseName}**\n`;
          if (setsReps) {
            newResponse += `Sets/Reps: ${setsReps}\n`;
          }
          if (videoUrl) {
            newResponse += `<a href="${videoUrl}" target="_blank" style="background-color: #39FF14; color: #000000; padding: 4px 8px; border-radius: 4px; font-weight: bold; text-decoration: none; display: inline-block; margin-top: 4px;">Watch Tutorial</a>\n\n`;
          } else {
            // If no video URL, recommend searching for the exercise on YouTube
            newResponse += `<a href="https://www.youtube.com/results?search_query=${encodeURIComponent(exerciseName + ' exercise tutorial')}" target="_blank" style="background-color: #39FF14; color: #000000; padding: 4px 8px; border-radius: 4px; font-weight: bold; text-decoration: none; display: inline-block; margin-top: 4px;">Watch Tutorial</a>\n\n`;
          }
        }
        
        // Update the response with our properly formatted version
        responseContent = newResponse.trim();
      } catch (error) {
        console.error("Error formatting workout response:", error);
        // If our formatting fails, just return the original response
      }
    }
    
    console.log("Final response prepared:", responseContent);
    
    return res.json({ answer: responseContent });
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