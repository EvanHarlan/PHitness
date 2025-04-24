// SocialPage.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import COLORS from '../lib/constants';
import Tooltip from '@mui/material/Tooltip';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ProfileModal from '../components/ProfileModal';
import NudgeListener from '../components/NudgeListener';

axios.defaults.withCredentials = true;

const SocialPage = () => {
    const [friends, setFriends] = useState([]);
    const [friendRequests, setFriendRequests] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [friendSearchTerm, setFriendSearchTerm] = useState('');
    const [hasSearched, setHasSearched] = useState(false);
    const [friendsOpen, setFriendsOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // State for Profile Modal
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [selectedFriendProfile, setSelectedFriendProfile] = useState(null);
    const [isProfileLoading, setIsProfileLoading] = useState(false);
    const [profileError, setProfileError] = useState(null);

    // Detect mobile devices
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        handleResize(); // Check on initial load
        window.addEventListener('resize', handleResize);
        
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Adjust animation settings for mobile
    const animationSettings = {
        duration: isMobile ? 0.5 : 0.8,
        delay: isMobile ? 0.1 : 0.2
    };

    // Custom theme for tooltips with mobile optimization
    const tooltipTheme = createTheme({
        components: {
            MuiTooltip: {
                styleOverrides: {
                    tooltip: {
                        backgroundColor: COLORS.DARK_GRAY,
                        color: COLORS.WHITE,
                        border: `1px solid ${COLORS.MEDIUM_GRAY}`,
                        fontSize: isMobile ? '0.75rem' : '0.875rem',
                        padding: isMobile ? '6px 10px' : '8px 12px',
                        maxWidth: isMobile ? '250px' : '300px',
                        zIndex: 9999,
                    },
                    arrow: {
                        color: COLORS.DARK_GRAY,
                    }
                }
            }
        }
    });

    // Info tooltip component with mobile adjustments
    const InfoTooltip = ({ title }) => (
        <Tooltip 
            title={title} 
            arrow 
            placement={isMobile ? "bottom" : "top"}
            enterTouchDelay={isMobile ? 50 : 100}
            leaveTouchDelay={isMobile ? 1500 : 500}
        >
            <HelpOutlineIcon
                sx={{
                    color: COLORS.NEON_GREEN,
                    fontSize: isMobile ? '16px' : '18px',
                    marginLeft: '5px',
                    verticalAlign: 'middle',
                    cursor: 'pointer',
                    padding: isMobile ? '2px' : '0',
                    '&:hover': {
                        color: COLORS.LIGHT_GRAY,
                    }
                }}
            />
        </Tooltip>
    );

    // Fetch initial data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                await Promise.all([fetchFriends(), fetchFriendRequests()]);
            } catch (err) {
                console.error("Error loading initial data:", err);
                setError("Failed to load your social data. Please try again later.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // --- API Call Functions ---
    const fetchFriends = async () => {
        try {
            const response = await axios.get('/api/friend/list');
            setFriends(response.data.friends || []);
        } catch (error) {
            console.error('Error fetching friends:', error.response?.data || error.message);
            setFriends([]);
            throw error;
        }
    };

    const fetchFriendRequests = async () => {
        try {
            const response = await axios.get('/api/friend/requests');
            setFriendRequests(response.data.friendRequests || []);
        } catch (error) {
            console.error('Error fetching friend requests:', error.response?.data || error.message);
            setFriendRequests([]);
            throw error;
        }
    };

    const searchUsers = async () => {
        if (!searchTerm.trim()) {
             setSearchResults([]);
             setHasSearched(false);
             return;
        };
        setHasSearched(true);
        console.log(`Searching for users matching: "${searchTerm}"`);
        try {
            const response = await axios.get(`/api/auth/search?q=${searchTerm}`);
            console.log('Search response:', response.data);
            setSearchResults(response.data.users || []);
            setError(null);
        } catch (error) {
            console.error('Error searching users:', error.response?.data || error.message);
            setSearchResults([]);
            setError("Failed to search users. Please try again.");
        }
    };

    const sendFriendRequest = async (userId) => {
        try {
            await axios.post('/api/friend/send-request', { friendId: userId });
            setSearchResults(prevResults =>
                prevResults.map(user =>
                    user._id === userId ? { ...user, requestSent: true } : user
                )
            );
        } catch (error) {
            console.error('Error sending friend request:', error.response?.data || error.message);
            setError(error.response?.data?.message || "Failed to send friend request.");
        }
    };

    const acceptFriendRequest = async (userId) => {
        try {
            await axios.post('/api/friend/accept-request', { friendId: userId });
            await Promise.all([fetchFriendRequests(), fetchFriends()]);
        } catch (error) {
            console.error('Error accepting friend request:', error.response?.data || error.message);
            setError("Failed to accept friend request.");
        }
    };

    const rejectFriendRequest = async (userId) => {
        try {
            await axios.post('/api/friend/reject-request', { friendId: userId });
            await fetchFriendRequests();
        } catch (error) {
            console.error('Error rejecting friend request:', error.response?.data || error.message);
            setError("Failed to reject friend request.");
        }
    };

    const removeFriend = async (userId) => {
        try {
            await axios.post('/api/friend/remove', { friendId: userId });
            await fetchFriends();
        } catch (error) {
            console.error('Error removing friend:', error.response?.data || error.message);
            setError("Failed to remove friend.");
        }
    };

    // --- Profile Modal Handlers ---
    const handleViewProfile = async (friendId) => {
        setIsProfileLoading(true);
        setProfileError(null);
        setSelectedFriendProfile(null);
        setIsProfileModalOpen(true); // Open the modal

        try {
            const response = await axios.get(`/api/friend/profile/${friendId}`);
            setSelectedFriendProfile(response.data); // Set the data
        } catch (error) {
            console.error('Error fetching friend profile:', error.response?.data || error.message);
            setProfileError(error.response?.data?.message || 'Failed to load profile.');
        } finally {
            setIsProfileLoading(false);
        }
    };

    const handleCloseModal = () => {
        setIsProfileModalOpen(false); // Close the modal
        // Optionally reset data after a short delay for animations
        setTimeout(() => {
             setSelectedFriendProfile(null);
             setProfileError(null);
        }, 300); // Match animation duration if any
    };

    const sendNudge = async (friendId) => {
        try {
          const response = await axios.post('http://localhost:5000/api/friend/nudge', { friendId },{ withCredentials: true });
          alert(response.data.message || 'Nudge sent!');
        } catch (error) {
          console.error('Error sending nudge:', error);
          setError("Failed to send nudge. Please try again.");
        }
    };

    // --- Render Logic ---
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen p-4" style={{ backgroundColor: COLORS.BLACK }}>
                <div className="p-4 sm:p-8 text-base sm:text-lg font-medium flex items-center" style={{ color: COLORS.WHITE }}>
                    <svg className="animate-spin h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading Social Hub...
                </div>
            </div>
        );
    }

    if (error && !isProfileModalOpen) {
        return (
            <div className="flex items-center justify-center min-h-screen p-4" style={{ backgroundColor: COLORS.BLACK }}>
                <div className="p-4 sm:p-6 rounded-lg shadow-sm text-center" style={{ backgroundColor: COLORS.MEDIUM_GRAY, color: '#ff6b6b', border: '1px solid #ff6b6b' }}>
                    <p>Error: {error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 rounded transition min-h-[44px]"
                        style={{ backgroundColor: COLORS.NEON_GREEN, color: COLORS.BLACK }}
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    const filteredFriends = friends.filter(friend =>
        friend.name.toLowerCase().includes(friendSearchTerm.toLowerCase()) ||
        friend.email.toLowerCase().includes(friendSearchTerm.toLowerCase())
    );

    return (
        <ThemeProvider theme={tooltipTheme}>
            <div className="min-h-screen p-4 sm:p-6" style={{ backgroundColor: COLORS.BLACK }}>
                <div className="max-w-5xl mx-auto">
                    {/* Notifications Section */}
                    <div className="mt-4 sm:mt-8 rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 border mb-4" 
                        style={{ backgroundColor: COLORS.DARK_GRAY, borderColor: COLORS.MEDIUM_GRAY }}>
                        <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4" style={{ color: COLORS.WHITE }}>
                            Notifications
                        </h2>
                        <NudgeListener/> 
                        <div className="flex gap-2 mb-4 sm:mb-6">
                        </div>
                    </div>
                    
                    {/* Search and Requests Sections */}
                    <div className="grid gap-6 sm:gap-8 mb-6 sm:mb-8">
                        {/* Find Friends Section */}
                        <div className="rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 border" 
                            style={{ backgroundColor: COLORS.DARK_GRAY, borderColor: COLORS.MEDIUM_GRAY }}>
                            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 flex items-center" 
                                style={{ color: COLORS.WHITE }}>
                                Find Friends
                                <InfoTooltip title="Search for users by name or email and send friend requests." />
                            </h2>
                            <div className="flex gap-2 mb-4">
                                <input
                                    type="text"
                                    placeholder="Search by name or email..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setSearchTerm(value);
                                        if (value.trim() === "") {
                                            setSearchResults([]);
                                            setHasSearched(false);  
                                        }
                                    }}
                                    className="flex-1 px-3 sm:px-4 py-2 rounded-lg focus:outline-none focus:ring-2 transition text-sm sm:text-base"
                                    style={{ 
                                        backgroundColor: COLORS.MEDIUM_GRAY, 
                                        color: COLORS.WHITE, 
                                        borderColor: COLORS.LIGHT_GRAY, 
                                        ringColor: COLORS.NEON_GREEN 
                                    }}
                                    onKeyDown={(e) => e.key === 'Enter' && searchUsers()}
                                />
                                <button 
                                    onClick={searchUsers} 
                                    className="px-4 py-2 rounded-lg transition font-medium hover:opacity-80 text-xs sm:text-sm min-h-[44px]" 
                                    style={{ backgroundColor: COLORS.NEON_GREEN, color: COLORS.BLACK }}
                                >
                                    Search
                                </button>
                            </div>
                            <div className="space-y-3 max-h-48 sm:max-h-60 overflow-y-auto pr-2">
                                {hasSearched && searchResults.length === 0 && searchTerm && (
                                    <p className="text-center py-3 sm:py-4 text-sm sm:text-base" style={{ color: COLORS.LIGHT_GRAY }}>
                                        No users found matching "{searchTerm}".
                                    </p>
                                )}
                                {searchResults.length === 0 && !searchTerm && (
                                    <p className="text-center py-3 sm:py-4 text-sm sm:text-base" style={{ color: COLORS.LIGHT_GRAY }}>
                                        Enter a name or email to find users.
                                    </p>
                                )}
                                {searchResults.map(user => {
                                    const isAlreadyFriend = friends.some(friend => friend._id === user._id);

                                    return (
                                        <div 
                                            key={user._id} 
                                            className="p-3 border rounded-lg flex justify-between items-center" 
                                            style={{ borderColor: COLORS.MEDIUM_GRAY, backgroundColor: COLORS.DARK_GRAY }}
                                        >
                                            <div className="pr-2">
                                                <h3 className="font-medium text-sm sm:text-base" style={{ color: COLORS.WHITE }}>
                                                    {user.name}
                                                </h3>
                                                <p className="text-xs sm:text-sm truncate" style={{ color: COLORS.LIGHT_GRAY }}>
                                                    {user.email}
                                                </p>
                                            </div>

                                            {isAlreadyFriend ? (
                                                <span 
                                                    className="px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm cursor-default whitespace-nowrap" 
                                                    style={{ backgroundColor: COLORS.MEDIUM_GRAY, color: COLORS.LIGHT_GRAY }}
                                                >
                                                    Added
                                                </span>
                                            ) : user.requestSent ? (
                                                <span 
                                                    className="px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm cursor-default whitespace-nowrap" 
                                                    style={{ backgroundColor: COLORS.MEDIUM_GRAY, color: COLORS.LIGHT_GRAY }}
                                                >
                                                    Sent
                                                </span>
                                            ) : (
                                                <button
                                                    onClick={() => sendFriendRequest(user._id)}
                                                    className="px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm transition font-medium hover:opacity-80 min-h-[36px] whitespace-nowrap"
                                                    style={{ backgroundColor: COLORS.NEON_GREEN, color: COLORS.BLACK }}
                                                >
                                                    Add
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        
                        {/* Friend Requests Section */}
                        <div className="rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 border" 
                            style={{ backgroundColor: COLORS.DARK_GRAY, borderColor: COLORS.MEDIUM_GRAY }}>
                            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 flex items-center" 
                                style={{ color: COLORS.WHITE }}>
                                Friend Requests
                                {friendRequests.length > 0 && (
                                    <span className="ml-2 px-2 py-0.5 text-xs rounded-full font-bold" 
                                        style={{ backgroundColor: COLORS.NEON_GREEN, color: COLORS.BLACK }}>
                                        {friendRequests.length}
                                    </span>
                                )}
                                <InfoTooltip title="Accept or reject pending friend requests here." />
                            </h2>
                            <div className="space-y-3 max-h-48 sm:max-h-60 overflow-y-auto pr-2">
                                {friendRequests.length === 0 ? (
                                    <p className="text-center py-6 sm:py-8 text-sm sm:text-base" 
                                        style={{ color: COLORS.LIGHT_GRAY }}>
                                        No pending friend requests.
                                    </p>
                                ) : (
                                    friendRequests.map(request => (
                                        <div 
                                            key={request._id} 
                                            className="p-3 border rounded-lg flex flex-col sm:flex-row sm:justify-between sm:items-center" 
                                            style={{ borderColor: COLORS.MEDIUM_GRAY, backgroundColor: COLORS.DARK_GRAY }}
                                        >
                                            <div className="mb-2 sm:mb-0">
                                                <h3 className="font-medium text-sm sm:text-base" style={{ color: COLORS.WHITE }}>
                                                    {request.name}
                                                </h3>
                                                <p className="text-xs sm:text-sm" style={{ color: COLORS.LIGHT_GRAY }}>
                                                    {request.email}
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button 
                                                    className="flex-1 sm:flex-none px-3 py-1 rounded-md text-xs sm:text-sm transition font-medium hover:opacity-80 min-h-[36px]" 
                                                    style={{ backgroundColor: '#4CAF50', color: COLORS.WHITE }} 
                                                    onClick={() => acceptFriendRequest(request._id)}
                                                >
                                                    Accept
                                                </button>
                                                <button 
                                                    className="flex-1 sm:flex-none px-3 py-1 rounded-md text-xs sm:text-sm transition hover:opacity-80 min-h-[36px]" 
                                                    style={{ backgroundColor: COLORS.MEDIUM_GRAY, color: COLORS.LIGHT_GRAY }} 
                                                    onClick={() => rejectFriendRequest(request._id)}
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                    
                    {/* Friend Search Input */}
                    <div className="mb-4 flex gap-2">
                        <input
                            type="text"
                            placeholder="Search your friends..."
                            value={friendSearchTerm}
                            onChange={(e) => setFriendSearchTerm(e.target.value)}
                            className="flex-1 px-3 sm:px-4 py-2 rounded-lg focus:outline-none focus:ring-2 transition text-sm sm:text-base"
                            style={{
                                backgroundColor: COLORS.MEDIUM_GRAY,
                                color: COLORS.WHITE,
                                borderColor: COLORS.LIGHT_GRAY,
                                ringColor: COLORS.NEON_GREEN
                            }}
                        />
                        <button
                            onClick={() => setFriendSearchTerm('')}
                            className="px-3 sm:px-4 py-2 rounded-lg transition font-medium hover:opacity-80 text-xs sm:text-sm min-h-[44px]"
                            style={{ backgroundColor: COLORS.NEON_GREEN, color: COLORS.BLACK }}
                        >
                            Clear
                        </button>
                    </div>
                    
                    {/* Friends List */}
                    <div className="mt-4 sm:mt-8 rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 border" 
                        style={{ backgroundColor: COLORS.DARK_GRAY, borderColor: COLORS.MEDIUM_GRAY }}>
                        <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 flex items-center" 
                            style={{ color: COLORS.WHITE }}>
                            My Friends
                            {friends.length > 0 && (
                                <span className="ml-2 px-2 py-0.5 text-xs rounded-full font-bold" 
                                    style={{ backgroundColor: COLORS.NEON_GREEN, color: COLORS.BLACK }}>
                                    {friends.length}
                                </span>
                            )}
                            <InfoTooltip title="Your current friends. Click 'View Profile' for details or 'Remove' to unfriend." />
                            <button 
                                onClick={() => setFriendsOpen(!friendsOpen)} 
                                style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: COLORS.NEON_GREEN }}
                                className="flex items-center text-xs sm:text-sm min-h-[36px]"
                            >
                                {friendsOpen ? "Hide Friends" : "Show Friends"} 
                            </button>
                        </h2>
                        
                        {friendsOpen && (
                            friends.length === 0 ? (
                                <p className="text-center py-6 sm:py-8 text-sm sm:text-base" 
                                    style={{ color: COLORS.LIGHT_GRAY }}>
                                    You haven't added any friends yet. Use the search above!
                                </p>
                            ) : (
                                <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                                    {filteredFriends.map(friend => (
                                        <div 
                                            key={friend._id} 
                                            className="p-3 sm:p-4 border rounded-lg flex flex-col justify-between transition hover:shadow-lg" 
                                            style={{ 
                                                borderColor: COLORS.MEDIUM_GRAY, 
                                                backgroundColor: COLORS.DARK_GRAY, 
                                                boxShadow: `0 0 5px ${COLORS.MEDIUM_GRAY}`,
                                            }}
                                        >
                                            <div>
                                                <h3 className="font-medium truncate text-sm sm:text-base" 
                                                    style={{ color: COLORS.WHITE }}>
                                                    {friend.name}
                                                </h3>
                                                <p className="text-xs sm:text-sm mb-2 sm:mb-3 truncate" 
                                                    style={{ color: COLORS.LIGHT_GRAY }}>
                                                    {friend.email}
                                                </p>
                                            </div>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                <button
                                                    className="flex-1 px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm transition font-medium hover:opacity-80 min-h-[36px]"
                                                    style={{ backgroundColor: COLORS.NEON_GREEN, color: COLORS.BLACK }}
                                                    onClick={() => handleViewProfile(friend._id)}
                                                >
                                                    Profile
                                                </button>
                                                <button
                                                    className="px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm transition hover:opacity-80 min-h-[36px]"
                                                    style={{ backgroundColor: '#ff6b6b', color: COLORS.WHITE }}
                                                    onClick={() => removeFriend(friend._id)}
                                                >
                                                    Remove
                                                </button>
                                                <button
                                                    className="flex-1 px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm transition font-medium hover:opacity-80 min-h-[36px]"
                                                    style={{ backgroundColor: COLORS.MEDIUM_GRAY, color: COLORS.NEON_GREEN }}
                                                    onClick={() => sendNudge(friend._id)}
                                                >
                                                    Nudge
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )
                        )}
                    </div>
                </div>

                {/* Profile Modal Component */}
                <ProfileModal
                    isOpen={isProfileModalOpen}
                    onClose={handleCloseModal}
                    profileData={selectedFriendProfile}
                    isLoading={isProfileLoading}
                    error={profileError}
                    isMobile={isMobile}
                />
            </div>
        </ThemeProvider>
    );
};

export default SocialPage;
