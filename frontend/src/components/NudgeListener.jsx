import { useEffect, useState } from 'react';

const NudgeListener = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const eventSource = new EventSource('http://localhost:5000/api/friend/listenForNudges', { withCredentials: true });

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);

      setNotifications((prev) => [...prev, data]);

      // Auto-remove notification after 24 hrs
      setTimeout(() => {
        setNotifications((prev) => prev.slice(1));
      }, 86400000);
    };

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <div className="notification-container">
      {notifications.map((nudge, index) => (
        <div key={index} className="notification">
          <p style={{ color: '#ffffff' }}> 
            <strong>{nudge.fromName || "Someone"}</strong> nudged you!
          </p>
        </div>
      ))}
    </div>
  );
};

export default NudgeListener;