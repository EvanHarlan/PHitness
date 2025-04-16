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
  const [exerciseTrackingData, setExerciseTrackingData] = useState({});

  useEffect(() => {
    if (workoutId) {
      fetchWorkoutDetails();
      fetchExerciseTrackingData();
    }
  }, [workoutId]);

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
      console.error('Error fetching workout details:', err);
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

  const fetchExerciseTrackingData = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/exercise-tracking/workout/${workoutId}`, {
        withCredentials: true,
      });
      
      if (response.data.success) {
        // Group tracking data by exercise ID
        const trackingByExercise = {};
        response.data.data.forEach(tracking => {
          trackingByExercise[tracking.exerciseId] = tracking;
        });
        setExerciseTrackingData(trackingByExercise);
      }
    } catch (error) {
      console.error('Error fetching exercise tracking data:', error);
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
        console.error('Error deleting workout:', error);
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
        // Update the tracking data state with the new progress
        setExerciseTrackingData(prevData => ({
          ...prevData,
          [progress.exerciseId]: {
            ...prevData[progress.exerciseId],
            timeSpent: progress.timeSpent,
            weight: progress.weight,
            reps: progress.reps
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
      console.error('Error saving exercise progress:', error);
      toast.error('Failed to save exercise progress', {
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
    <div className="p-6" style={{ backgroundColor: COLORS.DARK_GRAY, minHeight: '100vh' }}>
      <div className="mb-4 flex justify-between items-center">
        <button
          onClick={() => navigate('/workout')}
          className="px-3 py-1 rounded text-sm font-medium"
          style={{ backgroundColor: COLORS.MEDIUM_GRAY, color: COLORS.WHITE }}
        >
          Back to Workouts
        </button>
        <div className="flex space-x-2">
          <button
            onClick={() => deleteWorkout()}
            className="px-3 py-1 rounded text-sm font-medium"
            style={{ backgroundColor: '#e74c3c', color: COLORS.WHITE }}
          >
            Delete Workout
          </button>
        </div>
      </div>

      <div className="border rounded-lg p-6" style={{ borderColor: COLORS.MEDIUM_GRAY, backgroundColor: COLORS.DARK_GRAY }}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold" style={{ color: COLORS.WHITE }}>{workout.name}</h2>
        </div>

        {/* Workout Summary */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="rounded-lg p-4" style={{ backgroundColor: COLORS.BLACK }}>
            <div className="flex justify-between">
              <h3 className="text-sm uppercase font-medium" style={{ color: COLORS.LIGHT_GRAY }}>Difficulty</h3>
              {renderDifficultyIndicator(workout.difficulty)}
            </div>
          </div>
          <div className="rounded-lg p-4" style={{ backgroundColor: COLORS.BLACK }}>
            <h3 className="text-sm uppercase font-medium" style={{ color: COLORS.LIGHT_GRAY }}>Est. Calories</h3>
            <p className="text-lg font-medium" style={{ color: COLORS.WHITE }}>{workout.estimatedCalories || 'Not specified'}</p>
          </div>
          <div className="rounded-lg p-4" style={{ backgroundColor: COLORS.BLACK }}>
            <h3 className="text-sm uppercase font-medium" style={{ color: COLORS.LIGHT_GRAY }}>Rest Period</h3>
            <p className="text-lg font-medium" style={{ color: COLORS.WHITE }}>{workout.restPeriods || '60-90 seconds'}</p>
          </div>
          <div className="rounded-lg p-4" style={{ backgroundColor: COLORS.BLACK }}>
            <h3 className="text-sm uppercase font-medium" style={{ color: COLORS.LIGHT_GRAY }}>Total Time Spent</h3>
            <p className="text-lg font-medium" style={{ color: COLORS.WHITE }}>
              {Object.values(exerciseTrackingData).reduce((total, exercise) => total + (exercise.timeSpent || 0), 0)} min
            </p>
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
                className="border rounded-lg p-4"
                style={{ borderColor: COLORS.MEDIUM_GRAY, backgroundColor: COLORS.BLACK }}
              >
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-medium" style={{ color: COLORS.NEON_GREEN }}>
                    {exercise.name}
                  </h3>
                  <span
                    className="px-2 py-1 text-xs rounded"
                    style={{ backgroundColor: COLORS.MEDIUM_GRAY, color: COLORS.WHITE }}
                  >
                    {exercise.targetMuscles}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-3">
                  <div className="px-3 py-2 rounded" style={{ backgroundColor: COLORS.MEDIUM_GRAY }}>
                    <span className="text-sm" style={{ color: COLORS.LIGHT_GRAY }}>
                      Sets
                    </span>
                    <p className="text-xl font-semibold" style={{ color: COLORS.WHITE }}>
                      {exercise.sets}
                    </p>
                  </div>
                  <div className="px-3 py-2 rounded" style={{ backgroundColor: COLORS.MEDIUM_GRAY }}>
                    <span className="text-sm" style={{ color: COLORS.LIGHT_GRAY }}>
                      Reps
                    </span>
                    <p className="text-xl font-semibold" style={{ color: COLORS.WHITE }}>
                      {exercise.reps}
                    </p>
                  </div>
                  <div className="px-3 py-2 rounded" style={{ backgroundColor: COLORS.MEDIUM_GRAY }}>
                    <span className="text-sm" style={{ color: COLORS.LIGHT_GRAY }}>
                      Weight
                    </span>
                    <p className="text-xl font-semibold" style={{ color: COLORS.WHITE }}>
                      {exercise.weight || 0} lbs
                    </p>
                  </div>
                  <div className="px-3 py-2 rounded" style={{ backgroundColor: COLORS.MEDIUM_GRAY }}>
                    <span className="text-sm" style={{ color: COLORS.LIGHT_GRAY }}>
                      Time Spent
                    </span>
                    <p className="text-xl font-semibold" style={{ color: COLORS.WHITE }}>
                      {exerciseTrackingData[exercise._id]?.timeSpent || 0} min
                    </p>
                  </div>
                </div>

                {exercise.description && (
                  <div className="mt-3">
                    <button
                      className="flex items-center text-sm font-medium"
                      style={{ color: COLORS.LIGHT_GRAY }}
                      onClick={() => toggleDescription(index)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-4 w-4 mr-1 transition-transform ${showDescription[index] ? 'rotate-90' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                      {showDescription[index] ? 'Hide Description' : 'Show Description'}
                    </button>

                    {showDescription[index] && (
                      <div className="mt-2 p-3 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                        <p style={{ color: COLORS.WHITE }}>{exercise.description}</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    className="px-3 py-1 rounded text-sm font-medium flex items-center"
                    style={{ backgroundColor: COLORS.NEON_GREEN, color: COLORS.BLACK }}
                    onClick={() => handleStartExercise(exercise)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
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
                    className="px-3 py-1 rounded text-sm font-medium flex items-center"
                    style={{ backgroundColor: COLORS.MEDIUM_GRAY, color: COLORS.WHITE }}
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
                      className="h-4 w-4 mr-1"
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
                    className="px-3 py-1 rounded text-sm font-medium flex items-center"
                    style={{ backgroundColor: COLORS.MEDIUM_GRAY, color: COLORS.WHITE }}
                    onClick={() =>
                      window.open(
                        `https://www.google.com/search?q=${encodeURIComponent(exercise.name + ' proper form')}`,
                        '_blank'
                      )
                    }
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
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
            ))}
          </div>
        )}

        {activeTab === 'details' && (
          <div className="space-y-6">
            {/* Notes Section */}
            <div className="border rounded-lg p-4" style={{ borderColor: COLORS.MEDIUM_GRAY, backgroundColor: COLORS.BLACK }}>
              <h3 className="text-lg font-medium mb-3" style={{ color: COLORS.NEON_GREEN }}>
                Workout Notes
              </h3>
              <p style={{ color: COLORS.WHITE }}>{workout.notes || 'No specific notes for this workout.'}</p>
            </div>

            {/* Progression Section */}
            <div className="border rounded-lg p-4" style={{ borderColor: COLORS.MEDIUM_GRAY, backgroundColor: COLORS.BLACK }}>
              <h3 className="text-lg font-medium mb-3" style={{ color: COLORS.NEON_GREEN }}>
                Progression Plan
              </h3>
              <p style={{ color: COLORS.WHITE }}>{workout.progression || 'No progression plan specified for this workout.'}</p>
            </div>

            {/* Calendar Planning */}
            <div className="border rounded-lg p-4" style={{ borderColor: COLORS.MEDIUM_GRAY, backgroundColor: COLORS.BLACK }}>
              <h3 className="text-lg font-medium mb-3" style={{ color: COLORS.NEON_GREEN }}>
                Workout Schedule
              </h3>
              <div className="p-3 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                <div className="flex items-center mb-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    style={{ color: COLORS.NEON_GREEN }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span style={{ color: COLORS.WHITE }}>Schedule this workout in your weekly plan</span>
                </div>
                <button
                  className="w-full px-3 py-2 rounded text-sm font-medium mt-2"
                  style={{ backgroundColor: COLORS.MEDIUM_GRAY, color: COLORS.WHITE }}
                >
                  Add to Calendar (Coming Soon)
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'alternatives' && (
          <div className="space-y-6">
            {/* Beginner Alternatives */}
            <div className="border rounded-lg p-4" style={{ borderColor: COLORS.MEDIUM_GRAY, backgroundColor: COLORS.BLACK }}>
              <h3 className="text-lg font-medium mb-2" style={{ color: COLORS.NEON_GREEN }}>
                Beginner Modifications
              </h3>
              <div className="p-3 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                <p style={{ color: COLORS.WHITE }}>
                  {workout.alternatives?.beginner || 'No specific beginner modifications provided for this workout.'}
                </p>
              </div>
            </div>

            {/* Advanced Alternatives */}
            <div className="border rounded-lg p-4" style={{ borderColor: COLORS.MEDIUM_GRAY, backgroundColor: COLORS.BLACK }}>
              <h3 className="text-lg font-medium mb-2" style={{ color: COLORS.NEON_GREEN }}>
                Advanced Challenges
              </h3>
              <div className="p-3 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                <p style={{ color: COLORS.WHITE }}>
                  {workout.alternatives?.advanced || 'No specific advanced modifications provided for this workout.'}
                </p>
              </div>
            </div>

            {/* Equipment Alternatives */}
            <div className="border rounded-lg p-4" style={{ borderColor: COLORS.MEDIUM_GRAY, backgroundColor: COLORS.BLACK }}>
              <h3 className="text-lg font-medium mb-2" style={{ color: COLORS.NEON_GREEN }}>
                Equipment Alternatives
              </h3>
              <div className="p-3 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                <p style={{ color: COLORS.WHITE }}>
                  If you don't have access to all equipment needed for this workout, search for alternatives by clicking
                  on the exercise tutorials.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Start Workout Button - Keep this here */}
        <div className="mt-8 p-4 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
          <button
            className="px-6 py-3 rounded text-lg font-medium"
            style={{ backgroundColor: COLORS.NEON_GREEN, color: COLORS.BLACK }}
          >
            Start Workout
          </button>
        </div>
      </div>

      {trackingExercise && (
        <ExerciseTrackingModal
          exercise={trackingExercise}
          workoutId={workoutId}
          onClose={() => setTrackingExercise(null)}
        />
      )}
    </div>
  );
};

export default WorkoutDetailsPage;