import { COLORS } from '../App';

const SocialPage = () => {
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
        Social/Friends Page
      </h1>
      <div 
        className="p-6 rounded-lg"
        style={{ 
          backgroundColor: COLORS.MEDIUM_GRAY 
        }}
      >
        <p className="text-[#B0B0B0]">
          Here you can connect with friends and other users.
        </p>
      </div>
    </div>
  );
};

export default SocialPage;