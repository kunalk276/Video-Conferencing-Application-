import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const Login = ({ onLoginSuccess }) => {
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const username = e.target[0].value;
    const password = e.target[1].value;

    try {
      const response = await fetch("https://video-conferencing-application-gmsl.onrender.com/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error("Invalid credentials");
      }

      const data = await response.json();


      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.id);
       localStorage.setItem("username", data.username);
      setError("");
      setSuccessMessage("Login Successful!");


      navigate("/home1");


      onLoginSuccess?.();
    } catch (err) {
      setError(err.message);
      setSuccessMessage("");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1 className="login-title">Login</h1>
        <form className="login-form" onSubmit={handleLogin}>
          <input type="text" placeholder="Username" className="login-input" required />
          <input type="password" placeholder="Password" className="login-input" required />
          {error && <p className="error-message">{error}</p>}
          {successMessage && <p className="success-message">{successMessage}</p>}
          <button type="submit" className="login-button">Login</button>
        </form>
        <div className="register-redirect">
                <p>Don't have an account?</p>
                <Link to="/register" className="register-link">
                  <button className="register-button">Register</button>
                </Link>
              </div>
      </div>
    </div>
  );
};

export default Login;
