import { COLORS } from '../App';

const ProfilePage = () => {
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
            Username: John Doe
          </h2>
          <p className="text-[#B0B0B0]">Full Name: Johnathan Doe</p>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;