// File: About.jsx
import React from 'react';
import { motion } from 'framer-motion';
import SharedLayout from './SharedLayout';
import './About.css';
import { FaFacebook, FaTwitter, FaLinkedin } from 'react-icons/fa';


import { FaLinkedin } from 'react-icons/fa';

const teamMembers = [
  {
    name: 'Kunal Kadam',
    role: 'Frontend & Backend Developer',
    img: 'https://media.licdn.com/dms/image/v2/D4D03AQETb0F4U8_wmQ/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1718685917105?e=1755734400&v=beta&t=4QsOjSTCuwC8119WuAr-PgJyIdmCI69G-cgKXd6i_5Q',
    socials: [
      <a
        href="https://www.linkedin.com/in/kunaldkadam/"
        target="_blank"
        rel="noopener noreferrer"
        title="LinkedIn"
      >
        <FaLinkedin className="social-icon" />
      </a>
    ]
  },
  {
    name: 'Yugank Kadam',
    role: 'UI/UX Designer',
    img: 'https://img.freepik.com/free-photo/3d-portrait-high-school-teenager_23-2150793939.jpg?ga=GA1.1.1336599627.1716147389&semt=ais_hybrid&w=740',
    socials: [
      <a
        href="https://www.linkedin.com/in/kunaldkadam/"
        target="_blank"
        rel="noopener noreferrer"
        title="LinkedIn"
      >
        <FaLinkedin className="social-icon" />
      </a>
    ]
  }
];

const About = () => {
  return (
    <SharedLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} className="about-container">

        <section className="hero-section">
          <motion.h2 className="section-title" initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 1 }}>About Us</motion.h2>
          <p className="section-subtitle">We’re on a mission to reshape global communication with cutting-edge, secure video conferencing technology.</p>
          <div className="hero-bg"></div>
        </section>

        <section className="about-grid">
          <motion.div className="glass-card" initial={{ x: -40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.8 }}>
            <h3>Our Mission</h3>
            <p>To enable seamless and inclusive communication worldwide with intuitive, reliable, and secure tools.</p>
          </motion.div>
          <motion.div className="glass-card" initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.8 }}>
            <h3>Our Vision</h3>
            <p>To become the most trusted global platform for virtual collaboration and communication.</p>
          </motion.div>
        </section>

        <section className="timeline-section">
          <motion.div className="glass-card timeline-card" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1 }}>
            <h3>Company Timeline</h3>
            <ul>
              <li><strong>2025</strong> MeetPro was founded with a vision for secure global communication.</li>
              <li><strong>2025:</strong> Surpassed 5+ active users with Social presence.</li>
              <li><strong>2025:</strong> Introduced AI and CHATBOT</li>
            </ul>
          </motion.div>
        </section>

        <section className="team-section">
          <h3 className="section-title">Meet the Team</h3>
          <div className="team-grid">
            {teamMembers.map((member, i) => (
              <motion.div
                key={i}
                className="team-card"
                initial={{ y: 30, opacity: 0 }}
                whileHover={{ scale: 1.05, boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.3 }}
              >
                <img src={member.img} alt={member.name} className="team-img" />
                <h4>{member.name}</h4>
                <p>{member.role}</p>
                <div className="social-icons">
                  {member.socials.map((s, j) => (
                    <span key={j} className={`social-icon tooltip`} data-tooltip={s}>{s}</span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <motion.div className="cta-section" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.8 }}>
          <button className="glow-button">Join the Revolution</button>
        </motion.div>
      </motion.div>
    </SharedLayout>
  );
};

export default About;