import { useEffect, useState } from 'react';
import axios from 'axios';
//NUDGE COMPONENT THAT ALLOWS THE USER TO NUDGE OTHER USERS
const NudgeListener = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Fetch nudges 
    const fetchNudges = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/friend/nudges', { withCredentials: true });
        setNotifications(response.data.nudges);
      } catch (error) {
      }
    };

    fetchNudges();

    // Listen for nudges
    const eventSource = new EventSource('http://localhost:5000/api/friend/listenForNudges', { withCredentials: true });

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setNotifications((prev) => [...prev, data]);
    };

    eventSource.onerror = () => {
      eventSource.close();
    };


    return () => {
      eventSource.close();
    };
  }, []);

  const handleDelete = async (index, nudgeId) => {
    try {
      // Delete nudge from database 
      await axios.post('http://localhost:5000/api/friend/delete-nudge', { nudgeId }, { withCredentials: true });

      // Remove nudge from page
      setNotifications((prev) => prev.filter((_, i) => i !== index));
    } catch (error) {
    }
  };

  return (
    <div className="notification-container">
      {notifications.map((nudge, index) => (
        <div key={index} className="notification">
          <p style={{ color: '#ffffff' }}>
            <strong>{nudge.fromName || 'Someone'}</strong> nudged you!
          </p>
          <button onClick={() => handleDelete(index, nudge._id)} style={{backgroundColor: '#ff6b6b', color: 'white', padding: '5px 10px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >Delete</button>
        </div>
      ))}
    </div>
  );
};

export default NudgeListener;