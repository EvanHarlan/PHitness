import { useState, useEffect } from "react"; 
import { COLORS } from '../lib/constants';
import axios from "axios";
import { Dumbbell, Utensils, Trophy } from "lucide-react";
import { useUserStore } from "../stores/useUserStore"; 
import { useMemo } from "react";
import PropTypes from "prop-types";
import { useNavigate } from 'react-router-dom';



const handleDeleteClick = () => {
  const confirmed = window.confirm(
    'Are you sure you want to delete your account? This action cannot be undone.'
  );
  if (confirmed) {
    handleDeleteAccount();
  }
};

const handleDeleteAccount = async () => {
  try {
    const res = await fetch('/api/auth/delete', {
      method: 'DELETE',
      credentials: 'include', 
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || 'Failed to delete account');
    }

   
    window.location.href = '/LoginPage'; 
  } catch (err) {
    console.error('Error deleting account:', err);
    alert('There was an error deleting your account.');
  }
};





const ProfilePage = () =>
{ 
    const navigate = useNavigate(); 
    
    const [workoutAmount, setWorkoutAmount] = useState(0);
    const [mealAmount, setMealAmount] = useState(0);
    const [maxLift, setMaxLift] = useState(0);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false); // State to toggle the edit form
    const [editedProfile, setEditedProfile] = useState({
        name: "",
        username: "",
        bio: "",
        age: "",
        avatar: ""
    });
    const profileEdited = localStorage.getItem("profileEdited") === "true";
    const [streak, setStreak] = useState(0);

    
  const handleNavigateClick = () => {
    console.log('Navigating to update profile...');
    navigate("/update-profile");   page
  };

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
                  avatar: profileResponse.data.avatar || "avatar1.png"

              });

                const countsResponse = await axios.get("http://localhost:5000/api/tracker/counts", {
                    withCredentials: true,
                });

                setWorkoutAmount(countsResponse.data.workoutCount || 0);
                setMealAmount(countsResponse.data.mealCount || 0);
                setMaxLift(profileResponse.data.maxLift || 0);

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
            localStorage.setItem("profileEdited", "true");
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

    useEffect(() =>
    {
        const storedStreak = parseInt(localStorage.getItem("workoutStreak") || "0", 10);
        setStreak(storedStreak);
    }, []);

    const avatarImages = {
      default: "/profileIcon.png",
      avatar1: "/avatar1.png",
      avatar2: "/avatar2.png",
      avatar3: "/avatar3.png",
      avatar4: "/avatar4.png",
      avatar5: "/avatar5.png",
      avatar6: "/avatar6.png",
      avatar7: "/avatar7.png",
      avatar8: "/avatar8.png",
      avatar9: "/avatar9.png",
      avatar10: "/avatar10.png",
      avatar11: "/avatar11.png",
      avatar12: "/avatar12.png",
      avatar13: "/avatar13.png",
      avatar14: "/avatar14.png",
      avatar15: "/avatar15.png",
      avatar16: "/avatar16.png",
      avatar17: "/avatar17.png",
      avatar18: "/avatar18.png",
    };

    const achievements = useMemo(() => [
        { title: "Account Created", description: "Welcome to PHitness! Your journey begins here.", threshold: 0, count: 1 },
        { title: "Profile Updated", description: "You've customed your profile. Make it yours!", threshold: 1, count: profileEdited ? 1 : 0, iconType: "milestone_bronze" },
        { title: `Max Lift: ${maxLift} lbs`, description: `Your highest recorded lift is ${maxLift} lbs.`, threshold: maxLift, count: maxLift, iconType: "workout_gold" },
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
        { title: "3-Day Workout Streak!", description: "You're building the habit! Keep it going!", threshold: 3, count: streak, iconType: "milestone_bronze" },
        { title: "7-Day Workout Streak!", description: "A full week of grind!", threshold: 7, count: streak, iconType: "milestone_silver" },
        { title: "14-Day Workout Streak!", description: "You're unstoppable!", threshold: 14, count: streak, iconType: "milestone_gold" },
        { title: "30-Day Workout Streak!", description: "A month of dedication! You're a beast!", threshold: 30, count: streak, iconType: "milestone_diam" },
        { title: "Weekend Warrior", description: "You worked out on the weekend. Thats dedication!", threshold: 1, count: workoutAmount, iconType: "milestone_bronze" },
        { title: "Early Bird", description: "Logged a workout before 6AM. Rise and grind!", threshold: 1, count: workoutAmount, iconType: "milestone_silver" },
        { title: "Late Owl", description: "Logged a workout after 10PM. Burning the midnight oil!", threshold: 1, count: workoutAmount, iconType: "milestone_gold" }
    ], [workoutAmount, mealAmount, maxLift, streak, profileEdited]);

    const { setUnlockedAchievement } = useUserStore();
    const categorizedAchievements = useMemo(() => ({
        General: achievements.filter(a => a.title === "Account Created" || a.title === "Profile Updated"),
        Workout: achievements.filter(a => a.title.includes("Workout") && !a.title.includes("Streak")),
        Meals: achievements.filter(a => a.title.includes("Meal")),
        Streaks: achievements.filter(a => a.title.includes("Streak")),
        Special: achievements.filter(a =>
            a.title === "Weekend Warrior" || a.title === "Early Bird" || a.title === "Late Owl"
        )
    }), [achievements]);


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

    AchievementIcon.propTypes = {
        type: PropTypes.string.isRequired,
        filled: PropTypes.bool.isRequired
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
              src={avatarImages[editedProfile.avatar] || avatarImages.default} 
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
                <div className="mb-2">
                <label className="block text-sm" style={{ color: COLORS.NEON_GREEN }}>Select Avatar:</label>
                <div className="flex gap-2 mt-2">
                {Object.entries(avatarImages).map(([key, src]) => (
                <img 
                key={key}
                src={src}
                alt={key}
                className={`w-16 h-16 rounded-full cursor-pointer border-2 ${editedProfile.avatar === key ? 'border-green-400' : 'border-transparent'}`}
                onClick={() => setEditedProfile(prev => ({ ...prev, avatar: key }))}
                />
                ))}
              </div>
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
                <button
                  onClick={handleDeleteClick}
                  className="px-4 py-2 rounded font-medium"
                  style={{
                  backgroundColor: 'red',
                  color: 'white',
                  }}
                  >     
                  Delete Account
                  </button>

              <div className="mt-4 space-y-3">
                <button
                onClick={handleNavigateClick}
                className="px-4 py-2 rounded font-medium"
                  style={{ 
                    backgroundColor: COLORS.NEON_GREEN,
                    color: COLORS.BLACK
                  }}
                >
                Update Email or Password
                </button>
              </div>
              </div>
            )}
          </div>
        </div>
            </div> {/* <- closing for the top container inside return */}

            <div className="mt-6">
                <h2 className="text-2xl font-bold mb-4" style={{ color: COLORS.NEON_GREEN }}>
                    Achievements
                </h2>

                {Object.entries(categorizedAchievements).map(([category, list]) => (
                    <div key={category} className="mb-6">
                        <h3 className="text-xl font-semibold mb-2" style={{ color: COLORS.WHITE }}>
                            {category} Achievements
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {list.map((achievement, index) => (
                                <div
                                    key={index}
                                    className="flex flex-col p-4 rounded-lg"
                                    style={{ backgroundColor: COLORS.DARK_GRAY }}
                                >
                                    <div className="flex items-center text-lg font-bold mb-2">
                                        <AchievementIcon
                                            type={achievement.iconType}
                                            filled={achievement.count >= achievement.threshold}
                                        />
                                        <span className="ml-2">{achievement.title}</span>
                                    </div>
                                    <p className="text-sm text-[#B0B0B0]">{achievement.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
  );
};

export default ProfilePage;
