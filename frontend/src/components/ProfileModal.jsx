// src/components/ProfileModal.jsx
import COLORS from '../lib/constants'; // Adjust path if needed

// --- Define the avatar mapping ---
// (Moved from SocialPage.jsx as it's specific to profile display)
const avatarImages = {
  default: "../../public/profileIcon.png",
  avatar1: "../../public/avatar1.png",
  avatar2: "../../public/avatar2.png",
  avatar3: "../../public/avatar3.png",
  avatar4: "../../public/avatar4.png",
  avatar5: "../../public/avatar5.png",
  avatar6: "../../public/avatar6.png",
  avatar7: "../../public/avatar7.png",
  avatar8: "../../public/avatar8.png",
  avatar9: "../../public/avatar9.png",
  avatar10: "../../public/avatar10.png",
  avatar11: "../../public/avatar11.png",
  avatar12: "../../public/avatar12.png",
  avatar13: "../../public/avatar13.png",
  avatar14: "../../public/avatar14.png",
  avatar15: "../../public/avatar15.png",
  avatar16: "../../public/avatar16.png",
  avatar17: "../../public/avatar17.png",
  avatar18: "../../public/avatar18.png",
};
// Ensure these paths are correct relative to your public folder

const ProfileModal = ({ isOpen, onClose, profileData, isLoading, error }) => {

  // If the modal is not open, don't render anything
  if (!isOpen) {
    return null;
  }

  // Handle backdrop click to close the modal
  const handleBackdropClick = (e) => {
    // Only close if the click is directly on the backdrop itself
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-sm p-4"
      onClick={handleBackdropClick} // Use the specific handler for backdrop clicks
    >
      <div
        className="rounded-xl shadow-xl p-6 border w-full max-w-lg relative animate-fade-in"
        style={{ backgroundColor: COLORS.DARK_GRAY, borderColor: COLORS.MEDIUM_GRAY, color: COLORS.WHITE }}
        // Stop propagation is no longer needed on the inner div if using handleBackdropClick logic
      >
        {/* Close Button */}
        <button
          onClick={onClose} // Use the onClose prop passed from the parent
          className="absolute top-3 right-4 text-3xl font-light leading-none hover:text-red-500 transition-colors"
          style={{ color: COLORS.LIGHT_GRAY }}
          aria-label="Close profile view"
        >
          &times;
        </button>

        {/* Modal Content */}
        <h2 className="text-2xl font-semibold mb-5 border-b pb-3" style={{ borderColor: COLORS.MEDIUM_GRAY, color: COLORS.NEON_GREEN }}>
          Profile View
        </h2>

        {isLoading && (
          <div className="text-center py-10" style={{ color: COLORS.LIGHT_GRAY }}>Loading profile...</div>
        )}

        {error && (
          <div className="text-center py-6 px-4 rounded border" style={{ color: '#ff8a8a', backgroundColor: 'rgba(255, 107, 107, 0.1)', borderColor: '#ff6b6b' }}>
            <p className="font-semibold">Could not load profile</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        {!isLoading && !error && profileData && (
          <div className="space-y-5">
            {/* Header: Avatar + Names */}
            <div className="flex items-center space-x-4">
              <img
                // Use profileData prop here
                src={avatarImages[profileData.avatar] || avatarImages.default}
                alt={`${profileData.username || 'User'}'s avatar`}
                className="w-20 h-20 rounded-full object-cover border-2"
                style={{ borderColor: COLORS.NEON_GREEN }}
                onError={(e) => { e.target.onerror = null; e.target.src = avatarImages.default; }}
              />
              <div>
                <h3 className="text-xl font-bold" style={{ color: COLORS.WHITE }}>
                  {profileData.username || 'N/A'}
                </h3>
                <p className="text-md" style={{ color: COLORS.LIGHT_GRAY }}>
                  {profileData.name}
                </p>
              </div>
            </div>

            {/* Bio */}
            {profileData.bio ? (
              <div>
                <h4 className="font-semibold mb-1 text-sm uppercase tracking-wider" style={{ color: COLORS.NEON_GREEN }}>Bio</h4>
                <p className="text-md p-3 rounded text-pretty" style={{ color: COLORS.LIGHT_GRAY, backgroundColor: COLORS.MEDIUM_GRAY }}>
                  {profileData.bio}
                </p>
              </div>
            ) : (
              <div>
                <h4 className="font-semibold mb-1 text-sm uppercase tracking-wider" style={{ color: COLORS.NEON_GREEN }}>Bio</h4>
                <p className="text-md p-3 rounded italic" style={{ color: COLORS.LIGHT_GRAY, backgroundColor: COLORS.MEDIUM_GRAY }}>
                  No bio provided.
                </p>
              </div>
            )}

            {/* Achievements */}
            {profileData.achievements && profileData.achievements.length > 0 ? (
              <div>
                <h4 className="font-semibold mb-2 text-sm uppercase tracking-wider" style={{ color: COLORS.NEON_GREEN }}>Achievements</h4>
                <ul className="space-y-2 max-h-40 overflow-y-auto pr-2 text-md" style={{ color: COLORS.LIGHT_GRAY }}>
                  {profileData.achievements.map((ach, index) => (
                    <li key={index} className="p-2 rounded flex justify-between items-center" style={{ backgroundColor: COLORS.MEDIUM_GRAY }}>
                      <span>🏆 {ach.title}</span>
                      <span className="text-xs opacity-75">{new Date(ach.dateUnlocked).toLocaleDateString()}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div>
                <h4 className="font-semibold mb-1 text-sm uppercase tracking-wider" style={{ color: COLORS.NEON_GREEN }}>Achievements</h4>
                <p className="text-md p-3 rounded italic" style={{ color: COLORS.LIGHT_GRAY, backgroundColor: COLORS.MEDIUM_GRAY }}>
                  No achievements unlocked yet.
                </p>
              </div>
            )}
          </div>
        )}
        {/* Close button at the bottom */}
        <button
          onClick={onClose} // Use the onClose prop
          className="mt-6 w-full px-4 py-2 rounded transition font-medium"
          style={{ backgroundColor: COLORS.MEDIUM_GRAY, color: COLORS.LIGHT_GRAY }}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ProfileModal;