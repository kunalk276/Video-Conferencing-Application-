import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import './Register.css';
import { useNavigate, Link } from "react-router-dom";

const Register = () => {
  const schema = yup.object().shape({
    username: yup
      .string()
      .required("Username is required")
      .matches(
        /^[a-zA-Z0-9_]{3,20}$/,
        "Username must be 3–20 characters long and contain only letters, numbers, or underscores"
      ),
    email: yup
      .string()
      .required("Email is required")
      .email("Invalid email format"),
    password: yup
      .string()
      .required("Password is required")
      .matches(
        /^(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/,
        "Password must be at least 8 characters long, contain a letter, a number, and a special character"
      ),
    role: yup.string().required("Role is required"),
  });

  // const {
  //   register,
  //   handleSubmit,
  //   formState: { errors },
  //   reset,
  // } = useForm({
  //   resolver: yupResolver(schema),
  // });

const {
  register,
  handleSubmit,
  formState: { errors },
  reset,
} = useForm({
  resolver: yupResolver(schema),
  defaultValues: {
    role: "USER", 
  },
});

  
  const onSubmit = async (data) => {
  try {

     const userData = {
      ...data,
      role: "USER",
    };
    const response = await fetch("https://video-conferencing-application-gmsl.onrender.com/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to register user");
    }

    const result = await response.json();
    console.log("User registered:", result);
    alert("User registered successfully!");
    reset();
  } catch (error) {
    console.error("Registration error:", error);
    alert("Failed to register user");
  }
};

  return (
    <div className="register-container">
      <div className="register-form-container">
        <h2>Create Account</h2>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Username */}
          <div>
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              {...register("username")}
            />
            {errors.username && <p>{errors.username.message}</p>}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              {...register("email")}
            />
            {errors.email && <p>{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              {...register("password")}
            />
            {errors.password && <p>{errors.password.message}</p>}
          </div>


{/* <div>
  <label htmlFor="role">Role</label>
  <select id="role" {...register("role")}>
    <option value="">Select Role</option>
    <option value="USER">USER</option>
    <option value="ADMIN">ADMIN</option>
  </select>
  {errors.role && <p>{errors.role.message}</p>}
</div> */}




          {/* Submit */}
          <div>
            <button type="submit">Register</button>
          </div>
        </form>
        <div className="login-redirect">
          <p>Already have an account?</p>
          <Link to="/login" className="login-link">
            <button className="login-button">Login</button>
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Register;
