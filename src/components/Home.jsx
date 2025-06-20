// File: Home.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FaVideo,
  FaComments,
  FaShieldAlt,
  FaShareAlt,
  FaFacebook,
  FaTwitter,
  FaLinkedin,
  FaHome,
  FaInfoCircle,
  FaEnvelope,
  FaGithub
} from 'react-icons/fa';
import { FaUserPlus, FaSignInAlt } from 'react-icons/fa';


import './Home.css';

const features = [
  { icon: <FaVideo />, title: 'HD Video', description: 'Crystal-clear HD video for seamless communication.' },
  { icon: <FaComments />, title: 'Private Chat', description: 'Secure 1:1 and group messaging during calls.' },
  { icon: <FaShieldAlt />, title: 'Noise Cancellation', description: 'AI-powered noise suppression for clarity.' },
  { icon: <FaShareAlt />, title: 'Easy Sharing', description: 'One-click screen and file sharing support.' },
];

const Home = () => {
  return (
   
    <div className="home-container">

      
      <motion.header
  className="shared-header"
  initial={{ y: -50, opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
  transition={{ duration: 0.6 }}
>
  <div className="header-left">
    <div className="logo glow">
      <span className="logo-icon">🔵</span>
      <span className="logo-text">Meet<span>Pro</span></span>
    </div>
    <nav className="shared-nav">
      <Link to="/" className="nav-link" data-tooltip="Home">
        <FaHome />
        <span>Home</span>
      </Link>
      <Link to="/about" className="nav-link" data-tooltip="About Us">
        <FaInfoCircle />
        <span>About</span>
      </Link>
      <Link to="/contact" className="nav-link" data-tooltip="Contact">
        <FaEnvelope />
        <span>Contact</span>
      </Link>
      <Link to="/privacy" className="nav-link" data-tooltip="Privacy Policy">
        <FaShieldAlt />
        <span>Privacy</span>
      </Link>
    </nav>
  </div>

  <div className="auth-buttons">
  <Link to="/register" className="nav-btn tooltip" data-tooltip="Register a new account">
    <i><FaUserPlus className="auth-icon" /></i> Register
  </Link>
  <Link to="/login" className="nav-btn tooltip" data-tooltip="Login to your account">
    <i><FaSignInAlt className="auth-icon" /></i> Login
  </Link>
</div>

</motion.header>

      {/* Hero Section */}
      <header className="hero-section">
        <motion.h1
          className="hero-title"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          Seamless & Secure Video Conferencing
        </motion.h1>
        <motion.p
          className="hero-description"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 1 }}
        >
          Connect from anywhere with crystal-clear audio and total privacy.
        </motion.p>
        <motion.button
          className="get-started-btn"
          whileHover={{ scale: 1.05 }}
        >
          Get Started
        </motion.button>
        <div className="animated-bg"></div>
      </header>

      {/* Features Section */}
      <section className="features-section">
        <h2 className="features-title">Key Features</h2>
        <div className="features-grid">
          {features.map((f, i) => (
            <motion.div
              key={i}
              className="feature-card"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
            >
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-links">
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/privacy">Privacy Policy</Link>
        </div>
        <div className="footer-icons">
  <div className="footer-icons">
  <a href="mailto:kunalkadam2762001@gmail.com" target="_blank" rel="noopener noreferrer" title="Email">
    <FaEnvelope />
  </a>
  <a href="https://www.linkedin.com/in/kunaldkadam/" target="_blank" rel="noopener noreferrer" title="LinkedIn">
    <FaLinkedin />
  </a>
  <a href="https://github.com/kunalk276" target="_blank" rel="noopener noreferrer" title="GitHub">
    <FaGithub />
  </a>
</div>

</div>

        <p>© 2025 MeetPro — Built by <strong>Kunal Kadam</strong></p>
      </footer>
    </div>
  );
};

export default Home;
