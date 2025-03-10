import { COLORS } from '../lib/constants';

const NutritionPage = () => {
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
    </div>
  );
};

export default NutritionPage;