import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import Home1 from './components/Home1';
import Register from './components/Register';
import Login from './components/Login';
import VideoCall from './components/VideoCall';
import ChatBox from './components/ChatBox';
import About from './components/About';
import Contact from './components/Contact';
import PrivacyPolicy from './components/PrivacyPolicy';
import './index.css';  
const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home1" element={<Home1 />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/video-call" element={<VideoCall />} />
        <Route path="/ChatBox" element={<ChatBox />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
      </Routes>
    </Router>
    
  );
};

export default App;
