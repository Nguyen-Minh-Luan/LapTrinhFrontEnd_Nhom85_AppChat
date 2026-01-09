import React, { useEffect, useState } from "react";
import "./Register.css";
import { Link, useNavigate } from "react-router-dom";
import { CURRENT_SOCKET } from "../../module/appsocket";
import {useAppDispatch,useAppSelector} from "../../hook/customHook"
import { register} from "../../redux/authSlice";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch()
  const state = useAppSelector((state)=>state.auth);
  console.log(state.error)
  const [isLoading, setIsLoading] = useState(false);
  const [changeInfo, setChangeInfo] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });
  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };




  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    const { username, email, password, confirmPassword } = formData;
    // setIsLoading(true)
    if (!CURRENT_SOCKET.isConnect()) {
      await CURRENT_SOCKET.connect();
    }
    await dispatch(register({user:username,pass:password}));
    // if(state.isRegister)setIsLoading(false)
    
  };



  useEffect(() => {
    CURRENT_SOCKET.onConnected = () => {
      console.log("Socket connected");
    };
    CURRENT_SOCKET.onError = (e) => {
      console.error("Socket error", e);
    };

    CURRENT_SOCKET.onClosed = () => {
      console.log("Socket closed");
    };
    return () => {
      CURRENT_SOCKET.onConnected = null;
      CURRENT_SOCKET.onMessageReceived = null;
      CURRENT_SOCKET.onError = null;
      CURRENT_SOCKET.onClosed = null;
    };
  }, []);
  useEffect(() => {
  console.log("isLoading changed:", state.isLoading);
}, [state.isLoading]);
  return (
    <div className="login-wrapper">
      <div className="login-container">
        <h1 className="main-title">Register for App Chat</h1>

        <form onSubmit={handleSubmit} className="login-form">
          {state.isLoading && (
            <div className="overlay">
              <div className="spinner"></div>
              <p color="red">Đang tạo tài khoản ...</p>
            </div>
          )}
          <div className="input-group">
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <span className="eye-icon" onClick={togglePassword}>
              👁
            </span>
          </div>

          <div className="input-group">
            <input
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
          {state.error && (
            <p className="changeInfo">
              Tài khoản đã tồn tại vui lòng đổi <br></br>USERNAME hoặc PASSWORD
            </p>
          )}
          <button type="submit" className="signin-btn">
            SIGN UP
          </button>

          <div className="form-options">
            <Link to={"/login"} className="forgot-password">
              Already have an account?
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
