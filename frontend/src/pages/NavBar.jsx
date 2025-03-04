import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-gray-800 p-4">
      <ul className="flex space-x-4 text-white">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/profile">Profile</Link></li>
        <li><Link to="/social">Social/Friends</Link></li>
        <li><Link to="/nutrition">Nutrition/Meal Plan</Link></li>
        <li><Link to="/workout">Workout</Link></li>
      </ul>
    </nav>
  );
};

export default Navbar;
