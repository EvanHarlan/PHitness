// SocialPage.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import COLORS from '../lib/constants';
import Tooltip from '@mui/material/Tooltip';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ProfileModal from '../components/ProfileModal'; // <-- IMPORT the new component (adjust path)

axios.defaults.withCredentials = true;

const SocialPage = () => {
    const [friends, setFriends] = useState([]);
    const [friendRequests, setFriendRequests] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State for Profile Modal (remains here to control the modal)
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [selectedFriendProfile, setSelectedFriendProfile] = useState(null);
    const [isProfileLoading, setIsProfileLoading] = useState(false);
    const [profileError, setProfileError] = useState(null);


    // Custom theme for tooltips
    const tooltipTheme = createTheme({
      // ... (theme config remains the same)
         components: {
            MuiTooltip: {
                styleOverrides: {
                    tooltip: {
                        backgroundColor: COLORS.DARK_GRAY,
                        color: COLORS.WHITE,
                        border: `1px solid ${COLORS.MEDIUM_GRAY}`,
                        fontSize: '0.875rem',
                        padding: '8px 12px',
                        maxWidth: '300px',
                        zIndex: 9999,
                    },
                    arrow: {
                        color: COLORS.DARK_GRAY,
                    }
                }
            }
        }
    });

    // Info tooltip component
    const InfoTooltip = ({ title }) => (
      // ... (tooltip component remains the same)
         <Tooltip title={title} arrow placement="top">
            <HelpOutlineIcon
                sx={{
                    color: COLORS.NEON_GREEN,
                    fontSize: '18px',
                    marginLeft: '5px',
                    verticalAlign: 'middle',
                    cursor: 'pointer',
                    '&:hover': {
                        color: COLORS.LIGHT_GRAY,
                    }
                }}
            />
        </Tooltip>
    );

    // Fetch initial data
    useEffect(() => {
      // ... (useEffect remains the same)
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
    // ... (fetchFriends, fetchFriendRequests, searchUsers, sendFriendRequest, acceptFriendRequest, rejectFriendRequest, removeFriend remain the same) ...
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
             return;
        };
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


    // --- Profile Modal Handlers (remain here) ---
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
        }, 300) // Match animation duration if any
    };


    // --- Render Logic ---
    if (loading) {
      // ... (loading indicator remains the same)
        return (
            <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: COLORS.BLACK }}>
                <div className="p-8 text-lg font-medium" style={{ color: COLORS.WHITE }}>Loading Social Hub...</div>
            </div>
        );
    }

     if (error && !isProfileModalOpen) {
       // ... (error display remains the same)
       return (
            <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: COLORS.BLACK }}>
                <div className="p-6 rounded-lg shadow-sm text-center" style={{ backgroundColor: COLORS.MEDIUM_GRAY, color: '#ff6b6b', border: '1px solid #ff6b6b' }}>
                    <p>Error: {error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 rounded transition"
                        style={{ backgroundColor: COLORS.NEON_GREEN, color: COLORS.BLACK }}
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }


    return (
        <ThemeProvider theme={tooltipTheme}>
            <div className="min-h-screen p-6" style={{ backgroundColor: COLORS.BLACK }}>
                <div className="max-w-5xl mx-auto">
                    {/* Search and Requests Sections */}
                    <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2 mb-8">
                       {/* ... (Friend Search JSX remains the same) ... */}
                        <div className="rounded-xl shadow-sm p-6 border" style={{ backgroundColor: COLORS.DARK_GRAY, borderColor: COLORS.MEDIUM_GRAY }}>
                             <h2 className="text-xl font-semibold mb-4 flex items-center" style={{ color: COLORS.WHITE }}>
                                Find Friends
                                <InfoTooltip title="Search for users by name or email and send friend requests." />
                             </h2>
                             <div className="flex gap-2 mb-4">
                                <input
                                    type="text"
                                    placeholder="Search by name or email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="flex-1 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 transition"
                                    style={{ backgroundColor: COLORS.MEDIUM_GRAY, color: COLORS.WHITE, borderColor: COLORS.LIGHT_GRAY, ringColor: COLORS.NEON_GREEN }}
                                    onKeyDown={(e) => e.key === 'Enter' && searchUsers()}
                                />
                                <button onClick={searchUsers} className="px-5 py-2 rounded-lg transition font-medium hover:opacity-80" style={{ backgroundColor: COLORS.NEON_GREEN, color: COLORS.BLACK }}>
                                    Search
                                </button>
                            </div>
                             <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                                {searchResults.length === 0 && searchTerm && (
                                    <p className="text-center py-4" style={{ color: COLORS.LIGHT_GRAY }}>No users found matching "{searchTerm}".</p>
                                )}
                                {searchResults.length === 0 && !searchTerm && (
                                     <p className="text-center py-4" style={{ color: COLORS.LIGHT_GRAY }}>Enter a name or email to find users.</p>
                                )}
                                {searchResults.map(user => (
                                    <div key={user._id} className="p-3 border rounded-lg flex justify-between items-center" style={{ borderColor: COLORS.MEDIUM_GRAY, backgroundColor: COLORS.DARK_GRAY }}>
                                        <div>
                                            <h3 className="font-medium" style={{ color: COLORS.WHITE }}>{user.name}</h3>
                                            <p className="text-sm" style={{ color: COLORS.LIGHT_GRAY }}>{user.email}</p>
                                        </div>
                                        {user.requestSent ? (
                                             <span className="px-3 py-1 rounded-md text-sm cursor-default" style={{ backgroundColor: COLORS.MEDIUM_GRAY, color: COLORS.LIGHT_GRAY }}>
                                                Request Sent
                                             </span>
                                        ) : (
                                            <button
                                                onClick={() => sendFriendRequest(user._id)}
                                                className="px-3 py-1 rounded-md text-sm transition font-medium hover:opacity-80"
                                                style={{ backgroundColor: COLORS.NEON_GREEN, color: COLORS.BLACK }}
                                            >
                                                Add Friend
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                       {/* ... (Friend Requests JSX remains the same) ... */}
                         <div className="rounded-xl shadow-sm p-6 border" style={{ backgroundColor: COLORS.DARK_GRAY, borderColor: COLORS.MEDIUM_GRAY }}>
                            <h2 className="text-xl font-semibold mb-4 flex items-center" style={{ color: COLORS.WHITE }}>
                                Friend Requests
                                {friendRequests.length > 0 && (
                                    <span className="ml-2 px-2 py-0.5 text-xs rounded-full font-bold" style={{ backgroundColor: COLORS.NEON_GREEN, color: COLORS.BLACK }}>
                                        {friendRequests.length}
                                    </span>
                                )}
                                <InfoTooltip title="Accept or reject pending friend requests here." />
                            </h2>
                            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                                {friendRequests.length === 0 ? (
                                    <p className="text-center py-8" style={{ color: COLORS.LIGHT_GRAY }}>No pending friend requests.</p>
                                ) : (
                                    friendRequests.map(request => (
                                        <div key={request._id} className="p-3 border rounded-lg flex justify-between items-center" style={{ borderColor: COLORS.MEDIUM_GRAY, backgroundColor: COLORS.DARK_GRAY }}>
                                            <div>
                                                <h3 className="font-medium" style={{ color: COLORS.WHITE }}>{request.name}</h3>
                                                <p className="text-sm" style={{ color: COLORS.LIGHT_GRAY }}>{request.email}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button className="px-3 py-1 rounded-md text-sm transition font-medium hover:opacity-80" style={{ backgroundColor: '#4CAF50', color: COLORS.WHITE }} onClick={() => acceptFriendRequest(request._id)}>
                                                    Accept
                                                </button>
                                                <button className="px-3 py-1 rounded-md text-sm transition hover:opacity-80" style={{ backgroundColor: COLORS.MEDIUM_GRAY, color: COLORS.LIGHT_GRAY }} onClick={() => rejectFriendRequest(request._id)}>
                                                    Reject
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Friends List */}
                    <div className="mt-8 rounded-xl shadow-sm p-6 border" style={{ backgroundColor: COLORS.DARK_GRAY, borderColor: COLORS.MEDIUM_GRAY }}>
                      {/* ... (Friends List Header remains the same) ... */}
                       <h2 className="text-xl font-semibold mb-4 flex items-center" style={{ color: COLORS.WHITE }}>
                            My Friends
                            {friends.length > 0 && (
                                <span className="ml-2 px-2 py-0.5 text-xs rounded-full font-bold" style={{ backgroundColor: COLORS.NEON_GREEN, color: COLORS.BLACK }}>
                                    {friends.length}
                                </span>
                            )}
                            <InfoTooltip title="Your current friends. Click 'View Profile' for details or 'Remove' to unfriend." />
                        </h2>
                      {/* ... (Friends List Content remains the same, including the handleViewProfile onClick) ... */}
                      {friends.length === 0 ? (
                            <p className="text-center py-8" style={{ color: COLORS.LIGHT_GRAY }}>You haven't added any friends yet. Use the search above!</p>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                                {friends.map(friend => (
                                    <div key={friend._id} className="p-4 border rounded-lg flex flex-col justify-between transition hover:shadow-lg" style={{ borderColor: COLORS.MEDIUM_GRAY, backgroundColor: COLORS.DARK_GRAY, boxShadow: `0 0 5px ${COLORS.MEDIUM_GRAY}` }}>
                                        <div>
                                            <h3 className="font-medium truncate" style={{ color: COLORS.WHITE }}>{friend.name}</h3>
                                            <p className="text-sm mb-3 truncate" style={{ color: COLORS.LIGHT_GRAY }}>{friend.email}</p>
                                        </div>
                                        <div className="flex gap-2 mt-2">
                                            <button
                                                className="flex-1 px-3 py-1 rounded-md text-sm transition font-medium hover:opacity-80"
                                                style={{ backgroundColor: COLORS.NEON_GREEN, color: COLORS.BLACK }}
                                                onClick={() => handleViewProfile(friend._id)} // Stays the same
                                            >
                                                View Profile
                                            </button>
                                            <button
                                                className="px-3 py-1 rounded-md text-sm transition hover:opacity-80"
                                                style={{ backgroundColor: '#ff6b6b', color: COLORS.WHITE }}
                                                onClick={() => removeFriend(friend._id)} // Stays the same
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* === RENDER THE MODAL COMPONENT === */}
                <ProfileModal
                    isOpen={isProfileModalOpen}
                    onClose={handleCloseModal}
                    profileData={selectedFriendProfile}
                    isLoading={isProfileLoading}
                    error={profileError}
                />
                {/* ================================= */}

            </div>
            {/* Add CSS for animation if needed */}
        </ThemeProvider>
    );
};

export default SocialPage;