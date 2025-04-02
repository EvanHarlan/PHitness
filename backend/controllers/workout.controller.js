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

  // Get the user ID from the request (assumes auth middleware adds user info)
  const userId = req.user?._id;

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
      systemPrompt = `You are a fitness coach providing exactly ONE workout routine with 6 exercises. 
      
You MUST return your response as valid, parseable JSON with the following structure:
{
  "workoutTitle": "String - workout title based on time, equipment, and goal",
  "workoutType": "String - category of workout based on goal",
  "estimatedCaloriesBurned": Number - realistic estimated calories burned for entire workout,
  "recommendedFrequency": "String - how often this workout should be performed per week",
  "exercises": [
    {
      "title": "String - name of exercise",
      "briefDescription": "String - one sentence description",
      "detailedDescription": "String - 2-3 sentences on proper form and benefits",
      "muscleGroups": ["String array of primary and secondary muscles worked"],
      "sets": Number,
      "reps": "String - can be a range or specific number",
      "estimatedCaloriesBurned": Number - realistic estimate per set,
      "difficultyLevel": "String - beginner, intermediate, or advanced",
      "youtubeUrl": "String - full URL to a tutorial from established fitness channels"
    }
  ]
}

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
      
      content = `Create ONE JSON workout routine with EXACTLY 6 exercises that fits these parameters:

Height: ${height}
Weight: ${weight} lbs
Age: ${age || "Not specified"}
Gender: ${gender || "Not specified"}
Goal: ${goalMap[fitnessGoal] || fitnessGoal}
Experience: ${experienceLevel.charAt(0).toUpperCase() + experienceLevel.slice(1)}
Equipment: ${equipmentMap[equipment] || equipment}
Time: ${timeFrameMap[timeFrame] || timeFrame}

Your response MUST be valid JSON following the specified schema.

For calorie estimates, use realistic values based on the exercise intensity, the user's weight (${weight} lbs), and approximate duration of each exercise.

For muscle groups, include all relevant primary and secondary muscles worked by the exercise.

For YouTube URLs, ONLY use videos from major fitness channels like Athlean-X, Jeff Nippard, Jeremy Ethier, FitnessBlender, or NASM. These channels have reliable, high-quality videos that won't be taken down.

Return ONLY the JSON with no additional text or explanations.`;
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
          content: systemPrompt
        },
        { 
          role: "user", 
          content: content 
        }
      ],
      response_format: isStructuredRequest ? { type: "json_object" } : undefined,
      max_tokens: 2000
    });
    
    // Get the response
    let responseContent = response.choices[0].message.content;
    
    if (isStructuredRequest) {
      try {
        // Parse the JSON response to validate it
        const workoutData = JSON.parse(responseContent);
        
        // Validate that the response has all required fields
        if (!workoutData.workoutTitle || !Array.isArray(workoutData.exercises) || workoutData.exercises.length !== 6) {
          console.error("Invalid workout data structure");
          
          // If structure is wrong, throw error to trigger fallback
          throw new Error("Invalid workout data structure");
        }
        
        // Ensure each exercise has all required fields
        workoutData.exercises.forEach((exercise, index) => {
          if (!exercise.title || !exercise.briefDescription || !exercise.detailedDescription || 
              !exercise.sets || !exercise.reps || !exercise.youtubeUrl) {
            console.error(`Exercise ${index + 1} is missing required fields`);
            throw new Error(`Exercise ${index + 1} is missing required fields`);
          }
          
          // Validate YouTube URL - must be from YouTube
          if (!exercise.youtubeUrl.includes('youtube.com/') && !exercise.youtubeUrl.includes('youtu.be/')) {
            exercise.youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(exercise.title + ' exercise tutorial')}`;
          }
        });

        // Add timestamp for database tracking
        workoutData.createdAt = new Date().toISOString();
        workoutData.userParameters = {
          height,
          weight,
          age: age || null,
          gender: gender || null,
          fitnessGoal,
          experienceLevel,
          equipment,
          timeFrame
        };
        
        // If user is authenticated, save the workout to the database
        let savedWorkout = null;
        if (userId) {
          try {
            // Add the user ID to the workout data
            workoutData.userId = userId;
            
            // Create a new workout document
            const workout = new Workout(workoutData);
            
            // Save to database
            savedWorkout = await workout.save();
            console.log(`Workout saved to database with ID: ${savedWorkout._id}`);
          } catch (dbError) {
            console.error("Error saving workout to database:", dbError);
            // Continue even if database save fails - still return the workout to user
          }
        }
        
        // Return the validated and enhanced workout data
        responseContent = JSON.stringify(workoutData);
        
        // Add the saved workout ID to the response if available
        return res.json({ 
          answer: responseContent,
          ...(savedWorkout && { workoutId: savedWorkout._id })
        });
        
      } catch (error) {
        console.error("Error processing workout JSON:", error);
        
        // If our JSON processing fails, create a basic error response
        return res.status(500).json({
          error: "Failed to generate valid workout data",
          message: error.message
        });
      }
    }
    
    console.log("Final response prepared");
    
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

// Additional helper functions for workout management

// Get all workouts for a user
export const getUserWorkouts = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const workouts = await Workout.find({ userId })
      .sort({ createdAt: -1 })
      .limit(req.query.limit ? parseInt(req.query.limit) : 20);
    
    res.json(workouts);
  } catch (error) {
    console.error("Error retrieving workouts:", error);
    res.status(500).json({ error: "Failed to retrieve workouts" });
  }
};

// Get a specific workout by ID
export const getWorkoutById = async (req, res) => {
  try {
    const userId = req.user._id;
    const workoutId = req.params.id;
    
    const workout = await Workout.findOne({ 
      _id: workoutId,
      userId // Security: ensure user owns this workout
    });
    
    if (!workout) {
      return res.status(404).json({ error: "Workout not found" });
    }
    
    res.json(workout);
  } catch (error) {
    console.error("Error retrieving workout:", error);
    res.status(500).json({ error: "Failed to retrieve workout" });
  }
};

// Delete a workout
export const deleteWorkout = async (req, res) => {
  try {
    const userId = req.user._id;
    const workoutId = req.params.id;
    
    const result = await Workout.deleteOne({
      _id: workoutId,
      userId // Security: ensure user owns this workout
    });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Workout not found or not authorized" });
    }
    
    res.json({ message: "Workout deleted successfully" });
  } catch (error) {
    console.error("Error deleting workout:", error);
    res.status(500).json({ error: "Failed to delete workout" });
  }
};

// Update a workout (e.g., mark as completed, add notes)
export const updateWorkout = async (req, res) => {
  try {
    const userId = req.user._id;
    const workoutId = req.params.id;
    const updates = req.body;
    
    // Remove fields that shouldn't be updated directly
    delete updates._id;
    delete updates.userId;
    delete updates.createdAt;
    
    const workout = await Workout.findOneAndUpdate(
      { _id: workoutId, userId },
      { $set: updates },
      { new: true, runValidators: true }
    );
    
    if (!workout) {
      return res.status(404).json({ error: "Workout not found or not authorized" });
    }
    
    res.json(workout);
  } catch (error) {
    console.error("Error updating workout:", error);
    res.status(500).json({ error: "Failed to update workout" });
  }
};