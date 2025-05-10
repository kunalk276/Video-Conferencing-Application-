import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css'; 

const Home = () => {
  return (
    <div className="home-container">
      <div className="hero-section">
        <h1 className="hero-title">Welcome to Video Conferencing App</h1>
        <p className="hero-description">
          Join meetings, collaborate seamlessly, and stay connected with your team
          from anywhere.
        </p>
        <div className="cta-buttons">
          <Link to="/register">
            <button className="cta-button cta-register">Register</button>
          </Link>
          <Link to="/login">
            <button className="cta-button cta-login">Login</button>
          </Link>
           {/* <Link to="/ChatBox">
            <button className="cta-button cta-start">Start Video Call</button>
          </Link> * */}
        </div>
      </div>

<div className="features-section">
  <h2 className="features-title">Key Features</h2>
  <div className="features-list">
    <div className="feature-item">
     <span className="blur-background"><strong>HD Video Calls</strong></span>
      <div className="feature-image image-1"></div>
    </div>
    <div className="feature-item">
      <h3 className="blur-background"><strong>Group Video Calls</strong></h3>
      <div className="feature-image image-2"></div>
    </div>
    <div className="feature-item">
      <h3 className="blur-background"><strong>Cross-Device Support</strong></h3>
      <div className="feature-image image-3"></div>
    </div>
  </div>
</div>





     <footer className="app-footer">
  <p>© 2025 Video Conferencing App | All Rights Reserved | Built by <strong>Kunal Kadam</strong></p>
</footer>
    </div>
  );
};

export default Home;
