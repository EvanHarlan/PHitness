import OpenAI from "openai";
import Workout from "../models/workout.model.js";
import Tracker from "../models/tracker.model.js";

// handle user input, ai prompt, returned response and saving functionality
export default async (req, res) => {
  // Extract structured response from teh questionnaire users fill out
  const { 
    height, 
    weight, 
    age, 
    gender, 
    fitnessGoal, 
    experienceLevel, 
    equipment,
    timeFrame,
    healthConditions,
    frequency,
    question
  } = req.body;

  // Determine if we're handling a structured fitness request or a free-form question
  const isStructuredRequest = height && weight && fitnessGoal;
  
  if (!isStructuredRequest && !question) {
    return res.status(400).json({ error: "Either structured fitness parameters or a question is required" });
  }

  try {
    // Check if user has already generated a workout today
    if (isStructuredRequest) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tracker = await Tracker.findOne({ 
        user: req.user._id, 
        type: "workout",
        lastWorkoutGenerationDate: { $gte: today }
      });

      if (tracker) {
        return res.status(429).json({ 
          success: false,
          error: "You can only generate one workout per day. Please try again tomorrow." 
        });
      }
    }

    // define connection to OpenAI api for workout generation
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    let content; // user data
    let systemPrompt; // prompt sent to openai
    
    if (isStructuredRequest) {
      // prompt being sent to the OpenAI api providing user details and response format requirements
      systemPrompt = `You are a fitness coach providing exactly ONE workout routine. Your response should be detailed and comprehensive, focusing on content quality rather than styling.

RESPONSE FORMAT:
Provide a structured JSON response with the following fields (do not include HTML formatting or styling):
{
  "title": "Short title relative to the workout type and goal.",
  "exercises": [
    {
      "name": "Exercise Name",
      "sets": number,
      "reps": "number or range (e.g., '10-12')",
      "description": "Brief explanation of form and technique",
      "targetMuscles": "Main muscles worked",
      "videoKeywords": "Keywords for finding a tutorial video"
    }
  ],
  "notes": "Any special considerations or additional guidance",
  "difficulty": "A rating from 1-5 indicating workout difficulty",
  "estimatedCalories": "Estimated calories burned during the session",
  "restPeriods": "Recommended rest between sets/exercises",
  "progression": "How to progress this workout over time",
  "alternatives": {
    "beginner": "Simpler version of an exercise if needed",
    "advanced": "More challenging version if too easy"
  }
}

IMPORTANT GUIDELINES:
1. Include EXACTLY 5 exercises in your response
2. Ensure exercises are appropriate for the specified fitness goal and equipment availability
3. Consider health conditions and experience level when selecting exercises
4. Provide detailed but concise descriptions focused on proper form
5. Include specific sets and reps appropriate for the goal`;
      
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
      
      // Map health conditions
      const healthConditionMap = {
        'none': 'No health concerns',
        'back-pain': 'Back pain/injury (avoid exercises that strain the back)',
        'knee-pain': 'Knee pain/injury (avoid high-impact and heavy knee loading)',
        'shoulder-pain': 'Shoulder pain/injury (avoid overhead movements)',
        'heart-condition': 'Heart condition (focus on low to moderate intensity)',
        'pregnancy': 'Pregnancy (focus on safe, pregnancy-appropriate exercises)',
        'other': 'Unspecified health concern (focus on low-impact, safe movements)'
      };
      
      // Map frequency
      const frequencyMap = {
        '1-2': '1-2 times per week',
        '3-4': '3-4 times per week',
        '5-6': '5-6 times per week',
        'daily': 'Daily workouts'
      };
      
      // send information relative to the user inputs
      const healthInfo = healthConditions ? `Health Considerations: ${healthConditionMap[healthConditions] || healthConditions}\n` : '';
      const ageInfo = age ? `Age: ${age}\n` : '';
      const genderInfo = gender && gender !== 'not-specified' ? `Gender: ${gender.charAt(0).toUpperCase() + gender.slice(1)}\n` : '';
      const frequencyInfo = frequency ? `Workout Frequency: ${frequencyMap[frequency] || frequency}\n` : '';
      
      content = `Create ONE single workout routine with EXACTLY 5 exercises that fits these parameters:

Height: ${height}
Weight: ${weight} lbs
${ageInfo}${genderInfo}Goal: ${goalMap[fitnessGoal] || fitnessGoal}
Experience: ${experienceLevel.charAt(0).toUpperCase() + experienceLevel.slice(1)}
Equipment: ${equipmentMap[equipment] || equipment}
Time: ${timeFrameMap[timeFrame] || timeFrame}
${healthInfo}${frequencyInfo}

Include detailed form instructions, difficulty rating (1-5), recommended rest periods, progression options, and estimated calories burned. Also consider appropriate modifications for the specified health conditions if applicable.

Provide this workout as structured JSON with exactly 5 exercises - NO HTML formatting, NO styling tags.`;
    } else {
      // Handle free-form questions
      systemPrompt = "You are a knowledgeable fitness expert providing accurate, evidence-based information about exercise, nutrition, and wellness.";
      content = question;
    }
    
    // send response to openai - define model, prompt and user data
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
      max_tokens: 1000, // limit token usage
      response_format: isStructuredRequest ? { type: "json_object" } : { type: "text" } // formatted response to fit defined schema
    });
    
    let responseContent = response.choices[0].message.content;
    
    if (isStructuredRequest) {
      try {
        // parse json response returned from the openai api
        const workoutData = JSON.parse(responseContent);
        
        // map exercise information
        const exercises = workoutData.exercises.map(exercise => ({
          name: exercise.name,
          sets: parseInt(exercise.sets),
          reps: typeof exercise.reps === 'string' && exercise.reps.includes('-') 
            ? parseInt(exercise.reps.split('-')[0]) 
            : parseInt(exercise.reps),
          weight: 0,
          description: exercise.description,
          targetMuscles: exercise.targetMuscles,
          videoKeywords: exercise.videoKeywords
        }));

        // create workout based on response from openai
        const workout = new Workout({
          user: req.user._id,
          name: workoutData.title || `Custom ${timeFrame} ${fitnessGoal} Workout`,
          exercises,
          difficulty: workoutData.difficulty,
          estimatedCalories: workoutData.estimatedCalories,
          restPeriods: workoutData.restPeriods,
          notes: workoutData.notes,
          progression: workoutData.progression
        });

        await workout.save(); // save workout after generation

        // Update workout tracker with last generation date
        await Tracker.findOneAndUpdate(
          { user: req.user._id, type: "workout" },
          { 
            $inc: { amount: 1 },
            lastWorkoutGenerationDate: new Date()
          },
          { new: true, upsert: true }
        );
        // return generated workout
        return res.status(200).json({
          success: true,
          message: "Workout generated successfully",
          workoutPlan: workoutData,
          savedWorkout: workout
        });
      } catch (error) {
        return res.status(500).json({
          success: false,
          error: "Failed to process the workout data",
          details: error.message
        });
      }
    }
  } catch (error) {
    // openai api error handling
    if (error.response) {
      return res.status(500).json({
        success: false,
        error: "OpenAI API error",
        details: error.response.data
      });
    } else {
      return res.status(500).json({
        success: false,
        error: "Error fetching response from OpenAI",
        message: error.message
      });
    }
  }
};

// funtionality to handle favorites
export const toggleFavorite = async (req, res) => {
  try {
    const workoutId = req.params.id;
    
    // Find the workout and verify it belongs to the current user
    const workout = await Workout.findOne({ 
      _id: workoutId, 
      user: req.user._id 
    });
    
    if (!workout) {
      return res.status(404).json({ message: "Workout not found" });
    }
    
    // Toggle the favorite status
    workout.favorite = !workout.favorite;
    
    // Save the updated workout
    await workout.save();
    
    res.json({ 
      success: true, 
      favorite: workout.favorite,
      message: workout.favorite ? "Workout added to favorites" : "Workout removed from favorites"
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Failed to update favorite status" 
    });
  }
};