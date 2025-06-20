// File: SharedLayout.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaHome, FaInfoCircle, FaEnvelope, FaShieldAlt } from 'react-icons/fa';
import './SharedLayout.css';
import { FaFacebook, FaTwitter, FaLinkedin,FaGithub } from 'react-icons/fa';

const SharedLayout = ({ children }) => {
  return (
    <div className="shared-container">
      {/* Header */}
      <motion.header
        className="shared-header"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="logo">🔵 MeetPro</div>
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
      </motion.header>


      {/* Main content */}
      <main className="px-6 py-12">{children}</main>

      {/* Footer */}
      <footer className="footer">
              <div className="footer-links">
                <Link to="/about">About</Link>
                <Link to="/contact">Contact</Link>
                <Link to="/privacy">Privacy Policy</Link>
              </div>
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
              <p>© 2025 MeetPro — Built by <strong>Kunal Kadam</strong></p>
            </footer>
        
    </div>
  );
};

export default SharedLayout;
