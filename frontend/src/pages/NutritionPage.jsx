import { useState, useEffect } from "react";
import { COLORS } from '../lib/constants';
import axios from "axios"

const NutritionPage = () => {
    const [mealAmount, setMealAmount] = useState(0);

    useEffect(() =>
    {
        const fetchMealCount = async () =>
        {
            try
            {
                const response = await axios.get("http://localhost:5000/api/tracker/counts", { withCredentials: true });
                setMealAmount(response.data.mealCount || 0);
            }
            catch (error)
            {
                console.error("Error fetching meal count:", error);
            }
        };

        fetchMealCount();
    }, []);

    const addMeal = async () => {
        try
        {
            const response = await axios.post("http://localhost:5000/api/tracker",
                { type: "meal" },
                { withCredentials: true }
            );

            console.log("API Response:", response.data);

            setMealAmount(prevMealAmount => prevMealAmount + 1);
            console.log("Added 1 to mealAmount")
        }
        catch (error) {
            console.error(error);
        }
    };
  return (
    <div 
      className="min-h-screen p-6 md:p-8"
      style={{ 
        backgroundColor: COLORS.BLACK, 
        color: COLORS.WHITE 
      }}
    >
      <div className="container mx-auto">
        <h1 
          className="text-3xl md:text-4xl font-bold mb-4"
          style={{ color: COLORS.NEON_GREEN }}
        >
          Nutrition/Meal Plan
        </h1>
        <p className="text-lg text-[#B0B0B0] mb-6">
          Custom tailored meal plans based on your goals.
        </p>
          </div>

          <div className="mb-8">
              <p className="text-lg">Meals eaten overall: {mealAmount}</p>
              <button
                  className="mt-2 px-4 py-2 rounded font-bold"
                  style={{ backgroundColor: COLORS.NEON_GREEN, color: COLORS.BLACK }}
                  onClick={addMeal}
              >
                  Add Meal
              </button>
          </div>
    </div>
  );
};

export default NutritionPage;