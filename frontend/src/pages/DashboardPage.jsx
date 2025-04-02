import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';
import WorkoutGenerator from '../components/WorkoutGenerator';

const DashboardPage = () => {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/workouts');
        setWorkouts(response.data);
      } catch (err) {
        console.error('Error fetching workouts:', err);
        setError('Failed to load workouts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchWorkouts();
  }, []);
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Generator */}
          <div className="lg:col-span-1">
            <WorkoutGenerator />
          </div>
          
          {/* Right Column - Saved Workouts */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Saved Workouts</h2>
              
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <LoadingSpinner />
                </div>
              ) : error ? (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  <p>{error}</p>
                </div>
              ) : workouts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600">You don't have any saved workouts yet.</p>
                  <p className="text-gray-600 mt-2">Generate your first workout to get started!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {workouts.map((workout) => (
                    <Link 
                      key={workout._id} 
                      to={`/workouts/${workout._id}`}
                      className="block bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition duration-200"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-lg text-gray-800">{workout.workoutTitle}</h3>
                          <p className="text-gray-600 text-sm">{workout.workoutType}</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                              {workout.exercises.length} exercises
                            </span>
                            <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                              {workout.userParameters.timeFrame.replace('-', ' ')}
                            </span>
                            <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                              {workout.userParameters.fitnessGoal.replace('-', ' ')}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-gray-500 text-sm">{formatDate(workout.createdAt)}</span>
                          <p className="text-gray-700 font-medium mt-1">{workout.estimatedCaloriesBurned} cal</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;