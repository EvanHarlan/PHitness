import { useState, useEffect } from "react"; 
import { COLORS } from '../lib/constants';
import axios from "axios";
import { Dumbbell, Utensils, Trophy } from "lucide-react";
import { useUserStore } from "../stores/useUserStore"; 
import { useMemo } from "react";


const ProfilePage = () =>
{
    const [workoutAmount, setWorkoutAmount] = useState(0);
    const [mealAmount, setMealAmount] = useState(0);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false); // State to toggle the edit form
    const [editedProfile, setEditedProfile] = useState({
        name: "",
        username: "",
        bio: "",
        age: ""
    });

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
                setEditedProfile({
                  name: profileResponse.data.name || "",
                  username: profileResponse.data.username || "",
                  bio: profileResponse.data.bio || "",
                  age: profileResponse.data.age || "",
              });

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

    const handleSaveChanges = async () => {
      try {
        const success = await useUserStore.getState().updateUserProfile(editedProfile);
        if (success) {
          // Get the updated user from the store
          setUser(useUserStore.getState().user);
          setIsEditing(false);
        } else {
          alert("Failed to save profile. Please try again.");
        }
      } catch (error) {
        console.error("Error saving profile:", error);
        alert("Failed to save profile. Please try again.");
      }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedProfile(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const achievements = useMemo(() => [
        { title: "Account Created", description: "Welcome to PHitness! Your journey begins here.", threshold: 0, count: 1 },
        { title: "Completed 1 Workout", description: "Your first workout completed!", threshold: 1, count: workoutAmount, iconType: "workout_bronze" },
        { title: "Completed 5 Workouts", description: "You're getting into the routine!", threshold: 5, count: workoutAmount, iconType: "workout_silver" },
        { title: "Completed 10 Workouts", description: "A true fitness enthusiast!", threshold: 10, count: workoutAmount, iconType: "workout_gold" },
        { title: "Completed 25 Workouts", description: "Dominating this routine!", threshold: 25, count: workoutAmount, iconType: "workout_diam" },
        { title: "Completed 50 Workouts", description: "You should go pro!", threshold: 50, count: workoutAmount, iconType: "workout_ruby" },
        { title: "Completed 100 Workouts", description: "A PHitness workout!", threshold: 100, count: workoutAmount, iconType: "workout_phit" },
        { title: "Created 1 Meal", description: "Your first meal tracked!", threshold: 1, count: mealAmount, iconType: "meal_bronze" },
        { title: "Created 5 Meals", description: "You're building healthy habits!", threshold: 5, count: mealAmount, iconType: "meal_silver" },
        { title: "Created 10 Meals", description: "A dedicated meal planner!", threshold: 10, count: mealAmount, iconType: "meal_gold" },
        { title: "Created 25 Meals", description: "A chef in the making!", threshold: 25, count: workoutAmount, iconType: "meal_diam" },
        { title: "Created 50 Meals", description: "The meal prep king!", threshold: 50, count: workoutAmount, iconType: "meal_ruby" },
        { title: "Created 100 Meals", description: "A Phitness meal planer!", threshold: 100, count: workoutAmount, iconType: "meal_phit" },
    ], [workoutAmount, mealAmount]);

    const { setUnlockedAchievement } = useUserStore();

    useEffect(() =>
    {
        if (!user) return;

        achievements.forEach(async (achievement) =>
        {
            const isAccountCreated = achievement.title === "Account Created";
            const alreadyShownAccountCreated = localStorage.getItem("shownAccountCreated");

            // If using backend tracking for other achievements:
            const alreadyUnlocked = user.achievements?.some(
                (a) => a.title === achievement.title
            );

            if (
                achievement.count >= achievement.threshold &&
                (
                    isAccountCreated
                        ? !alreadyShownAccountCreated
                        : !alreadyUnlocked
                )
            )
            {
                if (isAccountCreated)
                {
                    localStorage.setItem("shownAccountCreated", "true");
                } else
                {
                    try
                    {
                        await axios.post(
                            "http://localhost:5000/api/auth/unlock-achievement",
                            { title: achievement.title },
                            { withCredentials: true }
                        );
                    } catch (error)
                    {
                        console.error("Failed to save achievement:", error);
                    }
                }

                setUnlockedAchievement(achievement);
            }
        });
    }, [user, achievements, setUnlockedAchievement]);



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
      <div 
        className="flex flex-col p-6 rounded-lg"
        style={{ 
          backgroundColor: COLORS.MEDIUM_GRAY 
        }}
      >
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <img 
              src="../../public/profileIcon.png" 
              alt="Profile" 
              className="w-24 h-24 rounded-full mr-4"
            />
            {!isEditing ? (
              <div>
                <h2 
                  className="text-xl font-semibold"
                  style={{ color: COLORS.NEON_GREEN }}
                >
                  Name: {user?.name || "Guest"}
                </h2>
                <p className="text-[#B0B0B0]">Username: {user?.username || "No username provided"}</p>
                <p className="text-[#B0B0B0]">Email: {user?.email || "No email provided"}</p>
                <p className="text-[#B0B0B0]">Age: {user?.age || "No age provided"}</p>
                <p className="text-[#B0B0B0]">Bio: {user?.bio || "No bio provided"}</p>
              </div>
            ) : (
              <div className="flex-1">
                <div className="mb-2">
                  <label className="block text-sm" style={{ color: COLORS.NEON_GREEN }}>Name:</label>
                  <input
                    type="text"
                    name="name"
                    value={editedProfile.name}
                    onChange={handleInputChange}
                    className="w-full p-2 rounded bg-gray-800 text-white border"
                    style={{ borderColor: COLORS.NEON_GREEN }}
                  />
                </div>
                <div className="mb-2">
                  <label className="block text-sm" style={{ color: COLORS.NEON_GREEN }}>Username:</label>
                  <input
                    type="text"
                    name="username"
                    value={editedProfile.username}
                    onChange={handleInputChange}
                    className="w-full p-2 rounded bg-gray-800 text-white border"
                    style={{ borderColor: COLORS.NEON_GREEN }}
                  />
                </div>
                <div className="mb-2">
                  <label className="block text-sm" style={{ color: COLORS.NEON_GREEN }}>Age:</label>
                  <input
                    type="text"
                    name="age"
                    value={editedProfile.age}
                    onChange={handleInputChange}
                    className="w-full p-2 rounded bg-gray-800 text-white border"
                    style={{ borderColor: COLORS.NEON_GREEN }}
                  />
                </div>
                <div className="mb-2">
                  <label className="block text-sm" style={{ color: COLORS.NEON_GREEN }}>Bio:</label>
                  <textarea
                    name="bio"
                    value={editedProfile.bio}
                    onChange={handleInputChange}
                    className="w-full p-2 rounded bg-gray-800 text-white border"
                    style={{ borderColor: COLORS.NEON_GREEN }}
                    rows="3"
                  />
                </div>
              </div>
            )}
          </div>
          <div>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 rounded font-medium"
                style={{ 
                  backgroundColor: COLORS.NEON_GREEN,
                  color: COLORS.BLACK
                }}
              >
                Edit Profile
              </button>
            ) : (
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleSaveChanges}
                  className="px-4 py-2 rounded font-medium"
                  style={{ 
                    backgroundColor: COLORS.NEON_GREEN,
                    color: COLORS.BLACK
                  }}
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded font-medium"
                  style={{ 
                    backgroundColor: COLORS.DARK_GRAY,
                    color: COLORS.WHITE
                  }}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
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