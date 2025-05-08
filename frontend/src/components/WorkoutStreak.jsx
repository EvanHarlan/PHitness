import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import PropTypes from "prop-types";
import COLORS from "../lib/constants";
import { useUserStore } from "../stores/useUserStore";

const WorkoutStreak = ({ onWorkoutLogged }) =>
{
    const [streak, setStreak] = useState(() => parseInt(localStorage.getItem("workoutStreak") || "0", 10));
    const unlockedStreaks = useRef(new Set());
    const { setUnlockedAchievement } = useUserStore();

    //Checks last date to update workout
    const updateWorkoutStreak = () =>
    {
        const lastDateRaw = localStorage.getItem("lastWorkoutDate");
        const now = new Date();
        const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        let current = parseInt(localStorage.getItem("workoutStreak") || "0", 10);

        if (!lastDateRaw)
        {
            current = 1;
        } else
        {
            const last = new Date(lastDateRaw);
            const lastMidnight = new Date(last.getFullYear(), last.getMonth(), last.getDate());

            const diffTime = nowMidnight - lastMidnight;
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 1)
            {
                current += 1;
            } else if (diffDays > 1)
            {
                current = 1;
            } // else diffDays === 0 → same day, no change
        }

        localStorage.setItem("lastWorkoutDate", now.toISOString());
        localStorage.setItem("workoutStreak", current.toString());
        setStreak(current);

        return current;
    };
    //Handles logic for logging workouts
    const handleWorkoutLogged = useCallback(async () =>
    {
        const newStreak = updateWorkoutStreak();
        const milestones = [3, 7, 14, 30];

        for (const milestone of milestones)
        {
            if (newStreak >= milestone && !unlockedStreaks.current.has(milestone))
            {
                unlockedStreaks.current.add(milestone);

                try
                {
                    await axios.post("http://localhost:5000/api/auth/unlock-achievement", {
                        title: `${milestone}-Day Workout Streak!`
                    }, { withCredentials: true });

                    setUnlockedAchievement({
                        title: `${milestone}-Day Workout Streak!`,
                        description: `You've worked out ${milestone} days in a row. Keep it going!`
                    });
                } catch (err)
                {
                }
            }
        }

        const now = new Date();
        const hour = now.getHours();
        const day = now.getDay();
        //Logic for Unlocking acheivements
        const unlockIfNeeded = async (key, title, description) =>
        {
            if (!localStorage.getItem(key))
            {
                try
                {
                    await axios.post("http://localhost:5000/api/auth/unlock-achievement", { title }, { withCredentials: true });
                    setUnlockedAchievement({ title, description });
                    localStorage.setItem(key, "true");
                } catch (err)
                {
                }
            }
        };

        if (day === 0 || day === 6) await unlockIfNeeded("weekendWarriorUnlocked", "Weekend Warrior", "You worked out on the weekend. Thats dedication!");
        if (hour < 6) await unlockIfNeeded("earlyBirdUnlocked", "Early Bird", "You worked out before 6 AM. Rise and grind!");
        else if (hour >= 22) await unlockIfNeeded("lateOwlUnlocked", "Late Owl", "You worked out after 10 PM. Midnight gains!");

        if (onWorkoutLogged) onWorkoutLogged();
    }, [setUnlockedAchievement, onWorkoutLogged]);

    useEffect(() =>
    {
        window.addEventListener("workoutLogged", handleWorkoutLogged);
        return () => window.removeEventListener("workoutLogged", handleWorkoutLogged);
    }, [handleWorkoutLogged]);

    useEffect(() =>
    {
        const checkExpiration = () =>
        {
            const lastDate = localStorage.getItem("lastWorkoutDate");
            if (!lastDate) return;
            const diff = Math.floor((new Date() - new Date(lastDate)) / (1000 * 60 * 60 * 24));
            if (diff > 1)
            {
                setStreak(0);
                localStorage.setItem("workoutStreak", "0");
            }
        };
        // warns user if streak is about to be lost
        const checkWarning = () =>
        {
            const lastDate = localStorage.getItem("lastWorkoutDate");
            const lastWarning = localStorage.getItem("lastStreakWarningShown");

            if (!lastDate) return;

            const hoursSince = (Date.now() - new Date(lastDate)) / (1000 * 60 * 60);
            const today = new Date().toDateString();

            if (hoursSince >= 12 && hoursSince < 24)
            {
                // Only show once per calendar day
                if (lastWarning === today) return;

                toast("You're 12 hours away from losing your streak!", {
                    style: {
                        background: COLORS.DARK_GRAY,
                        color: COLORS.NEON_GREEN,
                        border: `1px solid ${COLORS.MEDIUM_GRAY}`
                    }
                });

                localStorage.setItem("lastStreakWarningShown", today);
            }
        };



        checkExpiration();
        checkWarning();

        const expInt = setInterval(checkExpiration, 5 * 60 * 1000);
        const warnInt = setInterval(checkWarning, 60 * 60 * 1000);

        return () =>
        {
            clearInterval(expInt);
            clearInterval(warnInt);
        };
    }, []);

    return (
        <div className="p-4 border rounded-lg mb-4" style={{ borderColor: COLORS.MEDIUM_GRAY, backgroundColor: COLORS.DARK_GRAY }}>
            <h3 className="font-medium" style={{ color: COLORS.WHITE }}>
                Daily Workout Streak
            </h3>
            <p className="text-2xl font-bold mb-2" style={{ color: COLORS.NEON_GREEN }}>
                {streak} day{streak === 1 ? "" : "s"}
            </p>
            <div className="h-2 rounded-full overflow-hidden bg-[#333]">
                <div
                    className="h-full transition-all duration-300 ease-in-out"
                    style={{
                        width: `${Math.min(
                            ((Date.now() - new Date(localStorage.getItem("lastWorkoutDate")).getTime()) / (24 * 60 * 60 * 1000)) * 100,
                            100
                        )}%`,
                        backgroundColor: COLORS.NEON_GREEN
                    }}
                />
            </div>
        </div>
    );
};

WorkoutStreak.propTypes = {
    onWorkoutLogged: PropTypes.func
};

export default WorkoutStreak;