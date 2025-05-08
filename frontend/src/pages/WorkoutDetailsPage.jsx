import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import COLORS from '../lib/constants';
import ExerciseTrackingModal from '../components/ExerciseTrackingModal';

const WorkoutDetailsPage = () => {
  const { id: workoutId } = useParams();
  const navigate = useNavigate();
  const [workout, setWorkout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('exercises');
  const [showDescription, setShowDescription] = useState({});
  const [trackingExercise, setTrackingExercise] = useState(null);
  const [loggedExercises, setLoggedExercises] = useState(new Set());
  const [exerciseTrackingData, setExerciseTrackingData] = useState({});
  const [allExercisesCompleted, setAllExercisesCompleted] = useState(false);

  useEffect(() => {
    if (workoutId) {
      fetchWorkoutDetails();
      fetchLoggedExercises();
    }
  }, [workoutId]);

  useEffect(() => {
    if (workout && workout.exercises) {
      const completed = workout.exercises.every(exercise => loggedExercises.has(exercise._id));
      setAllExercisesCompleted(completed);
    }
  }, [workout, loggedExercises]);

  const fetchWorkoutDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/workouts/${workoutId}`, {
        withCredentials: true,
      });
      setWorkout(response.data);
      const descVisibility = {};
      response.data.exercises.forEach((_, index) => {
        descVisibility[index] = false;
      });
      setShowDescription(descVisibility);
      setError('');
    } catch (err) {
      setError('Failed to load workout details.');
      toast.error('Failed to load workout details', {
        style: {
          background: COLORS.DARK_GRAY,
          color: COLORS.WHITE,
          border: `1px solid ${COLORS.MEDIUM_GRAY}`,
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchLoggedExercises = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/exercise-tracking/workout/${workoutId}`, {
        withCredentials: true,
      });
      
      if (response.data.success) {
        const loggedIds = new Set(response.data.data.map(tracking => tracking.exerciseId));
        setLoggedExercises(loggedIds);
        
        // Store the tracking data for time spent calculations
        const trackingByExercise = {};
        response.data.data.forEach(tracking => {
          trackingByExercise[tracking.exerciseId] = tracking;
        });
        setExerciseTrackingData(trackingByExercise);
      }
    } catch (error) {
    }
  };

  const deleteWorkout = async () => {
    if (window.confirm('Are you sure you want to delete this workout?')) {
      try {
        await axios.delete(`http://localhost:5000/api/workouts/${workoutId}`, {
          withCredentials: true,
        });
        toast.success('Workout deleted successfully!', {
          style: {
            background: COLORS.DARK_GRAY,
            color: COLORS.NEON_GREEN,
            border: `1px solid ${COLORS.MEDIUM_GRAY}`,
          },
        });
        navigate('/workouts');
      } catch (error) {
        toast.error('Failed to delete workout.', {
          style: {
            background: COLORS.DARK_GRAY,
            color: COLORS.WHITE,
            border: `1px solid ${COLORS.MEDIUM_GRAY}`,
          },
        });
      }
    }
  };

  const toggleDescription = (index) => {
    setShowDescription((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const getDifficultyColor = (difficulty) => {
    const difficultyNum = parseInt(difficulty);
    if (difficultyNum <= 2) return '#4ade80'; // Easy - green
    if (difficultyNum <= 3) return '#facc15'; // Medium - yellow
    if (difficultyNum <= 4) return '#fb923c'; // Hard - orange
    return '#ef4444'; // Very hard - red
  };

  const renderDifficultyIndicator = (difficulty) => {
    const difficultyNum = parseInt(difficulty);
    const dots = [];
    const color = getDifficultyColor(difficulty);

    for (let i = 1; i <= 5; i++) {
      dots.push(
        <div
          key={i}
          className="w-3 h-3 rounded-full mx-0.5"
          style={{
            backgroundColor: i <= difficultyNum ? color : COLORS.MEDIUM_GRAY,
            opacity: i <= difficultyNum ? 1 : 0.3,
          }}
        />
      );
    }

    return (
      <div className="flex items-center">
        {dots}
        <span className="ml-2 text-sm" style={{ color: COLORS.LIGHT_GRAY }}>
          {difficultyNum <= 2 ? 'Beginner' :
            difficultyNum <= 3 ? 'Intermediate' :
              difficultyNum <= 4 ? 'Advanced' : 'Expert'}
        </span>
      </div>
    );
  };

  const handleStartExercise = (exercise) => {
    setTrackingExercise(exercise);
  };

  const handleSaveExerciseProgress = async (progress) => {
    try {
      const response = await axios.post(
        `http://localhost:5000/api/workouts/${workoutId}/exercises/${progress.exerciseId}/progress`,
        {
          weight: progress.weight,
          reps: progress.reps,
          timeSpent: progress.timeSpent
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        setLoggedExercises(prev => new Set([...prev, progress.exerciseId]));
        setExerciseTrackingData(prev => ({
          ...prev,
          [progress.exerciseId]: {
            ...prev[progress.exerciseId],
            timeSpent: progress.timeSpent
          }
        }));
        toast.success('Exercise progress saved successfully', {
          style: {
            background: COLORS.DARK_GRAY,
            color: COLORS.NEON_GREEN,
            border: `1px solid ${COLORS.MEDIUM_GRAY}`,
          },
        });
      }
    } catch (error) {
      toast.error('Failed to save exercise progress', {
        style: {
          background: COLORS.DARK_GRAY,
          color: COLORS.WHITE,
          border: `1px solid ${COLORS.MEDIUM_GRAY}`,
        },
      });
    }
  };

  const handleCompleteWorkout = async () => {
    try {
      const response = await axios.post(
        `http://localhost:5000/api/workouts/${workoutId}/complete`,
        {},
        { withCredentials: true }
      );

      if (response.data.success) {
        // Update workout count
        await axios.post(
          "http://localhost:5000/api/tracker",
          { type: "workout" },
          { withCredentials: true }
        );

        toast.success('Workout completed! Great job!', {
          style: {
            background: COLORS.DARK_GRAY,
            color: COLORS.NEON_GREEN,
            border: `1px solid ${COLORS.MEDIUM_GRAY}`,
          },
        });
        navigate('/workouts');
      }
    } catch (error) {
      toast.error('Failed to complete workout', {
        style: {
          background: COLORS.DARK_GRAY,
          color: COLORS.WHITE,
          border: `1px solid ${COLORS.MEDIUM_GRAY}`,
        },
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <svg
          className="animate-spin h-6 w-6 mr-3"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <span style={{ color: COLORS.WHITE }}>Loading workout details...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8" style={{ color: COLORS.LIGHT_GRAY }}>
        <p>{error}</p>
        <button
          className="mt-4 px-4 py-2 rounded"
          style={{ backgroundColor: COLORS.MEDIUM_GRAY, color: COLORS.WHITE }}
          onClick={() => navigate('/workouts')}
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!workout) {
    return (
      <div className="text-center py-8" style={{ color: COLORS.LIGHT_GRAY }}>
        <p>Workout not found</p>
        <button
          className="mt-4 px-4 py-2 rounded"
          style={{ backgroundColor: COLORS.MEDIUM_GRAY, color: COLORS.WHITE }}
          onClick={() => navigate('/workouts')}
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16" style={{ backgroundColor: COLORS.BLACK, color: COLORS.WHITE }}>
      {/* Header with blurred backdrop */}
      <header className="border-b mb-8" 
              style={{ 
                backgroundColor: `${COLORS.BLACK}E6`, 
                borderColor: COLORS.MEDIUM_GRAY,
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
              }}>
        <div className="max-w-6xl mx-auto p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: COLORS.NEON_GREEN }}>
                {workout.name}
              </h1>
              <p className="text-sm opacity-75">Created {new Date(workout.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <button 
                onClick={() => navigate('/workout')} 
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                style={{ backgroundColor: COLORS.DARK_GRAY, color: COLORS.WHITE, border: `1px solid ${COLORS.MEDIUM_GRAY}` }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="sm:hidden">Back</span>
              </button>
              <button
                onClick={() => deleteWorkout()}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                style={{ backgroundColor: '#e74c3c', color: COLORS.WHITE }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span className="sm:hidden">Delete</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6">
        {/* Summary card with workout stats */}
        <div className="mb-10 rounded-xl overflow-hidden shadow-lg" 
             style={{ backgroundColor: COLORS.DARK_GRAY, border: `1px solid ${COLORS.MEDIUM_GRAY}` }}>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-2">Workout Summary</h2>
            <p className="text-sm opacity-70 mb-6">Complete breakdown of your workout plan</p>
            
            <div className="grid md:grid-cols-4 gap-6">
              {/* Difficulty */}
              <div className="p-4 rounded-lg" style={{ backgroundColor: `${COLORS.BLACK}80` }}>
                <div className="flex items-center mb-2">
                  <div className="h-3 w-3 rounded-full mr-2" style={{ backgroundColor: COLORS.NEON_GREEN }}></div>
                  <span className="font-medium">Difficulty</span>
                </div>
                <div className="flex items-center">
                  {renderDifficultyIndicator(workout.difficulty)}
                </div>
              </div>
              
              {/* Calories */}
              <div className="p-4 rounded-lg" style={{ backgroundColor: `${COLORS.BLACK}80` }}>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-full mr-2" style={{ backgroundColor: "#E74C3C" }}></div>
                    <span className="font-medium">Calories</span>
                  </div>
                  <span>{workout.estimatedCalories || 'Not specified'}</span>
                </div>
              </div>
              
              {/* Rest Periods */}
              <div className="p-4 rounded-lg" style={{ backgroundColor: `${COLORS.BLACK}80` }}>
                <div className="flex items-center mb-2">
                  <div className="h-3 w-3 rounded-full mr-2" style={{ backgroundColor: "#3498DB" }}></div>
                  <span className="font-medium">Rest Periods</span>
                </div>
                <p className="text-sm" style={{ color: COLORS.WHITE }}>{workout.restPeriods || '60-90 seconds'}</p>
              </div>
              
              {/* Time Spent */}
              <div className="p-4 rounded-lg" style={{ backgroundColor: `${COLORS.BLACK}80` }}>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-full mr-2" style={{ backgroundColor: "#F39C12" }}></div>
                    <span className="font-medium">Time Spent</span>
                  </div>
                  <span>
                    {Object.values(exerciseTrackingData).reduce((total, exercise) => total + (exercise.timeSpent || 0), 0)} min
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="flex border-b mb-6" style={{ borderColor: COLORS.MEDIUM_GRAY }}>
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'exercises' ? 'border-b-2' : ''}`}
            style={{
              color: activeTab === 'exercises' ? COLORS.NEON_GREEN : COLORS.LIGHT_GRAY,
              borderColor: COLORS.NEON_GREEN,
            }}
            onClick={() => setActiveTab('exercises')}
          >
            Exercises
          </button>
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'details' ? 'border-b-2' : ''}`}
            style={{
              color: activeTab === 'details' ? COLORS.NEON_GREEN : COLORS.LIGHT_GRAY,
              borderColor: COLORS.NEON_GREEN,
            }}
            onClick={() => setActiveTab('details')}
          >
            Workout Details
          </button>
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'alternatives' ? 'border-b-2' : ''}`}
            style={{
              color: activeTab === 'alternatives' ? COLORS.NEON_GREEN : COLORS.LIGHT_GRAY,
              borderColor: COLORS.NEON_GREEN,
            }}
            onClick={() => setActiveTab('alternatives')}
          >
            Alternatives
          </button>
        </div>

        {/* Tab content */}
        {activeTab === 'exercises' && (
          <div className="space-y-6">
            {workout.exercises.map((exercise, index) => (
              <div
                key={index}
                className="rounded-xl overflow-hidden"
                style={{ backgroundColor: COLORS.DARK_GRAY, border: `1px solid ${COLORS.MEDIUM_GRAY}` }}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-semibold mb-2" style={{ color: COLORS.NEON_GREEN }}>
                        {exercise.name}
                      </h3>
                      {loggedExercises.has(exercise._id) && (
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-5 w-5" 
                          viewBox="0 0 20 20" 
                          fill={COLORS.NEON_GREEN}
                        >
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <button
                      onClick={() => toggleDescription(index)}
                      className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
                      style={{ color: COLORS.LIGHT_GRAY }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-5 w-5 transition-transform ${showDescription[index] ? 'rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>

                  <div className="mt-4 grid md:grid-cols-4 gap-4">
                    <div className="p-3 rounded-lg" style={{ backgroundColor: `${COLORS.BLACK}80` }}>
                      <span className="text-sm opacity-70">Sets</span>
                      <p className="text-xl font-semibold" style={{ color: COLORS.WHITE }}>
                        {exercise.sets}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg" style={{ backgroundColor: `${COLORS.BLACK}80` }}>
                      <span className="text-sm opacity-70">Reps</span>
                      <p className="text-xl font-semibold" style={{ color: COLORS.WHITE }}>
                        {exercise.reps}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg" style={{ backgroundColor: `${COLORS.BLACK}80` }}>
                      <span className="text-sm opacity-70">Weight</span>
                      <p className="text-xl font-semibold" style={{ color: COLORS.WHITE }}>
                        {exercise.weight || 0} lbs
                      </p>
                    </div>
                    <div className="p-3 rounded-lg" style={{ backgroundColor: `${COLORS.BLACK}80` }}>
                      <span className="text-sm opacity-70">Time Spent</span>
                      <p className="text-xl font-semibold" style={{ color: COLORS.WHITE }}>
                        {exerciseTrackingData[exercise._id]?.timeSpent || 0} min
                      </p>
                    </div>
                  </div>

                  {exercise.description && showDescription[index] && (
                    <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: `${COLORS.BLACK}80` }}>
                      <p style={{ color: COLORS.WHITE }}>{exercise.description}</p>
                    </div>
                  )}

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
                      style={{ backgroundColor: COLORS.NEON_GREEN, color: COLORS.BLACK }}
                      onClick={() => handleStartExercise(exercise)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      Log Exercise
                    </button>
                    <button
                      className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
                      style={{ backgroundColor: COLORS.BLACK, color: COLORS.WHITE, border: `1px solid ${COLORS.MEDIUM_GRAY}` }}
                      onClick={() =>
                        window.open(
                          `https://www.youtube.com/results?search_query=${encodeURIComponent(
                            exercise.videoKeywords || exercise.name + ' exercise tutorial'
                          )}`,
                          '_blank'
                        )
                      }
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                      Watch Tutorial
                    </button>
                    <button
                      className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
                      style={{ backgroundColor: COLORS.BLACK, color: COLORS.WHITE, border: `1px solid ${COLORS.MEDIUM_GRAY}` }}
                      onClick={() =>
                        window.open(
                          `https://www.google.com/search?q=${encodeURIComponent(exercise.name + ' proper form')}`,
                          '_blank'
                        )
                      }
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Form Guide
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'details' && (
          <div className="space-y-6">
            {/* Notes Section */}
            <div className="rounded-xl overflow-hidden" style={{ backgroundColor: COLORS.DARK_GRAY, border: `1px solid ${COLORS.MEDIUM_GRAY}` }}>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-3" style={{ color: COLORS.NEON_GREEN }}>
                  Workout Notes
                </h3>
                <div className="p-4 rounded-lg" style={{ backgroundColor: `${COLORS.BLACK}80` }}>
                  <p style={{ color: COLORS.WHITE }}>{workout.notes || 'No specific notes for this workout.'}</p>
                </div>
              </div>
            </div>

            {/* Progression Section */}
            <div className="rounded-xl overflow-hidden" style={{ backgroundColor: COLORS.DARK_GRAY, border: `1px solid ${COLORS.MEDIUM_GRAY}` }}>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-3" style={{ color: COLORS.NEON_GREEN }}>
                  Progression Plan
                </h3>
                <div className="p-4 rounded-lg" style={{ backgroundColor: `${COLORS.BLACK}80` }}>
                  <p style={{ color: COLORS.WHITE }}>{workout.progression || 'No progression plan specified for this workout.'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'alternatives' && (
          <div className="space-y-6">
            {/* Beginner Alternatives */}
            <div className="rounded-xl overflow-hidden" style={{ backgroundColor: COLORS.DARK_GRAY, border: `1px solid ${COLORS.MEDIUM_GRAY}` }}>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-3" style={{ color: COLORS.NEON_GREEN }}>
                  Beginner Modifications
                </h3>
                <div className="p-4 rounded-lg" style={{ backgroundColor: `${COLORS.BLACK}80` }}>
                  <p style={{ color: COLORS.WHITE }}>
                    {workout.alternatives?.beginner || 'No specific beginner modifications provided for this workout.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Advanced Alternatives */}
            <div className="rounded-xl overflow-hidden" style={{ backgroundColor: COLORS.DARK_GRAY, border: `1px solid ${COLORS.MEDIUM_GRAY}` }}>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-3" style={{ color: COLORS.NEON_GREEN }}>
                  Advanced Challenges
                </h3>
                <div className="p-4 rounded-lg" style={{ backgroundColor: `${COLORS.BLACK}80` }}>
                  <p style={{ color: COLORS.WHITE }}>
                    {workout.alternatives?.advanced || 'No specific advanced modifications provided for this workout.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Equipment Alternatives */}
            <div className="rounded-xl overflow-hidden" style={{ backgroundColor: COLORS.DARK_GRAY, border: `1px solid ${COLORS.MEDIUM_GRAY}` }}>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-3" style={{ color: COLORS.NEON_GREEN }}>
                  Equipment Alternatives
                </h3>
                <div className="p-4 rounded-lg" style={{ backgroundColor: `${COLORS.BLACK}80` }}>
                  <p style={{ color: COLORS.WHITE }}>
                    If you don't have access to all equipment needed for this workout, search for alternatives by clicking
                    on the exercise tutorials.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Start Workout Button */}
        <div className="mt-8 p-6 rounded-xl overflow-hidden flex items-center justify-center" 
             style={{ backgroundColor: COLORS.DARK_GRAY, border: `1px solid ${COLORS.MEDIUM_GRAY}` }}>
          <button
            className={`px-8 py-3 rounded-lg text-lg font-medium flex items-center gap-2 transition-all duration-300 ${
              allExercisesCompleted ? 'opacity-100' : 'opacity-50 cursor-not-allowed'
            }`}
            style={{ 
              backgroundColor: allExercisesCompleted ? COLORS.NEON_GREEN : COLORS.MEDIUM_GRAY,
              color: COLORS.BLACK,
              pointerEvents: allExercisesCompleted ? 'auto' : 'none'
            }}
            onClick={handleCompleteWorkout}
          >
            Complete Workout
          </button>
        </div>
      </div>

      {trackingExercise && (
        <ExerciseTrackingModal
          exercise={trackingExercise}
          workoutId={workoutId}
          onClose={() => setTrackingExercise(null)}
          onSave={handleSaveExerciseProgress}
        />
      )}
    </div>
  );
};

export default WorkoutDetailsPage;