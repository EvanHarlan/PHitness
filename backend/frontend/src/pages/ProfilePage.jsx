import { useState, useEffect } from "react"; 
import { COLORS } from '../lib/constants';
import axios from "axios";
import { Dumbbell, Utensils, Trophy } from "lucide-react";
import { useUserStore } from "../stores/useUserStore"; 
import { useMemo } from "react";
import PropTypes from "prop-types";
import { useNavigate } from 'react-router-dom';
//PROFILE PAGE 
 
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
     alert('There was an error deleting your account.');
   }
 };

const ProfilePage = () => {
    const navigate = useNavigate(); 
    const [workoutAmount, setWorkoutAmount] = useState(0);
    const [mealAmount, setMealAmount] = useState(0);
    const [maxLift, setMaxLift] = useState(0);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editedProfile, setEditedProfile] = useState({
        name: "",
        username: "",
        bio: "",
        age: "",
        avatar: "",
        height: "",
        weight: "",
        gender: "not-specified",
        experienceLevel: "beginner",
        healthConditions: "none",
        fitnessGoal: ""
    });
    const profileEdited = localStorage.getItem("profileEdited") === "true";
    const [streak, setStreak] = useState(0);
    const [isMobile, setIsMobile] = useState(false);


    const heightOptions = [
        { value: "", label: "Select your height" },
        ...[...Array(37)].map((_, i) =>
        {
            const feet = Math.floor((i + 60) / 12);
            const inches = (i + 60) % 12;
            const height = `${feet}'${inches}"`;
            return { value: height, label: height };
        })
    ];

    const handleNavigateClick = () => {
        navigate("/update-profile");  
      };


    // Detect mobile devices
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        handleResize();
        window.addEventListener('resize', handleResize);
        
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Adjust animation settings for mobile
    const animationSettings = {
        duration: isMobile ? 0.5 : 0.8,
        delay: isMobile ? 0.1 : 0.2
    };

    useEffect(() => {
        const fetchProfileAndCounts = async () => {
            try {
                const profileResponse = await axios.get("/api/auth/profile", {
                    withCredentials: true,
                });

                setUser(profileResponse.data);
                setEditedProfile({
                    name: profileResponse.data.name || "",
                    username: profileResponse.data.username || "",
                    bio: profileResponse.data.bio || "",
                    age: profileResponse.data.age || "",
                    avatar: profileResponse.data.avatar || "avatar1.png",
                    height: profileResponse.data.height || "",
                    weight: profileResponse.data.weight || "",
                    gender: profileResponse.data.gender || "not-specified",
                    experienceLevel: profileResponse.data.experienceLevel || "beginner",
                    healthConditions: profileResponse.data.healthConditions || "none",
                    fitnessGoal: profileResponse.data.fitnessGoal || ""
                });

                const countsResponse = await axios.get("/api/tracker/counts", {
                    withCredentials: true,
                });

                setWorkoutAmount(countsResponse.data.workoutCount || 0);
                setMealAmount(countsResponse.data.mealCount || 0);
                setMaxLift(profileResponse.data.maxLift || 0);
            }
            catch (error) {
            }
            finally {
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

    useEffect(() => {
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
        { title: "Created 25 Meals", description: "A chef in the making!", threshold: 25, count: mealAmount, iconType: "meal_diam" },
        { title: "Created 50 Meals", description: "The meal prep king!", threshold: 50, count: mealAmount, iconType: "meal_ruby" },
        { title: "Created 100 Meals", description: "A Phitness meal planer!", threshold: 100, count: mealAmount, iconType: "meal_phit" },
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
        Workout: achievements.filter(a => (a.title.includes("Workout") && !a.title.includes("Streak")) || a.title.includes("Max Lift")),
        Meals: achievements.filter(a => a.title.includes("Meal")),
        Streaks: achievements.filter(a => a.title.includes("Streak")),
        Special: achievements.filter(a =>
            a.title === "Weekend Warrior" || a.title === "Early Bird" || a.title === "Late Owl"
        )
    }), [achievements]);

    useEffect(() => {
        if (!user) return;

        achievements.forEach(async (achievement) => {
            const isAccountCreated = achievement.title === "Account Created";
            const alreadyShownAccountCreated = localStorage.getItem("shownAccountCreated");

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
            ) {
                if (isAccountCreated) {
                    localStorage.setItem("shownAccountCreated", "true");
                } else {
                    try {
                        await axios.post(
                            "/api/auth/unlock-achievement",
                            { title: achievement.title },
                            { withCredentials: true }
                        );
                    } catch (error) {
                    }
                }
                setUnlockedAchievement(achievement);
            }
        });
    }, [user, achievements, setUnlockedAchievement]);

    const AchievementIcon = ({ type, filled }) => {
        const color = filled ? "#FFD700" : COLORS.GRAY;

        const icons = {
            account_made: <Trophy size={isMobile ? 20 : 24} color={filled ? "#FFD700" : COLORS.GRAY} />,
            workout_bronze: <Dumbbell size={isMobile ? 20 : 24} color={filled ? "#CD7F32" : COLORS.GRAY} />,
            meal_bronze: <Utensils size={isMobile ? 20 : 24} color={filled ? "#CD7F32" : COLORS.GRAY} />,
            milestone_bronze: <Trophy size={isMobile ? 20 : 24} color={filled ? "#CD7F32" : COLORS.GRAY} />,
            workout_silver: <Dumbbell size={isMobile ? 20 : 24} color={filled ? "#C0C0C0" : COLORS.GRAY} />,
            meal_silver: <Utensils size={isMobile ? 20 : 24} color={filled ? "#C0C0C0" : COLORS.GRAY} />,
            workout_gold: <Dumbbell size={isMobile ? 20 : 24} color={filled ? "#FFD700" : COLORS.GRAY} />,
            meal_gold: <Utensils size={isMobile ? 20 : 24} color={filled ? "#FFD700" : COLORS.GRAY} />,
            workout_diam: <Dumbbell size={isMobile ? 20 : 24} color={filled ? "#0F52BA" : COLORS.GRAY} />,
            meal_diam: <Utensils size={isMobile ? 20 : 24} color={filled ? "#0F52BA" : COLORS.GRAY} />,
            workout_ruby: <Dumbbell size={isMobile ? 20 : 24} color={filled ? "#9B111E" : COLORS.GRAY} />,
            meal_ruby: <Utensils size={isMobile ? 20 : 24} color={filled ? "#9B111E" : COLORS.GRAY} />,
            workout_phit: <Dumbbell size={isMobile ? 20 : 24} color={filled ? "#32CD32" : COLORS.GRAY} />,
            meal_phit: <Utensils size={isMobile ? 20 : 24} color={filled ? "#32CD32" : COLORS.GRAY} />,
        };

        return icons[type] || <Trophy size={isMobile ? 20 : 24} color={color} />;
    };

    AchievementIcon.propTypes = {
        type: PropTypes.string.isRequired,
        filled: PropTypes.bool.isRequired
    };

    if (loading) {
        return (
            <div
                className="min-h-screen flex justify-center items-center p-4"
                style={{ backgroundColor: COLORS.BLACK, color: COLORS.WHITE }}
            >
                <div className="flex items-center">
                    <svg className="animate-spin h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-base sm:text-lg">Loading your profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div 
            className="min-h-screen p-4 sm:p-8"
            style={{ 
                backgroundColor: COLORS.BLACK, 
                color: COLORS.WHITE 
            }}
        >
            <div 
                className="flex flex-col p-4 sm:p-6 rounded-lg"
                style={{ 
                    backgroundColor: COLORS.MEDIUM_GRAY 
                }}
            >
                <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center mb-4 sm:mb-0">
                        <img 
                            src={avatarImages[editedProfile.avatar] || avatarImages.default} 
                            alt="Profile" 
                            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full mx-auto sm:mx-0 sm:mr-4 mb-4 sm:mb-0"
                        />
                        {!isEditing ? (
                            <div>
                                <h2 
                                    className="text-lg sm:text-xl font-semibold text-center sm:text-left"
                                    style={{ color: COLORS.NEON_GREEN }}
                                >
                                    Name: {user?.name || "Guest"}
                                </h2>
                                <p className="text-sm sm:text-base text-[#B0B0B0] text-center sm:text-left">
                                    Username: {user?.username || "No username provided"}
                                </p>
                                <p className="text-sm sm:text-base text-[#B0B0B0] text-center sm:text-left">
                                    Email: {user?.email || "No email provided"}
                                </p>
                                <p className="text-sm sm:text-base text-[#B0B0B0] text-center sm:text-left">
                                    Age: {user?.age || "No age provided"}
                                </p>
                                <p className="text-sm sm:text-base text-[#B0B0B0] text-center sm:text-left">
                                    Bio: {user?.bio || "No bio provided"}
                                </p>
                                <a href="https://www.flaticon.com/free-icons/profile" title="profile icons">Profile icons created by KP Arts - Flaticon</a>
                            </div>
                        ) : (
                            <div className="flex flex-col sm:flex-row gap-6 w-full">
                             
                                <div className="flex-1 space-y-3">
                            
                                <div className="mb-2">
                                    <label className="block text-xs sm:text-sm" style={{ color: COLORS.NEON_GREEN }}>Name:</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={editedProfile.name}
                                        onChange={handleInputChange}
                                        className="w-full p-2 rounded bg-gray-800 text-white border text-sm sm:text-base"
                                        style={{ borderColor: COLORS.NEON_GREEN }}
                                    />
                                </div>

                                <div className="mb-2">
                                    <label className="block text-xs sm:text-sm" style={{ color: COLORS.NEON_GREEN }}>Username:</label>
                                    <input
                                        type="text"
                                        name="username"
                                        value={editedProfile.username}
                                        onChange={handleInputChange}
                                        className="w-full p-2 rounded bg-gray-800 text-white border text-sm sm:text-base"
                                        style={{ borderColor: COLORS.NEON_GREEN }}
                                    />
                                </div>
   
                                <div className="mb-2">
                                    <label className="block text-xs sm:text-sm" style={{ color: COLORS.NEON_GREEN }}>Age:</label>
                                    <input
                                        type="text"
                                        name="age"
                                        value={editedProfile.age}
                                        onChange={handleInputChange}
                                        className="w-full p-2 rounded bg-gray-800 text-white border text-sm sm:text-base"
                                        style={{ borderColor: COLORS.NEON_GREEN }}
                                    />
                                </div>
                       
                                <div className="mb-2">
                                    <label className="block text-xs sm:text-sm" style={{ color: COLORS.NEON_GREEN }}>Bio:</label>
                                    <textarea
                                        name="bio"
                                        value={editedProfile.bio}
                                        onChange={handleInputChange}
                                        className="w-full p-2 rounded bg-gray-800 text-white border text-sm sm:text-base"
                                        style={{ borderColor: COLORS.NEON_GREEN }}
                                        rows="3"
                                    />
                                  </div>
                                </div>

                                <div className="flex-1 space-y-3">

                                <div className="mb-2">
                                    <label className="block text-xs sm:text-sm" style={{ color: COLORS.NEON_GREEN }}>Height:</label>
                                    <select
                                        name="height"
                                        value={editedProfile.height}
                                        onChange={handleInputChange}
                                        className="w-full p-2 rounded bg-gray-800 text-white border text-sm sm:text-base"
                                        style={{ borderColor: COLORS.NEON_GREEN }}
                                    >
                                        {heightOptions.map((option, index) => (
                                            <option key={index} value={option.value}>{option.label}</option>
                                        ))}
                                    </select>
                                </div>


                                <div className="mb-2">
                                    <label className="block text-xs sm:text-sm" style={{ color: COLORS.NEON_GREEN }}>Weight (lbs):</label>
                                    <input
                                        type="number"
                                        name="weight"
                                        value={editedProfile.weight}
                                        onChange={handleInputChange}
                                        className="w-full p-2 rounded bg-gray-800 text-white border text-sm sm:text-base"
                                        style={{ borderColor: COLORS.NEON_GREEN }}
                                    />
                                </div>


                                <div className="mb-2">
                                    <label className="block text-xs sm:text-sm" style={{ color: COLORS.NEON_GREEN }}>Gender:</label>
                                    <select
                                        name="gender"
                                        value={editedProfile.gender}
                                        onChange={handleInputChange}
                                        className="w-full p-2 rounded bg-gray-800 text-white border text-sm sm:text-base"
                                        style={{ borderColor: COLORS.NEON_GREEN }}
                                    >
                                        <option value="not-specified">Prefer not to say</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>

                                <div className="mb-2">
                                    <label className="block text-xs sm:text-sm" style={{ color: COLORS.NEON_GREEN }}>Select Avatar:</label>
                                    <div className="mt-2">
            
                                        <div className="flex items-center mb-2">
                                            <img 
                                                src={avatarImages[editedProfile.avatar] || avatarImages.default} 
                                                alt="Selected avatar" 
                                                className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 border-green-400 mr-2"
                                            />
                                            <button
                                                type="button"
                                                className="px-3 py-2 rounded-lg text-xs sm:text-sm min-h-[44px] bg-gray-700 text-white flex items-center"
                                                onClick={() => document.getElementById('avatarModal').classList.remove('hidden')}
                                            >
                                                Change Avatar
                                            </button>
                                        </div>
                                        
                          
                                        <div id="avatarModal" className="hidden fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-75">
                                            <div 
                                                className="relative bg-gray-800 rounded-lg p-4 w-11/12 max-w-lg max-h-[80vh] overflow-y-auto"
                                                style={{ borderColor: COLORS.NEON_GREEN, borderWidth: '2px' }}
                                            >
                                                <h3 
                                                    className="text-base sm:text-lg font-bold mb-3 text-center"
                                                    style={{ color: COLORS.NEON_GREEN }}
                                                >
                                                    Choose Your Avatar
                                                </h3>
                                                
                                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-3">
                                                    {Object.entries(avatarImages).map(([key, src]) => (
                                                        <div 
                                                            key={key} 
                                                            className={`flex flex-col items-center p-2 rounded-lg cursor-pointer ${editedProfile.avatar === key ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
                                                            onClick={() => {
                                                                setEditedProfile(prev => ({ ...prev, avatar: key }));
                                                            }}
                                                        >
                                                            <img 
                                                                src={src}
                                                                alt={key}
                                                                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full ${editedProfile.avatar === key ? 'border-2 border-green-400' : ''}`}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                                
                                                <div className="flex justify-center">
                                                    <button
                                                        type="button"
                                                        className="px-4 py-2 rounded-lg font-medium text-xs sm:text-sm min-h-[44px]"
                                                        style={{ backgroundColor: COLORS.NEON_GREEN, color: COLORS.BLACK }}
                                                        onClick={() => document.getElementById('avatarModal').classList.add('hidden')}
                                                    >
                                                        Done
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="flex justify-center sm:justify-end">
                        {!isEditing ? (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="px-3 sm:px-4 py-2 rounded font-medium text-xs sm:text-sm min-h-[44px]"
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
                                    className="px-3 sm:px-4 py-2 rounded font-medium text-xs sm:text-sm min-h-[44px]"
                                    style={{ 
                                        backgroundColor: COLORS.NEON_GREEN,
                                        color: COLORS.BLACK
                                    }}
                                >
                                    Save Changes
                                </button>
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="px-3 sm:px-4 py-2 rounded font-medium text-xs sm:text-sm min-h-[44px]"
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
            </div>

            <div className="mt-4 sm:mt-6">
                <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4" style={{ color: COLORS.NEON_GREEN }}>
                    Achievements
                </h2>
                <a href="https://www.flaticon.com/free-icons/profile" title="profile icons">Profile icons created by KP Arts - Flaticon</a>

                {Object.entries(categorizedAchievements).map(([category, list]) => (
                    <div key={category} className="mb-4 sm:mb-6">
                        <h3 className="text-lg sm:text-xl font-semibold mb-2" style={{ color: COLORS.WHITE }}>
                            {category} Achievements
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                            {list.map((achievement, index) => (
                                <div
                                    key={index}
                                    className="flex flex-col p-3 sm:p-4 rounded-lg"
                                    style={{ backgroundColor: COLORS.DARK_GRAY }}
                                >
                                    <div className="flex items-center text-base sm:text-lg font-bold mb-1 sm:mb-2">
                                        <AchievementIcon
                                            type={achievement.iconType}
                                            filled={achievement.title === "Early Bird"
                                                ? localStorage.getItem("earlyBirdUnlocked") === "true"
                                                : achievement.title === "Late Owl"
                                                ? localStorage.getItem("lateOwlUnlocked") === "true"
                                                : achievement.count >= achievement.threshold}
                                        />
                                        <span className="ml-2 text-sm sm:text-base">{achievement.title}</span>
                                    </div>
                                    <p className="text-xs sm:text-sm text-[#B0B0B0]">{achievement.description}</p>
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
