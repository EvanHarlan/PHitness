const ProfilePage = () => {
    return (
      <div className="bg-gray-200 p-8">
        <h1 className="text-3xl">Profile Page</h1>
        <div className="flex items-center">
          <img src="profile_picture_url" alt="Profile" className="w-24 h-24 rounded-full mr-4" />
          <div>
            <h2 className="text-xl">Username: John Doe</h2>
            <p>Full Name: Johnathan Doe</p>
          </div>
        </div>
      </div>
    );
  };
  
  export default ProfilePage;
  