import { useEffect, useState } from "react";
import Confetti from "react-confetti";
import { toast } from "react-hot-toast";
import PropTypes from "prop-types";

const AchievementNotifier = ({ unlockedAchievement }) =>
{
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() =>
    {
        if (unlockedAchievement)
        {
            // Show toast
            toast.success(`Achievement Unlocked: ${unlockedAchievement.title}`, {
                position: 'top-center',
                autoClose: 4000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: 'colored',
            });

            // Trigger confetti
            setShowConfetti(true);

            // Stop confetti after 4 seconds
            const timer = setTimeout(() => setShowConfetti(false), 4000);
            return () => clearTimeout(timer);
        }
    }, [unlockedAchievement]);

    return <>{showConfetti && <Confetti />}</>;
};

AchievementNotifier.propTypes = {
    unlockedAchievement: PropTypes.object,
};


export default AchievementNotifier;
