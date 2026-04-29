import { Link, useLocation } from 'react-router-dom';
import AuthButton from './Auth-Button';
import './Navbar.css';

function Navbar({ user }) {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <div className="logo-icon">ITS</div>
          <span>Thespian Point Tracker</span>
        </Link>

        <ul className="nav-menu">
          <li className="nav-item">
            <Link 
              to="/" 
              className={`nav-link ${isActive('/') ? 'active' : ''}`}
            >
              HOMEPAGE
            </Link>
          </li>
          {user && (
            <>
              <li className="nav-item">
                <Link 
                  to="/students" 
                  className={`nav-link ${isActive('/students') ? 'active' : ''}`}
                >
                  STUDENT LIST
                </Link>
              </li>
              <li className="nav-item">
                <Link 
                  to="/add-points" 
                  className={`nav-link ${isActive('/add-points') ? 'active' : ''}`}
                >
                  ADD POINTS
                </Link>
              </li>
            </>
          )}
        </ul>

        <div className="navbar-auth">
          <AuthButton user={user} />
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
