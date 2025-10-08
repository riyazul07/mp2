import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navigation.css';

const Navigation: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="navigation">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          🍽️ MealDB Explorer
        </Link>
        
        <div className="nav-links">
          <Link 
            to="/" 
            className={location.pathname === '/' ? 'nav-link active' : 'nav-link'}
          >
            Search
          </Link>
          <Link 
            to="/gallery" 
            className={location.pathname === '/gallery' ? 'nav-link active' : 'nav-link'}
          >
            Gallery
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;