import React from 'react';
import { Link } from 'react-router-dom';
import './Home1.css'; 
import SharedLayout from './SharedLayout';
import { FaLinkedin,
  FaEnvelope,
  FaGithub } from 'react-icons/fa';
const Home = () => {
 return (
  <SharedLayout>
    <div className="home-container">
      
      <section className="hero-section advanced">
        <div className="dashboard-content">
          <div className="welcome-text">
            <h1 className="hero-title">👋 Welcome to MeetPro Dashboard</h1>
            <p className="hero-description">
              Launch into high-quality video calls instantly. No setup, just seamless collaboration.
            </p>
            <Link to="/video-call">
              <button className="cta-button video-call">🎥 Start Video Call</button>
            </Link>
          </div>

          <div className="dashboard-widgets">
            <div className="widget-card">
              <h3>📅 Upcoming Meetings</h3>
              <p>2 scheduled this week</p>
            </div>
            <div className="widget-card">
              <h3>👥 Last Call Participants</h3>
              <p>4 participants</p>
            </div>
            <div className="widget-card">
              <h3>🧠 Smart Suggestions</h3>
              <p>Use headphones to improve audio quality</p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Tips Section */}
      <section className="tips-section">
  <h2 className="tips-title">💡 Pro Tips for Better Meetings</h2>
  <ul className="tips-list">
    <li><span className="tip-icon">🎤</span> Mute yourself when not speaking.</li>
    <li><span className="tip-icon">🖥️</span> Share your screen for effective collaboration.</li>
    <li><span className="tip-icon">🕒</span> Keep meetings on time and focused.</li>
  </ul>
</section>


    </div>
    </SharedLayout>
  );
};


export default Home;
