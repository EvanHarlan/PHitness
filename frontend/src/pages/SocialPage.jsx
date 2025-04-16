import { useState, useEffect } from 'react';
import axios from 'axios';
import { COLORS } from '../lib/constants';
import Tooltip from '@mui/material/Tooltip';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { ThemeProvider, createTheme } from '@mui/material/styles';

axios.defaults.withCredentials = true;

const SocialPage = () => {
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile devices
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    handleResize(); // Check on initial load
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Custom theme for tooltips to match the website
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

  // Info tooltip component to match the website
  const InfoTooltip = ({ title }) => (
    <Tooltip title={title} arrow placement="top">
      <HelpOutlineIcon 
        sx={{ 
          color: COLORS.NEON_GREEN, 
          fontSize: isMobile ? '16px' : '18px', 
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

  // Fetch friends and friend requests on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
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

  const fetchFriends = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/friend/list');
      setFriends(response.data.friends || []);
    } catch (error) {
      console.error('Error fetching friends:', error);
      setFriends([]);
      throw error;
    }
  };
  
  const fetchFriendRequests = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/friend/requests');
      setFriendRequests(response.data.friendRequests || []);
    } catch (error) {
      console.error('Error fetching friend requests:', error);
      setFriendRequests([]);
      throw error;
    }
  };
  
  const searchUsers = async () => {
    if (!searchTerm) return;
    
    try {
      console.log(`Searching for users matching: "${searchTerm}"`);
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/auth/search?q=${searchTerm}`);
      console.log('Search response:', response.data);
      setSearchResults(response.data.users || []);
    } catch (error) {
      console.error('Error searching users:', error.response?.data || error.message);
      setSearchResults([]);
      setError("Failed to search users. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async (userId) => {
    try {
      await axios.post('/api/friend/send-request', { friendId: userId });
      // Update search results to reflect sent request
      setSearchResults(prevResults => 
        prevResults.map(user => 
          user._id === userId ? { ...user, requestSent: true } : user
        )
      );
    } catch (error) {
      console.error('Error sending friend request:', error);
      setError("Failed to send friend request. Please try again.");
    }
  };

  const acceptFriendRequest = async (userId) => {
    try {
      await axios.post('/api/friend/accept-request', { friendId: userId });
      // Refresh friend requests and friends lists
      await Promise.all([fetchFriendRequests(), fetchFriends()]);
    } catch (error) {
      console.error('Error accepting friend request:', error);
      setError("Failed to accept friend request. Please try again.");
    }
  };

  const rejectFriendRequest = async (userId) => {
    try {
      await axios.post('/api/friend/reject-request', { friendId: userId });
      await fetchFriendRequests();
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      setError("Failed to reject friend request. Please try again.");
    }
  };

  const removeFriend = async (userId) => {
    try {
      await axios.post('/api/friend/remove', { friendId: userId });
      await fetchFriends();
    } catch (error) {
      console.error('Error removing friend:', error);
      setError("Failed to remove friend. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ backgroundColor: COLORS.BLACK }}>
        <div className="p-4 sm:p-8 text-base sm:text-lg font-medium" style={{ color: COLORS.WHITE }}>
          <svg className="animate-spin h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading social data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ backgroundColor: COLORS.BLACK }}>
        <div className="p-4 sm:p-6 rounded-lg shadow-sm text-sm sm:text-base" style={{ backgroundColor: COLORS.MEDIUM_GRAY, color: COLORS.LIGHT_GRAY }}>{error}</div>
      </div>
    );
  }

  return (
    <ThemeProvider theme={tooltipTheme}>
      <div className="min-h-screen p-3 sm:p-4 md:p-6" style={{ backgroundColor: COLORS.BLACK }}>
        <div className="max-w-5xl mx-auto">        
          <div className="grid gap-4 sm:gap-6 md:gap-8 grid-cols-1 lg:grid-cols-2">
            {/* Friend Search */}
            <div className="rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 border" style={{ backgroundColor: COLORS.DARK_GRAY, borderColor: COLORS.MEDIUM_GRAY }}>
              <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4 flex items-center" style={{ color: COLORS.WHITE }}>
                <span>Find Friends</span>
                <InfoTooltip title="Find and add friends by searching for their name or email." />
              </h2>
              
              <div className="flex gap-2 mb-4 sm:mb-6">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg focus:outline-none focus:ring-2 transition"
                  style={{ 
                    backgroundColor: COLORS.MEDIUM_GRAY,
                    color: COLORS.WHITE,
                    borderColor: COLORS.LIGHT_GRAY
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && searchUsers()}
                />
                <button 
                  onClick={searchUsers}
                  className="px-3 sm:px-4 py-2 rounded-lg transition font-medium text-xs sm:text-sm whitespace-nowrap"
                  style={{ backgroundColor: COLORS.NEON_GREEN, color: COLORS.BLACK }}
                >
                  Search
                </button>
              </div>
              
              <div className="space-y-3 sm:space-y-4 max-h-64 sm:max-h-96 overflow-y-auto">
                {searchResults && searchResults.length > 0 ? (
                  searchResults.map(user => (
                    <div 
                      key={user._id} 
                      className="p-3 sm:p-4 border rounded-lg transition"
                      style={{ 
                        borderColor: COLORS.MEDIUM_GRAY,
                        backgroundColor: COLORS.DARK_GRAY
                      }}
                    >
                      <h3 className="text-sm sm:text-base font-medium" style={{ color: COLORS.WHITE }}>{user.name}</h3>
                      <p className="text-xs sm:text-sm mb-2 sm:mb-3" style={{ color: COLORS.LIGHT_GRAY }}>{user.email}</p>
                      {!user.requestSent && !user.isFriend && (
                        <button 
                          onClick={() => sendFriendRequest(user._id)}
                          className="px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm transition font-medium"
                          style={{ backgroundColor: COLORS.MEDIUM_GRAY, color: COLORS.NEON_GREEN }}
                        >
                          Add Friend
                        </button>
                      )}
                      {user.requestSent && (
                        <span 
                          className="px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm"
                          style={{ backgroundColor: COLORS.MEDIUM_GRAY, color: COLORS.LIGHT_GRAY }}
                        >
                          Request Sent
                        </span>
                      )}
                      {user.isFriend && (
                        <span 
                          className="px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm"
                          style={{ backgroundColor: COLORS.MEDIUM_GRAY, color: COLORS.BALANCED_GREEN }}
                        >
                          Already Friends
                        </span>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 sm:py-8 text-sm sm:text-base" style={{ color: COLORS.LIGHT_GRAY }}>
                    {searchTerm ? 'No users found' : 'Search for users to add as friends'}
                  </div>
                )}
              </div>
            </div>
            
            {/* Friend Requests */}
            <div className="rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 border" style={{ backgroundColor: COLORS.DARK_GRAY, borderColor: COLORS.MEDIUM_GRAY }}>
              <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4 flex items-center" style={{ color: COLORS.WHITE }}>
                <span>Friend Requests</span>
                {friendRequests.length > 0 && (
                  <span 
                    className="ml-2 px-2 py-1 text-xs sm:text-sm rounded-full"
                    style={{ backgroundColor: COLORS.MEDIUM_GRAY, color: COLORS.NEON_GREEN }}
                  >
                    {friendRequests.length}
                  </span>
                )}
                <InfoTooltip title="Pending friend requests will appear here." />
              </h2>
              
              <div className="space-y-3 sm:space-y-4 max-h-64 sm:max-h-96 overflow-y-auto">
                {!friendRequests || friendRequests.length === 0 ? (
                  <div className="text-center py-6 sm:py-8 text-sm sm:text-base" style={{ color: COLORS.LIGHT_GRAY }}>No pending friend requests</div>
                ) : (
                  friendRequests.map(request => (
                    <div 
                      key={request._id} 
                      className="p-3 sm:p-4 border rounded-lg transition"
                      style={{ 
                        borderColor: COLORS.MEDIUM_GRAY,
                        backgroundColor: COLORS.DARK_GRAY
                      }}
                    >
                      <h3 className="text-sm sm:text-base font-medium" style={{ color: COLORS.WHITE }}>{request.name}</h3>
                      <p className="text-xs sm:text-sm mb-2 sm:mb-3" style={{ color: COLORS.LIGHT_GRAY }}>{request.email}</p>
                      <div className="flex gap-2">
                        <button 
                          className="px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm transition font-medium"
                          style={{ backgroundColor: COLORS.MEDIUM_GRAY, color: COLORS.BALANCED_GREEN }}
                          onClick={() => acceptFriendRequest(request._id)}
                        >
                          Accept
                        </button>
                        <button 
                          className="px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm transition"
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
          
          {/* Friends List */}
          <div className="mt-4 sm:mt-6 md:mt-8 rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 border" style={{ backgroundColor: COLORS.DARK_GRAY, borderColor: COLORS.MEDIUM_GRAY }}>
            <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4 flex items-center" style={{ color: COLORS.WHITE }}>
              <span>My Friends</span>
              {friends.length > 0 && (
                <span 
                  className="ml-2 px-2 py-1 text-xs sm:text-sm rounded-full"
                  style={{ backgroundColor: COLORS.MEDIUM_GRAY, color: COLORS.NEON_GREEN }}
                >
                  {friends.length}
                </span>
              )}
              <InfoTooltip title="Your mutual friends will appear here. Click on their profile to view it." />
            </h2>
            
            {!friends || friends.length === 0 ? (
              <div className="text-center py-6 sm:py-8 text-sm sm:text-base" style={{ color: COLORS.LIGHT_GRAY }}>You don't have any friends yet</div>
            ) : (
              <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {friends.map(friend => (
                  <div 
                    key={friend._id} 
                    className="p-3 sm:p-4 border rounded-lg transition"
                    style={{ 
                      borderColor: COLORS.MEDIUM_GRAY,
                      backgroundColor: COLORS.DARK_GRAY
                    }}
                  >
                    <h3 className="text-sm sm:text-base font-medium" style={{ color: COLORS.WHITE }}>{friend.name}</h3>
                    <p className="text-xs sm:text-sm mb-2 sm:mb-3" style={{ color: COLORS.LIGHT_GRAY }}>{friend.email}</p>
                    <button 
                      className="px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm transition"
                      style={{ backgroundColor: COLORS.MEDIUM_GRAY, color: '#ff6b6b' }}
                      onClick={() => removeFriend(friend._id)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default SocialPage;
