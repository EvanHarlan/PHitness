import { useState, useEffect } from "react"; 
import { COLORS } from '../lib/constants';
import axios from "axios";

const ProfilePage = () =>
{
    const [workoutAmount, setWorkoutAmount] = useState(0);
    const [mealAmount, setMealAmount] = useState(0);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() =>
    {
        const fetchProfileAndCounts = async () =>
        {
            try
            {
                const profileResponse = await axios.get("http://localhost:5000/api/auth/profile", {
                    withCredentials: true,
                });

                setUser(profileResponse.data);

                const countsResponse = await axios.get("http://localhost:5000/api/tracker/counts", {
                    withCredentials: true,
                });

                setWorkoutAmount(countsResponse.data.workoutCount || 0);
                setMealAmount(countsResponse.data.mealCount || 0);
            }
            catch (error)
            {
                console.error("Error fetching profile:", error);
            }
            finally
            {
                setLoading(false);
            }
        };


        fetchProfileAndCounts();
    }, []);

    const achievements = [
        { title: "Account Created", description: "Welcome to PHitness! Your journey begins here.", threshold: 0, count: 1 },
        { title: "Completed 1 Workout", description: "Your first workout completed!", threshold: 1, count: workoutAmount },
        { title: "Completed 5 Workouts", description: "You're getting into the routine!", threshold: 5, count: workoutAmount },
        { title: "Completed 10 Workouts", description: "A true fitness enthusiast!", threshold: 10, count: workoutAmount },
        { title: "Created 1 Meal", description: "Your first meal tracked!", threshold: 1, count: mealAmount },
        { title: "Created 5 Meals", description: "You're building healthy habits!", threshold: 5, count: mealAmount },
        { title: "Created 10 Meals", description: "A dedicated meal planner!", threshold: 10, count: mealAmount },
    ];


    const StarIcon = ({ filled }) => (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill={filled ? "gold" : "COLORS.GRAY"}
            stroke="none"
            width="24"
            height="24"
            className="mr-2"
        >
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.62L12 2 9.19 8.62 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
    );

    if (loading)
    {
        return (
            <div
                className="min-h-screen flex justify-center items-center"
                style={{ backgroundColor: COLORS.BLACK, color: COLORS.WHITE }}
            >
                <p>Loading...</p>
            </div>
        );
    }

  return (
    <div 
      className="min-h-screen p-8"
      style={{ 
        backgroundColor: COLORS.BLACK, 
        color: COLORS.WHITE 
      }}
    >
      <h1 
        className="text-3xl mb-6"
        style={{ color: COLORS.NEON_GREEN }}
      >
        Profile Page
      </h1>
      <div 
        className="flex items-center p-6 rounded-lg"
        style={{ 
          backgroundColor: COLORS.MEDIUM_GRAY 
        }}
      >
        <img 
          src="/api/placeholder/96/96" 
          alt="Profile" 
          className="w-24 h-24 rounded-full mr-4 border-2"
          style={{ 
            borderColor: COLORS.NEON_GREEN 
          }}
        />
        <div>
          <h2 
            className="text-xl font-semibold"
            style={{ color: COLORS.NEON_GREEN }}
          >
                      Username: {user?.name || "Guest"}
          </h2>
                  <p className="text-[#B0B0B0]">Email: {user?.email || "No email provided"}</p>
        </div>
      </div>
          <div className="mt-6">
              <h2 className="text-2xl font-bold mb-4" style={{ color: COLORS.NEON_GREEN }} >
                  Achievements
              </h2>
              <ul>
              {achievements.map((achievement, index) => (
                  <li key={index} className="flex flex-col mb-4 p-3 rounded-lg" style={{ backgroundColor: COLORS.DARK_GRAY }}>
                      <div className="flex items-center text-lg font-bold">
                          <StarIcon filled={achievement.count >= achievement.threshold} />
                          {achievement.title}
                      </div>
                      <p className="text-sm text-[#B0B0B0] ml-8">{achievement.description}</p>
                  </li>
              ))}
              </ul>
          </div>
    </div>
  );
};

export default ProfilePage;