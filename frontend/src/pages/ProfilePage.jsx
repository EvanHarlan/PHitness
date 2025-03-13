import { useState, useEffect } from "react"; 
import { COLORS } from '../lib/constants';
import axios from "axios";
import { Dumbbell, Utensils, Trophy } from "lucide-react"; 

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
        { title: "Completed 1 Workout", description: "Your first workout completed!", threshold: 1, count: workoutAmount, iconType: "workout_bronze" },
        { title: "Completed 5 Workouts", description: "You're getting into the routine!", threshold: 5, count: workoutAmount, iconType: "workout_silver"  },
        { title: "Completed 10 Workouts", description: "A true fitness enthusiast!", threshold: 10, count: workoutAmount, iconType: "workout_gold"  },
        { title: "Completed 25 Workouts", description: "Dominating this routine!", threshold: 25, count: workoutAmount, iconType: "workout_diam"  },
        { title: "Completed 50 Workouts", description: "You should go pro!", threshold: 50, count: workoutAmount, iconType: "workout_ruby"  },
        { title: "Completed 100 Workouts", description: "A PHitness workout!", threshold: 100, count: workoutAmount, iconType: "workout_phit"  },
        { title: "Created 1 Meal", description: "Your first meal tracked!", threshold: 1, count: mealAmount, iconType: "meal_bronze" },
        { title: "Created 5 Meals", description: "You're building healthy habits!", threshold: 5, count: mealAmount, iconType: "meal_silver" },
        { title: "Created 10 Meals", description: "A dedicated meal planner!", threshold: 10, count: mealAmount, iconType: "meal_gold" },
        { title: "Created 25 Meals", description: "A chef in the making!", threshold: 25, count: workoutAmount, iconType: "meal_diam"},
        { title: "Created 50 Meals", description: "The meal prep king!", threshold: 50, count: workoutAmount, iconType: "meal_ruby" },
        { title: "Created 100 Meals", description: "A Phitness meal planer!", threshold: 100, count: workoutAmount, iconType: "meal_phit" },
    ];


    const AchievementIcon = ({ type, filled }) => {
      const color = filled ? "#FFD700" : COLORS.GRAY; 

    const icons = {
        account_made: <Trophy size={24} color={filled ? "#FFD700" : COLORS.GRAY} />,
        workout_bronze: <Dumbbell size={24} color={filled ? "#CD7F32" : COLORS.GRAY} />,  
        meal_bronze: <Utensils size={24} color={filled ? "#CD7F32" : COLORS.GRAY} />,
        milestone_bronze: <Trophy size={24} color={filled ? "#CD7F32" : COLORS.GRAY} />,
        workout_silver: <Dumbbell size={24} color={filled ? "#C0C0C0" : COLORS.GRAY} />,  
        meal_silver: <Utensils size={24} color={filled ? "#C0C0C0" : COLORS.GRAY} />,
        workout_gold: <Dumbbell size={24} color={filled ? "#FFD700" : COLORS.GRAY} />,  
        meal_gold: <Utensils size={24} color={filled ? "#FFD700" : COLORS.GRAY} />,
        workout_diam: <Dumbbell size={24} color={filled ? "#0F52BA" : COLORS.GRAY} />, 
        meal_diam: <Utensils size={24} color={filled ? "#0F52BA" : COLORS.GRAY} />,
        workout_ruby: <Dumbbell size={24} color={filled ? "#9B111E" : COLORS.GRAY} />,  
        meal_ruby: <Utensils size={24} color={filled ? "#9B111E" : COLORS.GRAY} />,
        workout_phit: <Dumbbell size={24} color={filled ? "#32CD32" : COLORS.GRAY} />,  
        meal_phit: <Utensils size={24} color={filled ? "#32CD32" : COLORS.GRAY} />,
         
         
      };
  
      return icons[type] || <Trophy size={24} color={color} />; 
  };
    

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
                      <AchievementIcon type={achievement.iconType} filled={achievement.count >= achievement.threshold} />
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